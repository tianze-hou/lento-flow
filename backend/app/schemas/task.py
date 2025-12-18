from pydantic import BaseModel, Field
from datetime import datetime, date
from typing import Optional

# 任务创建请求
class TaskCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    energy_cost: int = Field(2, ge=1, le=5)
    expected_interval: int = Field(2, ge=1, le=30)
    importance: int = Field(3, ge=1, le=5)
    category: Optional[str] = None
    color: Optional[str] = Field('#6366f1', pattern='^#[0-9a-fA-F]{6}$')
    icon: Optional[str] = 'star'

# 任务更新请求
class TaskUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    energy_cost: Optional[int] = Field(None, ge=1, le=5)
    expected_interval: Optional[int] = Field(None, ge=1, le=30)
    importance: Optional[int] = Field(None, ge=1, le=5)
    category: Optional[str] = None
    color: Optional[str] = Field(None, pattern='^#[0-9a-fA-F]{6}$')
    icon: Optional[str] = None
    is_active: Optional[bool] = None

# 任务响应
class TaskResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    energy_cost: int
    expected_interval: int
    importance: int
    category: Optional[str] = None
    color: str
    icon: str
    is_active: bool
    last_done_date: Optional[date] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
