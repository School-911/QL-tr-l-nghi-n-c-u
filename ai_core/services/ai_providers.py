import requests

import google.generativeai as genai
from openai import OpenAI

from core.settings import (
    GEMINI_API_KEY,
    LLAMA_API_KEY,
    LLAMA_BASE_URL,
    LLAMA_MODEL,
    OLLAMA_BASE_URL,
    OLLAMA_MODEL,
    OPENAI_API_KEY,
)

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    print("[OK] Gemini configured")
else:
    print("[WARN] GEMINI_API_KEY missing")

openai_client = None

if OPENAI_API_KEY:
    openai_client = OpenAI(api_key=OPENAI_API_KEY)
    print("[OK] OpenAI configured")
else:
    print("[WARN] OPENAI_API_KEY missing")

def generate_with_gemini(prompt: str):

    model = genai.GenerativeModel(
        "gemini-2.0-flash"
    )

    response = model.generate_content(prompt)

    return response.text

def generate_with_openai(prompt: str):

    if openai_client is None:
        raise Exception("OPENAI_API_KEY missing")

    response = openai_client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[
            {
                "role": "system",
                "content": "Bạn là một Senior AI Researcher."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.4
    )

    return response.choices[0].message.content


def generate_with_llama_api(prompt: str):

    if not LLAMA_API_KEY or not LLAMA_BASE_URL:
        raise Exception("LLAMA_API_KEY hoặc LLAMA_BASE_URL chưa được cấu hình")

    response = requests.post(
        f"{LLAMA_BASE_URL.rstrip('/')}/chat/completions",
        headers={
            "Authorization": f"Bearer {LLAMA_API_KEY}",
            "Content-Type": "application/json"
        },
        json={
            "model": LLAMA_MODEL,
            "messages": [
                {
                    "role": "system",
                    "content": "Bạn là một Senior AI Researcher."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "temperature": 0.4
        },
        timeout=(10, 1000 * 60 * 10)
    )

    response.raise_for_status()

    data = response.json()

    return data["choices"][0]["message"]["content"]


def generate_with_ollama(prompt: str):

    if not OLLAMA_BASE_URL or not OLLAMA_MODEL:
        raise Exception("OLLAMA_BASE_URL hoặc OLLAMA_MODEL chưa được cấu hình")

    response = requests.post(
        f"{OLLAMA_BASE_URL.rstrip('/')}/api/generate",
        json={
            "model": OLLAMA_MODEL,
            "prompt": prompt,
            "stream": False
        },
        timeout=(5, 1000 * 60 * 10)
    )

    response.raise_for_status()

    data = response.json()

    return data.get("response", "")


def generate_fallback_report(query: str, source_type: str, extracted_text: str, ai_error: str):

    words = extracted_text.split()
    excerpt = " ".join(words[:900])

    if not excerpt:
        excerpt = "Không trích xuất được nội dung văn bản từ nguồn dữ liệu."

    return f"""
# Báo cáo nghiên cứu tạm thời

## Trạng thái hệ thống

Hệ thống đã trích xuất được dữ liệu nguồn nhưng dịch vụ AI đang không khả dụng hoặc vượt hạn mức.

Chi tiết kỹ thuật:
{ai_error}

## Mục tiêu nghiên cứu

{query}

## Nguồn dữ liệu

{source_type}

## Nội dung trích xuất ban đầu

{excerpt}

## Gợi ý xử lý tiếp

1. Kiểm tra hạn mức hoặc API key của Gemini/OpenAI.
2. Thử lại sau vài phút nếu dịch vụ AI đang quá tải.
3. Nếu dùng tài liệu lớn, hãy thử rút gọn tài liệu hoặc chia thành nhiều lần phân tích.
""".strip()

# =========================================================
