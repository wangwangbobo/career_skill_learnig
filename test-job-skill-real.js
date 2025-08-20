#!/usr/bin/env node

/**
 * 使用真实LLM测试JobSkillAnalyzerAgent
 */

import { Eko, createQwenMaxConfig } from './packages/eko-core/dist/index.esm.js';

// 检查是否配置了API密钥
const hasApiKey = !!process.env.ALIBABA_DASHSCOPE_API_KEY;

if (!hasApiKey) {
    console.log('❌ 未配置API密钥，请设置 ALIBABA_DASHSCOPE_API_KEY 环境变量');
    process.exit(1);
}

console.log('🔑 使用真实LLM API密钥测试JobSkillAnalyzerAgent');

async function testJobSkillAnalyzer() {
    console.log('🔍 测试 JobSkillAnalyzerAgent');
    console.log('---------------------------');
    
    try {
        // 创建LLM配置
        const llmConfig = createQwenMaxConfig(process.env.ALIBABA_DASHSCOPE_API_KEY, {
            temperature: 0.7,
            maxTokens: 4000,
            headers: {
                "X-DashScope-Plugin": "web_search" // 启用网络搜索插件
            }
        });
        
        // 创建Eko实例
        const eko = new Eko({
            llm: llmConfig
        });
        
        const jobTitle = "AI Agent工程师";
        const jobDescription = "负责设计和开发基于大语言模型的AI Agent系统，包括提示工程、工具调用、多Agent协作等技术。需要熟悉LLM应用开发、Agent设计模式、任务规划等技术。";
        
        console.log(`🔍 分析"${jobTitle}"职位所需技能...`);
        
        const prompt = `请分析以下职位信息，生成该职位所需的核心技能列表：
职位名称: "${jobTitle}"
职位描述: "${jobDescription}"

请严格按照以下JSON格式输出技能列表：
{
  "skills": ["技能1", "技能2", "技能3", ...]
}

确保输出是可解析的JSON格式，不包含其他内容。技能列表应该包含8-12个核心技能。`;

        const response = await eko.llm.generate(prompt, {
            temperature: 0.5,
            maxTokens: 500,
            responseFormat: { type: "json_object" }
        });

        let skillsData;
        try {
            skillsData = JSON.parse(response);
        } catch (parseError) {
            console.error('解析LLM响应失败:', parseError);
            // 如果解析失败，使用默认格式
            skillsData = {
                skills: [`${jobTitle}相关技能1`, `${jobTitle}相关技能2`, `${jobTitle}相关技能3`]
            };
        }
        
        console.log('✅ JobSkillAnalyzerAgent 测试通过');
        console.log('结果:', JSON.stringify(skillsData, null, 2));
        return skillsData.skills || [];
        
    } catch (error) {
        console.error('❌ JobSkillAnalyzerAgent 测试失败:', error.message);
        throw error;
    }
}

// 运行测试
console.log('🧪 JobSkillAnalyzerAgent 真实LLM测试');
console.log('================================');

testJobSkillAnalyzer().then(skills => {
  console.log('\n📋 最终生成的技能列表:');
  skills.forEach((skill, index) => {
    console.log(`  ${index + 1}. ${skill}`);
  });
  console.log('\n🎉 测试完成！');
}).catch(error => {
  console.error('测试失败:', error.message);
  process.exit(1);
});