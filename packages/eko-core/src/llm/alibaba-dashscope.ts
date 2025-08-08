/**
 * 阿里云百炼（DashScope）LLM 集成
 * 
 * 阿里云百炼提供了与 OpenAI API 兼容的接口，支持多种大语言模型
 * 包括通义千问系列、开源模型等
 */

import { LLMConfig } from "../types/llm.types";

/**
 * 阿里云百炼支持的模型列表
 */
export const DASHSCOPE_MODELS = {
  // 通义千问系列
  QWEN_TURBO: "qwen-turbo",
  QWEN_PLUS: "qwen-plus", 
  QWEN_MAX: "qwen-max",
  QWEN_MAX_1201: "qwen-max-1201",
  QWEN_MAX_LONGCONTEXT: "qwen-max-longcontext",
  
  // 通义千问开源系列
  QWEN2_72B_INSTRUCT: "qwen2-72b-instruct",
  QWEN2_57B_A14B_INSTRUCT: "qwen2-57b-a14b-instruct", 
  QWEN2_7B_INSTRUCT: "qwen2-7b-instruct",
  QWEN2_1_5B_INSTRUCT: "qwen2-1.5b-instruct",
  QWEN2_0_5B_INSTRUCT: "qwen2-0.5b-instruct",
  
  // 代码生成模型
  QWEN2_5_CODER_32B_INSTRUCT: "qwen2.5-coder-32b-instruct",
  QWEN2_5_CODER_14B_INSTRUCT: "qwen2.5-coder-14b-instruct",
  QWEN2_5_CODER_7B_INSTRUCT: "qwen2.5-coder-7b-instruct",
  
  // 数学推理模型
  QWEN2_5_MATH_72B_INSTRUCT: "qwen2.5-math-72b-instruct",
  QWEN2_5_MATH_7B_INSTRUCT: "qwen2.5-math-7b-instruct",
  
  // Llama系列
  LLAMA3_1_405B_INSTRUCT: "llama3.1-405b-instruct",
  LLAMA3_1_70B_INSTRUCT: "llama3.1-70b-instruct", 
  LLAMA3_1_8B_INSTRUCT: "llama3.1-8b-instruct",
} as const;

/**
 * 创建阿里云百炼LLM配置
 * 
 * @param config 配置参数
 * @param config.apiKey 阿里云DashScope API Key
 * @param config.model 模型名称，支持通义千问、Llama等多种模型
 * @param config.baseURL 可选的自定义API端点，默认使用阿里云官方端点
 * @param config.temperature 温度参数，控制输出随机性 (0-1)
 * @param config.topP Top-P 采样参数 (0-1)
 * @param config.maxTokens 最大输出token数
 * @param config.stopSequences 停止序列
 * @param config.headers 额外的HTTP请求头
 * @returns LLM配置对象
 */
export function createAlibabaDashScopeConfig(config: {
  apiKey: string;
  model: string;
  baseURL?: string;
  temperature?: number;
  topP?: number; 
  maxTokens?: number;
  stopSequences?: string[];
  headers?: Record<string, string>;
}): LLMConfig {
  return {
    provider: "alibaba-dashscope",
    model: config.model,
    apiKey: config.apiKey,
    config: {
      baseURL: config.baseURL || "https://dashscope.aliyuncs.com/compatible-mode/v1",
      temperature: config.temperature ?? 0.7,
      topP: config.topP ?? 0.8,
      maxTokens: config.maxTokens ?? 2000,
      headers: {
        "Authorization": `Bearer ${config.apiKey}`,
        "X-DashScope-SSE": "enable",
        "Content-Type": "application/json",
        ...config.headers,
      },
    },
    options: {
      stop: config.stopSequences,
    },
  };
}

/**
 * 预设配置：通义千问-Max（推荐用于复杂任务）
 */
export function createQwenMaxConfig(apiKey: string, options?: {
  temperature?: number;
  maxTokens?: number;
}): LLMConfig {
  return createAlibabaDashScopeConfig({
    apiKey,
    model: DASHSCOPE_MODELS.QWEN_MAX,
    temperature: options?.temperature ?? 0.7,
    maxTokens: options?.maxTokens ?? 4000,
  });
}

/**
 * 预设配置：通义千问-Turbo（推荐用于快速响应）
 */
export function createQwenTurboConfig(apiKey: string, options?: {
  temperature?: number;
  maxTokens?: number;
}): LLMConfig {
  return createAlibabaDashScopeConfig({
    apiKey,
    model: DASHSCOPE_MODELS.QWEN_TURBO,
    temperature: options?.temperature ?? 0.7,
    maxTokens: options?.maxTokens ?? 2000,
  });
}

/**
 * 预设配置：通义千问-Plus（平衡性能和成本）
 */
export function createQwenPlusConfig(apiKey: string, options?: {
  temperature?: number;
  maxTokens?: number;
}): LLMConfig {
  return createAlibabaDashScopeConfig({
    apiKey,
    model: DASHSCOPE_MODELS.QWEN_PLUS,
    temperature: options?.temperature ?? 0.7,
    maxTokens: options?.maxTokens ?? 3000,
  });
}

/**
 * 预设配置：代码生成专用模型
 */
export function createQwenCoderConfig(apiKey: string, options?: {
  model?: "32b" | "14b" | "7b";
  temperature?: number;
  maxTokens?: number;
}): LLMConfig {
  const modelMap = {
    "32b": DASHSCOPE_MODELS.QWEN2_5_CODER_32B_INSTRUCT,
    "14b": DASHSCOPE_MODELS.QWEN2_5_CODER_14B_INSTRUCT,
    "7b": DASHSCOPE_MODELS.QWEN2_5_CODER_7B_INSTRUCT,
  };
  
  return createAlibabaDashScopeConfig({
    apiKey,
    model: modelMap[options?.model || "7b"],
    temperature: options?.temperature ?? 0.3, // 代码生成通常使用较低温度
    maxTokens: options?.maxTokens ?? 4000,
  });
}

/**
 * 使用示例和最佳实践
 */
export const USAGE_EXAMPLES = {
  // 基础使用示例
  basic: `
import { Eko } from "@eko-ai/eko";
import { createQwenMaxConfig } from "@eko-ai/eko/llm/alibaba-dashscope";

const llms = {
  default: createQwenMaxConfig("your-dashscope-api-key"),
};

const eko = new Eko({ llms, agents: [] });
const result = await eko.run("帮我分析一下这个数据");
  `,
  
  // 多模型配置示例
  multiModel: `
import { DASHSCOPE_MODELS, createAlibabaDashScopeConfig } from "@eko-ai/eko/llm/alibaba-dashscope";

const llms = {
  default: createAlibabaDashScopeConfig({
    apiKey: "your-api-key",
    model: DASHSCOPE_MODELS.QWEN_MAX,
  }),
  turbo: createAlibabaDashScopeConfig({
    apiKey: "your-api-key", 
    model: DASHSCOPE_MODELS.QWEN_TURBO,
    temperature: 0.5,
  }),
  coder: createAlibabaDashScopeConfig({
    apiKey: "your-api-key",
    model: DASHSCOPE_MODELS.QWEN2_5_CODER_7B_INSTRUCT,
    temperature: 0.2,
  }),
};
  `,
  
  // 环境变量配置示例
  envConfig: `
// .env 文件
ALIBABA_DASHSCOPE_API_KEY=your_api_key_here
ALIBABA_DASHSCOPE_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1

// TypeScript 代码
const llms = {
  default: createAlibabaDashScopeConfig({
    apiKey: process.env.ALIBABA_DASHSCOPE_API_KEY!,
    model: DASHSCOPE_MODELS.QWEN_MAX,
    baseURL: process.env.ALIBABA_DASHSCOPE_BASE_URL,
  }),
};
  `,
};

/**
 * API密钥获取指南
 */
export const API_KEY_GUIDE = `
获取阿里云百炼API密钥步骤：

1. 访问阿里云百炼控制台：https://dashscope.console.aliyun.com/
2. 注册/登录阿里云账号
3. 开通百炼服务
4. 在"API-KEY管理"页面创建新的API密钥
5. 复制API密钥用于配置

注意事项：
- API密钥具有访问权限，请妥善保管
- 建议将API密钥存储在环境变量中，不要硬编码在代码中
- 不同模型可能有不同的调用费用，请查看官方定价
- 部分模型可能需要额外申请权限
`;