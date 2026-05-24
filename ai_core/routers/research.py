import asyncio
import os
import time
from datetime import datetime
from typing import Optional

from bson import ObjectId
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from core.database import MONGO_COLLECTION, mongo_db, require_mongo, save_history
from core.settings import GEMINI_API_KEY, LLAMA_API_KEY, LLAMA_BASE_URL, OLLAMA_BASE_URL, OLLAMA_MODEL, OPENAI_API_KEY
from schemas import ProcessRequest
from services.ai_providers import generate_fallback_report, generate_with_gemini, generate_with_llama_api, generate_with_ollama, generate_with_openai
from services.extractors import extract_file_text, extract_web_text
from services.workspaces import ensure_workspace, ensure_workspace_member

router = APIRouter()

@router.get("/research/history")
async def get_research_history(
    limit: int = 200,
    workspace_id: Optional[str] = None,
    user_id: Optional[str] = None,
    include_legacy: bool = False
):

    db = require_mongo()

    safe_limit = max(1, min(limit, 500))

    query_filter = {}

    if workspace_id:
        if include_legacy:
            query_filter["$or"] = [
                {"workspace_id": workspace_id},
                {"workspace_id": {"$exists": False}},
                {"workspace_id": None}
            ]
        else:
            query_filter["workspace_id"] = workspace_id
    elif user_id:
        query_filter["user_id"] = user_id

    records = list(
        db[MONGO_COLLECTION]
        .find(query_filter)
        .sort("created_at", -1)
        .limit(safe_limit)
    )

    items = []

    for record in records:
        created_at = record.get("created_at") or record.get("createdAt")
        query = record.get("query") or record.get("user_query") or ""
        source_type = record.get("source_type") or record.get("sourceType") or "unknown"
        status = record.get("status") or "unknown"
        source_file_path = record.get("source_file_path")
        original_file_name = record.get("original_file_name")
        is_legacy = not record.get("workspace_id")

        items.append({
            "id": str(record.get("_id")),
            "_id": str(record.get("_id")),
            "title": query[:80] or "Phiên nghiên cứu",
            "query": query,
            "source": original_file_name or record.get("target_url") or source_type.upper(),
            "sourceType": source_type,
            "status": status,
            "createdAt": created_at.isoformat() if isinstance(created_at, datetime) else created_at,
            "preview": record.get("response_preview") or record.get("error") or f"Nguồn: {source_type}",
            "aiProvider": record.get("ai_provider"),
            "executionTime": record.get("execution_time"),
            "responseLength": record.get("response_length"),
            "hasSourceFile": bool(source_file_path and os.path.exists(source_file_path)),
            "originalFileName": original_file_name,
            "isLegacy": is_legacy,
            "files": record.get("files", [])
        })

    return {
        "status": "success",
        "items": items
    }


@router.get("/research/history/{history_id}")
async def get_research_history_detail(
    history_id: str,
    workspace_id: Optional[str] = None,
    user_id: Optional[str] = None,
    include_legacy: bool = False
):

    db = require_mongo()

    try:
        object_id = ObjectId(history_id)
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="ID lịch sử không hợp lệ."
        )

    query_filter = {
        "_id": object_id
    }

    if workspace_id:
        if include_legacy:
            query_filter["$or"] = [
                {"workspace_id": workspace_id},
                {"workspace_id": {"$exists": False}},
                {"workspace_id": None}
            ]
        else:
            query_filter["workspace_id"] = workspace_id
    elif user_id:
        query_filter["user_id"] = user_id

    record = db[MONGO_COLLECTION].find_one(query_filter)

    if not record:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy lịch sử nghiên cứu."
        )

    created_at = record.get("created_at") or record.get("createdAt")
    query = record.get("query") or record.get("user_query") or ""
    source_type = record.get("source_type") or record.get("sourceType") or "unknown"
    source_file_path = record.get("source_file_path")
    original_file_name = record.get("original_file_name")

    return {
        "status": "success",
        "item": {
            "id": str(record.get("_id")),
            "_id": str(record.get("_id")),
            "title": query[:80] or "Phiên nghiên cứu",
            "query": query,
            "source": original_file_name or record.get("target_url") or source_type.upper(),
            "sourceType": source_type,
            "status": record.get("status") or "unknown",
            "createdAt": created_at.isoformat() if isinstance(created_at, datetime) else created_at,
            "content": record.get("response_content") or record.get("response_preview") or record.get("error") or "",
            "aiProvider": record.get("ai_provider"),
            "executionTime": record.get("execution_time"),
            "responseLength": record.get("response_length"),
            "hasSourceFile": bool(source_file_path and os.path.exists(source_file_path)),
            "originalFileName": original_file_name
        }
    }


@router.get("/research/history/{history_id}/source-file")
async def download_research_source_file(history_id: str, workspace_id: Optional[str] = None, user_id: Optional[str] = None):

    db = require_mongo()

    try:
        object_id = ObjectId(history_id)
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="ID lịch sử không hợp lệ."
        )

    query_filter = {
        "_id": object_id
    }

    if workspace_id:
        query_filter["workspace_id"] = workspace_id
    elif user_id:
        query_filter["user_id"] = user_id

    record = db[MONGO_COLLECTION].find_one(query_filter)

    if not record:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy lịch sử nghiên cứu."
        )

    file_path = record.get("source_file_path")

    if not file_path or not os.path.exists(file_path):
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy file gốc."
        )

    return FileResponse(
        path=file_path,
        filename=record.get("original_file_name") or os.path.basename(file_path)
    )

# =========================================================
# PROCESS
# =========================================================

@router.post("/process")
async def process_document(request: ProcessRequest):

    start_time = time.time()

    try:

        query = request.query.strip()

        if not query:

            raise HTTPException(
                status_code=400,
                detail="Thiếu query"
            )

        extracted_text = ""

        source_type = ""

        total_pages = 0

        # =====================================================
        # PDF
        # =====================================================

        if request.file_path:

            file_path = request.file_path.strip()

            if not os.path.exists(file_path):

                raise HTTPException(
                    status_code=404,
                    detail="Không tìm thấy file"
                )

            extracted_text, total_pages = await asyncio.to_thread(
                extract_file_text,
                file_path
            )

            source_type = os.path.splitext(file_path)[1].lower().replace(".", "") or "file"

        # =====================================================
        # URL
        # =====================================================

        elif request.web_url:

            extracted_text = (
                await asyncio.to_thread(
                    extract_web_text,
                    request.web_url
                )
            )

            source_type = "url"

        else:

            raise HTTPException(
                status_code=400,
                detail="Thiếu file_path hoặc web_url"
            )

        # =====================================================
        # PROMPT
        # =====================================================

        prompt = f"""
Bạn là một Senior AI Researcher.

Hãy tạo báo cáo nghiên cứu chuyên sâu.

Mục tiêu nghiên cứu:
{query}

Nguồn dữ liệu:
{source_type}

Số trang:
{total_pages}

Nội dung:
{extracted_text[:120000]}

Yêu cầu:

1. Tổng quan
2. Các luận điểm chính
3. Phân tích kỹ thuật chuyên sâu
4. Kết luận
5. Khuyến nghị

Ngôn ngữ:
Tiếng Việt học thuật.
"""

        # =====================================================
        # AI PROVIDER FALLBACK CHAIN
        # =====================================================

        result = None

        ai_provider = "fallback"

        provider_errors = []

        provider_chain = []

        if LLAMA_API_KEY and LLAMA_BASE_URL:
            provider_chain.append(("llama", generate_with_llama_api))

        if OLLAMA_BASE_URL and OLLAMA_MODEL:
            provider_chain.append(("ollama", generate_with_ollama))

        if GEMINI_API_KEY:
            provider_chain.append(("gemini", generate_with_gemini))

        if OPENAI_API_KEY:
            provider_chain.append(("openai", generate_with_openai))

        for provider_name, provider_function in provider_chain:

            try:

                result = await asyncio.to_thread(
                    provider_function,
                    prompt
                )

                if result:
                    ai_provider = provider_name
                    break

                raise Exception("Model trả về nội dung rỗng")

            except Exception as provider_error:

                print(f"[WARN] {provider_name} failed")

                print(provider_error)

                provider_errors.append(
                    f"{provider_name}: {provider_error}"
                )

        ai_error = ". ".join(provider_errors)

        if not result:

            result = generate_fallback_report(
                query=query,
                source_type=source_type,
                extracted_text=extracted_text,
                ai_error=ai_error or "Không có model AI nào được cấu hình thành công."
            )

        elapsed = round(
            time.time() - start_time,
            2
        )

        workspace_id = request.workspace_id or (
            f"user-{request.user_id}" if request.user_id else "default-workspace"
        )

        if mongo_db is not None:
            ensure_workspace(workspace_id)
            ensure_workspace_member(
                workspace_id=workspace_id,
                user_id=request.user_id,
                email=request.user_email,
                name=request.user_name
            )

        # =====================================================
        # SAVE HISTORY
        # =====================================================

        save_history({
            "workspace_id": workspace_id,
            "user_id": request.user_id,
            "user_email": request.user_email,
            "user_name": request.user_name,
            "status": "success",
            "query": query,
            "source_type": source_type,
            "target_url": request.web_url or request.file_path,
            "source_file_path": request.file_path,
            "original_file_name": request.original_file_name,
            "ai_provider": ai_provider,
            "execution_time": elapsed,
            "response_length": len(result),
            "response_preview": result[:300],
            "response_content": result,
            "ai_error": ai_error or None,
            "created_at": datetime.utcnow()
        })

        # =====================================================
        # RESPONSE
        # =====================================================

        return {
            "status": "success",
            "ai_provider": ai_provider,
            "processing_time": elapsed,
            "source_type": source_type,
            "markdownReport": result
        }

    except HTTPException as e:

        raise e

    except Exception as e:

        print(e)

        workspace_id = request.workspace_id or (
            f"user-{request.user_id}" if request.user_id else "default-workspace"
        )

        save_history({
            "workspace_id": workspace_id,
            "user_id": request.user_id,
            "user_email": request.user_email,
            "user_name": request.user_name,
            "status": "failed",
            "query": request.query,
            "source_file_path": request.file_path,
            "original_file_name": request.original_file_name,
            "error": str(e),
            "created_at": datetime.utcnow()
        })

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
