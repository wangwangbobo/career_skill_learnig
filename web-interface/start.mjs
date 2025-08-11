#!/usr/bin/env node

/**
 * 智能学习伴侣Web界面启动脚本
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

console.log('🎓 智能学习伴侣 Web 界面');
console.log('='.repeat(40));

// 检查环境变量
if (!process.env.ALIBABA_DASHSCOPE_API_KEY) {
    console.log('⚠️  提示: 未设置 ALIBABA_DASHSCOPE_API_KEY 环境变量');
    console.log('   Web界面将使用模拟数据演示功能');
    console.log('   要使用真实AI功能，请设置API密钥：');
    console.log('   export ALIBABA_DASHSCOPE_API_KEY="your-api-key"');
    console.log('');
}

// 检查是否安装了依赖
try {
    await import('express');
} catch (error) {
    console.log('📦 正在安装依赖...');
    const install = spawn('npm', ['install'], { 
        cwd: __dirname, 
        stdio: 'inherit' 
    });
    
    install.on('close', (code) => {
        if (code === 0) {
            console.log('✅ 依赖安装完成');
            startServer();
        } else {
            console.error('❌ 依赖安装失败');
            process.exit(1);
        }
    });
    
    return;
}

startServer();

function startServer() {
    console.log('🚀 启动Web服务器...');
    
    const server = spawn('node', ['server.js'], {
        cwd: __dirname,
        stdio: 'inherit'
    });
    
    server.on('error', (error) => {
        console.error('❌ 服务器启动失败:', error);
    });
    
    server.on('close', (code) => {
        console.log(`👋 服务器已停止，退出码: ${code}`);
    });
    
    // 优雅关闭
    process.on('SIGINT', () => {
        console.log('\n👋 正在停止服务器...');
        server.kill('SIGINT');
    });
}