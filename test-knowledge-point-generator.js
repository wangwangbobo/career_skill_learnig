#!/usr/bin/env node

/**
 * 测试KnowledgePointGeneratorAgent
 */

// 检查是否配置了API密钥
const hasApiKey = !!process.env.ALIBABA_DASHSCOPE_API_KEY;

if (!hasApiKey) {
    console.log('❌ 未配置API密钥，请设置 ALIBABA_DASHSCOPE_API_KEY 环境变量');
    process.exit(1);
}

const apiKey = process.env.ALIBABA_DASHSCOPE_API_KEY;

console.log('🔑 使用真实DashScope API密钥测试知识点生成');

async function testKnowledgePointGenerator() {
    console.log('📘 测试知识点生成');
    console.log('---------------------------');
    
    try {
        const jobTitle = "AI Agent工程师";
        const skills = [
            "大语言模型应用开发",
            "提示工程",
            "工具调用技术"
        ];
        
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
                        temperature: 0.7,
                        max_tokens: 1500,
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
            
            console.log(`"${skill}"技能的LLM原始响应:`);
            console.log(generatedText);
            
            // 尝试解析JSON
            let knowledgePoint;
            try {
                knowledgePoint = JSON.parse(generatedText);
            } catch (parseError) {
                console.error(`解析"${skill}"技能响应失败:`, parseError);
                // 尝试从文本中提取JSON部分
                const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    try {
                        knowledgePoint = JSON.parse(jsonMatch[0]);
                    } catch (extractError) {
                        console.error(`从"${skill}"技能文本中提取JSON也失败了:`, extractError);
                        throw new Error(`无法从"${skill}"技能LLM响应中解析出有效的JSON格式数据`);
                    }
                } else {
                    throw new Error(`无法从"${skill}"技能LLM响应中解析出有效的JSON格式数据`);
                }
            }
            
            knowledgePoints.push(knowledgePoint);
            console.log(`✅ 已为"${skill}"技能生成知识点\n`);
        }
        
        console.log('\n✅ 知识点生成测试通过');
        console.log('解析结果:', JSON.stringify(knowledgePoints, null, 2));
        return knowledgePoints;
        
    } catch (error) {
        console.error('❌ 知识点生成测试失败:', error.message);
        throw error;
    }
}

// 运行测试
console.log('🧪 知识点生成Agent测试');
console.log('================================');

testKnowledgePointGenerator().then(knowledgePoints => {
  console.log('\n📋 最终生成的知识点列表:');
  knowledgePoints.forEach((point, index) => {
    console.log(`  ${index + 1}. ${point.title}`);
    console.log(`     详细解释: ${point.detailedExplanation.substring(0, 50)}...`);
    console.log(`     通俗解释: ${point.simpleExplanation.substring(0, 50)}...\n`);
  });
  console.log('\n🎉 测试完成！');
}).catch(error => {
  console.error('测试失败:', error.message);
  process.exit(1);
});