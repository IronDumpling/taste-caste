# TasteCaste — 赛博品味种姓

轻量级跨媒体品味测试 Web 应用。用户选择喜爱的作品并完成二选一测试，获得带有戏谑风格的「赛博品味种姓」鉴定报告。

## 技术栈

- **前端**: React 18 + Vite, Tailwind CSS, Framer Motion, React Router
- **后端**: Node.js + Express
- **数据**: IGDB API（游戏），影视/动漫占位

## 快速开始

### 环境要求

- Node.js 18+

### 后端

```bash
cd backend
cp .env.example .env
# 编辑 .env 填入 IGDB_CLIENT_ID、IGDB_CLIENT_SECRET（Twitch 开发者控制台）
npm install
npm run dev
```

后端默认运行在 http://localhost:3001

### 前端

```bash
cd frontend
npm install
npm run dev
```

前端默认运行在 http://localhost:5173，开发时 API 请求会代理到后端。

### 生产构建

```bash
cd frontend && npm run build
cd backend && npm start
```

## 项目结构

```
taste-caste/
├── frontend/     # React SPA
├── backend/      # Express API + 打分/种姓逻辑
└── README.md
```

## License

MIT
