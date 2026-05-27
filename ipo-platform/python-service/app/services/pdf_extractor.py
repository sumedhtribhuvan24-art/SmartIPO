"""
pdf_extractor.py
Downloads a DRHP PDF from SEBI/NSE and extracts structured sections.
"""
import re, fitz, httpx
from dataclasses import dataclass


@dataclass
class ExtractedDRHP:
    full_text:           str
    pages:               int
    char_count:          int
    risk_section:        str
    financials_section:  str
    objects_section:     str   # "Objects of the Issue" = use of funds
    management_section:  str
    business_section:    str


async def download_and_extract(pdf_url: str) -> ExtractedDRHP:
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120",
        "Accept":     "application/pdf,*/*",
        "Referer":    "https://www.sebi.gov.in/",
    }
    async with httpx.AsyncClient(timeout=60, follow_redirects=True) as client:
        resp = await client.get(pdf_url, headers=headers)
        resp.raise_for_status()
    return extract_from_bytes(resp.content)


def extract_from_bytes(pdf_bytes: bytes) -> ExtractedDRHP:
    doc      = fitz.open(stream=pdf_bytes, filetype="pdf")
    pages    = len(doc)
    all_text = [page.get_text("text") for page in doc if page.get_text("text").strip()]
    doc.close()

    full_text = "\n".join(all_text)

    return ExtractedDRHP(
        full_text          = full_text,
        pages              = pages,
        char_count         = len(full_text),
        risk_section       = _extract_section(full_text, ["RISK FACTORS", "RISK FACTOR", "SECTION III - RISK"], 8000),
        financials_section = _extract_section(full_text, ["FINANCIAL STATEMENTS", "RESTATED FINANCIAL", "SUMMARY FINANCIAL"], 6000),
        objects_section    = _extract_section(full_text, ["OBJECTS OF THE ISSUE", "OBJECTS OF THE OFFER", "USE OF PROCEEDS"], 4000),
        management_section = _extract_section(full_text, ["OUR MANAGEMENT", "BOARD OF DIRECTORS", "KEY MANAGERIAL"], 4000),
        business_section   = _extract_section(full_text, ["OUR BUSINESS", "BUSINESS OVERVIEW", "INDUSTRY OVERVIEW"], 6000),
    )


def _extract_section(text: str, headings: list, max_chars: int) -> str:
    upper = text.upper()
    for h in headings:
        idx = upper.find(h)
        if idx != -1:
            return _clean(text[idx: idx + max_chars])
    return ""


def _clean(text: str) -> str:
    text = re.sub(r'\s+', ' ', text)
    text = re.sub(r'[^\x20-\x7E\u0900-\u097F\n]', '', text)
    return text.strip()


def chunk_text(text: str, chunk_size: int = 4000, overlap: int = 200) -> list:
    chunks, start = [], 0
    while start < len(text):
        chunks.append(text[start: start + chunk_size])
        start += chunk_size - overlap
    return chunks
