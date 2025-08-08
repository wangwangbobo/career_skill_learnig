/**
 * Eko + 阿里云百炼集成演示
 * 模拟使用Eko框架的核心功能与百炼API集成
 */

console.log('🚀 Eko + 阿里云百炼集成演示');
console.log('=====================================');

// 模拟 Eko 的核心功能
class MockEko {
  constructor(config) {
    this.llmConfig = config.llms.default;
    this.agents = config.agents || [];
    console.log('✅ Eko实例初始化完成');
    console.log(`📋 配置的LLM提供商: ${this.llmConfig.provider}`);
    console.log(`🤖 配置的模型: ${this.llmConfig.model}`);
  }

  async run(taskDescription) {
    console.log('\n🎯 开始执行任务:', taskDescription);
    console.log('⏱️  任务执行中...\n');

    try {
      // 模拟任务规划
      console.log('📝 [规划阶段] 分析任务需求...');
      
      // 调用百炼API
      const response = await this.callLLM(taskDescription);
      
      // 模拟任务执行
      console.log('🔧 [执行阶段] 处理任务...');
      
      return {
        success: true,
        result: response,
        executionTime: Date.now(),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async callLLM(prompt) {
    const apiKey = 'sk-b646fbdd790e46ff80bf5f3d6f67c46b';
    const baseURL = 'https://dashscope.aliyuncs.com/compatible-mode/v1';

    console.log('🧠 [LLM调用] 请求百炼API...');

    const response = await fetch(`${baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'X-DashScope-SSE': 'disable'
      },
      body: JSON.stringify({
        model: this.llmConfig.model,
        messages: [
          {
            role: 'system', 
            content: '你是一个智能助手，擅长分析和解决各种问题。请用简洁明了的方式回答用户的问题。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: this.llmConfig.maxTokens || 500,
        temperature: this.llmConfig.temperature || 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`API调用失败: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ [LLM调用] 百炼API响应成功');
    console.log(`📊 [LLM调用] 使用token: ${data.usage.total_tokens}`);
    
    return data.choices[0].message.content;
  }
}

// 模拟配置
const demoConfig = {
  llms: {
    default: {
      provider: 'alibaba-dashscope',
      model: 'qwen-turbo',
      apiKey: 'sk-b646fbdd790e46ff80bf5f3d6f67c46b',
      baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
      temperature: 0.7,
      maxTokens: 500,
    }
  },
  agents: []
};

// 演示任务列表
const demoTasks = [
  {
    name: '基础对话',
    description: '请介绍一下人工智能在教育领域的应用前景',
  },
  {
    name: '问题分析', 
    description: '分析一下远程办公对企业管理带来的挑战和机遇',
  },
  {
    name: '创意写作',
    description: '写一个关于未来智能城市的小故事，200字左右',
  }
];

async function runDemo() {
  try {
    // 初始化 Eko 实例
    const eko = new MockEko(demoConfig);
    
    console.log('\n🎭 开始演示任务执行...\n');

    // 执行演示任务
    for (let i = 0; i < demoTasks.length; i++) {
      const task = demoTasks[i];
      console.log(`\n📋 任务 ${i + 1}/${demoTasks.length}: ${task.name}`);
      console.log('═'.repeat(50));
      
      const startTime = Date.now();
      const result = await eko.run(task.description);
      const endTime = Date.now();
      
      if (result.success) {
        console.log('🎉 任务执行成功!');
        console.log('📝 执行结果:');
        console.log('─'.repeat(40));
        console.log(result.result);
        console.log('─'.repeat(40));
        console.log(`⏱️  执行时间: ${endTime - startTime}ms`);
      } else {
        console.log('❌ 任务执行失败:', result.error);
      }
      
      // 添加间隔
      if (i < demoTasks.length - 1) {
        console.log('\n⏳ 等待下一个任务...\n');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log('\n🎊 演示完成!');
    console.log('=====================================');
    console.log('🌟 集成特性展示:');
    console.log('✅ Eko框架与阿里云百炼无缝集成');
    console.log('✅ 支持多种任务类型执行');
    console.log('✅ 实时API调用和响应处理');
    console.log('✅ 完整的错误处理机制');
    console.log('✅ 任务执行状态跟踪');
    
    console.log('\n💡 您现在可以:');
    console.log('1. 修改任务描述测试不同场景');
    console.log('2. 调整模型参数优化响应效果'); 
    console.log('3. 集成更多Agent扩展功能');
    console.log('4. 部署到生产环境使用');

  } catch (error) {
    console.error('💥 演示程序出错:', error.message);
  }
}

// 启动演示
console.log('🚀 初始化演示环境...');
runDemo().catch(console.error);