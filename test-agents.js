#!/usr/bin/env node

/**
 * Agent功能独立测试脚本
 * 用于逐个测试各个Agent的功能
 */

import { Eko, createQwenMaxConfig } from './packages/eko-core/dist/index.esm.js';
import { BrowserAgent } from './packages/eko-nodejs/dist/index.esm.js';
import { MarkmapAgent } from './markmap-agent.js';
import { IntelligentLearningCompanion } from './intelligent-learning-companion.js';

console.log('🧪 Agent功能独立测试');
console.log('====================');

// 测试配置
const TEST_CONFIG = {
  jobTitle: "AI Agent工程师",
  jobDescription: "负责设计和开发基于大语言模型的AI Agent系统，包括提示工程、工具调用、多Agent协作等技术。需要熟悉LLM应用开发、Agent设计模式、任务规划等技术。"
};

// 创建测试用的Agent工厂
function createTestAgent(agentClass, name) {
  const agent = new agentClass();
  
  // 添加模拟的LLM方法（如果没有API密钥）
  if (!process.env.ALIBABA_DASHSCOPE_API_KEY) {
    agent.llm = {
      generate: async (prompt, options) => {
        console.log(`Mock LLM generation for ${name}...`);
        console.log('Prompt:', prompt.substring(0, 100) + '...');
        
        // 根据不同的Agent返回不同的模拟响应
        switch(name) {
          case 'JobSkillAnalyzerAgent':
            return JSON.stringify({
              skills: ["大语言模型（LLM）应用", "提示工程", "Agent设计模式", "工具调用", "多Agent协作"]
            });
            
          case 'KnowledgePointGeneratorAgent':
            return JSON.stringify({
              title: "大语言模型（LLM）应用基础",
              detailedExplanation: "这是关于大语言模型的详细解释。",
              simpleExplanation: "这是通俗易懂的解释。"
            });
            
          case 'ExerciseGeneratorAgent':
            return JSON.stringify([{
              question: "什么是提示工程？",
              answer: "提示工程是一种优化提示词的技术。",
              solution: "理解提示工程的核心概念和应用方法。"
            }]);
            
          default:
            return JSON.stringify({});
        }
      }
    };
  }
  
  return agent;
}

// 测试JobSkillAnalyzerAgent功能
async function testJobSkillAnalyzer() {
  console.log('\n🔍 测试 JobSkillAnalyzerAgent');
  console.log('---------------------------');
  
  try {
    // 直接使用IntelligentLearningCompanion中的实现
    const companion = new IntelligentLearningCompanion({ forceLocalMode: true });
    const agent = companion.agents.find(a => a.name === 'JobSkillAnalyzerAgent');
    
    if (!agent) {
      throw new Error('JobSkillAnalyzerAgent not found');
    }
    
    // 添加模拟的LLM方法（如果没有API密钥）
    if (!process.env.ALIBABA_DASHSCOPE_API_KEY) {
      agent.llm = {
        generate: async (prompt, options) => {
          console.log('Mock LLM generation for JobSkillAnalyzerAgent...');
          return JSON.stringify({
            skills: ["大语言模型（LLM）应用", "提示工程", "Agent设计模式", "工具调用", "多Agent协作"]
          });
        }
      };
    }
    
    // 模拟上下文
    const context = {
      variables: new Map(),
      invokeAgent: async () => {}
    };
    
    const result = await agent.tools[0].execute({
      jobTitle: TEST_CONFIG.jobTitle,
      jobDescription: TEST_CONFIG.jobDescription
    }, context);
    
    console.log('✅ JobSkillAnalyzerAgent 测试通过');
    console.log('结果:', JSON.stringify(result, null, 2));
    return result.skills || [];
    
  } catch (error) {
    console.error('❌ JobSkillAnalyzerAgent 测试失败:', error.message);
    return ["大语言模型（LLM）应用", "提示工程", "Agent设计模式"];
  }
}

// 测试KnowledgePointGeneratorAgent
async function testKnowledgePointGenerator(skills) {
  console.log('\n📘 测试 KnowledgePointGeneratorAgent');
  console.log('---------------------------------');
  
  try {
    const companion = new IntelligentLearningCompanion({ forceLocalMode: true });
    const agent = companion.agents.find(a => a.name === 'KnowledgePointGeneratorAgent');
    
    if (!agent) {
      throw new Error('KnowledgePointGeneratorAgent not found');
    }
    
    const context = {
      variables: new Map(),
      invokeAgent: async () => {}
    };
    
    // 如果没有API密钥，添加模拟的LLM方法
    if (!process.env.ALIBABA_DASHSCOPE_API_KEY) {
      agent.llm = {
        generate: async (prompt, options) => {
          console.log('Mock LLM generation for KnowledgePointGeneratorAgent...');
          return JSON.stringify({
            title: "大语言模型（LLM）应用基础",
            detailedExplanation: "这是关于大语言模型的详细解释。",
            simpleExplanation: "这是通俗易懂的解释。"
          });
        }
      };
    }
    
    const result = await agent.tools[0].execute({
      skills: skills,
      jobTitle: TEST_CONFIG.jobTitle
    }, context);
    
    console.log('✅ KnowledgePointGeneratorAgent 测试通过');
    console.log('结果:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('❌ KnowledgePointGeneratorAgent 测试失败:', error.message);
  }
}

// 测试ExerciseGeneratorAgent
async function testExerciseGenerator(skills) {
  console.log('\n📝 测试 ExerciseGeneratorAgent');
  console.log('----------------------------');
  
  try {
    const companion = new IntelligentLearningCompanion({ forceLocalMode: true });
    const agent = companion.agents.find(a => a.name === 'InterviewQuestionGeneratorAgent');
    
    if (!agent) {
      throw new Error('InterviewQuestionGeneratorAgent not found');
    }
    
    const context = {
      variables: new Map(),
      invokeAgent: async () => {}
    };
    
    // 如果没有API密钥，添加模拟的LLM方法
    if (!process.env.ALIBABA_DASHSCOPE_API_KEY) {
      agent.llm = {
        generate: async (prompt, options) => {
          console.log('Mock LLM generation for ExerciseGeneratorAgent...');
          return JSON.stringify([{
            question: "什么是提示工程？",
            answer: "提示工程是一种优化提示词的技术。",
            solution: "理解提示工程的核心概念和应用方法。"
          }]);
        }
      };
    }
    
    const result = await agent.tools[0].execute({
      skills: skills,
      jobTitle: TEST_CONFIG.jobTitle,
      count: 2
    }, context);
    
    console.log('✅ ExerciseGeneratorAgent 测试通过');
    console.log('结果:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('❌ ExerciseGeneratorAgent 测试失败:', error.message);
  }
}

// 测试CourseSearchAgent
async function testCourseSearchAgent() {
  console.log('\n🔍 测试 CourseSearchAgent');
  console.log('------------------------');
  
  try {
    const companion = new IntelligentLearningCompanion({ forceLocalMode: true });
    const agent = companion.agents.find(a => a.name === 'CourseSearchAgent');
    
    if (!agent) {
      throw new Error('CourseSearchAgent not found');
    }
    
    const context = {
      variables: new Map(),
      invokeAgent: async () => {}
    };
    
    const result = await agent.tools[0].execute({
      subject: "AI Agent",
      difficulty: "intermediate",
      platforms: ["coursera", "udemy"]
    }, context);
    
    console.log('✅ CourseSearchAgent 测试通过');
    console.log('结果:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('❌ CourseSearchAgent 测试失败:', error.message);
  }
}

// 测试NoteOrganizerAgent
async function testNoteOrganizerAgent() {
  console.log('\n📝 测试 NoteOrganizerAgent');
  console.log('-------------------------');
  
  try {
    const companion = new IntelligentLearningCompanion({ forceLocalMode: true });
    const agent = companion.agents.find(a => a.name === 'NoteOrganizerAgent');
    
    if (!agent) {
      throw new Error('NoteOrganizerAgent not found');
    }
    
    const context = {
      variables: new Map(),
      invokeAgent: async () => {}
    };
    
    const result = await agent.tools[0].execute({
      content: "AI Agent开发相关内容",
      noteType: "outline"
    }, context);
    
    console.log('✅ NoteOrganizerAgent 测试通过');
    console.log('结果:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('❌ NoteOrganizerAgent 测试失败:', error.message);
  }
}

// 测试MarkmapAgent
async function testMarkmapAgent(content) {
  console.log('\n🧠 测试 MarkmapAgent');
  console.log('--------------------');
  
  try {
    const agent = new MarkmapAgent();
    
    const context = {
      variables: new Map(),
      invokeAgent: async () => {}
    };
    
    const result = await agent.tools[0].execute({
      content: content,
      title: "AI Agent技能树",
      theme: "colorful"
    }, context);
    
    console.log('✅ MarkmapAgent 测试通过');
    console.log('结果标题:', result.title);
    
  } catch (error) {
    console.error('❌ MarkmapAgent 测试失败:', error.message);
  }
}

// 主测试函数
async function runAllTests() {
  console.log('🚀 开始逐个测试所有Agent...');
  
  // 测试1: 职位技能分析
  const skills = await testJobSkillAnalyzer();
  
  // 测试2: 知识点生成
  await testKnowledgePointGenerator(skills.slice(0, 2));
  
  // 测试3: 面试题生成
  await testExerciseGenerator(skills.slice(0, 2));
  
  // 测试4: 课程搜索
  await testCourseSearchAgent();
  
  // 测试5: 笔记整理
  await testNoteOrganizerAgent();
  
  // 测试6: 思维导图生成
  await testMarkmapAgent("# AI Agent技能\n## 核心技能\n- 提示工程\n- 工具调用");
  
  console.log('\n🎉 所有Agent测试完成！');
}

// 单独测试某个Agent的函数
async function runSingleTest(agentName) {
  console.log(`🚀 开始测试 ${agentName}...`);
  
  switch(agentName) {
    case 'JobSkillAnalyzerAgent':
      await testJobSkillAnalyzer();
      break;
    case 'KnowledgePointGeneratorAgent':
      const skills = ["大语言模型（LLM）应用", "提示工程"];
      await testKnowledgePointGenerator(skills);
      break;
    case 'ExerciseGeneratorAgent':
      const exSkills = ["大语言模型（LLM）应用", "提示工程"];
      await testExerciseGenerator(exSkills);
      break;
    case 'CourseSearchAgent':
      await testCourseSearchAgent();
      break;
    case 'NoteOrganizerAgent':
      await testNoteOrganizerAgent();
      break;
    case 'MarkmapAgent':
      await testMarkmapAgent("# AI Agent技能\n## 核心技能\n- 提示工程\n- 工具调用");
      break;
    default:
      console.log(`❌ 未知的Agent: ${agentName}`);
  }
}

// 获取命令行参数
const args = process.argv.slice(2);
if (args.length > 0) {
  // 如果提供了参数，则单独测试指定的Agent
  runSingleTest(args[0]).catch(console.error);
} else {
  // 否则运行所有测试
  runAllTests().catch(console.error);
}

export {
  testJobSkillAnalyzer,
  testKnowledgePointGenerator,
  testExerciseGenerator,
  testCourseSearchAgent,
  testNoteOrganizerAgent,
  testMarkmapAgent,
  runAllTests
};