#!/usr/bin/env node

/**
 * 智能学习伴侣测试脚本
 * 验证各Agent功能和协作流程
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function testLearningCompanion() {
    console.log('🧪 智能学习伴侣功能测试');
    console.log('=' + '='.repeat(40));

    // 检查环境变量
    if (!process.env.ALIBABA_DASHSCOPE_API_KEY) {
        console.log('⚠️  提示: 未设置 ALIBABA_DASHSCOPE_API_KEY 环境变量');
        console.log('   这将影响真实的LLM调用，但可以测试Agent结构');
    }

    try {
        // 动态导入学习伴侣模块
        const { IntelligentLearningCompanion } = await import('./intelligent-learning-companion.js');
        
        console.log('✅ 成功导入智能学习伴侣模块');
        
        // 创建学习伴侣实例
        const companion = new IntelligentLearningCompanion();
        console.log('✅ 学习伴侣实例创建成功');
        
        // 测试Agent配置
        testAgentConfiguration(companion);
        
        // 如果有API密钥，运行简单的功能测试
        if (process.env.ALIBABA_DASHSCOPE_API_KEY) {
            console.log('\n🚀 开始功能测试...');
            await runFunctionalTest(companion);
        } else {
            console.log('\n📋 跳过功能测试 (需要API密钥)');
            runStructureTest(companion);
        }
        
    } catch (error) {
        console.error('❌ 测试失败:', error.message);
        console.log('\n💡 故障排除建议:');
        console.log('1. 确保已安装 eko-core 和 eko-nodejs 依赖');
        console.log('2. 检查 Node.js 版本 >= 18');
        console.log('3. 确认项目文件结构正确');
    }
}

function testAgentConfiguration(companion) {
    console.log('\n🔍 测试Agent配置...');
    
    const expectedAgents = [
        'BrowserAgent',
        'CourseSearchAgent', 
        'NoteOrganizerAgent',
        'ExerciseGeneratorAgent',
        'ProgressTrackerAgent'
    ];
    
    console.log(`📊 发现 ${companion.agents.length} 个Agent:`);
    
    companion.agents.forEach((agent, index) => {
        const agentName = agent.constructor.name;
        const isExpected = expectedAgents.includes(agentName);
        const status = isExpected ? '✅' : '⚠️';
        console.log(`  ${index + 1}. ${status} ${agentName}`);
        
        // 检查Agent基本属性
        if (agent.name) {
            console.log(`     - Name: ${agent.name}`);
        }
        if (agent.description) {
            console.log(`     - Description: ${agent.description.substring(0, 50)}...`);
        }
        if (agent.tools) {
            console.log(`     - Tools: ${agent.tools.length} 个工具`);
        }
    });
    
    console.log('✅ Agent配置检查完成');
}

async function runFunctionalTest(companion) {
    console.log('\n🎯 运行功能测试...');
    
    try {
        // 测试简单的学习任务
        const testTask = "学习JavaScript基础语法";
        console.log(`📝 测试任务: "${testTask}"`);
        
        const startTime = Date.now();
        const result = await companion.startLearningSession(testTask);
        const duration = Date.now() - startTime;
        
        console.log(`⏱️  执行时间: ${duration}ms`);
        console.log('✅ 功能测试完成');
        
        if (result && result.result) {
            console.log(`📋 结果预览: ${result.result.substring(0, 100)}...`);
        }
        
    } catch (error) {
        console.error('❌ 功能测试失败:', error.message);
    }
}

function runStructureTest(companion) {
    console.log('\n🏗️  运行结构测试...');
    
    // 测试LLM配置
    if (companion.llmConfig) {
        console.log('✅ LLM配置已设置');
        console.log(`   Provider: ${companion.llmConfig.provider || 'unknown'}`);
        console.log(`   Model: ${companion.llmConfig.model || 'unknown'}`);
    } else {
        console.log('⚠️  LLM配置未设置');
    }
    
    // 测试Eko引擎配置
    if (companion.eko) {
        console.log('✅ Eko引擎已初始化');
        console.log(`   Agents: ${companion.agents.length} 个`);
        console.log(`   Callbacks: ${companion.eko.callback ? '已设置' : '未设置'}`);
    } else {
        console.log('❌ Eko引擎未初始化');
    }
    
    console.log('✅ 结构测试完成');
}

// 验证项目文件
function validateProjectFiles() {
    console.log('\n📁 验证项目文件...');
    
    const requiredFiles = [
        'intelligent-learning-companion.js',
        'learning-companion-dev-guide.md'
    ];
    
    let allFilesExist = true;
    
    requiredFiles.forEach(file => {
        try {
            const filePath = join(__dirname, file);
            readFileSync(filePath, 'utf8');
            console.log(`✅ ${file}`);
        } catch (error) {
            console.log(`❌ ${file} - 文件不存在`);
            allFilesExist = false;
        }
    });
    
    if (allFilesExist) {
        console.log('✅ 所有必需文件都存在');
    } else {
        console.log('⚠️  某些文件缺失，可能影响功能');
    }
    
    return allFilesExist;
}

// 显示使用说明
function showUsageInstructions() {
    console.log('\n📖 使用说明:');
    console.log('1. 环境配置:');
    console.log('   export ALIBABA_DASHSCOPE_API_KEY="your-api-key"');
    console.log('');
    console.log('2. 运行演示:');
    console.log('   node intelligent-learning-companion.js --demo');
    console.log('');
    console.log('3. 自定义学习:');
    console.log('   node intelligent-learning-companion.js "Python编程"');
    console.log('');
    console.log('4. 开发指南:');
    console.log('   查看 learning-companion-dev-guide.md');
}

// 主测试函数
async function main() {
    console.log('🎓 智能学习伴侣 - 测试套件');
    console.log('基于 Eko 框架的多Agent协作学习系统');
    console.log('');
    
    // 验证文件
    const filesValid = validateProjectFiles();
    
    if (filesValid) {
        // 运行核心测试
        await testLearningCompanion();
    }
    
    // 显示使用说明
    showUsageInstructions();
    
    console.log('\n🎉 测试完成！');
    console.log('💡 提示: 这是一个参加 "Awaken Your Web 创新挑战赛" 的项目');
}

// 如果直接运行此文件
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}

export { testLearningCompanion };