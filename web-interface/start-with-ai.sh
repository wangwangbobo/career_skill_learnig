#!/bin/bash

# 智能学习伴侣 - 真实AI功能启动脚本

echo "🎓 智能学习伴侣 - 真实AI功能设置"
echo "=" $(printf '=%.0s' {1..40})

# 检查是否提供了API密钥参数
if [ -z "$1" ]; then
    echo ""
    echo "❌ 请提供阿里云百炼API密钥"
    echo ""
    echo "使用方法："
    echo "  ./start-with-ai.sh your-api-key"
    echo ""
    echo "获取API密钥："
    echo "  1. 访问 https://dashscope.console.aliyun.com/"
    echo "  2. 登录阿里云账号"
    echo "  3. 创建API密钥"
    echo "  4. 复制密钥并运行此脚本"
    echo ""
    exit 1
fi

API_KEY=$1

echo ""
echo "🔑 设置API密钥..."
export ALIBABA_DASHSCOPE_API_KEY="$API_KEY"

echo "✅ API密钥已设置"
echo ""
echo "🚀 启动智能学习伴侣Web服务..."
echo ""

# 启动服务器
cd "$(dirname "$0")"
node server.js