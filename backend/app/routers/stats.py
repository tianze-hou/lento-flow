from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date, timedelta
from typing import List, Dict, Any

from ..database import get_db
from ..models import User, Task, Completion, DailyLog
from ..schemas import DailyStats, WeeklyStats, MonthlyStats, HeatmapData, TaskStats
from ..utils.auth import get_current_user
from ..services.algorithm import LentoFlowAlgorithm, TaskState

router = APIRouter(prefix="/api/stats", tags=["统计数据"])

# 每日统计
@router.get("/daily", response_model=List[DailyStats])
def get_daily_stats(
    days: int = 7,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    end_date = date.today()
    start_date = end_date - timedelta(days=days-1)
    
    # 查询每日日志
    daily_logs = db.query(DailyLog).filter(
        DailyLog.user_id == current_user.id,
        DailyLog.log_date >= start_date,
        DailyLog.log_date <= end_date
    ).order_by(DailyLog.log_date).all()
    
    # 如果没有每日日志，生成默认数据
    result = []
    current = start_date
    while current <= end_date:
        # 查找当天的日志
        log = next((l for l in daily_logs if l.log_date == current), None)
        if log:
            result.append({
                "date": log.log_date,
                "energy_spent": log.energy_spent,
                "tasks_completed": log.tasks_completed,
                "daily_score": log.daily_score,
                "overall_health": log.overall_health
            })
        else:
            result.append({
                "date": current,
                "energy_spent": 0,
                "tasks_completed": 0,
                "daily_score": None,
                "overall_health": None
            })
        current += timedelta(days=1)
    
    return result

# 周统计
@router.get("/weekly", response_model=List[WeeklyStats])
def get_weekly_stats(
    weeks: int = 4,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    result = []
    today = date.today()
    
    for i in range(weeks):
        # 计算周的开始和结束日期（周一到周日）
        week_end = today - timedelta(days=7*i)
        week_start = week_end - timedelta(days=6)
        
        # 查询本周的完成记录
        completions = db.query(Completion).join(Task).filter(
            Task.user_id == current_user.id,
            Completion.completed_at >= week_start,
            Completion.completed_at <= week_end
        ).all()
        
        # 查询本周的任务
        tasks = db.query(Task).filter(
            Task.user_id == current_user.id,
            Task.is_active == True
        ).all()
        
        # 计算统计数据
        total_energy_spent = sum(task.energy_cost for completion in completions for task in tasks if task.id == completion.task_id)
        total_tasks_completed = len(completions)
        
        # 计算平均健康度
        task_states = []
        for task in tasks:
            last_done = max([c.completed_at.date() for c in task.completions if c.completed_at.date() <= week_end], default=None)
            task_states.append(TaskState(
                id=task.id,
                name=task.name,
                energy_cost=task.energy_cost,
                expected_interval=task.expected_interval,
                importance=task.importance,
                last_done_date=last_done,
                is_completed_today=False
            ))
        
        overall_health = LentoFlowAlgorithm.calculate_overall_health(task_states)
        
        # 计算完成率
        total_expected = sum(len(tasks) for _ in range(7))  # 简化计算，实际应该根据每个任务的期望间隔
        completion_rate = total_tasks_completed / total_expected if total_expected > 0 else 0
        
        # 计算平均每日得分
        daily_logs = db.query(DailyLog).filter(
            DailyLog.user_id == current_user.id,
            DailyLog.log_date >= week_start,
            DailyLog.log_date <= week_end
        ).all()
        avg_daily_score = sum(log.daily_score for log in daily_logs if log.daily_score is not None) / len(daily_logs) if daily_logs else 0
        
        result.append({
            "week_start": week_start,
            "week_end": week_end,
            "total_energy_spent": total_energy_spent,
            "total_tasks_completed": total_tasks_completed,
            "average_daily_score": round(avg_daily_score, 1),
            "average_health": round(overall_health["score"], 1),
            "completion_rate": round(completion_rate, 2)
        })
    
    return result

# 月统计
@router.get("/monthly", response_model=List[MonthlyStats])
def get_monthly_stats(
    months: int = 6,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    result = []
    today = date.today()
    
    for i in range(months):
        year = today.year
        month = today.month - i
        if month <= 0:
            month += 12
            year -= 1
        
        # 计算月的开始和结束日期
        start_date = date(year, month, 1)
        if month == 12:
            end_date = date(year, month, 31)
        else:
            end_date = date(year, month+1, 1) - timedelta(days=1)
        
        # 查询本月的完成记录
        completions = db.query(Completion).join(Task).filter(
            Task.user_id == current_user.id,
            Completion.completed_at >= start_date,
            Completion.completed_at <= end_date
        ).all()
        
        # 查询本月的任务
        tasks = db.query(Task).filter(
            Task.user_id == current_user.id,
            Task.is_active == True
        ).all()
        
        # 计算统计数据
        total_energy_spent = sum(task.energy_cost for completion in completions for task in tasks if task.id == completion.task_id)
        total_tasks_completed = len(completions)
        
        # 计算活跃天数
        active_dates = set([c.completed_at.date() for c in completions])
        active_days = len(active_dates)
        
        # 计算平均健康度
        task_states = []
        for task in tasks:
            last_done = max([c.completed_at.date() for c in task.completions if c.completed_at.date() <= end_date], default=None)
            task_states.append(TaskState(
                id=task.id,
                name=task.name,
                energy_cost=task.energy_cost,
                expected_interval=task.expected_interval,
                importance=task.importance,
                last_done_date=last_done,
                is_completed_today=False
            ))
        
        overall_health = LentoFlowAlgorithm.calculate_overall_health(task_states)
        
        # 计算完成率
        total_expected = sum(len(tasks) for _ in range((end_date - start_date).days + 1))  # 简化计算
        completion_rate = total_tasks_completed / total_expected if total_expected > 0 else 0
        
        # 计算平均每日得分
        daily_logs = db.query(DailyLog).filter(
            DailyLog.user_id == current_user.id,
            DailyLog.log_date >= start_date,
            DailyLog.log_date <= end_date
        ).all()
        avg_daily_score = sum(log.daily_score for log in daily_logs if log.daily_score is not None) / len(daily_logs) if daily_logs else 0
        
        result.append({
            "month": month,
            "year": year,
            "total_energy_spent": total_energy_spent,
            "total_tasks_completed": total_tasks_completed,
            "average_daily_score": round(avg_daily_score, 1),
            "average_health": round(overall_health["score"], 1),
            "completion_rate": round(completion_rate, 2),
            "active_days": active_days
        })
    
    return result

# 热力图数据
@router.get("/heatmap", response_model=HeatmapData)
def get_heatmap_data(
    days: int = 365,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    end_date = date.today()
    start_date = end_date - timedelta(days=days-1)
    
    # 查询完成记录
    completions = db.query(Completion).join(Task).filter(
        Task.user_id == current_user.id,
        Completion.completed_at >= start_date,
        Completion.completed_at <= end_date
    ).all()
    
    # 按日期分组计算完成数
    data_by_date = {}
    for completion in completions:
        comp_date = completion.completed_at.date()
        if comp_date not in data_by_date:
            data_by_date[comp_date] = 0
        data_by_date[comp_date] += 1
    
    # 生成完整的日期范围数据
    data = []
    min_value = 0
    max_value = 0
    current = start_date
    while current <= end_date:
        value = data_by_date.get(current, 0)
        data.append({
            "date": current,
            "value": value
        })
        max_value = max(max_value, value)
        current += timedelta(days=1)
    
    return {
        "data": data,
        "min_value": min_value,
        "max_value": max_value
    }

# 单任务统计
@router.get("/task/{task_id}", response_model=TaskStats)
def get_task_stats(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 检查任务是否存在
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()
    
    if not task:
        raise HTTPException(status_code=404, detail="任务不存在")
    
    # 查询所有完成记录
    completions = db.query(Completion).filter(
        Completion.task_id == task_id
    ).order_by(Completion.completed_at).all()
    
    total_completions = len(completions)
    
    # 计算连续完成天数（简化版）
    longest_streak = 0
    current_streak = 0
    if completions:
        completion_dates = sorted([c.completed_at.date() for c in completions])
        
        # 计算最长连续
        streak = 1
        for i in range(1, len(completion_dates)):
            if (completion_dates[i] - completion_dates[i-1]).days == 1:
                streak += 1
                longest_streak = max(longest_streak, streak)
            else:
                streak = 1
        longest_streak = max(longest_streak, streak)
        
        # 计算当前连续
        today = date.today()
        if completion_dates[-1] == today:
            current_streak = 1
            for i in range(len(completion_dates)-2, -1, -1):
                if (completion_dates[i+1] - completion_dates[i]).days == 1:
                    current_streak += 1
                else:
                    break
    
    # 计算完成率
    expected_completions = (date.today() - task.created_at.date()).days / task.expected_interval
    completion_rate = total_completions / expected_completions if expected_completions > 0 else 0
    
    # 计算平均健康度
    avg_health = 0
    if completions:
        # 简化计算，实际应该基于每次完成后的健康度
        last_done = max([c.completed_at.date() for c in completions])
        avg_health = LentoFlowAlgorithm.calculate_health(last_done, task.expected_interval)
    
    return {
        "task_id": task.id,
        "task_name": task.name,
        "total_completions": total_completions,
        "longest_streak": longest_streak,
        "current_streak": current_streak,
        "completion_rate": round(completion_rate, 2),
        "average_health": round(avg_health, 1),
        "last_completed": completions[-1].completed_at.date() if completions else None
    }
