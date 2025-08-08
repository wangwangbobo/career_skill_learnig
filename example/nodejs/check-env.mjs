/**
 * 环境变量配置检查脚本
 * 验证所有必需的API密钥是否正确配置
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

console.log('🔍 环境变量配置检查');
console.log('=====================================');

// 检查必需的环境变量
const requiredEnvVars = [
  {
    key: 'ALIBABA_DASHSCOPE_API_KEY',
    description: '阿里云百炼API密钥',
    required: true
  },
  {
    key: 'ALIBABA_DASHSCOPE_BASE_URL',
    description: '阿里云百炼API端点',
    required: false,
    default: 'https://dashscope.aliyuncs.com/compatible-mode/v1'
  },
  {
    key: 'ANTHROPIC_API_KEY',
    description: 'Anthropic Claude API密钥',
    required: false
  },
  {
    key: 'OPENAI_API_KEY', 
    description: 'OpenAI API密钥',
    required: false
  }
];

let allPassed = true;

console.log('📋 环境变量检查结果:\n');

requiredEnvVars.forEach(envVar => {
  const value = process.env[envVar.key];
  const hasValue = value && value !== `your_${envVar.key.toLowerCase()}_here` && value !== 'your_api_key_here';
  
  if (envVar.required) {
    if (hasValue) {
      console.log(`✅ ${envVar.key}`);
      console.log(`   描述: ${envVar.description}`);
      console.log(`   值: ${value.substring(0, 8)}...${value.substring(value.length - 4)}`);
    } else {
      console.log(`❌ ${envVar.key} (必需)`);
      console.log(`   描述: ${envVar.description}`);
      console.log(`   状态: 未配置或无效`);
      allPassed = false;
    }
  } else {
    if (hasValue) {
      console.log(`✅ ${envVar.key} (可选)`);
      console.log(`   描述: ${envVar.description}`);
      console.log(`   值: ${value.substring(0, 8)}...${value.substring(value.length - 4)}`);
    } else {
      console.log(`⚠️  ${envVar.key} (可选)`);
      console.log(`   描述: ${envVar.description}`);
      if (envVar.default) {
        console.log(`   默认值: ${envVar.default}`);
      } else {
        console.log(`   状态: 未配置`);
      }
    }
  }
  console.log();
});

console.log('=====================================');

if (allPassed) {
  console.log('🎉 环境配置检查通过！');
  console.log('✨ 您现在可以运行任何示例：');
  console.log('   • node simple-dashscope-test.mjs');
  console.log('   • node run-dashscope-demo.mjs');
  console.log('   • node real-dashscope-example.mjs');
  console.log('   • node advanced-dashscope-example.mjs');
  console.log('   • node streaming-dashscope-example.mjs');
} else {
  console.log('❌ 环境配置检查失败！');
  console.log('🔧 请修复以下问题：');
  console.log('1. 在 .env 文件中设置必需的API密钥');
  console.log('2. 确保API密钥格式正确且有效');
  console.log('3. 重新运行此脚本进行验证');
  
  console.log('\n💡 .env 文件示例：');
  console.log('ALIBABA_DASHSCOPE_API_KEY=sk-your-actual-api-key-here');
  console.log('ALIBABA_DASHSCOPE_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1');
}

console.log('\n📝 注意事项：');
console.log('• 请妥善保管您的API密钥，不要泄露给他人');
console.log('• API密钥使用会产生费用，请注意用量监控');
console.log('• 如需获取API密钥，请访问 https://dashscope.console.aliyun.com/');