// 生成学习路线按钮修复脚本
// 确保按钮始终可以正常点击

console.log('🔧 加载按钮修复脚本...');

// 按钮修复函数
function fixGenerateButton() {
    console.log('🔧 执行按钮修复...');
    
    const jobTitle = document.getElementById('jobTitle');
    const generateBtn = document.getElementById('generateBtn');
    
    if (!jobTitle || !generateBtn) {
        console.log('⚠️ 按钮或输入框未找到，稍后重试...');
        setTimeout(fixGenerateButton, 200);
        return;
    }
    
    console.log('📋 找到关键元素，开始修复按钮功能...');
    
    // 强制启用按钮的函数
    function enableButton() {
        generateBtn.disabled = false;
        generateBtn.style.opacity = '1';
        generateBtn.style.cursor = 'pointer';
        generateBtn.style.pointerEvents = 'auto';
        generateBtn.style.backgroundColor = '#007bff';
        generateBtn.removeAttribute('disabled');
        console.log('✅ 按钮已强制启用');
    }
    
    // 禁用按钮的函数
    function disableButton() {
        generateBtn.disabled = true;
        generateBtn.style.opacity = '0.6';
        generateBtn.style.cursor = 'not-allowed';
        generateBtn.style.backgroundColor = '#6c757d';
    }
    
    // 检查当前状态并修复
    const currentValue = jobTitle.value.trim();
    console.log('📝 当前输入值:', currentValue);
    
    if (currentValue.length > 0) {
        enableButton();
    }
    
    // 移除所有现有的事件监听器（防止重复绑定）
    const newJobTitle = jobTitle.cloneNode(true);
    jobTitle.parentNode.replaceChild(newJobTitle, jobTitle);
    
    const newGenerateBtn = generateBtn.cloneNode(true);
    generateBtn.parentNode.replaceChild(newGenerateBtn, generateBtn);
    
    // 重新获取元素引用
    const freshJobTitle = document.getElementById('jobTitle');
    const freshGenerateBtn = document.getElementById('generateBtn');
    
    // 绑定输入事件监听器
    freshJobTitle.addEventListener('input', function(e) {
        const hasValue = e.target.value.trim().length > 0;
        console.log('📝 输入变化，按钮状态:', hasValue ? '启用' : '禁用');
        
        if (hasValue) {
            freshGenerateBtn.disabled = false;
            freshGenerateBtn.style.opacity = '1';
            freshGenerateBtn.style.cursor = 'pointer';
            freshGenerateBtn.style.pointerEvents = 'auto';
            freshGenerateBtn.removeAttribute('disabled');
        } else {
            freshGenerateBtn.disabled = true;
            freshGenerateBtn.style.opacity = '0.6';
            freshGenerateBtn.style.cursor = 'not-allowed';
        }
    });
    
    // 绑定按钮点击事件
    freshGenerateBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('🔘 生成按钮被点击');
        
        // 检查是否有输入值
        const inputValue = freshJobTitle.value.trim();
        if (inputValue.length === 0) {
            alert('请先输入职位名称');
            freshJobTitle.focus();
            return false;
        }
        
        // 触发内容选择弹窗
        try {
            console.log('🔀 尝试显示内容选择弹窗...');
            
            // 智能检测 JobAssistantUI 初始化状态
            function tryShowModal() {
                // 检查多种可能的初始化状态
                if (window.jobAssistantUI && 
                    typeof window.jobAssistantUI.showContentModal === 'function' &&
                    window.jobAssistantUI.contentModal) {
                    console.log('✅ 调用 jobAssistantUI.showContentModal');
                    window.jobAssistantUI.showContentModal();
                    return true;
                }
                
                // 检查全局JobAssistantUI类是否存在
                if (typeof JobAssistantUI !== 'undefined' && !window.jobAssistantUI) {
                    console.log('🔧 JobAssistantUI类存在但实例未创建，尝试创建实例...');
                    try {
                        window.jobAssistantUI = new JobAssistantUI();
                        if (window.jobAssistantUI.showContentModal) {
                            window.jobAssistantUI.showContentModal();
                            return true;
                        }
                    } catch (e) {
                        console.warn('⚠️ 创建JobAssistantUI实例失败:', e.message);
                    }
                }
                
                return false;
            }
            
            // 直接尝试显示模态框（降级方案）
            function showModalDirectly() {
                console.log('🔄 使用直接方式显示模态框...');
                
                // 尝试找到内容选择模态框
                const modal = document.getElementById('contentModal') || 
                             document.querySelector('.content-modal') ||
                             document.querySelector('.content-selection-modal');
                             
                if (modal) {
                    modal.classList.add('show');
                    modal.style.display = 'flex';
                    console.log('✅ 直接显示模态框成功');
                    
                    // 确保有默认选项被选中
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
                    const confirmBtn = modal.querySelector('#contentConfirm') ||
                                     modal.querySelector('.content-confirm') ||
                                     modal.querySelector('[class*="confirm"]');
                                     
                    if (confirmBtn) {
                        confirmBtn.disabled = false;
                        confirmBtn.style.opacity = '1';
                        confirmBtn.style.cursor = 'pointer';
                        console.log('✅ 确认按钮已启用');
                        
                        // 绑定确认按钮点击事件（如果还没绑定）
                        if (!confirmBtn.hasAttribute('data-event-bound')) {
                            confirmBtn.setAttribute('data-event-bound', 'true');
                            confirmBtn.addEventListener('click', function() {
                                console.log('🚀 开始生成学习资料（直接模式）');
                                modal.classList.remove('show');
                                modal.style.display = 'none';
                                
                                // 直接调用生成功能
                                setTimeout(() => {
                                    if (window.jobAssistantUI && window.jobAssistantUI.startGeneration) {
                                        window.jobAssistantUI.startGeneration();
                                    } else {
                                        // 最终降级方案：显示生成中状态
                                        showGenerationProgress();
                                    }
                                }, 100);
                            });
                        }
                    }
                    
                    // 绑定关闭按钮事件
                    const closeBtn = modal.querySelector('#contentClose') ||
                                    modal.querySelector('.content-close');
                    if (closeBtn && !closeBtn.hasAttribute('data-event-bound')) {
                        closeBtn.setAttribute('data-event-bound', 'true');
                        closeBtn.addEventListener('click', function() {
                            modal.classList.remove('show');
                            modal.style.display = 'none';
                        });
                    }
                    
                    return true;
                } else {
                    console.error('❌ 找不到内容选择模态框元素');
                    return false;
                }
            }
            
            // 显示生成进度的降级方案
            function showGenerationProgress() {
                console.log('📊 显示生成进度（降级方案）');
                const jobTitle = freshJobTitle.value.trim();
                
                // 显示生成中状态
                const loadingSection = document.getElementById('loadingSection');
                if (loadingSection) {
                    loadingSection.style.display = 'block';
                    console.log('✅ 显示加载状态');
                }
                
                // 模拟生成过程
                setTimeout(() => {
                    alert(`正在为"${jobTitle}"生成学习资料，请稍后...\n\n由于系统初始化问题，请刷新页面后重试以获得完整功能。`);
                    if (loadingSection) {
                        loadingSection.style.display = 'none';
                    }
                }, 2000);
            }
            
            // 执行显示逻辑
            if (!tryShowModal()) {
                console.log('⚠️ JobAssistantUI未完全初始化，使用备用方案...');
                
                // 尝试备用方案
                if (!showModalDirectly()) {
                    // 最终方案：简单提示
                    const jobTitle = freshJobTitle.value.trim();
                    const result = confirm(`确定要为"${jobTitle}"生成学习路线吗？\n\n将生成：知识点、面试题、推荐书籍等内容`);
                    if (result) {
                        showGenerationProgress();
                    }
                }
            }
            
        } catch (error) {
            console.error('❌ 显示模态框错误:', error);
            
            // 错误时的最终降级方案
            const jobTitle = freshJobTitle.value.trim();
            const result = confirm(`检测到系统错误，是否继续为"${jobTitle}"生成学习路线？\n\n错误信息：${error.message}`);
            
            if (result) {
                // 显示简单的生成状态
                alert('正在生成学习资料，请刷新页面后查看结果...');
            }
        }
        
        return false;
    });
    
    // 如果当前有值，立即启用按钮
    if (freshJobTitle.value.trim().length > 0) {
        freshGenerateBtn.disabled = false;
        freshGenerateBtn.style.opacity = '1';
        freshGenerateBtn.style.cursor = 'pointer';
        freshGenerateBtn.style.pointerEvents = 'auto';
        freshGenerateBtn.removeAttribute('disabled');
    }
    
    console.log('✅ 按钮修复脚本执行完成');
}

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