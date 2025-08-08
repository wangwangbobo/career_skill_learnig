/**
 * 阿里云百炼 API 连接测试
 * 使用真实API密钥测试连接和基本功能
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// 获取当前文件目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 加载环境变量
dotenv.config({ path: join(__dirname, '.env') });

console.log('🚀 阿里云百炼 API 连接测试开始');
console.log('=====================================');

async function testDashScopeAPI() {
  const apiKey = process.env.ALIBABA_DASHSCOPE_API_KEY;
  const baseURL = process.env.ALIBABA_DASHSCOPE_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1';

  if (!apiKey || apiKey === 'your_dashscope_api_key_here') {
    console.error('❌ 未找到有效的API密钥');
    console.log('请确保在 .env 文件中正确设置了 ALIBABA_DASHSCOPE_API_KEY');
    return;
  }

  console.log('✅ API密钥已配置');
  console.log('🔗 API端点:', baseURL);
  console.log('🔑 API密钥:', apiKey.substring(0, 8) + '...' + apiKey.substring(apiKey.length - 4));

  try {
    console.log('\n🧪 测试API连接...');
    
    const response = await fetch(`${baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'X-DashScope-SSE': 'disable' // 禁用流式输出用于测试
      },
      body: JSON.stringify({
        model: 'qwen-turbo',
        messages: [
          {
            role: 'user',
            content: '你好，请简单介绍一下自己。'
          }
        ],
        max_tokens: 100,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API调用失败:', response.status, response.statusText);
      console.error('错误详情:', errorText);
      return;
    }

    const data = await response.json();
    console.log('✅ API连接成功!');
    console.log('🤖 模型响应:', data.choices[0].message.content);
    console.log('📊 使用信息:', data.usage);

    console.log('\n=====================================');
    console.log('🎉 阿里云百炼API测试通过！');
    console.log('✨ 现在可以运行完整的Eko示例了');

  } catch (error) {
    console.error('❌ 连接测试失败:', error.message);
    console.log('\n🔍 请检查:');
    console.log('1. API密钥是否正确');
    console.log('2. 网络连接是否正常');
    console.log('3. 是否开通了百炼服务');
    console.log('4. API配额是否充足');
  }
}

// 运行测试
testDashScopeAPI().catch(console.error);