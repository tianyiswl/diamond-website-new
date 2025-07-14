#!/bin/bash

# 🚀 钻石网站CMS一键部署脚本
# 适用于Linux服务器环境

echo "🚀 开始部署钻石网站CMS..."
echo "================================"

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "❌ Node.js未安装，请先安装Node.js"
    exit 1
fi

# 检查npm是否安装
if ! command -v npm &> /dev/null; then
    echo "❌ npm未安装，请先安装npm"
    exit 1
fi

echo "✅ Node.js版本: $(node --version)"
echo "✅ npm版本: $(npm --version)"
echo ""

# 创建必要的目录
echo "📁 创建必要的目录..."
mkdir -p data
mkdir -p uploads/products
mkdir -p logs

# 安装依赖
echo "📦 安装项目依赖..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ 依赖安装失败"
    exit 1
fi

echo "✅ 依赖安装成功"

# 检查是否已有管理员配置
if [ ! -f "data/admin-config.json" ]; then
    echo ""
    echo "🔧 首次部署，需要设置管理员账号..."
    echo "请运行以下命令设置管理员账号:"
    echo "   node setup-admin.js"
    echo ""
    echo "或者使用默认账号:"
    echo "   用户名: admin"
    echo "   密码: admin123"
    echo ""
else
    echo "✅ 检测到已有管理员配置"
fi

# 设置文件权限
echo "🔐 设置文件权限..."
chmod +x setup-admin.js
chmod +x deploy.sh
chmod -R 755 assets/
chmod -R 755 admin/
chmod -R 755 pages/
chmod -R 777 uploads/
chmod -R 777 data/
chmod -R 777 logs/

echo "✅ 文件权限设置完成"

# 检查端口是否被占用
PORT=${PORT:-3000}
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  端口 $PORT 已被占用"
    echo "请修改环境变量 PORT 或停止占用该端口的进程"
else
    echo "✅ 端口 $PORT 可用"
fi

echo ""
echo "🎉 部署准备完成！"
echo "================================"
echo ""
echo "📋 接下来的步骤:"
echo "1. 设置管理员账号: node setup-admin.js"
echo "2. 启动服务器: npm start"
echo "3. 访问网站: http://localhost:$PORT"
echo "4. 管理后台: http://localhost:$PORT/admin"
echo ""
echo "🔧 其他命令:"
echo "- 开发模式: npm run dev"
echo "- 检查端口: npm run port:check"
echo "- 生成密码: npm run admin:password"
echo ""
echo "📞 如有问题，请查看 README.md 或联系技术支持"
echo ""

# 如果是生产环境，提供额外的建议
if [ "$NODE_ENV" = "production" ]; then
    echo "🚀 生产环境部署建议:"
    echo "- 使用 PM2 管理进程: pm2 start server.js"
    echo "- 配置 Nginx 反向代理"
    echo "- 设置 SSL 证书"
    echo "- 配置防火墙规则"
    echo "- 定期备份数据目录"
    echo ""
fi

echo "✅ 部署脚本执行完成！"