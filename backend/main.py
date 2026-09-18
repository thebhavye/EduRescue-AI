from fastapi import FastAPI
from pydantic import BaseModel

from backend.services.analysis_service import analyze_announcement
from backend.services.models import Student

app = FastAPI(
    title="EduRescue API",
    description="AI-powered student information triage and action system",
    version="0.2.0",
)


class AnalyzeRequest(BaseModel):
    announcement: str
    student: Student


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "service": "edurescue-api",
    }


@app.post("/api/analyze")
def analyze(request: AnalyzeRequest):
    result = analyze_announcement(
        student=request.student,
        announcement_text=request.announcement,
    )

    return result.model_dump()
