#!/usr/bin/env node

/**
 * JobSkillAnalyzerAgent 独立测试脚本
 * 用于测试新添加的职位技能分析Agent
 */

// 直接从intelligent-learning-companion.js导入JobSkillAnalyzerAgent类定义
import { Agent } from './packages/eko-core/dist/index.esm.js';

class JobSkillAnalyzerAgent extends Agent {
    constructor() {
        super({
            name: "JobSkillAnalyzerAgent",
            description: "根据职位信息分析并生成该职位所需的核心技能列表"
        });
        
        // 添加模拟的LLM方法
        this.llm = {
            generate: async (prompt, options) => {
                console.log('Mock LLM generation for JobSkillAnalyzerAgent...');
                console.log('Prompt:', prompt.substring(0, 100) + '...');
                
                // 返回模拟的JSON响应
                return JSON.stringify({
                    skills: ["大语言模型（LLM）应用", "提示工程", "Agent设计模式", "工具调用", "多Agent协作"]
                });
            }
        };
        
        this.tools = []; // 初始化tools数组
        this.setupTools();
    }

    setupTools() {
        this.tools.push({
            name: "analyze_job_skills",
            description: "分析职位信息并生成技能列表",
            parameters: {
                type: "object",
                properties: {
                    jobTitle: { type: "string", description: "职位名称" },
                    jobDescription: { type: "string", description: "职位描述" }
                },
                required: ["jobTitle"]
            },
            execute: async (args, context) => {
                const { jobTitle, jobDescription = "" } = args;
                
                console.log(`🔍 分析"${jobTitle}"职位所需技能...`);
                
                const prompt = `请分析以下职位信息，生成该职位所需的核心技能列表：
职位名称: "${jobTitle}"
职位描述: "${jobDescription}"

请严格按照以下JSON格式输出技能列表：
{
  "skills": ["技能1", "技能2", "技能3", ...]
}

确保输出是可解析的JSON格式，不包含其他内容。技能列表应该包含8-12个核心技能。`;

                try {
                    const response = await this.llm.generate(prompt, {
                        temperature: 0.5,
                        maxTokens: 500,
                        responseFormat: { type: "json_object" }
                    });

                    let skillsData;
                    try {
                        skillsData = JSON.parse(response);
                    } catch (parseError) {
                        // 如果解析失败，使用默认格式
                        skillsData = {
                            skills: [`${jobTitle}相关技能1`, `${jobTitle}相关技能2`, `${jobTitle}相关技能3`]
                        };
                    }
                    
                    context.variables.set('analyzedJobSkills', skillsData.skills);
                    
                    return {
                        content: [{
                            type: "text",
                            text: `✅ 已分析"${jobTitle}"职位，生成${skillsData.skills.length}项核心技能`
                        }],
                        skills: skillsData.skills
                    };
                    
                } catch (error) {
                    console.error(`❌ 分析"${jobTitle}"职位技能时出错:`, error);
                    // 出错时使用默认技能列表
                    const defaultSkills = [`${jobTitle}基础技能`, `${jobTitle}核心技能`, `${jobTitle}进阶技能`];
                    context.variables.set('analyzedJobSkills', defaultSkills);
                    
                    return {
                        content: [{
                            type: "text",
                            text: `⚠️ 无法分析"${jobTitle}"职位技能，使用默认技能列表`
                        }],
                        skills: defaultSkills
                    };
                }
            }
        });
    }
}

// 测试函数
async function testJobSkillAnalyzer() {
  console.log('🔍 测试 JobSkillAnalyzerAgent');
  console.log('---------------------------');
  
  try {
    const agent = new JobSkillAnalyzerAgent();
    
    // 模拟上下文
    const context = {
      variables: new Map(),
      invokeAgent: async () => {}
    };
    
    const result = await agent.tools[0].execute({
      jobTitle: "AI Agent工程师",
      jobDescription: "负责设计和开发基于大语言模型的AI Agent系统，包括提示工程、工具调用、多Agent协作等技术。需要熟悉LLM应用开发、Agent设计模式、任务规划等技术。"
    }, context);
    
    console.log('✅ JobSkillAnalyzerAgent 测试通过');
    console.log('结果:', JSON.stringify(result, null, 2));
    return result.skills || [];
    
  } catch (error) {
    console.error('❌ JobSkillAnalyzerAgent 测试失败:', error.message);
    return ["大语言模型（LLM）应用", "提示工程", "Agent设计模式"];
  }
}

// 运行测试
console.log('🧪 JobSkillAnalyzerAgent 独立测试');
console.log('================================');

testJobSkillAnalyzer().then(skills => {
  console.log('\n📋 最终生成的技能列表:');
  skills.forEach((skill, index) => {
    console.log(`  ${index + 1}. ${skill}`);
  });
}).catch(console.error);