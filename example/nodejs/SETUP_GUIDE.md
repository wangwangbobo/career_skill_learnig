# Eko Node.js 示例设置指南

## 🚀 快速开始

### 1. 环境准备
- ✅ Node.js v22.12.0 (已安装)
- ✅ pnpm v10.14.0 (已安装)
- ✅ 项目依赖已安装
- ✅ 项目已构建

### 2. 配置 API 密钥

编辑 `.env` 文件，添加您的 API 密钥：

```bash
# Anthropic Claude API
ANTHROPIC_API_KEY=你的_Claude_API_密钥
ANTHROPIC_BASE_URL=https://api.anthropic.com/v1

# OpenAI API  
OPENAI_API_KEY=你的_OpenAI_API_密钥
OPENAI_BASE_URL=https://api.openai.com/v1

# 阿里云百炼（DashScope）API
ALIBABA_DASHSCOPE_API_KEY=你的_百炼_API_密钥
ALIBABA_DASHSCOPE_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
```

### 3. 获取 API 密钥

#### Anthropic Claude
1. 访问 [https://console.anthropic.com/](https://console.anthropic.com/)
2. 注册/登录账号
3. 创建 API 密钥
4. 复制密钥到 `.env` 文件

#### OpenAI 
1. 访问 [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. 注册/登录账号
3. 创建 API 密钥
4. 复制密钥到 `.env` 文件

#### 阿里云百炼（DashScope）
1. 访问 [https://dashscope.console.aliyun.com/](https://dashscope.console.aliyun.com/)
2. 注册/登录阿里云账号
3. 开通百炼服务
4. 在"API-KEY管理"页面创建新的API密钥
5. 复制密钥到 `.env` 文件

**推荐模型：**
- `qwen-max`: 最强推理能力，适合复杂任务
- `qwen-turbo`: 快速响应，适合简单对话
- `qwen-plus`: 平衡性能和成本
- `qwen2.5-coder-7b-instruct`: 专业代码生成

### 4. 运行示例

```bash
# 构建示例项目
pnpm build

# 运行示例
pnpm start
```

## 📖 示例代码说明

### 主要文件
- `src/index.ts` - 主示例文件
- `src/chat.ts` - 自定义聊天 Agent
- `.env` - 环境变量配置

### 示例任务
默认示例会执行：
```javascript
await eko.run("Search for the latest news about Musk, summarize and save to the desktop as Musk.md");
```

### 自定义任务
您可以修改 `src/index.ts` 中的任务描述：
```javascript
// 修改这一行
let result = await eko.run("你的自定义任务描述");
```

## 🔧 可用的 Agent

### 内置 Agent
- **BrowserAgent**: 浏览器自动化，网页抓取
- **FileAgent**: 文件操作，读写删除
- **SimpleChatAgent**: 简单聊天助手（示例中的自定义 Agent）

### Agent 功能示例
```javascript
// 浏览器操作
"打开百度搜索马斯克的最新新闻"

// 文件操作  
"将内容保存到桌面的文件中"

// 组合操作
"搜索新闻，总结内容，然后保存到文件"
```

## ⚠️ 注意事项

1. **API 费用**: 使用 LLM API 会产生费用，请合理使用
2. **网络连接**: 需要稳定的网络连接访问 API
3. **浏览器依赖**: BrowserAgent 需要安装 Playwright 浏览器

### 安装 Playwright 浏览器
```bash
pnpm playwright
```

## 🎯 下一步探索

1. **修改任务描述**，尝试不同的自动化任务
2. **查看其他示例**：
   - `example/web` - 网页版本
   - `example/extension` - 浏览器扩展
3. **创建自定义 Agent**，参考 `src/chat.ts`
4. **阅读文档**：[https://eko.fellou.ai/docs](https://eko.fellou.ai/docs)

## 🐛 故障排除

### 构建失败
```bash
# 清理并重新安装
cd /Users/wangbo/open-source/eko
pnpm clean
pnpm install
pnpm build
```

### API 连接失败
- 检查 `.env` 文件中的 API 密钥格式
- 确认网络连接正常
- 验证 API 密钥有效性

### 浏览器启动失败
```bash
# 安装浏览器
pnpm playwright
```

---

🎉 配置完成后，您就可以体验 Eko 的强大功能了！