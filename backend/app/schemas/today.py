from pydantic import BaseModel, Field
from datetime import date
from typing import List, Optional, Dict, Any

# 任务状态响应（用于今日视图）
class TaskStatus(BaseModel):
    id: int
    name: str
    energy_cost: int
    urgency: float
    urgency_level: str
    health: int
    last_done: Optional[date] = None
    days_since: Optional[int] = None
    expected_interval: int
    is_completed_today: bool
    icon: Optional[str] = None
    color: Optional[str] = None

# 整体健康度
class OverallHealth(BaseModel):
    score: float
    status: str
    icon: str
    message: str

# 每日得分
class DailyScore(BaseModel):
    base_score: float
    urgent_bonus: float
    total_score: float
    grade: str
    message: str
    energy_spent: int
    tasks_completed: int

# 今日视图响应
class TodayResponse(BaseModel):
    date: date
    energy_budget: int
    energy_spent: int
    energy_remaining: int
    recommended_tasks: List[TaskStatus]
    other_tasks: List[TaskStatus]
    overall_health: OverallHealth
    daily_score: Optional[DailyScore] = None
    motivational_message: str

# 任务完成请求
class CompleteTaskRequest(BaseModel):
    note: Optional[str] = None
    mood: Optional[int] = Field(None, ge=1, le=5)
