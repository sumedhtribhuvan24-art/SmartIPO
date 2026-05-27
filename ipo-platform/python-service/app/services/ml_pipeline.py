"""
ml_pipeline.py

Three-stage ML pipeline:
  Stage 1 — FinBERT      : financial sentiment (Positive/Neutral/Negative)
  Stage 2 — Logistic Reg : red flag detection from risk section text
  Stage 3 — XGBoost      : composite score 0–10 + risk level

Model files expected in MODEL_DIR:
  finbert/                   ← HuggingFace model folder  (or falls back to ProsusAI/finbert)
  lr_redflag_model.pkl       ← sklearn MultiOutputClassifier
  tfidf_vectorizer.pkl       ← sklearn TfidfVectorizer
  xgb_score_model.pkl        ← xgboost Booster

Set USE_MOCK_ML=true in .env to bypass all models (heuristic fallback).
"""

import os, pickle, numpy as np
from pathlib import Path

MODEL_DIR = Path(os.getenv("MODEL_DIR", "/home/models"))
USE_MOCK  = os.getenv("USE_MOCK_ML", "true").lower() == "true"

# ── Lazy singletons ───────────────────────────────────────────────────────────
_finbert_tok   = None
_finbert_model = None
_lr_model      = None
_lr_vec        = None
_xgb_model     = None


def _load_finbert():
    global _finbert_tok, _finbert_model
    if _finbert_tok is not None:
        return _finbert_tok, _finbert_model
    try:
        from transformers import AutoTokenizer, AutoModelForSequenceClassification
        import torch
        src = str(MODEL_DIR / "finbert") if (MODEL_DIR / "finbert").exists() else "ProsusAI/finbert"
        _finbert_tok   = AutoTokenizer.from_pretrained(src)
        _finbert_model = AutoModelForSequenceClassification.from_pretrained(src)
        _finbert_model.eval()
        print(f"✅  FinBERT loaded from: {src}")
    except Exception as e:
        print(f"⚠️   FinBERT unavailable ({e})")
        _finbert_tok = _finbert_model = None
    return _finbert_tok, _finbert_model


def _load_lr():
    global _lr_model, _lr_vec
    if _lr_model is not None:
        return _lr_model, _lr_vec
    lp = MODEL_DIR / "lr_redflag_model.pkl"
    vp = MODEL_DIR / "tfidf_vectorizer.pkl"
    if lp.exists() and vp.exists():
        with open(lp, "rb") as f: _lr_model = pickle.load(f)
        with open(vp, "rb") as f: _lr_vec   = pickle.load(f)
        print("✅  LR red-flag model loaded")
    else:
        print("⚠️   LR model files not found — using keyword fallback")
    return _lr_model, _lr_vec


def _load_xgb():
    global _xgb_model
    if _xgb_model is not None:
        return _xgb_model
    xp = MODEL_DIR / "xgb_score_model.pkl"
    if xp.exists():
        with open(xp, "rb") as f: _xgb_model = pickle.load(f)
        print("✅  XGBoost score model loaded")
    else:
        print("⚠️   XGBoost model not found — using formula fallback")
    return _xgb_model


# ─────────────────────────────────────────────────────────────────────────────
#  Stage 1 — FinBERT Sentiment
# ─────────────────────────────────────────────────────────────────────────────
def run_finbert(chunks: list) -> dict:
    """Average FinBERT probabilities over text chunks."""
    if USE_MOCK or not chunks:
        return _mock_finbert(chunks)

    tok, model = _load_finbert()
    if tok is None:
        return _mock_finbert(chunks)

    import torch, torch.nn.functional as F

    all_probs = []
    for chunk in chunks[:8]:           # cap at 8 chunks for speed
        try:
            inputs = tok(
                chunk[:512], return_tensors="pt",
                truncation=True, max_length=512, padding=True,
            )
            with torch.no_grad():
                logits = model(**inputs).logits
            probs = F.softmax(logits, dim=-1).squeeze().tolist()
            all_probs.append(probs)    # [positive, negative, neutral]
        except Exception:
            continue

    if not all_probs:
        return _mock_finbert(chunks)

    avg = np.mean(all_probs, axis=0)
    return {
        "positive": round(float(avg[0]), 4),
        "negative": round(float(avg[1]), 4),
        "neutral":  round(float(avg[2]), 4),
    }


def _mock_finbert(chunks: list) -> dict:
    """Heuristic fallback when model is unavailable."""
    text = " ".join(chunks).lower()
    pos_kw = ["growth", "profit", "expansion", "strong", "leader", "innovative", "revenue", "cagr"]
    neg_kw = ["risk", "loss", "litigation", "debt", "decline", "competition", "uncertain", "penalty"]
    p = sum(text.count(w) for w in pos_kw)
    n = sum(text.count(w) for w in neg_kw)
    t = p + n + 1
    pos = round(p / t, 4)
    neg = round(n / t, 4)
    return {"positive": max(0.0, pos), "negative": max(0.0, neg), "neutral": round(max(0.0, 1 - pos - neg), 4)}


# ─────────────────────────────────────────────────────────────────────────────
#  Stage 2 — Logistic Regression Red-Flag Detector
# ─────────────────────────────────────────────────────────────────────────────
RED_FLAG_PATTERNS = [
    ("High promoter OFS",              ["offer for sale", "ofs", "promoter selling"]),
    ("Related party transactions",     ["related party", "promoter loans", "inter-company"]),
    ("Negative operating cash flow",   ["negative cash", "cash outflow", "operating loss"]),
    ("Significant litigation",         ["litigation", "legal proceedings", "court case", "arbitration"]),
    ("High debt / leverage",           ["high debt", "borrowings", "leverage", "debt repayment"]),
    ("Customer concentration risk",    ["major customer", "top 10 customers", "customer concentration"]),
    ("Regulatory / compliance risk",   ["regulatory", "sebi action", "rbi", "compliance failure"]),
    ("Promoter shares pledged",        ["pledged", "encumbered", "promoter pledge"]),
]


def run_lr_redflag(risk_text: str) -> list:
    """Detect red flags using trained LR or keyword heuristic."""
    lr, vec = _load_lr()
    if lr is not None and vec is not None and not USE_MOCK:
        try:
            X = vec.transform([risk_text])
            pred = lr.predict(X)[0]
            return [RED_FLAG_PATTERNS[i][0] for i, f in enumerate(pred) if f == 1]
        except Exception:
            pass

    # Keyword fallback
    lower = risk_text.lower()
    return [label for label, kws in RED_FLAG_PATTERNS if any(k in lower for k in kws)]


# ─────────────────────────────────────────────────────────────────────────────
#  Stage 3 — XGBoost Composite Score
# ─────────────────────────────────────────────────────────────────────────────
def run_xgb_score(finbert: dict, red_flags: list, features: dict) -> tuple:
    """Returns (score: float 0–10, risk_level: str)."""
    xgb = _load_xgb()

    feat_vec = np.array([[
        finbert["positive"],
        finbert["negative"],
        finbert["neutral"],
        len(red_flags),
        features.get("has_financials",          0),
        features.get("revenue_cagr_mentioned",  0),
        features.get("profit_mentioned",        0),
        features.get("page_count_norm",         0.5),
    ]])

    if xgb is not None and not USE_MOCK:
        try:
            score = float(xgb.predict(feat_vec)[0])
            score = max(0.0, min(10.0, score))
        except Exception:
            score = _formula_score(finbert, red_flags)
    else:
        score = _formula_score(finbert, red_flags)

    risk_level = "Low" if score >= 7 else "Medium" if score >= 4 else "High"
    return round(score, 1), risk_level


def _formula_score(finbert: dict, red_flags: list) -> float:
    base    = finbert["positive"] * 10.0
    penalty = len(red_flags) * 0.6
    bonus   = finbert["neutral"] * 1.5
    return max(1.0, min(10.0, base - penalty + bonus))


# ─────────────────────────────────────────────────────────────────────────────
#  Text Feature Extractor (feeds XGBoost)
# ─────────────────────────────────────────────────────────────────────────────
def extract_text_features(extracted) -> dict:
    text = extracted.full_text.lower()
    return {
        "has_financials":         1 if extracted.financials_section else 0,
        "revenue_cagr_mentioned": 1 if "cagr" in text else 0,
        "profit_mentioned":       1 if ("ebitda" in text or "net profit" in text) else 0,
        "page_count_norm":        min(1.0, extracted.pages / 500),
        "risk_section_length":    len(extracted.risk_section),
        "has_use_of_funds":       1 if extracted.objects_section else 0,
    }
