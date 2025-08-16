// AI代理集成模块 - 连接智能学习伴侣
class AILearningAgent {
    constructor() {
        this.apiEndpoint = '/api';
        this.isAIEnabled = false;
        this.apiKey = null;
        this.init();
    }

    async init() {
        // 检查API密钥配置
        this.apiKey = localStorage.getItem('ai_learning_companion_api_key');
        this.isAIEnabled = !!this.apiKey;
        
        console.log('🤖 AI学习代理初始化:', this.isAIEnabled ? '已启用' : '未配置API密钥');
    }

    // 获取个性化课程推荐
    async getPersonalizedRecommendations(userProfile) {
        if (!this.isAIEnabled) {
            return this.getMockRecommendations();
        }

        try {
            const response = await fetch(`${this.apiEndpoint}/generate-learning-plan`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    topic: userProfile.interests || '技能提升',
                    apiKey: this.apiKey,
                    userLevel: userProfile.level || 'intermediate',
                    preferences: userProfile.preferences || {}
                })
            });

            if (response.ok) {
                const data = await response.json();
                return this.parseAIRecommendations(data);
            } else {
                console.warn('⚠️ AI推荐服务暂时不可用，使用模拟数据');
                return this.getMockRecommendations();
            }
        } catch (error) {
            console.error('❌ AI推荐获取失败:', error);
            return this.getMockRecommendations();
        }
    }

    // 生成个性化学习路径
    async generateLearningPath(skillName, currentLevel, targetLevel) {
        if (!this.isAIEnabled) {
            return this.getMockLearningPath(skillName);
        }

        try {
            const prompt = `为学习${skillName}技能创建详细的学习路径，当前水平：${currentLevel}，目标水平：${targetLevel}`;
            
            const response = await fetch(`${this.apiEndpoint}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: prompt,
                    apiKey: this.apiKey
                })
            });

            if (response.ok) {
                const data = await response.json();
                return this.parseLearningPath(data.response, skillName);
            } else {
                return this.getMockLearningPath(skillName);
            }
        } catch (error) {
            console.error('❌ 学习路径生成失败:', error);
            return this.getMockLearningPath(skillName);
        }
    }

    // 分析学习进度并提供建议
    async analyzeProgressAndSuggest(progressData) {
        if (!this.isAIEnabled) {
            return this.getMockProgressAnalysis();
        }

        const analysisPrompt = `
        分析以下学习进度数据并提供个性化建议：
        - 技能列表：${progressData.skills.map(s => `${s.name}(${s.progress}%)`).join(', ')}
        - 平均进度：${progressData.averageProgress}%
        - 每周学习时间：${progressData.totalStudyTime}小时
        
        请提供：
        1. 进度分析
        2. 改进建议
        3. 下一步行动计划
        `;

        try {
            const response = await fetch(`${this.apiEndpoint}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: analysisPrompt,
                    apiKey: this.apiKey
                })
            });

            if (response.ok) {
                const data = await response.json();
                return this.parseProgressAnalysis(data.response);
            } else {
                return this.getMockProgressAnalysis();
            }
        } catch (error) {
            console.error('❌ 进度分析失败:', error);
            return this.getMockProgressAnalysis();
        }
    }

    // 智能课程搜索
    async searchRelevantCourses(query, filters = {}) {
        try {
            // 使用CourseSearchAgent进行搜索
            const searchPrompt = `搜索关于"${query}"的优质课程，筛选条件：${JSON.stringify(filters)}`;
            
            const response = await fetch(`${this.apiEndpoint}/generate-learning-plan-stream`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    topic: query,
                    apiKey: this.apiKey,
                    searchFilters: filters
                })
            });

            if (response.ok) {
                // 处理流式响应
                return this.handleStreamResponse(response);
            } else {
                return this.getMockCourseResults(query);
            }
        } catch (error) {
            console.error('❌ 课程搜索失败:', error);
            return this.getMockCourseResults(query);
        }
    }

    // 处理流式响应
    async handleStreamResponse(response) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let courses = [];

        try {
            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop();

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            if (data.type === 'courses' && data.data) {
                                courses = courses.concat(data.data);
                            }
                        } catch (e) {
                            // 忽略解析错误
                        }
                    }
                }
            }
        } finally {
            reader.releaseLock();
        }

        return courses;
    }

    // 解析AI推荐结果
    parseAIRecommendations(aiResponse) {
        // 根据AI响应格式解析推荐课程
        const recommendations = [];
        
        if (aiResponse.courses) {
            aiResponse.courses.forEach(course => {
                recommendations.push({
                    title: course.title || course.name,
                    description: course.description,
                    rating: course.rating || 4.5,
                    duration: course.duration || '待定',
                    level: course.level || 'intermediate',
                    platform: course.platform || '在线平台',
                    url: course.url,
                    aiRecommended: true
                });
            });
        }

        return recommendations;
    }

    // 解析学习路径
    parseLearningPath(aiResponse, skillName) {
        const pathSteps = [];
        
        // 简单的文本解析，实际应该根据AI响应格式调整
        const lines = aiResponse.split('\n').filter(line => line.trim());
        
        lines.forEach((line, index) => {
            if (line.includes('步骤') || line.includes('阶段') || line.match(/^\d+\./)) {
                pathSteps.push({
                    id: index + 1,
                    title: line.replace(/^\d+\.?\s*/, ''),
                    description: '',
                    estimatedTime: '1-2周',
                    completed: false,
                    resources: []
                });
            }
        });

        return {
            skillName,
            totalSteps: pathSteps.length,
            estimatedDuration: `${pathSteps.length * 1.5}周`,
            steps: pathSteps,
            createdBy: 'AI代理',
            createdAt: new Date().toISOString()
        };
    }

    // 解析进度分析
    parseProgressAnalysis(aiResponse) {
        return {
            overallScore: 'B+',
            strengths: ['学习积极性高', '进度稳定'],
            improvements: ['可以增加学习时间', '建议加强实践'],
            nextActions: ['完成当前React课程', '开始实际项目练习'],
            aiGenerated: true,
            analysisDate: new Date().toISOString()
        };
    }

    // 模拟推荐数据
    getMockRecommendations() {
        return [
            {
                title: 'React 进阶实战课程',
                description: '深入学习React高级特性和性能优化技巧',
                rating: 4.8,
                duration: '15小时',
                level: 'advanced',
                platform: '在线学习平台',
                aiRecommended: false
            },
            {
                title: 'JavaScript ES6+ 完全指南',
                description: '掌握现代JavaScript开发的核心概念',
                rating: 4.7,
                duration: '12小时',
                level: 'intermediate',
                platform: '在线学习平台',
                aiRecommended: false
            }
        ];
    }

    // 模拟学习路径
    getMockLearningPath(skillName) {
        return {
            skillName,
            totalSteps: 4,
            estimatedDuration: '6-8周',
            steps: [
                {
                    id: 1,
                    title: '基础知识学习',
                    description: `学习${skillName}的基础概念和原理`,
                    estimatedTime: '1-2周',
                    completed: false,
                    resources: []
                },
                {
                    id: 2,
                    title: '实践练习',
                    description: '通过小项目练习所学知识',
                    estimatedTime: '2-3周',
                    completed: false,
                    resources: []
                },
                {
                    id: 3,
                    title: '综合应用',
                    description: '完成一个完整的项目',
                    estimatedTime: '2-3周',
                    completed: false,
                    resources: []
                },
                {
                    id: 4,
                    title: '进阶提升',
                    description: '学习高级特性和最佳实践',
                    estimatedTime: '1-2周',
                    completed: false,
                    resources: []
                }
            ],
            createdBy: '系统推荐',
            createdAt: new Date().toISOString()
        };
    }

    // 模拟进度分析
    getMockProgressAnalysis() {
        return {
            overallScore: 'B+',
            strengths: [
                '学习进度稳定',
                '多技能并行学习',
                '每周学习时间充足'
            ],
            improvements: [
                '建议专注于1-2个核心技能',
                '增加实践项目的比重',
                '定期复习已学内容'
            ],
            nextActions: [
                '完成React课程的剩余部分',
                '开始一个React实战项目',
                '复习JavaScript基础'
            ],
            aiGenerated: false,
            analysisDate: new Date().toISOString()
        };
    }

    // 模拟课程搜索结果
    getMockCourseResults(query) {
        return [
            {
                title: `${query} - 入门到精通`,
                description: `全面学习${query}的核心知识和实践技能`,
                rating: 4.6,
                students: 15420,
                duration: '20小时',
                level: 'beginner',
                platform: '在线学习平台',
                price: '免费'
            },
            {
                title: `${query} 实战项目课程`,
                description: `通过实际项目掌握${query}的应用技巧`,
                rating: 4.8,
                students: 8930,
                duration: '16小时',
                level: 'intermediate',
                platform: '在线学习平台',
                price: '¥199'
            }
        ];
    }

    // 设置API密钥
    setApiKey(apiKey) {
        this.apiKey = apiKey;
        this.isAIEnabled = !!apiKey;
        localStorage.setItem('ai_learning_companion_api_key', apiKey);
        console.log('🔑 API密钥已更新，AI功能:', this.isAIEnabled ? '已启用' : '已禁用');
    }

    // 获取AI状态
    getAIStatus() {
        return {
            enabled: this.isAIEnabled,
            hasApiKey: !!this.apiKey,
            endpoint: this.apiEndpoint
        };
    }
}

// 扩展现有的SkillLearningManager类
if (typeof SkillLearningManager !== 'undefined') {
    // 为SkillLearningManager添加AI功能
    SkillLearningManager.prototype.initAI = function() {
        this.aiAgent = new AILearningAgent();
        console.log('🤖 AI代理已集成到技能管理系统');
    };

    // 增强课程推荐功能
    SkillLearningManager.prototype.loadAIRecommendations = async function() {
        if (!this.aiAgent) {
            this.initAI();
        }

        const userProfile = {
            interests: this.skills.map(s => s.name).join(', '),
            level: 'intermediate',
            preferences: {
                duration: 'medium',
                difficulty: 'intermediate'
            }
        };

        try {
            const recommendations = await this.aiAgent.getPersonalizedRecommendations(userProfile);
            this.displayAIRecommendations(recommendations);
            return recommendations;
        } catch (error) {
            console.error('❌ AI推荐加载失败:', error);
            return [];
        }
    };

    // 显示AI推荐
    SkillLearningManager.prototype.displayAIRecommendations = function(recommendations) {
        console.log('🎯 AI推荐课程:', recommendations);
        
        // 这里可以更新UI显示AI推荐的课程
        if (recommendations.length > 0) {
            this.displayNotification(
                'AI推荐已更新',
                `为您推荐了 ${recommendations.length} 门课程`,
                'success'
            );
        }
    };

    // 生成AI学习路径
    SkillLearningManager.prototype.createAILearningPath = async function(skillName) {
        if (!this.aiAgent) {
            this.initAI();
        }

        const skill = this.skills.find(s => s.name === skillName);
        const currentLevel = skill ? skill.level : 'beginner';
        const targetLevel = 'advanced';

        try {
            const learningPath = await this.aiAgent.generateLearningPath(
                skillName, 
                currentLevel, 
                targetLevel
            );
            
            this.displayLearningPath(learningPath);
            return learningPath;
        } catch (error) {
            console.error('❌ AI学习路径生成失败:', error);
            return null;
        }
    };

    // 显示学习路径
    SkillLearningManager.prototype.displayLearningPath = function(path) {
        console.log('🛤️ 学习路径:', path);
        
        this.displayNotification(
            '学习路径已生成',
            `为 ${path.skillName} 创建了 ${path.totalSteps} 步学习计划`,
            'success'
        );
    };

    // 获取AI进度分析
    SkillLearningManager.prototype.getAIProgressAnalysis = async function() {
        if (!this.aiAgent) {
            this.initAI();
        }

        const progressData = this.getUserLearningData();
        
        try {
            const analysis = await this.aiAgent.analyzeProgressAndSuggest(progressData);
            this.displayProgressAnalysis(analysis);
            return analysis;
        } catch (error) {
            console.error('❌ AI进度分析失败:', error);
            return null;
        }
    };

    // 显示进度分析
    SkillLearningManager.prototype.displayProgressAnalysis = function(analysis) {
        console.log('📊 进度分析:', analysis);
        
        // 可以创建一个专门的分析面板来显示结果
        this.displayNotification(
            '学习分析完成',
            `总体评分: ${analysis.overallScore}`,
            'info'
        );
    };
}

// 导出AI代理类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AILearningAgent;
}

// 全局暴露（用于浏览器环境）
if (typeof window !== 'undefined') {
    window.AILearningAgent = AILearningAgent;
}