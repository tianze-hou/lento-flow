from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base

class Task(Base):
    __tablename__ = 'tasks'
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False, index=True)
    name = Column(String(100), nullable=False, index=True)
    description = Column(Text)
    energy_cost = Column(Integer, default=2)  # 1-5
    expected_interval = Column(Integer, default=2)  # 期望多少天做一次
    importance = Column(Integer, default=3)  # 1-5
    category = Column(String(50))
    color = Column(String(7), default='#6366f1')  # 十六进制颜色
    icon = Column(String(50), default='star')
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 关系
    user = relationship("User", back_populates="tasks")
    completions = relationship("Completion", back_populates="task", cascade="all, delete-orphan")
    
    @property
    def last_done_date(self):
        if self.completions:
            return max(c.completed_at.date() for c in self.completions)
        return None
