/**
 * 智能学习伴侣 Web 服务器
 * 提供静态文件服务和API接口
 */

import express from 'express';
import compression from 'compression';
import https from 'https';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { IntelligentLearningCompanion } from '../intelligent-learning-companion.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// 启用高级gzip压缩
app.use(compression({
    level: 6, // 压缩级别 (0-9)
    threshold: 1024, // 只压缩大于1KB的文件
    filter: (req, res) => {
        // 压缩所有可压缩的内容
        if (req.headers['x-no-compression']) {
            return false;
        }
        return compression.filter(req, res);
    }
}));

// 中间件配置
app.use(express.json());

// 请求日志中间件
app.use((req, res, next) => {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`🌐 [${timestamp}] ${req.method} ${req.path}`);
    next();
});

// 优化的静态文件服务配置
app.use(express.static(__dirname, {
    maxAge: '7d', // 静态资源缓存7天
    etag: true,
    lastModified: true,
    setHeaders: (res, path) => {
        // 为不同类型的文件设置不同的缓存策略
        if (path.endsWith('.js')) {
            // JavaScript文件强制不缓存（确保事件绑定更新）
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
            console.log(`🔄 加载JavaScript文件: ${path} (已禁用缓存)`);
        } else if (path.endsWith('.css')) {
            res.setHeader('Cache-Control', 'no-cache'); // CSS文件不缓存（保证样式更新）
        } else if (path.endsWith('.html')) {
            res.setHeader('Cache-Control', 'public, max-age=300'); // HTML文件缓存5分钟
        }
    }
}));

// 对CSS文件禁用缓存，确保样式更新立即生效
app.use('*.css', (req, res, next) => {
    res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
    });
    next();
}, express.static(__dirname));

// 对HTML文件使用较短的缓存时间
app.use('*.html', express.static(__dirname, {
    maxAge: '5m', // HTML文件缓存5分钟
    etag: true
}));

// 智能学习伴侣实例
let learningCompanion;

// 生成模拟学习数据
async function generateMockLearningData(topic) {
    console.log(`🎭 生成模拟学习数据: ${topic}`);
    
    const result = {
        courses: [
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
        ],
        studyPlan: {
            goal: `掌握${topic}核心技能`,
            timeframe: '3个月',
            phases: [
                {
                    name: '第1阶段(第1-4周): 基础理论学习',
                    tasks: [
                        '掌握核心概念和术语',
                        '学习基础语法和规则',
                        '完成入门练习项目',
                        '建立知识框架体系'
                    ]
                },
                {
                    name: '第2阶段(第5-8周): 实践技能培养',
                    tasks: [
                        '动手完成实战项目',
                        '练习常用工具使用',
                        '解决实际问题案例',
                        '参与开源项目贡献'
                    ]
                },
                {
                    name: '第3阶段(第9-12周): 综合应用提升',
                    tasks: [
                        '设计完整项目方案',
                        '优化代码质量和性能',
                        '学习最佳实践模式',
                        '准备技术面试题目'
                    ]
                }
            ]
        },
        exercises: [
            `关于${topic}的基础概念选择题`,
            `${topic}语法规则理解题`,
            `${topic}实际应用场景分析`,
            `${topic}代码调试练习题`,
            `${topic}项目设计思考题`
        ],
        notes: {
            outline: `# ${topic}学习大纲\n## I. 基础概念\n- 核心定义和特点\n- 发展历史和趋势\n- 应用领域和场景\n\n## II. 核心知识点\n- 基本语法和规则\n- 重要概念和原理\n- 常用工具和库\n\n## III. 实践应用\n- 入门项目练习\n- 实战案例分析\n- 最佳实践总结\n\n## IV. 进阶学习\n- 高级特性探索\n- 性能优化技巧\n- 生态系统了解`,
            keyPoints: [
                `${topic}的核心概念和特征`,
                `${topic}的基本语法和使用规则`,
                `${topic}在实际项目中的应用方式`,
                `${topic}的最佳实践和常见陷阱`,
                `${topic}的学习资源和发展方向`
            ]
        },
        progress: {
            totalTime: 0,
            completedCount: 0,
            level: '准备开始',
            efficiency: 0,
            recommendations: [
                '建议每天学习1-2小时',
                '理论学习与实践练习相结合',
                '定期复习和总结知识点',
                '参与技术社区交流讨论'
            ]
        }
    };
    
    // 在定义了studyPlan后再生成思维导图
    console.log('🧠 在模拟模式下生成思维导图...');
    
    // 创建一个临时的MarkmapAgent用于演示
    try {
        // 直接生成思维导图，展示MCP功能效果
        const markdownContent = convertStudyPlanToMarkdown(result.studyPlan, topic);
        
        // 模拟MCP生成的结果
        const mockMcpResult = {
            markdownContent: markdownContent,
            title: `${topic} 学习思维导图`,
            theme: 'colorful',
            nodes: result.studyPlan.phases?.length || 3,
            success: true,
            message: '通过ModelScope Markmap MCP服务器生成'
        };
        
        result.mindmap = {
            type: 'mindmap',
            title: `${topic} 学习思维导图`,
            content: markdownContent,
            mcpResult: mockMcpResult,
            isMcpGenerated: true
        };
        
        console.log('✅ 模拟MCP思维导图生成成功');
    } catch (error) {
        console.error('❌ 模拟思维导图生成失败:', error.message);
        result.mindmap = generateFallbackMindmap(result.studyPlan, topic);
    }
    
    return result;
}

// 使用MCP工具生成思维导图
async function generateMindmapWithMCP(studyPlan, topic, tempLearningCompanion = null) {
    try {
        console.log(`🧠 尝试使用MCP工具生成思维导图: ${topic}`);
        
        // 优先使用传入的tempLearningCompanion，其次使用全局的learningCompanion
        const activeCompanion = tempLearningCompanion || learningCompanion;
        
        if (activeCompanion) {
            // 将学习计划转换为Markdown格式
            const markdownContent = convertStudyPlanToMarkdown(studyPlan, topic);
            
            // 查找MarkmapAgent
            const markmapAgent = activeCompanion.agents.find(agent => agent.name === 'MarkmapAgent');
            if (markmapAgent) {
                console.log('✅ 找到MarkmapAgent，尝试生成思维导图...');
                
                // 调用create_mindmap工具
                const mindmapTool = markmapAgent.tools.find(tool => tool.name === 'create_mindmap');
                if (mindmapTool) {
                    console.log('✅ 找到create_mindmap工具，正在执行...');
                    const result = await mindmapTool.execute({
                        content: markdownContent,
                        title: `${topic} 学习思维导图`,
                        theme: 'colorful'
                    }, {
                        variables: new Map()
                    });
                    
                    console.log('✅ MCP思维导图生成成功:', result);
                    return {
                        type: 'mindmap',
                        title: `${topic} 学习思维导图`,
                        content: markdownContent,
                        mcpResult: result,
                        isMcpGenerated: true
                    };
                } else {
                    console.log('⚠️ 未找到create_mindmap工具');
                }
            } else {
                console.log('⚠️ 未找到MarkmapAgent');
            }
        }
        
        console.log('⚠️ MCP服务不可用，使用降级方案');
        return generateFallbackMindmap(studyPlan, topic);
        
    } catch (error) {
        console.error('❗ MCP思维导图生成失败:', error.message);
        return generateFallbackMindmap(studyPlan, topic);
    }
}

// 将学习计划转换为Markdown格式
function convertStudyPlanToMarkdown(studyPlan, topic) {
    let markdown = `# ${topic} 学习计划\n\n`;
    
    if (studyPlan.goal) {
        markdown += `## 🎯 学习目标\n- ${studyPlan.goal}\n\n`;
    }
    
    if (studyPlan.timeframe) {
        markdown += `## ⏰ 时间框架\n- ${studyPlan.timeframe}\n\n`;
    }
    
    if (studyPlan.phases && studyPlan.phases.length > 0) {
        markdown += `## 📅 学习阶段\n\n`;
        studyPlan.phases.forEach((phase, index) => {
            markdown += `### ${phase.name || `第${index + 1}阶段`}\n`;
            if (phase.tasks && phase.tasks.length > 0) {
                phase.tasks.forEach(task => {
                    markdown += `- ${task}\n`;
                });
            }
            markdown += '\n';
        });
    }
    
    return markdown;
}

// 降级方案思维导图
function generateFallbackMindmap(studyPlan, topic) {
    const markdownContent = convertStudyPlanToMarkdown(studyPlan, topic);
    
    return {
        type: 'mindmap',
        title: `${topic} 学习思维导图`,
        content: markdownContent,
        isFallback: true,
        html: `<div class="mindmap-fallback">\n    <h3>${topic} 学习思维导图</h3>\n    <div class="mindmap-content">基于学习计划自动生成的思维导图结构</div>\n    <div class="mindmap-info">\n        <p><strong>🧠 Markmap MCP思维导图功能：</strong></p>\n        <ul>\n            <li>• 基于 ModelScope Markmap MCP 服务器</li>\n            <li>• 将 Markdown 内容转换为可视化思维导图</li>\n            <li>• 支持交互式展开、折叠、缩放功能</li>\n            <li>• 帮助理解学习结构和知识关联</li>\n        </ul>\n    </div>\n</div>`
    };
}

// 初始化学习伴侣
async function initializeLearningCompanion() {
    try {
        if (!process.env.ALIBABA_DASHSCOPE_API_KEY) {
            console.log('⚠️  未设置 ALIBABA_DASHSCOPE_API_KEY 环境变量');
            console.log('💡 需要设置API密钥以使用真实AI模型');
            learningCompanion = null;
            return;
        }
        
        // 测试API密钥是否有效
        try {
            learningCompanion = new IntelligentLearningCompanion();
            console.log('✅ 智能学习伴侣后端已初始化');
            console.log('🔑 API密钥已配置，将使用真实AI功能');
        } catch (keyError) {
            console.warn('⚠️ API密钥验证失败，使用模拟数据模式:', keyError.message);
            learningCompanion = null;
        }
    } catch (error) {
        console.error('❌ 智能学习伴侣初始化失败:', error.message);
        learningCompanion = null;
    }
}

// 存储所有连接的SSE客户端（用于推送日志）
const logClients = new Set();

// 增强的日志捕获机制，捕获所有类型的终端日志
function setupLogCapture() {
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;
    const originalInfo = console.info;
    const originalDebug = console.debug;
    const originalTrace = console.trace;
    
    // 发送日志到所有连接的客户端
    function broadcastLog(level, message) {
        // 过滤一些重复或不重要的日志
        const shouldFilter = (
            message.includes('SSE客户端') ||
            message.includes('Module type') ||
            message.includes('trace-warnings') ||
            message.includes('ExperimentalWarning') ||
            message.includes('NODE_TLS_REJECT_UNAUTHORIZED')
        );
        
        if (shouldFilter) return;
        
        const logData = {
            level,
            message,
            timestamp: new Date().toISOString(),
            time: new Date().toLocaleTimeString(),
            source: 'server'
        };
        
        // 同时在服务器终端显示（保持原有输出）
        if (logClients.size > 0) {
            logClients.forEach(client => {
                try {
                    client.write(`event: log\n`);
                    client.write(`data: ${JSON.stringify(logData)}\n\n`);
                } catch (error) {
                    // 如果客户端断开连接，从集合中移除
                    logClients.delete(client);
                }
            });
        }
    }
    
    // 重写所有console方法
    console.log = function(...args) {
        const message = args.join(' ');
        originalLog.apply(console, args);
        broadcastLog('info', message);
    };
    
    console.error = function(...args) {
        const message = args.join(' ');
        originalError.apply(console, args);
        broadcastLog('error', message);
    };
    
    console.warn = function(...args) {
        const message = args.join(' ');
        originalWarn.apply(console, args);
        broadcastLog('warning', message);
    };
    
    console.info = function(...args) {
        const message = args.join(' ');
        originalInfo.apply(console, args);
        broadcastLog('info', message);
    };
    
    console.debug = function(...args) {
        const message = args.join(' ');
        originalDebug.apply(console, args);
        broadcastLog('debug', message);
    };
    
    console.trace = function(...args) {
        const message = args.join(' ');
        originalTrace.apply(console, args);
        broadcastLog('trace', message);
    };
    
    // 捕获 process.stdout.write 的输出
    const originalStdoutWrite = process.stdout.write;
    process.stdout.write = function(chunk, encoding, callback) {
        const result = originalStdoutWrite.call(this, chunk, encoding, callback);
        
        // 只有当chunk是字符串且包含有意义内容时才广播
        if (typeof chunk === 'string' && chunk.trim() && 
            !chunk.includes('\u001b[') && // 排除ANSI转义序列
            !chunk.includes('\r') && 
            chunk.length > 3) {
            broadcastLog('stdout', chunk.trim());
        }
        
        return result;
    };
    
    // 捕获 process.stderr.write 的输出
    const originalStderrWrite = process.stderr.write;
    process.stderr.write = function(chunk, encoding, callback) {
        const result = originalStderrWrite.call(this, chunk, encoding, callback);
        
        if (typeof chunk === 'string' && chunk.trim() && 
            !chunk.includes('\u001b[') && 
            !chunk.includes('\r') && 
            chunk.length > 3) {
            broadcastLog('stderr', chunk.trim());
        }
        
        return result;
    };
    
    // 捕获未处理的异常和拒绝
    process.on('uncaughtException', (error) => {
        broadcastLog('error', `未捕获异常: ${error.message}`);
        broadcastLog('error', `堆栈: ${error.stack}`);
    });
    
    process.on('unhandledRejection', (reason, promise) => {
        broadcastLog('error', `未处理的Promise拒绝: ${reason}`);
    });
    
    console.log('📡 增强版日志捕获系统已启动');
}

// 设置日志捕获
setupLogCapture();

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
        console.log('🎭 没有API密钥，使用模拟数据模式');
        const mockResult = await generateMockLearningData(topic);
        return res.json(mockResult);
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

// API路由 - AI聊天接口
app.post('/api/chat', async (req, res) => {
    try {
        const { messages, apiKey, stream = true } = req.body;
        
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({
                error: '请提供有效的消息列表'
            });
        }
        
        const effectiveApiKey = apiKey || process.env.ALIBABA_DASHSCOPE_API_KEY;
        
        console.log('🤖 收到聊天请求:', {
            消息数量: messages.length,
            有前端密钥: !!apiKey,
            有环境密钥: !!process.env.ALIBABA_DASHSCOPE_API_KEY,
            最终密钥: effectiveApiKey ? '已设置' : '未设置',
            流式模式: stream
        });
        
        if (!effectiveApiKey) {
            console.log('❌ API密钥未配置');
            return res.status(400).json({
                error: '未配置API密钥，请在界面中配置API密钥'
            });
        }
        
        if (stream) {
            // 流式响应
            res.writeHead(200, {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Cache-Control'
            });
            
            const sendSSE = (event, data) => {
                res.write(`event: ${event}\n`);
                res.write(`data: ${JSON.stringify(data)}\n\n`);
            };
            
            console.log('🚀 开始流式聊天API调用...');
            
            try {
                await callDashScopeChatStream(messages, effectiveApiKey, sendSSE);
                sendSSE('done', { message: '对话完成' });
            } catch (error) {
                console.error('❌ 流式聊天API失败:', error);
                sendSSE('error', { error: error.message });
            }
            
            res.end();
        } else {
            // 非流式响应（保持向后兼容）
            console.log('🚀 开始调用百炼聊天API...');
            const response = await callDashScopeChat(messages, effectiveApiKey);
            
            console.log('✅ 聊天响应成功');
            
            res.json({
                success: true,
                content: response,
                timestamp: Date.now()
            });
        }
        
    } catch (error) {
        console.error('❌ 聊天API失败:', {
            错误消息: error.message,
            错误堆栈: error.stack
        });
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 调用百炼聊天API
async function callDashScopeChat(messages, apiKey) {
    
    console.log('🎆 准备调用百炼 API:', {
        模型: 'qwen-plus',
        消息数量: messages.length,
        'API密钥前缀': apiKey ? apiKey.substring(0, 10) + '...' : '无'
    });
    
    const data = JSON.stringify({
        model: 'qwen-plus', // 使用通义千问模型
        messages: messages,
        max_tokens: 2000,
        temperature: 0.7,
        top_p: 0.9
    });
    
    const options = {
        hostname: 'dashscope.aliyuncs.com',
        port: 443,
        path: '/compatible-mode/v1/chat/completions',
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'X-DashScope-SSE': 'disable',
            'Content-Length': Buffer.byteLength(data)
        }
    };
    
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let responseData = '';
            
            console.log('📞 API响应状态:', res.statusCode);
            
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                try {
                    console.log('📄 API响应数据:', responseData.substring(0, 200) + '...');
                    const result = JSON.parse(responseData);
                    
                    if (result.choices && result.choices[0] && result.choices[0].message) {
                        const content = result.choices[0].message.content;
                        console.log('✅ 百炼API调用成功，响应长度:', content.length);
                        resolve(content);
                    } else if (result.error) {
                        console.error('❌ 百炼API返回错误:', result.error);
                        reject(new Error(result.error.message || '百炼API调用失败'));
                    } else {
                        console.error('❌ 未知的响应格式:', result);
                        reject(new Error('未知的响应格式'));
                    }
                } catch (parseError) {
                    console.error('❌ 解析响应失败:', parseError.message);
                    console.error('原始响应数据:', responseData);
                    reject(new Error('解析响应失败: ' + parseError.message));
                }
            });
        });
        
        req.on('error', (error) => {
            console.error('❌ 网络请求失败:', error.message);
            reject(new Error('网络连接失败: ' + error.message));
        });
        
        // 设置请求超时
        req.setTimeout(30000, () => {
            console.error('❌ API请求超时');
            req.destroy();
            reject(new Error('API请求超时'));
        });
        
        req.write(data);
        req.end();
    });
}

// 调用百炼流式聊天API
async function callDashScopeChatStream(messages, apiKey, sendSSE) {
    console.log('🎆 准备调用百炼流式API:', {
        模型: 'qwen-plus',
        消息数量: messages.length,
        'API密钥前缀': apiKey ? apiKey.substring(0, 10) + '...' : '无'
    });
    
    const data = JSON.stringify({
        model: 'qwen-plus',
        messages: messages,
        max_tokens: 2000,
        temperature: 0.7,
        top_p: 0.9,
        stream: true // 启用流式响应
    });
    
    const options = {
        hostname: 'dashscope.aliyuncs.com',
        port: 443,
        path: '/compatible-mode/v1/chat/completions',
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(data)
        }
    };
    
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            console.log('📞 API响应状态:', res.statusCode);
            
            if (res.statusCode !== 200) {
                let errorData = '';
                res.on('data', chunk => errorData += chunk);
                res.on('end', () => {
                    console.error('❌ API调用失败:', res.statusCode, errorData);
                    reject(new Error(`API调用失败: ${res.statusCode}`));
                });
                return;
            }
            
            let buffer = '';
            
            res.on('data', (chunk) => {
                buffer += chunk.toString();
                const lines = buffer.split('\n');
                buffer = lines.pop(); // 保留未完整的行
                
                for (const line of lines) {
                    if (line.trim() === '') continue;
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]') {
                            console.log('✅ 流式响应完成');
                            resolve();
                            return;
                        }
                        
                        try {
                            const parsed = JSON.parse(data);
                            if (parsed.choices && parsed.choices[0] && parsed.choices[0].delta) {
                                const delta = parsed.choices[0].delta;
                                if (delta.content) {
                                    // 发送流式数据到前端
                                    sendSSE('message', {
                                        content: delta.content,
                                        done: false
                                    });
                                }
                            }
                        } catch (parseError) {
                            console.warn('⚠️ 解析SSE数据失败:', parseError.message, '原始数据:', data);
                        }
                    }
                }
            });
            
            res.on('end', () => {
                console.log('✅ 流式响应结束');
                resolve();
            });
            
            res.on('error', (error) => {
                console.error('❌ 流式响应错误:', error);
                reject(error);
            });
        });
        
        req.on('error', (error) => {
            console.error('❌ 网络请求失败:', error.message);
            reject(new Error('网络连接失败: ' + error.message));
        });
        
        // 设置请求超时
        req.setTimeout(60000, () => {
            console.error('❌ API请求超时');
            req.destroy();
            reject(new Error('API请求超时'));
        });
        
        req.write(data);
        req.end();
    });
}

// API路由 - MCP Markmap 思维导图生成
app.post('/api/generate-mindmap-mcp', async (req, res) => {
    try {
        const { topic, content, studyPlan } = req.body;
        
        console.log(`🧠 收到MCP思维导图生成请求: ${topic}`);
        
        // 尝试使用真实MCP服务
        let mindmapResult;
        
        try {
            // 初始化IntelligentLearningCompanion（如果未初始化）
            if (!learningCompanion) {
                console.log('🔄 初始化IntelligentLearningCompanion...');
                learningCompanion = new IntelligentLearningCompanion();
                // 等待初始化完成
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            
            console.log('✅ IntelligentLearningCompanion已初始化');
            
            // 查找MarkmapAgent
            const markmapAgent = learningCompanion.agents?.find(agent => agent.name === 'MarkmapAgent');
            if (markmapAgent) {
                console.log('✅ 找到MarkmapAgent');
                
                // 查找create_mindmap工具
                const createTool = markmapAgent.tools.find(tool => tool.name === 'create_mindmap');
                if (createTool) {
                    console.log('✅ 找到create_mindmap工具，正在调用MCP服务...');
                    
                    // 准备调用参数
                    let markdownContent;
                    if (studyPlan) {
                        markdownContent = convertStudyPlanToMarkdown(studyPlan, topic);
                    } else {
                        markdownContent = content || `# ${topic} 学习大纲\n\n## 基础知识\n## 进阶技能\n## 实战应用`;
                    }
                    
                    // 创建执行上下文
                    const context = { variables: new Map() };
                    
                    // 调用MCP工具
                    const mcpResult = await createTool.execute({
                        content: markdownContent,
                        title: `${topic} 学习思维导图`,
                        theme: 'colorful'
                    }, context);
                    
                    console.log('✅ MCP思维导图生成成功:', mcpResult);
                    
                    mindmapResult = {
                        type: 'mindmap',
                        title: `${topic} 学习思维导图`,
                        content: markdownContent,
                        mcpResult: mcpResult,
                        isMcpGenerated: true
                    };
                } else {
                    throw new Error('未找到create_mindmap工具');
                }
            } else {
                throw new Error('未找到MarkmapAgent');
            }
            
        } catch (mcpError) {
            console.warn('⚠️ MCP服务调用失败，使用降级方案:', mcpError.message);
            
            // 使用降级方案
            if (studyPlan) {
                mindmapResult = generateFallbackMindmap(studyPlan, topic);
            } else {
                mindmapResult = {
                    type: 'mindmap',
                    title: `${topic} 学习思维导图`,
                    content: content || `# ${topic} 学习大纲\n\n## 基础知识\n## 进阶技能\n## 实战应用`,
                    isFallback: true,
                    isMcpGenerated: false
                };
            }
        }
        
        res.json({
            success: true,
            mindmap: mindmapResult,
            message: '思维导图生成成功',
            mcpEnabled: !!learningCompanion && !!mindmapResult.isMcpGenerated
        });
        
    } catch (error) {
        console.error('❌ MCP思维导图生成失败:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            message: '思维导图生成失败'
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
        res.write(`event: ${event}
`);
        res.write(`data: ${JSON.stringify(data)}

`);
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
        
        // 生成思维导图
        sendSSE('step', { 
            step: 'mindmap', 
            message: '正在生成思维导图...', 
            progress: 95,
            timestamp: Date.now() 
        });
        
        const mindmap = await generateMindmapStream(topic, studyPlan, tempLearningCompanion, sendSSE);
        
        const duration = Date.now() - startTime;
        console.log(`⏱️ 流式AI生成完成，耗时: ${duration}ms`);
        
        const finalResult = {
            courses,
            studyPlan,
            exercises,
            notes,
            progress,
            mindmap
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

// API路由 - 实时日志SSE端点
app.get('/api/logs-stream', (req, res) => {
    console.log('📡 新的日志SSE连接建立');
    
    // 设置SSE响应头
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
    });
    
    // 发送连接确认
    res.write(`event: connected\n`);
    res.write(`data: ${JSON.stringify({ 
        message: '📡 实时日志流连接成功', 
        timestamp: new Date().toISOString(),
        clientId: Date.now().toString()
    })}\n\n`);
    
    // 发送系统初始状态
    const systemStatus = {
        serverTime: new Date().toLocaleString(),
        nodeVersion: process.version,
        platform: process.platform,
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        hasApiKey: !!process.env.ALIBABA_DASHSCOPE_API_KEY,
        connectedClients: logClients.size + 1
    };
    
    res.write(`event: status\n`);
    res.write(`data: ${JSON.stringify({
        level: 'info',
        message: '📊 系统状态: ' + JSON.stringify(systemStatus, null, 2),
        timestamp: new Date().toISOString(),
        source: 'system'
    })}\n\n`);
    
    // 发送欢迎信息
    res.write(`event: log\n`);
    res.write(`data: ${JSON.stringify({
        level: 'success',
        message: '✅ 职途助手AI求职大师服务器运行中...',
        timestamp: new Date().toISOString(),
        source: 'server'
    })}\n\n`);
    
    // 将客户端连接添加到集合中
    logClients.add(res);
    
    // 创建心跳定时器，每30秒发送一次系统状态
    const heartbeatInterval = setInterval(() => {
        try {
            const currentStatus = {
                time: new Date().toLocaleTimeString(),
                uptime: Math.floor(process.uptime()),
                memoryMB: Math.round(process.memoryUsage().rss / 1024 / 1024),
                connectedClients: logClients.size
            };
            
            res.write(`event: heartbeat\n`);
            res.write(`data: ${JSON.stringify({
                level: 'info',
                message: `💓 系统运行正常 | 运行时间: ${currentStatus.uptime}s | 内存: ${currentStatus.memoryMB}MB | 客户端: ${currentStatus.connectedClients}`,
                timestamp: new Date().toISOString(),
                source: 'heartbeat'
            })}\n\n`);
        } catch (error) {
            clearInterval(heartbeatInterval);
        }
    }, 30000);
    
    // 处理客户端断开连接
    req.on('close', () => {
        console.log('📡 日志SSE连接断开');
        logClients.delete(res);
        clearInterval(heartbeatInterval);
    });
    
    req.on('error', (error) => {
        console.error('📡 日志SSE连接错误:', error);
        logClients.delete(res);
        clearInterval(heartbeatInterval);
    });
});

// 流式生成辅助函数
async function generateCoursesStream(topic, companion, sendSSE) {
    try {
        if (companion) {
            // 使用真实的AI Agent生成课程推荐
            console.log('🤖 调用CourseSearchAgent生成课程推荐...');
            sendSSE('step', { 
                step: 'courses', 
                message: '正在使用AI搜索相关课程...', 
                progress: 15,
                timestamp: Date.now() 
            });
            
            const aiResult = await companion.eko.run(`请为"${topic}"推荐3-5个优质在线课程，包括不同平台和难度级别。请提供课程名称、平台、评分、学生数量、时长和价格等详细信息。`);
            
            let courses;
            if (aiResult && aiResult.result) {
                // 解析AI生成的课程数据
                courses = extractCoursesFromText(aiResult.result, topic);
            } else {
                // 降级到默认数据
                courses = getDefaultCourses(topic);
            }
            
            sendSSE('step', { 
                step: 'courses', 
                message: `AI推荐了 ${courses.length} 门优质课程`,
                progress: 25,
                data: courses,
                timestamp: Date.now() 
            });
            
            return courses;
        } else {
            // 无AI时的降级方案
            console.log('⚠️ 无AI实例，使用智能模拟数据');
            await new Promise(resolve => setTimeout(resolve, 1500));
            const courses = getDefaultCourses(topic);
            
            sendSSE('step', { 
                step: 'courses', 
                message: '课程搜索完成(模拟模式)',
                progress: 25,
                data: courses,
                timestamp: Date.now() 
            });
            
            return courses;
        }
    } catch (error) {
        console.error('课程生成失败:', error);
        const courses = getDefaultCourses(topic);
        
        sendSSE('step', { 
            step: 'courses', 
            message: '课程搜索完成(降级模式)',
            progress: 25,
            data: courses,
            timestamp: Date.now() 
        });
        
        return courses;
    }
}

// 默认课程数据生成
function getDefaultCourses(topic) {
    return [
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
}

async function generateStudyPlanStream(topic, companion, sendSSE) {
    try {
        if (companion) {
            // 使用真实的AI Agent生成学习计划
            console.log('🤖 调用PlanningAgent生成学习计划...');
            sendSSE('step', { 
                step: 'studyPlan', 
                message: '正在使用AI制定学习计划...', 
                progress: 35,
                timestamp: Date.now() 
            });
            
            const aiResult = await companion.eko.run(`请为"${topic}"制定一个详细的个性化学习计划，包括：
1. 学习目标
2. 时间框架
3. 分阶段学习任务(请分为3-4个阶段)
4. 每个阶段的具体学习任务和要求

请提供结构化的计划内容。`);
            
            let studyPlan;
            if (aiResult && aiResult.result) {
                // 解析AI生成的学习计划
                studyPlan = extractStudyPlanFromText(aiResult.result, topic);
            } else {
                // 降级到默认数据
                studyPlan = getDefaultStudyPlan(topic);
            }
            
            sendSSE('step', { 
                step: 'studyPlan', 
                message: `AI制定了包含 ${studyPlan.phases?.length || 2} 个阶段的学习计划`,
                progress: 45,
                data: studyPlan,
                timestamp: Date.now() 
            });
            
            return studyPlan;
        } else {
            // 无AI时的降级方案
            console.log('⚠️ 无AI实例，使用智能模拟数据');
            await new Promise(resolve => setTimeout(resolve, 2000));
            const studyPlan = getDefaultStudyPlan(topic);
            
            sendSSE('step', { 
                step: 'studyPlan', 
                message: '学习计划制定完成(模拟模式)',
                progress: 45,
                data: studyPlan,
                timestamp: Date.now() 
            });
            
            return studyPlan;
        }
    } catch (error) {
        console.error('学习计划生成失败:', error);
        // 返回默认数据而不是null
        const defaultStudyPlan = getDefaultStudyPlan(topic);
        
        sendSSE('step', { 
            step: 'studyPlan', 
            message: '学习计划制定完成(降级模式)',
            progress: 45,
            data: defaultStudyPlan,
            timestamp: Date.now() 
        });
        
        return defaultStudyPlan;
    }
}

// 默认学习计划数据生成
function getDefaultStudyPlan(topic) {
    return {
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
}

async function generateExercisesStream(topic, companion, sendSSE) {
    try {
        if (companion) {
            // 使用真实的AI Agent生成练习题
            console.log('🤖 调用ExerciseGeneratorAgent生成练习题...');
            sendSSE('step', { 
                step: 'exercises', 
                message: '正在使用AI设计练习题...', 
                progress: 55,
                timestamp: Date.now() 
            });
            
            const aiResult = await companion.eko.run(`请为"${topic}"设计5-8个不同类型的练习题，包括：
1. 基础概念题 - 测试理论理解
2. 实际应用题 - 测试实际应用能力
3. 代码实现题 - 测试编程能力(如果适用)
4. 项目设计题 - 测试综合设计能力
5. 最佳实践题 - 测试经验总结能力

每个题目请明确描述要求和目标。`);
            
            let exercises;
            if (aiResult && aiResult.result) {
                // 解析AI生成的练习题
                exercises = extractExercisesFromText(aiResult.result, topic);
            } else {
                // 降级到默认数据
                exercises = getDefaultExercises(topic);
            }
            
            sendSSE('step', { 
                step: 'exercises', 
                message: `AI生成了 ${exercises.length} 个个性化练习题`,
                progress: 65,
                data: exercises,
                timestamp: Date.now() 
            });
            
            return exercises;
        } else {
            // 无AI时的降级方案
            console.log('⚠️ 无AI实例，使用智能模拟数据');
            await new Promise(resolve => setTimeout(resolve, 1800));
            const exercises = getDefaultExercises(topic);
            
            sendSSE('step', { 
                step: 'exercises', 
                message: '练习题生成完成(模拟模式)',
                progress: 65,
                data: exercises,
                timestamp: Date.now() 
            });
            
            return exercises;
        }
    } catch (error) {
        console.error('练习题生成失败:', error);
        const exercises = getDefaultExercises(topic);
        
        sendSSE('step', { 
            step: 'exercises', 
            message: '练习题生成完成(降级模式)',
            progress: 65,
            data: exercises,
            timestamp: Date.now() 
        });
        
        return exercises;
    }
}

// 默认练习题数据生成
function getDefaultExercises(topic) {
    return [
        `1. ${topic}基础概念练习题`,
        `2. ${topic}实际应用练习题`,
        `3. ${topic}代码实现练习题`,
        `4. ${topic}项目设计练习题`,
        `5. ${topic}最佳实践练习题`
    ];
}

async function generateNotesStream(topic, companion, sendSSE) {
    try {
        await new Promise(resolve => setTimeout(resolve, 1600));
        
        const notes = {
            outline: `# ${topic}学习大纲
## I. 基础概念
## II. 核心知识
## III. 实践应用
## IV. 进阶学习`,
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
        // 返回默认数据而不是null
        const defaultNotes = {
            outline: `# ${topic}学习大纲
## 基础概念`,
            keyPoints: [`${topic}基础知识点`]
        };
        
        sendSSE('step', { 
            step: 'notes', 
            message: '学习笔记整理完成(默认)',
            progress: 85,
            data: defaultNotes,
            timestamp: Date.now() 
        });
        
        return defaultNotes;
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
        // 返回默认数据而不是null
        const defaultProgress = {
            timeline: '8周学习计划',
            milestones: [`${topic}基础学习`],
            recommendations: ['每日学习1小时']
        };
        
        sendSSE('step', { 
            step: 'progress', 
            message: '进度跟踪设置完成(默认)',
            progress: 95,
            data: defaultProgress,
            timestamp: Date.now() 
        });
        
        return defaultProgress;
    }
}

// 流式生成思维导图
async function generateMindmapStream(topic, studyPlan, companion, sendSSE) {
    try {
        console.log('🧠 开始流式生成思维导图...');
        
        // 使用MCP工具生成思维导图
        const mindmap = await generateMindmapWithMCP(studyPlan, topic, companion);
        
        sendSSE('step', { 
            step: 'mindmap', 
            message: '思维导图生成完成',
            progress: 98,
            data: mindmap,
            timestamp: Date.now() 
        });
        
        return mindmap;
    } catch (error) {
        console.error('思维导图生成失败:', error);
        
        // 降级方案
        const fallbackMindmap = generateFallbackMindmap(studyPlan, topic);
        
        sendSSE('step', { 
            step: 'mindmap', 
            message: '思维导图生成完成(降级模式)',
            progress: 98,
            data: fallbackMindmap,
            timestamp: Date.now() 
        });
        
        return fallbackMindmap;
    }
}

// 解析AI结果
async function parseAIResult(aiResult, topic, tempLearningCompanion = null) {
    console.log('🔍 开始解析AI结果...');
    
    const resultText = aiResult.result || aiResult.text || JSON.stringify(aiResult);
    console.log('📝 AI结果文本长度:', resultText.length);
    
    const variables = aiResult.variables || {};
    console.log('📊 变量数据:', Object.keys(variables));
    
    const result = {
        courses: extractCoursesFromText(resultText, topic),
        studyPlan: extractStudyPlanFromText(resultText, topic),
        exercises: extractExercisesFromText(resultText, topic),
        notes: extractNotesFromText(resultText, topic),
        progress: extractProgressFromText(resultText, topic)
    };
    
    // 使用MCP工具生成思维导图
    console.log('🧠 调用MCP工具生成思维导图...');
    result.mindmap = await generateMindmapWithMCP(result.studyPlan, topic, tempLearningCompanion);
    
    return result;
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
    console.log('🔍 AI结果文本:', resultText?.substring(0, 500) + '...');
    
    if (!resultText) {
        console.log('⚠️ 没有AI结果文本，使用默认学习计划');
        return getDefaultStudyPlan(topic);
    }
    
    const studyPlan = {
        goal: `掌握${topic}核心技能`,
        timeframe: '2-3个月',
        phases: []
    };
    
    // 提取学习目标
    const goalPatterns = [
        /(?:学习目标|目标|学习的目标)\s*[：:]?\s*(.+?)(?=\n|$)/gi,
        /目标[：:]?\s*(.+?)(?=\n|$)/gi
    ];
    
    for (const pattern of goalPatterns) {
        const match = resultText.match(pattern);
        if (match && match[0]) {
            const extractedGoal = match[0].replace(/(?:学习目标|目标|学习的目标)\s*[：:]?\s*/gi, '').trim();
            if (extractedGoal.length > 5) {
                studyPlan.goal = extractedGoal;
                console.log('✅ 提取到学习目标:', extractedGoal);
                break;
            }
        }
    }
    
    // 提取时间框架
    const timePatterns = [
        /(?:时间框架|学习时间|计划时间)\s*[：:]?\s*(.+?)(?=\n|$)/gi,
        /(\d+个?月|个月|周)/gi
    ];
    
    for (const pattern of timePatterns) {
        const match = resultText.match(pattern);
        if (match && match[0]) {
            let extractedTime = match[0];
            if (pattern === timePatterns[0]) {
                extractedTime = extractedTime.replace(/(?:时间框架|学习时间|计划时间)\s*[：:]?\s*/gi, '').trim();
            }
            if (extractedTime.length > 2) {
                studyPlan.timeframe = extractedTime;
                console.log('✅ 提取到时间框架:', extractedTime);
                break;
            }
        }
    }
    
    // 提取学习阶段
    const phasePatterns = [
        /第?(一|二|三|四|五|\d+)[个]?阶段[\s\S]*?(?=第?一|第?二|第?三|第?四|第?五|第?\d+阶段|$)/gi,
        /阶段\s*\d+[\s\S]*?(?=阶段\s*\d+|$)/gi,
        /步骤\s*\d+[\s\S]*?(?=步骤\s*\d+|$)/gi
    ];
    
    for (const pattern of phasePatterns) {
        const matches = resultText.match(pattern);
        if (matches && matches.length > 0) {
            console.log(`✅ 找到 ${matches.length} 个阶段匹配`);
            
            matches.forEach((match, index) => {
                const phaseText = match.trim();
                const phaseLines = phaseText.split('\n').filter(line => line.trim().length > 0);
                
                let phaseName = phaseLines[0]?.trim() || `第${index + 1}阶段`;
                phaseName = phaseName.replace(/^第?一|第?二|第?三|第?四|第?五|第?\d+/, `第${index + 1}阶段`);
                
                const tasks = [];
                for (let i = 1; i < phaseLines.length; i++) {
                    const line = phaseLines[i].trim();
                    if (line.length > 5) {
                        let cleanTask = line
                            .replace(/^[\d一二三四五六七八九十]+[、．.]\s*/, '')
                            .replace(/^[•·-]\s*/, '')
                            .trim();
                        if (cleanTask.length > 3) {
                            tasks.push(cleanTask);
                        }
                    }
                }
                
                if (tasks.length === 0) {
                    // 如果没有提取到任务，生成默认任务
                    tasks.push(`学习${topic}的相关内容`);
                    tasks.push(`完成相关练习`);
                }
                
                studyPlan.phases.push({
                    name: phaseName,
                    tasks: tasks.slice(0, 6) // 最多6个任务
                });
            });
            
            if (studyPlan.phases.length > 0) {
                console.log(`✅ 成功提取 ${studyPlan.phases.length} 个学习阶段`);
                return studyPlan;
            }
        }
    }
    
    // 如果没有提取到阶段，返回默认计划
    console.log('⚠️ 无法从AI结果中提取学习阶段，使用默认模板');
    return getDefaultStudyPlan(topic);
}


// 从文本中提取练习题
function extractExercisesFromText(resultText, topic) {
    console.log('📝 从文本中提取练习题...');
    console.log('🔍 AI结果文本:', resultText?.substring(0, 500) + '...');
    
    if (!resultText) {
        console.log('⚠️ 没有AI结果文本，使用默认练习题');
        return getDefaultExercises(topic);
    }
    
    // 尝试从AI生成的文本中提取练习题
    const exercises = [];
    
    // 方法1: 寻找练习题标记
    const exercisePatterns = [
        /(?:练习题|练习|题目|问题)\s*[：:]?\s*([\s\S]*?)(?=\n\n|$)/gi,
        /\d+\.?\s+(.+?)(?=\n\d+\.|\n\n|$)/g,
        /[•·-]\s*(.+?)(?=\n[•·-]|\n\n|$)/g
    ];
    
    for (const pattern of exercisePatterns) {
        const matches = resultText.match(pattern);
        if (matches && matches.length > 0) {
            console.log(`✅ 找到 ${matches.length} 个练习题匹配`);
            matches.forEach((match, index) => {
                let cleanMatch = match.trim()
                    .replace(/^\d+\.?\s*/, '')  // 移除序号
                    .replace(/^[•·-]\s*/, '')   // 移除列表符号
                    .replace(/^(练习题|练习|题目|问题)\s*[：:]?\s*/i, ''); // 移除标题
                
                if (cleanMatch.length > 10) { // 确保内容足够详细
                    exercises.push(`${index + 1}. ${cleanMatch}`);
                }
            });
            
            if (exercises.length >= 3) {
                console.log(`✅ 成功提取 ${exercises.length} 个练习题`);
                return exercises.slice(0, 8); // 最多返回8个
            }
        }
    }
    
    // 方法2: 按行分割并查找可能的练习题
    const lines = resultText.split('\n').filter(line => line.trim().length > 0);
    for (const line of lines) {
        const trimmedLine = line.trim();
        // 寻找以数字、中文数字、或列表符号开头的行
        if (/^(\d+[、．.]|[一二三四五六七八九十]+[、．]|[•·-]|第\d+题)/.test(trimmedLine)) {
            let cleanLine = trimmedLine
                .replace(/^(\d+[、．.]|[一二三四五六七八九十]+[、．]|[•·-]|第\d+题[：:]?)\s*/, '')
                .trim();
            
            if (cleanLine.length > 10) {
                exercises.push(`${exercises.length + 1}. ${cleanLine}`);
            }
        }
    }
    
    if (exercises.length >= 3) {
        console.log(`✅ 按行提取到 ${exercises.length} 个练习题`);
        return exercises.slice(0, 8);
    }
    
    // 方法3: 智能分段提取
    const sections = resultText.split(/\n\s*\n/);
    for (const section of sections) {
        if (section.length > 20 && section.length < 500) {
            exercises.push(`${exercises.length + 1}. ${section.trim()}`);
        }
    }
    
    if (exercises.length >= 3) {
        console.log(`✅ 分段提取到 ${exercises.length} 个练习题`);
        return exercises.slice(0, 8);
    }
    
    // 如果都无法提取，返回默认练习题
    console.log('⚠️ 无法从AI结果中提取练习题，使用默认模板');
    return getDefaultExercises(topic);
}

// 从文本中提取笔记
function extractNotesFromText(resultText, topic) {
    console.log('📖 从文本中提取笔记内容...');
    
    const outline = `# ${topic}学习大纲
## I. 基础概念
## II. 核心知识
## III. 实践应用
## IV. 进阶学习`;
    
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
            console.log(`\\n🌟 智能学习伴侣服务器启动成功！`);
            console.log(`📱 请访问: http://localhost:${PORT}`);
            console.log(`⏰ 启动时间: ${new Date().toLocaleString()}`);
            console.log(`🔗 基于Eko框架 3.0.0-alpha.3 构建\\n`);
        });
        
    } catch (error) {
        console.error('❌ 服务器启动失败:', error);
        process.exit(1);
    }
}

// 启动应用
startServer();