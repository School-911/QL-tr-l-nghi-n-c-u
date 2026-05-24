import os
import zipfile
import xml.etree.ElementTree as ET

import fitz
import requests
from bs4 import BeautifulSoup

def extract_pdf_text(file_path: str):

    doc = fitz.open(file_path)

    try:

        pages = []

        total_pages = len(doc)

        for i in range(total_pages):

            try:

                text = doc[i].get_text()

                pages.append(
                    f"\n--- Trang {i + 1} ---\n{text}"
                )

            except Exception as e:

                print(f"[WARN] Page {i+1}: {e}")

        return "\n".join(pages), total_pages

    finally:

        doc.close()


def extract_docx_text(file_path: str):

    with zipfile.ZipFile(file_path) as docx:
        xml_content = docx.read("word/document.xml")

    root = ET.fromstring(xml_content)

    namespace = {
        "w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
    }

    paragraphs = []

    for paragraph in root.findall(".//w:p", namespace):
        text_parts = [
            node.text
            for node in paragraph.findall(".//w:t", namespace)
            if node.text
        ]

        if text_parts:
            paragraphs.append("".join(text_parts))

    return "\n".join(paragraphs), len(paragraphs)


def extract_text_file(file_path: str):

    encodings = ["utf-8", "utf-8-sig", "cp1258", "latin-1"]

    for encoding in encodings:
        try:
            with open(file_path, "r", encoding=encoding) as file:
                content = file.read()

            return content, max(1, len(content.splitlines()))

        except UnicodeDecodeError:
            continue

    with open(file_path, "rb") as file:
        content = file.read().decode("utf-8", errors="ignore")

    return content, max(1, len(content.splitlines()))


def extract_file_text(file_path: str):

    extension = os.path.splitext(file_path)[1].lower()

    if extension == ".pdf":
        return extract_pdf_text(file_path)

    if extension == ".docx":
        return extract_docx_text(file_path)

    if extension in [".txt", ".md", ".csv"]:
        return extract_text_file(file_path)

    raise HTTPException(
        status_code=400,
        detail=f"Định dạng tệp {extension or 'không rõ'} chưa được hỗ trợ. Hãy dùng PDF, DOCX hoặc TXT."
    )

# =========================================================
# WEB EXTRACTION
# =========================================================

def extract_web_text(url: str):

    response = requests.get(
        url,
        timeout=20,
        headers={
            "User-Agent": "Mozilla/5.0"
        }
    )

    soup = BeautifulSoup(
        response.text,
        "html.parser"
    )

    for tag in soup([
        "script",
        "style",
        "noscript"
    ]):
        tag.decompose()

    text = soup.get_text(separator=" ")

    cleaned = " ".join(text.split())

    return cleaned[:120000]
