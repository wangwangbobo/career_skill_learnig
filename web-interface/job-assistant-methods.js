// 职途助手专用方法补充
// 这些方法将被添加到 JobAssistantUI 类中

// ==================== 职途助手专用方法 ====================

// Tab切换
switchTab(tabName) {
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

// 更新生成按钮状态 - 优化版本（带防抖）
updateGenerateButton() {
    // 清除之前的定时器
    if (this._updateGenerateButtonTimer) {
        clearTimeout(this._updateGenerateButtonTimer);
    }
    
    // 使用防抖机制，延迟执行
    this._updateGenerateButtonTimer = setTimeout(() => {
        this._updateGenerateButtonImmediate();
    }, 50); // 50ms防抖
}

// 立即更新按钮状态（内部方法）
_updateGenerateButtonImmediate() {
    // 避免频繁DOM查询，使用缓存
    if (!this._generateButtonCache) {
        this._generateButtonCache = {
            lastJobTitle: '',
            lastJobDesc: '',
            lastFileCount: 0,
            lastTabState: '',
            lastValidState: null
        };
    }
    
    const cache = this._generateButtonCache;
    const currentJobTitle = this.jobTitle.value.trim();
    const currentJobDesc = this.jobDescription.value.trim();
    const currentFileCount = this.fileInput.files.length;
    const currentTabState = this.jobNameContent.classList.contains('active') ? 'name' : 'desc';
    
    // 检查是否有变化，没有变化则提前返回
    if (
        cache.lastJobTitle === currentJobTitle &&
        cache.lastJobDesc === currentJobDesc &&
        cache.lastFileCount === currentFileCount &&
        cache.lastTabState === currentTabState
    ) {
        return;
    }
    
    // 计算新的状态
    const hasJobTitle = currentJobTitle.length > 0;
    const hasJobDesc = currentJobDesc.length > 0;
    const hasUploadedFile = currentFileCount > 0;
    const isJobNameTabActive = currentTabState === 'name';
    const isValid = isJobNameTabActive ? hasJobTitle : (hasJobDesc || hasUploadedFile);
    
    // 只在状态真正改变时更新DOM
    if (cache.lastValidState !== isValid) {
        this.generateBtn.disabled = !isValid;
        this.generateBtn.style.opacity = isValid ? '1' : '0.6';
        cache.lastValidState = isValid;
    }
    
    // 更新缓存
    cache.lastJobTitle = currentJobTitle;
    cache.lastJobDesc = currentJobDesc;
    cache.lastFileCount = currentFileCount;
    cache.lastTabState = currentTabState;
}

// 处理文件上传
handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        this.handleFile(file);
    }
}

handleFile(file) {
    if (!file.type.startsWith('image/')) {
        this.showToast('请上传图片文件', 'error');
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB
        this.showToast('文件大小不能超过5MB', 'error');
        return;
    }
    
    // 显示文件信息
    const fileInfo = document.createElement('div');
    fileInfo.className = 'file-info';
    fileInfo.innerHTML = `
        <i class="fas fa-image"></i>
        <span>已上传: ${file.name}</span>
        <button class="remove-file" onclick="this.parentElement.remove(); window.jobAssistantUI.updateGenerateButton();">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // 清除之前的文件信息
    const existingFileInfo = this.uploadArea.querySelector('.file-info');
    if (existingFileInfo) {
        existingFileInfo.remove();
    }
    
    this.uploadArea.appendChild(fileInfo);
    this.updateGenerateButton();
    this.showToast('文件上传成功', 'success');
}

// 显示内容选择模态框
showContentModal() {
    this.contentModal.classList.add('show');
    this.updateContentConfirmButton();
}

// 隐藏内容选择模态框
hideContentModal() {
    this.contentModal.classList.remove('show');
}

// 更新确认按钮状态
updateContentConfirmButton() {
    const checkedOptions = Array.from(this.contentOptions).filter(cb => cb.checked);
    this.contentConfirm.disabled = checkedOptions.length === 0;
}

// 获取选中的内容类型
getSelectedContentTypes() {
    return Array.from(this.contentOptions)
        .filter(cb => cb.checked)
        .map(cb => cb.value);
}

// 开始生成
async startGeneration() {
    try {
        this.selectedContentTypes = this.getSelectedContentTypes();
        
        // 获取职位信息
        const isJobNameTabActive = this.jobNameContent.classList.contains('active');
        if (isJobNameTabActive) {
            this.currentJobInfo = {
                type: 'jobName',
                content: this.jobTitle.value.trim()
            };
        } else {
            this.currentJobInfo = {
                type: 'jobDescription',
                content: this.jobDescription.value.trim(),
                file: this.fileInput.files[0] || null
            };
        }
        
        this.hideContentModal();
        this.showLoadingSection();
        
        this.addLog('info', `💼 开始分析职位: ${this.currentJobInfo.content}`);
        this.addLog('info', `🎯 选中内容类型: ${this.selectedContentTypes.join(', ')}`);
        
        // 调用后端生成接口
        await this.callGenerationAPI();
        
    } catch (error) {
        console.error('生成失败:', error);
        this.showError('生成失败，请稍后重试');
    }
}

// 模拟调用后端API（测试用）
async callGenerationAPI() {
    // 模拟API调用过程
    await this.simulateJobAnalysis();
}

// 模拟职位分析过程
async simulateJobAnalysis() {
    // 模拟进度更新
    this.updateProgress(1, 20);
    await this.sleep(1000);
    
    this.updateProgress(2, 40);
    await this.sleep(1000);
    
    this.updateProgress(3, 60);
    await this.sleep(1000);
    
    this.updateProgress(4, 80);
    await this.sleep(1000);
    
    this.updateProgress(5, 100);
    await this.sleep(500);
    
    // 显示结果
    this.showResultsSection();
    this.generateMockSkillData();
}

// 生成模拟技能数据
generateMockSkillData() {
    const mockSkills = [
        {
            name: 'JavaScript & 前端技术',
            knowledge: ['ES6+语法', 'DOM操作', '异步编程', '模块化开发'],
            interview: ['闭包和作用域', '事件循环机制', 'Promise和async/await', '性能优化'],
            books: ['《JavaScript高级程序设计》', '《你不知道的JavaScript》'],
            certificates: ['前端开发工程师认证'],
            courses: ['Vue.js进阶课程', 'React实战项目']
        },
        {
            name: 'Node.js & 后端开发',
            knowledge: ['Express框架', 'RESTful API', '数据库操作', '中间件开发'],
            interview: ['Node.js事件循环', 'Express中间件原理', '数据库优化', '安全防护'],
            books: ['《Node.js实战》', '《深入浅出Node.js》'],
            certificates: ['Node.js开发认证'],
            courses: ['Node.js微服务架构', 'MongoDB实战']
        }
    ];
    
    mockSkills.forEach(skill => {
        this.addSkillCategory(skill.name, skill);
    });
}

// 添加技能分类
addSkillCategory(skillName, contentData) {
    const skillDiv = document.createElement('div');
    skillDiv.className = 'skill-category';
    skillDiv.innerHTML = `
        <div class="skill-header" onclick="this.parentElement.classList.toggle('collapsed')">
            <h3 class="skill-title">
                <i class="fas fa-code"></i>
                ${skillName}
            </h3>
            <i class="fas fa-chevron-down skill-toggle"></i>
        </div>
        <div class="skill-content">
            <div class="content-types"></div>
        </div>
    `;
    
    const contentTypesDiv = skillDiv.querySelector('.content-types');
    
    // 获取实际选择的内容类型，如果没有则使用默认的知识点和面试题
    const actualSelectedTypes = this.selectedContentTypes && this.selectedContentTypes.length > 0 
        ? this.selectedContentTypes 
        : ['knowledge', 'interview'];
    
    console.log('🔍 addSkillCategory 使用的内容类型:', actualSelectedTypes);
    
    // 添加各类型内容
    actualSelectedTypes.forEach(type => {
        if (contentData[type]) {
            const typeDiv = document.createElement('div');
            typeDiv.className = 'content-type';
            typeDiv.innerHTML = `
                <div class="content-type-header">
                    <i class="${this.getContentTypeIcon(type)}"></i>
                    ${this.getContentTypeName(type)}
                </div>
                <div class="content-type-body">
                    ${this.renderContentItems(contentData[type])}
                </div>
            `;
            contentTypesDiv.appendChild(typeDiv);
        }
    });
    
    this.skillsContainer.appendChild(skillDiv);
    this.addLog('info', `📈 添加技能分类: ${skillName} (${actualSelectedTypes.length}种内容类型)`);
}

// 获取内容类型图标
getContentTypeIcon(type) {
    const icons = {
        knowledge: 'fas fa-lightbulb',
        interview: 'fas fa-question-circle',
        books: 'fas fa-book',
        certificates: 'fas fa-certificate',
        courses: 'fas fa-graduation-cap'
    };
    return icons[type] || 'fas fa-file';
}

// 获取内容类型名称
getContentTypeName(type) {
    const names = {
        knowledge: '知识点',
        interview: '高频面试题',
        books: '推荐书籍',
        certificates: '证书',
        courses: '推荐课程'
    };
    return names[type] || '未知类型';
}

// 渲染内容项目
renderContentItems(items) {
    if (!Array.isArray(items)) {
        return `<div class="content-item"><p>${items}</p></div>`;
    }
    
    return items.map(item => {
        if (typeof item === 'string') {
            return `<div class="content-item"><p>${item}</p></div>`;
        }
        
        return `
            <div class="content-item">
                ${item.title ? `<h4>${item.title}</h4>` : ''}
                ${item.description ? `<p>${item.description}</p>` : ''}
                ${item.points && Array.isArray(item.points) ? 
                    `<ul>${item.points.map(point => `<li>${point}</li>`).join('')}</ul>` : 
                    ''}
            </div>
        `;
    }).join('');
}

// 显示加载状态
showLoadingSection() {
    this.hideAllSections();
    this.loadingSection.style.display = 'block';
    this.resetProgress();
}

// 显示结果区域
showResultsSection() {
    this.hideAllSections();
    this.resultsSection.style.display = 'block';
    
    // 更新结果头部信息
    if (this.topicDisplay) {
        this.topicDisplay.textContent = this.currentJobInfo.content;
    }
    if (this.generationTime) {
        this.generationTime.textContent = new Date().toLocaleString();
    }
}

// 隐藏所有区域
hideAllSections() {
    this.loadingSection.style.display = 'none';
    this.resultsSection.style.display = 'none';
    this.errorSection.style.display = 'none';
}

// 保存结果
saveResults() {
    this.showToast('结果已保存', 'success');
    this.addLog('info', '💾 结果已保存到本地');
}

// 导出PDF
exportToPDF() {
    this.showToast('正在导出PDF...', 'info');
    this.addLog('info', '📄 正在导出PDF文件');
    // TODO: 实现PDF导出功能
}

// 导出到飞书文档
exportToFeishu() {
    this.showToast('正在导出到飞书文档...', 'info');
    this.addLog('info', '📁 正在导出到飞书文档');
    // TODO: 实现飞书文档导出功能
}

// 重新生成
regenerateContent() {
    this.showContentModal();
}

// 工具方法：睡眠
sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}