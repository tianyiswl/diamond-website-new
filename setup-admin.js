#!/usr/bin/env node

/**
 * 🔧 管理员账号设置工具
 * 一键设置管理员账号和密码
 */

const readline = require('readline');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(prompt) {
    return new Promise((resolve) => {
        rl.question(prompt, resolve);
    });
}

function questionHidden(prompt) {
    return new Promise((resolve) => {
        process.stdout.write(prompt);
        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.setEncoding('utf8');
        
        let password = '';
        
        process.stdin.on('data', function(char) {
            char = char + '';
            
            switch(char) {
                case '\n':
                case '\r':
                case '\u0004':
                    process.stdin.setRawMode(false);
                    process.stdin.pause();
                    process.stdout.write('\n');
                    resolve(password);
                    break;
                case '\u0003':
                    process.exit();
                    break;
                case '\u007f': // backspace
                    if (password.length > 0) {
                        password = password.slice(0, -1);
                        process.stdout.write('\b \b');
                    }
                    break;
                default:
                    password += char;
                    process.stdout.write('*');
                    break;
            }
        });
    });
}

async function setupAdmin() {
    console.log('\n🚀 钻石CMS管理员账号设置');
    console.log('================================\n');
    
    try {
        // 确保data目录存在
        if (!fs.existsSync('./data')) {
            fs.mkdirSync('./data', { recursive: true });
        }
        
        // 检查是否已有配置
        const configPath = './data/admin-config.json';
        let existingConfig = null;
        
        if (fs.existsSync(configPath)) {
            existingConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            console.log('⚠️  检测到已有管理员配置');
            
            if (existingConfig.admin) {
                console.log(`   当前用户名: ${existingConfig.admin.username}`);
                console.log(`   创建时间: ${new Date(existingConfig.admin.created_at).toLocaleString()}\n`);
            }
            
            const overwrite = await question('是否要重新设置管理员账号？(y/N): ');
            if (overwrite.toLowerCase() !== 'y' && overwrite.toLowerCase() !== 'yes') {
                console.log('✅ 保持现有配置不变');
                rl.close();
                return;
            }
        }
        
        // 获取用户输入
        console.log('\n📝 请设置管理员账号信息:');
        const username = await question('用户名 (默认: admin): ') || 'admin';
        const email = await question('邮箱 (默认: admin@diamond-auto.com): ') || 'admin@diamond-auto.com';
        const name = await question('姓名 (默认: 系统管理员): ') || '系统管理员';
        
        console.log('\n🔐 请设置密码:');
        let password, confirmPassword;
        
        do {
            password = await questionHidden('密码 (至少8位): ');
            if (password.length < 8) {
                console.log('❌ 密码长度至少为8位，请重新输入');
                continue;
            }
            
            confirmPassword = await questionHidden('确认密码: ');
            if (password !== confirmPassword) {
                console.log('❌ 两次输入的密码不一致，请重新输入');
            }
        } while (password !== confirmPassword || password.length < 8);
        
        // 加密密码
        console.log('\n🔄 正在加密密码...');
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // 生成JWT密钥
        const jwtSecret = require('crypto').randomBytes(64).toString('hex');
        
        // 创建配置对象
        const config = {
            admin: {
                username,
                password: hashedPassword,
                email,
                name,
                role: 'super_admin',
                created_at: new Date().toISOString(),
                last_login: null,
                login_attempts: 0,
                locked_until: null
            },
            security: {
                jwt_secret: jwtSecret,
                session_timeout: 3600000, // 1小时
                max_login_attempts: 5,
                lockout_duration: 900000, // 15分钟
                password_min_length: 8,
                bcrypt_rounds: 10
            },
            system: {
                version: '1.0.0',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }
        };
        
        // 保存配置
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        
        console.log('\n✅ 管理员账号设置成功！');
        console.log('================================');
        console.log(`👤 用户名: ${username}`);
        console.log(`📧 邮箱: ${email}`);
        console.log(`👨‍💼 姓名: ${name}`);
        console.log(`🔐 密码: [已加密保存]`);
        console.log('\n🚀 现在可以启动服务器了:');
        console.log('   npm start');
        console.log('\n🌐 管理后台地址:');
        console.log('   http://localhost:3000/admin');
        
    } catch (error) {
        console.error('\n❌ 设置失败:', error.message);
        process.exit(1);
    } finally {
        rl.close();
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    setupAdmin();
}

module.exports = { setupAdmin };