#!/bin/bash

# 职途助手实时日志功能测试脚本

echo "🚀 职途助手实时日志功能测试"
echo "=================================="

# 检查是否在正确的目录
if [ ! -f "server.js" ]; then
    echo "❌ 请在 web-interface 目录下运行此脚本"
    exit 1
fi

echo "📋 准备启动服务器..."

# 检查端口是否被占用
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  端口 3000 已被占用，正在尝试关闭..."
    pkill -f "node server.js" 2>/dev/null || true
    sleep 2
fi

echo "🔧 启动职途助手服务器..."
echo "   - 服务器地址: http://localhost:3000"
echo "   - 实时日志: 右侧面板会显示服务器日志"
echo "   - 退出服务器: 按 Ctrl+C"
echo ""

# 启动服务器
node server.js

echo "👋 服务器已关闭"