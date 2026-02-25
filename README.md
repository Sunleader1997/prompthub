# Prompt Hub - 提示词共享仓库

一个基于 Vue 3 + TypeScript + Vite 和 Express + SQLite 开发的现代化提示词共享平台。采用了直角硬朗的设计风格，无需登录即可浏览、发布和评论提示词。

## ✨ 主要功能

- **🔥 提示词列表**：按热度降序排列，支持分页加载和卡片式展示。
- **🔍 全局搜索**：支持对标题、描述、标签进行模糊搜索。
- **📝 详情展示**：展示完整提示词内容、发布者IP（脱敏）、最后修改时间。
- **📋 一键复制**：点击复制按钮自动复制内容并增加热度值。
- **✏️ 在线编辑**：支持对提示词内容进行编辑，并自动记录修改日志。
- **💬 匿名评论**：支持发布匿名评论，实时查看最新讨论。
- **🚀 快捷发布**：简单的发布流程，自动记录发布者信息。
- **🛡️ 免登录设计**：基于 IP 地址识别用户身份，无需注册账号。

## 🛠️ 技术栈

- **前端**：Vue 3, TypeScript, Vite, Tailwind CSS, Lucide Icons, Day.js
- **后端**：Express, TypeScript, Better-SQLite3
- **数据库**：SQLite (本地文件存储)

## 📦 安装与运行

### 1. 环境准备
确保您的系统已安装 [Node.js](https://nodejs.org/) (推荐 v18+)。

### 2. 开发环境运行 (Development)

在开发模式下，前端和后端分别运行在不同的端口（前端 5173，后端 3001），支持热更新。

```bash
# 1. 安装前端依赖
pnpm install

# 2. 安装后端依赖
cd api && npm install && cd ..

# 3. 启动开发服务器
# 建议开启两个终端窗口：

# 终端 1 (启动后端 API)
cd api && npm run dev

# 终端 2 (启动前端页面)
pnpm run dev
```
访问 http://localhost:5173 即可查看项目。

### 3. 生产环境部署 (Production)

项目提供了一键部署脚本，将前端构建为静态资源并集成到后端服务中，实现单端口部署。

#### 使用部署脚本

Mac/Linux 用户可以直接运行：

```bash
chmod +x deploy.sh
./deploy.sh
```

#### 手动部署步骤

如果您无法运行脚本，可按以下步骤手动操作：

1.  **构建前端**：
    ```bash
    pnpm run build
    ```
    构建产物将生成在 `dist` 目录。

2.  **准备后端静态文件**：
    ```bash
    mkdir -p api/public
    cp -r dist/* api/public/
    ```

3.  **构建并启动后端**：
    ```bash
    cd api
    npm run build
    npm start
    ```
    此时，访问 http://localhost:3001 即可使用完整功能的系统。

## 📂 目录结构

```
prompthub/
├── api/                 # 后端项目目录
│   ├── src/             # 后端源码
│   │   ├── routes/      # 路由定义
│   │   ├── db.ts        # 数据库连接
│   │   └── index.ts     # 入口文件
│   ├── data/            # SQLite 数据库文件存储位置
│   └── package.json
├── src/                 # 前端源码目录
│   ├── api/             # API 请求封装
│   ├── components/      # Vue 组件
│   ├── pages/           # 页面组件
│   ├── router/          # 路由配置
│   └── types/           # TypeScript 类型定义
├── public/              # 静态资源
├── deploy.sh            # 一键部署脚本
├── index.html           # 入口 HTML
├── package.json         # 前端配置
└── vite.config.ts       # Vite 配置
```

## ⚠️ 注意事项

- **数据存储**：数据库文件位于 `api/data/prompthub.db`。在生产环境中请注意备份该文件。
- **时区**：系统默认使用上海时区 (Asia/Shanghai) 处理所有时间显示。
- **IP 隐私**：系统会记录发布者和评论者的 IP 地址，前端显示时为完整 IP（根据最新需求），请注意隐私合规。

## 📄 许可证

MIT License
