/**
 * 流式处理 Eko + 阿里云百炼示例
 * 展示实时流式响应、交互式对话和动态内容生成
 */

// 加载环境变量
import { readFileSync, existsSync } from 'fs';

try {
  if (existsSync('.env')) {
    const envContent = readFileSync('.env', 'utf8');
    envContent.split('\n').forEach(line => {
      if (line.trim() && !line.startsWith('#') && line.includes('=')) {
        const [key, value] = line.split('=', 2);
        if (key && value) {
          process.env[key.trim()] = value.trim();
        }
      }
    });
  }
} catch (error) {
  console.warn('Warning: Could not read .env file:', error.message);
}

console.log('🌊 流式处理 Eko + 阿里云百炼示例');
console.log('=====================================');

// 配置信息 - 从环境变量读取
const API_KEY = process.env.ALIBABA_DASHSCOPE_API_KEY;
const BASE_URL = process.env.ALIBABA_DASHSCOPE_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1';

// 检查API密钥
if (!API_KEY || API_KEY === 'your_dashscope_api_key_here') {
  console.error('❌ 错误: 未找到有效的 ALIBABA_DASHSCOPE_API_KEY 环境变量');
  console.log('请在 .env 文件中设置您的API密钥:');
  console.log('ALIBABA_DASHSCOPE_API_KEY=your_actual_api_key_here');
  process.exit(1);
}

// 流式响应处理器
class StreamProcessor {
  constructor() {
    this.chunks = [];
    this.currentContent = '';
  }

  async processStream(response) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.trim() === '') continue;
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              console.log('\n✅ 流式响应完成');
              return this.currentContent;
            }
            
            try {
              const parsed = JSON.parse(data);
              if (parsed.choices && parsed.choices[0].delta.content) {
                const content = parsed.choices[0].delta.content;
                this.currentContent += content;
                // 实时显示流式内容
                process.stdout.write(content);
              }
            } catch (e) {
              // 忽略解析错误
            }
          }
        }
      }
    } catch (error) {
      console.error('🔴 流式处理错误:', error.message);
    } finally {
      reader.releaseLock();
    }

    return this.currentContent;
  }
}

// 交互式Agent
class InteractiveAgent {
  constructor() {
    this.Name = 'InteractiveAgent';
    this.Description = '交互式智能助手';
    this.conversationHistory = [];
  }

  async chat(userInput, streaming = true) {
    console.log(`\n👤 用户输入: ${userInput}`);
    console.log('🤖 AI回复: ');
    console.log('─'.repeat(50));

    this.conversationHistory.push({
      role: 'user',
      content: userInput,
      timestamp: new Date().toISOString()
    });

    try {
      const messages = [
        {
          role: 'system',
          content: '你是一个友好、专业的AI助手，能够进行自然、流畅的对话。请根据用户的问题给出准确、有帮助的回答。'
        },
        ...this.conversationHistory.slice(-5) // 保持最近5轮对话上下文
      ];

      if (streaming) {
        return await this.streamingRequest(messages);
      } else {
        return await this.normalRequest(messages);
      }
    } catch (error) {
      console.error('🔴 对话请求失败:', error.message);
      return null;
    }
  }

  async streamingRequest(messages) {
    const response = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'qwen-turbo',
        messages: messages,
        max_tokens: 500,
        temperature: 0.8,
        stream: true // 启用流式响应
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const processor = new StreamProcessor();
    const fullResponse = await processor.processStream(response);

    this.conversationHistory.push({
      role: 'assistant',
      content: fullResponse,
      timestamp: new Date().toISOString()
    });

    return fullResponse;
  }

  async normalRequest(messages) {
    const response = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'qwen-turbo',
        messages: messages,
        max_tokens: 500,
        temperature: 0.8,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    console.log(content);

    this.conversationHistory.push({
      role: 'assistant',
      content: content,
      timestamp: new Date().toISOString()
    });

    return content;
  }

  getConversationHistory() {
    return this.conversationHistory;
  }

  clearHistory() {
    this.conversationHistory = [];
    console.log('🔄 对话历史已清空');
  }
}

// 实时内容生成器
class ContentGenerator {
  constructor() {
    this.templates = {
      story: '请创作一个关于{topic}的短故事，要有趣味性和想象力',
      plan: '请制定一个关于{topic}的详细计划，包含具体步骤和时间安排',
      analysis: '请深入分析{topic}，提供多角度的见解和建议',
      tutorial: '请编写一个{topic}的教程，适合初学者理解和学习'
    };
  }

  async generateContent(type, topic, streaming = true) {
    const template = this.templates[type];
    if (!template) {
      throw new Error(`不支持的内容类型: ${type}`);
    }

    const prompt = template.replace('{topic}', topic);
    
    console.log(`\n📝 内容生成类型: ${type}`);
    console.log(`🎯 生成主题: ${topic}`);
    console.log(`🌊 流式模式: ${streaming ? '开启' : '关闭'}`);
    console.log('─'.repeat(50));

    if (streaming) {
      console.log('🤖 实时生成中...\n');
      return await this.streamingGenerate(prompt);
    } else {
      console.log('🤖 生成中...\n');
      return await this.normalGenerate(prompt);
    }
  }

  async streamingGenerate(prompt) {
    const response = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'qwen-plus', // 使用plus模型获得更好的创作能力
        messages: [
          { role: 'user', content: prompt }
        ],
        max_tokens: 800,
        temperature: 0.9, // 提高创造性
        stream: true
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const processor = new StreamProcessor();
    return await processor.processStream(response);
  }

  async normalGenerate(prompt) {
    const response = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'qwen-plus',
        messages: [
          { role: 'user', content: prompt }
        ],
        max_tokens: 800,
        temperature: 0.9,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    console.log(content);
    return content;
  }
}

// 主演示程序
async function runStreamingDemo() {
  console.log('🚀 启动流式处理演示...\n');

  // 创建交互式Agent
  const interactiveAgent = new InteractiveAgent();
  const contentGenerator = new ContentGenerator();

  console.log('═'.repeat(80));
  console.log('🎭 第一部分：交互式对话演示');
  console.log('═'.repeat(80));

  // 对话示例
  const conversations = [
    '你好，请介绍一下你的能力',
    '能帮我分析一下人工智能的发展趋势吗？',
    '基于刚才的分析，你认为哪个领域最有前景？',
    '谢谢你的分析，最后请给我一些学习AI的建议'
  ];

  for (let i = 0; i < conversations.length; i++) {
    const userInput = conversations[i];
    const startTime = Date.now();
    
    await interactiveAgent.chat(userInput, true); // 流式对话
    
    const endTime = Date.now();
    console.log(`\n⏱️  响应时间: ${endTime - startTime}ms`);
    
    if (i < conversations.length - 1) {
      console.log('\n⏳ 等待下一轮对话...\n');
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
  }

  // 显示对话历史
  console.log('\n📚 对话历史回顾:');
  console.log('─'.repeat(60));
  const history = interactiveAgent.getConversationHistory();
  history.forEach((msg, index) => {
    const role = msg.role === 'user' ? '👤 用户' : '🤖 助手';
    const preview = msg.content.substring(0, 50) + (msg.content.length > 50 ? '...' : '');
    console.log(`${Math.floor(index/2) + 1}. ${role}: ${preview}`);
  });

  // 等待下一个演示
  console.log('\n⏳ 准备内容生成演示...\n');
  await new Promise(resolve => setTimeout(resolve, 2000));

  console.log('═'.repeat(80));
  console.log('🎨 第二部分：实时内容生成演示');
  console.log('═'.repeat(80));

  // 内容生成示例
  const contentExamples = [
    { type: 'story', topic: '未来城市中的AI机器人' },
    { type: 'plan', topic: '个人技能提升' },
    { type: 'analysis', topic: '远程办公的影响' }
  ];

  for (let i = 0; i < contentExamples.length; i++) {
    const { type, topic } = contentExamples[i];
    const startTime = Date.now();
    
    console.log(`\n🎬 演示 ${i + 1}/${contentExamples.length}:`);
    await contentGenerator.generateContent(type, topic, true);
    
    const endTime = Date.now();
    console.log(`\n⏱️  生成时间: ${endTime - startTime}ms`);
    
    if (i < contentExamples.length - 1) {
      console.log('\n⏳ 准备下一个生成任务...\n');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // 对比演示：流式 vs 非流式
  console.log('\n═'.repeat(80));
  console.log('⚡ 第三部分：流式 vs 非流式对比演示');
  console.log('═'.repeat(80));

  const comparePrompt = '请写一首关于春天的诗，要体现生机勃勃的美好景象';

  console.log('\n🐌 非流式模式演示:');
  console.log('─'.repeat(40));
  const normalStart = Date.now();
  await contentGenerator.normalGenerate(comparePrompt);
  const normalEnd = Date.now();
  console.log(`\n⏱️  非流式耗时: ${normalEnd - normalStart}ms`);

  await new Promise(resolve => setTimeout(resolve, 1000));

  console.log('\n🚀 流式模式演示:');
  console.log('─'.repeat(40));
  const streamStart = Date.now();
  await contentGenerator.streamingGenerate(comparePrompt);
  const streamEnd = Date.now();
  console.log(`\n⏱️  流式处理耗时: ${streamEnd - streamStart}ms`);

  // 演示总结
  console.log('\n🎊 流式处理演示完成!');
  console.log('═'.repeat(80));
  console.log('🌟 演示亮点总结:');
  console.log('✅ 实时流式对话体验');
  console.log('✅ 上下文记忆和多轮对话');
  console.log('✅ 多类型内容实时生成');
  console.log('✅ 流式vs非流式性能对比');
  console.log('✅ 完整的对话历史管理');

  console.log('\n💡 技术优势展示:');
  console.log('🌊 流式响应提供更好的用户体验');
  console.log('🧠 上下文记忆支持连续对话');
  console.log('🎨 高创造性温度参数适合内容生成');
  console.log('📊 实时监控响应时间和性能');
  console.log('🔄 支持多种交互模式切换');

  console.log('\n📈 性能对比:');
  console.log('• 流式响应：用户感知延迟更低');
  console.log('• 非流式响应：完整结果一次性返回');
  console.log('• 推荐场景：交互式应用使用流式，批处理使用非流式');
}

// 启动流式处理演示
console.log('🚀 准备启动流式处理演示...');
runStreamingDemo().catch(error => {
  console.error('💥 流式演示异常:', error);
});