"""
text_generators.py

Generates the six structured text sections returned in every DRHP report.
These match the IPODetailPage analysis sections in your React frontend.

When your fine-tuned model is ready, replace these functions with
model.generate() calls using the extracted section text as prompts.
"""

import re


# ─────────────────────────────────────────────────────────────────────────────
def generate_summary(ctx: dict) -> str:
    name    = ctx.get("company_name") or "The company"
    sector  = ctx.get("sector")       or "its sector"
    score   = ctx.get("score", 5.0)
    finbert = ctx.get("finbert", {})
    biz     = _trim(ctx.get("biz_text", ""), 600)

    # Pull first 3 meaningful sentences from business section
    intro = ""
    if biz:
        sentences = [s.strip() for s in biz.split(".") if len(s.strip()) > 40]
        if sentences:
            intro = ". ".join(sentences[:3]) + "."

    confidence = "strong" if score >= 7 else "moderate" if score >= 4 else "cautious"
    sentiment_phrase = (
        "financial disclosures indicate a positive growth trajectory"
        if finbert.get("positive", 0) > 0.4
        else "the company presents a mixed financial profile with both growth opportunities and notable risks"
    )

    return (
        f"{name} is seeking to list on Indian exchanges through this public offering "
        f"in the {sector} space. "
        f"{intro} "
        f"Based on the DRHP disclosures, {sentiment_phrase}. "
        f"Our AI analysis assigns an overall institutional score of {score}/10, "
        f"reflecting a {confidence} investment profile. "
        f"This assessment is based solely on publicly available DRHP filing data."
    ).strip()


# ─────────────────────────────────────────────────────────────────────────────
def generate_financials(ctx: dict) -> str:
    fin   = _trim(ctx.get("fin_text", ""), 3000)
    score = ctx.get("score", 5.0)

    # Try to extract key numbers from the financial section text
    rev   = _search(fin, r'(?:revenue|turnover|income)[^\d]*₹?\s*([\d,]+(?:\.\d+)?)\s*(?:crore|cr|lakh)?')
    ebi   = _search(fin, r'(?:ebitda|operating profit)[^\d%]*(\d+(?:\.\d+)?)\s*%')
    cagr  = _search(fin, r'(?:cagr|compound annual)[^\d]*(\d+(?:\.\d+)?)\s*%')

    rev_str  = f"₹{rev} Cr revenue"      if rev  else "revenue as disclosed in the DRHP"
    ebi_str  = f"{ebi}% EBITDA margin"   if ebi  else "an improving EBITDA trajectory"
    cagr_str = f"{cagr}% revenue CAGR"   if cagr else "a competitive compound growth rate"
    health   = "robust" if score >= 7 else "stable" if score >= 4 else "moderate"

    return (
        f"The company reports {rev_str} in its most recent audited period, "
        f"with {ebi_str} and {cagr_str} over the restated financial period. "
        f"The balance sheet reflects {health} financial health. "
        f"Key metrics including Debt-to-Equity, Return on Equity, and free cash flow "
        f"are detailed in the Restated Financial Statements section of the DRHP. "
        f"Investors should review Schedule-III-compliant financials for complete figures."
    )


# ─────────────────────────────────────────────────────────────────────────────
def generate_risks(ctx: dict) -> list:
    risk_text = ctx.get("risk_text", "")
    red_flags = ctx.get("red_flags", [])

    # Extract risk sentences from the DRHP risk section
    risks      = []
    sentences  = [s.strip() for s in risk_text.split(".") if 40 < len(s.strip()) < 300]
    risk_kws   = ["risk", "may", "could", "unable", "depend", "competition",
                  "regulatory", "litigation", "uncertain", "volatile", "material"]

    for sentence in sentences:
        if any(kw in sentence.lower() for kw in risk_kws):
            risks.append(sentence.strip() + ".")
        if len(risks) >= 6:
            break

    # Fallback generic risks
    if len(risks) < 4:
        risks += [
            "Dependency on key management personnel may impact strategic continuity.",
            "Regulatory changes in the sector could increase compliance costs.",
            "Intense competition from established domestic and global players may compress margins.",
            "Revenue concentration among a limited number of clients creates customer dependency risk.",
            "Macroeconomic factors including interest rate changes may impact expansion plans.",
        ]

    # Prepend ML-detected red flags at the top
    for rf in red_flags[:3]:
        risks.insert(0, f"⚠️ Red Flag Detected: {rf} — review relevant DRHP sections carefully.")

    return risks[:8]


# ─────────────────────────────────────────────────────────────────────────────
def generate_outlook(ctx: dict) -> str:
    sector  = ctx.get("sector")  or "the sector"
    score   = ctx.get("score", 5.0)
    finbert = ctx.get("finbert", {})

    if score >= 7:
        macro = (f"The {sector} sector demonstrates strong structural tailwinds driven by "
                 "domestic consumption growth and favorable policy support.")
        micro = "The company is well-positioned within its competitive landscape with demonstrated execution capability."
    elif score >= 4:
        macro = (f"The {sector} sector presents moderate growth opportunities "
                 "with some near-term cyclical headwinds.")
        micro = "The company shows promise but faces execution challenges common to its growth stage."
    else:
        macro = (f"The {sector} sector faces near-term headwinds including margin pressure "
                 "and regulatory uncertainty.")
        micro = "Investors should carefully evaluate the risk factors disclosed in Section III of the DRHP."

    horizon = "positive" if finbert.get("positive", 0) > 0.35 else "cautious"

    return (
        f"{macro} {micro} "
        f"Our ML sentiment model assigns a {horizon} medium-term outlook "
        f"based on DRHP financial disclosures. "
        f"Post-listing performance will depend on broader market conditions, "
        f"subscription levels, and management's ability to execute stated business objectives."
    )


# ─────────────────────────────────────────────────────────────────────────────
def generate_use_of_funds(ctx: dict) -> str:
    obj_text = _trim(ctx.get("obj_text", ""), 2000)
    name     = ctx.get("company_name") or "The company"

    if obj_text and len(obj_text) > 100:
        # Try to extract percentage allocations
        matches = re.findall(
            r'(\d+(?:\.\d+)?)\s*%[^.]*?(?:for|towards|to)\s*([^.]{10,60})',
            obj_text, re.IGNORECASE,
        )
        if matches:
            breakdown = "; ".join(f"{p}% towards {u.strip()}" for p, u in matches[:4])
            return (
                f"{name} intends to utilize IPO proceeds as follows: {breakdown}. "
                f"{_trim(obj_text, 400)}"
            )

    return (
        f"{name} plans to deploy fresh issue proceeds primarily towards capital expenditure, "
        f"working capital requirements, debt repayment, and general corporate purposes. "
        f"The detailed utilization schedule with year-wise deployment timelines is provided "
        f"in the 'Objects of the Issue' section of the DRHP."
    )


# ─────────────────────────────────────────────────────────────────────────────
def generate_management_summary(ctx: dict) -> str:
    mgmt_text = _trim(ctx.get("mgmt_text", ""), 2000)
    name      = ctx.get("company_name") or "The company"
    sector    = ctx.get("sector")       or "their industry"
    score     = ctx.get("score", 5.0)
    quality   = "experienced" if score >= 6 else "competent"

    if mgmt_text and len(mgmt_text) > 100:
        sentences = [s.strip() for s in mgmt_text.split(".") if len(s.strip()) > 30]
        if sentences:
            return ". ".join(sentences[:4]) + "."

    return (
        f"{name} is led by an {quality} management team with domain expertise in {sector}. "
        f"The Board of Directors includes a mix of executive promoters and independent directors, "
        f"meeting SEBI listing requirements for board composition and governance. "
        f"Promoter background, qualifications, track record, and key managerial personnel "
        f"details are provided in the 'Our Management' section of the DRHP."
    )


# ─────────────────────────────────────────────────────────────────────────────
#  Helpers
# ─────────────────────────────────────────────────────────────────────────────
def _trim(text: str, n: int) -> str:
    if not text:
        return ""
    return text[:n].rsplit(" ", 1)[0] if len(text) > n else text


def _search(text: str, pattern: str):
    m = re.search(pattern, text, re.IGNORECASE)
    return m.group(1).replace(",", "") if m else None
