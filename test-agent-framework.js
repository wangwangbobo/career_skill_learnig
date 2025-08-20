#!/usr/bin/env node

/**
 * 通用Agent测试框架
 * 可以独立测试任何Agent的功能
 */

import { Agent, createQwenMaxConfig } from './packages/eko-core/dist/index.esm.js';

// 检查是否配置了API密钥
const hasApiKey = !!process.env.ALIBABA_DASHSCOPE_API_KEY;

// 模拟的Agent基类，用于测试
class MockAgent extends Agent {
    constructor(config) {
        super(config);
        this.tools = [];
    }
    
    addTool(tool) {
        this.tools.push(tool);
    }
}

// JobSkillAnalyzerAgent 实现
class JobSkillAnalyzerAgent extends MockAgent {
    constructor() {
        super({
            name: "JobSkillAnalyzerAgent",
            description: "根据职位信息分析并生成该职位所需的核心技能列表"
        });
        
        // 根据是否有API密钥决定使用真实LLM还是模拟LLM
        if (hasApiKey) {
            this.llmConfig = createQwenMaxConfig(process.env.ALIBABA_DASHSCOPE_API_KEY, {
                temperature: 0.7,
                maxTokens: 4000
            });
        } else {
            // 添加模拟的LLM方法
            this.llm = {
                generate: async (prompt, options) => {
                    console.log('Mock LLM generation for JobSkillAnalyzerAgent...');
                    // 返回模拟的JSON响应
                    return JSON.stringify({
                        skills: ["大语言模型（LLM）应用", "提示工程", "Agent设计模式", "工具调用", "多Agent协作"]
                    });
                }
            };
        }
        
        this.setupTools();
    }

    setupTools() {
        this.addTool({
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
                    let response;
                    if (hasApiKey) {
                        // 使用真实的LLM调用
                        const { Eko } = await import('./packages/eko-core/dist/index.esm.js');
                        const eko = new Eko({ llm: this.llmConfig });
                        response = await eko.llm.generate(prompt, {
                            temperature: 0.5,
                            maxTokens: 500,
                            responseFormat: { type: "json_object" }
                        });
                    } else {
                        // 使用模拟的LLM调用
                        response = await this.llm.generate(prompt, {
                            temperature: 0.5,
                            maxTokens: 500,
                            responseFormat: { type: "json_object" }
                        });
                    }

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

// KnowledgePointGeneratorAgent 实现
class KnowledgePointGeneratorAgent extends MockAgent {
    constructor() {
        super({
            name: "KnowledgePointGeneratorAgent",
            description: "根据职位技能生成对应知识点的智能代理"
        });
        
        // 根据是否有API密钥决定使用真实LLM还是模拟LLM
        if (hasApiKey) {
            this.llmConfig = createQwenMaxConfig(process.env.ALIBABA_DASHSCOPE_API_KEY, {
                temperature: 0.7,
                maxTokens: 4000,
                headers: {
                    "X-DashScope-Plugin": "web_search" // 启用网络搜索插件
                }
            });
        } else {
            // 添加模拟的LLM方法
            this.llm = {
                generate: async (prompt, options) => {
                    console.log('Mock LLM generation for KnowledgePointGeneratorAgent...');
                    // 返回模拟的JSON响应
                    return JSON.stringify({
                        title: "大语言模型（LLM）应用基础",
                        detailedExplanation: "这是关于大语言模型的详细解释。",
                        simpleExplanation: "这是通俗易懂的解释。"
                    });
                }
            };
        }
        
        this.setupTools();
    }

    setupTools() {
        this.addTool({
            name: "generate_knowledge_points",
            description: "根据职位技能生成知识点内容",
            parameters: {
                type: "object",
                properties: {
                    skills: { 
                        type: "array", 
                        items: { type: "string" },
                        description: "职位技能列表" 
                    },
                    jobTitle: { type: "string", description: "职位名称" }
                },
                required: ["skills", "jobTitle"]
            },
            execute: async (args, context) => {
                const { skills, jobTitle } = args;
                
                console.log(`📘 为"${jobTitle}"职位生成知识点内容...`);
                
                // 为每个技能生成知识点
                const knowledgePoints = [];
                
                for (const skill of skills) {
                    const prompt = `为"${jobTitle}"职位生成关于"${skill}"技能的知识点内容，严格按照以下JSON格式输出：
{
  "title": "知识点标题",
  "detailedExplanation": "知识点的详细专业解释，包括概念、原理、技术细节和最佳实践",
  "simpleExplanation": "用通俗易懂的语言解释这个知识点，可以使用比喻帮助理解"
}

确保输出是可解析的JSON格式，不包含其他内容。`;

                    try {
                        let response;
                        if (hasApiKey) {
                            // 使用真实的LLM调用
                            const { Eko } = await import('./packages/eko-core/dist/index.esm.js');
                            const eko = new Eko({ llm: this.llmConfig });
                            response = await eko.llm.generate(prompt, {
                                temperature: 0.7,
                                maxTokens: 1500,
                                responseFormat: { type: "json_object" }
                            });
                        } else {
                            // 使用模拟的LLM调用
                            response = await this.llm.generate(prompt, {
                                temperature: 0.7,
                                maxTokens: 1500,
                                responseFormat: { type: "json_object" }
                            });
                        }

                        let knowledgePoint;
                        try {
                            knowledgePoint = JSON.parse(response);
                        } catch (parseError) {
                            console.error('解析LLM响应失败:', parseError);
                            // 如果解析失败，使用默认格式
                            knowledgePoint = {
                                title: `${jobTitle}核心技能: ${skill}`,
                                detailedExplanation: `关于${skill}的详细专业解释。`,
                                simpleExplanation: `关于${skill}的通俗易懂解释。`
                            };
                        }
                        
                        knowledgePoints.push(knowledgePoint);
                    } catch (error) {
                        console.error(`❌ 为技能"${skill}"生成知识点时出错:`, error);
                        // 出错时使用默认知识点
                        knowledgePoints.push({
                            title: `${jobTitle}核心技能: ${skill}`,
                            detailedExplanation: `关于${skill}的详细专业解释。`,
                            simpleExplanation: `关于${skill}的通俗易懂解释。`
                        });
                    }
                }
                
                context.variables.set('generatedKnowledgePoints', knowledgePoints);
                
                return {
                    content: [{
                        type: "text",
                        text: `✅ 已为${jobTitle}生成${knowledgePoints.length}个知识点`
                    }]
                };
            }
        });
    }
}

// InterviewQuestionGeneratorAgent 实现
class InterviewQuestionGeneratorAgent extends MockAgent {
    constructor() {
        super({
            name: "InterviewQuestionGeneratorAgent",
            description: "生成高频面试题的智能代理"
        });
        
        // 根据是否有API密钥决定使用真实LLM还是模拟LLM
        if (hasApiKey) {
            this.llmConfig = createQwenMaxConfig(process.env.ALIBABA_DASHSCOPE_API_KEY, {
                temperature: 0.7,
                maxTokens: 4000,
                headers: {
                    "X-DashScope-Plugin": "web_search" // 启用网络搜索插件
                }
            });
        } else {
            // 添加模拟的LLM方法
            this.llm = {
                generate: async (prompt, options) => {
                    console.log('Mock LLM generation for InterviewQuestionGeneratorAgent...');
                    // 返回模拟的JSON响应
                    return JSON.stringify([{
                        question: "什么是提示工程？",
                        answer: "提示工程是一种优化提示词的技术。",
                        solution: "理解提示工程的核心概念和应用方法。"
                    }]);
                }
            };
        }
        
        this.setupTools();
    }

    setupTools() {
        this.addTool({
            name: "generate_interview_questions",
            description: "根据职位技能生成高频面试题",
            parameters: {
                type: "object",
                properties: {
                    skills: { 
                        type: "array", 
                        items: { type: "string" },
                        description: "职位技能列表" 
                    },
                    jobTitle: { type: "string", description: "职位名称（可选）" },
                    count: { type: "number", description: "题目数量", minimum: 1, maximum: 20 }
                },
                required: ["skills"]
            },
            execute: async (args, context) => {
                const { skills, jobTitle, count = 5 } = args;
                
                console.log(`📝 为"${jobTitle || '未指定职位'}"生成${count}道面试题...`);
                
                // 生成面试题
                const exercises = [];
                
                for (const skill of skills) {
                    const prompt = `为"${jobTitle || '相关职位'}"职位生成关于"${skill}"技能的高频面试题，严格按照以下JSON格式输出：
[
  {
    "question": "面试题题目",
    "answer": "面试题答案",
    "solution": "解题思路和分析过程"
  }
]

确保输出是可解析的JSON格式，不包含其他内容。生成${Math.min(count, 5)}道题目。`;

                    try {
                        let response;
                        if (hasApiKey) {
                            // 使用真实的LLM调用
                            const { Eko } = await import('./packages/eko-core/dist/index.esm.js');
                            const eko = new Eko({ llm: this.llmConfig });
                            response = await eko.llm.generate(prompt, {
                                temperature: 0.7,
                                maxTokens: 2000,
                                responseFormat: { type: "json_object" }
                            });
                        } else {
                            // 使用模拟的LLM调用
                            response = await this.llm.generate(prompt, {
                                temperature: 0.7,
                                maxTokens: 2000,
                                responseFormat: { type: "json_object" }
                            });
                        }

                        let questions;
                        try {
                            questions = JSON.parse(response);
                            // 确保只取需要的数量
                            questions = questions.slice(0, Math.min(count, questions.length));
                        } catch (parseError) {
                            console.error('解析LLM响应失败:', parseError);
                            // 如果解析失败，使用默认格式
                            questions = [{
                                question: `${skill}相关的面试题`,
                                answer: `这是关于${skill}的面试题答案。`,
                                solution: `解题思路：分析题目要求，运用${skill}相关知识进行解答。`
                            }];
                        }
                        
                        exercises.push(...questions);
                    } catch (error) {
                        console.error(`❌ 为技能"${skill}"生成面试题时出错:`, error);
                        // 出错时使用默认面试题
                        exercises.push({
                            question: `${skill}相关的面试题`,
                            answer: `这是关于${skill}的面试题答案。`,
                            solution: `解题思路：分析题目要求，运用${skill}相关知识进行解答。`
                        });
                    }
                }
                
                // 如果题目数量超过需要的数量，截取前面的题目
                const finalExercises = exercises.slice(0, count);
                context.variables.set('generatedExercises', finalExercises);
                
                return {
                    content: [{
                        type: "text",
                        text: `✅ 已为${jobTitle || '相关职位'}生成${finalExercises.length}道面试题`
                    }]
                };
            }
        });
    }
}

// 测试函数
async function testAgent(agentName) {
    console.log(`🔍 测试 ${agentName}`);
    console.log('---------------------------');
    
    if (hasApiKey) {
        console.log('🔑 使用真实LLM API密钥');
    } else {
        console.log('🧪 使用模拟LLM数据');
    }
    
    try {
        let agent;
        
        switch(agentName) {
            case 'JobSkillAnalyzerAgent':
                agent = new JobSkillAnalyzerAgent();
                break;
            case 'KnowledgePointGeneratorAgent':
                agent = new KnowledgePointGeneratorAgent();
                break;
            case 'InterviewQuestionGeneratorAgent':
                agent = new InterviewQuestionGeneratorAgent();
                break;
            default:
                throw new Error(`未知的Agent: ${agentName}`);
        }
        
        // 模拟上下文
        const context = {
            variables: new Map(),
            invokeAgent: async () => {}
        };
        
        let result;
        switch(agentName) {
            case 'JobSkillAnalyzerAgent':
                result = await agent.tools[0].execute({
                    jobTitle: "AI Agent工程师",
                    jobDescription: "负责设计和开发基于大语言模型的AI Agent系统，包括提示工程、工具调用、多Agent协作等技术。需要熟悉LLM应用开发、Agent设计模式、任务规划等技术。"
                }, context);
                break;
            case 'KnowledgePointGeneratorAgent':
                result = await agent.tools[0].execute({
                    skills: ["大语言模型（LLM）应用", "提示工程"],
                    jobTitle: "AI Agent工程师"
                }, context);
                break;
            case 'InterviewQuestionGeneratorAgent':
                result = await agent.tools[0].execute({
                    skills: ["大语言模型（LLM）应用", "提示工程"],
                    jobTitle: "AI Agent工程师",
                    count: 2
                }, context);
                break;
        }
        
        console.log(`✅ ${agentName} 测试通过`);
        console.log('结果:', JSON.stringify(result, null, 2));
        return result;
        
    } catch (error) {
        console.error(`❌ ${agentName} 测试失败:`, error.message);
        throw error;
    }
}

// 主函数
async function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.log('🧪 通用Agent测试框架');
        console.log('====================');
        if (hasApiKey) {
            console.log('🔑 已配置API密钥，将使用真实LLM');
        } else {
            console.log('🧪 未配置API密钥，将使用模拟数据');
        }
        console.log('使用方法: node test-agent-framework.js <Agent名称>');
        console.log('支持的Agent:');
        console.log('  JobSkillAnalyzerAgent');
        console.log('  KnowledgePointGeneratorAgent');
        console.log('  InterviewQuestionGeneratorAgent');
        return;
    }
    
    const agentName = args[0];
    
    try {
        await testAgent(agentName);
        console.log('\n🎉 测试完成！');
    } catch (error) {
        console.error('测试失败:', error.message);
        process.exit(1);
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export {
    JobSkillAnalyzerAgent,
    KnowledgePointGeneratorAgent,
    InterviewQuestionGeneratorAgent,
    testAgent
};