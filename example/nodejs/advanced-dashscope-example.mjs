/**
 * 高级 Eko + 阿里云百炼集成示例
 * 展示流式处理、多Agent协作、复杂任务分解等高级功能
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

console.log('🚀 高级 Eko + 阿里云百炼集成示例');
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

// 模拟不同类型的Agent
class DataAnalysisAgent {
  constructor() {
    this.Name = 'DataAnalysisAgent';
    this.Description = '数据分析专家Agent';
    this.Tools = [
      {
        name: 'analyze_trend',
        description: '分析数据趋势',
        execute: async (data) => `数据趋势分析完成：${data.type} 呈现${data.trend}趋势`
      },
      {
        name: 'generate_chart',
        description: '生成图表',
        execute: async (data) => `已生成 ${data.chartType} 图表，包含 ${data.dataPoints} 个数据点`
      }
    ];
  }
}

class ContentCreatorAgent {
  constructor() {
    this.Name = 'ContentCreatorAgent';
    this.Description = '内容创作专家Agent';
    this.Tools = [
      {
        name: 'write_article',
        description: '撰写文章',
        execute: async (params) => `已完成${params.type}文章创作，字数约${params.wordCount}字`
      },
      {
        name: 'optimize_seo',
        description: 'SEO优化',
        execute: async (content) => 'SEO优化完成，添加了关键词和元标签'
      }
    ];
  }
}

class ResearchAgent {
  constructor() {
    this.Name = 'ResearchAgent';
    this.Description = '研究调研专家Agent';
    this.Tools = [
      {
        name: 'gather_information',
        description: '收集信息',
        execute: async (topic) => `已收集关于"${topic}"的最新信息和研究资料`
      },
      {
        name: 'cite_sources',
        description: '引用来源',
        execute: async (sources) => `已整理并验证${sources.length}个信息来源`
      }
    ];
  }
}

// 高级Eko框架实现
class AdvancedEko {
  constructor(config) {
    this.llmConfig = config.llms.default;
    this.agents = config.agents || [];
    this.callback = config.callback;
    this.enableStreaming = config.enableStreaming || false;
    this.taskHistory = [];
    
    console.log('✅ 高级Eko实例创建成功');
    console.log(`📋 LLM配置: ${this.llmConfig.provider} / ${this.llmConfig.model}`);
    console.log(`🤖 注册Agent: ${this.agents.map(a => a.Name).join(', ')}`);
    console.log(`🌊 流式处理: ${this.enableStreaming ? '启用' : '禁用'}`);
  }

  async run(taskPrompt, options = {}) {
    const taskId = this.generateTaskId();
    console.log(`\n🎯 [${taskId}] 任务开始: ${taskPrompt}`);
    console.log('═'.repeat(60));

    const startTime = Date.now();

    try {
      // 1. 智能任务分解
      const subtasks = await this.decomposeTask(taskPrompt);
      
      // 2. Agent分配和协作
      const agentPlan = await this.assignAgents(subtasks);
      
      // 3. 执行复杂工作流
      const results = await this.executeWorkflow(agentPlan, taskId);
      
      // 4. 结果整合和优化
      const finalResult = await this.synthesizeResults(results, taskPrompt);
      
      const endTime = Date.now();
      const executionTime = endTime - startTime;

      const taskResult = {
        taskId,
        success: true,
        result: finalResult,
        subtasks: subtasks.length,
        agentsUsed: agentPlan.length,
        executionTime,
        timestamp: new Date().toISOString()
      };

      this.taskHistory.push(taskResult);

      console.log('\n🎉 任务执行成功!');
      console.log(`📊 执行统计: ${subtasks.length}个子任务，${agentPlan.length}个Agent协作`);
      console.log(`⏱️  总耗时: ${executionTime}ms`);
      
      return taskResult;

    } catch (error) {
      console.error(`❌ [${taskId}] 任务执行失败:`, error.message);
      return {
        taskId,
        success: false,
        error: error.message,
        executionTime: Date.now() - startTime
      };
    }
  }

  async decomposeTask(taskPrompt) {
    console.log('📝 [分解阶段] 智能任务分解...');
    
    const decompositionPrompt = `
作为一个任务规划专家，请将以下任务分解为3-5个具体的子任务：

任务：${taskPrompt}

请以简洁的要点形式列出子任务，每个子任务一行。
`;

    const response = await this.callLLM(decompositionPrompt, {
      temperature: 0.3,
      maxTokens: 300
    });

    // 模拟从LLM响应中提取子任务
    const subtasks = response
      .split('\n')
      .filter(line => line.trim() && (line.includes('.') || line.includes('-')))
      .slice(0, 5)
      .map(task => task.replace(/^\d+[.-]\s*/, '').trim());

    console.log('✅ [分解阶段] 任务分解完成:');
    subtasks.forEach((task, index) => {
      console.log(`   ${index + 1}. ${task}`);
    });

    return subtasks;
  }

  async assignAgents(subtasks) {
    console.log('\n🎭 [分配阶段] Agent智能分配...');
    
    const agentPlan = [];
    
    for (let i = 0; i < subtasks.length; i++) {
      const subtask = subtasks[i];
      let assignedAgent = null;

      // 智能Agent选择逻辑
      if (subtask.toLowerCase().includes('分析') || subtask.toLowerCase().includes('数据')) {
        assignedAgent = this.agents.find(a => a.Name === 'DataAnalysisAgent');
      } else if (subtask.toLowerCase().includes('写') || subtask.toLowerCase().includes('创作')) {
        assignedAgent = this.agents.find(a => a.Name === 'ContentCreatorAgent');
      } else if (subtask.toLowerCase().includes('研究') || subtask.toLowerCase().includes('调查')) {
        assignedAgent = this.agents.find(a => a.Name === 'ResearchAgent');
      }

      if (!assignedAgent) {
        assignedAgent = this.agents[0]; // 默认选择第一个Agent
      }

      agentPlan.push({
        subtask,
        agent: assignedAgent,
        priority: i + 1
      });

      console.log(`   📌 子任务${i + 1}: ${subtask.substring(0, 30)}... → ${assignedAgent.Name}`);
    }

    console.log('✅ [分配阶段] Agent分配完成');
    return agentPlan;
  }

  async executeWorkflow(agentPlan, taskId) {
    console.log('\n🔧 [执行阶段] 多Agent协作执行...');
    
    const results = [];
    
    for (let i = 0; i < agentPlan.length; i++) {
      const { subtask, agent, priority } = agentPlan[i];
      
      console.log(`\n🤖 [Agent${priority}] ${agent.Name} 执行任务...`);
      console.log(`   📋 任务内容: ${subtask}`);

      try {
        // 模拟Agent工具调用
        if (agent.Tools && agent.Tools.length > 0) {
          const tool = agent.Tools[0]; // 使用第一个工具
          console.log(`   🛠️  调用工具: ${tool.name}`);
          
          const toolResult = await tool.execute({
            task: subtask,
            type: '综合分析',
            chartType: '柱状图',
            dataPoints: Math.floor(Math.random() * 50) + 10,
            wordCount: Math.floor(Math.random() * 500) + 200,
            trend: '上升',
            length: 3
          });
          
          console.log(`   ✅ 工具执行完成: ${toolResult}`);
        }

        // 调用LLM处理子任务
        const llmPrompt = `请作为${agent.Description}，完成以下具体任务：${subtask}`;
        const llmResult = await this.callLLM(llmPrompt, {
          temperature: 0.7,
          maxTokens: 400
        });

        results.push({
          subtask,
          agent: agent.Name,
          result: llmResult,
          timestamp: new Date().toISOString()
        });

        console.log(`   ✅ Agent执行完成`);
        
        // 添加执行间隔
        await this.sleep(500);
        
      } catch (error) {
        console.error(`   ❌ Agent执行失败: ${error.message}`);
        results.push({
          subtask,
          agent: agent.Name,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }

    console.log('✅ [执行阶段] 多Agent协作完成');
    return results;
  }

  async synthesizeResults(results, originalTask) {
    console.log('\n🔄 [整合阶段] 结果综合处理...');
    
    const synthesisPrompt = `
作为一个项目总结专家，请将以下多个子任务的执行结果整合成一个完整、连贯的最终答案：

原始任务：${originalTask}

各部分结果：
${results.map((r, i) => `${i + 1}. ${r.subtask}\n   执行结果：${r.result || r.error}`).join('\n\n')}

请提供一个综合性的最终结果：
`;

    const finalResult = await this.callLLM(synthesisPrompt, {
      temperature: 0.6,
      maxTokens: 600
    });

    console.log('✅ [整合阶段] 结果整合完成');
    return finalResult;
  }

  async callLLM(prompt, options = {}) {
    const config = {
      temperature: options.temperature || this.llmConfig.config.temperature,
      maxTokens: options.maxTokens || this.llmConfig.config.maxTokens,
    };

    try {
      const response = await fetch(`${this.llmConfig.config.baseURL}/chat/completions`, {
        method: 'POST',
        headers: this.llmConfig.config.headers,
        body: JSON.stringify({
          model: this.llmConfig.model,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: config.maxTokens,
          temperature: config.temperature,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // 显示token使用情况
      if (data.usage) {
        console.log(`   📊 Token使用: ${data.usage.total_tokens} (输入:${data.usage.prompt_tokens}, 输出:${data.usage.completion_tokens})`);
      }
      
      return data.choices[0].message.content;

    } catch (error) {
      console.error('   ❌ LLM调用失败:', error.message);
      throw error;
    }
  }

  generateTaskId() {
    return 'TASK_' + Date.now().toString(36).toUpperCase();
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getTaskHistory() {
    return this.taskHistory;
  }
}

// 运行高级示例
async function runAdvancedExample() {
  console.log('🔧 初始化高级配置...\n');

  // 配置多个专业Agent
  const agents = [
    new DataAnalysisAgent(),
    new ContentCreatorAgent(), 
    new ResearchAgent()
  ];

  // LLM配置
  const llmConfig = {
    provider: 'alibaba-dashscope',
    model: 'qwen-plus', // 使用plus模型获得更好的推理能力
    apiKey: API_KEY,
    config: {
      baseURL: BASE_URL,
      temperature: 0.7,
      maxTokens: 500,
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'X-DashScope-SSE': 'disable',
        'Content-Type': 'application/json',
      },
    },
  };

  // 创建高级Eko实例
  const eko = new AdvancedEko({
    llms: { default: llmConfig },
    agents: agents,
    enableStreaming: false,
    callback: {
      onMessage: async (msg) => {
        console.log('📨 收到回调:', msg.type);
      }
    }
  });

  console.log('\n🚀 开始高级示例演示...\n');

  // 复杂任务示例集合
  const complexTasks = [
    {
      name: '市场调研项目',
      description: '对电动汽车市场进行全面调研，包括市场规模分析、竞争对手研究、消费者行为分析，并撰写详细的市场调研报告'
    },
    {
      name: '产品发布策略',
      description: '为新款智能手机制定完整的产品发布策略，包括目标用户分析、营销渠道规划、定价策略和推广方案设计'
    },
    {
      name: '企业数字化转型',
      description: '帮助传统制造企业制定数字化转型方案，分析现状、识别痛点、规划技术架构，并制定实施路线图'
    }
  ];

  // 执行复杂任务演示
  for (let i = 0; i < complexTasks.length; i++) {
    const task = complexTasks[i];
    
    console.log(`\n📋 演示任务 ${i + 1}/${complexTasks.length}: ${task.name}`);
    console.log('🔸'.repeat(80));
    
    const result = await eko.run(task.description);
    
    if (result.success) {
      console.log(`\n✅ ${task.name} 执行成功!`);
      console.log('📝 最终结果:');
      console.log('─'.repeat(60));
      console.log(result.result);
      console.log('─'.repeat(60));
      console.log(`📈 任务统计: ${result.subtasks}个子任务, ${result.agentsUsed}个Agent, 耗时${result.executionTime}ms`);
    } else {
      console.log(`❌ ${task.name} 执行失败: ${result.error}`);
    }
    
    // 任务间休息
    if (i < complexTasks.length - 1) {
      console.log('\n⏳ 准备下一个任务...\n');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // 展示任务历史
  console.log('\n📚 任务执行历史:');
  console.log('═'.repeat(80));
  const history = eko.getTaskHistory();
  history.forEach((task, index) => {
    console.log(`${index + 1}. [${task.taskId}] ${task.success ? '✅' : '❌'} ${task.executionTime}ms`);
  });

  console.log('\n🎊 高级示例演示完成!');
  console.log('═'.repeat(80));
  console.log('🌟 高级功能展示总结:');
  console.log('✅ 智能任务分解和规划');
  console.log('✅ 多Agent协作和任务分配');
  console.log('✅ 复杂工作流执行管理');
  console.log('✅ 结果智能整合和优化');
  console.log('✅ 详细的执行监控和统计');
  console.log('✅ 任务历史记录和追踪');

  console.log('\n💡 技术优势:');
  console.log('🚀 阿里云百炼强大的中文理解能力');
  console.log('🤖 多Agent协作提升任务处理效率');
  console.log('🧠 智能任务分解减少人工规划成本');
  console.log('📊 全程监控确保任务执行透明度');
  console.log('🔄 结果整合提供完整解决方案');
}

// 启动高级示例
console.log('🚀 启动高级Eko集成示例...');
runAdvancedExample().catch(error => {
  console.error('💥 高级示例异常:', error);
});