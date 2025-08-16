/**
 * 职途助手AI求职大师 - Web界面交互脚本
 * 连接前端界面与Eko框架后端系统
 */

class JobAssistantUI {
    constructor() {
        this.initializeElements();
        this.bindEvents();
        this.currentStep = 0;
        this.steps = ['step1', 'step2', 'step3', 'step4', 'step5'];
        this.stepLabels = [
            '分析职位技能',
            '生成知识点', 
            '生成面试题',
            '推荐书籍',
            '推荐证书'
        ];
        this.selectedContentTypes = [];
        this.currentJobInfo = null;
    }

    initializeElements() {
        try {
            // 职位输入相关元素
            this.jobNameTab = document.getElementById('jobNameTab');
            this.jobDescTab = document.getElementById('jobDescTab');
            this.jobNameContent = document.getElementById('jobNameContent');
            this.jobDescContent = document.getElementById('jobDescContent');
            this.jobTitle = document.getElementById('jobTitle');
            this.jobDescription = document.getElementById('jobDescription');
            this.uploadArea = document.getElementById('uploadArea');
            this.fileInput = document.getElementById('fileInput');
            this.uploadBtn = document.getElementById('uploadBtn');
            this.generateBtn = document.getElementById('generateBtn');
            this.jobTags = document.querySelectorAll('.job-tag');
            
            // 内容选择模态框
            this.contentModal = document.getElementById('contentModal');
            this.contentOverlay = document.getElementById('contentOverlay');
            this.contentClose = document.getElementById('contentClose');
            this.contentCancel = document.getElementById('contentCancel');
            this.contentConfirm = document.getElementById('contentConfirm');
            this.contentOptions = document.querySelectorAll('input[name="contentType"]');
        } catch (error) {
            console.warn('⚠️ 初始化元素时出现问题:', error.message);
        }
        
        // 状态区域
        this.loadingSection = document.getElementById('loadingSection');
        this.resultsSection = document.getElementById('resultsSection');
        this.errorSection = document.getElementById('errorSection');
        
        // 结果展示元素
        this.topicDisplay = document.getElementById('topicDisplay');
        this.generationTime = document.getElementById('generationTime');
        this.skillsContainer = document.getElementById('skillsContainer');
        this.saveBtn = document.getElementById('saveBtn');
        this.exportBtn = document.getElementById('exportBtn');
        this.exportFeishuBtn = document.getElementById('exportFeishuBtn');
        this.regenerateBtn = document.getElementById('regenerateBtn');
        this.mindmapContent = document.getElementById('mindmapContent');
        
        // 添加内容卡片元素初始化
        this.coursesContent = document.getElementById('coursesContent');
        this.studyPlanContent = document.getElementById('studyPlanContent');
        this.exercisesContent = document.getElementById('exercisesContent');
        this.notesContent = document.getElementById('notesContent');
        this.progressContent = document.getElementById('progressContent');
        
        // 如果找不到相应元素，尝试使用skillsContainer作为备用
        if (!this.coursesContent) {
            console.warn('⚠️ coursesContent元素不存在，使用skillsContainer作为备用');
            this.coursesContent = this.skillsContainer;
        }
        
        // 操作按钮
        this.retryBtn = document.getElementById('retryBtn');
        
        // Toast通知
        this.toast = document.getElementById('toast');
        
        // API配置相关元素
        this.configBtn = document.getElementById('configBtn');
        this.configModal = document.getElementById('configModal');
        this.configOverlay = document.getElementById('configOverlay');
        this.configClose = document.getElementById('configClose');
        this.configCancel = document.getElementById('configCancel');
        this.configTest = document.getElementById('configTest');
        this.configSave = document.getElementById('configSave');
        this.apiKeyInput = document.getElementById('apiKeyInput');
        this.togglePassword = document.getElementById('togglePassword');
        this.configStatus = document.getElementById('configStatus');
        
        // 日志相关元素
        this.logPanel = document.getElementById('logPanel');
        this.logContent = document.getElementById('logContent');
        this.logCount = document.querySelector('.log-count');
        this.autoScrollLog = document.getElementById('autoScrollLog');
        this.clearLogsBtn = document.getElementById('clearLogsBtn');
        this.downloadLogsBtn = document.getElementById('downloadLogsBtn');
        this.toggleLogPanelBtn = document.getElementById('toggleLogPanelBtn');
        
        // 日志管理
        this.logs = [];
        this.maxLogs = 1000;
        
        // 初始化API密钥配置状态
        this.loadApiKeyFromStorage();
        
        // 初始化日志系统
        this.initLogSystem();
        
        // 启动实时日志流连接
        this.startLogStreamConnection();
        
        // 测试Mock思维导图显示
        setTimeout(() => {
            this.testMockMindmap();
        }, 1000);
    }

    bindEvents() {
        // Tab切换事件
        this.jobNameTab.addEventListener('click', () => {
            this.switchTab('jobName');
        });
        
        this.jobDescTab.addEventListener('click', () => {
            this.switchTab('jobDesc');
        });
        
        // 输入框事件
        this.jobTitle.addEventListener('input', () => {
            console.log('📝 职位名称输入变化:', this.jobTitle.value);
            this.updateGenerateButton();
        });
        
        this.jobDescription.addEventListener('input', () => {
            console.log('📝 职位描述输入变化');
            this.updateGenerateButton();
        });

        this.jobTitle.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !this.generateBtn.disabled) {
                this.showContentModal();
            }
        });
        
        // 职位标签快速选择 - 优化版本
        this.jobTags.forEach((tag) => {
            tag.addEventListener('click', (e) => {
                e.preventDefault();
                const job = tag.getAttribute('data-job');
                
                // 快速更新职位名称
                this.jobTitle.value = job;
                
                // 优化的选中状态更新 - 只操作需要变化的元素
                const currentSelected = document.querySelector('.job-tag.selected');
                if (currentSelected && currentSelected !== tag) {
                    currentSelected.classList.remove('selected');
                }
                tag.classList.add('selected');
                
                // 延迟更新按钮状态，避免阻塞UI
                requestAnimationFrame(() => {
                    console.log('🏆 热门职位按钮点击，更新按钮状态');
                    this.updateGenerateButton();
                });
            });
        });
        
        // 文件上传事件
        this.uploadBtn.addEventListener('click', () => {
            this.fileInput.click();
        });
        
        this.fileInput.addEventListener('change', (e) => {
            this.handleFileUpload(e);
        });
        
        // 拖拽上传事件
        this.uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.uploadArea.classList.add('dragover');
        });
        
        this.uploadArea.addEventListener('dragleave', () => {
            this.uploadArea.classList.remove('dragover');
        });
        
        this.uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.uploadArea.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFile(files[0]);
            }
        });
        
        // 生成按钮事件 - 增强版本
        this.generateBtn.addEventListener('click', (e) => {
            console.log('💆 生成按钮被点击!', {
                disabled: this.generateBtn.disabled,
                event: e,
                target: e.target,
                showContentModal: typeof this.showContentModal
            });
            
            if (this.generateBtn.disabled) {
                console.warn('⚠️ 按钮处于禁用状态，取消操作');
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
            
            try {
                // 确保方法存在并调用
                if (typeof this.showContentModal === 'function') {
                    console.log('✅ 调用 showContentModal 方法');
                    this.showContentModal();
                } else {
                    console.error('❌ showContentModal 方法不存在，使用降级方案');
                    this.handleModalFallback();
                }
            } catch (error) {
                console.error('❌ showContentModal 调用失败:', error);
                this.handleModalFallback();
            }
        });
        
        // 内容选择模态框事件
        this.contentClose.addEventListener('click', () => {
            this.hideContentModal();
        });
        
        this.contentCancel.addEventListener('click', () => {
            this.hideContentModal();
        });
        
        this.contentOverlay.addEventListener('click', () => {
            this.hideContentModal();
        });
        
        this.contentConfirm.addEventListener('click', () => {
            this.startGeneration();
        });
        
        // 监听复选框变化
        this.contentOptions.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateContentConfirmButton();
            });
        });


        
        // API配置相关事件
        // 注释掉以避免与fast-init.js中的事件绑定冲突
        // this.configBtn.addEventListener('click', () => {
        //     this.showConfigModal();
        // });
        
        this.configClose.addEventListener('click', () => {
            this.hideConfigModal();
        });
        
        this.configCancel.addEventListener('click', () => {
            this.hideConfigModal();
        });
        
        this.configOverlay.addEventListener('click', () => {
            this.hideConfigModal();
        });
        
        this.togglePassword.addEventListener('click', () => {
            this.togglePasswordVisibility();
        });
        
        // 注释掉以避免与fast-init.js中的事件绑定冲突
        // this.configTest.addEventListener('click', () => {
        //     this.testApiConnection();
        // });
        
        // this.configSave.addEventListener('click', () => {
        //     this.saveApiConfiguration();
        // });
        
        this.apiKeyInput.addEventListener('input', () => {
            this.updateConfigButtons();
        });
        
        // 键盘事件
        this.apiKeyInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                // 注释掉以避免冲突
                // this.saveApiConfiguration();
            }
        });
        
        // 思维导图控制按钮事件
        const expandAllBtn = document.getElementById('expandAll');
        const collapseAllBtn = document.getElementById('collapseAll');
        const downloadMindmapBtn = document.getElementById('downloadMindmap');
        
        if (expandAllBtn) {
            expandAllBtn.addEventListener('click', () => {
                this.expandAllMindmapNodes();
            });
        }
        
        if (collapseAllBtn) {
            collapseAllBtn.addEventListener('click', () => {
                this.collapseAllMindmapNodes();
            });
        }
        
        if (downloadMindmapBtn) {
            downloadMindmapBtn.addEventListener('click', () => {
                this.downloadMindmap();
            });
        }
        
        // 日志相关事件
        if (this.clearLogsBtn) {
            this.clearLogsBtn.addEventListener('click', () => {
                this.clearLogs();
            });
        }
        
        if (this.downloadLogsBtn) {
            this.downloadLogsBtn.addEventListener('click', () => {
                this.downloadLogs();
            });
        }
        
        if (this.toggleLogPanelBtn) {
            this.toggleLogPanelBtn.addEventListener('click', () => {
                this.toggleLogPanel();
            });
        }
    }
    
    // 显示内容选择模态框
    showContentModal() {
        console.log('📋 显示内容选择模态框...');
        console.log('- contentModal存在:', !!this.contentModal);
        console.log('- this指向:', this.constructor.name);
        
        if (!this.contentModal) {
            console.error('❌ contentModal元素不存在');
            this.addLog('error', '❌ 内容选择模态框元素不存在');
            this.handleModalFallback();
            return;
        }
        
        try {
            this.contentModal.classList.add('show');
            this.updateContentConfirmButton();
            console.log('✅ 内容选择模态框已显示');
            this.addLog('info', '📋 内容选择模态框已打开');
        } catch (error) {
            console.error('❌ 显示模态框失败:', error);
            this.addLog('error', '❌ 显示模态框失败: ' + error.message);
            this.handleModalFallback();
        }
    }
    
    // 模态框降级处理方法
    handleModalFallback() {
        console.log('🔄 尝试降级方案显示模态框...');
        
        // 尝试直接找到模态框元素
        const modal = document.getElementById('contentModal') || 
                     document.querySelector('.content-modal');
                     
        if (modal) {
            console.log('✅ 找到模态框元素，直接显示');
            modal.classList.add('show');
            modal.style.display = 'flex';
            
            // 确保有默认选项被选中
            const checkboxes = modal.querySelectorAll('input[name="contentType"]');
            if (checkboxes.length > 0) {
                // 默认选中知识点和面试题
                checkboxes.forEach((cb, index) => {
                    if (cb.value === 'knowledge' || cb.value === 'interview') {
                        cb.checked = true;
                    }
                });
                
                // 启用确认按钮
                const confirmBtn = modal.querySelector('#contentConfirm');
                if (confirmBtn) {
                    confirmBtn.disabled = false;
                    console.log('✅ 确认按钮已启用');
                }
            }
            
            this.addLog('info', '📋 已使用降级方案显示模态框');
        } else {
            console.error('❌ 无法找到模态框元素，直接开始生成');
            this.addLog('warning', '⚠️ 跳过内容选择，使用默认设置开始生成');
            
            // 设置默认内容类型
            this.selectedContentTypes = ['knowledge', 'interview'];
            
            // 直接开始生成
            setTimeout(() => {
                this.startGeneration();
            }, 100);
        }
    }
    
    // 隐藏内容选择模态框
    hideContentModal() {
        if (this.contentModal) {
            this.contentModal.classList.remove('show');
        }
    }
    
    // 更新确认按钮状态
    updateContentConfirmButton() {
        if (this.contentOptions && this.contentConfirm) {
            const checkedOptions = Array.from(this.contentOptions).filter(cb => cb.checked);
            this.contentConfirm.disabled = checkedOptions.length === 0;
        }
    }
    
    // 更新生成按钮状态
    updateGenerateButton() {
        console.log('🔄 正在更新生成按钮状态...');
        
        if (!this.jobTitle || !this.generateBtn) {
            console.warn('⚠️ 关键元素不存在:', {
                jobTitle: !!this.jobTitle,
                generateBtn: !!this.generateBtn
            });
            return;
        }
        
        const hasJobTitle = this.jobTitle.value.trim().length > 0;
        const hasJobDesc = this.jobDescription && this.jobDescription.value.trim().length > 0;
        const hasUploadedFile = this.fileInput && this.fileInput.files.length > 0;
        
        const isJobNameTabActive = this.jobNameContent && this.jobNameContent.classList.contains('active');
        const isValid = isJobNameTabActive ? hasJobTitle : (hasJobDesc || hasUploadedFile);
        
        console.log('📊 按钮状态检查:', {
            hasJobTitle,
            hasJobDesc,
            hasUploadedFile,
            isJobNameTabActive,
            isValid,
            jobTitleValue: this.jobTitle.value
        });
        
        // 强制更新按钮状态
        this.generateBtn.disabled = !isValid;
        this.generateBtn.style.opacity = isValid ? '1' : '0.6';
        this.generateBtn.style.cursor = isValid ? 'pointer' : 'not-allowed';
        
        console.log('✅ 按钮状态已更新:', {
            disabled: this.generateBtn.disabled,
            opacity: this.generateBtn.style.opacity
        });
    }
    
    // 开始生成
    async startGeneration() {
        try {
            // 获取选中的内容类型
            const selectedContentTypes = this.contentOptions ? 
                Array.from(this.contentOptions).filter(cb => cb.checked).map(cb => cb.value) : [];
            
            // 获取职位信息
            const isJobNameTabActive = this.jobNameContent && this.jobNameContent.classList.contains('active');
            let currentJobInfo;
            
            if (isJobNameTabActive && this.jobTitle) {
                currentJobInfo = {
                    type: 'jobName',
                    content: this.jobTitle.value.trim()
                };
            } else if (this.jobDescription) {
                currentJobInfo = {
                    type: 'jobDescription',
                    content: this.jobDescription.value.trim(),
                    file: this.fileInput && this.fileInput.files[0] || null
                };
            }
            
            if (!currentJobInfo || !currentJobInfo.content) {
                this.showToast('请输入职位信息', 'error');
                return;
            }
            
            this.hideContentModal();
            
            // 显示加载状态
            if (this.loadingSection) {
                this.loadingSection.style.display = 'block';
            }
            
            this.addLog('info', `💼 开始分析职位: ${currentJobInfo.content}`);
            this.addLog('info', `🎯 选中内容类型: ${selectedContentTypes.join(', ')}`);
            
            // 保存当前作业信息和内容类型
            this.currentJobInfo = currentJobInfo;
            this.selectedContentTypes = selectedContentTypes;
            
            // 使用模拟数据进行流式显示
            this.addLog('info', '🎭 使用模拟数据进行学习资料生成演示');
            await this.testMockStreamDisplay(currentJobInfo, selectedContentTypes);
            
        } catch (error) {
            console.error('生成失败:', error);
            this.showToast('生成失败，请稍后重试', 'error');
            this.addLog('error', '生成失败: ' + error.message);
            
            // 隐藏加载状态
            if (this.loadingSection) {
                this.loadingSection.style.display = 'none';
            }
        }
    }
    
    // 调用职位分析API（使用流式API）
    async callJobAnalysisAPI(jobInfo, contentTypes) {
        try {
            console.log('🚀 开始流式生成学习方案...');
            this.addLog('info', '🚀 开始调用AI流式生成接口...');
            
            // 使用流式API端点
            const response = await fetch('/api/generate-learning-plan-stream', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    topic: jobInfo.content,
                    apiKey: this.getStoredApiKey(),
                    contentTypes: selectedContentTypes  // 添加用户选择的内容类型
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            // 处理流式响应
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            
            // 存储流式数据
            let streamData = {
                courses: [],
                studyPlan: null,
                exercises: [],
                notes: null,
                progress: null,
                mindmap: null
            };
            
            console.log('📊 开始处理流式响应...');
            this.addLog('info', '📊 正在接收AI流式数据...');
            
            const processStream = async () => {
                try {
                    while (true) {
                        const { done, value } = await reader.read();
                        
                        if (done) {
                            console.log('🏁 流式数据接收完成');
                            this.addLog('success', '✅ 流式数据接收完成');
                            
                            // 显示最终结果
                            this.showJobResults(streamData, jobInfo);
                            return;
                        }
                        
                        buffer += decoder.decode(value, { stream: true });
                        const lines = buffer.split('\n');
                        
                        // 保留最后一行（可能不完整）
                        buffer = lines.pop() || '';
                        
                        for (const line of lines) {
                            if (line.trim() === '') continue;
                            
                            if (line.startsWith('event: ')) {
                                const eventType = line.slice(7).trim();
                                console.log('📡 SSE事件类型:', eventType);
                                continue;
                            }
                            
                            if (line.startsWith('data: ')) {
                                try {
                                    const dataStr = line.slice(6);
                                    const data = JSON.parse(dataStr);
                                    console.log('📊 收到流式数据:', data);
                                    
                                    // 处理流式事件
                                    await this.handleStreamEvent(data, streamData);
                                    
                                } catch (e) {
                                    console.warn('⚠️ 解析流数据失败:', e.message, '原始数据:', line);
                                }
                            }
                        }
                    }
                } catch (streamError) {
                    console.error('❌ 流处理错误:', streamError);
                    this.addLog('error', '❌ 流处理错误: ' + streamError.message);
                    throw streamError;
                }
            };
            
            await processStream();
            
        } catch (error) {
            console.error('API调用失败:', error);
            this.addLog('error', 'API调用失败: ' + error.message);
            
            // 隐藏加载状态
            if (this.loadingSection) {
                this.loadingSection.style.display = 'none';
            }
            
            // 显示错误状态
            if (this.errorSection) {
                this.errorSection.style.display = 'block';
                const errorMessage = this.errorSection.querySelector('#errorMessage');
                if (errorMessage) {
                    errorMessage.textContent = error.message || '生成学习方案时出现错误';
                }
            }
            
            throw error;
        }
    }
    
    // 显示职位分析结果
    showJobResults(result, jobInfo) {
        try {
            // 隐藏加载状态
            if (this.loadingSection) {
                this.loadingSection.style.display = 'none';
            }
            
            // 显示结果区域
            if (this.resultsSection) {
                this.resultsSection.style.display = 'block';
            }
            
            // 更新职位显示
            if (this.topicDisplay) {
                this.topicDisplay.textContent = jobInfo.content;
            }
            
            // 更新生成时间
            if (this.generationTime) {
                this.generationTime.textContent = new Date().toLocaleString();
            }
            
            this.addLog('success', '✅ 学习方案生成完成');
            
        } catch (error) {
            console.error('显示结果失败:', error);
            this.addLog('error', '显示结果失败: ' + error.message);
        }
    }
    
    // Mock数据流式显示测试方法
    async testMockStreamDisplay(jobInfo, contentTypes) {
        try {
            console.log('🧪 开始Mock数据流式显示测试...');
            this.addLog('info', '🧪 开始Mock数据流式显示测试...');
            
            // 检查关键DOM元素
            console.log('🔍 检查关键DOM元素:');
            console.log('- resultsSection:', !!this.resultsSection);
            console.log('- skillsContainer:', !!this.skillsContainer);
            console.log('- topicDisplay:', !!this.topicDisplay);
            console.log('- loadingSection:', !!this.loadingSection);
            
            // 生成基于职位的mock数据
            const topic = jobInfo.content;
            const mockData = this.generateMockJobData(topic, contentTypes);
            console.log('✅ Mock数据快速生成完成:', mockData);
            
            // 强制显示结果区域
            if (this.resultsSection) {
                this.resultsSection.style.display = 'block';
                console.log('✅ 结果区域已显示');
            } else {
                console.error('❌ resultsSection元素不存在');
                this.addLog('error', '❌ resultsSection元素不存在');
                return;
            }
            
            // 更新职位显示
            if (this.topicDisplay) {
                this.topicDisplay.textContent = topic;
                console.log('✅ 职位标题已更新:', topic);
            }
            
            // 检查并清空skillsContainer
            if (this.skillsContainer) {
                this.skillsContainer.innerHTML = '';
                console.log('✅ skillsContainer已清空');
            } else {
                console.error('❌ skillsContainer元素不存在');
                this.addLog('error', '❌ skillsContainer元素不存在');
                return;
            }
            
            // 模拟流式步骤
            const steps = [
                { name: 'skills', label: '分析技能要求', data: mockData.skills, delay: 1000 },
                { name: 'knowledge', label: '生成知识点', data: mockData.knowledge, delay: 1500 },
                { name: 'interview', label: '生成面试题', data: mockData.interview, delay: 1200 },
                { name: 'books', label: '推荐书籍', data: mockData.books, delay: 800 },
                { name: 'certificates', label: '推荐证书', data: mockData.certificates, delay: 1000 },
                { name: 'mindmap', label: '生成思维导图', data: mockData.mindmap, delay: 1500 }
            ];
            
            console.log('📋 准备执行', steps.length, '个步骤');
            this.addLog('info', `📋 准备执行${steps.length}个步骤`);
            
            // 按步骤流式显示
            for (let i = 0; i < steps.length; i++) {
                const step = steps[i];
                console.log(`🔄 开始步骤 ${i + 1}/${steps.length}: ${step.label}`);
                
                // 更新进度
                const progress = ((i + 1) / steps.length) * 100;
                this.updateStreamProgress(`正在${step.label}...`, progress - 20);
                this.addLog('info', `🔄 ${step.label}中...`);
                
                // 模拟生成延迟
                console.log(`⏳ 等待${step.delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, step.delay));
                
                // 显示该步骤的内容
                console.log(`📊 开始显示${step.label}内容...`);
                await this.displayMockStepContent(step.name, step.label, step.data);
                
                // 更新完成进度
                this.updateStreamProgress(`${step.label}完成`, progress);
                this.addLog('success', `✅ ${step.label}完成`);
                
                // 短暂延迟再进行下一步
                await new Promise(resolve => setTimeout(resolve, 300));
                
                console.log(`✅ 步骤 ${i + 1} 完成: ${step.label}`);
            }
            
            // 最终完成
            this.updateStreamProgress('所有内容生成完成', 100);
            this.addLog('success', '🎉 Mock数据流式显示测试完成！');
            
            // 隐藏加载状态
            if (this.loadingSection) {
                this.loadingSection.style.display = 'none';
                console.log('✅ 加载状态已隐藏');
            }
            
            // 更新生成时间
            if (this.generationTime) {
                this.generationTime.textContent = new Date().toLocaleString();
                console.log('✅ 生成时间已更新');
            }
            
            console.log('🎉 Mock数据流式显示测试完成');
            
            // 在后台异步获取真实课程数据并更新显示
            this.loadRealCoursesInBackground(topic);
            
        } catch (error) {
            console.error('❌ Mock数据流式显示测试失败:', error);
            this.addLog('error', '❌ Mock数据流式显示测试失败: ' + error.message);
            
            // 隐藏加载状态
            if (this.loadingSection) {
                this.loadingSection.style.display = 'none';
            }
            throw error;
        }
    }
    
    // 生成Mock思维导图数据
    generateMockMindmapData(topic) {
        const mockMindmap = {
            title: `${topic} 学习路线图`,
            type: 'mock',
            isMcpGenerated: false,
            isFallback: true,
            content: `# ${topic} 学习路线图

## 🎯 基础技能
- HTML5 语义化标签
- CSS3 响应式设计
- JavaScript ES6+ 语法
- Git 版本控制

## 🚀 进阶技能
- React/Vue 框架
- TypeScript 开发
- Webpack 构建工具
- 性能优化技巧

## 🔧 项目实战
- 组件化开发
- 状态管理 (Redux/Vuex)
- API 接口调用
- 单元测试编写

## 📈 职业发展
- 技术方案设计
- 代码审查能力
- 团队协作技能
- 持续学习规划`,
            html: `
                <div class="mindmap-container">
                    <div class="mindmap-fallback">
                        <h3>${topic} 学习思维导图</h3>
                        <div class="mindmap-tree">
                            <div class="tree-node level-0">
                                <div class="node-content">${topic} 学习路线</div>
                                <div class="tree-children">
                                    <div class="tree-node level-1">
                                        <div class="node-content">🎯 基础技能</div>
                                        <div class="tree-children">
                                            <div class="tree-node level-2"><div class="node-content">HTML5 语义化标签</div></div>
                                            <div class="tree-node level-2"><div class="node-content">CSS3 响应式设计</div></div>
                                            <div class="tree-node level-2"><div class="node-content">JavaScript ES6+</div></div>
                                            <div class="tree-node level-2"><div class="node-content">Git 版本控制</div></div>
                                        </div>
                                    </div>
                                    <div class="tree-node level-1">
                                        <div class="node-content">🚀 进阶技能</div>
                                        <div class="tree-children">
                                            <div class="tree-node level-2"><div class="node-content">React/Vue 框架</div></div>
                                            <div class="tree-node level-2"><div class="node-content">TypeScript 开发</div></div>
                                            <div class="tree-node level-2"><div class="node-content">Webpack 构建工具</div></div>
                                            <div class="tree-node level-2"><div class="node-content">性能优化技巧</div></div>
                                        </div>
                                    </div>
                                    <div class="tree-node level-1">
                                        <div class="node-content">🔧 项目实战</div>
                                        <div class="tree-children">
                                            <div class="tree-node level-2"><div class="node-content">组件化开发</div></div>
                                            <div class="tree-node level-2"><div class="node-content">状态管理 (Redux/Vuex)</div></div>
                                            <div class="tree-node level-2"><div class="node-content">API 接口调用</div></div>
                                            <div class="tree-node level-2"><div class="node-content">单元测试编写</div></div>
                                        </div>
                                    </div>
                                    <div class="tree-node level-1">
                                        <div class="node-content">📈 职业发展</div>
                                        <div class="tree-children">
                                            <div class="tree-node level-2"><div class="node-content">技术方案设计</div></div>
                                            <div class="tree-node level-2"><div class="node-content">代码审查能力</div></div>
                                            <div class="tree-node level-2"><div class="node-content">团队协作技能</div></div>
                                            <div class="tree-node level-2"><div class="node-content">持续学习规划</div></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="mindmap-info">
                            <p><strong>🧠 Mock思维导图功能说明：</strong></p>
                            <ul>
                                <li>• 基于职位需求生成的学习路线图</li>
                                <li>• 结构化展示技能层次关系</li>
                                <li>• 支持折叠展开交互操作</li>
                                <li>• 模拟真实AI生成的思维导图效果</li>
                            </ul>
                        </div>
                    </div>
                </div>
            `
        };
        
        return mockMindmap;
    }
    
    // 生成基于职位的Mock数据
    generateMockJobData(jobTitle, contentTypes) {
        console.log('👩‍💼 快速生成Mock数据:', jobTitle);
        
        // 立即返回mock数据，不阻塞页面加载
        const mindmapData = this.generateMockMindmapData(jobTitle);
        
        const mockData = {
            mindmap: mindmapData,
            // 使用Mock课程数据，保证页面快速加载
            courses: [
                {
                    title: `${jobTitle}权威指南`,
                    author: '技术专家',
                    rating: 4.8,
                    description: `${jobTitle}领域的经典教材，适合深入学习`,
                    platform: 'Mock平台',
                    students: 50000,
                    duration: '40小时',
                    difficulty: 'intermediate',
                    price: 299,
                    highlights: ['经典教材', '专家授课'],
                    language: '中文'
                },
                {
                    title: `实战${jobTitle}项目开发`,
                    author: '资深开发者',
                    rating: 4.6,
                    description: '通过实际项目学习最佳实践',
                    platform: 'Mock平台',
                    students: 30000,
                    duration: '60小时',
                    difficulty: 'advanced',
                    price: 399,
                    highlights: ['实战项目', '行业最佳实践'],
                    language: '中文'
                },
                {
                    title: `${jobTitle}设计模式与架构`,
                    author: '架构师',
                    rating: 4.7,
                    description: '高级开发者必读的架构设计书籍',
                    platform: 'Mock平台',
                    students: 20000,
                    duration: '80小时',
                    difficulty: 'expert',
                    price: 599,
                    highlights: ['架构设计', '设计模式'],
                    language: '中文'
                }
            ],
            mindmap: mindmapData,
            skills: {
                core: [
                    `${jobTitle}核心技术栈掌握`,
                    `相关框架和工具使用`,
                    `项目开发经验`,
                    `问题解决能力`,
                    `团队协作能力`
                ],
                technical: [
                    `${jobTitle}专业技能`,
                    `代码编写和调试`,
                    `系统设计能力`,
                    `性能优化经验`,
                    `测试和部署`
                ],
                soft: [
                    '沟通表达能力',
                    '学习能力',
                    '时间管理',
                    '创新思维',
                    '抗压能力'
                ]
            },
            knowledge: {
                basics: [
                    `${jobTitle}基础概念和原理`,
                    `核心技术栈深入理解`,
                    `开发工具和环境配置`,
                    `版本控制和协作流程`,
                    `基本的项目管理知识`
                ],
                advanced: [
                    `${jobTitle}高级特性和最佳实践`,
                    `架构设计和模式应用`,
                    `性能监控和优化策略`,
                    `安全考虑和风险防范`,
                    `持续集成和部署流程`
                ]
            },
            interview: [
                {
                    category: '技术基础',
                    questions: [
                        `请介绍${jobTitle}的核心概念`,
                        `你在${jobTitle}方面有哪些实战经验？`,
                        `如何解决${jobTitle}开发中的常见问题？`,
                        `描述一个你认为最有挑战性的${jobTitle}项目`
                    ]
                },
                {
                    category: '项目经验',
                    questions: [
                        '请介绍一个你负责的重要项目',
                        '在项目中遇到的最大技术难题是什么？',
                        '如何保证代码质量和项目进度？',
                        '团队协作中你是如何发挥作用的？'
                    ]
                },
                {
                    category: '问题解决',
                    questions: [
                        '遇到技术瓶颈时你是如何处理的？',
                        '如何平衡功能实现和性能优化？',
                        '你是如何持续学习和提升技能的？',
                        '对未来技术发展有什么看法？'
                    ]
                }
            ],
            books: [
                {
                    title: `${jobTitle}权威指南`,
                    author: '技术专家',
                    rating: 4.8,
                    description: `${jobTitle}领域的经典教材，适合深入学习`
                },
                {
                    title: `实战${jobTitle}项目开发`,
                    author: '资深开发者',
                    rating: 4.6,
                    description: '通过实际项目学习最佳实践'
                },
                {
                    title: `${jobTitle}设计模式与架构`,
                    author: '架构师',
                    rating: 4.7,
                    description: '高级开发者必读的架构设计书籍'
                }
            ],
            certificates: [
                {
                    name: `${jobTitle}专业认证`,
                    provider: '权威机构',
                    difficulty: '中等',
                    duration: '3-6个月',
                    value: '行业认可度高，提升求职竞争力'
                },
                {
                    name: '相关技术栈认证',
                    provider: '技术厂商',
                    difficulty: '初级',
                    duration: '1-3个月',
                    value: '掌握具体技术工具和平台'
                },
                {
                    name: '项目管理认证',
                    provider: 'PMI',
                    difficulty: '高级',
                    duration: '6-12个月',
                    value: '综合提升项目管理和领导能力'
                }
            ]
        };
        
        console.log('✅ Mock数据生成完成，包含思维导图:', mockData.mindmap.title);
        return mockData;
    }
    
    // 显示Mock步骤内容
    async displayMockStepContent(stepName, stepLabel, stepData) {
        console.log(`📊 开始显示${stepLabel}...`);
        console.log(`- stepName: ${stepName}`);
        console.log(`- stepData:`, stepData);
        
        // 先检查并确保结果区域可见
        if (this.resultsSection) {
            this.resultsSection.style.display = 'block';
            console.log('✅ 结果区域已显示');
        } else {
            console.warn('⚠️ resultsSection不存在');
        }
        
        // 重新获取关键容器元素（防止初始化时丢失）
        if (!this.skillsContainer) {
            this.skillsContainer = document.getElementById('skillsContainer');
            console.log('🔄 重新获取 skillsContainer:', !!this.skillsContainer);
        }
        
        if (!this.mindmapContent) {
            this.mindmapContent = document.getElementById('mindmapContent');
            console.log('🔄 重新获取 mindmapContent:', !!this.mindmapContent);
        }
        
        console.log(`🔍 DOM元素检查:`, {
            skillsContainer: !!this.skillsContainer,
            mindmapContent: !!this.mindmapContent,
            resultsSection: !!this.resultsSection
        });
        
        // 检查skillsContainer是否存在
        if (!this.skillsContainer) {
            console.error(`❌ skillsContainer不存在，无法显示${stepLabel}`);
            this.addLog('error', `❌ skillsContainer不存在，无法显示${stepLabel}`);
            return;
        }
        
        // 添加流式动画效果
        const container = this.skillsContainer;
        container.classList.add('stream-animate');
        
        // 记录当前内容长度
        const beforeLength = container.innerHTML.length;
        console.log(`📏 显示前内容长度: ${beforeLength}`);
        
        // 根据步骤类型显示不同内容
        try {
            switch (stepName) {
                case 'courses':
                    console.log('🎓 开始显示课程数据...');
                    console.log('- 课程数据:', stepData);
                    console.log('- skillsContainer存在:', !!this.skillsContainer);
                    
                    // 确保 skillsContainer 存在
                    if (!this.skillsContainer) {
                        console.error('❌ skillsContainer不存在，尝试重新获取...');
                        this.skillsContainer = document.getElementById('skillsContainer');
                        if (!this.skillsContainer) {
                            console.error('❌ 无法找到skillsContainer，跳过课程显示');
                            this.addLog('error', '❌ 课程容器不存在');
                            break;
                        }
                    }
                    
                    // 确保结果区域可见
                    if (this.resultsSection) {
                        this.resultsSection.style.display = 'block';
                    }
                    
                    // 检查课程数据格式并显示
                    if (Array.isArray(stepData) && stepData.length > 0) {
                        if (stepData[0].platform) {
                            // 真实课程数据，使用displayCourses方法
                            console.log('🎆 检测到真实课程数据，使用专用显示方法');
                            this.displayCourses(stepData);
                        } else {
                            // Mock课程数据，显示为推荐课程
                            console.log('📚 显示Mock课程数据作为推荐课程');
                            await this.displayMockCourses(stepData);
                        }
                    } else {
                        console.warn('⚠️ 课程数据为空或格式不正确，生成默认课程');
                        // 生成默认的mock课程数据
                        const jobTitle = this.topicDisplay?.textContent || '前端工程师';
                        const defaultCourses = [
                            {
                                platform: 'Coursera',
                                title: `${jobTitle}完整教程`,
                                rating: 4.7,
                                students: 15420,
                                duration: '25小时',
                                difficulty: 'beginner',
                                price: 199,
                                highlights: ['终身访问', '实战项目'],
                                description: `深入学习${jobTitle}的核心技能和最佳实践。`
                            },
                            {
                                platform: 'B站',
                                title: `${jobTitle}从入门到精通`,
                                rating: 4.8,
                                students: 23100,
                                duration: '30小时',
                                difficulty: 'beginner',
                                price: 0,
                                highlights: ['完全免费', '中文讲解'],
                                description: '免费优质的中文教程，适合中文学习者入门和进阶。'
                            }
                        ];
                        await this.displayMockCourses(defaultCourses);
                    }
                    break;
                case 'skills':
                    console.log('🎯 开始显示技能数据...');
                    await this.displayMockSkills(stepData);
                    break;
                case 'knowledge':
                    console.log('📚 开始显示知识数据...');
                    await this.displayMockKnowledge(stepData);
                    break;
                case 'interview':
                    console.log('❓ 开始显示面试题数据...');
                    await this.displayMockInterview(stepData);
                    break;
                case 'books':
                    console.log('📖 开始显示书籍数据...');
                    await this.displayMockBooks(stepData);
                    break;
                case 'certificates':
                    console.log('🏆 开始显示证书数据...');
                    await this.displayMockCertificates(stepData);
                    break;
                case 'mindmap':
                    console.log('🧠 开始显示思维导图...');
                    
                    // 先检查 mindmapContent 是否存在
                    if (!this.mindmapContent) {
                        console.warn('⚠️ mindmapContent容器不存在，尝试重新获取...');
                        this.mindmapContent = document.getElementById('mindmapContent');
                        if (!this.mindmapContent) {
                            console.error('❌ 无法找到思维导图容器，跳过显示');
                            this.addLog('error', '❌ 思维导图容器不存在');
                            break;
                        }
                    }
                    
                    // 确保结果区域可见
                    if (this.resultsSection) {
                        this.resultsSection.style.display = 'block';
                    }
                    
                    // 显示思维导图
                    if (stepData) {
                        console.log('✅ 思维导图数据和容器都存在，开始显示');
                        this.displayMindmap(stepData);
                    } else {
                        console.warn('⚠️ 思维导图数据为空，生成Mock数据');
                        const jobTitle = this.topicDisplay?.textContent || '前端工程师';
                        const mockMindmapData = this.generateMockMindmapData(jobTitle);
                        this.displayMindmap(mockMindmapData);
                    }
                    break;
                default:
                    console.warn(`未知的步骤类型: ${stepName}`);
                    this.addLog('warning', `未知的步骤类型: ${stepName}`);
                    return;
            }
            
            // 记录显示后内容长度
            const afterLength = container.innerHTML.length;
            console.log(`📏 显示后内容长度: ${afterLength} (增加: ${afterLength - beforeLength})`);
            
            if (afterLength <= beforeLength) {
                console.warn(`⚠️ 内容长度没有增加，可能显示失败`);
                this.addLog('warning', `${stepLabel}内容可能没有正确显示`);
            } else {
                console.log(`✅ ${stepLabel}内容已成功添加到页面`);
                this.addLog('info', `✅ ${stepLabel}内容已显示`);
            }
            
        } catch (displayError) {
            console.error(`❌ 显示${stepLabel}时发生错误:`, displayError);
            this.addLog('error', `❌ 显示${stepLabel}时发生错误: ${displayError.message}`);
        }
        
        // 移除动画效果
        setTimeout(() => {
            container.classList.remove('stream-animate');
        }, 500);
        
        console.log(`✅ ${stepLabel}显示完成`);
    }
    
    // 显示Mock课程数据
    async displayMockCourses(coursesData) {
        console.log('🎓 开始显示课程数据:', coursesData);
        
        if (!this.skillsContainer) {
            console.error('❌ skillsContainer不存在，无法显示课程');
            return;
        }
        
        // 检查数据格式
        const courses = Array.isArray(coursesData) ? coursesData : [];
        if (courses.length === 0) {
            console.warn('⚠️ 课程数据为空');
            return;
        }
        
        const skillDiv = document.createElement('div');
        skillDiv.className = 'skill-category';
        skillDiv.innerHTML = `
            <div class="skill-header">
                <h3>🎓 推荐课程</h3>
                <div class="skill-summary">共 ${courses.length} 门课程</div>
            </div>
            <div class="skill-content">
                <div class="courses-grid">
                    ${courses.map(course => {
                        const difficulty = this.translateDifficulty(course.difficulty || 'intermediate');
                        const highlights = Array.isArray(course.highlights) ? 
                            course.highlights.join(' • ') : '专业课程';
                        
                        return `
                            <div class="course-card">
                                <div class="course-header">
                                    <h4 class="course-title">${course.title || '未命名课程'}</h4>
                                    <div class="course-platform">${course.platform || '未知平台'}</div>
                                </div>
                                <div class="course-info">
                                    <div class="course-meta">
                                        <span class="rating">⭐ ${course.rating || '4.5'}</span>
                                        <span class="students">👥 ${(course.students || 10000).toLocaleString()}人</span>
                                        <span class="duration">🕰️ ${course.duration || '20小时'}</span>
                                    </div>
                                    <div class="course-meta">
                                        <span class="difficulty">🎯 ${difficulty}</span>
                                        <span class="price">💰 ￥${course.price || 0}</span>
                                        <span class="language">🌍 ${course.language || '中文'}</span>
                                    </div>
                                    <div class="course-highlights">🎆 ${highlights}</div>
                                    ${course.description ? `<p class="course-description">${course.description}</p>` : ''}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
        
    // 显示Mock技能数据
    async displayMockSkills(skillsData) {
        if (!this.skillsContainer) {
            console.error('❌ skillsContainer不存在，无法显示技能');
            return;
        }
        
        if (!skillsData || !skillsData.core || !skillsData.technical || !skillsData.soft) {
            console.error('❌ 技能数据结构不正确:', skillsData);
            return;
        }
        
        try {
            const skillsHtml = `
                <div class="skill-category">
                    <h3>🎯 核心技能要求</h3>
                    <div class="skills-grid">
                        ${skillsData.core.map(skill => `
                            <div class="skill-item">
                                <span class="skill-name">${skill}</span>
                                <div class="skill-level">
                                    <div class="skill-bar" style="width: ${75 + Math.random() * 25}%"></div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="skill-category">
                    <h3>💻 技术技能</h3>
                    <div class="skills-grid">
                        ${skillsData.technical.map(skill => `
                            <div class="skill-item">
                                <span class="skill-name">${skill}</span>
                                <div class="skill-level">
                                    <div class="skill-bar" style="width: ${70 + Math.random() * 30}%"></div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="skill-category">
                    <h3>🤝 软技能</h3>
                    <div class="skills-grid">
                        ${skillsData.soft.map(skill => `
                            <div class="skill-item">
                                <span class="skill-name">${skill}</span>
                                <div class="skill-level">
                                    <div class="skill-bar" style="width: ${60 + Math.random() * 40}%"></div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
            
            console.log('📝 技能 HTML 生成完成，长度:', skillsHtml.length);
            
            // 逐步显示内容
            this.skillsContainer.innerHTML = skillsHtml;
            console.log('✅ 技能 HTML 已设置到 skillsContainer');
            
            // 触发技能条动画
            setTimeout(() => {
                const skillBars = this.skillsContainer.querySelectorAll('.skill-bar');
                console.log(`🎨 找到 ${skillBars.length} 个技能条，开始动画`);
                skillBars.forEach((bar, index) => {
                    bar.style.transition = 'width 0.8s ease';
                    console.log(`- 技能条 ${index + 1}: 宽度 ${bar.style.width}`);
                });
            }, 100);
            
        } catch (error) {
            console.error('❌ 显示技能数据时发生错误:', error);
        }
    }
    
    // 显示Mock知识点（添加到技能下方）
    async displayMockKnowledge(knowledgeData) {
        if (!this.skillsContainer) return;
        
        const knowledgeHtml = `
            <div class="knowledge-section">
                <h3>📚 核心知识点</h3>
                <div class="knowledge-category">
                    <h4>基础知识</h4>
                    <ul class="knowledge-list">
                        ${knowledgeData.basics.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                </div>
                <div class="knowledge-category">
                    <h4>进阶知识</h4>
                    <ul class="knowledge-list">
                        ${knowledgeData.advanced.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;
        
        this.skillsContainer.innerHTML += knowledgeHtml;
    }
    
    // 显示Mock面试题
    async displayMockInterview(interviewData) {
        if (!this.skillsContainer) return;
        
        const interviewHtml = `
            <div class="interview-section">
                <h3>❓ 面试题库</h3>
                ${interviewData.map(category => `
                    <div class="interview-category">
                        <h4>${category.category}</h4>
                        <ul class="interview-questions">
                            ${category.questions.map(question => `<li class="interview-question-item" data-question="${question}">${question}</li>`).join('')}
                        </ul>
                    </div>
                `).join('')}
            </div>
        `;
        
        this.skillsContainer.innerHTML += interviewHtml;
        
        // 为面试题添加点击事件
        this.addInterviewClickEvents();
    }
    
    // 为面试题添加点击事件
    addInterviewClickEvents() {
        const interviewItems = document.querySelectorAll('.interview-question-item');
        
        interviewItems.forEach(item => {
            item.addEventListener('click', () => {
                const question = item.getAttribute('data-question');
                this.fillAIAssistantInput(question);
                
                // 添加点击反馈效果
                item.style.backgroundColor = '#e0e7ff';
                setTimeout(() => {
                    item.style.backgroundColor = '';
                }, 300);
            });
        });
    }
    
    // 填入AI助手输入框
    fillAIAssistantInput(question) {
        // 获取右侧AI助手的输入框
        const chatInput = document.querySelector('#chatInput');
        if (chatInput) {
            chatInput.value = question;
            chatInput.focus();
            
            // 触发input事件以更新发送按钮状态
            const inputEvent = new Event('input', { bubbles: true });
            chatInput.dispatchEvent(inputEvent);
            
            // 显示成功提示
            this.showToast('面试题已填入AI助手，可以直接提问！', 'success');
        } else {
            console.warn('未找到AI助手输入框');
            this.showToast('未找到AI助手输入框', 'error');
        }
    }
    
    // 显示Mock书籍推荐
    async displayMockBooks(booksData) {
        if (!this.skillsContainer) return;
        
        const booksHtml = `
            <div class="books-section">
                <h3>📖 推荐书籍</h3>
                <div class="books-grid">
                    ${booksData.map(book => `
                        <div class="book-item">
                            <h4>${book.title}</h4>
                            <p><strong>作者:</strong> ${book.author}</p>
                            <p><strong>评分:</strong> ⭐ ${book.rating}</p>
                            <p class="book-desc">${book.description}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        this.skillsContainer.innerHTML += booksHtml;
    }
    
    // 显示Mock证书推荐
    async displayMockCertificates(certificatesData) {
        if (!this.skillsContainer) return;
        
        const certificatesHtml = `
            <div class="certificates-section">
                <h3>🏆 推荐证书</h3>
                <div class="certificates-grid">
                    ${certificatesData.map(cert => `
                        <div class="certificate-item">
                            <h4>${cert.name}</h4>
                            <p><strong>认证机构:</strong> ${cert.provider}</p>
                            <p><strong>雾度等级:</strong> ${cert.difficulty}</p>
                            <p><strong>学习周期:</strong> ${cert.duration}</p>
                            <p class="cert-value">${cert.value}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        this.skillsContainer.innerHTML += certificatesHtml;
    }
    
    // Tab切换
    switchTab(tabName) {
        if (!this.jobNameTab || !this.jobDescTab) return;
        
        // 移除所有激活状态
        this.jobNameTab.classList.remove('active');
        this.jobDescTab.classList.remove('active');
        this.jobNameContent.classList.remove('active');
        this.jobDescContent.classList.remove('active');
        
        // 激活对应的tab
        if (tabName === 'jobName') {
            this.jobNameTab.classList.add('active');
            this.jobNameContent.classList.add('active');
        } else {
            this.jobDescTab.classList.add('active');
            this.jobDescContent.classList.add('active');
        }
        
        this.updateGenerateButton();
    }

    updateStartButton() {
        const topic = this.learningTopicInput.value.trim();
        this.startLearningBtn.disabled = topic.length === 0;
        
        if (topic.length > 0) {
            this.startLearningBtn.innerHTML = `
                <i class="fas fa-play"></i>
                开始AI学习规划
            `;
        } else {
            this.startLearningBtn.innerHTML = `
                <i class="fas fa-play"></i>
                请输入学习主题
            `;
        }
    }

    async startLearning() {
        const topic = this.learningTopicInput.value.trim();
        if (!topic) {
            this.showToast('请输入学习主题', 'error');
            return;
        }

        // 检查API密钥配置
        const apiKey = this.getStoredApiKey();
        if (!apiKey) {
            this.showToast('⚠️ 未配置API密钥，将使用模拟数据模式。点击右上角配置API密钥以获取真实AI功能。', 'info', 5000);
        }

        this.showLoading();
        this.hideError();
        this.hideResults();
        
        // 重置所有卡片状态
        this.resetAllCardStatus();

        try {
            const startTime = Date.now();
            
            // 调用后端API
            const result = await this.callLearningAPI(topic);
            
            const duration = Date.now() - startTime;
            this.displayResults(topic, result, duration);
            
        } catch (error) {
            console.error('学习规划生成失败:', error);
            this.showError(error.message || '生成学习方案时出现错误，请重试');
        }
    }

    async callLearningAPI(topic) {
        // 开始步骤动画
        this.startStepAnimation();
        
        try {
            // 检查是否支持流式输出
            const useStreaming = true; // 默认使用流式输出
            
            if (useStreaming) {
                return await this.callStreamingAPI(topic);
            } else {
                return await this.callRegularAPI(topic);
            }
            
        } catch (error) {
            console.error('❌ API调用失败:', error.message);
            throw error;
        }
    }
    
    // 流式API调用
    async callStreamingAPI(topic) {
        return new Promise((resolve, reject) => {
            try {
                // 创建一个FormData或者使用POST请求体的方式
                const requestBody = JSON.stringify({ 
                    topic,
                    apiKey: this.getStoredApiKey()
                });
                
                // 使用fetch发送POST请求启动流式生成
                fetch('/api/generate-learning-plan-stream', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: requestBody
                }).then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    
                    // 使用流式读取响应
                    const reader = response.body.getReader();
                    const decoder = new TextDecoder();
                    let buffer = '';
                    
                    // 存储流式数据
                    let streamData = {
                        courses: [],
                        studyPlan: null,
                        exercises: [],
                        notes: null,
                        progress: null
                    };
                    
                    const processStream = async () => {
                        try {
                            while (true) {
                                const { done, value } = await reader.read();
                                
                                if (done) {
                                    console.log('🔚 流式数据接收完成');
                                    resolve(streamData);
                                    break;
                                }
                                
                                buffer += decoder.decode(value, { stream: true });
                                const lines = buffer.split('\n');
                                
                                // 保留最后一行（可能不完整）
                                buffer = lines.pop() || '';
                                
                                for (const line of lines) {
                                    if (line.trim() === '') continue;
                                    
                                    if (line.startsWith('event: ')) {
                                        console.log('📡 SSE事件类型:', line.slice(7));
                                        continue;
                                    }
                                    
                                    if (line.startsWith('data: ')) {
                                        try {
                                            const dataStr = line.slice(6);
                                            console.log('📊 原始数据:', dataStr);
                                            const data = JSON.parse(dataStr);
                                            console.log('✅ 解析成功:', data);
                                            await this.handleStreamEvent(data, streamData);
                                        } catch (e) {
                                            console.warn('❌ 解析流数据失败:', e, line);
                                        }
                                    }
                                }
                            }
                        } catch (streamError) {
                            console.error('❌ 流处理错误:', streamError);
                            reject(streamError);
                        }
                    };
                    
                    processStream();
                    
                }).catch(fetchError => {
                    console.error('❌ Fetch请求失败:', fetchError);
                    reject(fetchError);
                });
                
            } catch (error) {
                console.error('❌ 流式请求初始化失败:', error);
                reject(error);
            }
        }).catch(error => {
            console.warn('❌ 流式请求失败，回退到普通API:', error);
            return this.callRegularAPI(topic);
        });
    }
    
    // 处理流式事件
    async handleStreamEvent(data, streamData) {
        console.log('📊 流式事件:', data);
        console.log('🔎 流式事件类型:', typeof data, '数据内容:', JSON.stringify(data, null, 2));
        
        // 处理开始事件
        if (data.message && data.message.includes('开始生成')) {
            this.addLog('info', '🚀 ' + data.message);
            return;
        }
        
        // 根据事件类型处理
        if (data.step) {
            console.log(`🔄 处理步骤: ${data.step}, 进度: ${data.progress}%`);
            this.addLog('info', `🔄 ${data.message || data.step}`);
            
            // 更新进度条
            this.updateStreamProgress(data.message, data.progress);
            this.updateStepProgress(data.step, data.progress);
            
            // 如果有数据，更新对应部分
            if (data.data) {
                console.log(`📊 收到 ${data.step} 数据:`, data.data);
                console.log(`🎆 即将显示 ${data.step} 内容...`);
                
                // 显示结果区域（如果还没显示）
                if (this.resultsSection && this.resultsSection.style.display !== 'block') {
                    this.resultsSection.style.display = 'block';
                    console.log('✅ 显示结果区域');
                }
                
                switch (data.step) {
                    case 'courses':
                        // 在第一次收到courses数据时清空容器，避免新旧内容混合
                        if (!streamData._containerCleared) {
                            console.log('🧹 第一次收到courses数据，清空容器');
                            if (this.skillsContainer) {
                                this.skillsContainer.innerHTML = '';
                                streamData._containerCleared = true;
                                console.log('✅ skillsContainer 已清空');
                            }
                        }
                        streamData.courses = data.data;
                        console.log('🎓 开始显示课程推荐...');
                        this.displayStreamCourses(data.data);
                        this.addLog('success', '✅ 课程推荐生成完成');
                        console.log('✅ 课程推荐显示完成');
                        break;
                    case 'studyPlan':
                        streamData.studyPlan = data.data;
                        console.log('📋 开始显示学习计划...');
                        this.displayStreamStudyPlan(data.data);
                        this.addLog('success', '✅ 学习计划生成完成');
                        console.log('✅ 学习计划显示完成');
                        break;
                    case 'exercises':
                        streamData.exercises = data.data;
                        console.log('📝 开始显示练习题...');
                        this.displayStreamExercises(data.data);
                        this.addLog('success', '✅ 练习题生成完成');
                        console.log('✅ 练习题显示完成');
                        break;
                    case 'notes':
                        streamData.notes = data.data;
                        console.log('📖 开始显示学习笔记...');
                        this.displayStreamNotes(data.data);
                        this.addLog('success', '✅ 学习笔记生成完成');
                        console.log('✅ 学习笔记显示完成');
                        break;
                    case 'progress':
                        streamData.progress = data.data;
                        console.log('📈 开始显示进度跟踪...');
                        this.displayStreamProgress(data.data);
                        this.addLog('success', '✅ 进度跟踪设置完成');
                        console.log('✅ 进度跟踪显示完成');
                        break;
                    case 'mindmap':
                        streamData.mindmap = data.data;
                        console.log('🧠 开始显示思维导图...');
                        this.displayStreamMindmap(data.data);
                        this.addLog('success', '✅ 思维导图生成完成');
                        console.log('✅ 思维导图显示完成');
                        break;
                    default:
                        console.warn(`⚠️ 未知的步骤类型: ${data.step}`);
                }
            } else {
                console.warn(`⚠️ ${data.step} 步骤没有数据`);
            }
        }
        
        // 处理完成事件
        if (data.result) {
            console.log('✅ 流式生成完成，更新最终结果');
            console.log('📊 最终结果数据:', data.result);
            
            // 在显示最终结果之前清空容器，确保只显示最新内容
            if (!streamData._finalContainerCleared && this.skillsContainer) {
                console.log('🧹 清空容器以显示最终结果');
                this.skillsContainer.innerHTML = '';
                streamData._finalContainerCleared = true;
                console.log('✅ 最终结果显示前容器已清空');
            }
            
            Object.assign(streamData, data.result);
            
            // 确保显示最终结果中的所有内容
            if (data.result.courses && data.result.courses.length > 0) {
                console.log('🎓 显示最终课程结果:', data.result.courses);
                console.log('🔥 即将调用 displayStreamCourses 方法');
                this.displayStreamCourses(data.result.courses);
                console.log('✅ displayStreamCourses 调用完成');
            }
            
            if (data.result.studyPlan) {
                console.log('📋 显示最终学习计划:', data.result.studyPlan);
                this.displayStreamStudyPlan(data.result.studyPlan);
            }
            
            if (data.result.exercises) {
                console.log('📝 显示最终练习题:', data.result.exercises);
                this.displayStreamExercises(data.result.exercises);
            }
            
            if (data.result.notes) {
                console.log('📖 显示最终学习笔记:', data.result.notes);
                this.displayStreamNotes(data.result.notes);
            }
            
            if (data.result.progress) {
                console.log('📈 显示最终进度跟踪:', data.result.progress);
                this.displayStreamProgress(data.result.progress);
            }
            
            if (data.result.mindmap) {
                console.log('🧠 显示最终思维导图:', data.result.mindmap);
                this.displayStreamMindmap(data.result.mindmap);
            }
            
            this.updateStreamProgress(data.message || '生成完成', 100);
            this.addLog('success', '🎉 学习方案生成完成！');
            
            // 隐藏加载状态
            if (this.loadingSection) {
                this.loadingSection.style.display = 'none';
            }
        }
        
        // 处理错误事件
        if (data.error) {
            console.error('❌ 流式生成错误:', data.error);
            this.addLog('error', '❌ 流式生成错误: ' + data.error);
            throw new Error(data.error);
        }
    }
    
    // 更新流式进度条
    updateStreamProgress(message, progress) {
        const progressBar = document.querySelector('.progress-bar');
        const progressText = document.querySelector('.progress-text');
        
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
            progressBar.style.transition = 'width 0.3s ease';
        }
        
        if (progressText) {
            progressText.textContent = `${Math.round(progress)}%`;
        }
        
        console.log(`📈 进度更新: ${message} (${progress}%)`);
    }
    
    // 更新步骤进度
    updateStepProgress(stepName, progress) {
        const stepMap = {
            'courses': 'step1',
            'studyPlan': 'step2', 
            'exercises': 'step3',
            'notes': 'step4',
            'progress': 'step5'
        };
        
        const stepId = stepMap[stepName];
        if (stepId) {
            const stepElement = document.getElementById(stepId);
            if (stepElement) {
                stepElement.classList.add('active');
                if (progress >= 100) {
                    stepElement.classList.add('completed');
                }
                
                // 添加流式动画效果
                stepElement.classList.add('stream-animate');
                setTimeout(() => {
                    stepElement.classList.remove('stream-animate');
                }, 500);
            }
        }
    }
    
    // 流式显示课程推荐
    displayStreamCourses(courses) {
        console.log('🎓 displayStreamCourses 被调用，课程数据:', courses);
        console.log('🔍 检查页面元素状态:', {
            coursesContent: !!this.coursesContent,
            skillsContainer: !!this.skillsContainer,
            resultsSection: !!this.resultsSection
        });
        
        this.hideLoading();
        this.showResults();
        
        // 设置状态为生成中
        this.updateCardStatus('courses', 'generating');
        
        const coursesCard = document.getElementById('coursesCard');
        if (coursesCard) {
            coursesCard.classList.add('stream-animate');
            setTimeout(() => coursesCard.classList.remove('stream-animate'), 500);
        }
        
        this.displayCourses(courses);
        console.log('✅ displayStreamCourses 调用完成');
    }
    
    // 流式显示学习计划
    displayStreamStudyPlan(studyPlan) {
        this.showResults(); // 确保结果区域可见
        
        // 设置状态为生成中
        this.updateCardStatus('studyPlan', 'generating');
        
        const studyPlanCard = document.getElementById('studyPlanCard');
        if (studyPlanCard) {
            studyPlanCard.classList.add('stream-animate');
            setTimeout(() => studyPlanCard.classList.remove('stream-animate'), 500);
        }
        
        if (studyPlan) {
            this.displayStudyPlan(studyPlan);
        } else {
            console.warn('⚠️ 流式学习计划数据为空');
        }
    }
    
    // 流式显示练习题
    displayStreamExercises(exercises) {
        this.showResults(); // 确保结果区域可见
        
        // 设置状态为生成中
        this.updateCardStatus('exercises', 'generating');
        
        const exercisesCard = document.getElementById('exercisesCard');
        if (exercisesCard) {
            exercisesCard.classList.add('stream-animate');
            setTimeout(() => exercisesCard.classList.remove('stream-animate'), 500);
        }
        
        if (exercises) {
            this.displayExercises(exercises);
        } else {
            console.warn('⚠️ 流式练习题数据为空');
        }
    }
    
    // 流式显示学习笔记
    displayStreamNotes(notes) {
        this.showResults(); // 确保结果区域可见
        
        // 设置状态为生成中
        this.updateCardStatus('notes', 'generating');
        
        const notesCard = document.getElementById('notesCard');
        if (notesCard) {
            notesCard.classList.add('stream-animate');
            setTimeout(() => notesCard.classList.remove('stream-animate'), 500);
        }
        
        if (notes) {
            this.displayNotes(notes);
        } else {
            console.warn('⚠️ 流式学习笔记数据为空');
        }
    }
    
    // 流式显示进度跟踪
    displayStreamProgress(progress) {
        this.showResults(); // 确保结果区域可见
        
        // 设置状态为生成中
        this.updateCardStatus('progress', 'generating');
        
        const progressCard = document.getElementById('progressCard');
        if (progressCard) {
            progressCard.classList.add('stream-animate');
            setTimeout(() => progressCard.classList.remove('stream-animate'), 500);
        }
        
        if (progress) {
            this.displayProgress(progress);
        } else {
            console.warn('⚠️ 流式进度跟踪数据为空');
        }
    }
    
    // 流式显示思维导图
    displayStreamMindmap(mindmapData) {
        console.log('🌊 开始流式显示思维导图...');
        console.log('- 传入数据:', mindmapData);
        console.log('- mindmapContent元素:', !!this.mindmapContent);
        
        this.showResults(); // 确保结果区域可见
        
        // 设置状态为生成中
        this.updateCardStatus('mindmap', 'generating');
        
        const mindmapCard = document.getElementById('mindmapCard');
        if (mindmapCard) {
            mindmapCard.classList.add('stream-animate');
            setTimeout(() => mindmapCard.classList.remove('stream-animate'), 500);
        }
        
        // 如果没有数据，生成Mock数据
        if (!mindmapData) {
            console.log('📝 没有思维导图数据，生成Mock数据');
            const topic = this.topicDisplay?.textContent || '前端工程师';
            mindmapData = this.generateMockMindmapData(topic);
            console.log('✅ Mock数据生成完成:', mindmapData.title);
        }
        
        console.log('🧠 准备调用 displayMindmap 方法...');
        this.addLog('info', '🧠 正在显示思维导图...');
        
        try {
            this.displayMindmap(mindmapData);
            this.addLog('success', '✅ 思维导图生成完成');
            console.log('✅ 思维导图显示完成');
        } catch (error) {
            console.error('❌ 流式显示思维导图失败:', error);
            this.addLog('error', '❌ 思维导图显示失败: ' + error.message);
        }
    }
    
    // 普通API调用（原有逻辑）
    async callRegularAPI(topic) {
        // 调用后端API
        const response = await fetch('/api/generate-learning-plan', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                topic,
                apiKey: this.getStoredApiKey() // 添加前端配置的API密钥
            })
        });

        const result = await response.json();
        
        if (!response.ok) {
            // 检查是否是API密钥问题
            if (result.error && result.error.includes('API密钥')) {
                throw new Error(`需要配置AI模型API密钥才能使用真AI功能。

请点击右上角的“配置API”按钮设置API密钥。

当前错误：${result.error}`);
            } else {
                throw new Error(result.error || `API调用失败: ${response.status}`);
            }
        }

        // 模拟完成所有步骤
        await this.simulateSteps();
        
        return result;
    }

    async generateMockData(topic) {
        // 模拟API调用延迟和步骤进度
        await this.simulateSteps();
        
        return {
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
                outline: `# ${topic}学习大纲
## I. 基础概念
- 核心定义和特点
- 发展历史和趋势
- 应用领域和场景

## II. 核心知识点
- 基本语法和规则
- 重要概念和原理
- 常用工具和库

## III. 实践应用
- 入门项目练习
- 实战案例分析
- 最佳实践总结

## IV. 进阶学习
- 高级特性探索
- 性能优化技巧
- 生态系统了解`,
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
    }

    async simulateSteps() {
        for (let i = 0; i < this.steps.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));
            this.updateStepStatus(i);
        }
    }

    startStepAnimation() {
        this.currentStep = 0;
        this.steps.forEach((step, index) => {
            const stepElement = document.getElementById(step);
            stepElement.classList.remove('active', 'completed');
            if (index === 0) {
                stepElement.classList.add('active');
            }
        });
    }

    updateStepStatus(stepIndex) {
        if (stepIndex > 0) {
            const prevStep = document.getElementById(this.steps[stepIndex - 1]);
            prevStep.classList.remove('active');
            prevStep.classList.add('completed');
        }
        
        if (stepIndex < this.steps.length) {
            const currentStep = document.getElementById(this.steps[stepIndex]);
            currentStep.classList.add('active');
        }
    }

    displayResults(topic, result, duration) {
        this.hideLoading();
        this.showResults();
        
        // 更新结果头部信息
        this.topicDisplay.textContent = topic;
        this.generationTime.textContent = `生成时间: ${(duration / 1000).toFixed(1)}秒`;
        
        // 显示课程推荐
        this.displayCourses(result.courses);
        
        // 显示学习计划
        this.displayStudyPlan(result.studyPlan);
        
        // 显示练习题
        this.displayExercises(result.exercises);
        
        // 显示学习笔记
        this.displayNotes(result.notes);
        
        // 显示进度信息
        this.displayProgress(result.progress);
        
        // 显示思维导图（如果有的话）
        if (result.mindmap || result.studyPlan) {
            // 优先显示结果中的思维导图数据，否则使用学习计划生成思维导图
            const mindmapData = result.mindmap || this.generateMindmapFromStudyPlan(result.studyPlan, topic);
            this.displayMindmap(mindmapData);
        }
        
        // 添加淡入动画
        this.resultsSection.classList.add('fade-in-up');
        
        this.showToast('学习方案生成成功！', 'success');
    }

    // 更新卡片状态
    updateCardStatus(cardType, status) {
        const statusElement = document.getElementById(`${cardType}Status`);
        if (statusElement) {
            statusElement.className = `card-status ${status}`;
            const statusText = {
                'waiting': '等待中',
                'generating': '生成中', 
                'completed': '已完成',
                'error': '生成失败'
            };
            statusElement.textContent = statusText[status] || status;
        }
    }

    // 重置所有卡片状态为等待中
    resetAllCardStatus() {
        const cardTypes = ['courses', 'studyPlan', 'exercises', 'notes', 'mindmap', 'progress'];
        cardTypes.forEach(type => {
            this.updateCardStatus(type, 'waiting');
        });
    }

    displayCourses(courses) {
        console.log('🚀 displayCourses 方法开始执行，课程数据:', courses);
        console.log('🔍 检查 DOM 元素:', {
            coursesContent: this.coursesContent,
            skillsContainer: this.skillsContainer,
            coursesContentExists: !!this.coursesContent,
            skillsContainerExists: !!this.skillsContainer,
            isCoursesContentSameAsSkills: this.coursesContent === this.skillsContainer
        });
        
        if (!courses || !Array.isArray(courses) || courses.length === 0) {
            console.warn('⚠️ 课程数据为空或无效');
            if (this.coursesContent) {
                this.coursesContent.innerHTML = '<p>⚠️ 暂无课程推荐数据</p>';
                this.updateCardStatus('courses', 'error');
            } else {
                console.warn('⚠️ coursesContent元素不存在，使用skillsContainer作为备用');
            }
            return;
        }
        
        // 为课程添加链接
        const addCourseLink = (course) => {
            const baseUrls = {
                'Coursera': 'https://www.coursera.org/search?query=',
                'Udemy': 'https://www.udemy.com/courses/search/?q=',
                'B站': 'https://search.bilibili.com/all?keyword=',
                '网易云课堂': 'https://study.163.com/courses-search/search.htm?keyword=',
                '腾讯课堂': 'https://ke.qq.com/course/list?mt=1001&st=2001&tt=-1&tk='
            };
            
            const baseUrl = baseUrls[course.platform] || '#';
            const searchQuery = encodeURIComponent(course.title || '未命名课程');
            return baseUrl === '#' ? '#' : baseUrl + searchQuery;
        };
        
        const html = `
            <h4>为您推荐 ${courses.length} 门优质课程：</h4>
            <ul>
                ${courses.map(course => {
                    const link = addCourseLink(course);
                    const rating = course.rating ? parseFloat(course.rating).toFixed(1) : 'N/A';
                    const students = course.students ? course.students.toLocaleString() : '0';
                    const difficulty = this.translateDifficulty(course.difficulty || 'unknown');
                    return `
                        <li>
                            <strong>
                                <a href="${link}" target="_blank" style="color: #4f46e5; text-decoration: none;">
                                    ${course.title || '未命名课程'} 🔗
                                </a>
                            </strong> (${course.platform || '未知平台'})
                            <br>⭐ 评分: ${rating}/5 | 👥 学生: ${students}人 | ⏱️ 时长: ${course.duration || '未知'}
                            <br>💰 价格: ${course.price === 0 ? '免费' : '¥' + (course.price || '未知')} | 📊 难度: ${difficulty}
                        </li>
                    `;
                }).join('')}
            </ul>
        `;
        
        // 尝试使用coursesContent，如果不存在则使用skillsContainer
        if (this.coursesContent && this.coursesContent !== this.skillsContainer) {
            console.log('✅ 使用 coursesContent 显示课程');
            this.coursesContent.innerHTML = html;
            this.updateCardStatus('courses', 'completed');
        } else {
            // 备用方案：使用skillsContainer显示
            console.log('🔄 使用skillsContainer作为备用显示区域');
            console.log('🔍 skillsContainer 检查:', {
                exists: !!this.skillsContainer,
                element: this.skillsContainer
            });
            
            if (!this.skillsContainer) {
                console.error('⚠️ skillsContainer也不存在，无法显示课程');
                return;
            }
            
            // 确保显示结果区域
            if (this.resultsSection) {
                console.log('📺 显示结果区域');
                this.resultsSection.style.display = 'block';
            }
            
            // 直接创建课程分类显示
            const skillDiv = document.createElement('div');
            skillDiv.className = 'skill-category';
            skillDiv.innerHTML = `
                <div class="skill-header" onclick="this.parentElement.classList.toggle('collapsed')">
                    <h3 class="skill-title">
                        <i class="fas fa-graduation-cap"></i>
                        🎓 推荐课程 (共${courses.length}门)
                    </h3>
                    <i class="fas fa-chevron-down skill-toggle"></i>
                </div>
                <div class="skill-content">
                    <div class="content-types">
                        <div class="content-type">
                            <div class="content-type-header">
                                <i class="fas fa-graduation-cap"></i>
                                真实搜索的优质课程
                            </div>
                            <div class="content-type-body">
                                ${courses.map(course => {
                                    const link = addCourseLink(course);
                                    const rating = course.rating ? parseFloat(course.rating).toFixed(1) : 'N/A';
                                    const students = course.students ? course.students.toLocaleString() : '0';
                                    const difficulty = this.translateDifficulty(course.difficulty || 'unknown');
                                    const highlights = course.highlights ? course.highlights.join('、') : '';
                                    return `
                                        <div class="content-item course-item" style="margin-bottom: 1.5rem; padding: 1rem; border: 1px solid #e5e5e5; border-radius: 8px; background: #f9f9f9;">
                                            <h4 style="margin: 0 0 0.5rem 0;">
                                                <a href="${link}" target="_blank" style="color: #4f46e5; text-decoration: none; font-weight: bold;">
                                                    ${course.title || '未命名课程'} 🔗
                                                </a>
                                            </h4>
                                            <div style="margin-bottom: 0.5rem; color: #666;">
                                                <span style="display: inline-block; margin-right: 1rem;">🏢 ${course.platform || '未知平台'}</span>
                                                <span style="display: inline-block; margin-right: 1rem;">⭐ ${rating}/5</span>
                                                <span style="display: inline-block; margin-right: 1rem;">👥 ${students}人</span>
                                                <span style="display: inline-block; margin-right: 1rem;">⏱️ ${course.duration || '未知'}</span>
                                            </div>
                                            <div style="margin-bottom: 0.5rem; color: #666;">
                                                <span style="display: inline-block; margin-right: 1rem;">💰 ${course.price === 0 ? '免费' : '￥' + (course.price || '未知')}</span>
                                                <span style="display: inline-block; margin-right: 1rem;">📊 ${difficulty}</span>
                                                <span style="display: inline-block;">🌍 ${course.language || '未知'}</span>
                                            </div>
                                            ${highlights ? `<div style="margin-bottom: 0.5rem;"><span style="color: #059669; font-weight: bold;">🎆 亮点：</span> ${highlights}</div>` : ''}
                                            ${course.description ? `<p style="margin: 0.5rem 0 0 0; color: #444; font-size: 0.9rem;">${course.description}</p>` : ''}
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            this.skillsContainer.appendChild(skillDiv);
            console.log(`✅ 成功显示 ${courses.length} 门真实搜索的课程！`);
            console.log('📊 最终 skillsContainer 内容:', this.skillsContainer.innerHTML.substring(0, 200) + '...');
        }
    }
    
    // 翻译难度级别
    translateDifficulty(difficulty) {
        const difficultyMap = {
            'beginner': '初级',
            'intermediate': '中级', 
            'advanced': '高级',
            'expert': '专家级',
            'unknown': '未知'
        };
        return difficultyMap[difficulty] || '未知';
    }
    
    // 从学习计划生成思维导图数据
    generateMindmapFromStudyPlan(studyPlan, topic) {
        if (!studyPlan) {
            return {
                type: 'mindmap',
                title: `${topic} 思维导图`,
                content: `# ${topic} 学习思维导图\n\n暂无学习计划数据`,
                isFallback: true,
                html: `<div class="mindmap-fallback">\n    <h3>${topic} 思维导图</h3>\n    <p>暂无学习计划数据</p>\n</div>`
            };
        }
        
        let markdownContent = `# ${topic} 学习思维导图\n\n`;
        
        if (studyPlan.goal) {
            markdownContent += `## 🎯 学习目标\n- ${studyPlan.goal}\n\n`;
        }
        
        if (studyPlan.timeframe) {
            markdownContent += `## ⏰ 时间框架\n- ${studyPlan.timeframe}\n\n`;
        }
        
        if (studyPlan.phases && studyPlan.phases.length > 0) {
            markdownContent += `## 📅 学习阶段\n\n`;
            studyPlan.phases.forEach((phase, index) => {
                markdownContent += `### ${phase.name || `第${index + 1}阶段`}\n`;
                if (phase.tasks && phase.tasks.length > 0) {
                    phase.tasks.forEach(task => {
                        markdownContent += `- ${task}\n`;
                    });
                }
                markdownContent += '\n';
            });
        }
        
        return {
            type: 'mindmap',
            title: `${topic} 学习思维导图`,
            content: markdownContent,
            isFallback: true,
            html: `<div class="mindmap-fallback">\n    <h3>${topic} 学习思维导图</h3>\n    <div class="mindmap-content">${markdownContent.replace(/\n/g, '<br>')}</div>\n    <div style="margin-top: 1rem; padding: 1rem; background: #f0f9ff; border-radius: 8px; border: 1px solid #0ea5e9;">\n        <p><strong>📝 思维导图功能说明：</strong></p>\n        <ul style="margin: 0.5rem 0; padding-left: 1.5rem;">\n            <li>• 基于学习计划自动生成思维导图</li>\n            <li>• 可视化展示学习路径和阶段</li>\n            <li>• 帮助理解学习结构和重点</li>\n        </ul>\n    </div>\n</div>`
        };
    }

    displayStudyPlan(studyPlan) {
        if (!studyPlan) {
            console.warn('⚠️ 学习计划数据为空');
            this.studyPlanContent.innerHTML = '<p>⚠️ 学习计划生成失败，请重试</p>';
            this.updateCardStatus('studyPlan', 'error');
            return;
        }
        
        const html = `
            <h4>📋 个性化学习计划</h4>
            <p><strong>🎯 学习目标:</strong> ${studyPlan.goal || '暂无'}</p>
            <p><strong>⏰ 时间框架:</strong> ${studyPlan.timeframe || '暂无'}</p>
            
            <h4>📅 阶段规划:</h4>
            <ul>
                ${(studyPlan.phases || []).map(phase => `
                    <li>
                        <strong>${phase.name || '未命名阶段'}</strong>
                        <ul>
                            ${(phase.tasks || []).map(task => `<li>${task}</li>`).join('')}
                        </ul>
                    </li>
                `).join('')}
            </ul>
        `;
        this.studyPlanContent.innerHTML = html;
        this.updateCardStatus('studyPlan', 'completed');
    }

    displayExercises(exercises) {
        if (!exercises || !Array.isArray(exercises) || exercises.length === 0) {
            console.warn('⚠️ 练习题数据为空或无效');
            this.exercisesContent.innerHTML = '<p>⚠️ 暂无练习题数据</p>';
            this.updateCardStatus('exercises', 'error');
            return;
        }
        
        const html = `
            <h4>📝 个性化练习题：</h4>
            <ul>
                ${exercises.map((exercise, index) => `
                    <li>${index + 1}. ${exercise || '空题目'}</li>
                `).join('')}
            </ul>
            <p>💡 <em>完成这些练习来巩固学习成果，加深理解。</em></p>
        `;
        this.exercisesContent.innerHTML = html;
        this.updateCardStatus('exercises', 'completed');
    }

    displayNotes(notes) {
        if (!notes) {
            console.warn('⚠️ 笔记数据为空');
            this.notesContent.innerHTML = '<p>⚠️ 暂无学习笔记数据</p>';
            this.updateCardStatus('notes', 'error');
            return;
        }
        
        // 将Markdown转换为HTML
        const markdownToHtml = this.convertMarkdownToHtml(notes.outline || '');
        
        const html = `
            <h4>📖 结构化学习笔记：</h4>
            <div class="markdown-content" style="background: #f8f9fa; padding: 1.5rem; border-radius: 8px; margin: 1rem 0; border-left: 4px solid var(--primary-color);">
                ${markdownToHtml}
            </div>
            
            <h4>🔑 关键知识点：</h4>
            <ul>
                ${(notes.keyPoints || []).map(point => `<li>${point || '空内容'}</li>`).join('')}
            </ul>
        `;
        this.notesContent.innerHTML = html;
        this.updateCardStatus('notes', 'completed');
    }

    // 简单的Markdown转HTML功能
    convertMarkdownToHtml(markdown) {
        if (!markdown) return '';
        
        let html = markdown
            // 转换标题
            .replace(/^# (.*$)/gm, '<h1 class="md-h1">$1</h1>')
            .replace(/^## (.*$)/gm, '<h2 class="md-h2">$1</h2>')
            .replace(/^### (.*$)/gm, '<h3 class="md-h3">$1</h3>')
            .replace(/^#### (.*$)/gm, '<h4 class="md-h4">$1</h4>')
            .replace(/^##### (.*$)/gm, '<h5 class="md-h5">$1</h5>')
            .replace(/^###### (.*$)/gm, '<h6 class="md-h6">$1</h6>')
            // 转换列表项
            .replace(/^- (.*$)/gm, '<li class="md-li">$1</li>')
            // 转换粗体
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            // 转换斜体
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            // 转换行内代码
            .replace(/`(.*?)`/g, '<code class="md-code">$1</code>')
            // 转换换行
            .replace(/\n/g, '<br>');
            
        // 包装连续的列表项为ul标签
        html = html.replace(/(<li class="md-li">.*?<\/li>)(<br>)*(?=<li class="md-li">|$)/gs, (match) => {
            const items = match.match(/<li class="md-li">.*?<\/li>/g);
            if (items && items.length > 0) {
                return `<ul class="md-ul">${items.join('')}</ul>`;
            }
            return match;
        });
        
        // 清理多余的br标签
        html = html.replace(/(<br>){3,}/g, '<br><br>');
        
        return html;
    }

    displayProgress(progress) {
        if (!progress) {
            console.warn('⚠️ 进度数据为空');
            this.progressContent.innerHTML = '<p>⚠️ 暂无进度跟踪数据</p>';
            this.updateCardStatus('progress', 'error');
            return;
        }
        
        const html = `
            <h4>📊 学习进度设置：</h4>
            <p><strong>📈 当前水平:</strong> ${progress.level || '暂无数据'}</p>
            <p><strong>🎯 完成任务:</strong> ${progress.completedCount || 0}个</p>
            <p><strong>⏱️ 总学习时长:</strong> ${progress.totalTime || 0}小时</p>
            <p><strong>⚡ 学习效率:</strong> ${progress.efficiency || 0}/10</p>
            
            <h4>💡 学习建议：</h4>
            <ul>
                ${(progress.recommendations || []).map(rec => `<li>${rec || '空内容'}</li>`).join('')}
            </ul>
        `;
        this.progressContent.innerHTML = html;
        this.updateCardStatus('progress', 'completed');
    }

    showLoading() {
        this.loadingSection.style.display = 'block';
        this.startLearningBtn.disabled = true;
        this.startLearningBtn.innerHTML = `
            <i class="fas fa-spinner fa-spin"></i>
            正在生成...
        `;
    }

    hideLoading() {
        this.loadingSection.style.display = 'none';
        this.startLearningBtn.disabled = false;
        this.updateStartButton();
    }

    showResults() {
        console.log('🔍 检查 showResults 方法调用:', {
            resultsSection: !!this.resultsSection,
            thisType: this.constructor.name
        });
        
        if (!this.resultsSection) {
            console.error('❌ resultsSection元素不存在，尝试查找');
            // 尝试直接查找元素
            this.resultsSection = document.getElementById('resultsSection');
            if (!this.resultsSection) {
                console.error('❌ 无法找到结果显示区域');
                this.addLog && this.addLog('error', '❌ 无法显示结果，页面元素缺失');
                return;
            }
        }
        
        try {
            this.resultsSection.style.display = 'block';
            this.resultsSection.scrollIntoView({ behavior: 'smooth' });
            console.log('✅ 结果区域已显示');
        } catch (error) {
            console.error('❌ 显示结果区域失败:', error);
            this.addLog && this.addLog('error', '❌ 显示结果失败: ' + error.message);
        }
    }

    hideResults() {
        this.resultsSection.style.display = 'none';
    }

    showError(message) {
        this.hideLoading();
        this.errorSection.style.display = 'block';
        
        // 检查是否是API密钥相关错误
        if (message.includes('API密钥') || message.includes('配置')) {
            // 特殊处理API密钥错误
            document.getElementById('errorMessage').innerHTML = `
                <div style="text-align: left; line-height: 1.6;">
                    <strong>🔑 需要配置AI模型API密钥</strong>
                    <br><br>
                    为了使用真实AI模型生成学习内容，需要设置阿里云百炼API密钥：
                    <br><br>
                    <div style="background: #f1f5f9; padding: 1rem; border-radius: 8px; font-family: monospace; font-size: 0.9rem;">
                        <strong>1. 获取API密钥：</strong><br>
                        访问 <a href="https://dashscope.console.aliyun.com/" target="_blank" style="color: #4f46e5;">阿里云百炼控制台</a>
                        <br><br>
                        <strong>2. 在终端运行：</strong><br>
                        export ALIBABA_DASHSCOPE_API_KEY="your-api-key"
                        <br><br>
                        <strong>3. 重新启动服务：</strong><br>
                        node server.js
                    </div>
                    <br>
                    原始错误：${message}
                </div>
            `;
        } else {
            document.getElementById('errorMessage').textContent = message;
        }
        
        this.errorSection.scrollIntoView({ behavior: 'smooth' });
    }

    hideError() {
        this.errorSection.style.display = 'none';
    }

    resetInterface() {
        this.learningTopicInput.value = '';
        this.hideResults();
        this.hideError();
        this.hideLoading();
        this.updateStartButton();
        
        // 移除快速选择按钮的选中状态
        this.quickBtns.forEach(btn => btn.classList.remove('selected'));
        
        // 滚动到顶部
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    downloadLearningPlan() {
        const topic = this.topicDisplay.textContent;
        const content = this.generateDownloadContent();
        
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${topic}-学习方案.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showToast('学习方案已下载', 'success');
    }

    generateDownloadContent() {
        const topic = this.topicDisplay.textContent;
        const coursesText = this.coursesContent.textContent;
        const planText = this.studyPlanContent.textContent;
        const exercisesText = this.exercisesContent.textContent;
        const notesText = this.notesContent.textContent;
        const progressText = this.progressContent.textContent;
        
        return `智能学习伴侣 - ${topic}学习方案
生成时间: ${new Date().toLocaleString()}

=== 推荐课程 ===
${coursesText}

=== 学习计划 ===
${planText}

=== 练习题 ===
${exercisesText}

=== 学习笔记 ===
${notesText}

=== 进度跟踪 ===
${progressText}

---
由智能学习伴侣生成 | 基于Eko框架构建`;
    }

    shareLearningPlan() {
        const topic = this.topicDisplay.textContent;
        const url = window.location.href;
        
        if (navigator.share) {
            navigator.share({
                title: `${topic}学习方案`,
                text: `我使用智能学习伴侣为"${topic}"制定了个性化学习方案，推荐试试！`,
                url: url
            });
        } else {
            // 复制到剪贴板
            const shareText = `我使用智能学习伴侣为"${topic}"制定了个性化学习方案，推荐试试！\n${url}`;
            navigator.clipboard.writeText(shareText).then(() => {
                this.showToast('分享内容已复制到剪贴板', 'success');
            });
        }
    }
    
    // 流式数据处理方法
    
    updateStreamProgress(message, progress) {
        // 更新加载文本
        const loadingTitle = document.querySelector('.loading-title');
        if (loadingTitle) {
            loadingTitle.textContent = message;
        }
        
        // 更新进度条（如果有的话）
        this.updateProgressBar(progress);
    }
    
    updateStepProgress(stepName, progress) {
        // 根据步骤名称更新对应的步骤状态
        const stepMapping = {
            'courses': 'step1',
            'studyPlan': 'step2', 
            'exercises': 'step3',
            'notes': 'step4',
            'progress': 'step5'
        };
        
        const stepId = stepMapping[stepName];
        if (stepId) {
            const stepElement = document.getElementById(stepId);
            if (stepElement) {
                // 移除所有状态类
                stepElement.classList.remove('active', 'completed');
                
                if (progress >= 100) {
                    stepElement.classList.add('completed');
                } else {
                    stepElement.classList.add('active');
                }
            }
        }
    }
    
    updateProgressBar(progress) {
        // 如果有进度条元素，更新它
        const progressBar = document.querySelector('.progress-bar');
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
        
        // 更新进度数字
        const progressText = document.querySelector('.progress-text');
        if (progressText) {
            progressText.textContent = `${Math.round(progress)}%`;
        }
    }
    
    // 流式显示方法
    
    displayStreamCourses(courses) {
        this.showResults(); // 确保结果区域可见
        this.displayCourses(courses);
        
        // 添加动画效果
        const coursesCard = document.getElementById('coursesCard');
        if (coursesCard) {
            coursesCard.classList.add('stream-animate');
            setTimeout(() => coursesCard.classList.remove('stream-animate'), 500);
        }
    }
    
    displayStreamStudyPlan(studyPlan) {
        this.displayStudyPlan(studyPlan);
        
        const studyPlanCard = document.getElementById('studyPlanCard');
        if (studyPlanCard) {
            studyPlanCard.classList.add('stream-animate');
            setTimeout(() => studyPlanCard.classList.remove('stream-animate'), 500);
        }
    }
    
    displayStreamExercises(exercises) {
        this.displayExercises(exercises);
        
        const exercisesCard = document.getElementById('exercisesCard');
        if (exercisesCard) {
            exercisesCard.classList.add('stream-animate');
            setTimeout(() => exercisesCard.classList.remove('stream-animate'), 500);
        }
    }
    
    displayStreamNotes(notes) {
        this.displayNotes(notes);
        
        const notesCard = document.getElementById('notesCard');
        if (notesCard) {
            notesCard.classList.add('stream-animate');
            setTimeout(() => notesCard.classList.remove('stream-animate'), 500);
        }
    }
    
    displayStreamProgress(progress) {
        this.displayProgress(progress);
        
        const progressCard = document.getElementById('progressCard');
        if (progressCard) {
            progressCard.classList.add('stream-animate');
            setTimeout(() => progressCard.classList.remove('stream-animate'), 500);
        }
    }

    showToast(message, type = 'info', duration = 3000) {
        const toast = this.toast;
        const icon = toast.querySelector('.toast-icon');
        const messageEl = toast.querySelector('.toast-message');
        
        // 设置图标
        icon.className = 'toast-icon';
        switch (type) {
            case 'success':
                icon.classList.add('fas', 'fa-check-circle');
                break;
            case 'error':
                icon.classList.add('fas', 'fa-exclamation-circle');
                break;
            case 'warning':
                icon.classList.add('fas', 'fa-exclamation-triangle');
                break;
            default:
                icon.classList.add('fas', 'fa-info-circle');
        }
        
        // 设置消息和样式
        messageEl.textContent = message;
        toast.className = `toast ${type}`;
        toast.classList.add('show');
        
        // 自动隐藏
        setTimeout(() => {
            toast.classList.remove('show');
        }, duration);
    }
    
    // API配置相关方法
    
    showConfigModal() {
        this.configModal.classList.add('show');
        this.apiKeyInput.focus();
        
        // 加载已存储的API密钥
        const storedKey = this.getStoredApiKey();
        if (storedKey) {
            this.apiKeyInput.value = storedKey;
            this.updateConfigButtons();
        }
    }
    
    hideConfigModal() {
        this.configModal.classList.remove('show');
        this.clearConfigStatus();
    }
    
    togglePasswordVisibility() {
        const input = this.apiKeyInput;
        const icon = this.togglePassword.querySelector('i');
        
        if (input.type === 'password') {
            input.type = 'text';
            icon.className = 'fas fa-eye-slash';
        } else {
            input.type = 'password';
            icon.className = 'fas fa-eye';
        }
    }
    
    updateConfigButtons() {
        const apiKey = this.apiKeyInput.value.trim();
        const hasApiKey = apiKey.length > 0;
        
        this.configTest.disabled = !hasApiKey;
        this.configSave.disabled = !hasApiKey;
        
        if (hasApiKey) {
            this.configTest.innerHTML = '<i class="fas fa-wifi"></i> 测试连接';
            this.configSave.innerHTML = '<i class="fas fa-save"></i> 保存配置';
        } else {
            this.configTest.innerHTML = '<i class="fas fa-wifi"></i> 请输入API密钥';
            this.configSave.innerHTML = '<i class="fas fa-save"></i> 请输入API密钥';
        }
    }
    
    async testApiConnection() {
        const apiKey = this.apiKeyInput.value.trim();
        if (!apiKey) {
            this.showConfigStatus('请先输入API密钥', 'error');
            return;
        }
        
        this.showConfigStatus('正在测试连接...', 'loading');
        this.configTest.disabled = true;
        
        try {
            // 调用测试接口
            const response = await fetch('/api/test-api-key', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ apiKey })
            });
            
            const result = await response.json();
            
            if (response.ok && result.success) {
                this.showConfigStatus('✓ API密钥验证成功！', 'success');
            } else {
                this.showConfigStatus('✗ API密钥验证失败: ' + (result.error || '连接失败'), 'error');
            }
        } catch (error) {
            console.error('API测试失败:', error);
            this.showConfigStatus('✗ 网络连接失败，请检查网络连接', 'error');
        } finally {
            this.configTest.disabled = false;
        }
    }
    
    saveApiConfiguration() {
        const apiKey = this.apiKeyInput.value.trim();
        if (!apiKey) {
            this.showConfigStatus('请先输入API密钥', 'error');
            return;
        }
        
        // 保存到本地存储
        this.saveApiKeyToStorage(apiKey);
        
        // 更新配置按钮状态
        this.updateConfigButtonStatus(true);
        
        this.showConfigStatus('✓ API密钥已保存！现在可以使用AI功能了', 'success');
        this.showToast('API密钥配置成功', 'success');
        
        // 2秒后关闭弹窗
        setTimeout(() => {
            this.hideConfigModal();
        }, 2000);
    }
    
    showConfigStatus(message, type) {
        this.configStatus.className = `config-status ${type}`;
        
        let icon = '';
        switch (type) {
            case 'success':
                icon = '<i class="fas fa-check-circle"></i>';
                break;
            case 'error':
                icon = '<i class="fas fa-exclamation-circle"></i>';
                break;
            case 'loading':
                icon = '<i class="fas fa-spinner fa-spin"></i>';
                break;
        }
        
        this.configStatus.innerHTML = `${icon} ${message}`;
    }
    
    clearConfigStatus() {
        this.configStatus.className = 'config-status';
        this.configStatus.innerHTML = '';
    }
    
    // 本地存储管理
    
    saveApiKeyToStorage(apiKey) {
        try {
            localStorage.setItem('ai_learning_companion_api_key', apiKey);
        } catch (error) {
            console.error('保存API密钥失败:', error);
        }
    }
    
    getStoredApiKey() {
        try {
            return localStorage.getItem('ai_learning_companion_api_key') || '';
        } catch (error) {
            console.error('获取存储的API密钥失败:', error);
            return '';
        }
    }
    
    loadApiKeyFromStorage() {
        const storedKey = this.getStoredApiKey();
        if (storedKey) {
            this.updateConfigButtonStatus(true);
            console.log('✓ 已加载存储的API密钥');
        } else {
            this.updateConfigButtonStatus(false);
            console.log('⚠️ 未找到存储的API密钥');
        }
    }
    
    updateConfigButtonStatus(hasApiKey) {
        if (hasApiKey) {
            this.configBtn.classList.add('configured');
            this.configBtn.innerHTML = `
                <i class="fas fa-check"></i>
                <span>已配置</span>
            `;
        } else {
            this.configBtn.classList.remove('configured');
            this.configBtn.innerHTML = `
                <i class="fas fa-cog"></i>
                <span>配置API</span>
            `;
        }
    }
    
    // 思维导图相关方法
    displayMindmap(mindmapData) {
        console.log('🧠 开始显示思维导图:', mindmapData);
        console.log('- mindmapContent元素:', !!this.mindmapContent);
        
        // 检查思维导图容器是否存在
        if (!this.mindmapContent) {
            console.error('❌ mindmapContent元素不存在，尝试查找替代元素');
            // 尝试直接查找元素
            this.mindmapContent = document.getElementById('mindmapContent');
            if (!this.mindmapContent) {
                console.error('❌ 无法找到思维导图容器，跳过思维导图显示');
                this.addLog('error', '❌ 思维导图容器不存在，无法显示思维导图');
                return;
            }
        }
        
        if (!mindmapData) {
            console.warn('⚠️ 思维导图数据为空，使用Mock数据');
            // 如果没有数据，生成Mock数据
            const topic = this.topicDisplay?.textContent || '前端工程师';
            mindmapData = this.generateMockMindmapData(topic);
        }
        
        console.log('🧠 准备显示思维导图数据:', {
            title: mindmapData.title,
            type: mindmapData.type,
            hasHtml: !!mindmapData.html,
            hasContent: !!mindmapData.content
        });
        
        try {
            // 优先显示Mock数据或降级方案
            if (mindmapData.type === 'mock' || mindmapData.isFallback) {
                console.log('📝 显示Mock/降级思维导图');
                this.mindmapContent.innerHTML = mindmapData.html;
                this.updateCardStatus('mindmap', 'completed');
                this.addMindmapInteractions();
                console.log('✅ Mock思维导图显示成功');
                this.addLog('success', '✅ 思维导图显示完成');
            } else if (mindmapData.isMcpGenerated) {
                // MCP生成的真实思维导图
                console.log('✅ 显示MCP生成的思维导图');
                this.renderInteractiveMindmap(mindmapData);
            } else {
                // 尝试渲染交互式思维导图
                console.log('🔄 尝试渲染交互式思维导图');
                this.renderInteractiveMindmap(mindmapData);
            }
        } catch (error) {
            console.error('❌ 显示思维导图时发生错误:', error);
            this.addLog('error', '❌ 显示思维导图失败: ' + error.message);
            
            // 降级到最简单的显示方式
            this.mindmapContent.innerHTML = `
                <div class="mindmap-container">
                    <div class="mindmap-fallback">
                        <h3>思维导图显示错误</h3>
                        <p>由于技术问题，思维导图暂时无法正常显示。</p>
                        <p>错误信息: ${error.message}</p>
                    </div>
                </div>
            `;
        }
    }
    
    renderInteractiveMindmap(mindmapData) {
        // 显示加载状态
        this.mindmapContent.innerHTML = `
            <div class="mindmap-loading">
                <div class="spinner"></div>
                <p>正在渲染思维导图...</p>
            </div>
        `;
        
        // 检查Markmap库是否加载
        if (typeof markmap === 'undefined' || typeof d3 === 'undefined') {
            console.warn('⚠️ Markmap库未加载，使用降级方案');
            setTimeout(() => {
                this.renderFallbackMindmap(mindmapData);
            }, 1000);
            return;
        }
        
        // 渲染真正的思维导图
        setTimeout(() => {
            try {
                this.renderMarkmap(mindmapData);
            } catch (error) {
                console.error('❗ Markmap渲染失败:', error);
                this.renderFallbackMindmap(mindmapData);
            }
        }, 1000);
    }
    
    renderMarkmap(mindmapData) {
        // 创建思维导图容器
        const mindmapId = 'mindmap-svg-' + Date.now();
        this.mindmapContent.innerHTML = `
            <div class="mindmap-container">
                <svg id="${mindmapId}" width="100%" height="500"></svg>
            </div>
        `;
        
        const svgElement = document.getElementById(mindmapId);
        if (!svgElement) {
            throw new Error('SVG元素创建失败');
        }
        
        // 优先使用MCP生成的结果数据
        let markdownContent = mindmapData.content;
        if (mindmapData.mcpResult && mindmapData.mcpResult.markdownContent) {
            console.log('✅ 使用MCP生成的Markdown内容');
            markdownContent = mindmapData.mcpResult.markdownContent;
        } else if (mindmapData.mcpResult && mindmapData.mcpResult.content) {
            console.log('✅ 使用MCP生成的内容');
            markdownContent = mindmapData.mcpResult.content;
        }
        
        // 使用markmap-lib解析Markdown
        const { Transformer } = markmap;
        const transformer = new Transformer();
        
        // 解析Markdown内容
        const { root, features } = transformer.transform(markdownContent || mindmapData.title);
        
        // 创建 Markmap 实例
        const { Markmap, loadCSS, loadJS } = markmap;
        
        // 加载所需的CSS和JS
        loadCSS(features.css);
        loadJS(features.js, {
            getMarkmap: () => markmap,
        });
        
        // 创建思维导图
        const mm = Markmap.create(svgElement, {
            colorFreezeLevel: 2,
            maxWidth: 300,
            duration: 500,
            zoom: true,
            pan: true
        }, root);
        
        // 存储实例以便后续操作
        this.currentMarkmap = mm;
        
    // 添加思维导图交互功能
    addMindmapInteractions() {
        // 添加点击展开/折叠功能
        const treeNodes = this.mindmapContent.querySelectorAll('.tree-node');
        treeNodes.forEach(node => {
            const nodeContent = node.querySelector('.node-content');
            const children = node.querySelector('.tree-children');
            
            if (nodeContent && children && children.children.length > 0) {
                nodeContent.style.cursor = 'pointer';
                nodeContent.classList.add('expandable');
                
                nodeContent.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const isExpanded = !children.style.display || children.style.display !== 'none';
                    
                    if (isExpanded) {
                        children.style.display = 'none';
                        nodeContent.classList.add('collapsed');
                        nodeContent.classList.remove('expanded');
                    } else {
                        children.style.display = 'block';
                        nodeContent.classList.add('expanded');
                        nodeContent.classList.remove('collapsed');
                    }
                });
            }
        });
        
    // 测试Mock思维导图显示
    testMockMindmap() {
        console.log('🧠 开始测试Mock思维导图显示');
        this.addLog('info', '🧠 开始测试Mock思维导图显示');
        
        // 确保结果区域可见
        this.showResults();
        
        // 生成Mock思维导图数据
        const topic = '前端工程师';
        const mockMindmapData = this.generateMockMindmapData(topic);
        
        // 更新主题显示
        if (this.topicDisplay) {
            this.topicDisplay.textContent = topic;
        }
        
        // 直接显示思维导图
        console.log('📝 显示Mock思维导图数据:', mockMindmapData);
        this.displayMindmap(mockMindmapData);
        
        this.addLog('success', '✅ Mock思维导图显示完成');
        console.log('✅ Mock思维导图测试完成');
    }
    
    renderFallbackMindmap(mindmapData) {
        const html = `
            <div class="mindmap-container">
                <div class="mindmap-fallback">
                    <h3>${mindmapData.title || '思维导图'}</h3>
                    <div class="mindmap-tree">
                        ${this.convertMarkdownToTree(mindmapData.content || mindmapData.title)}
                    </div>
                    <div class="mindmap-info">
                        <p><strong>📝 思维导图功能说明：</strong></p>
                        <ul>
                            <li>• 基于学习计划自动生成可视化思维导图</li>
                            <li>• 支持ModelScope Markmap MCP服务器集成</li>
                            <li>• 当前为降级模式，显示结构化内容</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
        this.mindmapContent.innerHTML = html;
        this.updateCardStatus('mindmap', 'completed');
    }
    
    convertMarkdownToTree(markdown) {
        if (!markdown) return '';
        
        const lines = markdown.split('\n').filter(line => line.trim());
        let html = '<ul class="mindmap-tree-root">';
        let currentLevel = 0;
        let openTags = [];
        
        for (const line of lines) {
            const level = this.getMarkdownLevel(line);
            const text = line.replace(/^#+\s*/, '').replace(/^-\s*/, '').trim();
            
            if (!text) continue;
            
            // 关闭不需要的标签
            while (currentLevel >= level && openTags.length > 0) {
                html += openTags.pop();
                currentLevel--;
            }
            
            // 添加当前节点
            if (level > 0) {
                html += `<li class="mindmap-node level-${level}">`;
                html += `<span class="node-text">${text}</span>`;
                
                // 如果可能有子节点，添加ul
                html += '<ul class="mindmap-children">';
                openTags.push('</ul></li>');
                currentLevel = level;
            } else {
                html += `<li class="mindmap-node"><span class="node-text">${text}</span></li>`;
            }
        }
        
        // 关闭所有未关闭的标签
        while (openTags.length > 0) {
            html += openTags.pop();
        }
        
        html += '</ul>';
        return html;
    }
    
    getMarkdownLevel(line) {
        const hashMatch = line.match(/^(#+)/);
        if (hashMatch) {
            return hashMatch[1].length;
        }
        
        const dashMatch = line.match(/^(\s*)-/);
        if (dashMatch) {
            return Math.floor(dashMatch[1].length / 2) + 1;
        }
        
        return 0;
    }
    
    expandAllMindmapNodes() {
        console.log('🔄 展开所有思维导图节点');
        
        if (this.currentMarkmap) {
            // 对于真实的Markmap
            try {
                this.currentMarkmap.fit();
                // 递归展开所有节点
                const expandAll = (node) => {
                    if (node.children) {
                        node.payload = node.payload || {};
                        node.payload.fold = 0; // 展开
                        node.children.forEach(expandAll);
                    }
                };
                const root = this.currentMarkmap.state.data;
                if (root) {
                    expandAll(root);
                    this.currentMarkmap.renderData(root);
                }
                this.showToast('已展开所有节点', 'success');
            } catch (error) {
                console.error('展开操作失败:', error);
                this.showToast('展开操作失败', 'error');
            }
        } else {
            // 对于降级方案
            const nodes = document.querySelectorAll('.mindmap-children');
            nodes.forEach(node => {
                node.style.display = 'block';
            });
            this.showToast('已展开所有节点', 'info');
        }
    }
    
    collapseAllMindmapNodes() {
        console.log('🔄 折叠所有思维导图节点');
        
        if (this.currentMarkmap) {
            // 对于真实的Markmap
            try {
                // 递归折叠所有节点
                const collapseAll = (node, level = 0) => {
                    if (node.children && level > 0) {
                        node.payload = node.payload || {};
                        node.payload.fold = 1; // 折叠
                        node.children.forEach(child => collapseAll(child, level + 1));
                    } else if (node.children) {
                        node.children.forEach(child => collapseAll(child, level + 1));
                    }
                };
                const root = this.currentMarkmap.state.data;
                if (root) {
                    collapseAll(root);
                    this.currentMarkmap.renderData(root);
                }
                this.showToast('已折叠所有节点', 'success');
            } catch (error) {
                console.error('折叠操作失败:', error);
                this.showToast('折叠操作失败', 'error');
            }
        } else {
            // 对于降级方案
            const nodes = document.querySelectorAll('.mindmap-children');
            nodes.forEach(node => {
                node.style.display = 'none';
            });
            this.showToast('已折叠所有节点', 'info');
        }
    }
    
    downloadMindmap() {
        console.log('⬇️ 下载思维导图');
        const topic = this.topicDisplay.textContent || '学习计划';
        
        // 生成思维导图文件内容
        const mindmapContent = `# ${topic} 思维导图\n\n生成时间: ${new Date().toLocaleString()}\n\n${this.mindmapContent.textContent || '暂无内容'}`;
        
        const blob = new Blob([mindmapContent], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${topic}-思维导图.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showToast('思维导图已下载', 'success');
    }
    
    // 流式显示思维导图
    displayStreamMindmap(mindmapData) {
        this.showResults(); // 确保结果区域可见
        
        const mindmapCard = document.getElementById('mindmapCard');
        if (mindmapCard) {
            mindmapCard.classList.add('stream-animate');
            setTimeout(() => mindmapCard.classList.remove('stream-animate'), 500);
        }
        
        if (mindmapData) {
            this.displayMindmap(mindmapData);
        } else {
            console.warn('⚠️ 流式思维导图数据为空');
        }
    }
    
    // 日志管理方法
    addLog(level, message, timestamp = new Date()) {
        const logEntry = {
            id: Date.now() + Math.random(),
            level: level,
            message: message,
            timestamp: timestamp
        };
        
        this.logs.push(logEntry);
        
        // 限制日志数量
        if (this.logs.length > this.maxLogs) {
            this.logs = this.logs.slice(-this.maxLogs);
        }
        
        this.renderLogEntry(logEntry);
        this.updateLogCount();
        
        // 自动滚动到底部
        if (this.autoScrollLog && this.autoScrollLog.checked) {
            this.scrollLogToBottom();
        }
    }
    
    renderLogEntry(logEntry) {
        if (!this.logContent) return;
        
        // 如果是第一条日志，清除欢迎信息
        const welcome = this.logContent.querySelector('.log-welcome');
        if (welcome) {
            welcome.remove();
        }
        
        const logDiv = document.createElement('div');
        logDiv.className = `log-entry ${logEntry.level}`;
        logDiv.setAttribute('data-log-id', logEntry.id);
        
        const timeStr = logEntry.timestamp.toLocaleTimeString();
        const levelText = logEntry.level.toUpperCase().padEnd(7);
        
        logDiv.innerHTML = `
            <span class="log-timestamp">${timeStr}</span>
            <span class="log-level ${logEntry.level}">${levelText}</span>
            <span class="log-message">${this.escapeHtml(logEntry.message)}</span>
        `;
        
        this.logContent.appendChild(logDiv);
        
        // 如果日志太多，删除旧的DOM元素
        const logElements = this.logContent.querySelectorAll('.log-entry');
        if (logElements.length > this.maxLogs) {
            const excess = logElements.length - this.maxLogs;
            for (let i = 0; i < excess; i++) {
                logElements[i].remove();
            }
        }
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    updateLogCount() {
        if (this.logCount) {
            this.logCount.textContent = `${this.logs.length} 条日志`;
        }
    }
    
    scrollLogToBottom() {
        if (this.logContent) {
            this.logContent.scrollTop = this.logContent.scrollHeight;
        }
    }
    
    clearLogs() {
        this.logs = [];
        if (this.logContent) {
            this.logContent.innerHTML = `
                <div class="log-welcome">
                    <i class="fas fa-info-circle"></i>
                    日志已清空，请输入学习主题开始生成...
                </div>
            `;
        }
        this.updateLogCount();
        this.addLog('info', '日志已清空');
    }
    
    downloadLogs() {
        if (this.logs.length === 0) {
            this.showToast('没有日志可下载', 'warning');
            return;
        }
        
        const logText = this.logs.map(log => {
            const timeStr = log.timestamp.toLocaleString();
            const levelText = log.level.toUpperCase().padEnd(7);
            return `[${timeStr}] ${levelText} ${log.message}`;
        }).join('\n');
        
        const blob = new Blob([logText], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `智能学习伴侣-日志-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showToast('日志已下载', 'success');
    }
    
    toggleLogPanel() {
        if (this.logPanel) {
            this.logPanel.classList.toggle('hidden');
            const isHidden = this.logPanel.classList.contains('hidden');
            
            if (this.toggleLogPanelBtn) {
                const icon = this.toggleLogPanelBtn.querySelector('i');
                if (icon) {
                    icon.className = isHidden ? 'fas fa-eye' : 'fas fa-eye-slash';
                }
                this.toggleLogPanelBtn.title = isHidden ? '显示日志' : '隐藏日志';
            }
        }
    }
    
    // 初始化日志系统
    initLogSystem() {
        // 添加初始日志
        this.addLog('info', '🎓 智能学习伴侣已初始化');
        this.addLog('info', '🔗 版本: 基于Eko框架 3.0.0-alpha.3 构建');
        
        // 不再重写全局console方法，避免性能问题
        // 改为使用专门的日志记录方法
        this.logInfo = (message) => {
            console.log(message);
            if (message.includes('🎓') || message.includes('📊') || message.includes('✅') || 
                message.includes('⚠️') || message.includes('🎆') || message.includes('🔄') ||
                message.includes('🔍') || message.includes('📋') || message.includes('📝') ||
                message.includes('📖') || message.includes('📈') || message.includes('🧠')) {
                this.addLog('info', message);
            }
        };
        
        this.logError = (message) => {
            console.error(message);
            this.addLog('error', '❌ ' + message);
        };
        
        this.logWarn = (message) => {
            console.warn(message);
            if (message.includes('⚠️')) {
                this.addLog('warning', message);
            }
        };
        
    // 启动日志流连接
    startLogStreamConnection() {
        // 延迟启动，确保页面元素已加载
        setTimeout(() => {
            this.connectToLogStream();
        }, 1000);
    }
    
    // 连接到实时日志流
    connectToLogStream() {
        console.log('📋 正在连接到服务器实时日志流...');
        
        // 如果已经有连接，关闭它
        if (this.logEventSource) {
            this.logEventSource.close();
        }
        
        try {
            // 创建 SSE 连接
            this.logEventSource = new EventSource('/api/logs-stream');
            
            this.logEventSource.onopen = () => {
                console.log('✅ 实时日志流连接成功');
                this.addLog('success', '📡 实时日志流已连接');
            };
            
            // 处理连接确认事件
            this.logEventSource.addEventListener('connected', (event) => {
                const data = JSON.parse(event.data);
                console.log('📞 日志流连接确认:', data.message);
                this.addLog('success', data.message);
            });
            
            // 处理系统状态事件
            this.logEventSource.addEventListener('status', (event) => {
                const data = JSON.parse(event.data);
                this.handleServerLog(data);
            });
            
            // 处理心跳事件
            this.logEventSource.addEventListener('heartbeat', (event) => {
                const data = JSON.parse(event.data);
                this.handleServerLog(data);
            });
            
            // 处理主要日志事件
            this.logEventSource.addEventListener('log', (event) => {
                const logData = JSON.parse(event.data);
                this.handleServerLog(logData);
            });
            
            // 处理错误事件
            this.logEventSource.onerror = (error) => {
                console.warn('⚠️ 实时日志流连接错误:', error);
                
                // 只有在连接断开时才重连
                if (this.logEventSource.readyState === EventSource.CLOSED) {
                    this.addLog('warning', '⚠️ 日志流连接断开，5秒后重连...');
                    
                    setTimeout(() => {
                        if (!this.logEventSource || this.logEventSource.readyState === EventSource.CLOSED) {
                            this.connectToLogStream();
                        }
                    }, 5000);
                }
            };
            
        } catch (error) {
            console.error('❌ 无法连接实时日志流:', error);
            this.addLog('error', '❌ 连接实时日志流失败: ' + error.message);
        }
    }
    
    // 处理服务器日志
    handleServerLog(logData) {
        if (!logData || !logData.message) return;
        
        // 过滤不重要的日志
        const shouldFilter = (
            logData.message.includes('SSE客户端') ||
            logData.message.includes('MCP Client') ||
            logData.message.includes('Module type') ||
            logData.message.includes('trace-warnings') ||
            logData.message.includes('日志SSE连接建立') ||
            logData.message.includes('日志SSE连接断开')
        );
        
        if (shouldFilter) return;
        
        // 处理不同源的日志
        let displayMessage = logData.message;
        let logLevel = logData.level || 'info';
        
        // 根据源添加标签
        if (logData.source === 'system') {
            // 系统状态信息保持原样
        } else if (logData.source === 'heartbeat') {
            // 心跳信息保持原样
        } else if (logData.source === 'stdout' || logData.source === 'stderr') {
            displayMessage = `[终端] ${displayMessage}`;
        } else if (!displayMessage.includes('🎓') && 
                  !displayMessage.includes('🔑') && 
                  !displayMessage.includes('✅') && 
                  !displayMessage.includes('❌') &&
                  !displayMessage.includes('💓') &&
                  !displayMessage.includes('📊') &&
                  !displayMessage.includes('📡')) {
            displayMessage = `[服务器] ${displayMessage}`;
        }
        
        // 智能识别日志级别
        if (logData.level === 'error' || displayMessage.includes('❌')) {
            logLevel = 'error';
        } else if (logData.level === 'warning' || displayMessage.includes('⚠️')) {
            logLevel = 'warning';
        } else if (logData.level === 'success' || 
                  displayMessage.includes('✅') || 
                  displayMessage.includes('✓') ||
                  displayMessage.includes('🎉')) {
            logLevel = 'success';
        } else if (logData.level === 'debug' || logData.level === 'trace') {
            logLevel = 'debug';
        } else if (displayMessage.includes('💓')) {
            logLevel = 'info'; // 心跳信息使用info级别
        }
        
        // 添加到日志面板
        this.addLog(logLevel, displayMessage);
    }
    }
}

// 页面加载完成后初始化 - 增强版本
document.addEventListener('DOMContentLoaded', () => {
    // 避免重复初始化
    if (window.jobAssistantUI) {
        console.log('ℹ️ JobAssistantUI 已初始化，跳过重复初始化');
        return;
    }
    
    try {
        console.log('📄 DOM内容已加载，开始初始化...');
        
        // 简化的元素检查
        const jobTitle = document.getElementById('jobTitle');
        const generateBtn = document.getElementById('generateBtn');
        const contentModal = document.getElementById('contentModal');
        
        console.log('🔍 元素检查结果:', {
            jobTitle: !!jobTitle,
            generateBtn: !!generateBtn,
            contentModal: !!contentModal,
            JobAssistantUI: typeof JobAssistantUI
        });
        
        if (jobTitle && generateBtn && typeof JobAssistantUI !== 'undefined') {
            console.log('✅ 关键元素找到，初始化UI...');
            
            // 初始化主类
            const ui = new JobAssistantUI();
            console.log('✓ 职途助手AI求职大师Web界面已加载');
            
            // 全局暴露以便调试和外部访问
            window.jobAssistantUI = ui;
            window.JobAssistantUI = JobAssistantUI;
            
            // 确保全局方法可访问
            window.showContentModal = function() {
                console.log('🌐 全局 showContentModal 被调用');
                if (window.jobAssistantUI && typeof window.jobAssistantUI.showContentModal === 'function') {
                    return window.jobAssistantUI.showContentModal();
                } else {
                    console.error('❌ 全局调用失败，jobAssistantUI 不可用');
                }
            };
            
            // 验证方法可用性
            console.log('🔍 方法验证:', {
                'ui.showContentModal': typeof ui.showContentModal,
                'window.jobAssistantUI.showContentModal': typeof window.jobAssistantUI.showContentModal,
                'window.showContentModal': typeof window.showContentModal
            });
            
            // 立即检查并更新按钮状态
            setTimeout(() => {
                console.log('🔄 初始化后检查按钮状态...');
                ui.updateGenerateButton();
                
                // 验证按钮事件绑定
                if (generateBtn.onclick || generateBtn.addEventListener) {
                    console.log('✅ 按钮事件已绑定');
                } else {
                    console.warn('⚠️ 按钮事件未绑定');
                }
            }, 100);
            
        } else {
            console.warn('⚠️ 部分元素未找到或JobAssistantUI类未定义');
            
            // 重试机制
            setTimeout(() => {
                console.log('🔄 尝试重新初始化...');
                if (!window.jobAssistantUI) {
                    document.dispatchEvent(new Event('DOMContentLoaded'));
                }
            }, 1000);
        }
        
    } catch (error) {
        console.error('❌ 初始化失败:', error);
        
        // 记录详细错误信息
        console.error('错误堆栈:', error.stack);
        
        // 尝试降级初始化
        setTimeout(() => {
            console.log('🔄 尝试降级初始化...');
            try {
                if (typeof JobAssistantUI !== 'undefined') {
                    window.jobAssistantUI = new JobAssistantUI();
                    console.log('✅ 降级初始化成功');
                }
            } catch (fallbackError) {
                console.error('❌ 降级初始化也失败:', fallbackError);
            }
        }, 500);
    }
});