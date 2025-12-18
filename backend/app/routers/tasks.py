from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from ..database import get_db
from ..models import User, Task, Category
from ..schemas import TaskCreate, TaskResponse, TaskUpdate
from ..utils.auth import get_current_user

router = APIRouter(prefix="/api/tasks", tags=["任务"])

# 获取所有任务
@router.get("", response_model=List[TaskResponse])
def get_tasks(
    skip: int = 0,
    limit: int = 100,
    category_id: Optional[int] = None,
    is_active: Optional[bool] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Task).filter(Task.user_id == current_user.id)
    
    # 过滤条件
    if category_id is not None:
        query = query.filter(Task.category_id == category_id)
    if is_active is not None:
        query = query.filter(Task.is_active == is_active)
    
    tasks = query.offset(skip).limit(limit).all()
    
    # 转换为响应模型
    result = []
    for task in tasks:
        task_dict = task.__dict__.copy()
        result.append(TaskResponse(
            id=task.id,
            name=task.name,
            description=task.description,
            energy_cost=task.energy_cost,
            expected_interval=task.expected_interval,
            importance=task.importance,
            category_id=task.category_id,
            category_name=task.category.name if task.category else None,
            category_color=task.category.color if task.category else None,
            color=task.color,
            icon=task.icon,
            is_active=task.is_active,
            last_done_date=task.last_done_date,
            created_at=task.created_at,
            updated_at=task.updated_at
        ))
    
    return result

# 获取单个任务
@router.get("/{task_id}", response_model=TaskResponse)
def get_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="任务不存在"
        )
    
    # 转换为响应模型
    return TaskResponse(
        id=task.id,
        name=task.name,
        description=task.description,
        energy_cost=task.energy_cost,
        expected_interval=task.expected_interval,
        importance=task.importance,
        category_id=task.category_id,
        category_name=task.category.name if task.category else None,
        category_color=task.category.color if task.category else None,
        color=task.color,
        icon=task.icon,
        is_active=task.is_active,
        last_done_date=task.last_done_date,
        created_at=task.created_at,
        updated_at=task.updated_at
    )

# 创建任务
@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    task_data: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 验证category_id是否存在
    if task_data.category_id is not None:
        category = db.query(Category).filter(
            Category.id == task_data.category_id,
            Category.user_id == current_user.id
        ).first()
        if not category:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="指定的类别不存在"
            )
    
    new_task = Task(
        **task_data.dict(),
        user_id=current_user.id
    )
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    
    # 转换为响应模型
    return TaskResponse(
        id=new_task.id,
        name=new_task.name,
        description=new_task.description,
        energy_cost=new_task.energy_cost,
        expected_interval=new_task.expected_interval,
        importance=new_task.importance,
        category_id=new_task.category_id,
        category_name=new_task.category.name if new_task.category else None,
        category_color=new_task.category.color if new_task.category else None,
        color=new_task.color,
        icon=new_task.icon,
        is_active=new_task.is_active,
        last_done_date=new_task.last_done_date,
        created_at=new_task.created_at,
        updated_at=new_task.updated_at
    )

# 更新任务
@router.put("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    task_data: TaskUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="任务不存在"
        )
    
    # 验证category_id是否存在
    if task_data.category_id is not None:
        category = db.query(Category).filter(
            Category.id == task_data.category_id,
            Category.user_id == current_user.id
        ).first()
        if not category:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="指定的类别不存在"
            )
    
    # 更新任务字段
    update_data = task_data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(task, key, value)
    
    db.commit()
    db.refresh(task)
    
    # 转换为响应模型
    return TaskResponse(
        id=task.id,
        name=task.name,
        description=task.description,
        energy_cost=task.energy_cost,
        expected_interval=task.expected_interval,
        importance=task.importance,
        category_id=task.category_id,
        category_name=task.category.name if task.category else None,
        category_color=task.category.color if task.category else None,
        color=task.color,
        icon=task.icon,
        is_active=task.is_active,
        last_done_date=task.last_done_date,
        created_at=task.created_at,
        updated_at=task.updated_at
    )

# 删除任务
@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="任务不存在"
        )
    
    db.delete(task)
    db.commit()
    
    return None
