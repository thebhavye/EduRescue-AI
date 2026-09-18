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

Return ONLY valid JSON with:
- category
- deadline
- eligible_branches
- eligible_years
- min_cgpa
- action_required

Rules:
- Do not make up information.
- If a field is not present, use null or an empty list.
- min_cgpa must be a number or null.
- eligible_branches must be a list.
- eligible_years must be a list of integers.
"""
)

def extract_announcement(text: str) -> str:
    response = agent(text)
    return str(response)
