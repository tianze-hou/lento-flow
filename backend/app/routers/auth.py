from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

from ..database import get_db
from ..models import User
from ..schemas import UserCreate, UserResponse, Token, UserSettings
from ..utils.auth import (
    verify_password, 
    get_password_hash, 
    create_access_token, 
    get_current_user
)
from ..config import settings

router = APIRouter(prefix="/api/auth", tags=["认证"])

# 用户注册
@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    # 检查用户名是否已存在
    existing_user = db.query(User).filter(
        (User.username == user_data.username) | (User.email == user_data.email)
    ).first()
    if existing_user:
        if existing_user.username == user_data.username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="用户名已存在"
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="邮箱已被注册"
            )
    
    # 创建新用户
    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        username=user_data.username,
        email=user_data.email,
        password_hash=hashed_password
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user

# 用户登录
@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    # 查找用户
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # 创建访问令牌
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

# 获取当前用户信息
@router.get("/me", response_model=UserResponse)
def get_me(
    current_user: User = Depends(get_current_user)
):
    return current_user

# 更新用户设置
@router.put("/settings", response_model=UserResponse)
def update_settings(
    settings_data: UserSettings,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 更新用户设置
    if settings_data.daily_energy_budget is not None:
        current_user.daily_energy_budget = settings_data.daily_energy_budget
    if settings_data.max_daily_tasks is not None:
        current_user.max_daily_tasks = settings_data.max_daily_tasks
    if settings_data.settings is not None:
        current_user.settings.update(settings_data.settings)
    
    db.commit()
    db.refresh(current_user)
    
    return current_user
