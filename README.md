# TasteCaste — 赛博种姓

轻量级跨媒体品味测试 Web 应用。用户选择喜爱的作品并完成二选一测试，获得带有戏谑风格的「赛博种姓」鉴定报告。

## 技术栈

- **前端**: React 18 + Vite, Tailwind CSS, Framer Motion, React Router
- **后端**: Node.js + Express
- **数据**: IGDB API（游戏），影视/动漫占位

## 快速开始

### 环境要求

- Node.js 18+

### 无 IGDB 凭证时（Mock）

若暂时没有 Twitch/IGDB 凭证，可用本地 mock 服务跑通全流程：

1. **启动 mock-igdb**（模拟 IGDB + Twitch 接口）：
   ```bash
   cd mock-igdb
   npm install
   npm run dev
   ```
   默认 http://localhost:3002

2. **配置并启动后端**：在 `backend/.env` 中设置：
   ```env
   IGDB_BASE_URL=http://localhost:3002/v4
   TWITCH_TOKEN_URL=http://localhost:3002/oauth2/token
   IGDB_CLIENT_ID=mock
   IGDB_CLIENT_SECRET=mock
   ```
   然后 `cd backend && npm install && npm run dev`

3. **启动前端**：`cd frontend && npm run dev`

详见 [mock-igdb/README.md](mock-igdb/README.md)。

### 使用真实 IGDB

在 [Twitch Developer Console](https://dev.twitch.tv/console) 注册应用，获取 Client ID 与 Client Secret。在 `backend/.env` 中：

- 删除或注释 `IGDB_BASE_URL`、`TWITCH_TOKEN_URL`（使用默认真实地址）
- 填写 `IGDB_CLIENT_ID`、`IGDB_CLIENT_SECRET`

关闭 mock-igdb，只启动 backend 与 frontend 即可。

### 后端（有凭证时）

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
├── mock-igdb/    # 本地 Mock IGDB/Twitch，无凭证时使用
└── README.md
```

## License

MIT
