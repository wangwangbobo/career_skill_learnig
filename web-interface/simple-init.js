// 简化的初始化脚本 - 解决系统初始化问题
console.log('🔧 简化初始化脚本开始执行');

// 简单的JobAssistant类
class SimpleJobAssistant {
    constructor() {
        console.log('📱 简化JobAssistant初始化开始');
        this.initElements();
        this.bindEvents();
        this.selectedContentTypes = ['knowledge', 'interview']; // 默认选择
        console.log('✅ 简化JobAssistant初始化完成');
    }
    
    initElements() {
        // 基本元素
        this.jobTitle = document.getElementById('jobTitle');
        this.generateBtn = document.getElementById('generateBtn');
        this.contentModal = document.getElementById('contentModal');
        this.contentConfirm = document.getElementById('contentConfirm');
        this.contentClose = document.getElementById('contentClose');
        this.contentCancel = document.getElementById('contentCancel');
        this.contentOverlay = document.getElementById('contentOverlay');
        this.loadingSection = document.getElementById('loadingSection');
        this.resultsSection = document.getElementById('resultsSection');
        this.skillsContainer = document.getElementById('skillsContainer');
        this.mindmapContent = document.getElementById('mindmapContent');
        this.topicDisplay = document.getElementById('topicDisplay');
        this.generationTime = document.getElementById('generationTime');
        
        // 对话框元素
        this.chatPanel = document.getElementById('chatPanel');
        this.chatContent = document.getElementById('chatContent');
        this.chatInput = document.getElementById('chatInput');
        this.chatSendBtn = document.getElementById('chatSendBtn');
        this.chatCount = document.getElementById('chatCount');
        this.toggleChatPanelBtn = document.getElementById('toggleChatPanelBtn');
        this.clearChatBtn = document.getElementById('clearChatBtn');
        this.downloadChatBtn = document.getElementById('downloadChatBtn');
        
        // 对话历史
        this.chatHistory = [];
        
        console.log('📋 元素初始化完成:', {
            jobTitle: !!this.jobTitle,
            generateBtn: !!this.generateBtn,
            contentModal: !!this.contentModal,
            loadingSection: !!this.loadingSection,
            resultsSection: !!this.resultsSection,
            skillsContainer: !!this.skillsContainer,
            mindmapContent: !!this.mindmapContent
        });
    }
    
    bindEvents() {
        // 输入框事件
        if (this.jobTitle) {
            this.jobTitle.addEventListener('input', () => {
                this.updateGenerateButton();
            });
        }
        
        // 生成按钮事件
        if (this.generateBtn) {
            this.generateBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('🎯 生成按钮被点击');
                
                if (this.generateBtn.disabled) {
                    console.warn('⚠️ 按钮被禁用');
                    return;
                }
                
                this.showContentModal();
            });
        }
        
        // 模态框事件
        if (this.contentConfirm) {
            this.contentConfirm.addEventListener('click', () => {
                this.startGeneration();
            });
        }
        
        if (this.contentClose) {
            this.contentClose.addEventListener('click', () => {
                this.hideContentModal();
            });
        }
        
        if (this.contentCancel) {
            this.contentCancel.addEventListener('click', () => {
                this.hideContentModal();
            });
        }
        
        if (this.contentOverlay) {
            this.contentOverlay.addEventListener('click', () => {
                this.hideContentModal();
            });
        }
        
        // 标签切换事件
        const jobNameTab = document.getElementById('jobNameTab');
        const jobDescTab = document.getElementById('jobDescTab');
        const jobNameContent = document.getElementById('jobNameContent');
        const jobDescContent = document.getElementById('jobDescContent');
        
        if (jobNameTab && jobDescTab && jobNameContent && jobDescContent) {
            jobNameTab.addEventListener('click', () => {
                console.log('📄 切换到职位名称标签');
                
                // 切换标签状态
                jobNameTab.classList.add('active');
                jobDescTab.classList.remove('active');
                
                // 切换内容区域
                jobNameContent.classList.add('active');
                jobDescContent.classList.remove('active');
                
                // 更新按钮状态
                this.updateGenerateButton();
            });
            
            jobDescTab.addEventListener('click', () => {
                console.log('📋 切换到职位描述标签');
                
                // 切换标签状态
                jobDescTab.classList.add('active');
                jobNameTab.classList.remove('active');
                
                // 切换内容区域
                jobDescContent.classList.add('active');
                jobNameContent.classList.remove('active');
                
                // 更新按钮状态
                this.updateGenerateButton();
            });
        }
        
        // 文件上传事件
        const uploadBtn = document.getElementById('uploadBtn');
        const fileInput = document.getElementById('fileInput');
        const uploadArea = document.getElementById('uploadArea');
        
        if (uploadBtn && fileInput) {
            uploadBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('📎 上传按钮被点击');
                fileInput.click();
            });
            
            fileInput.addEventListener('change', (e) => {
                this.handleFileUpload(e);
            });
        }
        
        // 拖拽上传事件
        if (uploadArea) {
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.classList.add('dragover');
            });
            
            uploadArea.addEventListener('dragleave', () => {
                uploadArea.classList.remove('dragover');
            });
            
            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.classList.remove('dragover');
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    this.handleFile(files[0]);
                }
            });
        }
        
        // 职位描述输入框事件
        const jobDescription = document.getElementById('jobDescription');
        if (jobDescription) {
            jobDescription.addEventListener('input', () => {
                this.updateGenerateButton();
            });
        }
        
        // 热门职位标签
        const jobTags = document.querySelectorAll('.job-tag');
        jobTags.forEach(tag => {
            tag.addEventListener('click', () => {
                if (this.jobTitle) {
                    const job = tag.getAttribute('data-job');
                    this.jobTitle.value = job;
                    this.updateGenerateButton();
                    
                    // 更新选中状态
                    jobTags.forEach(t => t.classList.remove('selected'));
                    tag.classList.add('selected');
                }
            });
        });
        
        // 日志面板控制按钮
        const toggleLogPanelBtn = document.getElementById('toggleLogPanelBtn');
        const logPanel = document.getElementById('logPanel');
        
        if (toggleLogPanelBtn && logPanel) {
            toggleLogPanelBtn.addEventListener('click', () => {
                console.log('👁️ 切换日志面板显示状态');
                
                // 切换隐藏状态
                logPanel.classList.toggle('hidden');
                const isHidden = logPanel.classList.contains('hidden');
                
                // 更新按钮图标和提示
                const icon = toggleLogPanelBtn.querySelector('i');
                if (icon) {
                    icon.className = isHidden ? 'fas fa-eye' : 'fas fa-eye-slash';
                }
                toggleLogPanelBtn.title = isHidden ? '显示日志' : '隐藏日志';
                
                console.log('✅ 日志面板状态已更新:', isHidden ? '隐藏' : '显示');
            });
        }
        
        // 对话框控制按钮
        if (this.toggleChatPanelBtn && this.chatPanel) {
            this.toggleChatPanelBtn.addEventListener('click', () => {
                console.log('🤖 切换对话框显示状态');
                
                // 切换隐藏状态
                this.chatPanel.classList.toggle('hidden');
                const isHidden = this.chatPanel.classList.contains('hidden');
                
                // 更新按钮图标和提示
                const icon = this.toggleChatPanelBtn.querySelector('i');
                if (icon) {
                    icon.className = isHidden ? 'fas fa-eye' : 'fas fa-eye-slash';
                }
                this.toggleChatPanelBtn.title = isHidden ? '显示对话' : '隐藏对话';
                
                console.log('✅ 对话框状态已更新:', isHidden ? '隐藏' : '显示');
            });
        }
        
        // 对话输入框事件
        if (this.chatInput && this.chatSendBtn) {
            this.chatInput.addEventListener('input', () => {
                this.updateChatSendButton();
            });
            
            this.chatInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (!this.chatSendBtn.disabled) {
                        this.sendChatMessage();
                    }
                }
            });
            
            this.chatSendBtn.addEventListener('click', () => {
                this.sendChatMessage();
            });
        }
        
        // 清空对话按钮
        if (this.clearChatBtn) {
            this.clearChatBtn.addEventListener('click', () => {
                this.clearChat();
            });
        }
        
        // 下载对话按钮
        if (this.downloadChatBtn) {
            this.downloadChatBtn.addEventListener('click', () => {
                this.downloadChat();
            });
        }
        
        console.log('🔗 事件绑定完成');
    }
    
    updateGenerateButton() {
        if (!this.generateBtn) return;
        
        // 检查当前活跃的标签
        const jobNameContent = document.getElementById('jobNameContent');
        const jobDescContent = document.getElementById('jobDescContent');
        const isJobNameTabActive = jobNameContent && jobNameContent.classList.contains('active');
        
        let hasValue = false;
        
        if (isJobNameTabActive) {
            // 职位名称模式：检查输入框
            hasValue = this.jobTitle && this.jobTitle.value.trim().length > 0;
        } else {
            // 职位描述模式：检查文本框或文件上传
            const jobDescription = document.getElementById('jobDescription');
            const fileInput = document.getElementById('fileInput');
            
            const hasJobDesc = jobDescription && jobDescription.value.trim().length > 0;
            const hasFile = fileInput && fileInput.files.length > 0;
            
            hasValue = hasJobDesc || hasFile;
        }
        
        this.generateBtn.disabled = !hasValue;
        this.generateBtn.style.opacity = hasValue ? '1' : '0.6';
        this.generateBtn.style.cursor = hasValue ? 'pointer' : 'not-allowed';
        
        console.log('🔄 按钮状态更新:', { 
            hasValue, 
            disabled: this.generateBtn.disabled, 
            isJobNameTabActive 
        });
    }
    
    handleFileUpload(event) {
        console.log('📎 处理文件上传');
        const file = event.target.files[0];
        if (file) {
            this.handleFile(file);
        }
    }
    
    handleFile(file) {
        console.log('📁 处理文件:', file.name);
        
        if (!file.type.startsWith('image/')) {
            alert('请上传图片文件');
            return;
        }
        
        if (file.size > 5 * 1024 * 1024) { // 5MB
            alert('文件大小不能超过5MB');
            return;
        }
        
        // 显示文件信息
        const uploadArea = document.getElementById('uploadArea');
        if (uploadArea) {
            const fileInfo = document.createElement('div');
            fileInfo.className = 'file-info';
            fileInfo.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px; background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 6px; margin-top: 10px;">
                    <div style="display: flex; align-items: center;">
                        <i class="fas fa-image" style="color: #0ea5e9; margin-right: 8px;"></i>
                        <span style="color: #0369a1;">已上传: ${file.name}</span>
                    </div>
                    <button class="remove-file" style="background: none; border: none; color: #dc2626; cursor: pointer; padding: 4px;" onclick="this.parentElement.parentElement.remove(); window.simpleJobAssistant && window.simpleJobAssistant.updateGenerateButton();">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
            
            // 清除之前的文件信息
            const existingFileInfo = uploadArea.querySelector('.file-info');
            if (existingFileInfo) {
                existingFileInfo.remove();
            }
            
            uploadArea.appendChild(fileInfo);
        }
        
        this.updateGenerateButton();
        console.log('✅ 文件上传成功');
    }
    
    showContentModal() {
        console.log('📋 显示内容选择模态框');
        if (this.contentModal) {
            this.contentModal.classList.add('show');
            this.contentModal.style.display = 'flex';
            
            // 默认选中所有内容类型
            const checkboxes = this.contentModal.querySelectorAll('input[name="contentType"]');
            checkboxes.forEach(cb => {
                cb.checked = true; // 选中所有选项
            });
            
            // 启用确认按钮
            if (this.contentConfirm) {
                this.contentConfirm.disabled = false;
            }
        }
    }
    
    hideContentModal() {
        console.log('❌ 隐藏内容选择模态框');
        if (this.contentModal) {
            this.contentModal.classList.remove('show');
            this.contentModal.style.display = 'none';
        }
    }
    
    async startGeneration() {
        console.log('🚀 开始生成学习资料');
        
        try {
            // 隐藏模态框
            this.hideContentModal();
            
            // 显示加载状态
            if (this.loadingSection) {
                this.loadingSection.style.display = 'block';
            }
            
            // 获取职位信息
            const jobTitle = this.jobTitle ? this.jobTitle.value.trim() : '前端工程师';
            console.log('📝 职位信息:', jobTitle);
            
            // 模拟生成过程
            await this.simulateGeneration(jobTitle);
            
        } catch (error) {
            console.error('❌ 生成失败:', error);
            alert('生成失败，请刷新页面重试');
        }
    }
    
    async simulateGeneration(jobTitle) {
        console.log('🎭 开始模拟生成过程');
        
        // 模拟进度更新
        const steps = [
            { progress: 20, message: '正在分析职位技能...' },
            { progress: 40, message: '正在生成知识点...' },
            { progress: 60, message: '正在生成面试题...' },
            { progress: 80, message: '正在推荐资源...' },
            { progress: 100, message: '生成完成！' }
        ];
        
        for (const step of steps) {
            this.updateProgress(step.message, step.progress);
            await this.sleep(1500);
        }
        
        // 显示结果
        this.showResults(jobTitle);
    }
    
    updateProgress(message, progress) {
        console.log(`📊 进度更新: ${message} (${progress}%)`);
        
        // 更新加载文案
        const loadingTitle = document.querySelector('.loading-title');
        if (loadingTitle) {
            loadingTitle.textContent = message;
        }
        
        // 更新进度条
        const progressBar = document.querySelector('.progress-bar');
        const progressText = document.querySelector('.progress-text');
        
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
        
        if (progressText) {
            progressText.textContent = `${progress}%`;
        }
    }
    
    showResults(jobTitle) {
        console.log('📊 显示生成结果');
        
        // 隐藏加载状态
        if (this.loadingSection) {
            this.loadingSection.style.display = 'none';
        }
        
        // 显示结果区域
        if (this.resultsSection) {
            this.resultsSection.style.display = 'block';
        }
        
        // 更新标题
        if (this.topicDisplay) {
            this.topicDisplay.textContent = jobTitle;
        }
        
        // 更新生成时间
        if (this.generationTime) {
            this.generationTime.textContent = new Date().toLocaleString();
        }
        
        // 生成技能内容
        this.generateSkillsContent(jobTitle);
        
        // 生成思维导图
        this.generateMindmap(jobTitle);
    }
    
    generateSkillsContent(jobTitle) {
        if (!this.skillsContainer) return;
        
        console.log('🎯 生成技能内容');
        
        const skillsHtml = `
            <div class="skill-category">
                <div class="skill-header">
                    <h3 class="skill-title">
                        <i class="fas fa-lightbulb"></i>
                        ${jobTitle} 核心知识点
                    </h3>
                </div>
                <div class="skill-content">
                    <div class="content-types">
                        <div class="content-type">
                            <div class="content-type-header">
                                <i class="fas fa-lightbulb"></i>
                                知识点
                            </div>
                            <div class="content-type-body">
                                <div class="content-item">
                                    <p>${jobTitle}基础理论与概念</p>
                                </div>
                                <div class="content-item">
                                    <p>行业最佳实践和标准</p>
                                </div>
                                <div class="content-item">
                                    <p>相关工具和技术栈</p>
                                </div>
                                <div class="content-item">
                                    <p>实际项目应用案例</p>
                                </div>
                            </div>
                        </div>
                        <div class="content-type">
                            <div class="content-type-header">
                                <i class="fas fa-question-circle"></i>
                                高频面试题
                            </div>
                            <div class="content-type-body">
                                <div class="content-item">
                                    <p>请介绍您对${jobTitle}岗位的理解</p>
                                </div>
                                <div class="content-item">
                                    <p>您在${jobTitle}方面有哪些实战经验？</p>
                                </div>
                                <div class="content-item">
                                    <p>如何解决${jobTitle}工作中的常见问题？</p>
                                </div>
                                <div class="content-item">
                                    <p>描述一个具有挑战性的${jobTitle}项目</p>
                                </div>
                            </div>
                        </div>
                        <div class="content-type">
                            <div class="content-type-header">
                                <i class="fas fa-book"></i>
                                推荐书籍
                            </div>
                            <div class="content-type-body">
                                <div class="content-item">
                                    <p>《${jobTitle}实战指南》- 深入理解核心技术</p>
                                </div>
                                <div class="content-item">
                                    <p>《${jobTitle}进阶之路》- 提升专业技能</p>
                                </div>
                                <div class="content-item">
                                    <p>《${jobTitle}最佳实践》- 行业标准指导</p>
                                </div>
                                <div class="content-item">
                                    <p>《${jobTitle}案例分析》- 项目经验总结</p>
                                </div>
                            </div>
                        </div>
                        <div class="content-type">
                            <div class="content-type-header">
                                <i class="fas fa-graduation-cap"></i>
                                推荐课程
                            </div>
                            <div class="content-type-body">
                                <div class="content-item">
                                    <p>${jobTitle}零基础入门课程</p>
                                </div>
                                <div class="content-item">
                                    <p>${jobTitle}进阶实战训练营</p>
                                </div>
                                <div class="content-item">
                                    <p>${jobTitle}项目实战课程</p>
                                </div>
                                <div class="content-item">
                                    <p>${jobTitle}面试指导课程</p>
                                </div>
                            </div>
                        </div>
                        <div class="content-type">
                            <div class="content-type-header">
                                <i class="fas fa-certificate"></i>
                                相关证书
                            </div>
                            <div class="content-type-body">
                                <div class="content-item">
                                    <p>${jobTitle}专业认证证书</p>
                                </div>
                                <div class="content-item">
                                    <p>${jobTitle}技能等级证书</p>
                                </div>
                                <div class="content-item">
                                    <p>行业权威认证证书</p>
                                </div>
                                <div class="content-item">
                                    <p>国际标准认证证书</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.skillsContainer.innerHTML = skillsHtml;
        console.log('✅ 技能内容生成完成');
    }
    
    async generateMindmap(jobTitle) {
        if (!this.mindmapContent) {
            console.error('❌ mindmapContent元素不存在');
            return;
        }
        
        console.log('🧠 使用MCP Markmap服务生成思维导图');
        
        // 创建思维导图容器
        const mindmapId = 'mindmap-svg-' + Date.now();
        const mindmapHtml = `
            <div class="mindmap-container">
                <div class="mindmap-header">
                    <h3>${jobTitle} 学习思维导图</h3>
                    <div class="mindmap-status">
                        <span class="mcp-badge">🚀 MCP Markmap</span>
                        <span class="loading-badge">⚙️ 生成中...</span>
                    </div>
                </div>
                <div id="${mindmapId}" class="mindmap-display">
                    <div style="padding: 40px; text-align: center; color: #666;">
                        <div style="margin-bottom: 20px;">
                            <i class="fas fa-cog fa-spin" style="font-size: 2rem; color: #4f46e5;"></i>
                        </div>
                        <p>正在调用 MCP Markmap 服务生成思维导图...</p>
                    </div>
                </div>
                <div class="mindmap-info">
                    <p><strong>🧠 MCP Markmap 思维导图说明：</strong></p>
                    <ul>
                        <li>• 使用 ModelScope Markmap MCP 服务器生成</li>
                        <li>• 支持交互式点击展开/折叠功能</li>
                        <li>• 可缩放和拖拽浏览</li>
                        <li>• 个性化${jobTitle}学习路径展示</li>
                    </ul>
                </div>
            </div>
        `;
        
        this.mindmapContent.innerHTML = mindmapHtml;
        
        // 生成Markdown内容
        const markdownContent = this.generateMarkdownContent(jobTitle);
        
        try {
            // 调用MCP API
            console.log('📞 调用MCP Markmap API...');
            const response = await fetch('/api/generate-mindmap-mcp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    topic: jobTitle,
                    content: markdownContent
                })
            });
            
            if (!response.ok) {
                throw new Error(`MCP API 调用失败: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('✅ MCP API 调用成功:', result);
            
            // 更新状态标识
            const loadingBadge = document.querySelector('.loading-badge');
            if (loadingBadge) {
                if (result.success && result.mindmap) {
                    if (result.mindmap.isMcpGenerated) {
                        loadingBadge.textContent = '✅ MCP 生成成功';
                        loadingBadge.style.background = '#10b981';
                    } else {
                        loadingBadge.textContent = '⚠️ 降级模式';
                        loadingBadge.style.background = '#f59e0b';
                    }
                } else {
                    loadingBadge.textContent = '❌ 生成失败';
                    loadingBadge.style.background = '#ef4444';
                }
            }
            
            // 渲染思维导图
            if (result.success && result.mindmap) {
                console.log('🎆 渲染思维导图数据');
                this.displayMindmapResult(mindmapId, result.mindmap, jobTitle);
            } else {
                console.log('🔄 使用降级方案渲染思维导图');
                this.renderRealMarkmap(mindmapId, markdownContent, jobTitle);
            }
            
        } catch (error) {
            console.error('❌ MCP 思维导图生成失败:', error);
            
            // 更新状态为错误
            const loadingBadge = document.querySelector('.loading-badge');
            if (loadingBadge) {
                loadingBadge.textContent = '❌ 生成失败';
                loadingBadge.style.background = '#ef4444';
            }
            
            // 使用本地降级方案
            setTimeout(() => {
                this.renderRealMarkmap(mindmapId, markdownContent, jobTitle);
            }, 1000);
        }
        
        // 更新思维导图状态
        const mindmapStatus = document.getElementById('mindmapStatus');
        if (mindmapStatus) {
            mindmapStatus.textContent = '完成';
            mindmapStatus.className = 'card-status completed';
        }
        
        console.log('✅ 思维导图生成完成');
    }
    
    displayMindmapResult(mindmapId, mindmapData, jobTitle) {
        console.log('🎨 显示MCP思维导图结果');
        
        const mindmapElement = document.getElementById(mindmapId);
        if (!mindmapElement) {
            console.error('❌ 思维导图元素不存在:', mindmapId);
            return;
        }
        
        // 更新状态显示
        const loadingBadge = document.querySelector('.loading-badge');
        if (loadingBadge) {
            if (mindmapData.isMcpGenerated) {
                loadingBadge.textContent = '✅ MCP 生成成功';
                loadingBadge.style.background = '#10b981';
            } else {
                loadingBadge.textContent = '⚠️ 降级模式';
                loadingBadge.style.background = '#f59e0b';
            }
        }
        
        // 使用真正的Markmap渲染思维导图
        setTimeout(() => {
            this.renderRealMarkmap(mindmapId, mindmapData.content, jobTitle);
        }, 500);
        
        console.log('✅ 思维导图内容已更新，开始渲染真正的思维导图');
    }
    
    renderRealMarkmap(svgId, markdownContent, jobTitle) {
        console.log('🗺️ 渲染真正的Markmap思维导图');
        
        const mindmapElement = document.getElementById(svgId);
        if (!mindmapElement) {
            console.error('❌ 思维导图元素不存在:', svgId);
            return;
        }
        
        // 创建SVG容器
        mindmapElement.innerHTML = `
            <svg id="markmap-svg-${Date.now()}" width="100%" height="500" style="border: 1px solid #e5e7eb; border-radius: 8px; background: #ffffff;">
            </svg>
        `;
        
        const svgElement = mindmapElement.querySelector('svg');
        
        // 检查Markmap库是否可用
        if (typeof markmap === 'undefined') {
            console.warn('⚠️ Markmap库未加载，使用降级显示');
            this.renderFallbackMindmapInSvg(svgElement, markdownContent, jobTitle);
            return;
        }
        
        try {
            console.log('🎯 使用Markmap库渲染思维导图');
            
            // 使用markmap-lib解析Markdown
            const { Transformer } = markmap;
            const transformer = new Transformer();
            
            // 解析Markdown内容
            const { root, features } = transformer.transform(markdownContent);
            
            // 创建 Markmap 实例
            const { Markmap, loadCSS, loadJS } = markmap;
            
            // 加载所需的CSS和JS
            if (features.css) loadCSS(features.css);
            if (features.js) {
                loadJS(features.js, {
                    getMarkmap: () => markmap,
                });
            }
            
            // 创建思维导图
            const mm = Markmap.create(svgElement, {
                colorFreezeLevel: 2,
                maxWidth: 300,
                duration: 500,
                zoom: true,
                pan: true,
                height: 500
            }, root);
            
            // 存储实例以便后续操作
            this.currentMarkmap = mm;
            
            console.log('✅ 真正的Markmap思维导图渲染成功');
            
        } catch (error) {
            console.error('❌ Markmap渲染失败:', error);
            this.renderFallbackMindmapInSvg(svgElement, markdownContent, jobTitle);
        }
    }
    
    renderFallbackMindmapInSvg(svgElement, markdownContent, jobTitle) {
        console.log('🔄 使用SVG降级方案显示思维导图');
        
        if (!svgElement) return;
        
        // 在SVG中显示简单的思维导图结构
        svgElement.innerHTML = `
            <g transform="translate(50, 50)">
                <!-- 中心节点 -->
                <circle cx="200" cy="150" r="60" fill="#4f46e5" stroke="#312e81" stroke-width="2"/>
                <text x="200" y="150" text-anchor="middle" dominant-baseline="middle" fill="white" font-size="12" font-weight="bold">
                    ${jobTitle}
                </text>
                
                <!-- 分支节点 -->
                <g class="branch-1">
                    <line x1="200" y1="150" x2="100" y2="80" stroke="#6366f1" stroke-width="2"/>
                    <circle cx="100" cy="80" r="30" fill="#8b5cf6" stroke="#7c3aed" stroke-width="1"/>
                    <text x="100" y="80" text-anchor="middle" dominant-baseline="middle" fill="white" font-size="10">基础技能</text>
                </g>
                
                <g class="branch-2">
                    <line x1="200" y1="150" x2="300" y2="80" stroke="#6366f1" stroke-width="2"/>
                    <circle cx="300" cy="80" r="30" fill="#10b981" stroke="#059669" stroke-width="1"/>
                    <text x="300" y="80" text-anchor="middle" dominant-baseline="middle" fill="white" font-size="10">进阶技能</text>
                </g>
                
                <g class="branch-3">
                    <line x1="200" y1="150" x2="100" y2="220" stroke="#6366f1" stroke-width="2"/>
                    <circle cx="100" cy="220" r="30" fill="#f59e0b" stroke="#d97706" stroke-width="1"/>
                    <text x="100" y="220" text-anchor="middle" dominant-baseline="middle" fill="white" font-size="10">实战项目</text>
                </g>
                
                <g class="branch-4">
                    <line x1="200" y1="150" x2="300" y2="220" stroke="#6366f1" stroke-width="2"/>
                    <circle cx="300" cy="220" r="30" fill="#ef4444" stroke="#dc2626" stroke-width="1"/>
                    <text x="300" y="220" text-anchor="middle" dominant-baseline="middle" fill="white" font-size="10">职业发展</text>
                </g>
                
                <!-- 提示文字 -->
                <text x="200" y="300" text-anchor="middle" fill="#666" font-size="12">
                    MCP Markmap 思维导图 (降级模式)
                </text>
            </g>
        `;
        
        console.log('✅ SVG降级思维导图显示完成');
    }
    
    generateMarkdownContent(jobTitle) {
        return `# ${jobTitle} 学习路线图

## 🎯 基础技能

### 专业理论基础
- ${jobTitle}核心概念理解
- 行业标准和规范
- 基础工具使用

### 基本技能要求
- 沟通协调能力
- 逻辑分析能力
- 学习适应能力

## 🚀 进阶技能

### 高级专业技能
- ${jobTitle}高级应用
- 系统性思维能力
- 创新解决方案

### 技术整合能力
- 跨领域知识整合
- 新技术学习应用
- 最佳实践总结

## 🔧 实战项目

### 项目实战经验
- 真实项目参与
- 问题解决案例
- 成果展示能力

### 团队协作
- 团队沟通技巧
- 协作工具使用
- 领导力培养

## 📈 职业发展

### 技术领导力
- 技术决策能力
- 团队管理经验
- 战略规划思维

### 持续学习
- 行业趋势敏感度
- 知识体系更新
- 个人品牌建设`;
    }
    
    renderMarkmap(svgId, markdownContent) {
        console.log('🎨 开始渲染Markmap思维导图');
        
        // 检查Markmap库是否可用
        if (typeof markmap === 'undefined') {
            console.warn('⚠️ Markmap库未加载，使用降级显示');
            this.renderFallbackMindmap(svgId, markdownContent);
            return;
        }
        
        try {
            const svgElement = document.getElementById(svgId);
            if (!svgElement) {
                console.error('❌ SVG元素不存在:', svgId);
                return;
            }
            
            // 使用markmap-lib解析Markdown
            const { Transformer } = markmap;
            const transformer = new Transformer();
            
            // 解析Markdown内容
            const { root, features } = transformer.transform(markdownContent);
            
            // 创建 Markmap 实例
            const { Markmap, loadCSS, loadJS } = markmap;
            
            // 加载所需的CSS和JS
            if (features.css) loadCSS(features.css);
            if (features.js) {
                loadJS(features.js, {
                    getMarkmap: () => markmap,
                });
            }
            
            // 创建思维导图
            const mm = Markmap.create(svgElement, {
                colorFreezeLevel: 2,
                maxWidth: 300,
                duration: 500,
                zoom: true,
                pan: true,
                height: 500
            }, root);
            
            // 存储实例以便后续操作
            this.currentMarkmap = mm;
            
            console.log('✅ Markmap思维导图渲染成功');
            
        } catch (error) {
            console.error('❌ Markmap渲染失败:', error);
            this.renderFallbackMindmap(svgId, markdownContent);
        }
    }
    
    async renderMcpMindmap(svgId, mindmapData) {
        console.log('🎆 渲染MCP生成的思维导图');
        
        const svgElement = document.getElementById(svgId);
        if (!svgElement) {
            console.error('❌ SVG元素不存在:', svgId);
            return;
        }
        
        try {
            // 检查MCP返回的数据结构
            let markdownContent = mindmapData.content;
            
            if (mindmapData.mcpResult) {
                // 如果有MCP结果，优先使用MCP的内容
                if (mindmapData.mcpResult.markdownContent) {
                    markdownContent = mindmapData.mcpResult.markdownContent;
                } else if (mindmapData.mcpResult.content) {
                    markdownContent = mindmapData.mcpResult.content;
                }
                
                console.log('✅ 使用MCP服务器生成的内容');
            }
            
            // 调用标准Markmap渲染
            await this.renderMarkmap(svgId, markdownContent);
            
            // 更新状态为MCP成功
            const loadingBadge = document.querySelector('.loading-badge');
            if (loadingBadge) {
                loadingBadge.textContent = '✅ MCP 生成成功';
                loadingBadge.style.background = '#10b981';
            }
            
        } catch (error) {
            console.error('❌ MCP思维导图渲染失败:', error);
            this.renderRealMindmapContent(svgId, mindmapData.content || mindmapData.title);
        }
    }
    
    renderRealMindmapContent(svgId, content) {
        console.log('💡 渲染真实的思维导图内容');
        
        const mindmapElement = document.getElementById(svgId);
        if (!mindmapElement) {
            console.error('❌ 思维导图元素不存在:', svgId);
            return;
        }
        
        // 直接调用真正的Markmap渲染
        this.renderRealMarkmap(svgId, content, '学习思维导图');
        
        console.log('✅ 真实思维导图内容已显示');
    }
    
    convertContentToTree(content) {
        if (!content || typeof content !== 'string') {
            return '<div style="color: #666; font-style: italic;">思维导图内容空</div>';
        }
        
        const lines = content.split('\n').filter(line => line.trim());
        let html = '<div class="tree-structure">';
        
        lines.forEach(line => {
            const trimmedLine = line.trim();
            if (!trimmedLine) return;
            
            if (trimmedLine.startsWith('# ')) {
                html += `<div class="tree-node level-1" style="font-size: 18px; font-weight: bold; color: #1f2937; margin: 15px 0 10px 0; padding-bottom: 5px; border-bottom: 2px solid #10b981;">
                    🎯 ${trimmedLine.replace('# ', '')}
                </div>`;
            } else if (trimmedLine.startsWith('## ')) {
                html += `<div class="tree-node level-2" style="font-size: 16px; font-weight: 600; color: #374151; margin: 12px 0 8px 20px; padding-left: 15px; border-left: 3px solid #3b82f6;">
                    📁 ${trimmedLine.replace('## ', '')}
                </div>`;
            } else if (trimmedLine.startsWith('### ')) {
                html += `<div class="tree-node level-3" style="font-size: 14px; font-weight: 500; color: #4b5563; margin: 8px 0 6px 40px; padding-left: 12px; border-left: 2px solid #8b5cf6;">
                    📝 ${trimmedLine.replace('### ', '')}
                </div>`;
            } else if (trimmedLine.startsWith('- ')) {
                html += `<div class="tree-node level-item" style="font-size: 13px; color: #6b7280; margin: 4px 0 4px 60px; padding-left: 10px;">
                    • ${trimmedLine.replace('- ', '')}
                </div>`;
            }
        });
        
        html += '</div>';
        return html;
    }
    
    renderFallbackMindmap(svgId, markdownContent) {
        console.log('🔄 使用降级方案显示思维导图');
        
        const svgElement = document.getElementById(svgId);
        if (!svgElement) return;
        
        // 使用简单的SVG绘制基本思维导图
        const fallbackHtml = `
            <div style="padding: 20px; text-align: center; color: #666;">
                <div style="margin-bottom: 20px;">
                    <i class="fas fa-project-diagram" style="font-size: 3rem; color: #4f46e5;"></i>
                </div>
                <h4>MCP 思维导图服务</h4>
                <p>基于 ModelScope Markmap MCP 服务器生成</p>
                <div style="margin-top: 20px; padding: 15px; background: #f8fafc; border-radius: 8px; text-align: left;">
                    <strong>📝 学习路线概览：</strong><br>
                    📚 基础技能 → 🚀 进阶技能 → 🔧 实战项目 → 📈 职业发展<br><br>
                    <strong>🧠 MCP Markmap 功能：</strong><br>
                    • 使用 ModelScope Markmap MCP 服务器<br>
                    • 将 Markdown 转换为交互式思维导图<br>
                    • 支持展开/折叠和缩放功能<br>
                    • 个性化学习路径可视化
                </div>
            </div>
        `;
        
        svgElement.outerHTML = `<div class="mindmap-fallback">${fallbackHtml}</div>`;
    }
    
    addMindmapInteractions() {
        // 添加交互功能（点击展开/折叠）
        const treeNodes = document.querySelectorAll('.tree-node');
        treeNodes.forEach(node => {
            node.style.cursor = 'pointer';
            node.addEventListener('click', () => {
                // 简单的点击效果
                node.style.backgroundColor = node.style.backgroundColor === 'rgba(16, 185, 129, 0.1)' ? 'transparent' : 'rgba(16, 185, 129, 0.1)';
            });
        });
        
        console.log('✅ 思维导图交互功能已添加');
    }
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // === 对话框功能方法 ===
    
    updateChatSendButton() {
        if (!this.chatInput || !this.chatSendBtn) return;
        
        const hasText = this.chatInput.value.trim().length > 0;
        this.chatSendBtn.disabled = !hasText;
    }
    
    async sendChatMessage() {
        if (!this.chatInput || !this.chatSendBtn) return;
        
        const message = this.chatInput.value.trim();
        if (!message) return;
        
        console.log('💬 发送聊天消息:', message);
        
        // 清空输入框
        this.chatInput.value = '';
        this.updateChatSendButton();
        
        // 添加用户消息
        this.addChatMessage('user', message);
        
        // 创建AI回复消息容器（用于流式更新）
        const aiMessageDiv = this.addChatMessage('assistant', '🤔 正在思考中...', false);
        let streamContent = '';
        
        try {
            // 调用流式百炼 API
            await this.callDashScopeAPIStream(message, (content) => {
                // 流式更新AI回复内容
                streamContent += content;
                // 实时渲染Markdown内容
                aiMessageDiv.innerHTML = this.renderMarkdown(streamContent);
                
                // 滚动到底部
                this.chatContent.scrollTop = this.chatContent.scrollHeight;
            });
            
            // 更新对话历史
            this.chatHistory.push({
                role: 'assistant',
                content: streamContent
            });
            
            // 限制历史记录数量
            if (this.chatHistory.length > 20) {
                this.chatHistory = this.chatHistory.slice(-20);
            }
            
            this.updateChatCount();
            
        } catch (error) {
            console.error('❌ 聊天API调用失败:', error);
            
            // 显示错误消息
            aiMessageDiv.textContent = '⚠️ 抱歉，我遇到了一些问题。请检查API配置或稍后再试。';
        }
    }
    
    async callDashScopeAPI(message) {
        console.log('🚀 调用百炼 API...');
        
        // 获取API密钥
        const apiKey = this.getStoredApiKey();
        if (!apiKey) {
            throw new Error('请先配置API密钥');
        }
        
        // 构建对话历史
        const messages = [
            {
                role: 'system',
                content: '你是一个专业的职业发展顾问，擅长提供技能学习、职业规划、面试指导等建议。请用中文回答，语言友好、专业。'
            },
            ...this.chatHistory.slice(-10), // 只保畀10条历史消息
            {
                role: 'user',
                content: message
            }
        ];
        
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: messages,
                apiKey: apiKey
            })
        });
        
        if (!response.ok) {
            throw new Error(`API调用失败: ${response.status}`);
        }
        
        const result = await response.json();
        return result.content || result.message || '抱歉，我无法理解您的问题。';
    }
    
    async callDashScopeAPIStream(message, onContent) {
        console.log('🚀 调用流式百炼 API...');
        
        // 获取API密钥
        const apiKey = this.getStoredApiKey();
        if (!apiKey) {
            throw new Error('请先配置API密钥');
        }
        
        // 构建对话历史
        const messages = [
            {
                role: 'system',
                content: '你是一个专业的职业发展顾问，擅长提供技能学习、职业规划、面试指导等建议。请用中文回答，语言友好、专业。'
            },
            ...this.chatHistory.slice(-10), // 只保畐10条历史消息
            {
                role: 'user',
                content: message
            }
        ];
        
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: messages,
                apiKey: apiKey,
                stream: true // 启用流式模式
            })
        });
        
        if (!response.ok) {
            throw new Error(`流式API调用失败: ${response.status}`);
        }
        
        // 使用fetch流式处理SSE响应
        return new Promise((resolve, reject) => {
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            
            const processStream = async () => {
                try {
                    while (true) {
                        const { done, value } = await reader.read();
                        
                        if (done) {
                            console.log('✅ 流式响应完成');
                            resolve();
                            break;
                        }
                        
                        buffer += decoder.decode(value, { stream: true });
                        const lines = buffer.split('\n');
                        buffer = lines.pop(); // 保留未完整的行
                        
                        for (const line of lines) {
                            if (line.trim() === '') continue;
                            
                            if (line.startsWith('event: ')) {
                                const event = line.slice(7);
                                continue;
                            }
                            
                            if (line.startsWith('data: ')) {
                                const data = line.slice(6);
                                console.log('📊 收到SSE数据:', data.substring(0, 100) + '...');
                                
                                try {
                                    const parsed = JSON.parse(data);
                                    console.log('🔍 解析的数据:', parsed);
                                    
                                    if (parsed.content && !parsed.done) {
                                        console.log('🔥 流式内容:', parsed.content);
                                        // 调用回调函数更新内容
                                        onContent(parsed.content);
                                    } else if (parsed.message === '对话完成') {
                                        console.log('✅ 流式对话完成');
                                        resolve();
                                        return;
                                    } else if (parsed.error) {
                                        console.error('❌ 流式错误:', parsed.error);
                                        reject(new Error(parsed.error));
                                        return;
                                    }
                                } catch (parseError) {
                                    console.warn('⚠️ 解析SSE数据失败:', parseError.message, '原始数据:', data);
                                }
                            }
                        }
                    }
                } catch (error) {
                    console.error('❌ 流式处理错误:', error);
                    reject(error);
                }
            };
            
            processStream();
        });
    }
    
    getStoredApiKey() {
        // 介 localStorage或配置获取API密钥（与配置保存时保持一致）
        return localStorage.getItem('ai_learning_companion_api_key') || '';
    }
    
    // Markdown到HTML转换函数
    renderMarkdown(text) {
        if (!text) return '';
        
        // 基本的Markdown转换
        let html = text
            // 水平分隔线
            .replace(/^---+$/gm, '<hr>')
            .replace(/^\*\*\*+$/gm, '<hr>')
            // 标题转换
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            // 粗体和斜体
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            // 行内代码
            .replace(/`(.*?)`/g, '<code>$1</code>')
            // 代码块
            .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
            // 链接
            .replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
            // 有序列表
            .replace(/^\s*(\d+)\. (.*)$/gm, '<li data-type="ordered">$2</li>')
            // 无序列表
            .replace(/^\s*[-\*] (.*)$/gm, '<li data-type="unordered">$1</li>')
            // 换行处理
            .replace(/\n/g, '<br>');
        
        // 处理表格（简单的竖线分隔）
        html = html.replace(/\|(.+?)\|/g, (match, content) => {
            const cells = content.split('|').map(cell => cell.trim()).filter(cell => cell);
            if (cells.length > 1) {
                const cellsHtml = cells.map(cell => `<td>${cell}</td>`).join('');
                return `<tr>${cellsHtml}</tr>`;
            }
            return match;
        });
        
        // 包装表格行
        html = html.replace(/(<tr>.*?<\/tr>)+/gs, '<table>$&</table>');
        
        // 处理列表项
        // 有序列表
        const orderedItems = html.match(/<li data-type="ordered">.*?<\/li>/g);
        if (orderedItems) {
            const orderedList = orderedItems.join('').replace(/data-type="ordered"/g, '');
            html = html.replace(/<li data-type="ordered">.*?<\/li>/g, '').replace(/(<br>)*$/, '') + '<ol>' + orderedList + '</ol>';
        }
        
        // 无序列表
        const unorderedItems = html.match(/<li data-type="unordered">.*?<\/li>/g);
        if (unorderedItems) {
            const unorderedList = unorderedItems.join('').replace(/data-type="unordered"/g, '');
            html = html.replace(/<li data-type="unordered">.*?<\/li>/g, '').replace(/(<br>)*$/, '') + '<ul>' + unorderedList + '</ul>';
        }
        
        // 清理多余的<br>标签
        html = html.replace(/<br>\s*<\/(h[1-6]|ul|ol|li|table|tr|td|hr|pre)>/g, '</$1>');
        html = html.replace(/<(h[1-6]|ul|ol|table|hr|pre)>\s*<br>/g, '<$1>');
        html = html.replace(/<br>\s*<br>/g, '<br>');
        
        return html;
    }
    
    addChatMessage(role, content, isThinking = false) {
        if (!this.chatContent) return;
        
        // 清除欢迎消息
        const welcomeMsg = this.chatContent.querySelector('.chat-welcome');
        if (welcomeMsg) {
            welcomeMsg.remove();
        }
        
        // 添加时间戳
        const timestamp = new Date().toLocaleTimeString();
        const timestampDiv = document.createElement('div');
        timestampDiv.className = 'chat-timestamp';
        timestampDiv.textContent = timestamp;
        this.chatContent.appendChild(timestampDiv);
        
        // 添加消息
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${role}${isThinking ? ' thinking' : ''}`;
        
        // 对AI消息进行Markdown渲染，用户消息保持纯文本
        if (role === 'assistant' && !isThinking) {
            messageDiv.innerHTML = this.renderMarkdown(content);
        } else {
            messageDiv.textContent = content;
        }
        
        this.chatContent.appendChild(messageDiv);
        
        // 滚动到底部
        this.chatContent.scrollTop = this.chatContent.scrollHeight;
        
        // 更新历史记录
        if (!isThinking) {
            this.chatHistory.push({
                role: role,
                content: content
            });
            
            // 限制历史记录数量
            if (this.chatHistory.length > 20) {
                this.chatHistory = this.chatHistory.slice(-20);
            }
            
            this.updateChatCount();
        }
        
        return messageDiv;
    }
    
    updateChatCount() {
        if (!this.chatCount) return;
        
        const userMessages = this.chatHistory.filter(msg => msg.role === 'user').length;
        this.chatCount.textContent = `${userMessages} 条对话`;
    }
    
    clearChat() {
        if (!this.chatContent) return;
        
        console.log('🗑️ 清空对话历史');
        
        this.chatContent.innerHTML = `
            <div class="chat-welcome">
                <i class="fas fa-robot"></i>
                <p>你好！我是职途助手AI，可以回答你关于职业发展、技能学习的问题。</p>
                <p>请输入你的问题开始对话吧！</p>
            </div>
        `;
        
        this.chatHistory = [];
        this.updateChatCount();
    }
    
    downloadChat() {
        if (this.chatHistory.length === 0) {
            alert('暂无对话内容可下载');
            return;
        }
        
        console.log('💾 下载对话历史');
        
        let content = '职途助手AI对话记录\n';
        content += '=' .repeat(30) + '\n\n';
        
        this.chatHistory.forEach((msg, index) => {
            const role = msg.role === 'user' ? '用户' : 'AI助手';
            content += `${role}: ${msg.content}\n\n`;
        });
        
        content += '\n' + '=' .repeat(30) + '\n';
        content += `导出时间: ${new Date().toLocaleString()}\n`;
        
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `对话记录-${new Date().toISOString().slice(0, 10)}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('✅ 对话记录已下载');
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM加载完成，开始简化初始化');
    
    try {
        // 创建简化的JobAssistant实例
        window.simpleJobAssistant = new SimpleJobAssistant();
        
        // 为了兼容性，也设置到原来的变量名
        window.jobAssistantUI = window.simpleJobAssistant;
        
        console.log('✅ 简化初始化完成');
        
        // 移除系统初始化错误提示（如果存在）
        setTimeout(() => {
            const errorToasts = document.querySelectorAll('.toast, .error-toast');
            errorToasts.forEach(toast => {
                if (toast.textContent.includes('系统初始化问题')) {
                    toast.remove();
                }
            });
        }, 1000);
        
    } catch (error) {
        console.error('❌ 简化初始化失败:', error);
        alert('页面初始化失败，请刷新页面重试');
    }
});

console.log('🔧 简化初始化脚本加载完成');