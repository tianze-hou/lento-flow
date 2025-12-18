from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import auth_router, tasks_router, today_router, stats_router
from .database import engine, Base

# 创建数据库表
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="LentoFlow API",
    description="弹性习惯追踪系统 API",
    version="1.0.0"
)

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 在生产环境中应指定具体域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(auth_router)
app.include_router(tasks_router)
app.include_router(today_router)
app.include_router(stats_router)

# 根路径
@app.get("/")
def root():
    return {
        "message": "Welcome to LentoFlow API",
        "docs": "/docs",
        "redoc": "/redoc"
    }
