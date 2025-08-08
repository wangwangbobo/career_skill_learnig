/**
 * 阿里云百炼 API 简化测试
 * 从环境变量读取API密钥进行测试
 */

// 加载环境变量
import { readFileSync, existsSync } from 'fs';

try {
  if (existsSync('.env')) {
    const envContent = readFileSync('.env', 'utf8');
    envContent.split('\n').forEach(line => {
      if (line.trim() && !line.startsWith('#') && line.includes('=')) {
        const [key, value] = line.split('=', 2);
        if (key && value) {
          process.env[key.trim()] = value.trim();
        }
      }
    });
  }
} catch (error) {
  // 如果无法读取.env文件，继续执行检查
  console.warn('Warning: Could not read .env file:', error.message);
}

console.log('🚀 阿里云百炼 API 连接测试开始');
console.log('=====================================');

async function testDashScopeAPI() {
  // 从环境变量读取API密钥
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
            content: '你好，请简单介绍一下自己，并说明你的能力。'
          }
        ],
        max_tokens: 200,
        temperature: 0.7
      })
    });

    console.log('📡 HTTP状态码:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API调用失败:', response.status, response.statusText);
      console.error('错误详情:', errorText);
      return;
    }

    const data = await response.json();
    console.log('✅ API连接成功!');
    console.log('🤖 模型响应:');
    console.log('─'.repeat(50));
    console.log(data.choices[0].message.content);
    console.log('─'.repeat(50));
    console.log('📊 使用统计:');
    console.log('   输入token数:', data.usage.prompt_tokens);
    console.log('   输出token数:', data.usage.completion_tokens);
    console.log('   总token数:', data.usage.total_tokens);

    console.log('\n=====================================');
    console.log('🎉 阿里云百炼API测试通过！');
    console.log('✨ 现在可以运行完整的Eko示例了');

    return true;

  } catch (error) {
    console.error('❌ 连接测试失败:', error.message);
    console.log('\n🔍 请检查:');
    console.log('1. API密钥是否正确');
    console.log('2. 网络连接是否正常');
    console.log('3. 是否开通了百炼服务');
    console.log('4. API配额是否充足');
    return false;
  }
}

// 运行测试
testDashScopeAPI().then(success => {
  if (success) {
    console.log('\n🚀 准备运行Eko框架示例...');
    console.log('💡 您可以运行以下命令体验更多功能:');
    console.log('   node -e "console.log(\'Eko + 阿里云百炼集成成功!\')"');
  }
}).catch(console.error);