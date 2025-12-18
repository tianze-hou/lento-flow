from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional, Dict, Any

# 用户创建请求
class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)

# 用户响应
class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    daily_energy_budget: int
    max_daily_tasks: int
    settings: Dict[str, Any]
    created_at: datetime
    
    class Config:
        from_attributes = True

# 用户设置更新
class UserSettings(BaseModel):
    daily_energy_budget: Optional[int] = Field(None, ge=5, le=30)
    max_daily_tasks: Optional[int] = Field(None, ge=1, le=10)
    settings: Optional[Dict[str, Any]] = None

# Token 响应
class Token(BaseModel):
    access_token: str
    token_type: str

# Token 数据
class TokenData(BaseModel):
    username: Optional[str] = None
