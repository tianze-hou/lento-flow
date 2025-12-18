from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import List, Optional, Dict, Any

# 每日统计
class DailyStats(BaseModel):
    date: date
    energy_spent: int
    tasks_completed: int
    daily_score: Optional[float] = None
    overall_health: Optional[float] = None

# 周统计
class WeeklyStats(BaseModel):
    week_start: date
    week_end: date
    total_energy_spent: int
    total_tasks_completed: int
    average_daily_score: float
    average_health: float
    completion_rate: float

# 月统计
class MonthlyStats(BaseModel):
    month: int
    year: int
    total_energy_spent: int
    total_tasks_completed: int
    average_daily_score: float
    average_health: float
    completion_rate: float
    active_days: int

# 热力图数据点
class HeatmapDataPoint(BaseModel):
    date: date
    value: int  # 完成的任务数或能量消耗

# 热力图数据
class HeatmapData(BaseModel):
    data: List[HeatmapDataPoint]
    min_value: int
    max_value: int

# 单任务统计
class TaskStats(BaseModel):
    task_id: int
    task_name: str
    total_completions: int
    longest_streak: int
    current_streak: int
    completion_rate: float
    average_health: float
    last_completed: Optional[date] = None
