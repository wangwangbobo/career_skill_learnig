/**
 * 自定义数学计算Agent示例
 * 演示如何创建自定义Agent并集成到Eko框架中
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

console.log('🧮 自定义数学Agent演示');
console.log('=====================================');

// API配置 - 从环境变量读取
const API_KEY = process.env.ALIBABA_DASHSCOPE_API_KEY;
const BASE_URL = process.env.ALIBABA_DASHSCOPE_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1';

if (!API_KEY || API_KEY === 'your_dashscope_api_key_here') {
  console.error('❌ 错误: 未找到有效的 ALIBABA_DASHSCOPE_API_KEY 环境变量');
  console.log('请在 .env 文件中设置您的API密钥');
  process.exit(1);
}

// 自定义数学Agent类
class MathAgent {
  constructor() {
    this.Name = 'MathAgent';
    this.Description = '专业的数学计算助手，能够执行各种数学运算和解决数学问题';
    this.Tools = [
      {
        name: 'basic_calculation',
        description: '执行基础数学计算（加减乘除）',
        parameters: {
          type: 'object',
          properties: {
            expression: {
              type: 'string',
              description: '数学表达式，如 "2 + 3 * 4"'
            }
          },
          required: ['expression']
        },
        execute: async (args) => {
          try {
            // 安全的数学表达式计算
            const result = this.safeEval(args.expression);
            return `计算结果: ${args.expression} = ${result}`;
          } catch (error) {
            return `计算错误: ${error.message}`;
          }
        }
      },
      {
        name: 'geometry_calculation',
        description: '几何图形计算（面积、周长、体积等）',
        parameters: {
          type: 'object',
          properties: {
            shape: {
              type: 'string',
              enum: ['circle', 'rectangle', 'triangle', 'sphere'],
              description: '几何图形类型'
            },
            dimensions: {
              type: 'object',
              description: '图形尺寸参数',
              properties: {
                radius: { type: 'number', description: '半径（圆形、球体）' },
                width: { type: 'number', description: '宽度（矩形）' },
                height: { type: 'number', description: '高度（矩形、三角形）' },
                base: { type: 'number', description: '底边（三角形）' }
              }
            },
            calculation: {
              type: 'string',
              enum: ['area', 'perimeter', 'volume'],
              description: '计算类型'
            }
          },
          required: ['shape', 'dimensions', 'calculation']
        },
        execute: async (args) => {
          return this.calculateGeometry(args.shape, args.dimensions, args.calculation);
        }
      },
      {
        name: 'statistical_analysis',
        description: '统计数据分析（平均值、中位数、标准差等）',
        parameters: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: { type: 'number' },
              description: '数据数组'
            },
            analysis_type: {
              type: 'string',
              enum: ['mean', 'median', 'mode', 'std_dev', 'variance', 'all'],
              description: '分析类型'
            }
          },
          required: ['data', 'analysis_type']
        },
        execute: async (args) => {
          return this.performStatisticalAnalysis(args.data, args.analysis_type);
        }
      }
    ];
  }

  // 安全的数学表达式计算
  safeEval(expression) {
    // 只允许安全的数学操作
    const allowedChars = /^[0-9+\-*/().√π\s]+$/;
    if (!allowedChars.test(expression)) {
      throw new Error('不支持的字符，只允许数字和基本数学运算符');
    }

    // 替换数学常数
    const sanitized = expression
      .replace(/π/g, Math.PI.toString())
      .replace(/√(\d+\.?\d*)/g, 'Math.sqrt($1)');

    try {
      return Function('"use strict"; return (' + sanitized + ')')();
    } catch (error) {
      throw new Error('无效的数学表达式');
    }
  }

  // 几何计算
  calculateGeometry(shape, dimensions, calculation) {
    let result;
    
    try {
      switch (shape) {
        case 'circle':
          if (calculation === 'area') {
            result = Math.PI * Math.pow(dimensions.radius, 2);
            return `圆形面积: π × ${dimensions.radius}² = ${result.toFixed(2)}`;
          } else if (calculation === 'perimeter') {
            result = 2 * Math.PI * dimensions.radius;
            return `圆形周长: 2π × ${dimensions.radius} = ${result.toFixed(2)}`;
          }
          break;

        case 'rectangle':
          if (calculation === 'area') {
            result = dimensions.width * dimensions.height;
            return `矩形面积: ${dimensions.width} × ${dimensions.height} = ${result}`;
          } else if (calculation === 'perimeter') {
            result = 2 * (dimensions.width + dimensions.height);
            return `矩形周长: 2 × (${dimensions.width} + ${dimensions.height}) = ${result}`;
          }
          break;

        case 'triangle':
          if (calculation === 'area') {
            result = 0.5 * dimensions.base * dimensions.height;
            return `三角形面积: 0.5 × ${dimensions.base} × ${dimensions.height} = ${result}`;
          }
          break;

        case 'sphere':
          if (calculation === 'volume') {
            result = (4/3) * Math.PI * Math.pow(dimensions.radius, 3);
            return `球体体积: (4/3)π × ${dimensions.radius}³ = ${result.toFixed(2)}`;
          } else if (calculation === 'area') {
            result = 4 * Math.PI * Math.pow(dimensions.radius, 2);
            return `球面面积: 4π × ${dimensions.radius}² = ${result.toFixed(2)}`;
          }
          break;
      }
      
      return `不支持的计算类型: ${shape} 的 ${calculation}`;
    } catch (error) {
      return `几何计算错误: ${error.message}`;
    }
  }

  // 统计分析
  performStatisticalAnalysis(data, analysisType) {
    if (!Array.isArray(data) || data.length === 0) {
      return '错误: 数据数组为空或无效';
    }

    const results = {};
    
    // 平均值
    const mean = data.reduce((sum, num) => sum + num, 0) / data.length;
    
    // 中位数
    const sorted = [...data].sort((a, b) => a - b);
    const median = sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)];
    
    // 众数
    const frequency = {};
    data.forEach(num => frequency[num] = (frequency[num] || 0) + 1);
    const maxFreq = Math.max(...Object.values(frequency));
    const mode = Object.keys(frequency).filter(key => frequency[key] === maxFreq).map(Number);
    
    // 方差和标准差
    const variance = data.reduce((sum, num) => sum + Math.pow(num - mean, 2), 0) / data.length;
    const stdDev = Math.sqrt(variance);

    const allResults = {
      mean: mean.toFixed(2),
      median: median.toFixed(2),
      mode: mode.length === data.length ? '无众数' : mode.join(', '),
      variance: variance.toFixed(2),
      std_dev: stdDev.toFixed(2)
    };

    if (analysisType === 'all') {
      return `统计分析结果:
• 平均值: ${allResults.mean}
• 中位数: ${allResults.median}
• 众数: ${allResults.mode}
• 方差: ${allResults.variance}
• 标准差: ${allResults.std_dev}
• 数据点数: ${data.length}`;
    } else {
      return `${analysisType}: ${allResults[analysisType]}`;
    }
  }
}

// 模拟Eko类 - 简化版本用于演示
class SimpleMathEko {
  constructor(config) {
    this.config = config;
    this.agents = config.agents || [];
    console.log('🔧 数学Eko实例初始化完成');
    console.log(`📊 配置的Agent数量: ${this.agents.length}`);
  }

  async run(taskPrompt) {
    console.log(`\n🎯 开始执行任务: ${taskPrompt}`);
    console.log('⏱️  任务处理中...\n');

    try {
      // 简单的任务分析和Agent选择
      const mathAgent = this.agents.find(agent => agent.Name === 'MathAgent');
      if (!mathAgent) {
        throw new Error('未找到数学Agent');
      }

      // 调用LLM分析任务并生成工具调用
      const toolCalls = await this.analyzeTaskWithLLM(taskPrompt, mathAgent);
      
      let results = [];
      for (const toolCall of toolCalls) {
        console.log(`🛠️  调用工具: ${toolCall.name}`);
        console.log(`📋 参数: ${JSON.stringify(toolCall.arguments, null, 2)}`);
        
        const tool = mathAgent.Tools.find(t => t.name === toolCall.name);
        if (tool) {
          const result = await tool.execute(toolCall.arguments);
          console.log(`✅ 工具执行结果: ${result}`);
          results.push(result);
        }
      }

      return {
        success: true,
        result: results.join('\n'),
        taskId: Date.now().toString()
      };

    } catch (error) {
      console.error(`❌ 任务执行失败: ${error.message}`);
      return {
        success: false,
        result: error.message,
        taskId: Date.now().toString()
      };
    }
  }

  // 使用LLM分析任务并生成工具调用
  async analyzeTaskWithLLM(taskPrompt, mathAgent) {
    const tools = mathAgent.Tools.map(tool => ({
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters
    }));

    const messages = [
      {
        role: 'system',
        content: `你是一个数学助手。分析用户的数学需求，选择合适的工具来解决问题。

可用工具:
${tools.map(tool => `- ${tool.name}: ${tool.description}`).join('\n')}

请根据用户需求返回需要调用的工具和参数。返回JSON格式的工具调用数组。`
      },
      {
        role: 'user',
        content: taskPrompt
      }
    ];

    console.log('🧠 [LLM分析] 分析任务需求...');
    
    try {
      const response = await fetch(`${BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'qwen-turbo',
          messages: messages,
          max_tokens: 1000,
          temperature: 0.3,
          tools: tools.map(tool => ({
            type: 'function',
            function: tool
          })),
          tool_choice: 'auto'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ [LLM分析] 任务分析完成');
      
      // 解析工具调用
      if (data.choices[0].message.tool_calls) {
        return data.choices[0].message.tool_calls.map(call => ({
          name: call.function.name,
          arguments: JSON.parse(call.function.arguments)
        }));
      } else {
        // 如果没有工具调用，尝试从文本中提取
        return this.extractToolCallsFromText(data.choices[0].message.content, mathAgent);
      }
    } catch (error) {
      console.error('❌ [LLM分析] 调用失败:', error.message);
      // 回退到简单的模式匹配
      return this.fallbackTaskAnalysis(taskPrompt, mathAgent);
    }
  }

  // 回退的任务分析方法
  fallbackTaskAnalysis(taskPrompt, mathAgent) {
    const toolCalls = [];
    
    // 简单的关键词匹配
    if (taskPrompt.match(/计算|算|=|\+|\-|\*|\//)) {
      const expressions = taskPrompt.match(/[\d+\-*/().\s]+(?=\s*=|\s*$)/g);
      if (expressions) {
        expressions.forEach(expr => {
          toolCalls.push({
            name: 'basic_calculation',
            arguments: { expression: expr.trim() }
          });
        });
      }
    }
    
    if (taskPrompt.match(/圆|矩形|三角形|球/)) {
      // 这里可以添加更复杂的几何问题解析
      console.log('📝 检测到几何问题，需要更多参数');
    }
    
    if (taskPrompt.match(/平均|中位数|标准差|统计/)) {
      // 这里可以添加统计分析的数据提取
      console.log('📊 检测到统计问题，需要数据数组');
    }

    return toolCalls.length > 0 ? toolCalls : [
      {
        name: 'basic_calculation',
        arguments: { expression: '1 + 1' }
      }
    ];
  }

  // 从文本中提取工具调用
  extractToolCallsFromText(text, mathAgent) {
    console.log('📝 从文本响应中提取工具调用');
    return this.fallbackTaskAnalysis(text, mathAgent);
  }
}

// 演示函数
async function runMathAgentDemo() {
  console.log('🚀 启动数学Agent演示...\n');

  // 创建数学Agent实例
  const mathAgent = new MathAgent();
  
  // 配置简化的Eko实例
  const eko = new SimpleMathEko({
    agents: [mathAgent]
  });

  // 测试任务列表
  const testTasks = [
    '计算 15 + 27 * 3 的结果',
    '帮我算一下半径为5的圆的面积和周长',
    '分析这组数据的统计特征: [12, 15, 18, 20, 22, 25, 28, 30]'
  ];

  console.log('🧪 开始执行测试任务...\n');

  for (let i = 0; i < testTasks.length; i++) {
    const task = testTasks[i];
    console.log(`📋 测试 ${i + 1}/${testTasks.length}`);
    console.log('═'.repeat(60));

    const startTime = Date.now();
    const result = await eko.run(task);
    const endTime = Date.now();

    if (result.success) {
      console.log('\n✅ 任务执行成功!');
      console.log('📝 执行结果:');
      console.log('─'.repeat(40));
      console.log(result.result);
      console.log('─'.repeat(40));
    } else {
      console.log('\n❌ 任务执行失败');
      console.error('错误信息:', result.result);
    }
    
    console.log(`⏱️  执行时间: ${endTime - startTime}ms`);
    console.log(`🆔 任务ID: ${result.taskId}\n`);

    // 任务间隔
    if (i < testTasks.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log('🎊 数学Agent演示完成!');
  console.log('=====================================');
  console.log('🌟 演示亮点:');
  console.log('✅ 自定义Agent开发');
  console.log('✅ 多种数学工具集成');
  console.log('✅ LLM智能任务分析');
  console.log('✅ 工具自动调用机制');
  console.log('✅ 错误处理和回退策略');
}

// 启动演示
runMathAgentDemo().catch(error => {
  console.error('💥 程序异常:', error);
});