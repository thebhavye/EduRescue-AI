import os
from strands import Agent
from strands.models.openai import OpenAIModel

api_key = os.getenv("OLLAMA_API_KEY")

if not api_key:
    raise RuntimeError("OLLAMA_API_KEY is not set")

model = OpenAIModel(
    client_args={
        "api_key": api_key,
        "base_url": "https://ollama.com/v1",
    },
    model_id="gpt-oss:20b",
)

agent = Agent(
    model=model,
    system_prompt="""
You are EduRescue's announcement extraction agent.

Read a college announcement and extract structured information.

Return ONLY valid JSON with exactly these fields:
- category
- deadline
- eligible_branches
- eligible_years
- min_cgpa
- action_required

Rules:
- Do not make up eligibility information.
- If a field is not present, use null or an empty list.
- min_cgpa must be a number or null.
- eligible_branches must be a list.
- eligible_years must be a list of integers.
- deadline must be an ISO 8601 datetime string or null.
- The current date is 2026-09-18.
- If a deadline gives a month/day and time but no year, assume the current year, 2026.
- The timezone for college deadlines is Asia/Kolkata (+05:30) unless another timezone is explicitly stated.
- Convert phrases such as "September 25 at 11:59 PM" to "2026-09-25T23:59:00+05:30".
- Do not invent a deadline if the announcement does not provide one.
- Return ONLY the JSON object. Do not include explanations, reasoning, or markdown.
"""
)

def extract_announcement(text: str) -> str:
    response = agent(text)
    return str(response)
