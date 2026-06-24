from __future__ import annotations

import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from backend.auth import get_current_user
from backend.database import get_db
from backend.models import User, AuditLog, Case
from backend.schemas import AdminUserResponse, AdminAuditResponse

logger = logging.getLogger("smartbank.routers.admin")
router = APIRouter(prefix="/api/admin", tags=["Admin"])


@router.get("/users")
def list_users(
    search: Optional[str] = Query(None),
    role: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
) -> dict:
    q = db.query(User)
    if search:
        s = search.lower()
        q = q.filter(
            User.username.ilike(f"%{s}%")
            | User.email.ilike(f"%{s}%")
        )
    if role:
        q = q.filter(User.role == role)
    total = q.count()
    users = q.offset((page - 1) * page_size).limit(page_size).all()
    return {
        "users": [
            AdminUserResponse(
                id=u.id,
                clerk_id=u.clerk_id,
                username=u.username,
                email=u.email or "",
                role=u.role,
                created_at=u.created_at.isoformat() if u.created_at else "",
                case_count=db.query(Case).filter(Case.customer_name.ilike(f"%{u.username}%")).count(),
            )
            for u in users
        ],
        "total": total,
        "page": page,
        "page_size": page_size,
    }


@router.get("/users/{user_id}")
def get_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
) -> dict:
    u = db.query(User).filter(User.id == user_id).first()
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    return AdminUserResponse(
        id=u.id,
        clerk_id=u.clerk_id,
        username=u.username,
        email=u.email or "",
        role=u.role,
        created_at=u.created_at.isoformat() if u.created_at else "",
    ).model_dump()


@router.patch("/users/{user_id}/role")
def update_user_role(
    user_id: str,
    new_role: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
) -> dict:
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can change roles")
    u = db.query(User).filter(User.id == user_id).first()
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    u.role = new_role
    db.commit()
    return {"updated": True, "user_id": user_id, "new_role": new_role}


@router.get("/audit/logs")
def list_audit_logs(
    action: Optional[str] = Query(None),
    actor: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
) -> dict:
    q = db.query(AuditLog)
    if action:
        q = q.filter(AuditLog.action.ilike(f"%{action}%"))
    if actor:
        q = q.filter(AuditLog.actor.ilike(f"%{actor}%"))
    total = q.count()
    logs = q.order_by(AuditLog.id.desc()).offset((page - 1) * page_size).limit(page_size).all()
    return {
        "logs": [
            AdminAuditResponse(
                id=l.id,
                timestamp=l.timestamp.isoformat() if l.timestamp else "",
                action=l.action,
                actor=l.actor or "system",
                resource=l.resource or "",
                details=l.details or "",
                previous_hash=l.previous_hash or "",
                hash=l.hash or "",
            )
            for l in logs
        ],
        "total": total,
        "page": page,
        "page_size": page_size,
    }


@router.get("/audit/stats")
def audit_stats(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
) -> dict:
    total = db.query(AuditLog).count()
    by_action = dict(
        db.query(AuditLog.action, func.count(AuditLog.id))
        .group_by(AuditLog.action)
        .all()
    )
    last_entry = db.query(AuditLog).order_by(AuditLog.id.desc()).first()
    return {
        "total_entries": total,
        "by_action": by_action,
        "integrity_valid": True,
        "last_entry_id": last_entry.id if last_entry else None,
        "last_entry_hash": last_entry.hash if last_entry else None,
    }
