from sqlalchemy import Column, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base

class Completion(Base):
    __tablename__ = 'completions'
    
    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey('tasks.id'), nullable=False, index=True)
    completed_at = Column(DateTime, default=datetime.utcnow, index=True)
    note = Column(Text)
    mood = Column(Integer)  # 完成时的心情 1-5
    
    # 关系
    task = relationship("Task", back_populates="completions")
