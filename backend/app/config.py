from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    """应用配置类"""
    # 数据库配置
    DATABASE_URL: str = "sqlite:///./lentoflow.db"
    
    # JWT配置
    SECRET_KEY: str = "your-secret-key-change-me-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # 应用配置
    APP_NAME: str = "LentoFlow"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    class Config:
        env_file = ".env"

settings = Settings()