from fastapi import FastAPI

app = FastAPI(
    title="EduRescue API",
    description="AI-powered student information triage and action system",
    version="0.1.0",
)


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "service": "edurescue-api",
    }