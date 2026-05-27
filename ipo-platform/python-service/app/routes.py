from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.analyzer import DRHPAnalyzer

router   = APIRouter()
analyzer = DRHPAnalyzer()


class AnalyzeRequest(BaseModel):
    pdf_url:      str
    company_name: str = ""
    sector:       str = ""


@router.post("/analyze")
async def analyze_drhp(req: AnalyzeRequest):
    try:
        result = await analyzer.analyze(
            pdf_url=req.pdf_url,
            company_name=req.company_name,
            sector=req.sector,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
