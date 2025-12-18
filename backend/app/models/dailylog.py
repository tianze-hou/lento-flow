from sqlalchemy import Column, Integer, Date, Float, ForeignKey, Text
from sqlalchemy.orm import relationship
from ..database import Base

class DailyLog(Base):
    __tablename__ = 'daily_logs'
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False, index=True)
    log_date = Column(Date, nullable=False, index=True)
    energy_spent = Column(Integer, default=0)
    tasks_completed = Column(Integer, default=0)
    daily_score = Column(Float)
    overall_health = Column(Float)
    note = Column(Text)
    
    # 关系
    user = relationship("User", back_populates="daily_logs")
