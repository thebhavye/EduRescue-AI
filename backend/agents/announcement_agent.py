from strands import Agent
from strands.models.ollama import OllamaModel

model = OllamaModel(
    host="http://localhost:11434",
    model_id="qwen2.5:7b",
)

agent = Agent(
    model=model,
    system_prompt="""
You are EduRescue's announcement extraction agent.

Your job is to read a college announcement and extract structured information.

Return ONLY valid JSON with these fields:
- category
- deadline
- eligible_branches
- eligible_years
- min_cgpa
- action_required

Do not make up information.
If a field is not present, use null or an empty list.
"""
)

def extract_announcement(text: str) -> str:
    response = agent(text)
    return str(response)
