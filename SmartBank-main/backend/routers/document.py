from __future__ import annotations

import io
import logging
from pathlib import Path

from fastapi import APIRouter, HTTPException, UploadFile
from PIL import Image

from backend.cache import cache
from backend.database import SessionLocal
from backend.models import DocumentVerification
from backend.schemas import DocumentVerifyResponse
from document_ai.pipeline import DocumentAIPipeline

logger = logging.getLogger("smartbank.routers.document")
router = APIRouter(prefix="/api", tags=["Document AI"])

doc_pipeline = DocumentAIPipeline()


@router.post("/document/verify", response_model=DocumentVerifyResponse)
async def verify_document(file: UploadFile) -> DocumentVerifyResponse:
    if not file.filename:
        raise HTTPException(status_code=400, detail="Filename required")

    contents = await file.read()
    size = len(contents)

    try:
        img = Image.open(io.BytesIO(contents))
        result = doc_pipeline.process_document(img, "demo-customer")

        db = SessionLocal()
        try:
            doc = DocumentVerification(
                filename=file.filename,
                document_type=result.document_type.value
                if hasattr(result.document_type, "value")
                else str(result.document_type),
                risk_score=result.risk_score,
                risk_level=result.risk_level.value
                if hasattr(result.risk_level, "value")
                else str(result.risk_level),
                decision=result.decision.value
                if hasattr(result.decision, "value")
                else str(result.decision),
                fraud_indicators=list(result.fraud_indicators)
                if hasattr(result, "fraud_indicators")
                else [],
                extracted_fields=result.extracted_fields
                if hasattr(result, "extracted_fields")
                else {},
            )
            db.add(doc)
            db.commit()

            await cache.invalidate_pattern("documents:*")

            return DocumentVerifyResponse(
                filename=file.filename,
                size=size,
                document_type=doc.document_type,
                risk_score=doc.risk_score,
                risk_level=doc.risk_level,
                decision=doc.decision,
                extracted_fields=doc.extracted_fields,
                fraud_indicators=doc.fraud_indicators,
                processing_id=doc.id,
            )
        finally:
            db.close()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Document processing failed: {e}")
