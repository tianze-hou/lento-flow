"""
LentoFlow 核心算法模块
"""

import math
from datetime import date, timedelta
from typing import List, Optional
from dataclasses import dataclass

@dataclass
class TaskState:
    """任务状态数据类"""
    id: int
    name: str
    energy_cost: int
    expected_interval: int
    importance: int
    last_done_date: Optional[date]
    urgency: float = 0.0
    health: int = 100
    is_completed_today: bool = False
    color: str = '#6366f1'
    icon: str = 'star'


class LentoFlowAlgorithm:
    """弹性习惯算法核心类"""
    
    # 紧迫度级别阈值
    URGENCY_LEVELS = {
        "low": (0, 0.7),
        "normal": (0.7, 1.3),
        "high": (1.3, 2.0),
        "critical": (2.0, float('inf'))
    }
    
    @staticmethod
    def calculate_urgency(
        last_done_date: Optional[date],
        expected_interval: int,
        importance: int,
        today: Optional[date] = None
    ) -> float:
        """计算任务紧迫度"""
        today = today or date.today()
        
        if last_done_date is None:
            days_since = expected_interval * 2  # 未做过视为超期
        else:
            days_since = (today - last_done_date).days
        
        # 防止除零
        if expected_interval <= 0:
            expected_interval = 1
        
        # 基础紧迫度
        base_urgency = days_since / expected_interval
        
        # 超期惩罚因子（对数增长）
        overdue_days = max(0, days_since - expected_interval)
        overdue_factor = 1 + math.log(1 + overdue_days * 0.3)
        
        # 重要性权重 (1-5 -> 0.6-1.4)
        importance_weight = 0.6 + (importance - 1) * 0.2
        
        return round(base_urgency * overdue_factor * importance_weight, 2)
    
    @staticmethod
    def calculate_health(
        last_done_date: Optional[date],
        expected_interval: int,
        today: Optional[date] = None
    ) -> int:
        """计算任务健康度 (0-100)"""
        today = today or date.today()
        
        if last_done_date is None:
            return 30  # 从未完成
        
        days_since = (today - last_done_date).days
        
        # 健康度曲线：刚完成=100%，到期=50%，超期逐渐降低
        if days_since == 0:
            return 100
        elif days_since <= expected_interval:
            # 线性下降到 50%
            decay_per_day = 50 / expected_interval
            return int(100 - days_since * decay_per_day)
        else:
            # 超期后继续下降，但最低 10%
            extra_days = days_since - expected_interval
            extra_decay = min(40, extra_days * (30 / expected_interval))
            return max(10, int(50 - extra_decay))
    
    @staticmethod
    def get_urgency_level(urgency: float) -> str:
        """获取紧迫度级别"""
        for level, (low, high) in LentoFlowAlgorithm.URGENCY_LEVELS.items():
            if low <= urgency < high:
                return level
        return "critical"
    
    @classmethod
    def recommend_tasks(
        cls,
        tasks: List[TaskState],
        daily_energy_budget: int,
        max_tasks: int = 5,
        today: Optional[date] = None
    ) -> tuple[List[TaskState], List[TaskState]]:
        """
        推荐今日任务
        
        返回: (推荐任务列表, 其他任务列表)
        """
        today = today or date.today()
        
        # 计算所有任务的紧迫度和健康度
        for task in tasks:
            task.urgency = cls.calculate_urgency(
                task.last_done_date,
                task.expected_interval,
                task.importance,
                today
            )
            task.health = cls.calculate_health(
                task.last_done_date,
                task.expected_interval,
                today
            )
        
        # 过滤今天已完成的任务
        available_tasks = [t for t in tasks if not t.is_completed_today]
        completed_today = [t for t in tasks if t.is_completed_today]
        
        recommended = list(completed_today)  # 已完成的也显示
        remaining_energy = daily_energy_budget
        
        # 计算已消耗能量
        for task in completed_today:
            remaining_energy -= task.energy_cost
        
        # 1. 加入紧急任务
        critical_tasks = [t for t in available_tasks if t.urgency >= 2.0]
        critical_tasks.sort(key=lambda t: -t.urgency)
        for task in critical_tasks:
            if len(recommended) < max_tasks + len(completed_today):
                recommended.append(task)
                remaining_energy -= task.energy_cost
        
        # 2. 按性价比选择普通任务
        normal_tasks = [t for t in available_tasks if t.urgency < 2.0]
        normal_tasks.sort(key=lambda t: -t.urgency / max(t.energy_cost, 1))
        
        for task in normal_tasks:
            if len(recommended) >= max_tasks + len(completed_today):
                break
            if task.energy_cost <= remaining_energy or remaining_energy == daily_energy_budget:
                recommended.append(task)
                remaining_energy -= task.energy_cost
        
        # 其他任务
        recommended_ids = {t.id for t in recommended}
        others = [t for t in tasks if t.id not in recommended_ids]
        
        return recommended, others
    
    @classmethod
    def calculate_daily_score(
        cls,
        completed_tasks: List[TaskState],
        daily_energy_budget: int
    ) -> dict:
        """计算每日得分"""
        if not completed_tasks:
            return {
                "base_score": 0,
                "urgent_bonus": 0,
                "total_score": 0,
                "grade": "rest",
                "message": "今天是休息日 🌙"
            }
        
        energy_spent = sum(t.energy_cost for t in completed_tasks)
        urgency_sum = sum(t.urgency for t in completed_tasks)
        
        # 基础分：能量完成率
        energy_ratio = energy_spent / max(daily_energy_budget, 1)
        base_score = min(100, energy_ratio * 100)
        
        # 紧急任务加分
        urgent_bonus = min(20, urgency_sum * 3)
        
        total_score = min(120, base_score + urgent_bonus)
        
        # 评级
        if total_score >= 100:
            grade, message = "excellent", "太棒了！超额完成！ 🌟"
        elif total_score >= 80:
            grade, message = "good", "干得不错！保持下去 💪"
        elif total_score >= 50:
            grade, message = "okay", "不错的一天！ 👍"
        else:
            grade, message = "light", "轻松的一天也很好 🌿"
        
        return {
            "base_score": round(base_score, 1),
            "urgent_bonus": round(urgent_bonus, 1),
            "total_score": round(total_score, 1),
            "grade": grade,
            "message": message,
            "energy_spent": energy_spent,
            "tasks_completed": len(completed_tasks)
        }
    
    @classmethod
    def calculate_overall_health(cls, tasks: List[TaskState]) -> dict:
        """计算整体健康状态"""
        if not tasks:
            return {
                "score": 100,
                "status": "empty",
                "icon": "🌱",
                "message": "添加你的第一个习惯吧！"
            }
        
        # 加权平均
        weighted_sum = sum(t.health * t.importance for t in tasks)
        weight_total = sum(t.importance for t in tasks)
        avg_health = weighted_sum / weight_total
        
        if avg_health >= 80:
            status, icon, message = "thriving", "🌳", "习惯花园一片繁茂！"
        elif avg_health >= 60:
            status, icon, message = "healthy", "🌿", "整体状态良好"
        elif avg_health >= 40:
            status, icon, message = "needs_attention", "🌱", "有些习惯需要关注了"
        else:
            status, icon, message = "struggling", "🥀", "花园需要照料了..."
        
        return {
            "score": round(avg_health, 1),
            "status": status,
            "icon": icon,
            "message": message
        }


class MotivationalMessages:
    """激励消息生成器"""
    
    @staticmethod
    def get_daily_message(
        health_score: float,
        tasks_count: int,
        most_urgent_task: Optional[TaskState] = None
    ) -> str:
        """生成每日激励消息"""
        
        if tasks_count == 0:
            return "新的一天，新的开始！添加你想培养的习惯吧 ✨"
        
        if most_urgent_task and most_urgent_task.urgency >= 2.0:
            days = (date.today() - most_urgent_task.last_done_date).days if most_urgent_task.last_done_date else "很久"
            return f"{most_urgent_task.name}已经等你{days}天了，今天来打个卡？ 📝"
        
        if health_score >= 80:
            return "所有习惯都保持得很好！今天继续加油 💪"
        elif health_score >= 60:
            return "状态不错！选一两个任务完成就很棒了 🎯"
        elif health_score >= 40:
            return "有些习惯在想念你了，今天看看它们？ 🌱"
        else:
            return "别担心，每天进步一点点就好 🌈"
