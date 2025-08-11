/**
 * Markmap Agent - 思维导图生成代理
 * 将学习内容转换为可视化的思维导图
 */

import { Agent } from './packages/eko-core/dist/index.esm.js';
import { SimpleHttpMcpClient } from './packages/eko-core/dist/index.esm.js';

export class MarkmapAgent extends Agent {
    constructor() {
        super({
            name: "MarkmapAgent",
            description: "专业的思维导图生成Agent，将学习内容转换为可视化的Markmap思维导图",
            tools: [],
            planDescription: "思维导图专家，擅长将复杂的学习内容结构化为可视化的思维导图",
            mcpClient: new SimpleHttpMcpClient(
                "https://modelscope.cn/mcp/servers/jinzcdev/Markmap",
                "IntelligentLearningCompanion",
                {
                    'User-Agent': 'Eko-Learning-Companion/1.0',
                    'Content-Type': 'application/json'
                }
            )
        });
        this.setupTools();
    }

    setupTools() {
        this.addTool({
            name: "create_mindmap",
            description: "将学习大纲或结构化内容转换为思维导图",
            parameters: {
                type: "object",
                properties: {
                    content: { 
                        type: "string", 
                        description: "要转换为思维导图的Markdown格式内容" 
                    },
                    title: { 
                        type: "string", 
                        description: "思维导图的标题" 
                    },
                    theme: {
                        type: "string",
                        enum: ["default", "colorful", "dark"],
                        description: "思维导图主题样式",
                        default: "colorful"
                    }
                },
                required: ["content", "title"]
            },
            execute: async (args, context) => {
                const { content, title, theme = "colorful" } = args;
                
                console.log(`🧠 MarkmapAgent正在为"${title}"生成思维导图...`);
                
                try {
                    // 调用MCP服务生成思维导图
                    const mindmapResult = await this.mcpClient.callTool({
                        name: "generate_markmap",
                        arguments: {
                            markdown: content,
                            title: title,
                            options: {
                                theme: theme,
                                colorFreezeLevel: 2,
                                maxWidth: 300,
                                duration: 500
                            }
                        }
                    });
                    
                    console.log(`✅ 思维导图生成成功: ${title}`);
                    
                    // 存储生成的思维导图数据
                    context.variables.set('mindmapData', mindmapResult);
                    context.variables.set('mindmapTitle', title);
                    context.variables.set('mindmapTheme', theme);
                    
                    return mindmapResult;
                    
                } catch (error) {
                    console.error(`❌ 思维导图生成失败:`, error);
                    
                    // 降级方案：生成基础的思维导图数据结构
                    const fallbackMindmap = this.generateFallbackMindmap(content, title);
                    context.variables.set('mindmapData', fallbackMindmap);
                    context.variables.set('mindmapTitle', title);
                    
                    return fallbackMindmap;
                }
            }
        });

        this.addTool({
            name: "enhance_study_plan_mindmap",
            description: "为学习计划生成专门的思维导图",
            parameters: {
                type: "object",
                properties: {
                    studyPlan: {
                        type: "object",
                        description: "学习计划对象，包含目标、时间框架和阶段"
                    },
                    subject: {
                        type: "string", 
                        description: "学习主题"
                    }
                },
                required: ["studyPlan", "subject"]
            },
            execute: async (args, context) => {
                const { studyPlan, subject } = args;
                
                console.log(`📋 为${subject}学习计划生成思维导图...`);
                
                // 将学习计划转换为Markdown格式
                const markdownContent = this.convertStudyPlanToMarkdown(studyPlan, subject);
                
                // 调用思维导图生成工具
                return await this.tools.find(tool => tool.name === 'create_mindmap')
                    .execute({
                        content: markdownContent,
                        title: `${subject} 学习计划`,
                        theme: "colorful"
                    }, context);
            }
        });
    }

    /**
     * 将学习计划转换为Markdown格式
     */
    convertStudyPlanToMarkdown(studyPlan, subject) {
        let markdown = `# ${subject} 学习计划\n\n`;
        
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

    /**
     * 生成降级方案的思维导图数据
     */
    generateFallbackMindmap(content, title) {
        return {
            type: 'mindmap',
            title: title,
            content: content,
            data: {
                name: title,
                children: this.parseMarkdownToTree(content)
            },
            html: `<div class="fallback-mindmap">
                <h3>${title}</h3>
                <div class="mindmap-content">${content.replace(/\n/g, '<br>')}</div>
            </div>`,
            isFallback: true
        };
    }

    /**
     * 将Markdown内容解析为树形结构
     */
    parseMarkdownToTree(markdown) {
        const lines = markdown.split('\n').filter(line => line.trim());
        const tree = [];
        let currentNode = null;
        let currentLevel = 0;

        for (const line of lines) {
            const level = this.getMarkdownLevel(line);
            const text = line.replace(/^#+\s*/, '').trim();
            
            if (!text) continue;

            const node = {
                name: text,
                children: []
            };

            if (level === 1) {
                tree.push(node);
                currentNode = node;
                currentLevel = 1;
            } else if (level > currentLevel && currentNode) {
                currentNode.children.push(node);
            } else {
                tree.push(node);
                currentNode = node;
                currentLevel = level;
            }
        }

        return tree;
    }

    /**
     * 获取Markdown标题级别
     */
    getMarkdownLevel(line) {
        const match = line.match(/^(#+)/);
        return match ? match[1].length : 0;
    }
}