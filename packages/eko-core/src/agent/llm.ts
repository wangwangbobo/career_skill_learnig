import config from "../config";
import Log from "../common/log";
import * as memory from "../memory";
import { RetryLanguageModel } from "../llm";
import { AgentContext } from "../core/context";
import { uuidv4, sleep } from "../common/utils";
import {
  LLMRequest,
  StreamCallbackMessage,
  StreamCallback,
  HumanCallback,
  StreamResult,
} from "../types";
import {
  LanguageModelV2FunctionTool,
  LanguageModelV2Prompt,
  LanguageModelV2StreamPart,
  LanguageModelV2TextPart,
  LanguageModelV2ToolCallPart,
  LanguageModelV2ToolChoice,
} from "@ai-sdk/provider";

export async function callAgentLLM(
  agentContext: AgentContext,
  rlm: RetryLanguageModel,
  messages: LanguageModelV2Prompt,
  tools: LanguageModelV2FunctionTool[],
  noCompress?: boolean,
  toolChoice?: LanguageModelV2ToolChoice,
  retryNum: number = 0,
  callback?: StreamCallback & HumanCallback,
  requestHandler?: (request: LLMRequest) => void
): Promise<Array<LanguageModelV2TextPart | LanguageModelV2ToolCallPart>> {
  await agentContext.context.checkAborted();
  if (messages.length >= config.compressThreshold && !noCompress) {
    await memory.compressAgentMessages(agentContext, rlm, messages, tools);
  }
  if (!toolChoice) {
    // Append user dialogue
    appendUserConversation(agentContext, messages);
  }
  let context = agentContext.context;
  let agentChain = agentContext.agentChain;
  let agentNode = agentChain.agent;
  let streamCallback = callback ||
    context.config.callback || {
      onMessage: async () => {},
    };
  const stepController = new AbortController();
  const signal = AbortSignal.any([
    context.controller.signal,
    stepController.signal,
  ]);
  let request: LLMRequest = {
    tools: tools,
    toolChoice,
    messages: messages,
    abortSignal: signal,
  };
  requestHandler && requestHandler(request);
  agentChain.agentRequest = request;
  let result: StreamResult;
  try {
    context.currentStepControllers.add(stepController);
    result = await rlm.callStream(request);
  } catch (e: any) {
    context.currentStepControllers.delete(stepController);
    await context.checkAborted();
    if (
      !noCompress &&
      messages.length >= 5 &&
      ((e + "").indexOf("tokens") > -1 || (e + "").indexOf("too long") > -1)
    ) {
      await memory.compressAgentMessages(agentContext, rlm, messages, tools);
    }
    if (retryNum < config.maxRetryNum) {
      await sleep(200 * (retryNum + 1) * (retryNum + 1));
      return callAgentLLM(
        agentContext,
        rlm,
        messages,
        tools,
        noCompress,
        toolChoice,
        ++retryNum,
        streamCallback
      );
    }
    throw e;
  }
  let streamText = "";
  let thinkText = "";
  let toolArgsText = "";
  const streamId = uuidv4();
  let textStreamDone = false;
  const toolParts: LanguageModelV2ToolCallPart[] = [];
  const reader = result.stream.getReader();
  try {
    let toolPart: LanguageModelV2ToolCallPart | null = null;
    while (true) {
      await context.checkAborted();
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      const chunk = value as LanguageModelV2StreamPart;
      switch (chunk.type) {
        case "text-delta": {
          if (toolPart && !chunk.delta) {
            continue;
          }
          streamText += chunk.delta || "";
          await streamCallback.onMessage(
            {
              taskId: context.taskId,
              agentName: agentNode.name,
              nodeId: agentNode.id,
              type: "text",
              streamId,
              streamDone: false,
              text: streamText,
            },
            agentContext
          );
          if (toolPart) {
            await streamCallback.onMessage(
              {
                taskId: context.taskId,
                agentName: agentNode.name,
                nodeId: agentNode.id,
                type: "tool_use",
                toolId: toolPart.toolCallId,
                toolName: toolPart.toolName,
                params: toolPart.input || {},
              },
              agentContext
            );
            toolPart = null;
          }
          break;
        }
        case "reasoning-delta": {
          thinkText += chunk.delta || "";
          await streamCallback.onMessage(
            {
              taskId: context.taskId,
              agentName: agentNode.name,
              nodeId: agentNode.id,
              type: "thinking",
              streamId,
              streamDone: false,
              text: thinkText,
            },
            agentContext
          );
          break;
        }
        case "tool-input-start": {
          if (toolPart && toolPart.toolCallId == chunk.id) {
            toolPart.toolName = chunk.toolName;
          } else {
            toolPart = {
              type: "tool-call",
              toolCallId: chunk.id,
              toolName: chunk.toolName,
              input: {},
            };
            toolParts.push(toolPart);
          }
          break;
        }
        case "tool-input-delta": {
          if (!textStreamDone) {
            textStreamDone = true;
            await streamCallback.onMessage(
              {
                taskId: context.taskId,
                agentName: agentNode.name,
                nodeId: agentNode.id,
                type: "text",
                streamId,
                streamDone: true,
                text: streamText,
              },
              agentContext
            );
          }
          toolArgsText += chunk.delta || "";
          await streamCallback.onMessage(
            {
              taskId: context.taskId,
              agentName: agentNode.name,
              nodeId: agentNode.id,
              type: "tool_streaming",
              toolId: chunk.id,
              toolName: toolPart?.toolName || "",
              paramsText: toolArgsText,
            },
            agentContext
          );
          break;
        }
        case "tool-call": {
          toolArgsText = "";
          const args = chunk.input ? JSON.parse(chunk.input) : {};
          const message: StreamCallbackMessage = {
            taskId: context.taskId,
            agentName: agentNode.name,
            nodeId: agentNode.id,
            type: "tool_use",
            toolId: chunk.toolCallId,
            toolName: chunk.toolName,
            params: args,
          };
          await streamCallback.onMessage(message, agentContext);
          if (toolPart == null) {
            toolParts.push({
              type: "tool-call",
              toolCallId: chunk.toolCallId,
              toolName: chunk.toolName,
              input: message.params || args,
            });
          } else {
            toolPart.input = message.params || args;
            toolPart = null;
          }
          break;
        }
        case "file": {
          await streamCallback.onMessage(
            {
              taskId: context.taskId,
              agentName: agentNode.name,
              nodeId: agentNode.id,
              type: "file",
              mimeType: chunk.mediaType,
              data: chunk.data as string,
            },
            agentContext
          );
          break;
        }
        case "error": {
          Log.error(`${agentNode.name} agent error: `, chunk);
          await streamCallback.onMessage(
            {
              taskId: context.taskId,
              agentName: agentNode.name,
              nodeId: agentNode.id,
              type: "error",
              error: chunk.error,
            },
            agentContext
          );
          throw new Error("LLM Error: " + chunk.error);
        }
        case "finish": {
          if (!textStreamDone) {
            textStreamDone = true;
            await streamCallback.onMessage(
              {
                taskId: context.taskId,
                agentName: agentNode.name,
                nodeId: agentNode.id,
                type: "text",
                streamId,
                streamDone: true,
                text: streamText,
              },
              agentContext
            );
          }
          if (toolPart) {
            await streamCallback.onMessage(
              {
                taskId: context.taskId,
                agentName: agentNode.name,
                nodeId: agentNode.id,
                type: "tool_use",
                toolId: toolPart.toolCallId,
                toolName: toolPart.toolName,
                params: toolPart.input || {},
              },
              agentContext
            );
            toolPart = null;
          }
          await streamCallback.onMessage(
            {
              taskId: context.taskId,
              agentName: agentNode.name,
              nodeId: agentNode.id,
              type: "finish",
              finishReason: chunk.finishReason,
              usage: {
                promptTokens: chunk.usage.inputTokens || 0,
                completionTokens: chunk.usage.outputTokens || 0,
                totalTokens:
                  chunk.usage.totalTokens ||
                  (chunk.usage.inputTokens || 0) +
                    (chunk.usage.outputTokens || 0),
              },
            },
            agentContext
          );
          if (
            chunk.finishReason === "length" &&
            messages.length >= 5 &&
            !noCompress &&
            retryNum < config.maxRetryNum
          ) {
            await memory.compressAgentMessages(
              agentContext,
              rlm,
              messages,
              tools
            );
            return callAgentLLM(
              agentContext,
              rlm,
              messages,
              tools,
              noCompress,
              toolChoice,
              ++retryNum,
              streamCallback
            );
          }
          break;
        }
      }
    }
  } catch (e: any) {
    await context.checkAborted();
    if (retryNum < config.maxRetryNum) {
      await sleep(200 * (retryNum + 1) * (retryNum + 1));
      return callAgentLLM(
        agentContext,
        rlm,
        messages,
        tools,
        noCompress,
        toolChoice,
        ++retryNum,
        streamCallback
      );
    }
    throw e;
  } finally {
    reader.releaseLock();
    context.currentStepControllers.delete(stepController);
  }
  agentChain.agentResult = streamText;
  return streamText
    ? [
        { type: "text", text: streamText } as LanguageModelV2TextPart,
        ...toolParts,
      ]
    : toolParts;
}

function appendUserConversation(
  agentContext: AgentContext,
  messages: LanguageModelV2Prompt
) {
  const userPrompts = agentContext.context.conversation
    .splice(0, agentContext.context.conversation.length)
    .filter((s) => !!s);
  if (userPrompts.length > 0) {
    const prompt =
      "The user is intervening in the current task, please replan and execute according to the following instructions:\n" +
      userPrompts.map((s) => `- ${s.trim()}`).join("\n");
    messages.push({
      role: "user",
      content: [{ type: "text", text: prompt }],
    });
  }
}
