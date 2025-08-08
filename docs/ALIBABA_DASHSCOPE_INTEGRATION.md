# 阿里云百炼（DashScope）集成指南

## 🎯 概述

Eko 框架现已支持阿里云百炼（DashScope）大语言模型，包括通义千问系列、代码生成模型等多种选择。本指南将帮助您快速上手使用。

## 🚀 快速开始

### 1. 安装依赖

Eko 框架的阿里云百炼支持已内置，无需额外安装依赖。

### 2. 获取 API 密钥

1. 访问 [阿里云百炼控制台](https://dashscope.console.aliyun.com/)
2. 注册/登录阿里云账号
3. 开通百炼服务
4. 在"API-KEY管理"页面创建新的API密钥
5. 复制API密钥用于配置

### 3. 基础配置

```typescript
import { 
  Eko, 
  createAlibabaDashScopeConfig,
  DASHSCOPE_MODELS 
} from "@eko-ai/eko";

const llms = {
  default: createAlibabaDashScopeConfig({
    apiKey: "your-dashscope-api-key",
    model: DASHSCOPE_MODELS.QWEN_MAX,
  }),
};

const eko = new Eko({ llms, agents: [] });
const result = await eko.run("你好，请介绍一下自己");
```

## 🤖 支持的模型

### 通义千问系列

| 模型 | 常量 | 描述 | 推荐场景 |
|------|------|------|----------|
| qwen-turbo | `DASHSCOPE_MODELS.QWEN_TURBO` | 快速响应 | 简单对话、快速问答 |
| qwen-plus | `DASHSCOPE_MODELS.QWEN_PLUS` | 平衡性能 | 日常任务、内容创作 |
| qwen-max | `DASHSCOPE_MODELS.QWEN_MAX` | 最强推理 | 复杂推理、专业分析 |
| qwen-max-longcontext | `DASHSCOPE_MODELS.QWEN_MAX_LONGCONTEXT` | 长文本处理 | 长文档分析 |

### 代码生成系列

| 模型 | 常量 | 描述 |
|------|------|------|
| qwen2.5-coder-32b-instruct | `DASHSCOPE_MODELS.QWEN2_5_CODER_32B_INSTRUCT` | 大型代码模型 |
| qwen2.5-coder-7b-instruct | `DASHSCOPE_MODELS.QWEN2_5_CODER_7B_INSTRUCT` | 轻量代码模型 |

### 数学推理系列

| 模型 | 常量 | 描述 |
|------|------|------|
| qwen2.5-math-72b-instruct | `DASHSCOPE_MODELS.QWEN2_5_MATH_72B_INSTRUCT` | 数学推理专用 |

## 🔧 配置选项

### 基础配置

```typescript
import { createAlibabaDashScopeConfig } from "@eko-ai/eko";

const config = createAlibabaDashScopeConfig({
  apiKey: "your-api-key",
  model: "qwen-max",
  baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1", // 可选
  temperature: 0.7,        // 控制输出随机性 (0-1)
  topP: 0.8,              // Top-P 采样参数 (0-1)
  maxTokens: 2000,        // 最大输出token数
  stopSequences: ["<|endoftext|>"], // 停止序列
  headers: {              // 额外HTTP头
    "X-DashScope-Plugin": "web_search"
  }
});
```

### 预设配置函数

```typescript
import { 
  createQwenMaxConfig,
  createQwenTurboConfig,
  createQwenPlusConfig,
  createQwenCoderConfig 
} from "@eko-ai/eko";

// 通义千问-Max（推荐用于复杂任务）
const maxConfig = createQwenMaxConfig("your-api-key", {
  temperature: 0.7,
  maxTokens: 4000,
});

// 通义千问-Turbo（推荐用于快速响应）
const turboConfig = createQwenTurboConfig("your-api-key", {
  temperature: 0.5,
  maxTokens: 2000,
});

// 代码生成专用模型
const coderConfig = createQwenCoderConfig("your-api-key", {
  model: "7b",           // "32b" | "14b" | "7b"
  temperature: 0.3,      // 代码生成通常使用较低温度
  maxTokens: 4000,
});
```

## 💡 使用示例

### 单模型配置

```typescript
import { Eko, createQwenMaxConfig } from "@eko-ai/eko";
import { BrowserAgent, FileAgent } from "@eko-ai/eko-nodejs";

const llms = {
  default: createQwenMaxConfig(process.env.ALIBABA_DASHSCOPE_API_KEY!),
};

const agents = [new BrowserAgent(), new FileAgent()];
const eko = new Eko({ llms, agents });

// 执行复杂任务
const result = await eko.run("搜索最新的AI发展趋势，总结关键信息并保存到文件");
```

### 多模型配置

```typescript
import { 
  Eko, 
  DASHSCOPE_MODELS,
  createAlibabaDashScopeConfig,
  createQwenTurboConfig,
  createQwenCoderConfig
} from "@eko-ai/eko";

const apiKey = process.env.ALIBABA_DASHSCOPE_API_KEY!;

const llms = {
  // 默认使用最强模型
  default: createAlibabaDashScopeConfig({
    apiKey,
    model: DASHSCOPE_MODELS.QWEN_MAX,
    temperature: 0.7,
  }),
  
  // 快速响应模型
  turbo: createQwenTurboConfig(apiKey, {
    temperature: 0.5,
  }),
  
  // 代码生成专用
  coder: createQwenCoderConfig(apiKey, {
    model: "7b",
    temperature: 0.3,
  }),
};

const eko = new Eko({ 
  llms, 
  agents: [],
  // 可以指定使用特定模型
  defaultLLM: "turbo"  // 使用快速响应模型
});
```

### 流式处理

```typescript
import { Eko, StreamCallbackMessage } from "@eko-ai/eko";

const callback = {
  onMessage: async (message: StreamCallbackMessage) => {
    if (message.type === "text" && message.streamDone) {
      console.log("完整响应:", message.content);
    }
    if (message.type === "text" && !message.streamDone) {
      process.stdout.write(message.content); // 实时显示流式内容
    }
  },
};

const eko = new Eko({ 
  llms: { default: createQwenMaxConfig("your-api-key") },
  agents: [],
  callback 
});

await eko.run("写一篇关于人工智能的文章");
```

## 🌟 最佳实践

### 1. 环境变量配置

```bash
# .env 文件
ALIBABA_DASHSCOPE_API_KEY=your_api_key_here
ALIBABA_DASHSCOPE_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
```

```typescript
// 使用环境变量
const llms = {
  default: createQwenMaxConfig(process.env.ALIBABA_DASHSCOPE_API_KEY!),
};
```

### 2. 模型选择建议

- **qwen-turbo**: 适合简单对话、快速问答
- **qwen-plus**: 适合日常任务、内容创作
- **qwen-max**: 适合复杂推理、专业分析
- **qwen2.5-coder-7b-instruct**: 适合代码生成和编程任务

### 3. 参数调优

```typescript
// 创造性任务（如写作、创意）
const creativeConfig = createAlibabaDashScopeConfig({
  apiKey: "your-key",
  model: DASHSCOPE_MODELS.QWEN_MAX,
  temperature: 0.9,  // 高温度增加创造性
  topP: 0.9,
});

// 分析性任务（如数据分析、逻辑推理）
const analyticalConfig = createAlibabaDashScopeConfig({
  apiKey: "your-key", 
  model: DASHSCOPE_MODELS.QWEN_MAX,
  temperature: 0.3,  // 低温度增加准确性
  topP: 0.7,
});

// 代码生成任务
const codingConfig = createQwenCoderConfig("your-key", {
  temperature: 0.2,  // 非常低的温度确保代码准确性
});
```

### 4. 错误处理

```typescript
const llms = {
  default: createQwenMaxConfig("your-key"),
  fallback: createQwenTurboConfig("your-key"), // 备用模型
};

try {
  const result = await eko.run("复杂任务");
  console.log(result.result);
} catch (error) {
  console.error("任务执行失败:", error.message);
  // 可以尝试使用备用模型
}
```

## 🎮 运行示例

### 1. 基础示例

```bash
# 在项目根目录
cd example/nodejs

# 配置环境变量
echo "ALIBABA_DASHSCOPE_API_KEY=your_key_here" >> .env

# 运行测试
node test-dashscope.mjs
```

### 2. 完整示例

```bash
# 运行阿里云百炼示例
node alibaba-dashscope-example.ts

# 或运行特定任务
node alibaba-dashscope-example.ts textAnalysis
node alibaba-dashscope-example.ts codeGeneration
node alibaba-dashscope-example.ts complexReasoning
```

## ⚠️ 注意事项

1. **API费用**: 使用百炼API会产生费用，请合理使用
2. **速率限制**: 注意API调用频率限制
3. **模型权限**: 部分模型可能需要额外申请权限
4. **网络连接**: 确保网络能够访问阿里云服务

## 🔗 相关链接

- [阿里云百炼官网](https://dashscope.aliyuncs.com/)
- [API文档](https://help.aliyun.com/zh/dashscope/)
- [模型介绍](https://help.aliyun.com/zh/dashscope/developer-reference/model-introduction)
- [定价信息](https://help.aliyun.com/zh/dashscope/product-overview/billing-methods)

## 📞 技术支持

如遇到问题，请：

1. 检查API密钥是否正确配置
2. 确认网络连接正常
3. 查看阿里云控制台的使用情况
4. 参考[故障排除指南](./SETUP_GUIDE.md#故障排除)

---

🎉 现在您已经可以在 Eko 框架中使用阿里云百炼的强大功能了！