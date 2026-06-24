from __future__ import annotations

import logging
from typing import Optional

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from agents.customer_assistant.assistant import SmartBankAssistant
from backend.auth import get_current_user
from backend.database import get_db
from backend.models import ChatMessage
from backend.schemas import ChatRequest, ChatResponse, ChatSaveRequest

logger = logging.getLogger("smartbank.routers.chat")
router = APIRouter(prefix="/api", tags=["Chat"])

assistant = SmartBankAssistant()


@router.post("/chat", response_model=ChatResponse)
async def chat(
    body: ChatRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
) -> ChatResponse:
    if not body.message:
        raise HTTPException(status_code=400, detail="message is required")
    try:
        result = assistant.process_message(body.message, body.language or "en")
        resp = ChatResponse(
            text=result.text,
            language=result.language.value if result.language else "en",
            module=result.module,
            escalation=result.escalation,
            escalation_reason=result.escalation_reason,
        )
        return resp
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/chat/save")
def save_message(
    body: ChatSaveRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
) -> dict:
    msg = ChatMessage(
        session_id=body.session_id,
        role=body.role,
        text=body.text,
        language=body.language,
        module=body.module,
        user_id=current_user.id,
    )
    db.add(msg)
    db.commit()
    return {"saved": True, "message_id": msg.id}


@router.get("/assistant/info")
def assistant_info() -> dict:
    return {
        "name": "Zara",
        "modules": [
            "Product Education",
            "Process Guidance",
            "SME Literacy",
            "Digital Onboarding",
            "Safety & Fraud",
        ],
    }
