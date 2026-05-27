import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, AsyncMock
from app.main import app

client = TestClient(app)

MOCK_ANALYSIS = {
    "summary":    "Mock company with stable revenue.",
    "risks":      ["Risk A", "Risk B", "Risk C"],
    "financials": "Revenue ₹500Cr, EBITDA 18%",
    "sentiment":  "Neutral",
    "score":      6.5,
    "page_count": 120,
    "word_count": 45000,
    "mode":       "mock",
}


def test_health_endpoint():
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ok"
    assert "mode" in data


def test_root_endpoint():
    res = client.get("/")
    assert res.status_code == 200
    assert "service" in res.json()


def test_analyze_returns_200_on_valid_url():
    with patch("app.routes.analyze_drhp", new_callable=AsyncMock) as mock_analyze:
        mock_analyze.return_value = MOCK_ANALYSIS
        res = client.post("/analyze", json={"pdf_url": "https://example.com/test.pdf"})

    assert res.status_code == 200
    data = res.json()
    assert data["sentiment"] in ("Positive", "Neutral", "Negative")
    assert 0 <= data["score"] <= 10
    assert isinstance(data["risks"], list)


def test_analyze_rejects_invalid_url():
    res = client.post("/analyze", json={"pdf_url": "not-a-url"})
    assert res.status_code == 422


def test_analyze_rejects_non_pdf_url():
    res = client.post("/analyze", json={"pdf_url": "https://example.com/page.html"})
    assert res.status_code == 422


def test_analyze_handles_pdf_extraction_error():
    from app.services.pdf_extractor import PDFExtractionError
    with patch("app.routes.analyze_drhp", new_callable=AsyncMock) as mock_analyze:
        mock_analyze.side_effect = PDFExtractionError("Download failed")
        res = client.post("/analyze", json={"pdf_url": "https://example.com/test.pdf"})

    assert res.status_code == 422
    assert "PDF processing error" in res.json()["detail"]


def test_analyze_handles_generic_error():
    with patch("app.routes.analyze_drhp", new_callable=AsyncMock) as mock_analyze:
        mock_analyze.side_effect = Exception("Unexpected failure")
        res = client.post("/analyze", json={"pdf_url": "https://example.com/test.pdf"})

    assert res.status_code == 500


def test_analyze_response_has_no_buy_sell():
    """SEBI compliance: no buy/sell language in any response field."""
    with patch("app.routes.analyze_drhp", new_callable=AsyncMock) as mock_analyze:
        mock_analyze.return_value = MOCK_ANALYSIS
        res = client.post("/analyze", json={"pdf_url": "https://example.com/test.pdf"})

    body = res.text.lower()
    for term in ["buy this", "sell this", "invest now", "subscribe to"]:
        assert term not in body, f"SEBI violation: found '{term}' in response"
