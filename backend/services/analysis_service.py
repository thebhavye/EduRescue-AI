import json

from backend.agents.announcement_agent import extract_announcement
from backend.services.cedar_service import is_eligible
from backend.services.models import ActionItem, Announcement, Student
from backend.services.priority_engine import calculate_priority


def analyze_announcement(
    student: Student,
    announcement_text: str,
    announcement_id: str = "generated_announcement",
    title: str = "College Announcement",
    source: str = "unknown",
) -> ActionItem:
    extracted_raw = extract_announcement(announcement_text)

    # Strands returns the model response as text.
    # Extract the JSON object even if the model adds surrounding text.
    raw_text = str(extracted_raw).strip()

    start = raw_text.find("{")
    end = raw_text.rfind("}")

    if start == -1 or end == -1:
        raise ValueError("Announcement agent did not return valid JSON")

    extracted = json.loads(raw_text[start:end + 1])

    announcement = Announcement(
        announcement_id=announcement_id,
        title=title,
        content=announcement_text,
        source=source,
        category=extracted.get("category"),
        deadline=extracted.get("deadline"),
        eligible_branches=extracted.get("eligible_branches") or [],
        eligible_years=extracted.get("eligible_years") or [],
        min_cgpa=extracted.get("min_cgpa"),
        action_required=extracted.get("action_required"),
    )

    if not is_eligible(student.model_dump(), announcement.model_dump()):
        return ActionItem(
            announcement_id=announcement.announcement_id,
            title=announcement.title,
            priority="LOW",
            deadline=announcement.deadline,
            action_required=None,
            reason=["Not eligible according to Cedar policy"],
        )

    priority, reasons = calculate_priority(student, announcement)

    return ActionItem(
        announcement_id=announcement.announcement_id,
        title=announcement.title,
        priority=priority,
        deadline=announcement.deadline,
        action_required=announcement.action_required,
        reason=reasons,
    )
