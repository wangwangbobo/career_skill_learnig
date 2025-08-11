/**
 * 智能学习伴侣 - 个性化在线学习助手
 * 基于Eko框架的多Agent协作学习系统
 */

import { Eko, Agent, createQwenMaxConfig } from './packages/eko-core/dist/index.esm.js';
import { BrowserAgent } from './packages/eko-nodejs/dist/index.esm.js';
import { MarkmapAgent } from './markmap-agent.js';

// ==================== 核心Agent实现 ====================

/**
 * 课程搜索Agent - 搜索和推荐在线课程
 */
class CourseSearchAgent extends Agent {
    constructor() {
        super({
            name: "CourseSearchAgent",
            description: "专业的课程搜索和推荐Agent，能够在各大在线教育平台搜索课程并提供个性化推荐",
            tools: [],
            planDescription: "课程搜索专家，擅长发现优质学习资源"
        });
        this.setupTools();
    }

    setupTools() {
        this.addTool({
            name: "search_courses",
            description: "在多个平台搜索相关课程",
            parameters: {
                type: "object",
                properties: {
                    subject: { type: "string", description: "学习主题" },
                    difficulty: { type: "string", enum: ["beginner", "intermediate", "advanced"] },
                    platforms: { type: "array", items: { type: "string" } }
                },
                required: ["subject"]
            },
            execute: async (args, context) => {
                const { subject, difficulty = "beginner", platforms = ["coursera", "udemy", "bilibili"] } = args;
                
                console.log(`🔍 搜索"${subject}"相关课程...`);
                
                // 模拟课程搜索结果
                const courses = platforms.map(platform => ({
                    platform,
                    title: `${subject}完整教程`,
                    rating: 4.0 + Math.random(),
                    students: Math.floor(Math.random() * 10000) + 1000,
                    duration: "20-40小时",
                    difficulty,
                    price: Math.floor(Math.random() * 200) + 50
                }));

                context.variables.set('foundCourses', courses);
                
                return {
                    content: [{
                        type: "text",
                        text: `找到 ${courses.length} 门优质课程，涵盖${platforms.join('、')}等主流平台。课程已按质量评分排序。`
                    }]
                };
            }
        });
    }
}

/**
 * 笔记整理Agent - 自动整理学习笔记和总结
 */
class NoteOrganizerAgent extends Agent {
    constructor() {
        super({
            name: "NoteOrganizerAgent",
            description: "专业的笔记整理Agent，能够自动提取重点、生成结构化笔记和知识图谱",
            tools: [],
            planDescription: "笔记整理专家，擅长知识结构化"
        });
        this.setupTools();
    }

    setupTools() {
        this.addTool({
            name: "organize_notes",
            description: "整理学习内容为结构化笔记",
            parameters: {
                type: "object",
                properties: {
                    content: { type: "string", description: "学习内容" },
                    noteType: { type: "string", enum: ["outline", "mindmap", "summary"], default: "outline" }
                },
                required: ["content"]
            },
            execute: async (args, context) => {
                const { content, noteType } = args;
                
                console.log(`📝 生成${noteType}类型笔记...`);
                
                let structuredNotes;
                switch (noteType) {
                    case "outline":
                        structuredNotes = `# 学习大纲\n## I. 基础概念\n## II. 核心知识\n## III. 实践应用\n## IV. 总结复习`;
                        break;
                    case "mindmap":
                        structuredNotes = `🧠 思维导图\n中心主题\n├── 基础理论\n├── 实践应用\n├── 进阶内容\n└── 学习资源`;
                        break;
                    case "summary":
                        structuredNotes = `📄 学习总结\n🎯 核心要点\n🔑 关键知识\n💡 学习建议`;
                        break;
                }

                context.variables.set('organizedNotes', structuredNotes);
                
                return {
                    content: [{
                        type: "text",
                        text: `✅ ${noteType}笔记整理完成！\n\n${structuredNotes}`
                    }]
                };
            }
        });
    }
}

/**
 * 练习生成Agent - 生成个性化练习题
 */
class ExerciseGeneratorAgent extends Agent {
    constructor() {
        super({
            name: "ExerciseGeneratorAgent",
            description: "专业的练习题生成Agent，能够根据学习内容生成个性化练习题和评估",
            tools: [],
            planDescription: "练习生成专家，擅长创建个性化训练题目"
        });
        this.setupTools();
    }

    setupTools() {
        this.addTool({
            name: "generate_exercises",
            description: "生成个性化练习题",
            parameters: {
                type: "object",
                properties: {
                    topic: { type: "string", description: "练习主题" },
                    difficulty: { type: "string", enum: ["beginner", "intermediate", "advanced"] },
                    quantity: { type: "integer", minimum: 1, maximum: 10, default: 5 },
                    exerciseType: { type: "string", enum: ["choice", "answer", "practical"], default: "choice" }
                },
                required: ["topic"]
            },
            execute: async (args, context) => {
                const { topic, difficulty = "intermediate", quantity = 5, exerciseType } = args;
                
                console.log(`📝 生成${quantity}道${topic}练习题...`);
                
                const exercises = [];
                for (let i = 1; i <= quantity; i++) {
                    exercises.push(`${i}. 关于${topic}的${exerciseType === 'choice' ? '选择' : '问答'}题目${i}`);
                }

                const exerciseText = exercises.join('\n');
                context.variables.set('generatedExercises', exercises);
                
                return {
                    content: [{
                        type: "text",
                        text: `📝 个性化练习题生成完成！\n\n${exerciseText}\n\n请完成这些练习来巩固学习成果。`
                    }]
                };
            }
        });
    }
}

/**
 * 进度跟踪Agent - 跟踪学习进度和制定学习计划
 */
class ProgressTrackerAgent extends Agent {
    constructor() {
        super({
            name: "ProgressTrackerAgent",
            description: "专业的进度跟踪Agent，能够跟踪学习进度、分析学习效果并制定个性化学习计划",
            tools: [],
            planDescription: "进度跟踪专家，擅长学习规划和效果分析"
        });
        this.setupTools();
    }

    setupTools() {
        this.addTool({
            name: "track_progress",
            description: "跟踪和分析学习进度",
            parameters: {
                type: "object",
                properties: {
                    studyTime: { type: "number", description: "学习时长(小时)" },
                    completedTasks: { type: "array", items: { type: "string" } },
                    currentLevel: { type: "string", description: "当前水平" }
                },
                required: ["studyTime"]
            },
            execute: async (args, context) => {
                const { studyTime, completedTasks = [], currentLevel = "初学者" } = args;
                
                console.log('📊 分析学习进度...');
                
                const progress = {
                    totalTime: studyTime,
                    completedCount: completedTasks.length,
                    level: currentLevel,
                    efficiency: studyTime > 0 ? (completedTasks.length / studyTime * 10).toFixed(1) : 0
                };

                context.variables.set('learningProgress', progress);
                
                return {
                    content: [{
                        type: "text",
                        text: `📊 学习进度分析：
                        
🎯 总学习时长: ${progress.totalTime}小时
✅ 完成任务: ${progress.completedCount}个
📈 当前水平: ${progress.level}
⚡ 学习效率: ${progress.efficiency}/10

继续保持良好的学习节奏！`
                    }]
                };
            }
        });

        this.addTool({
            name: "create_study_plan",
            description: "制定个性化学习计划",
            parameters: {
                type: "object",
                properties: {
                    goal: { type: "string", description: "学习目标" },
                    timeframe: { type: "string", description: "时间框架" },
                    currentSkills: { type: "array", items: { type: "string" } },
                    preferredStyle: { type: "string", enum: ["visual", "auditory", "kinesthetic"], default: "visual" }
                },
                required: ["goal"]
            },
            execute: async (args, context) => {
                const { goal, timeframe = "3个月", currentSkills = [], preferredStyle } = args;
                
                console.log(`📋 制定"${goal}"学习计划...`);
                
                const studyPlan = `📋 个性化学习计划
                
🎯 学习目标: ${goal}
⏰ 时间框架: ${timeframe}
📚 学习风格: ${preferredStyle || '综合'}

📅 阶段规划:
第1阶段(第1-4周): 基础理论学习
• 掌握核心概念
• 完成基础练习
• 建立知识框架

第2阶段(第5-8周): 实践技能培养  
• 动手实践操作
• 完成项目练习
• 巩固核心技能

第3阶段(第9-12周): 综合应用提升
• 综合项目实战
• 技能深度优化
• 准备进阶学习

💡 每日建议:
• 理论学习: 1小时
• 实践练习: 1小时  
• 复习总结: 0.5小时`;

                context.variables.set('studyPlan', studyPlan);
                
                return {
                    content: [{
                        type: "text",
                        text: `📋 个性化学习计划制定完成！\n\n${studyPlan}`
                    }]
                };
            }
        });
    }
}

// ==================== 智能学习伴侣主应用 ====================

class IntelligentLearningCompanion {
    constructor() {
        this.setupLLM();
        this.setupAgents(); 
        this.setupEko();
    }

    setupLLM() {
        if (!process.env.ALIBABA_DASHSCOPE_API_KEY) {
            throw new Error('请设置 ALIBABA_DASHSCOPE_API_KEY 环境变量');
        }

        this.llmConfig = createQwenMaxConfig(process.env.ALIBABA_DASHSCOPE_API_KEY, {
            temperature: 0.7,
            maxTokens: 4000
        });
    }

    setupAgents() {
        this.agents = [
            new BrowserAgent(),
            new CourseSearchAgent(),
            new NoteOrganizerAgent(), 
            new ExerciseGeneratorAgent(),
            new ProgressTrackerAgent(),
            new MarkmapAgent()
        ];
    }

    setupEko() {
        this.eko = new Eko({
            llms: { default: this.llmConfig },
            agents: this.agents,
            callback: {
                onMessage: (message) => {
                    if (message.type === 'workflow') {
                        console.log('📋 工作流:', message.workflow?.xml || message);
                    } else if (message.type === 'tool_use') {
                        console.log(`🔧 ${message.agentName} > ${message.toolName}`);
                    } else {
                        console.log('🤖 Agent:', message.text || message);
                    }
                },
                onHumanConfirm: async (context, prompt) => {
                    console.log('❓ 需要确认:', prompt);
                    return true; // 演示中自动确认
                }
            }
        });
    }

    async startLearningSession(learningGoal) {
        console.log(`🎯 开始学习会话: ${learningGoal}`);
        console.log('='.repeat(50));
        
        try {
            const result = await this.eko.run(`
                我想学习"${learningGoal}"，请帮我：
                1. 搜索相关的优质课程并推荐
                2. 为我制定详细的学习计划
                3. 生成一些练习题帮我巩固知识
                4. 整理学习笔记和思维导图
                5. 跟踪我的学习进度
                
                请各个Agent协作完成这个完整的学习辅导流程。
            `);
            
            console.log('\n✅ 学习会话完成!');
            console.log('结果:', result.result);
            return result;
        } catch (error) {
            console.error('❌ 学习会话失败:', error);
            throw error;
        }
    }

    // 预设学习场景
    async runDemoScenarios() {
        const scenarios = [
            "Python编程基础",
            "机器学习入门", 
            "前端开发技能",
            "数据分析方法"
        ];
        
        console.log('🎬 智能学习伴侣演示');
        console.log('可用学习场景:');
        scenarios.forEach((scenario, index) => {
            console.log(`  ${index + 1}. ${scenario}`);
        });

        // 运行第一个演示场景
        const selectedScenario = scenarios[0];
        console.log(`\n🚀 开始学习: ${selectedScenario}`);
        return await this.startLearningSession(selectedScenario);
    }
}

// ==================== 启动应用 ====================

async function main() {
    try {
        const learningCompanion = new IntelligentLearningCompanion();
        
        const args = process.argv.slice(2);
        if (args.includes('--demo')) {
            await learningCompanion.runDemoScenarios();
        } else if (args.length > 0) {
            const customGoal = args.join(' ');
            await learningCompanion.startLearningSession(customGoal);
        } else {
            console.log('🎓 智能学习伴侣使用方法:');
            console.log('  node intelligent-learning-companion.js --demo');
            console.log('  node intelligent-learning-companion.js "你的学习目标"');
            await learningCompanion.runDemoScenarios();
        }
    } catch (error) {
        console.error('应用启动失败:', error);
        process.exit(1);
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export { IntelligentLearningCompanion };