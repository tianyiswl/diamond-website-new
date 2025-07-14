const express = require('express');
const compression = require('compression');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const http = require('http');
const net = require('net');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const app = express();
let PORT = process.env.PORT || 3000;
const MAX_PORT_RETRY = 10; // 最大重试次数

// 检查端口是否可用
function isPortAvailable(port) {
    return new Promise((resolve) => {
        const server = net.createServer();
        server.once('error', () => {
            resolve(false);
        });
        server.once('listening', () => {
            server.close();
            resolve(true);
        });
        server.listen(port);
    });
}

// 查找可用端口
async function findAvailablePort(startPort) {
    for (let port = startPort; port < startPort + MAX_PORT_RETRY; port++) {
        if (await isPortAvailable(port)) {
            return port;
        }
    }
    throw new Error('无法找到可用端口');
}

// 检查管理员配置
function checkAdminConfig() {
    const configPath = './data/admin-config.json';
    if (!fs.existsSync(configPath)) {
        console.log('\n⚠️  未检测到管理员配置文件');
        console.log('🔧 请运行以下命令设置管理员账号:');
        console.log('   node setup-admin.js');
        console.log('\n或者使用默认账号:');
        console.log('   用户名: admin');
        console.log('   密码: admin123');
        return false;
    }
    return true;
}

// 启动服务器函数
async function startServer() {
    try {
        // 检查管理员配置
        if (!checkAdminConfig()) {
            console.log('⚠️  管理员配置检查失败，但服务器将继续启动');
        }

        // 查找可用端口
        PORT = await findAvailablePort(PORT);
        
        // 创建HTTP服务器
        const server = http.createServer(app);
        
        // 监听端口
        await new Promise((resolve, reject) => {
            server.listen(PORT, () => {
                console.log('\n🚀 钻石网站CMS服务器启动成功！');
                console.log(`📱 网站首页: http://localhost:${PORT}`);
                console.log(`🛠️  管理后台: http://localhost:${PORT}/admin`);
                console.log(`🔐 登录页面: http://localhost:${PORT}/admin/login.html`);
                console.log(`📋 API地址: http://localhost:${PORT}/api`);
                console.log(`⏰ 启动时间: ${new Date().toLocaleString('zh-CN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false
                })}`);

                // 显示管理员登录信息
                const configPath = './data/admin-config.json';
                if (fs.existsSync(configPath)) {
                    try {
                        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
                        console.log('\n🔑 管理员登录信息:');

                        if (config.admins) {
                            // 新的多管理员结构
                            const adminCount = Object.keys(config.admins).length;
                            console.log(`   管理员数量: ${adminCount}`);

                            // 显示第一个超级管理员的信息
                            const superAdmin = Object.values(config.admins).find(admin => admin.role === 'super_admin');
                            if (superAdmin) {
                                console.log(`   超级管理员: ${superAdmin.username}`);
                                console.log(`   默认密码: admin123 (如未修改)`);
                            }
                        } else if (config.admin) {
                            // 兼容旧的单管理员结构
                            console.log(`   用户名: ${config.admin.username}`);
                            console.log(`   默认密码: admin123 (如未修改)`);
                        }
                    } catch (error) {
                        console.log('\n⚠️  管理员配置文件读取失败:', error.message);
                    }
                } else {
                    console.log('\n⚠️  未设置管理员账号，请运行: node setup-admin.js');
                }
                console.log('');
                resolve();
            });
            
            server.once('error', (err) => {
                reject(err);
            });
        });
        
        return server;
    } catch (error) {
        console.error('服务器启动失败:', error);
        process.exit(1);
    }
}

// 中间件配置
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('.'));

// 确保必要的目录存在
const ensureDirectoryExists = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

// 初始化目录结构
ensureDirectoryExists('./data');
ensureDirectoryExists('./uploads/products');

// 辅助函数：读取JSON文件
const readJsonFile = (filePath) => {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`读取文件失败 ${filePath}:`, error);
        return [];
    }
};

// 辅助函数：写入JSON文件
const writeJsonFile = (filePath, data) => {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error(`写入文件失败 ${filePath}:`, error);
        return false;
    }
};

// 初始化数据文件
const initializeDataFiles = () => {
    // 初始化产品数据
    const productsPath = './data/products.json';
    if (!fs.existsSync(productsPath)) {
        fs.writeFileSync(productsPath, JSON.stringify([], null, 2));
    }

    // 初始化分类数据
    const categoriesPath = './data/categories.json';
    if (!fs.existsSync(categoriesPath)) {
        const defaultCategories = [
            {
                id: 'turbocharger',
                name: '涡轮增压器',
                description: '各种型号的涡轮增压器及配件',
                count: 0,
                createdAt: new Date().toISOString()
            },
            {
                id: 'actuator',
                name: '执行器',
                description: '涡轮增压器执行器系列产品',
                count: 0,
                createdAt: new Date().toISOString()
            },
            {
                id: 'injector',
                name: '共轨喷油器',
                description: '高压共轨喷油器及相关配件',
                count: 0,
                createdAt: new Date().toISOString()
            },
            {
                id: 'turbo-parts',
                name: '涡轮配件',
                description: '涡轮增压器相关配件及维修件',
                count: 0,
                createdAt: new Date().toISOString()
            },
            {
                id: 'turbo-wheel',
                name: '涡轮轮',
                description: '涡轮增压器轮',
                count: 0,
                createdAt: new Date().toISOString()
            },
            {
                id: 'others',
                name: '其他',
                description: '其他汽车零部件产品',
                count: 0,
                createdAt: new Date().toISOString()
            }
        ];
        fs.writeFileSync(categoriesPath, JSON.stringify(defaultCategories, null, 2));
    }

    // 初始化询价数据
    const inquiriesPath = './data/inquiries.json';
    if (!fs.existsSync(inquiriesPath)) {
        fs.writeFileSync(inquiriesPath, JSON.stringify([], null, 2));
    }

    // 初始化操作日志
    const logsPath = './data/logs.json';
    if (!fs.existsSync(logsPath)) {
        fs.writeFileSync(logsPath, JSON.stringify([], null, 2));
    }

    // 初始化访问统计数据
    const analyticsPath = './data/analytics.json';
    if (!fs.existsSync(analyticsPath)) {
        const today = new Date().toISOString().split('T')[0];
        const defaultAnalytics = {
            daily_stats: {
                [today]: {
                    page_views: 0,
                    unique_visitors: 0,
                    product_clicks: 0,
                    inquiries: 0,
                    conversion_rate: 0,
                    bounce_rate: 0,
                    avg_session_duration: 0,
                    top_products: [],
                    traffic_sources: {
                        direct: 0,
                        search: 0,
                        social: 0,
                        referral: 0
                    },
                    hourly_data: Array.from({length: 24}, (_, i) => ({
                        hour: i,
                        views: 0,
                        clicks: 0
                    })),
                    geo_stats: {}
                }
            },
            product_stats: {},
            geo_stats: {}
        };
        fs.writeFileSync(analyticsPath, JSON.stringify(defaultAnalytics, null, 2));
        console.log(`📊 初始化analytics数据`);
    }
};

// 初始化数据文件
initializeDataFiles();

// 基本API路由
app.get('/api/products', (req, res) => {
    const products = readJsonFile('./data/products.json');
    res.json(products);
});

app.get('/api/categories', (req, res) => {
    const categories = readJsonFile('./data/categories.json');
    res.json(categories);
});

// 询价提交API
app.post('/api/inquiries', (req, res) => {
    try {
        const { name, email, phone, company, message, products } = req.body;
        
        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                message: '姓名、邮箱和留言内容为必填项'
            });
        }

        const inquiries = readJsonFile('./data/inquiries.json');
        const newInquiry = {
            id: Date.now().toString(),
            name,
            email,
            phone: phone || '',
            company: company || '',
            message,
            products: products || [],
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        inquiries.unshift(newInquiry);
        
        if (writeJsonFile('./data/inquiries.json', inquiries)) {
            res.json({
                success: true,
                message: '询价提交成功，我们会尽快与您联系！'
            });
        } else {
            res.status(500).json({
                success: false,
                message: '提交失败，请稍后重试'
            });
        }
    } catch (error) {
        console.error('提交询价失败:', error);
        res.status(500).json({
            success: false,
            message: '服务器错误，请稍后重试'
        });
    }
});

// 启动服务器
if (require.main === module) {
    startServer().then(server => {
        global.server = server;
    }).catch(error => {
        console.error('启动失败:', error);
        process.exit(1);
    });
}

module.exports = app;