#!/usr/bin/env node

/**
 * 直接测试LLM调用
 */

// 检查是否配置了API密钥
const hasApiKey = !!process.env.ALIBABA_DASHSCOPE_API_KEY;

if (!hasApiKey) {
    console.log('❌ 未配置API密钥，请设置 ALIBABA_DASHSCOPE_API_KEY 环境变量');
    process.exit(1);
}

console.log('🔑 使用真实LLM API密钥测试直接调用');

async function testDirectLLM() {
    console.log('🚀 测试直接LLM调用');
    console.log('---------------------------');
    
    try {
        // 动态导入模块
        const { createQwenMaxConfig } = await import('./packages/eko-core/dist/index.esm.js');
        
        // 创建LLM配置
        const llmConfig = createQwenMaxConfig(process.env.ALIBABA_DASHSCOPE_API_KEY, {
            temperature: 0.7,
            maxTokens: 1500
        });
        
        console.log('LLM配置:', JSON.stringify(llmConfig, null, 2));
        
        // 测试提示词
        const prompt = `为"AI Agent工程师"职位生成关于"大语言模型应用开发"技能的面试题，严格按照以下JSON格式输出：
[
  {
    "question": "面试题题目",
    "answer": "面试题答案",
    "solution": "解题思路和分析过程"
  }
]

确保输出是可解析的JSON格式，不包含其他内容。生成1道题目。`;
        
        console.log('发送提示到LLM...');
        
        // 发送请求到LLM
        const response = await fetch(llmConfig.config.baseURL + '/chat/completions', {
            method: 'POST',
            headers: llmConfig.config.headers,
            body: JSON.stringify({
                model: llmConfig.model,
                messages: [
                    { role: 'user', content: prompt }
                ],
                temperature: llmConfig.config.temperature,
                max_tokens: llmConfig.config.maxTokens,
                response_format: { type: "json_object" }
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP错误! 状态: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ LLM调用成功');
        console.log('响应内容:', JSON.stringify(data, null, 2));
        
        // 获取实际内容
        const content = data.choices[0].message.content;
        console.log('实际内容:', content);
        
        // 尝试解析响应
        try {
            const parsed = JSON.parse(content);
            console.log('解析后的JSON:', JSON.stringify(parsed, null, 2));
        } catch (parseError) {
            console.error('JSON解析失败:', parseError);
        }
        
        return content;
        
    } catch (error) {
        console.error('❌ LLM调用失败:', error.message);
        console.error('错误堆栈:', error.stack);
        throw error;
    }
}

// 运行测试
console.log('🧪 直接LLM调用测试');
console.log('================================');

testDirectLLM().then(result => {
  console.log('\n📋 测试结果:');
  console.log('LLM调用完成');
  console.log('\n🎉 测试完成！');
}).catch(error => {
  console.error('测试失败:', error.message);
  process.exit(1);
});