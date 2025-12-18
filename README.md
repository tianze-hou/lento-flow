# LentoFlow - 弹性习惯打卡系统

## 项目简介

LentoFlow 是一个基于 React + TypeScript + FastAPI 的弹性习惯打卡系统，帮助用户轻松养成好习惯。系统采用前后端分离架构，支持多用户同时登录，提供个性化的习惯跟踪和统计功能。

### 技术栈

- **前端**：React 18 + TypeScript + TailwindCSS + Vite
- **后端**：FastAPI + Python + SQLAlchemy + SQLite
- **认证**：JWT Token 认证
- **UI组件**：Lucide React + Framer Motion
- **数据可视化**：Recharts

## 项目特点

- ✅ 弹性习惯养成机制
- ✅ 个性化能量预算管理
- ✅ 多维度统计数据
- ✅ 友好的用户引导流程
- ✅ 完整的用户认证系统
- ✅ 响应式设计，支持移动端和桌面端
- ✅ 支持多用户同时登录

## 快速开始

### 前端运行

```bash
cd frontend
npm install
npm run dev
```

前端服务将运行在 http://localhost:3000

### 后端运行

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

后端服务将运行在 http://localhost:8000

## 项目结构

```
├── backend/              # 后端代码
│   ├── app/              # 应用主目录
│   │   ├── models/       # 数据模型
│   │   ├── routers/      # API路由
│   │   ├── schemas/      # 数据校验
│   │   ├── utils/        # 工具函数
│   │   ├── config.py     # 配置文件
│   │   ├── database.py   # 数据库连接
│   │   └── main.py       # 应用入口
│   └── requirements.txt  # 依赖列表
├── frontend/             # 前端代码
│   ├── src/              # 源代码
│   │   ├── components/   # React组件
│   │   ├── hooks/        # 自定义Hooks
│   │   ├── pages/        # 页面组件
│   │   ├── App.tsx       # 应用主组件
│   │   └── main.tsx      # 应用入口
│   ├── package.json      # 依赖配置
│   └── vite.config.ts    # Vite配置
└── README.md             # 项目说明文档
```

## 功能特性

### 已实现功能

✅ **用户认证**
- 账户注册和登录
- JWT Token 认证
- 令牌持久化和自动登录
- 路由保护

✅ **用户设置**
- 每日能量预算调整
- 最大任务数设置
- 通知偏好
- 深色模式支持
- 语言选择

✅ **任务管理**
- 任务创建和编辑
- 任务状态切换
- 任务删除
- 任务过滤

✅ **习惯打卡**
- 今日任务视图
- 任务完成打卡
- 能量消耗计算
- 健康度评估

✅ **统计数据**
- 每日任务完成情况
- 能量消耗统计
- 习惯健康度趋势
- 分类统计

✅ **用户体验**
- 完整的用户引导流程
- 流畅的动画效果
- 友好的错误提示
- 响应式设计

### 计划内未实现功能

⏳ **高级功能**
- 习惯模板库
- 任务提醒功能
- 数据导出
- 社交分享
- 成就系统

⏳ **性能优化**
- 代码分割和懒加载
- 状态管理优化
- 数据库索引优化

⏳ **部署支持**
- Docker 部署
- CI/CD 配置
- 生产环境优化

⏳ **测试覆盖**
- 单元测试
- 集成测试
- E2E 测试

## API 文档

后端提供了完整的 RESTful API，可通过以下地址访问 Swagger 文档：

http://localhost:8000/docs

## 开发流程

1. **前端开发**：在 `frontend/` 目录下进行，使用 Vite 作为构建工具
2. **后端开发**：在 `backend/` 目录下进行，使用 FastAPI 框架
3. **数据库迁移**：使用 Alembic 进行数据库版本管理
4. **代码风格**：遵循 TypeScript 和 Python 最佳实践

## 部署指南

### 云主机部署

#### 1. 环境准备

- 一台云主机（推荐配置：2核4G内存，40G硬盘）
- 安装 Python 3.10+
- 安装 Node.js 16+
- 安装 Git

#### 2. 前端部署

```bash
# 克隆代码
cd /opt
git clone https://github.com/tianze-hou/lento-flow.git
cd lento-flow/frontend

# 安装依赖
npm install

# 构建生产版本
npm run build

# 安装静态文件服务器（可选，也可使用 Nginx）
npm install -g serve

# 启动前端服务（使用 serve）
serve -s dist -l 3000

# 或者使用 Nginx 部署（推荐）
# 配置 Nginx 指向 dist 目录
```

#### 3. 后端部署

```bash
# 进入后端目录
cd /opt/lento-flow/backend

# 创建虚拟环境
python -m venv venv

# 激活虚拟环境
# Linux/macOS
source venv/bin/activate
# Windows
venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt

# 启动后端服务（开发模式）
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 生产环境建议使用 Gunicorn
pip install gunicorn uvloop httptools
gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app --bind 0.0.0.0:8000
```

#### 4. 环境变量配置

在后端目录创建 `.env` 文件，配置以下环境变量：

```env
# 数据库配置
DATABASE_URL=sqlite:///./lentoflow.db
# 或使用 PostgreSQL
# DATABASE_URL=postgresql://user:password@localhost:5432/lentoflow

# JWT 配置
SECRET_KEY=your-secret-key-change-me-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# 应用配置
DEBUG=False
```

#### 5. Nginx 配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    location / {
        root /opt/lento-flow/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # 后端 API 代理
    location /api {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### 6. 多平台访问

部署完成后，您可以通过以下方式访问应用：

- 网页访问：`http://your-server-ip:3000` 或 `http://your-domain.com`
- 移动端访问：在手机浏览器中输入相同地址
- 跨平台支持：支持 Chrome、Firefox、Safari、Edge 等主流浏览器

### Docker 部署（计划中）

Docker 部署支持将在后续版本中实现，包括：
- Dockerfile 编写
- Docker Compose 配置
- 一键部署脚本

## 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 联系方式

如有问题或建议，欢迎通过 GitHub Issues 提交

---

**LentoFlow** - 让习惯养成更轻松
