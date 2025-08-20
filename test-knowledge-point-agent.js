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

console.log('🔑 使用真实LLM API密钥测试KnowledgePointGeneratorAgent');

async function testKnowledgePointGenerator() {
    console.log('📘 测试KnowledgePointGeneratorAgent');
    console.log('---------------------------');
    
    try {
        // 动态导入模块
        const { Eko, createQwenMaxConfig } = await import('./packages/eko-core/dist/index.esm.js');
        const { KnowledgePointGeneratorAgent } = await import('./intelligent-learning-companion.js');
        
        // 创建KnowledgePointGeneratorAgent实例
        const knowledgePointAgent = new KnowledgePointGeneratorAgent();
        
        const jobTitle = "AI Agent工程师";
        const skills = [
            "大语言模型应用开发",
            "提示工程",
            "工具调用技术"
        ];
        
        console.log(`📘 为"${jobTitle}"职位生成知识点内容...`);
        
        // 直接调用Agent的工具来测试
        // 创建一个模拟的context对象
        const context = {
            variables: new Map(),
            checkAborted: async () => {} // 模拟检查中断的方法
        };
        
        // 手动调用setupTools方法确保工具被正确初始化
        knowledgePointAgent.setupTools();
        
        // 获取Agent的工具
        const tools = knowledgePointAgent.Tools;
        const generateTool = tools.find(t => t.name === 'generate_knowledge_points');
        
        if (!generateTool) {
            throw new Error('找不到generate_knowledge_points工具');
        }
        
        // 调用工具生成知识点
        const toolResult = await generateTool.execute({ skills, jobTitle }, context);
        
        console.log('✅ KnowledgePointGeneratorAgent 工具调用成功');
        console.log('工具执行结果:', JSON.stringify(toolResult, null, 2));
        
        // 检查生成的知识点
        const generatedPoints = context.variables.get('generatedKnowledgePoints');
        if (generatedPoints) {
            console.log('\n生成的知识点:');
            generatedPoints.forEach((point, index) => {
                console.log(`${index + 1}. ${point.title}`);
                console.log(`   详细解释: ${point.detailedExplanation.substring(0, 100)}...`);
                console.log(`   通俗解释: ${point.simpleExplanation.substring(0, 100)}...\n`);
            });
        }
        
        return { toolResult, generatedPoints };
        
    } catch (error) {
        console.error('❌ KnowledgePointGeneratorAgent 测试失败:', error.message);
        console.error('错误堆栈:', error.stack);
        throw error;
    }
}

// 运行测试
console.log('🧪 KnowledgePointGeneratorAgent 真实LLM测试');
console.log('================================');

testKnowledgePointGenerator().then(result => {
  console.log('\n📋 测试结果:');
  console.log('工具调用完成，知识点已生成');
  console.log('\n🎉 测试完成！');
}).catch(error => {
  console.error('测试失败:', error.message);
  process.exit(1);
});