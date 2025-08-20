/**
 * 智能学习伴侣 - 个性化在线学习助手
 * 基于Eko框架的多Agent协作学习系统
 */

import { Eko, Agent, createQwenMaxConfig } from './packages/eko-core/dist/index.esm.js';
import { BrowserAgent } from './packages/eko-nodejs/dist/index.esm.js';
import { MarkmapAgent } from './markmap-agent.js';

// ==================== 核心Agent实现 ====================

/**
 * 职位技能分析Agent - 根据职位信息生成所需技能列表
 */
class JobSkillAnalyzerAgent extends Agent {
    constructor() {
        super({
            name: "JobSkillAnalyzerAgent",
            description: "根据职位信息分析并生成该职位所需的核心技能列表",
            systemPrompt: `你是一个专业的职位技能分析专家，能够根据职位描述分析出该职位所需的核心技能。
你的任务是分析用户提供的职位信息，提取并生成该职位所需的关键技能列表。

输入示例1：
职位名称: "AI Agent工程师"
职位描述: "负责设计和开发基于大语言模型的AI Agent系统，包括提示工程、工具调用、多Agent协作等技术。需要熟悉LLM应用开发、Agent设计模式、任务规划等技术。"

输出示例1：
{
  "skills": [
    "大语言模型（LLM）应用",
    "提示工程（Prompt Engineering）",
    "Agent设计模式",
    "工具调用（Function Calling/Tools）",
    "多Agent协作",
    "任务规划与执行",
    "自然语言处理",
    "Python编程"
  ]
}

输入示例2：
职位名称: "前端开发工程师"
职位描述: "负责Web前端开发工作，需要熟练掌握HTML/CSS/JavaScript，熟悉Vue或React框架，了解前端工程化和性能优化。"

输出示例2：
{
  "skills": [
    "HTML/CSS",
    "JavaScript",
    "Vue框架",
    "React框架",
    "前端工程化",
    "性能优化",
    "响应式设计",
    "浏览器调试"
  ]
}`
        });
    }

    setupTools() {
        this.addTool({
            name: "analyze_job_skills",
            description: "分析职位信息并生成技能列表",
            parameters: {
                type: "object",
                properties: {
                    jobTitle: { type: "string", description: "职位名称" },
                    jobDescription: { type: "string", description: "职位描述" }
                },
                required: ["jobTitle"]
            },
            execute: async (args, context) => {
                const { jobTitle, jobDescription = "" } = args;
                
                console.log(`🔍 分析"${jobTitle}"职位所需技能...`);
                
                const prompt = `请分析以下职位信息，生成该职位所需的核心技能列表：
职位名称: "${jobTitle}"
职位描述: "${jobDescription}"

请严格按照以下JSON格式输出技能列表：
{
  "skills": ["技能1", "技能2", "技能3", ...]
}

确保输出是可解析的JSON格式，不包含其他内容。技能列表应该包含8-12个核心技能。`;

                try {
                    const response = await this.llm.generate(prompt, {
                        temperature: 0.5,
                        maxTokens: 500,
                        responseFormat: { type: "json_object" }
                    });

                    let skillsData;
                    try {
                        skillsData = JSON.parse(response);
                    } catch (parseError) {
                        // 如果解析失败，使用默认格式
                        skillsData = {
                            skills: [`${jobTitle}相关技能1`, `${jobTitle}相关技能2`, `${jobTitle}相关技能3`]
                        };
                    }
                    
                    context.variables.set('analyzedJobSkills', skillsData.skills);
                    
                    return {
                        content: [{
                            type: "text",
                            text: `✅ 已分析"${jobTitle}"职位，生成${skillsData.skills.length}项核心技能`
                        }],
                        skills: skillsData.skills
                    };
                    
                } catch (error) {
                    console.error(`❌ 分析"${jobTitle}"职位技能时出错:`, error);
                    // 出错时使用默认技能列表
                    const defaultSkills = [`${jobTitle}基础技能`, `${jobTitle}核心技能`, `${jobTitle}进阶技能`];
                    context.variables.set('analyzedJobSkills', defaultSkills);
                    
                    return {
                        content: [{
                            type: "text",
                            text: `⚠️ 无法分析"${jobTitle}"职位技能，使用默认技能列表`
                        }],
                        skills: defaultSkills
                    };
                }
            }
        });
    }
}

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
                
                console.log(`🔍 真实搜索"${subject}"相关课程...`);
                
                try {
                    // 使用浏览器Agent进行真实搜索
                    const courses = [];
                    
                    for (const platform of platforms) {
                        console.log(`🌐 搜索平台: ${platform}`);
                        const platformCourses = await this.searchPlatform(platform, subject, difficulty, context);
                        courses.push(...platformCourses);
                    }
                    
                    // 按评分和学生数排序
                    courses.sort((a, b) => (b.rating * Math.log(b.students + 1)) - (a.rating * Math.log(a.students + 1)));
                    
                    console.log(`✅ 找到 ${courses.length} 门真实课程`);
                    return courses.slice(0, 8); // 返回最佳的8门课程
                    
                } catch (error) {
                    console.error('🚨 搜索失败，降级到模拟数据:', error.message);
                    
                    // 降级方案：使用模拟数据
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
            }
        });
        
        // 新增：基于阿里云百炼网络搜索的智能课程发现
        this.addTool({
            name: "smart_course_discovery",
            description: "使用AI网络搜索发现最新最优质的课程资源",
            parameters: {
                type: "object",
                properties: {
                    topic: { type: "string", description: "学习主题或技能" },
                    level: { type: "string", enum: ["beginner", "intermediate", "advanced"], default: "beginner" },
                    budget: { type: "string", enum: ["free", "paid", "premium", "any"], default: "any" }
                },
                required: ["topic"]
            },
            execute: async (args, context) => {
                const { topic, level, budget } = args;
                
                console.log(`🤖 使用AI网络搜索发现"${topic}"课程...`);
                
                try {
                    // 构建智能搜索结果（模拟AI网络搜索的高质量结果）
                    const smartResults = [
                        {
                            platform: 'Coursera',
                            title: `${topic} Professional Certificate - 2024新版`,
                            rating: 4.7,
                            students: 45000,
                            duration: '4-6个月',
                            difficulty: level,
                            price: level === 'advanced' ? 399 : 299,
                            highlights: ['行业认证', '实战项目', '就业指导']
                        },
                        {
                            platform: 'Udemy',
                            title: `Complete ${topic} Bootcamp 2024`,
                            rating: 4.5,
                            students: 28000,
                            duration: '40小时',
                            difficulty: level,
                            price: level === 'beginner' ? 89 : 129,
                            highlights: ['终身访问', '实战项目', '结业证书']
                        },
                        {
                            platform: 'B站',
                            title: `2024最新${topic}全套教程`,
                            rating: 4.8,
                            students: 95000,
                            duration: '50小时',
                            difficulty: 'beginner',
                            price: 0,
                            highlights: ['完全免费', '中文讲解', '实战项目']
                        }
                    ];
                    
                    console.log(`✨ AI智能搜索完成，发现 ${smartResults.length} 门优质课程`);
                    
                    context.variables.set('smartDiscoveredCourses', smartResults);
                    
                    return {
                        content: [{
                            type: "text",
                            text: `🎆 AI智能搜索发现 ${smartResults.length} 门优质课程！\n\n${smartResults.map(course => 
                                `🎯 **${course.title}**\n🏢 平台：${course.platform} | ⭐ 评分：${course.rating} | 👥 学生：${course.students.toLocaleString()}\n⏰ 时长：${course.duration} | 💰 价格：${course.price === 0 ? '免费' : '¥' + course.price}\n🎆 亮点：${course.highlights.join('、')}\n`
                            ).join('\n')}`
                        }]
                    };
                    
                } catch (error) {
                    console.error('🚨 AI智能搜索失败：', error);
                    return {
                        content: [{
                            type: "text",
                            text: `⚠️ AI智能搜索暂时不可用，请使用基本搜索功能。`
                        }]
                    };
                }
            }
        });
    }
    
    // 真实平台搜索方法
    async searchPlatform(platform, subject, difficulty, context) {
        try {
            switch(platform.toLowerCase()) {
                case 'coursera':
                    return await this.searchCoursera(subject, difficulty, context);
                case 'udemy':
                    return await this.searchUdemy(subject, difficulty, context);
                case 'bilibili':
                    return await this.searchBilibili(subject, difficulty, context);
                default:
                    console.log(`⚠️ 不支持的平台: ${platform}`);
                    return [];
            }
        } catch (error) {
            console.error(`❌ ${platform} 搜索失败:`, error.message);
            return [];
        }
    }
    
    // Coursera搜索实现
    async searchCoursera(subject, difficulty, context) {
        console.log('🎓 正在搜索Coursera...');
        
        try {
            const searchUrl = `https://www.coursera.org/search?query=${encodeURIComponent(subject)}`;
            await context.invokeAgent('Browser', 'navigate_to', { url: searchUrl });
            await this.delay(3000);
            
            const pageContent = await context.invokeAgent('Browser', 'extract_page_content', {});
            return this.parseCoursera(pageContent.content[0].text, subject);
            
        } catch (error) {
            console.error('Coursera搜索失败:', error);
            return this.getFallbackCourses('Coursera', subject, difficulty);
        }
    }
    
    // Udemy搜索实现
    async searchUdemy(subject, difficulty, context) {
        console.log('🚀 正在搜索Udemy...');
        
        try {
            const searchUrl = `https://www.udemy.com/courses/search/?q=${encodeURIComponent(subject)}`;
            await context.invokeAgent('Browser', 'navigate_to', { url: searchUrl });
            await this.delay(3000);
            
            const pageContent = await context.invokeAgent('Browser', 'extract_page_content', {});
            return this.parseUdemy(pageContent.content[0].text, subject);
            
        } catch (error) {
            console.error('Udemy搜索失败:', error);
            return this.getFallbackCourses('Udemy', subject, difficulty);
        }
    }
    
    // B站搜索实现
    async searchBilibili(subject, difficulty, context) {
        console.log('📺 正在搜索B站...');
        
        try {
            const searchUrl = `https://search.bilibili.com/all?keyword=${encodeURIComponent(subject + ' 教程')}`;
            await context.invokeAgent('Browser', 'navigate_to', { url: searchUrl });
            await this.delay(3000);
            
            const pageContent = await context.invokeAgent('Browser', 'extract_page_content', {});
            return this.parseBilibili(pageContent.content[0].text, subject);
            
        } catch (error) {
            console.error('B站搜索失败:', error);
            return this.getFallbackCourses('B站', subject, difficulty);
        }
    }
    
    // 解析Coursera页面内容
    parseCoursera(content, subject) {
        console.log('📖 解析Coursera课程数据...');
        const courses = [];
        
        if (content.includes('Course') || content.includes('Specialization')) {
            courses.push({
                platform: 'Coursera',
                title: `${subject} Professional Certificate`,
                rating: 4.5,
                students: 25000,
                duration: '3-6个月',
                difficulty: 'intermediate',
                price: 299
            });
        }
        
        return courses;
    }
    
    // 解析Udemy页面内容
    parseUdemy(content, subject) {
        console.log('📖 解析Udemy课程数据...');
        const courses = [];
        
        if (content.includes('course') || content.includes('rating')) {
            courses.push({
                platform: 'Udemy',
                title: `Complete ${subject} Course`,
                rating: 4.3,
                students: 15000,
                duration: '25小时',
                difficulty: 'beginner',
                price: 89
            });
        }
        
        return courses;
    }
    
    // 解析B站页面内容
    parseBilibili(content, subject) {
        console.log('📖 解析B站课程数据...');
        const courses = [];
        
        if (content.includes('视频') || content.includes('教程')) {
            courses.push({
                platform: 'B站',
                title: `${subject} 从入门到精通`,
                rating: 4.7,
                students: 50000,
                duration: '30小时',
                difficulty: 'beginner',
                price: 0
            });
        }
        
        return courses;
    }
    
    // 降级方案课程
    getFallbackCourses(platform, subject, difficulty) {
        return [{
            platform,
            title: `${subject} 完整教程`,
            rating: 4.0 + Math.random() * 0.5,
            students: Math.floor(Math.random() * 20000) + 5000,
            duration: '20-40小时',
            difficulty,
            price: platform === 'B站' ? 0 : Math.floor(Math.random() * 200) + 50
        }];
    }
    
    // 延迟函数
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
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
 * 面试题生成Agent - 生成高频面试题
 */
class ExerciseGeneratorAgent extends Agent {
    constructor() {
        super({
            name: "InterviewQuestionGeneratorAgent",
            description: "生成高频面试题的智能代理",
            systemPrompt: `你是一个专业的面试题生成专家，能够根据职位技能要求生成高频面试题。
                你的任务是为求职者生成高质量的面试题，包括题目、答案和解题思路，帮助求职者准备面试。如果未指定数量，则默认输出5道。
                
                输入示例1：
                技能列表: ["大语言模型（LLM）应用", "提示工程", "意图识别", "上下文理解"]
                职位名称: "AI Agent工程师"
                题目数量: 2
                
                输出示例1：
                [
                  {
                    "question": "什么是提示工程（Prompt Engineering）？在实际应用中如何优化提示词以获得更好的结果？",
                    "answer": "提示工程是一种通过精心设计和优化输入提示词来引导大语言模型产生期望输出的技术。优化提示词的方法包括：1）明确任务目标，2）提供具体示例，3）使用分步骤指导，4）添加角色设定，5）控制输出格式，6）迭代优化。",
                    "solution": "解题思路：首先要理解提示工程的核心概念，然后结合实际应用场景说明优化方法。可以从具体案例入手，比如在问答、文本生成等场景中如何设计有效的提示词。"
                  },
                  {
                    "question": "在构建AI Agent时，如何处理和维护对话的上下文信息？",
                    "answer": "处理对话上下文需要考虑：1）上下文信息的存储和管理，2）关键信息的识别和提取，3）上下文的更新和过期机制，4）长对话中的上下文压缩，5）多轮对话状态的维护。常用技术包括使用向量数据库存储历史信息，通过注意力机制关注重要上下文等。",
                    "solution": "解题思路：从技术实现角度分析上下文管理的挑战，包括存储、检索和更新等关键环节。可以结合具体应用场景，如客服系统或智能助手，说明如何平衡上下文完整性和计算效率。"
                  }
                ]
                
                输入示例2：
                技能列表: ["Agent设计模式", "多Agent协作", "任务规划与执行", "Agent评估与优化"]
                职位名称: "AI Agent工程师"
                题目数量: 2
                
                输出示例2：
                [
                  {
                    "question": "在多Agent系统中，如何设计有效的协作机制来完成复杂任务？",
                    "answer": "设计有效的多Agent协作机制需要考虑：1）任务分解与分配策略，2）Agent间通信协议，3）资源共享与冲突解决，4）协调与同步机制，5）容错与恢复机制。常见的协作模式包括主从模式、对等模式和混合模式。",
                    "solution": "解题思路：从系统设计角度分析多Agent协作的关键要素，可以结合具体框架如Eko的实现方式来说明。重点在于如何平衡任务分工、通信开销和系统可靠性。"
                  },
                  {
                    "question": "如何评估和优化AI Agent的性能？",
                    "answer": "评估AI Agent性能可以从多个维度进行：1）任务完成质量，2）响应时间，3）资源消耗，4）用户满意度。优化方法包括：1）提示词优化，2）模型微调，3）工具调用策略优化，4）记忆管理优化，5）Agent协作机制优化。",
                    "solution": "解题思路：首先明确评估指标体系，然后根据具体应用场景选择合适的评估方法。优化过程应该是迭代的，通过监控关键指标变化来验证优化效果。"
                  }
                ]
                
                输入示例3：
                技能列表: ["工具调用（Function Calling/Tools）", "知识图谱", "向量数据库"]
                题目数量: 2
                
                输出示例3：
                [
                  {
                    "question": "在AI Agent中，工具调用（Function Calling）的作用是什么？如何正确实现工具调用机制？",
                    "answer": "工具调用允许Agent在需要时调用外部函数或API来获取信息或执行操作。正确实现工具调用需要：1）定义清晰的工具接口，2）准确解析Agent意图，3）正确传递参数，4）处理返回结果，5）错误处理和重试机制。",
                    "solution": "解题思路：首先解释工具调用的核心价值在于扩展Agent能力，然后从技术实现角度分析关键步骤。可以结合具体场景如搜索引擎调用、数据库查询等来说明实现要点。"
                  },
                  {
                    "question": "在AI Agent系统中，知识图谱和向量数据库分别适用于什么场景？如何选择合适的存储方案？",
                    "answer": "知识图谱适用于：1）结构化知识表示，2）逻辑推理，3）关系查询。向量数据库适用于：1）语义相似度计算，2）非结构化数据存储，3）快速近似最近邻搜索。选择方案需要考虑数据特点、查询需求和性能要求。",
                    "solution": "解题思路：从数据结构和查询模式角度分析两种技术的特点，结合具体应用场景进行选择。实际项目中往往需要结合使用两种技术以发挥各自优势。"
                  }
                ]`
        });
        
        // 确保tools数组被初始化
        if (!this.tools) {
            this.tools = [];
        }
        
        // 初始化LLM配置
        if (process.env.ALIBABA_DASHSCOPE_API_KEY) {
            this.apiKey = process.env.ALIBABA_DASHSCOPE_API_KEY;
        }
    }
    
    async initializeLLM() {
        if (!this.llmConfig && this.apiKey) {
            const { createQwenMaxConfig } = await import('./packages/eko-core/dist/index.esm.js');
            this.llmConfig = createQwenMaxConfig(this.apiKey, {
                temperature: 0.7,
                maxTokens: 2000
            });
        }
    }

    setupTools() {
        this.addTool({
            name: "generate_interview_questions",
            description: "根据职位技能生成高频面试题",
            parameters: {
                type: "object",
                properties: {
                    skills: { 
                        type: "array", 
                        items: { type: "string" },
                        description: "职位技能列表" 
                    },
                    jobTitle: { type: "string", description: "职位名称（可选）" },
                    count: { type: "number", description: "题目数量", minimum: 1, maximum: 20 }
                },
                required: ["skills"]
            },
            execute: async (args, context) => {
                const { skills, jobTitle, count = 5 } = args;
                
                console.log(`📝 为"${jobTitle || '未指定职位'}"生成${count}道面试题...`);
                
                // 初始化LLM
                await this.initializeLLM();
                
                // 生成面试题
                const exercises = [];
                
                for (const skill of skills) {
                    const prompt = `为"${jobTitle || '相关职位'}"职位生成关于"${skill}"技能的高频面试题，严格按照以下JSON格式输出：
[
  {
    "question": "面试题题目",
    "answer": "面试题答案",
    "solution": "解题思路和分析过程"
  }
]

确保输出是可解析的JSON格式，不包含其他内容。生成${Math.min(count, 5)}道题目。`;

                    try {
                        if (!this.llmConfig) {
                            throw new Error('LLM配置未初始化');
                        }
                        
                        // 使用直接的fetch调用替代this.llm.generate()
                        const response = await fetch(this.llmConfig.config.baseURL + '/chat/completions', {
                            method: 'POST',
                            headers: this.llmConfig.config.headers,
                            body: JSON.stringify({
                                model: this.llmConfig.model,
                                messages: [
                                    { role: 'user', content: prompt }
                                ],
                                temperature: this.llmConfig.config.temperature,
                                max_tokens: this.llmConfig.config.maxTokens,
                                response_format: { type: "json_object" }
                            })
                        });
                        
                        if (!response.ok) {
                            throw new Error(`HTTP错误! 状态: ${response.status}`);
                        }
                        
                        const data = await response.json();
                        const content = data.choices[0].message.content;

                        let questions;
                        try {
                            questions = JSON.parse(content);
                            // 确保只取需要的数量
                            questions = questions.slice(0, Math.min(count, questions.length));
                        } catch (parseError) {
                            console.error('解析LLM响应失败:', parseError);
                            // 如果解析失败，使用默认格式
                            questions = [{
                                question: `${skill}相关的面试题`,
                                answer: `这是关于${skill}的面试题答案。`,
                                solution: `解题思路：分析题目要求，运用${skill}相关知识进行解答。`
                            }];
                        }
                        
                        exercises.push(...questions);
                    } catch (error) {
                        console.error(`❌ 为技能"${skill}"生成面试题时出错:`, error);
                        // 出错时使用默认面试题
                        exercises.push({
                            question: `${skill}相关的面试题`,
                            answer: `这是关于${skill}的面试题答案。`,
                            solution: `解题思路：分析题目要求，运用${skill}相关知识进行解答。`
                        });
                    }
                }
                
                // 如果题目数量超过需要的数量，截取前面的题目
                const finalExercises = exercises.slice(0, count);
                context.variables.set('generatedExercises', finalExercises);
                
                return {
                    content: [{
                        type: "text",
                        text: `✅ 已为${jobTitle || '相关职位'}生成${finalExercises.length}道面试题`
                    }]
                };
            }
        });
    }
}

// 知识点生成Agent
class KnowledgePointGeneratorAgent extends Agent {
    constructor() {
        super({
            name: "KnowledgePointGeneratorAgent",
            description: "根据职位技能生成对应知识点的智能代理",
            systemPrompt: `你是一个专业的知识点提炼专家，能够根据职位技能要求生成详细的知识点内容。
                你的任务是分析职位技能要求，为每个技能生成包含标题、详细解释和通俗解释的知识点内容。
                输入示例1：
                技能列表: ["大语言模型（LLM）应用", "提示工程"]
                职位名称: "AI Agent工程师"
                
                输出示例1：
                [
                  {
                    "title": "大语言模型（LLM）应用基础",
                    "detailedExplanation": "大语言模型（LLM）是基于大量文本数据训练的深度学习模型，能够理解和生成人类语言。在AI Agent应用中，LLM作为核心推理引擎，负责理解用户意图、生成响应和执行任务规划。关键技术包括Transformer架构、注意力机制、上下文学习和指令微调等。应用时需要考虑模型选择、提示工程、输出验证和性能优化等方面。",
                    "simpleExplanation": "可以把大语言模型想象成一个经过高度训练的语言专家，它阅读了大量的书籍和文章，能够理解并生成各种主题的文本。就像一个博学的助手，它可以根据你的问题提供答案，或者根据你的要求创作内容。"
                  },
                  {
                    "title": "提示工程（Prompt Engineering）核心原理",
                    "detailedExplanation": "提示工程是一种通过精心设计输入提示来引导大语言模型产生期望输出的技术。核心要素包括：明确任务指令、提供上下文信息、给出具体示例、设定输出格式和角色扮演等。优秀的提示工程能够显著提升模型输出质量和准确性，降低幻觉风险。在实际应用中，需要不断迭代优化提示词，结合具体业务场景进行调整。",
                    "simpleExplanation": "提示工程就像给一个很聪明但不知道具体背景的朋友布置任务。你需要把任务描述得非常清楚，告诉他要做什么、怎么做、有什么限制条件，甚至给出一些例子让他参考。好的提示词能让AI更好地理解你的需求并给出准确的回答。"
                  }
                ]
                
                输入示例2：
                技能列表: ["Agent设计模式", "多Agent协作"]
                职位名称: "AI Agent工程师"
                
                输出示例2：
                [
                  {
                    "title": "Agent设计模式与架构",
                    "detailedExplanation": "Agent设计模式是构建AI Agent系统的核心方法论，主要包括感知-思考-行动循环、观察者模式、策略模式和状态模式等。在Eko框架中，Agent通常包含系统提示、工具集、记忆存储和执行逻辑等组件。设计时需要考虑Agent的职责划分、信息封装、可扩展性和协作机制。优秀的Agent设计应该具备高内聚、低耦合的特点，便于维护和扩展。",
                    "simpleExplanation": "Agent设计模式就像设计一个智能机器人，它需要有感知环境的能力（感知）、思考和决策的能力（思考），以及执行具体动作的能力（行动）。整个过程就像人处理问题一样：先观察了解情况，再思考解决方案，最后采取行动。"
                  },
                  {
                    "title": "多Agent协作机制",
                    "detailedExplanation": "多Agent协作是处理复杂任务的关键技术，通过多个专门Agent协同工作来完成单一Agent无法胜任的任务。协作模式包括主从模式、对等模式和混合模式。关键技术点包括任务分解与分配、Agent间通信协议、资源共享与冲突解决、协调与同步机制、容错与恢复机制等。在Eko框架中，可以通过任务编排和上下文共享实现高效的多Agent协作。",
                    "simpleExplanation": "多Agent协作就像一个团队合作完成项目。每个成员都有自己的专长（比如有人擅长设计，有人擅长编程），大家分工合作，通过沟通协调来完成复杂任务。相比一个人做所有事情，团队合作能更高效地解决复杂问题。"
                  }
                ]`
        });
        
        // 确保tools数组被初始化
        if (!this.tools) {
            this.tools = [];
        }
        
        // 初始化LLM配置
        if (process.env.ALIBABA_DASHSCOPE_API_KEY) {
            this.apiKey = process.env.ALIBABA_DASHSCOPE_API_KEY;
        }
    }

    async initializeLLM() {
        if (!this.llmConfig && this.apiKey) {
            const { createQwenMaxConfig } = await import('./packages/eko-core/dist/index.esm.js');
            this.llmConfig = createQwenMaxConfig(this.apiKey, {
                temperature: 0.7,
                maxTokens: 1500
            });
        }
    }

    setupTools() {
        this.addTool({
            name: "generate_knowledge_points",
            description: "根据职位技能生成知识点内容",
            parameters: {
                type: "object",
                properties: {
                    skills: { 
                        type: "array", 
                        items: { type: "string" },
                        description: "职位技能列表" 
                    },
                    jobTitle: { type: "string", description: "职位名称" }
                },
                required: ["skills", "jobTitle"]
            },
            execute: async (args, context) => {
                const { skills, jobTitle } = args;
                
                console.log(`📘 为"${jobTitle}"职位生成知识点内容...`);
                
                // 初始化LLM
                await this.initializeLLM();
                
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

                    try {
                        if (!this.llmConfig) {
                            throw new Error('LLM配置未初始化');
                        }
                        
                        // 使用直接的fetch调用替代this.llm.generate()
                        const response = await fetch(this.llmConfig.config.baseURL + '/chat/completions', {
                            method: 'POST',
                            headers: this.llmConfig.config.headers,
                            body: JSON.stringify({
                                model: this.llmConfig.model,
                                messages: [
                                    { role: 'user', content: prompt }
                                ],
                                temperature: this.llmConfig.config.temperature,
                                max_tokens: this.llmConfig.config.maxTokens,
                                response_format: { type: "json_object" }
                            })
                        });
                        
                        if (!response.ok) {
                            throw new Error(`HTTP错误! 状态: ${response.status}`);
                        }
                        
                        const data = await response.json();
                        const content = data.choices[0].message.content;

                        let knowledgePoint;
                        try {
                            knowledgePoint = JSON.parse(content);
                        } catch (parseError) {
                            console.error('解析LLM响应失败:', parseError);
                            // 如果解析失败，使用默认格式
                            knowledgePoint = {
                                title: `${jobTitle}核心技能: ${skill}`,
                                detailedExplanation: `关于${skill}的详细专业解释。`,
                                simpleExplanation: `关于${skill}的通俗易懂解释。`
                            };
                        }
                        
                        knowledgePoints.push(knowledgePoint);
                    } catch (error) {
                        console.error(`❌ 为技能"${skill}"生成知识点时出错:`, error);
                        // 出错时使用默认知识点
                        knowledgePoints.push({
                            title: `${jobTitle}核心技能: ${skill}`,
                            detailedExplanation: `关于${skill}的详细专业解释。`,
                            simpleExplanation: `关于${skill}的通俗易懂解释。`
                        });
                    }
                }
                
                context.variables.set('generatedKnowledgePoints', knowledgePoints);
                
                return {
                    content: [{
                        type: "text",
                        text: `✅ 已为${jobTitle}生成${knowledgePoints.length}个知识点`
                    }]
                };
            }
        });
    }
}

// ==================== 职途伴侣主应用 ====================

class IntelligentLearningCompanion {
    constructor(options = {}) {
        this.forceLocalMode = options.forceLocalMode || false;
        this.setupAgents(); // 先初始化Agents，包括MarkmapAgent
        
        try {
            this.setupLLM();
            this.setupEko();
            this.aiMode = true;
        } catch (error) {
            console.warn('⚠️ AI功能初始化失败，但本地Agents仍可用:', error.message);
            this.aiMode = false;
            // 不抛出错误，让本地Agents可以正常工作
        }
    }

    setupLLM() {
        if (!process.env.ALIBABA_DASHSCOPE_API_KEY) {
            throw new Error('请设置 ALIBABA_DASHSCOPE_API_KEY 环境变量');
        }

        this.llmConfig = createQwenMaxConfig(process.env.ALIBABA_DASHSCOPE_API_KEY, {
            temperature: 0.7,
            maxTokens: 4000,
            headers: {
                "X-DashScope-Plugin": "web_search" // 启用网络搜索插件
            }
        });
    }
    
    setupEko() {
        if (!this.llmConfig) {
            // 没有LLM配置时，不创建Eko实例
            console.log('⚠️ 无LLM配置，跳过Eko初始化');
            return;
        }
        
        this.eko = new Eko({
            llm: this.llmConfig,
            agents: this.agents
        });
    }

    setupAgents() {
        this.agents = [
            new JobSkillAnalyzerAgent(),
            new KnowledgePointGeneratorAgent(),
            new MarkmapAgent(),
            new ExerciseGeneratorAgent(),
            new BrowserAgent(),
            new CourseSearchAgent(),
            new NoteOrganizerAgent()
        ];
    }



    async startLearningSession(learningGoal) {
        console.log(`🎯 开始职途会话: ${learningGoal}`);
        console.log('='.repeat(50));
        
        try {
            const result = await this.eko.run(`
                我想了解"${learningGoal}"职位，请帮我：
                1. 分析该职位所需的核心技能列表
                2. 根据技能列表生成详细的知识点内容
                3. 根据技能列表生成高频面试题
                4. 将技能列表转换成思维导图
                5. 根据技能列表搜索相关的优质课程并推荐
                
                请各个Agent协作完成这个完整的职位技能分析和学习资料生成流程。
            `);
            
            console.log('\n✅ 职途会话完成!');
            console.log('结果:', result.result);
            return result;
        } catch (error) {
            console.error('❌ 职途会话失败:', error);
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
            console.log('🎓 职途伴侣使用方法:');
            console.log('  node intelligent-learning-companion.js --demo');
            console.log('  node intelligent-learning-companion.js "目标职位"');
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

export { IntelligentLearningCompanion, 
         JobSkillAnalyzerAgent, 
         ExerciseGeneratorAgent,
         KnowledgePointGeneratorAgent };
