document.addEventListener('DOMContentLoaded', function() {
    // 从URL获取参数
    const urlParams = new URLSearchParams(window.location.search);
    const showResults = urlParams.get('showResults') || localStorage.getItem('showResults');
    const jobTitle = urlParams.get('job') || localStorage.getItem('currentJob');
    
    // 如果有showResults参数或者localStorage中有showResults标记，直接跳转到结果页面
    if (showResults === 'true' && localStorage.getItem('generationCompleted') === 'true') {
        // 清除标记，避免循环重定向
        localStorage.removeItem('showResults');
        
        // 跳转到结果页面
        window.location.href = `result.html?job=${encodeURIComponent(jobTitle || '职位')}`;
    } else {
        // 默认跳转到职位选择页面
        window.location.href = 'job-input.html';
    }
});