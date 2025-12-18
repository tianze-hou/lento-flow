from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models import User, Category
from ..schemas import CategoryCreate, CategoryUpdate, CategoryResponse
from ..utils.auth import get_current_user

router = APIRouter(prefix="/api/categories", tags=["类别管理"])

# 获取所有类别
@router.get("", response_model=List[CategoryResponse])
def get_categories(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取当前用户的所有类别"""
    categories = db.query(Category).filter(
        Category.user_id == current_user.id
    ).order_by(Category.order, Category.created_at).all()
    return categories

# 获取单个类别
@router.get("/{category_id}", response_model=CategoryResponse)
def get_category(
    category_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取单个类别"""
    category = db.query(Category).filter(
        Category.id == category_id,
        Category.user_id == current_user.id
    ).first()
    
    if not category:
        raise HTTPException(status_code=404, detail="类别不存在")
    
    return category

# 创建类别
@router.post("", response_model=CategoryResponse, status_code=201)
def create_category(
    category: CategoryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """创建新类别"""
    # 检查同名类别
    existing = db.query(Category).filter(
        Category.user_id == current_user.id,
        Category.name == category.name
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="已存在同名类别")
    
    # 创建类别
    new_category = Category(
        **category.dict(),
        user_id=current_user.id
    )
    db.add(new_category)
    db.commit()
    db.refresh(new_category)
    
    return new_category

# 更新类别
@router.put("/{category_id}", response_model=CategoryResponse)
def update_category(
    category_id: int,
    category_update: CategoryUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """更新类别信息"""
    category = db.query(Category).filter(
        Category.id == category_id,
        Category.user_id == current_user.id
    ).first()
    
    if not category:
        raise HTTPException(status_code=404, detail="类别不存在")
    
    # 检查同名类别
    if category_update.name and category_update.name != category.name:
        existing = db.query(Category).filter(
            Category.user_id == current_user.id,
            Category.name == category_update.name
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="已存在同名类别")
    
    # 更新类别
    update_data = category_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(category, field, value)
    
    db.commit()
    db.refresh(category)
    
    return category

# 删除类别
@router.delete("/{category_id}", status_code=204)
def delete_category(
    category_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """删除类别"""
    category = db.query(Category).filter(
        Category.id == category_id,
        Category.user_id == current_user.id
    ).first()
    
    if not category:
        raise HTTPException(status_code=404, detail="类别不存在")
    
    # 删除类别（级联删除相关任务？或者将任务的category_id设为null？）
    # 这里选择将任务的category_id设为null
    from ..models import Task
    db.query(Task).filter(Task.category_id == category_id).update({"category_id": None})
    
    db.delete(category)
    db.commit()
    
    return None
