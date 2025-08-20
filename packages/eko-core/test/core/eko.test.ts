import {
  Eko,
  Agent,
  Log,
  LLMs,
  StreamCallbackMessage,
} from "../../src/index";
import dotenv from "dotenv";
import { SimpleBrowserAgent, SimpleChatAgent, SimpleFileAgent } from "./agents";

dotenv.config();

const openaiBaseURL = process.env.OPENAI_BASE_URL;
const openaiApiKey = process.env.OPENAI_API_KEY;

const llms: LLMs = {
  default: {
    provider: "openai",
    model: "gpt-5-mini",
    apiKey: openaiApiKey || "",
    config: {
      baseURL: openaiBaseURL,
    },
  },
};

async function run() {
  Log.setLevel(0);
  const callback = {
    onMessage: async (message: StreamCallbackMessage) => {
      if (message.type == "workflow" && !message.streamDone) {
        return;
      }
      if (message.type == "text" && !message.streamDone) {
        return;
      }
      if (message.type == "tool_streaming") {
        return;
      }
      console.log("message: ", JSON.stringify(message, null, 2));
    },
  };
  const agents: Agent[] = [
    new SimpleChatAgent(),
    new SimpleBrowserAgent(),
    new SimpleFileAgent(),
  ];
  const eko = new Eko({ llms, agents, callback });
  // let result = await eko.run("Who are you?");
  const result = await eko.run("How is the weather in Beijing?");
  console.log("result: ", result.result);
}

test.only("eko", async () => {
  await run();
});
