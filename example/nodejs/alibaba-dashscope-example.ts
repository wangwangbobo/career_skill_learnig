/**
 * 阿里云百炼（DashScope）与 Eko 框架集成示例
 * 
 * 本示例展示如何在 Eko 框架中使用阿里云百炼的大语言模型
 * 支持通义千问系列、代码生成模型等多种选择
 */

import dotenv from "dotenv";
import { 
  Eko, 
  Agent, 
  LLMs,
  StreamCallbackMessage,
  DASHSCOPE_MODELS,
  createAlibabaDashScopeConfig,
  createQwenMaxConfig,
  createQwenTurboConfig,
  createQwenCoderConfig,
} from "@eko-ai/eko";
import { BrowserAgent, FileAgent } from "@eko-ai/eko-nodejs";

// 加载环境变量
dotenv.config();

/**
 * 创建自定义的中文助手Agent
 */
class ChineseAssistantAgent extends Agent {
  constructor() {
    super({
      name: "ChineseAssistant",
      description: "专门处理中文任务的智能助手，擅长中文理解和生成",
      tools: [
        {
          name: "chinese_text_analysis",
          description: "分析中文文本的情感、关键词、摘要等",
          parameters: {
            type: "object",
            properties: {
              text: {
                type: "string",
                description: "要分析的中文文本",
              },
              analysis_type: {
                type: "string",
                enum: ["sentiment", "keywords", "summary", "all"],
                description: "分析类型：情感、关键词、摘要或全部",
                default: "all"
              },
            },
            required: ["text"],
          },
          execute: async (args: Record<string, unknown>) => {
            return await this.callInnerTool(() => {
              const text = args.text as string;
              const type = args.analysis_type as string || "all";
              
              // 这里可以调用具体的中文文本分析逻辑
              return `对文本"${text.substring(0, 50)}..."进行${type}分析完成。`;
            });
          },
        },
        {
          name: "chinese_translation",
          description: "中英文互译",
          parameters: {
            type: "object",
            properties: {
              text: {
                type: "string",
                description: "要翻译的文本",
              },
              target_language: {
                type: "string",
                enum: ["zh", "en"],
                description: "目标语言：zh(中文)或en(英文)",
              },
            },
            required: ["text", "target_language"],
          },
          execute: async (args: Record<string, unknown>) => {
            return await this.callInnerTool(() => {
              const text = args.text as string;
              const target = args.target_language as string;
              return `翻译任务：将"${text}"翻译为${target === 'zh' ? '中文' : '英文'}`;
            });
          },
        },
      ],
      planDescription: "中文助手Agent，专门处理中文相关的任务，包括文本分析、翻译等。适合处理需要深度中文理解的复杂任务。",
    });
  }
}

/**
 * 配置阿里云百炼LLM
 */
function createDashScopeLLMs(): LLMs {
  const apiKey = process.env.ALIBABA_DASHSCOPE_API_KEY;
  
  if (!apiKey) {
    console.error("❌ 请在 .env 文件中设置 ALIBABA_DASHSCOPE_API_KEY");
    process.exit(1);
  }

  return {
    // 默认使用通义千问-Max，适合复杂推理任务
    default: createQwenMaxConfig(apiKey, {
      temperature: 0.7,
      maxTokens: 4000,
    }),
    
    // 快速响应模型，适合简单对话
    turbo: createQwenTurboConfig(apiKey, {
      temperature: 0.5,
      maxTokens: 2000,
    }),
    
    // 代码生成专用模型
    coder: createQwenCoderConfig(apiKey, {
      model: "7b",
      temperature: 0.3,
      maxTokens: 4000,
    }),
    
    // 自定义配置示例
    custom: createAlibabaDashScopeConfig({
      apiKey: apiKey,
      model: DASHSCOPE_MODELS.QWEN_PLUS,
      temperature: 0.8,
      maxTokens: 3000,
      headers: {
        "X-DashScope-Plugin": "web_search", // 启用网络搜索插件
      },
    }),
  };
}

/**
 * 流式回调处理
 */
const streamCallback = {
  onMessage: async (message: StreamCallbackMessage) => {
    // 过滤掉不需要显示的消息
    if (message.type === "workflow" && !message.streamDone) return;
    if (message.type === "text" && !message.streamDone) return;
    if (message.type === "tool_streaming") return;
    
    console.log("🤖 消息更新:", JSON.stringify(message, null, 2));
  },
};

/**
 * 示例任务集合
 */
const EXAMPLE_TASKS = {
  // 基础文本处理任务
  textAnalysis: "分析这段文本的情感倾向和关键信息：'今天天气很好，心情也特别棒，准备去公园散步'",
  
  // 内容创作任务  
  contentCreation: "写一篇关于人工智能在教育领域应用的500字文章，要求观点明确，逻辑清晰",
  
  // 代码相关任务
  codeGeneration: "用Python编写一个计算斐波那契数列的函数，要求包含错误处理和性能优化",
  
  // 复杂推理任务
  complexReasoning: "请分析电商平台如何通过数据分析提升用户体验，给出具体的实施方案",
  
  // 翻译任务
  translation: "将以下英文翻译为自然流畅的中文：'The future of artificial intelligence lies in its ability to understand and respond to human needs with empathy and precision.'",
  
  // 综合任务（结合多个Agent）
  complexTask: "搜索最新的人工智能发展趋势，总结关键信息，然后保存到桌面文件中",
};

/**
 * 运行示例
 */
async function runDashScopeExample() {
  try {
    console.log("🚀 阿里云百炼 + Eko 框架示例启动");
    console.log("=====================================\n");
    
    // 创建LLM配置
    const llms = createDashScopeLLMs();
    console.log("✅ 百炼LLM配置创建完成");
    console.log("📋 可用模型:", Object.keys(llms).join(", "));
    
    // 创建Agent列表
    const agents: Agent[] = [
      new ChineseAssistantAgent(),
      new BrowserAgent(),
      new FileAgent(),
    ];
    console.log("🤖 Agent列表:", agents.map(a => a.Name).join(", "));
    
    // 初始化Eko实例
    const eko = new Eko({ 
      llms, 
      agents, 
      callback: streamCallback 
    });
    console.log("🎯 Eko实例初始化完成\n");
    
    // 选择要运行的任务
    const taskName = process.argv[2] || "textAnalysis";
    const task = EXAMPLE_TASKS[taskName as keyof typeof EXAMPLE_TASKS];
    
    if (!task) {
      console.log("❌ 未找到任务:", taskName);
      console.log("📋 可用任务:", Object.keys(EXAMPLE_TASKS).join(", "));
      console.log("💡 使用方法: npm run example:dashscope [taskName]");
      return;
    }
    
    console.log("🎯 执行任务:", taskName);
    console.log("📝 任务内容:", task);
    console.log("⏱️  开始执行...\n");
    
    // 执行任务
    const startTime = Date.now();
    const result = await eko.run(task);
    const endTime = Date.now();
    
    // 输出结果
    console.log("\n=====================================");
    console.log("✅ 任务执行完成");
    console.log("⏱️  执行时间:", (endTime - startTime) / 1000, "秒");
    console.log("🎯 执行结果:");
    console.log("─".repeat(50));
    console.log(result.result);
    console.log("─".repeat(50));
    
    if (result.success) {
      console.log("🎉 任务成功完成！");
    } else {
      console.log("❌ 任务执行失败:", result.stopReason);
      if (result.error) {
        console.error("错误详情:", result.error);
      }
    }
    
  } catch (error) {
    console.error("💥 程序执行出错:", error);
    process.exit(1);
  }
}

/**
 * 显示使用帮助
 */
function showHelp() {
  console.log(`
🚀 阿里云百炼 + Eko 示例程序

📋 可用任务:
${Object.entries(EXAMPLE_TASKS).map(([key, desc]) => 
  `  ${key.padEnd(20)} - ${desc.substring(0, 50)}...`
).join('\n')}

💡 使用方法:
  npm run example:dashscope [taskName]
  
🔧 环境配置:
  请确保 .env 文件中设置了 ALIBABA_DASHSCOPE_API_KEY
  
📖 更多信息:
  访问 https://dashscope.console.aliyun.com/ 获取API密钥
`);
}

// 主程序入口
if (require.main === module) {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    showHelp();
  } else {
    runDashScopeExample();
  }
}

export { runDashScopeExample, EXAMPLE_TASKS };