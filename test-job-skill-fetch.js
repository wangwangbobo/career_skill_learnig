#!/usr/bin/env node

/**
 * 使用原生fetch调用DashScope API测试Job技能分析
 */

// 检查是否配置了API密钥
const hasApiKey = !!process.env.ALIBABA_DASHSCOPE_API_KEY;

if (!hasApiKey) {
    console.log('❌ 未配置API密钥，请设置 ALIBABA_DASHSCOPE_API_KEY 环境变量');
    process.exit(1);
}

const apiKey = process.env.ALIBABA_DASHSCOPE_API_KEY;

console.log('🔑 使用真实DashScope API密钥测试技能分析');

async function testJobSkillAnalyzer() {
    console.log('🔍 测试职位技能分析');
    console.log('---------------------------');
    
    try {
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

        // 直接调用DashScope API
        const response = await fetch("https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation", {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'X-DashScope-Response-Format': 'application/json'
            },
            body: JSON.stringify({
                model: "qwen-max",
                input: {
                    prompt: prompt
                },
                parameters: {
                    temperature: 0.5,
                    max_tokens: 500,
                    result_format: "message"
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP错误! 状态: ${response.status}, 信息: ${errorText}`);
        }

        const data = await response.json();
        
        // 提取生成的文本
        const generatedText = data.output?.choices?.[0]?.message?.content;
        if (!generatedText) {
            throw new Error('API响应中没有生成的文本内容');
        }
        
        console.log('LLM原始响应:');
        console.log(generatedText);
        
        // 尝试解析JSON
        let skillsData;
        try {
            skillsData = JSON.parse(generatedText);
        } catch (parseError) {
            console.error('解析LLM响应失败:', parseError);
            // 尝试从文本中提取JSON部分
            const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                try {
                    skillsData = JSON.parse(jsonMatch[0]);
                } catch (extractError) {
                    console.error('从文本中提取JSON也失败了:', extractError);
                    throw new Error('无法从LLM响应中解析出有效的JSON格式数据');
                }
            } else {
                throw new Error('无法从LLM响应中解析出有效的JSON格式数据');
            }
        }
        
        console.log('\n✅ 职位技能分析测试通过');
        console.log('解析结果:', JSON.stringify(skillsData, null, 2));
        return skillsData.skills || [];
        
    } catch (error) {
        console.error('❌ 职位技能分析测试失败:', error.message);
        throw error;
    }
}

// 运行测试
console.log('🧪 直接调用DashScope API测试');
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