#!/usr/bin/env node

/**
 * 测试ExerciseGeneratorAgent
 */

// 检查是否配置了API密钥
const hasApiKey = !!process.env.ALIBABA_DASHSCOPE_API_KEY;

if (!hasApiKey) {
    console.log('❌ 未配置API密钥，请设置 ALIBABA_DASHSCOPE_API_KEY 环境变量');
    process.exit(1);
}

console.log('🔑 使用真实LLM API密钥测试ExerciseGeneratorAgent');

async function testExerciseGenerator() {
    console.log('📝 测试ExerciseGeneratorAgent');
    console.log('---------------------------');
    
    try {
        // 动态导入模块
        const { Eko, createQwenMaxConfig } = await import('./packages/eko-core/dist/index.esm.js');
        const { ExerciseGeneratorAgent } = await import('./intelligent-learning-companion.js');
        
        // 创建ExerciseGeneratorAgent实例
        const exerciseAgent = new ExerciseGeneratorAgent();
        
        const jobTitle = "AI Agent工程师";
        const skills = [
            "大语言模型应用开发",
            "提示工程",
            "工具调用技术"
        ];
        const count = 3;
        
        console.log(`📝 为"${jobTitle}"职位生成${count}道面试题...`);
        
        // 直接调用Agent的工具来测试
        // 创建一个模拟的context对象
        const context = {
            variables: new Map(),
            checkAborted: async () => {} // 模拟检查中断的方法
        };
        
        // 手动调用setupTools方法确保工具被正确初始化
        exerciseAgent.setupTools();
        
        // 获取Agent的工具
        const tools = exerciseAgent.Tools;
        const generateTool = tools.find(t => t.name === 'generate_interview_questions');
        
        if (!generateTool) {
            throw new Error('找不到generate_interview_questions工具');
        }
        
        // 调用工具生成面试题
        const toolResult = await generateTool.execute({ skills, jobTitle, count }, context);
        
        console.log('✅ ExerciseGeneratorAgent 工具调用成功');
        console.log('工具执行结果:', JSON.stringify(toolResult, null, 2));
        
        // 检查生成的面试题
        const generatedExercises = context.variables.get('generatedExercises');
        if (generatedExercises) {
            console.log('\n生成的面试题:');
            generatedExercises.forEach((exercise, index) => {
                console.log(`${index + 1}. ${exercise.question}`);
                console.log(`   答案: ${exercise.answer.substring(0, 100)}...`);
                console.log(`   解题思路: ${exercise.solution.substring(0, 100)}...\n`);
            });
        }
        
        return { toolResult, generatedExercises };
        
    } catch (error) {
        console.error('❌ ExerciseGeneratorAgent 测试失败:', error.message);
        console.error('错误堆栈:', error.stack);
        throw error;
    }
}

// 运行测试
console.log('🧪 ExerciseGeneratorAgent 真实LLM测试');
console.log('================================');

testExerciseGenerator().then(result => {
  console.log('\n📋 测试结果:');
  console.log('工具调用完成，面试题已生成');
  console.log('\n🎉 测试完成！');
}).catch(error => {
  console.error('测试失败:', error.message);
  process.exit(1);
});