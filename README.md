# 🚀 钻石网站CMS系统

无锡皇德国际贸易有限公司官方网站 - 专业的产品管理系统

## ✨ 功能特性

- 🌐 **多语言支持** - 中英文双语切换
- 📱 **响应式设计** - 完美适配各种设备
- 🛠️ **产品管理** - 强大的产品展示和管理功能
- 📊 **数据统计** - 详细的访问统计和分析
- 🔐 **安全认证** - JWT令牌认证和权限管理
- 📧 **询价系统** - 完整的客户询价处理流程

## 🚀 快速开始

### 1. 克隆项目
```bash
git clone https://github.com/tianyiswl/diamond-website-new.git
cd diamond-website-new
```

### 2. 安装依赖
```bash
npm install
```

### 3. 设置管理员账号
```bash
node setup-admin.js
```

### 4. 启动服务器
```bash
npm start
```

### 5. 访问网站
- 🌐 **网站首页**: http://localhost:3000
- 🛠️ **管理后台**: http://localhost:3000/admin
- 🔐 **登录页面**: http://localhost:3000/admin/login.html

## 📁 项目结构

```
diamond-website-new/
├── assets/                 # 静态资源
│   ├── css/               # 样式文件
│   ├── js/                # JavaScript文件
│   └── images/            # 图片资源
├── admin/                 # 管理后台
├── data/                  # 数据文件
├── pages/                 # 页面文件
├── uploads/               # 上传文件
├── server.js              # 服务器主文件
├── setup-admin.js         # 管理员设置工具
└── package.json           # 项目配置
```

## 🔧 配置说明

### 环境变量
- `PORT` - 服务器端口 (默认: 3000)
- `NODE_ENV` - 运行环境 (development/production)

### 管理员账号
首次运行需要设置管理员账号：
```bash
node setup-admin.js
```

## 📊 功能模块

### 🏠 前台功能
- 产品展示和搜索
- 多语言切换
- 询价表单提交
- 响应式布局

### 🛠️ 后台管理
- 产品管理 (增删改查)
- 分类管理
- 询价管理
- 访问统计
- 系统日志

## 🔐 安全特性

- JWT令牌认证
- 密码加密存储
- 登录失败锁定
- 权限分级管理
- 安全头设置

## 📈 统计功能

- 页面访问统计
- 独立访客统计
- 产品点击统计
- 地理位置统计
- 转化率分析

## 🌍 多语言支持

支持中文和英文双语：
- 自动语言检测
- 一键语言切换
- 完整翻译覆盖

## 📱 响应式设计

完美适配：
- 桌面端 (1200px+)
- 平板端 (768px-1199px)
- 移动端 (<768px)

## 🚀 部署指南

### 生产环境部署
1. 设置环境变量 `NODE_ENV=production`
2. 配置反向代理 (Nginx)
3. 设置SSL证书
4. 配置防火墙规则

### Docker部署
```bash
docker build -t diamond-website .
docker run -p 3000:3000 diamond-website
```

## 📞 技术支持

如有问题，请联系：
- 📧 邮箱: tianyiswl@163.com
- 🌐 网站: https://github.com/tianyiswl

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

---

**无锡皇德国际贸易有限公司** - 专业涡轮增压器和共轨喷油器配件供应商