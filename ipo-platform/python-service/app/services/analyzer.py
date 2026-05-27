"""
analyzer.py

Orchestrates the full DRHP analysis pipeline:

  PDF Download  →  Text Extraction  →  FinBERT  →  LR Red Flags
  →  XGBoost Score  →  Text Section Generation  →  Structured JSON

The JSON shape exactly matches what ipoService.js stores in drhp_analyses
and what the React DRHPAnalysisTab component expects.
"""

from app.services.pdf_extractor  import download_and_extract, chunk_text
from app.services.ml_pipeline    import (
    run_finbert, run_lr_redflag, run_xgb_score, extract_text_features,
)
from app.services.text_generators import (
    generate_summary, generate_financials, generate_risks,
    generate_outlook, generate_use_of_funds, generate_management_summary,
)


class DRHPAnalyzer:

    async def analyze(
        self,
        pdf_url:      str,
        company_name: str = "",
        sector:       str = "",
    ) -> dict:

        # ── 1. Download PDF and extract structured text ───────────────────────
        extracted = await download_and_extract(pdf_url)

        # ── 2. Pick relevant text per section ────────────────────────────────
        fin_text  = extracted.financials_section or extracted.full_text[:8000]
        risk_text = extracted.risk_section       or extracted.full_text[8000:16000]
        biz_text  = extracted.business_section   or extracted.full_text[:4000]

        # ── 3. FinBERT: financial sentiment ───────────────────────────────────
        finbert_chunks = chunk_text(fin_text, chunk_size=512, overlap=50)
        finbert        = run_finbert(finbert_chunks)

        # ── 4. Logistic Regression: red flag detection ────────────────────────
        red_flags = run_lr_redflag(risk_text)

        # ── 5. XGBoost: composite score 0–10 ─────────────────────────────────
        features            = extract_text_features(extracted)
        score, risk_level   = run_xgb_score(finbert, red_flags, features)

        # ── 6. Overall sentiment label ────────────────────────────────────────
        dominant  = max(finbert, key=finbert.get)
        sentiment = {"positive": "Positive", "negative": "Negative", "neutral": "Neutral"}[dominant]

        # ── 7. Generate six structured text sections ──────────────────────────
        ctx = dict(
            company_name = company_name,
            sector       = sector,
            full_text    = extracted.full_text[:20000],
            biz_text     = biz_text,
            risk_text    = risk_text,
            fin_text     = fin_text,
            obj_text     = extracted.objects_section,
            mgmt_text    = extracted.management_section,
            finbert      = finbert,
            red_flags    = red_flags,
            score        = score,
        )

        return {
            "status":             "done",
            "summary":            generate_summary(ctx),
            "financials":         generate_financials(ctx),
            "risks":              generate_risks(ctx),
            "red_flags":          red_flags,
            "outlook":            generate_outlook(ctx),
            "use_of_funds":       generate_use_of_funds(ctx),
            "management_summary": generate_management_summary(ctx),
            "sentiment":          sentiment,
            "score":              score,
            "risk_level":         risk_level,
            "finbert":            finbert,
            "feature_vector":     features,
            "meta": {
                "modelVersion": "finbert-v1+lr+xgb",
                "pdfPages":     extracted.pages,
                "pdfCharCount": extracted.char_count,
            },
        }
