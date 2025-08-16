// 生成学习路线按钮修复脚本
// 确保按钮始终可以正常点击

console.log('🔧 加载按钮修复脚本...');

// 显示内容选择弹窗
function showContentModal() {
    console.log('🔀 尝试显示内容选择弹窗...');
    
    // 先尝试使用JobAssistantUI的方法
    if (window.jobAssistantUI && typeof window.jobAssistantUI.showContentModal === 'function') {
        console.log('✅ 使用JobAssistantUI的showContentModal方法');
        try {
            window.jobAssistantUI.showContentModal();
            return true;
        } catch (e) {
            console.warn('⚠️ JobAssistantUI.showContentModal调用失败:', e);
        }
    }
    
    // 直接操作弹窗DOM
    const modal = document.getElementById('contentModal');
    if (modal) {
        console.log('✅ 直接显示内容选择弹窗');
        modal.classList.add('show');
        modal.style.display = 'flex';
        
        // 确保默认选项被选中
        setupModalDefaults(modal);
        
        // 绑定确认按钮事件
        setupModalConfirmButton(modal);
        
        return true;
    }
    
    console.error('❌ 找不到内容选择弹窗');
    return false;
}

// 设置弹窗默认选项
function setupModalDefaults(modal) {
    const checkboxes = modal.querySelectorAll('input[type="checkbox"]');
    let hasChecked = false;
    
    // 检查是否已有选中项
    checkboxes.forEach(cb => {
        if (cb.checked) hasChecked = true;
    });
    
    // 如果没有选中项，默认选中前两个
    if (!hasChecked && checkboxes.length > 0) {
        checkboxes[0].checked = true; // 选中「知识点」
        if (checkboxes.length > 1) {
            checkboxes[1].checked = true; // 选中「高频面试题」
        }
        console.log('✅ 已默认选中基础内容类型');
    }
    
    // 确保确认按钮可用
    const confirmBtn = modal.querySelector('#contentConfirm');
    if (confirmBtn) {
        confirmBtn.disabled = false;
        confirmBtn.style.opacity = '1';
        confirmBtn.style.cursor = 'pointer';
    }
}

// 设置弹窗确认按钮事件
function setupModalConfirmButton(modal) {
    const confirmBtn = modal.querySelector('#contentConfirm');
    if (!confirmBtn) return;
    
    // 如果已经绑定过事件，不重复绑定
    if (confirmBtn.hasAttribute('data-enhanced-bound')) {
        return;
    }
    
    confirmBtn.setAttribute('data-enhanced-bound', 'true');
    confirmBtn.addEventListener('click', function() {
        console.log('🚀 内容选择确认，开始生成学习资料');
        
        // 隐藏弹窗
        modal.classList.remove('show');
        modal.style.display = 'none';
        
        // 获取输入值
        const jobTitle = document.getElementById('jobTitle');
        const inputValue = jobTitle ? jobTitle.value.trim() : '';
        
        if (inputValue) {
            // 启动生成流程
            setTimeout(() => startRealGeneration(inputValue), 100);
        }
    });
    
    console.log('✅ 弹窗确认按钮事件已绑定');
}

// 增强生成按钮功能 - 不破坏现有API配置功能

console.log('🔧 加载按钮增强脚本...');

// 真实流式生成功能
function startRealGeneration(topic) {
    console.log('🌊 启动真实流式生成功能:', topic);
    
    // 显示生成中状态
    const loadingSection = document.getElementById('loadingSection');
    if (loadingSection) {
        loadingSection.style.display = 'block';
        console.log('✅ 显示加载状态');
    }
    
    // 调用真实的流式API
    callStreamingAPI(topic);
}

// 调用流式生成API
async function callStreamingAPI(topic) {
    console.log('🌊 开始调用流式生成API:', topic);
    
    // 获取用户选择的内容类型
    const selectedContentTypes = [];
    const checkboxes = document.querySelectorAll('input[name="contentType"]:checked');
    checkboxes.forEach(cb => {
        selectedContentTypes.push(cb.value);
    });
    
    console.log('📋 用户选择的内容类型:', selectedContentTypes);
    
    const progressBar = document.querySelector('.progress-bar');
    const progressText = document.querySelector('.progress-text');
    const loadingTitle = document.querySelector('.loading-title');
    
    try {
        const response = await fetch('/api/generate-learning-plan-stream', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                topic: topic,
                apiKey: localStorage.getItem('ai_learning_companion_api_key') || '',
                contentTypes: selectedContentTypes  // 添加用户选择的内容类型
            })
        });

        if (!response.ok || !response.body) {
            throw new Error(`API调用失败: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let streamData = {};

        const processStream = async () => {
            try {
                while (true) {
                    const { done, value } = await reader.read();
                    
                    if (done) {
                        console.log('✅ 流式数据接收完成');
                        showResults(streamData, topic);
                        return;
                    }
                    
                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');
                    buffer = lines.pop() || '';
                    
                    for (const line of lines) {
                        if (line.trim() === '') continue;
                        
                        if (line.startsWith('event: ')) {
                            continue;
                        }
                        
                        if (line.startsWith('data: ')) {
                            try {
                                const dataStr = line.slice(6);
                                const data = JSON.parse(dataStr);
                                console.log('📊 收到流式数据:', data);
                                await handleStreamEvent(data, streamData, progressBar, progressText, loadingTitle);
                            } catch (e) {
                                console.warn('❌ 解析流数据失败:', e, line);
                            }
                        }
                    }
                }
            } catch (streamError) {
                console.error('❌ 流处理错误:', streamError);
                throw streamError;
            }
        };
        
        await processStream();
        
    } catch (error) {
        console.error('❌ 流式生成失败:', error);
        
        const loadingSection = document.getElementById('loadingSection');
        if (loadingSection) {
            loadingSection.style.display = 'none';
        }
        
        alert(`生成失败：${error.message}\n\n请检查网络连接或API配置后重试。`);
    }
}

// 处理流式事件
async function handleStreamEvent(data, streamData, progressBar, progressText, loadingTitle) {
    if (data.message && data.message.includes('开始生成')) {
        console.log('🚀 开始生成学习方案');
        return;
    }
    
    if (data.step) {
        console.log(`🔄 处理步骤: ${data.step}, 进度: ${data.progress}%`);
        
        if (progressBar && progressText) {
            progressBar.style.width = `${data.progress}%`;
            progressText.textContent = `${data.progress}%`;
        }
        
        if (loadingTitle) {
            loadingTitle.textContent = data.message || `正在${data.step}...`;
        }
        
        if (data.data) {
            streamData[data.step] = data.data;
            console.log(`📊 保存 ${data.step} 数据`);
        }
    }
    
    if (data.result) {
        console.log('✅ 流式生成完成');
        streamData = { ...streamData, ...data.result };
    }
}

// 显示最终结果
function showResults(data, topic) {
    console.log('🎉 显示最终结果:', data);
    
    const loadingSection = document.getElementById('loadingSection');
    if (loadingSection) {
        loadingSection.style.display = 'none';
    }
    
    const resultsSection = document.getElementById('resultsSection');
    if (resultsSection) {
        resultsSection.style.display = 'block';
        
        const topicDisplay = document.getElementById('topicDisplay');
        if (topicDisplay) {
            topicDisplay.textContent = topic;
        }
        
        const generationTime = document.getElementById('generationTime');
        if (generationTime) {
            generationTime.textContent = new Date().toLocaleString();
        }
        
        if (data.mindmap) {
            displayMindmap(data.mindmap, topic);
        }
        
        displayAllContent(data, topic);
        console.log('✅ 结果显示完成');
    }
}

// 显示思维导图
function displayMindmap(mindmapData, topic) {
    const mindmapContent = document.getElementById('mindmapContent');
    if (!mindmapContent || !mindmapData) return;
    
    console.log('🧠 显示思维导图调试信息:', {
        type: mindmapData.type,
        isMcpGenerated: mindmapData.isMcpGenerated,
        hasHtml: !!mindmapData.html,
        hasMcpResult: !!mindmapData.mcpResult,
        mcpResultType: mindmapData.mcpResult?.type,
        mcpHasHtml: !!mindmapData.mcpResult?.html
    });
    
    // 尝试多种检测方式找到真正的Markmap数据
    let markmapHtml = null;
    let markmapSvg = null;
    
    // 方式1：直接检查mindmapData
    if (mindmapData.isMcpGenerated && mindmapData.type === 'markmap' && mindmapData.html) {
        markmapHtml = mindmapData.html;
        markmapSvg = mindmapData.svg;
        console.log('✅ 方式1：在mindmapData中找到Markmap数据');
    }
    // 方式2：检查mcpResult
    else if (mindmapData.mcpResult && mindmapData.mcpResult.type === 'markmap' && mindmapData.mcpResult.html) {
        markmapHtml = mindmapData.mcpResult.html;
        markmapSvg = mindmapData.mcpResult.svg;
        console.log('✅ 方式2：在mcpResult中找到Markmap数据');
    }
    // 方式3：检查是否有isMcpGenerated标志
    else if (mindmapData.isMcpGenerated && mindmapData.mcpResult) {
        const mcpData = mindmapData.mcpResult;
        if (mcpData.html) {
            markmapHtml = mcpData.html;
            markmapSvg = mcpData.svg;
            console.log('✅ 方式3：通过isMcpGenerated标志找到数据');
        }
    }
    
    if (markmapHtml) {
        console.log('✅ 使用MCP生成的真正Markmap');
        mindmapContent.innerHTML = markmapHtml;
        
        // 如果有SVG数据，延迟注入
        if (markmapSvg) {
            setTimeout(() => {
                const svgElement = mindmapContent.querySelector('#markmap-svg');
                if (svgElement) {
                    svgElement.outerHTML = markmapSvg;
                    console.log('✅ SVG内容已注入');
                } else {
                    console.warn('⚠️ 未找到#markmap-svg元素');
                }
            }, 500);
        }
        
        // 尝试初始化Markmap（如果库已加载）
        setTimeout(() => {
            if (window.markmap && window.markmapData) {
                try {
                    const svgElement = mindmapContent.querySelector('#markmap-svg');
                    if (svgElement && window.markmapData) {
                        console.log('🎨 尝试使用Markmap库渲染');
                        // 这里可以添加Markmap库的初始化代码
                    }
                } catch (e) {
                    console.warn('⚠️ Markmap库初始化失败:', e);
                }
            }
        }, 1000);
        
    } else {
        console.log('🔄 使用思维导图降级方案，原因：没有找到有效的Markmap数据');
        
        // 尝试显示更好的降级内容
        let fallbackContent = '';
        if (mindmapData.content) {
            // 如果content是Markdown格式，转换为HTML
            fallbackContent = mindmapData.content.replace(/\n/g, '<br>')
                .replace(/^# (.+)$/gm, '<h1>$1</h1>')
                .replace(/^## (.+)$/gm, '<h2>$1</h2>')
                .replace(/^### (.+)$/gm, '<h3>$1</h3>')
                .replace(/^- (.+)$/gm, '<li>$1</li>');
        } else {
            fallbackContent = '思维导图生成中...';
        }
        
        mindmapContent.innerHTML = `
            <div class="mindmap-fallback">
                <h3>${topic} 学习思维导图</h3>
                <div class="mindmap-content">${fallbackContent}</div>
                <div style="margin-top: 1rem; padding: 1rem; background: #f0f9ff; border-radius: 8px; border: 1px solid #0ea5e9;">
                    <p><strong>📝 说明：</strong>当前显示的是文本版思维导图。真正的可视化思维导图功能正在优化中。</p>
                </div>
            </div>
        `;
    }
    
    const mindmapStatus = document.getElementById('mindmapStatus');
    if (mindmapStatus) {
        mindmapStatus.textContent = '完成';
        mindmapStatus.className = 'card-status completed';
    }
}

// 显示所有内容
function displayAllContent(data, topic) {
    const skillsContainer = document.getElementById('skillsContainer');
    if (!skillsContainer) return;
    
    let html = '';
    
    if (data.courses && data.courses.length > 0) {
        html += `
            <div class="result-card">
                <div class="card-header">
                    <h3><i class="fas fa-graduation-cap"></i> 推荐课程</h3>
                    <span class="card-status completed">已完成</span>
                </div>
                <div class="card-content">
                    ${data.courses.map(course => `
                        <div class="course-item">
                            <h4>${course.title}</h4>
                            <p>平台：${course.platform} | 评分：${course.rating} | 学生：${course.students}</p>
                            <p>${course.description}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    if (data.studyPlan) {
        html += `
            <div class="result-card">
                <div class="card-header">
                    <h3><i class="fas fa-calendar-alt"></i> 学习计划</h3>
                    <span class="card-status completed">已完成</span>
                </div>
                <div class="card-content">
                    <p><strong>目标：</strong>${data.studyPlan.goal || '掌握核心技能'}</p>
                    <p><strong>时间：</strong>${data.studyPlan.timeframe || '2-3个月'}</p>
                    ${data.studyPlan.phases ? data.studyPlan.phases.map(phase => `
                        <div class="phase-item">
                            <h4>${phase.name}</h4>
                            <ul>
                                ${phase.tasks ? phase.tasks.map(task => `<li>${task}</li>`).join('') : ''}
                            </ul>
                        </div>
                    `).join('') : ''}
                </div>
            </div>
        `;
    }
    
    if (data.exercises && data.exercises.length > 0) {
        html += `
            <div class="result-card">
                <div class="card-header">
                    <h3><i class="fas fa-question-circle"></i> 练习题</h3>
                    <span class="card-status completed">已完成</span>
                </div>
                <div class="card-content">
                    <ol>
                        ${data.exercises.map(exercise => `<li>${exercise}</li>`).join('')}
                    </ol>
                </div>
            </div>
        `;
    }
    
    skillsContainer.innerHTML = html;
    console.log('✅ 所有内容显示完成');
}

// 按钮增强函数 - 不破坏现有功能
function enhanceGenerateButton() {
    console.log('🔧 开始增强生成按钮功能...');
    
    const generateBtn = document.getElementById('generateBtn');
    const jobTitle = document.getElementById('jobTitle');
    
    if (!generateBtn || !jobTitle) {
        console.log('⚠️ 元素未找到，稍后重试...');
        setTimeout(enhanceGenerateButton, 200);
        return;
    }
    
    console.log('✅ 找到必需元素，开始增强功能');
    console.log('📊 当前按钮状态:', {
        disabled: generateBtn.disabled,
        value: jobTitle.value,
        opacity: generateBtn.style.opacity
    });
    
    // 强制启用按钮（如果有输入值）
    const currentValue = jobTitle.value.trim();
    if (currentValue.length > 0) {
        console.log('🔧 检测到有输入值，强制启用按钮');
        generateBtn.disabled = false;
        generateBtn.style.opacity = '1';
        generateBtn.style.cursor = 'pointer';
        generateBtn.style.pointerEvents = 'auto';
        generateBtn.removeAttribute('disabled');
        console.log('✅ 按钮已强制启用');
    }
    
    // 覆盖onclick事件（保持现有的addEventListener不变）
    generateBtn.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('🔘 增强版生成按钮被点击');
        
        const inputValue = jobTitle.value.trim();
        if (inputValue.length === 0) {
            alert('请先输入职位名称');
            jobTitle.focus();
            return false;
        }
        
        // 再次确保按钮可点击
        generateBtn.disabled = false;
        
        // 尝试显示内容选择弹窗
        if (!showContentModal()) {
            // 如果弹窗显示失败，直接开始生成
            console.log('⚠️ 弹窗显示失败，直接开始生成');
            startRealGeneration(inputValue);
        }
        
        return false;
    };
    
    // 添加输入监听器以保持按钮状态同步（仅针对生成按钮）
    const existingInputHandler = jobTitle.oninput;
    jobTitle.addEventListener('input', function enhancedInputHandler(e) {
        // 增强逻辑：确保有值时按钮可用
        const hasValue = e.target.value.trim().length > 0;
        if (hasValue) {
            generateBtn.disabled = false;
            generateBtn.style.opacity = '1';
            generateBtn.style.cursor = 'pointer';
            generateBtn.removeAttribute('disabled');
        }
    });
    
    // AI助手聊天功能由simple-init.js负责，不在此处处理
    
    console.log('✅ 生成按钮增强完成');
}

// AI助手聊天功能已由simple-init.js处理，不在此处重复定义

// 页面加载完成后执行增强（多重保障）
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(enhanceGenerateButton, 2000); // 等待SimpleJobAssistant初始化完成
    });
} else {
    setTimeout(enhanceGenerateButton, 2000);
}

// 定期检查和修复按钮状态
setInterval(() => {
    const jobTitle = document.getElementById('jobTitle');
    const generateBtn = document.getElementById('generateBtn');
    
    if (jobTitle && generateBtn && jobTitle.value.trim().length > 0 && generateBtn.disabled) {
        console.log('🔄 定期检查：强制启用按钮');
        generateBtn.disabled = false;
        generateBtn.style.opacity = '1';
        generateBtn.style.cursor = 'pointer';
        generateBtn.removeAttribute('disabled');
    }
}, 2000);

// AI助手聊天功能由simple-init.js负责，不在此处处理

console.log('✅ 按钮增强脚本已加载');

// 页面加载完成后执行修复
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fixGenerateButton);
} else {
    fixGenerateButton();
}

// 额外的安全网 - 延迟执行
setTimeout(() => {
    const jobTitle = document.getElementById('jobTitle');
    const generateBtn = document.getElementById('generateBtn');
    
    if (jobTitle && generateBtn) {
        console.log('🚨 执行延迟检查...');
        
        if (jobTitle.value.trim().length > 0 && generateBtn.disabled) {
            console.log('🚨 检测到按钮仍被禁用，执行紧急修复...');
            generateBtn.disabled = false;
            generateBtn.style.opacity = '1';
            generateBtn.style.cursor = 'pointer';
            generateBtn.style.pointerEvents = 'auto';
            generateBtn.removeAttribute('disabled');
            console.log('✅ 紧急修复完成');
        }
    }
}, 1500);

// 定期检查按钮状态（仅在有输入值时）
setInterval(() => {
    const jobTitle = document.getElementById('jobTitle');
    const generateBtn = document.getElementById('generateBtn');
    
    if (jobTitle && generateBtn && jobTitle.value.trim().length > 0 && generateBtn.disabled) {
        console.log('🔄 定期检查：强制启用按钮');
        generateBtn.disabled = false;
        generateBtn.style.opacity = '1';
        generateBtn.style.cursor = 'pointer';
        generateBtn.removeAttribute('disabled');
    }
}, 3000);

console.log('✅ 按钮修复脚本已加载');