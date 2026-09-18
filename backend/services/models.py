from pydantic import BaseModel
from typing import List, Optional

class Student(BaseModel):
    student_id: str
    name: str
    branch: str
    year: int
    cgpa: float
    interests: List[str]

class Announcement(BaseModel):
    announcement_id: str
    title: str
    content: str
    source: str
    category: Optional[str] = None
    deadline: Optional[str] = None
    eligible_branches: List[str] = []
    eligible_years: List[int] = []
    min_cgpa: Optional[float] = None
    action_required: Optional[str] = None

class ActionItem(BaseModel):
    announcement_id: str
    title: str
    priority: str
    deadline: Optional[str]
    action_required: Optional[str]
    reason: List[str]
