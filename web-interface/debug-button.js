// 生成学习路线按钮调试脚本
// 在浏览器控制台中运行此脚本来诊断问题

function debugGenerateButton() {
    console.log('🔍 开始调试生成学习路线按钮...');
    
    // 检查UI实例
    const ui = window.jobAssistantUI;
    console.log('UI实例:', ui);
    
    if (!ui) {
        console.error('❌ JobAssistantUI实例不存在');
        return;
    }
    
    // 检查关键元素
    const elements = {
        jobTitle: ui.jobTitle,
        generateBtn: ui.generateBtn,
        jobNameContent: ui.jobNameContent,
        contentModal: ui.contentModal
    };
    
    console.log('🔧 关键元素检查:', elements);
    
    // 检查按钮状态
    if (ui.generateBtn) {
        console.log('🔲 按钮当前状态:', {
            disabled: ui.generateBtn.disabled,
            opacity: ui.generateBtn.style.opacity,
            cursor: ui.generateBtn.style.cursor,
            classList: Array.from(ui.generateBtn.classList)
        });
    }
    
    // 检查输入框值
    if (ui.jobTitle) {
        console.log('📝 输入框状态:', {
            value: ui.jobTitle.value,
            trimmedLength: ui.jobTitle.value.trim().length
        });
    }
    
    // 检查Tab状态
    if (ui.jobNameContent) {
        console.log('📋 Tab状态:', {
            isJobNameTabActive: ui.jobNameContent.classList.contains('active')
        });
    }
    
    // 手动触发更新
    console.log('🔄 手动触发按钮状态更新...');
    ui.updateGenerateButton();
    
    // 再次检查按钮状态
    if (ui.generateBtn) {
        console.log('🔲 更新后的按钮状态:', {
            disabled: ui.generateBtn.disabled,
            opacity: ui.generateBtn.style.opacity,
            cursor: ui.generateBtn.style.cursor
        });
    }
    
    return {
        ui,
        elements,
        canClick: ui.generateBtn && !ui.generateBtn.disabled
    };
}

// 强制启用按钮（仅用于调试）
function forceEnableButton() {
    const ui = window.jobAssistantUI;
    if (ui && ui.generateBtn) {
        ui.generateBtn.disabled = false;
        ui.generateBtn.style.opacity = '1';
        ui.generateBtn.style.cursor = 'pointer';
        console.log('✅ 按钮已强制启用');
    } else {
        console.error('❌ 无法找到按钮元素');
    }
}

// 测试点击事件
function testButtonClick() {
    const ui = window.jobAssistantUI;
    if (ui && ui.generateBtn) {
        console.log('🔘 模拟点击按钮...');
        ui.generateBtn.click();
    } else {
        console.error('❌ 无法找到按钮元素');
    }
}

console.log('🛠️ 调试函数已加载:');
console.log('- debugGenerateButton() - 诊断按钮问题');
console.log('- forceEnableButton() - 强制启用按钮');
console.log('- testButtonClick() - 测试点击事件');
console.log('');
console.log('请运行: debugGenerateButton()');