/**
 * 快速初始化脚本 - 优化页面加载性能
 * 根据记忆知识：简化JavaScript初始化逻辑，移除复杂重试机制
 */

console.log('🚀 快速初始化脚本加载...');

// 立即执行初始化
(function() {
    'use strict';
    
    // 基本元素获取
    function getElements() {
        return {
            jobTitle: document.getElementById('jobTitle'),
            generateBtn: document.getElementById('generateBtn'),
            jobNameTab: document.getElementById('jobNameTab'),
            jobDescTab: document.getElementById('jobDescTab'),
            jobNameContent: document.getElementById('jobNameContent'),
            jobDescContent: document.getElementById('jobDescContent'),
            simpleLoading: document.getElementById('simpleLoading'),
            // API配置相关元素
            configBtn: document.getElementById('configBtn'),
            configModal: document.getElementById('configModal')
        };
    }
    
    // 更新按钮状态
    function updateButtonState(elements) {
        if (!elements.jobTitle || !elements.generateBtn) return;
        
        const hasValue = elements.jobTitle.value.trim().length > 0;
        elements.generateBtn.disabled = !hasValue;
        elements.generateBtn.style.opacity = hasValue ? '1' : '0.6';
        elements.generateBtn.style.cursor = hasValue ? 'pointer' : 'not-allowed';
    }
    
    // 标签切换
    function setupTabSwitching(elements) {
        if (!elements.jobNameTab || !elements.jobDescTab) return;
        
        elements.jobNameTab.addEventListener('click', () => {
            // 切换标签状态
            elements.jobNameTab.classList.add('active');
            elements.jobDescTab.classList.remove('active');
            
            // 切换内容
            if (elements.jobNameContent) elements.jobNameContent.classList.add('active');
            if (elements.jobDescContent) elements.jobDescContent.classList.remove('active');
            
            updateButtonState(elements);
        });
        
        elements.jobDescTab.addEventListener('click', () => {
            // 切换标签状态
            elements.jobDescTab.classList.add('active');
            elements.jobNameTab.classList.remove('active');
            
            // 切换内容
            if (elements.jobDescContent) elements.jobDescContent.classList.add('active');
            if (elements.jobNameContent) elements.jobNameContent.classList.remove('active');
            
            updateButtonState(elements);
        });
    }
    
    // 设置热门职位标签
    function setupJobTags(elements) {
        const jobTags = document.querySelectorAll('.job-tag');
        jobTags.forEach(tag => {
            tag.addEventListener('click', () => {
                const job = tag.getAttribute('data-job');
                if (job && elements.jobTitle) {
                    elements.jobTitle.value = job;
                    updateButtonState(elements);
                }
            });
        });
    }
    
    // 设置API配置按钮
    function setupConfigButton(elements) {
        console.log('🔧 开始设置API配置按钮...');
        
        // 详细检查所有相关元素
        const configBtn = document.getElementById('configBtn');
        const configModal = document.getElementById('configModal');
        
        console.log('🔍 元素检查结果:', {
            configBtn: !!configBtn,
            configModal: !!configModal,
            configBtnElement: configBtn,
            configModalElement: configModal
        });
        
        if (!configBtn) {
            console.error('❌ 未找到配置按钮元素 #configBtn');
            return;
        }
        
        if (!configModal) {
            console.error('❌ 未找到配置弹窗元素 #configModal');
            return;
        }
        
        // 强制移除所有现有事件监听器
        const newConfigBtn = configBtn.cloneNode(true);
        configBtn.parentNode.replaceChild(newConfigBtn, configBtn);
        
        // 清除可能的内联事件
        newConfigBtn.onclick = null;
        newConfigBtn.removeAttribute('onclick');
        
        console.log('🔗 绑定配置按钮点击事件...');
        
        // 使用多种方式绑定事件，确保至少一种生效
        const clickHandler = function(event) {
            event.preventDefault();
            event.stopPropagation();
            
            console.log('🔑 API配置按钮被点击！开始显示配置弹窗...');
            
            // 显示配置弹窗
            configModal.classList.add('show');
            configModal.style.display = 'flex';
            configModal.style.zIndex = '9999';
            
            console.log('✅ 配置弹窗已显示，当前类名:', configModal.className);
            
            // 聚焦到API密钥输入框
            const apiKeyInput = document.getElementById('apiKeyInput');
            if (apiKeyInput) {
                setTimeout(() => {
                    apiKeyInput.focus();
                    console.log('🎯 已聚焦到API密钥输入框');
                }, 100);
            }
        };
        
        // 三种方式绑定事件
        newConfigBtn.addEventListener('click', clickHandler);
        newConfigBtn.onclick = clickHandler;
        
        // 设置按钮为可点击状态
        newConfigBtn.style.pointerEvents = 'auto';
        newConfigBtn.style.cursor = 'pointer';
        
        console.log('✅ 配置按钮事件绑定完成，已使用多重绑定方式');
        
        // 设置关闭按钮事件
        const setupCloseEvent = (selector, name) => {
            const element = document.getElementById(selector) || document.querySelector('.' + selector);
            if (element) {
                element.addEventListener('click', function(event) {
                    event.preventDefault();
                    event.stopPropagation();
                    console.log(`❌ 通过${name}关闭配置弹窗`);
                    configModal.classList.remove('show');
                    configModal.style.display = 'none';
                });
                console.log(`✅ ${name}关闭事件已绑定`);
            } else {
                console.warn(`⚠️ 未找到${name}元素: ${selector}`);
            }
        };
        
        setupCloseEvent('configClose', '关闭按钮');
        setupCloseEvent('configCancel', '取消按钮');
        setupCloseEvent('configOverlay', '遮罩层');
        
        // 设置测试连接和保存配置按钮事件 - 使用更可靠的方法
        function setupConfigModalButtons() {
            console.log('🔧 开始设置配置弹窗内的按钮事件...');
            
            // 获取所有必要元素
            const configTest = document.getElementById('configTest');
            const configSave = document.getElementById('configSave');
            const apiKeyInput = document.getElementById('apiKeyInput');
            const configStatus = document.getElementById('configStatus');
            
            console.log('🔍 配置弹窗按钮元素检查:', {
                configTest: !!configTest,
                configSave: !!configSave,
                apiKeyInput: !!apiKeyInput,
                configStatus: !!configStatus
            });
            
            // 显示配置状态的辅助函数
            function showConfigStatus(message, type) {
                if (configStatus) {
                    configStatus.className = `config-status ${type}`;
                    configStatus.innerHTML = `<p>${message}</p>`;
                    console.log(`📊 配置状态: ${type} - ${message}`);
                }
            }
            
            // 更新配置按钮状态的辅助函数
            function updateConfigButtonStatus(hasApiKey) {
                const configBtnInNav = document.getElementById('configBtn');
                if (configBtnInNav) {
                    if (hasApiKey) {
                        configBtnInNav.classList.add('configured');
                        configBtnInNav.innerHTML = `
                            <i class="fas fa-check"></i>
                            <span>已配置</span>
                        `;
                        console.log('✅ 配置按钮状态已更新为已配置');
                    } else {
                        configBtnInNav.classList.remove('configured');
                        configBtnInNav.innerHTML = `
                            <i class="fas fa-cog"></i>
                            <span>配置API</span>
                        `;
                        console.log('⚪ 配置按钮状态已更新为未配置');
                    }
                }
            }
            
            // 绑定测试连接按钮
            if (configTest && apiKeyInput) {
                // 先移除所有现有事件监听器
                configTest.onclick = null;
                configTest.removeAttribute('onclick');
                
                // 直接设置onclick事件
                configTest.onclick = async function(event) {
                    event.preventDefault();
                    event.stopPropagation();
                    
                    const apiKey = apiKeyInput.value.trim();
                    console.log('🧪 测试连接按钮被点击！API Key长度:', apiKey.length);
                    
                    if (!apiKey) {
                        showConfigStatus('请先输入API密钥', 'error');
                        alert('请先输入API密钥！');
                        return;
                    }
                    
                    showConfigStatus('正在测试连接...', 'loading');
                    configTest.disabled = true;
                    const originalText = configTest.innerHTML;
                    configTest.innerHTML = '测试中...';
                    
                    try {
                        const response = await fetch('/api/test-api-key', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ apiKey })
                        });
                        
                        const result = await response.json();
                        
                        if (response.ok && result.success) {
                            showConfigStatus('✓ API密钥验证成功！', 'success');
                            alert('API密钥验证成功！');
                            console.log('✅ API密钥验证成功');
                        } else {
                            const errorMsg = '✗ API密钥验证失败: ' + (result.error || '连接失败');
                            showConfigStatus(errorMsg, 'error');
                            alert(errorMsg);
                            console.error('❌ API密钥验证失败:', result.error);
                        }
                    } catch (error) {
                        console.error('❌ API测试失败:', error);
                        const errorMsg = '✗ 网络连接失败，请检查网络连接';
                        showConfigStatus(errorMsg, 'error');
                        alert(errorMsg);
                    } finally {
                        configTest.disabled = false;
                        configTest.innerHTML = originalText;
                    }
                };
                
                console.log('✅ 测试连接按钮事件已绑定');
            } else {
                console.error('❌ 未找到测试连接按钮或API密钥输入框');
            }
            
            // 绑定保存配置按钮
            if (configSave && apiKeyInput) {
                // 先移除所有现有事件监听器
                configSave.onclick = null;
                configSave.removeAttribute('onclick');
                
                // 直接设置onclick事件
                configSave.onclick = function(event) {
                    event.preventDefault();
                    event.stopPropagation();
                    
                    const apiKey = apiKeyInput.value.trim();
                    console.log('💾 保存配置按钮被点击！API Key长度:', apiKey.length);
                    
                    if (!apiKey) {
                        showConfigStatus('请先输入API密钥', 'error');
                        alert('请先输入API密钥！');
                        return;
                    }
                    
                    try {
                        localStorage.setItem('ai_learning_companion_api_key', apiKey);
                        showConfigStatus('✓ API密钥已保存！现在可以使用AI功能了', 'success');
                        alert('API密钥已保存成功！');
                        console.log('✅ API密钥已保存到本地存储');
                        
                        // 更新配置按钮状态
                        updateConfigButtonStatus(true);
                        
                        // 2秒后关闭弹窗
                        setTimeout(() => {
                            configModal.classList.remove('show');
                            configModal.style.display = 'none';
                            console.log('🔒 配置弹窗已自动关闭');
                        }, 2000);
                        
                    } catch (error) {
                        console.error('❌ 保存API密钥失败:', error);
                        const errorMsg = '保存失败，请重试';
                        showConfigStatus(errorMsg, 'error');
                        alert(errorMsg);
                    }
                };
                
                console.log('✅ 保存配置按钮事件已绑定');
            } else {
                console.error('❌ 未找到保存配置按钮或API密钥输入框');
            }
        }
        
        // 立即尝试绑定，然后延迟再次尝试
        setupConfigModalButtons();
        setTimeout(setupConfigModalButtons, 500);
        setTimeout(setupConfigModalButtons, 1500)
        
        // 加载已保存的API密钥状态
        try {
            const storedKey = localStorage.getItem('ai_learning_companion_api_key');
            if (storedKey) {
                // 更新配置按钮状态
                const configBtnInNav = document.getElementById('configBtn');
                if (configBtnInNav) {
                    configBtnInNav.classList.add('configured');
                    configBtnInNav.innerHTML = `
                        <i class="fas fa-check"></i>
                        <span>已配置</span>
                    `;
                }
                console.log('🔑 已加载存储的API密钥，配置按钮状态已更新');
            }
        } catch (error) {
            console.warn('⚠️ 加载存储的API密钥失败:', error);
        }
        
        console.log('✅ API配置按钮事件设置完成');
    }
    
    // 主初始化函数
    function init() {
        console.log('🚀 开始快速初始化...');
        const startTime = Date.now();
        
        const elements = getElements();
        
        // 立即隐藏加载指示器
        if (elements.simpleLoading) {
            elements.simpleLoading.style.display = 'none';
            console.log('✅ 加载指示器已隐藏');
        }
        
        // 设置输入监听
        if (elements.jobTitle) {
            elements.jobTitle.addEventListener('input', () => updateButtonState(elements));
            console.log('✅ 输入框事件已绑定');
        }
        
        // 设置标签切换
        setupTabSwitching(elements);
        
        // 设置热门职位标签
        setupJobTags(elements);
        
        // 设置API配置按钮
        setupConfigButton(elements);
        
        // 初始状态更新
        updateButtonState(elements);
        
        const duration = Date.now() - startTime;
        console.log(`✅ 快速初始化完成，耗时: ${duration}ms`);
    }
    
    // DOM 加载完成后立即初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // 备用初始化（确保在任何情况下都能工作）
    setTimeout(init, 100);
})();