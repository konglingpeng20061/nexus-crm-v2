# NexusCRM

企业级客户关系管理系统（Vue 3 + JavaScript）

## 技术栈

- **前端框架**：Vue 3
- **构建工具**：Vite
- **路由**：Vue Router
- **状态管理**：Pinia
- **HTTP 客户端**：Axios
- **UI 组件库**：Element Plus
- **图表库**：ECharts
- **样式**：Sass
- **Mock**：MSW + Faker

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问 http://localhost:5173/

### 构建生产版本

```bash
npm run build
```

### 预览构建结果

```bash
npm run preview
```

## 项目结构

```
nexus-crm/
├── public/                 # 静态资源
├── src/
│   ├── api/               # API 请求封装
│   │   ├── mock.js        # Mock 接口调用
│   │   └── request.js     # Axios 实例
│   ├── layout/            # 后台布局
│   │   ├── Layout.vue     # 主布局组件
│   │   └── components/    # 布局子组件
│   │       ├── Breadcrumb.vue
│   │       ├── HeaderBar.vue
│   │       └── Sidebar.vue
│   ├── mock/              # Mock 数据
│   │   ├── database/      # 数据生成和存储
│   │   └── handlers/      # MSW 请求拦截
│   ├── router/            # 路由配置
│   ├── stores/            # Pinia 状态管理
│   ├── styles/            # 全局样式
│   ├── views/             # 页面组件
│   ├── App.vue            # 根组件
│   └── main.js            # 入口文件
├── index.html
├── package.json
└── vite.config.js
```

## 主要功能

- [x] 后台主布局（侧边栏 + 顶部栏 + 面包屑）
- [x] 路由系统（含登录、首页、错误页面）
- [x] 侧边栏折叠/展开
- [x] Mock 接口环境（MSW + Faker）
- [x] 接口文档页（支持在线调试）
- [ ] 客户管理模块（开发中）

## 页面路由

| 路径 | 说明 |
|------|------|
| `/` | 重定向到 `/dashboard` |
| `/login` | 登录页 |
| `/dashboard` | 首页工作台 |
| `/api-docs` | 接口文档 |
| `/forbidden` | 403 禁止访问 |
| `/*` | 404 页面不存在 |

## 接口列表

| 方法 | 地址 | 说明 |
|------|------|------|
| GET | `/api/health` | 获取服务状态 |
| POST | `/api/mock/reset` | 重置模拟数据 |
| GET | `/api/mock/error` | 模拟 500 错误 |
