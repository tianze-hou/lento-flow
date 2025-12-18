from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import date, datetime
from typing import List

from ..database import get_db
from ..models import User, Task, Completion
from ..schemas.today import TodayResponse, CompleteTaskRequest
from ..services.algorithm import LentoFlowAlgorithm, TaskState, MotivationalMessages
from ..utils.auth import get_current_user

router = APIRouter(prefix="/api/today", tags=["今日视图"])


def tasks_to_states(tasks: List[Task], today: date) -> List[TaskState]:
    """将数据库任务转换为算法状态对象"""
    states = []
    for task in tasks:
        # 检查今天是否已完成
        is_completed = any(
            c.completed_at.date() == today 
            for c in task.completions
        )
        
        states.append(TaskState(
            id=task.id,
            name=task.name,
            energy_cost=task.energy_cost,
            expected_interval=task.expected_interval,
            importance=task.importance,
            last_done_date=task.last_done_date,
            is_completed_today=is_completed,
            color=task.color,
            icon=task.icon
        ))
    return states


@router.get("", response_model=TodayResponse)
def get_today_view(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取今日视图"""
    today = date.today()
    
    # 获取用户所有活跃任务
    tasks = db.query(Task).filter(
        Task.user_id == current_user.id,
        Task.is_active == True
    ).all()
    
    if not tasks:
        return {
            "date": today,
            "energy_budget": current_user.daily_energy_budget,
            "energy_spent": 0,
            "energy_remaining": current_user.daily_energy_budget,
            "recommended_tasks": [],
            "other_tasks": [],
            "overall_health": {"score": 100, "status": "empty", "icon": "🌱", "message": "添加你的第一个习惯吧！"},
            "daily_score": None,
            "motivational_message": MotivationalMessages.get_daily_message(100, 0)
        }
    
    # 转换为状态对象
    task_states = tasks_to_states(tasks, today)
    
    # 运行推荐算法
    recommended, others = LentoFlowAlgorithm.recommend_tasks(
        task_states,
        current_user.daily_energy_budget,
        current_user.max_daily_tasks
    )
    
    # 计算分数
    completed_tasks = [t for t in task_states if t.is_completed_today]
    daily_score = LentoFlowAlgorithm.calculate_daily_score(
        completed_tasks,
        current_user.daily_energy_budget
    )
    
    # 整体健康度
    overall_health = LentoFlowAlgorithm.calculate_overall_health(task_states)
    
    # 获取最紧急的未完成任务
    uncompleted = [t for t in task_states if not t.is_completed_today]
    most_urgent = max(uncompleted, key=lambda t: t.urgency) if uncompleted else None
    
    # 生成激励消息
    message = MotivationalMessages.get_daily_message(
        overall_health["score"],
        len(tasks),
        most_urgent
    )
    
    # 构建任务响应格式
    def format_task(t: TaskState):
        return {
            "id": t.id,
            "name": t.name,
            "energy_cost": t.energy_cost,
            "urgency": t.urgency,
            "urgency_level": LentoFlowAlgorithm.get_urgency_level(t.urgency),
            "health": t.health,
            "last_done": t.last_done_date,
            "days_since": (today - t.last_done_date).days if t.last_done_date else None,
            "expected_interval": t.expected_interval,
            "is_completed_today": t.is_completed_today,
            "icon": t.icon,
            "color": t.color
        }
    
    # 计算已消耗的能量
    energy_spent = sum(t.energy_cost for t in completed_tasks)
    energy_remaining = current_user.daily_energy_budget - energy_spent
    
    return TodayResponse(
        date=today,
        energy_budget=current_user.daily_energy_budget,
        energy_spent=energy_spent,
        energy_remaining=energy_remaining,
        recommended_tasks=[format_task(t) for t in recommended],
        other_tasks=[format_task(t) for t in others],
        overall_health=overall_health,
        daily_score=daily_score if completed_tasks else None,
        motivational_message=message
    )


@router.post("/complete/{task_id}", status_code=status.HTTP_201_CREATED)
def complete_task(
    task_id: int,
    request: CompleteTaskRequest = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """标记任务完成"""
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()
    
    if not task:
        raise HTTPException(status_code=404, detail="任务不存在")
    
    # 检查今天是否已完成
    today = date.today()
    existing = db.query(Completion).filter(
        Completion.task_id == task_id,
        Completion.completed_at >= datetime.combine(today, datetime.min.time()),
        Completion.completed_at < datetime.combine(today, datetime.max.time())
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="今天已经完成过了")
    
    # 创建完成记录
    completion = Completion(
        task_id=task_id,
        note=request.note if request else None,
        mood=request.mood if request else None
    )
    db.add(completion)
    db.commit()
    db.refresh(completion)
    
    return {
        "success": True,
        "message": f"已完成: {task.name} ✓",
        "completion_id": completion.id
    }


@router.delete("/complete/{task_id}", status_code=status.HTTP_200_OK)
def uncomplete_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """撤销今日完成"""
    today = date.today()
    
    completion = db.query(Completion).join(Task).filter(
        Completion.task_id == task_id,
        Task.user_id == current_user.id,
        Completion.completed_at >= datetime.combine(today, datetime.min.time()),
        Completion.completed_at < datetime.combine(today, datetime.max.time())
    ).first()
    
    if not completion:
        raise HTTPException(status_code=404, detail="未找到今日完成记录")
    
    db.delete(completion)
    db.commit()
    
    return {
        "success": True,
        "message": "已撤销完成"
    }
