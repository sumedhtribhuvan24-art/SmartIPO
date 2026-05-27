import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from app.services.ai_generator import generate_analysis, _sanitize, _strip_banned
from app.services.pdf_extractor import chunk_text


# ─── Unit: Text chunking ─────────────────────────────────────────────────────

def test_chunk_text_short_returns_unchanged():
    text = "Hello world"
    assert chunk_text(text, max_chars=100) == text


def test_chunk_text_long_is_truncated():
    text = "a" * 20000
    result = chunk_text(text, max_chars=1000)
    assert len(result) <= 1100  # allows for separator
    assert "[...]" in result


def test_chunk_text_includes_front_and_back():
    front = "FRONT_MARKER " * 100
    back  = " BACK_MARKER"  * 100
    text  = front + ("middle " * 500) + back
    result = chunk_text(text, max_chars=500)
    assert "FRONT_MARKER" in result
    assert "BACK_MARKER" in result


# ─── Unit: Sanitizer ─────────────────────────────────────────────────────────

def test_sanitize_clamps_score_above_10():
    data = {"summary": "x", "risks": [], "financials": "y", "sentiment": "Positive", "score": 15}
    result = _sanitize(data, mode="mock")
    assert result["score"] == 10.0


def test_sanitize_clamps_score_below_0():
    data = {"summary": "x", "risks": [], "financials": "y", "sentiment": "Negative", "score": -3}
    result = _sanitize(data, mode="mock")
    assert result["score"] == 0.0


def test_sanitize_invalid_sentiment_defaults_to_neutral():
    data = {"summary": "x", "risks": [], "financials": "y", "sentiment": "STRONG_BUY", "score": 7}
    result = _sanitize(data, mode="mock")
    assert result["sentiment"] == "Neutral"


def test_sanitize_strips_buy_sell_language():
    data = {
        "summary": "You should buy this IPO now",
        "risks": [],
        "financials": "sell old holdings to invest",
        "sentiment": "Positive",
        "score": 7,
    }
    result = _sanitize(data, mode="mock")
    assert "buy" not in result["summary"]
    assert "sell" not in result["financials"]


def test_sanitize_limits_risks_to_8():
    data = {
        "summary": "x", "financials": "y", "sentiment": "Neutral", "score": 5,
        "risks": [f"risk {i}" for i in range(20)],
    }
    result = _sanitize(data, mode="mock")
    assert len(result["risks"]) <= 8


# ─── Unit: Mock analysis ─────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_mock_analysis_returns_all_fields():
    with patch("app.services.ai_generator.settings") as mock_settings:
        mock_settings.USE_MOCK = True
        result = await generate_analysis("sample company DRHP text with profit and growth")

    assert "summary" in result
    assert "risks" in result
    assert isinstance(result["risks"], list)
    assert len(result["risks"]) > 0
    assert "financials" in result
    assert result["sentiment"] in ("Positive", "Neutral", "Negative")
    assert 0 <= result["score"] <= 10
    assert result["mode"] == "mock"


@pytest.mark.asyncio
async def test_mock_positive_sentiment_for_profit_text():
    with patch("app.services.ai_generator.settings") as mock_settings:
        mock_settings.USE_MOCK = True
        result = await generate_analysis("strong profit growth revenue excellent performance " * 50)
    assert result["sentiment"] == "Positive"


@pytest.mark.asyncio
async def test_mock_negative_sentiment_for_loss_text():
    with patch("app.services.ai_generator.settings") as mock_settings:
        mock_settings.USE_MOCK = True
        result = await generate_analysis("loss debt risk litigation failure " * 50)
    assert result["sentiment"] == "Negative"


# ─── Integration: Full pipeline (mocked HTTP + PDF) ──────────────────────────

@pytest.mark.asyncio
async def test_full_analysis_pipeline():
    mock_pdf_content = b"%PDF-1.4 mock content"
    mock_text = "TechCorp Ltd is a profitable tech company with strong revenue growth and low debt."

    with patch("app.services.pdf_extractor.httpx.AsyncClient") as mock_client_cls, \
         patch("app.services.pdf_extractor.fitz.open") as mock_fitz:

        # Mock HTTP download
        mock_response = AsyncMock()
        mock_response.content = mock_pdf_content
        mock_response.headers = {"content-length": str(len(mock_pdf_content))}
        mock_response.raise_for_status = MagicMock()
        mock_client_cls.return_value.__aenter__.return_value.get = AsyncMock(
            return_value=mock_response
        )

        # Mock PDF parsing
        mock_page = MagicMock()
        mock_page.get_text.return_value = mock_text
        mock_doc = MagicMock()
        mock_doc.__iter__ = MagicMock(return_value=iter([mock_page, mock_page]))
        mock_doc.close = MagicMock()
        mock_fitz.return_value = mock_doc

        from app.services.analyzer import analyze_drhp
        with patch("app.services.ai_generator.settings") as mock_settings:
            mock_settings.USE_MOCK = True
            mock_settings.TEXT_CHUNK_SIZE = 12000
            result = await analyze_drhp("https://example.com/test.pdf")

    assert result["summary"]
    assert isinstance(result["risks"], list)
    assert result["sentiment"] in ("Positive", "Neutral", "Negative")
    assert result["page_count"] == 2
