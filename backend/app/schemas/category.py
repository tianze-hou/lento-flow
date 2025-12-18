from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import Optional

# 类别基础模型
class CategoryBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=50, description="类别名称")
    color: str = Field(default="#6366f1", description="类别颜色")
    order: int = Field(default=0, description="类别顺序")
    is_active: bool = Field(default=True, description="是否激活")

# 创建类别请求模型
class CategoryCreate(CategoryBase):
    pass

# 更新类别请求模型
class CategoryUpdate(CategoryBase):
    name: Optional[str] = Field(None, min_length=1, max_length=50, description="类别名称")
    color: Optional[str] = Field(None, description="类别颜色")
    order: Optional[int] = Field(None, description="类别顺序")
    is_active: Optional[bool] = Field(None, description="是否激活")

# 类别响应模型
class CategoryResponse(CategoryBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
