from __future__ import annotations

import logging
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from backend.auth import get_current_user
from backend.database import get_db
from backend.models import ChatMessage
from backend.schemas import ChatHistoryResponse, ChatHistoryItem

logger = logging.getLogger("smartbank.routers.chat_history")
router = APIRouter(prefix="/api/chat", tags=["Chat History"])


@router.get("/history")
def list_sessions(
    user_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
) -> dict:
    q = db.query(ChatMessage.session_id).distinct()
    if user_id:
        q = q.filter(ChatMessage.user_id == user_id)
    sessions = [row[0] for row in q.all()]
    return {"sessions": sessions}


@router.get("/history/{session_id}", response_model=ChatHistoryResponse)
def get_session(
    session_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
) -> ChatHistoryResponse:
    msgs = (
        db.query(ChatMessage)
        .filter(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.id.asc())
        .all()
    )
    return ChatHistoryResponse(
        session_id=session_id,
        messages=[
            ChatHistoryItem(
                id=m.id,
                role=m.role,
                text=m.text,
                language=m.language,
                module=m.module,
                created_at=m.created_at.isoformat() if m.created_at else "",
            )
            for m in msgs
        ],
    )


@router.delete("/history/{session_id}")
def delete_session(
    session_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
) -> dict:
    db.query(ChatMessage).filter(ChatMessage.session_id == session_id).delete()
    db.commit()
    return {"deleted": True, "session_id": session_id}
