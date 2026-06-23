from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.auth import (
    create_access_token,
    create_refresh_token,
    get_current_user,
    hash_password,
    verify_password,
    verify_refresh_token,
)
from backend.database import get_db
from backend.models import User
from backend.schemas import TokenRequest, TokenResponse, UserCreate, UserResponse

logger = logging.getLogger("smartbank.routers.auth")
router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/login", response_model=TokenResponse)
def login(req: TokenRequest, db: Session = Depends(get_db)) -> TokenResponse:
    user = db.query(User).filter(User.username == req.username).first()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    access_token = create_access_token(
        {"sub": user.username, "role": user.role}
    )
    refresh_token = create_refresh_token(
        {"sub": user.username, "role": user.role}
    )
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=15,
    )


@router.post("/register", response_model=UserResponse)
def register(req: UserCreate, db: Session = Depends(get_db)) -> UserResponse:
    if db.query(User).filter(User.username == req.username).first():
        raise HTTPException(status_code=400, detail="Username exists")
    user = User(
        username=req.username,
        hashed_password=hash_password(req.password),
        role=req.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return UserResponse(id=user.id, username=user.username, role=user.role)


@router.get("/me", response_model=UserResponse)
def auth_me(current_user=Depends(get_current_user)) -> UserResponse:
    return UserResponse(
        id=current_user.id,
        username=current_user.username,
        role=current_user.role,
    )


@router.post("/refresh", response_model=TokenResponse)
def refresh(token: str, current_user=Depends(get_current_user)) -> TokenResponse:
    payload = verify_refresh_token(token)
    if payload is None:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    access_token = create_access_token(
        {"sub": current_user.username, "role": current_user.role}
    )
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=15,
    )
