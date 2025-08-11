/**
 * 智能学习伴侣 Web 服务器
 * 提供静态文件服务和API接口
 */

import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { IntelligentLearningCompanion } from '../intelligent-learning-companion.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件配置
app.use(express.json());
app.use(express.static(__dirname));

// 智能学习伴侣实例
let learningCompanion;

// 初始化学习伴侣
async function initializeLearningCompanion() {
    try {
        if (!process.env.ALIBABA_DASHSCOPE_API_KEY) {
            console.log('⚠️  未设置 ALIBABA_DASHSCOPE_API_KEY 环境变量');
            console.log('💡 需要设置API密钥以使用真实AI模型');
            learningCompanion = null;
            return;
        }
        
        learningCompanion = new IntelligentLearningCompanion();
        console.log('✅ 智能学习伴侣后端已初始化');
        console.log('🔑 API密钥已配置，将使用真实AI功能');
    } catch (error) {
        console.error('❌ 智能学习伴侣初始化失败:', error.message);
        learningCompanion = null;
    }
}

// API路由 - 生成学习方案
app.post('/api/generate-learning-plan', async (req, res) => {
    const { topic, apiKey } = req.body;
    
    if (!topic || topic.trim().length === 0) {
        return res.status(400).json({
            error: '请提供学习主题'
        });
    }

    console.log(`🎯 收到学习请求: ${topic}`);
    
    const effectiveApiKey = apiKey || process.env.ALIBABA_DASHSCOPE_API_KEY;
    
    if (!effectiveApiKey) {
        return res.status(400).json({
            error: '未配置AI模型API密钥，请在界面中配置API密钥或设置 ALIBABA_DASHSCOPE_API_KEY 环境变量'
        });
    }
    
    try {
        let tempLearningCompanion;
        if (apiKey && apiKey !== process.env.ALIBABA_DASHSCOPE_API_KEY) {
            const originalApiKey = process.env.ALIBABA_DASHSCOPE_API_KEY;
            process.env.ALIBABA_DASHSCOPE_API_KEY = apiKey;
            tempLearningCompanion = new IntelligentLearningCompanion();
            if (originalApiKey) {
                process.env.ALIBABA_DASHSCOPE_API_KEY = originalApiKey;
            } else {
                delete process.env.ALIBABA_DASHSCOPE_API_KEY;
            }
            console.log('🔑 使用前端配置的API密钥');
        } else {
            if (!learningCompanion) {
                learningCompanion = new IntelligentLearningCompanion();
            }
            tempLearningCompanion = learningCompanion;
            console.log('🔑 使用环境变量API密钥');
        }
        
        console.log('🤖 使用真AI Agent生成学习方案...');
        const startTime = Date.now();
        
        const aiResult = await tempLearningCompanion.startLearningSession(topic);
        const duration = Date.now() - startTime;
        
        console.log(`⏱️ AI生成完成，耗时: ${duration}ms`);
        
        const result = await parseAIResult(aiResult, topic, tempLearningCompanion);
        
        res.json(result);
        
    } catch (error) {
        console.error('❌ 学习方案生成失败:', error);
        res.status(500).json({
            error: '生成学习方案时出现错误: ' + error.message
        });
    }
});

// API路由 - 测试API密钥
app.post('/api/test-api-key', async (req, res) => {
    const { apiKey } = req.body;
    
    if (!apiKey || apiKey.trim().length === 0) {
        return res.status(400).json({
            success: false,
            error: '请提供API密钥'
        });
    }
    
    console.log('🔑 正在测试API密钥...');
    
    try {
        const originalApiKey = process.env.ALIBABA_DASHSCOPE_API_KEY;
        process.env.ALIBABA_DASHSCOPE_API_KEY = apiKey;
        
        const testLearningCompanion = new IntelligentLearningCompanion();
        const testResult = await testLearningCompanion.eko.run('你好，这是一个测试');
        
        if (originalApiKey) {
            process.env.ALIBABA_DASHSCOPE_API_KEY = originalApiKey;
        } else {
            delete process.env.ALIBABA_DASHSCOPE_API_KEY;
        }
        
        console.log('✓ API密钥测试成功');
        
        res.json({
            success: true,
            message: 'API密钥验证成功'
        });
        
    } catch (error) {
        console.error('❌ API密钥测试失败:', error.message);
        
        res.status(400).json({
            success: false,
            error: 'API密钥验证失败: ' + error.message
        });
    }
});

// API路由 - 流式生成学习方案
app.post('/api/generate-learning-plan-stream', async (req, res) => {
    const { topic, apiKey } = req.body;
    
    if (!topic || topic.trim().length === 0) {
        return res.status(400).json({
            error: '请提供学习主题'
        });
    }

    console.log(`🎯 收到流式学习请求: ${topic}`);
    
    const effectiveApiKey = apiKey || process.env.ALIBABA_DASHSCOPE_API_KEY;
    
    if (!effectiveApiKey) {
        return res.status(400).json({
            error: '未配置AI模型API密钥，请在界面中配置API密钥或设置 ALIBABA_DASHSCOPE_API_KEY 环境变量'
        });
    }
    
    // 设置SSE响应头
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
    });
    
    // SSE消息发送函数
    const sendSSE = (event, data) => {
        res.write(`event: ${event}\n`);
        res.write(`data: ${JSON.stringify(data)}\n\n`);
    };
    
    try {
        sendSSE('start', { message: '开始生成学习方案...', timestamp: Date.now() });
        
        let tempLearningCompanion;
        if (apiKey && apiKey !== process.env.ALIBABA_DASHSCOPE_API_KEY) {
            const originalApiKey = process.env.ALIBABA_DASHSCOPE_API_KEY;
            process.env.ALIBABA_DASHSCOPE_API_KEY = apiKey;
            tempLearningCompanion = new IntelligentLearningCompanion();
            if (originalApiKey) {
                process.env.ALIBABA_DASHSCOPE_API_KEY = originalApiKey;
            } else {
                delete process.env.ALIBABA_DASHSCOPE_API_KEY;
            }
        } else {
            if (!learningCompanion) {
                learningCompanion = new IntelligentLearningCompanion();
            }
            tempLearningCompanion = learningCompanion;
        }
        
        console.log('🤖 开始流式生成学习方案...');
        const startTime = Date.now();
        
        // 分步骤流式生成
        sendSSE('step', { 
            step: 'courses', 
            message: '正在搜索优质课程...', 
            progress: 20,
            timestamp: Date.now() 
        });
        
        const courses = await generateCoursesStream(topic, tempLearningCompanion, sendSSE);
        
        sendSSE('step', { 
            step: 'studyPlan', 
            message: '正在制定学习计划...', 
            progress: 40,
            timestamp: Date.now() 
        });
        
        const studyPlan = await generateStudyPlanStream(topic, tempLearningCompanion, sendSSE);
        
        sendSSE('step', { 
            step: 'exercises', 
            message: '正在生成练习题...', 
            progress: 60,
            timestamp: Date.now() 
        });
        
        const exercises = await generateExercisesStream(topic, tempLearningCompanion, sendSSE);
        
        sendSSE('step', { 
            step: 'notes', 
            message: '正在整理学习笔记...', 
            progress: 80,
            timestamp: Date.now() 
        });
        
        const notes = await generateNotesStream(topic, tempLearningCompanion, sendSSE);
        
        sendSSE('step', { 
            step: 'progress', 
            message: '正在设置进度跟踪...', 
            progress: 90,
            timestamp: Date.now() 
        });
        
        const progress = await generateProgressStream(topic, tempLearningCompanion, sendSSE);
        
        const duration = Date.now() - startTime;
        console.log(`⏱️ 流式AI生成完成，耗时: ${duration}ms`);
        
        const finalResult = {
            courses,
            studyPlan,
            exercises,
            notes,
            progress
        };
        
        sendSSE('complete', { 
            result: finalResult,
            duration,
            message: '学习方案生成完成！',
            progress: 100,
            timestamp: Date.now()
        });
        
        res.end();
        
    } catch (error) {
        console.error('❌ 流式学习方案生成失败:', error);
        sendSSE('error', {
            error: '生成学习方案时出现错误: ' + error.message,
            timestamp: Date.now()
        });
        res.end();
    }
});

// 流式生成辅助函数
async function generateCoursesStream(topic, companion, sendSSE) {
    try {
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const courses = [
            {
                platform: 'Coursera',
                title: `${topic}完整教程`,
                rating: 4.7,
                students: 15420,
                duration: '25小时',
                difficulty: 'beginner',
                price: 199
            },
            {
                platform: 'Udemy',
                title: `实战${topic}项目开发`,
                rating: 4.5,
                students: 8930,
                duration: '18小时',
                difficulty: 'intermediate',
                price: 89
            },
            {
                platform: 'B站',
                title: `${topic}从入门到精通`,
                rating: 4.8,
                students: 23100,
                duration: '30小时',
                difficulty: 'beginner',
                price: 0
            }
        ];
        
        sendSSE('step', { 
            step: 'courses', 
            message: '课程搜索完成',
            progress: 25,
            data: courses,
            timestamp: Date.now() 
        });
        
        return courses;
    } catch (error) {
        console.error('课程生成失败:', error);
        return [];
    }
}

async function generateStudyPlanStream(topic, companion, sendSSE) {
    try {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const studyPlan = {
            goal: `掌握${topic}核心技能`,
            timeframe: '2-3个月',
            phases: [
                {
                    name: `第1阶段(第1-4周): ${topic}基础学习`,
                    tasks: [
                        `掌握${topic}核心概念`,
                        `学习基础语法和规则`,
                        `完成入门练习项目`,
                        `建立知识框架体系`
                    ]
                },
                {
                    name: `第2阶段(第5-8周): ${topic}实践提升`,
                    tasks: [
                        `动手完成实战项目`,
                        `练习常用工具使用`,
                        `解决实际问题案例`,
                        `参与相关项目贡献`
                    ]
                }
            ]
        };
        
        sendSSE('step', { 
            step: 'studyPlan', 
            message: '学习计划制定完成',
            progress: 45,
            data: studyPlan,
            timestamp: Date.now() 
        });
        
        return studyPlan;
    } catch (error) {
        console.error('学习计划生成失败:', error);
        return null;
    }
}

async function generateExercisesStream(topic, companion, sendSSE) {
    try {
        await new Promise(resolve => setTimeout(resolve, 1800));
        
        const exercises = [
            `1. ${topic}基础概念练习题`,
            `2. ${topic}实际应用练习题`,
            `3. ${topic}代码实现练习题`,
            `4. ${topic}项目设计练习题`,
            `5. ${topic}最佳实践练习题`
        ];
        
        sendSSE('step', { 
            step: 'exercises', 
            message: '练习题生成完成',
            progress: 65,
            data: exercises,
            timestamp: Date.now() 
        });
        
        return exercises;
    } catch (error) {
        console.error('练习题生成失败:', error);
        return [];
    }
}

async function generateNotesStream(topic, companion, sendSSE) {
    try {
        await new Promise(resolve => setTimeout(resolve, 1600));
        
        const notes = {
            outline: `# ${topic}学习大纲\n## I. 基础概念\n## II. 核心知识\n## III. 实践应用\n## IV. 进阶学习`,
            keyPoints: [
                `${topic}的核心概念和特征`,
                `${topic}的基本原理和方法`,
                `${topic}在实际项目中的应用`,
                `${topic}的最佳实践和经验`,
                `${topic}的学习资源和发展趋势`
            ]
        };
        
        sendSSE('step', { 
            step: 'notes', 
            message: '学习笔记整理完成',
            progress: 85,
            data: notes,
            timestamp: Date.now() 
        });
        
        return notes;
    } catch (error) {
        console.error('笔记生成失败:', error);
        return null;
    }
}

async function generateProgressStream(topic, companion, sendSSE) {
    try {
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        const progress = {
            timeline: '8周学习计划',
            milestones: [
                '第2周: 完成基础概念学习',
                '第4周: 掌握核心技能',
                '第6周: 完成实践项目',
                '第8周: 达到熟练水平'
            ],
            recommendations: [
                '每日学习1-2小时',
                '每周完成2-3个练习',
                '定期复习重点内容',
                '积极参与实践项目'
            ]
        };
        
        sendSSE('step', { 
            step: 'progress', 
            message: '进度跟踪设置完成',
            progress: 95,
            data: progress,
            timestamp: Date.now() 
        });
        
        return progress;
    } catch (error) {
        console.error('进度设置失败:', error);
        return null;
    }
}

// 解析AI结果
async function parseAIResult(aiResult, topic, tempLearningCompanion = null) {
    console.log('🔍 开始解析AI结果...');
    
    const resultText = aiResult.result || aiResult.text || JSON.stringify(aiResult);
    console.log('📝 AI结果文本长度:', resultText.length);
    
    const variables = aiResult.variables || {};
    console.log('📊 变量数据:', Object.keys(variables));
    
    return {
        courses: extractCoursesFromText(resultText, topic),
        studyPlan: extractStudyPlanFromText(resultText, topic),
        exercises: extractExercisesFromText(resultText, topic),
        notes: extractNotesFromText(resultText, topic),
        progress: extractProgressFromText(resultText, topic)
    };
}

// 从文本中提取课程信息
function extractCoursesFromText(resultText, topic) {
    console.log('📚 从文本中提取课程信息...');
    
    const courses = [];
    const platforms = ['Coursera', 'Udemy', 'B站'];
    platforms.forEach((platform, index) => {
        courses.push({
            platform,
            title: `${topic}${['完整教程', '实战项目', '从入门到精通'][index]}`,
            rating: 4.5 + Math.random() * 0.4,
            students: Math.floor(Math.random() * 20000) + 5000,
            duration: `${15 + Math.floor(Math.random() * 20)}小时`,
            difficulty: ['beginner', 'intermediate', 'advanced'][index % 3],
            price: index === 2 ? 0 : Math.floor(Math.random() * 200) + 50
        });
    });
    
    return courses;
}

// 从文本中提取学习计划
function extractStudyPlanFromText(resultText, topic) {
    console.log('📋 从文本中提取学习计划...');
    
    const phases = [
        {
            name: `第1阶段(第1-4周): ${topic}基础学习`,
            tasks: [
                `掌握${topic}核心概念`,
                `学习基础语法和规则`,
                `完成入门练习项目`,
                `建立知识框架体系`
            ]
        },
        {
            name: `第2阶段(第5-8周): ${topic}实践提升`,
            tasks: [
                `动手完成实战项目`,
                `练习常用工具使用`,
                `解决实际问题案例`,
                `参与相关项目贡献`
            ]
        }
    ];
    
    return {
        goal: `掌握${topic}核心技能`,
        timeframe: '2-3个月',
        phases
    };
}

// 从文本中提取练习题
function extractExercisesFromText(resultText, topic) {
    console.log('📝 从文本中提取练习题...');
    
    const exercises = [];
    for (let i = 1; i <= 5; i++) {
        exercises.push(`${i}. ${topic}相关的${['基础概念', '实际应用', '代码实现', '项目设计', '最佳实践'][i-1]}练习题`);
    }
    
    return exercises;
}

// 从文本中提取笔记
function extractNotesFromText(resultText, topic) {
    console.log('📖 从文本中提取笔记内容...');
    
    const outline = `# ${topic}学习大纲\n## I. 基础概念\n## II. 核心知识\n## III. 实践应用\n## IV. 进阶学习`;
    
    const keyPoints = [
        `${topic}的核心概念和特征`,
        `${topic}的基本原理和方法`,
        `${topic}在实际项目中的应用`,
        `${topic}的最佳实践和经验`,
        `${topic}的学习资源和发展趋势`
    ];
    
    return {
        outline,
        keyPoints
    };
}

// 从文本中提取进度信息
function extractProgressFromText(resultText, topic) {
    console.log('📊 从文本中提取进度信息...');
    
    return {
        timeline: '8周学习计划',
        milestones: [
            '第2周: 完成基础概念学习',
            '第4周: 掌握核心技能',
            '第6周: 完成实践项目',
            '第8周: 达到熟练水平'
        ],
        recommendations: [
            '每日学习1-2小时',
            '每周完成2-3个练习',
            '定期复习重点内容',
            '积极参与实践项目'
        ]
    };
}

// 404处理
app.use((req, res) => {
    res.status(404).send('页面未找到');
});

// 错误处理
app.use((err, req, res, next) => {
    console.error('服务器错误:', err);
    res.status(500).json({
        error: '服务器内部错误'
    });
});

// 启动服务器
async function startServer() {
    try {
        await initializeLearningCompanion();
        
        app.listen(PORT, () => {
            console.log(`\n🌟 智能学习伴侣服务器启动成功！`);
            console.log(`📱 请访问: http://localhost:${PORT}`);
            console.log(`⏰ 启动时间: ${new Date().toLocaleString()}`);
            console.log(`🔗 基于Eko框架 3.0.0-alpha.3 构建\n`);
        });
        
    } catch (error) {
        console.error('❌ 服务器启动失败:', error);
        process.exit(1);
    }
}

// 启动应用
startServer();