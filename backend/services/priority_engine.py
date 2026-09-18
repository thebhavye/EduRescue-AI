from datetime import datetime, timezone
from .models import Student, Announcement

def calculate_priority(student: Student, announcement: Announcement) -> tuple[str, list[str]]:
    score = 0
    reasons = []

    if announcement.eligible_branches:
        if student.branch in announcement.eligible_branches:
            score += 30
            reasons.append("Branch eligible")
        else:
            reasons.append("Branch not eligible")
            return "LOW", reasons

    if announcement.eligible_years:
        if student.year in announcement.eligible_years:
            score += 20
            reasons.append("Year eligible")
        else:
            reasons.append("Year not eligible")
            return "LOW", reasons

    if announcement.min_cgpa is not None:
        if student.cgpa >= announcement.min_cgpa:
            score += 20
            reasons.append("CGPA requirement met")
        else:
            reasons.append("CGPA requirement not met")
            return "LOW", reasons

    if announcement.category:
        category = announcement.category.lower()
        for interest in student.interests:
            if interest.lower() in category or category in interest.lower():
                score += 15
                reasons.append("Matches your interests")
                break

    if announcement.deadline:
        try:
            deadline = datetime.fromisoformat(
                announcement.deadline.replace("Z", "+00:00")
            )
            now = datetime.now(timezone.utc)
            hours_left = (deadline - now).total_seconds() / 3600

            if hours_left <= 24:
                score += 30
                reasons.append("Deadline within 24 hours")
            elif hours_left <= 72:
                score += 20
                reasons.append("Deadline within 3 days")
            elif hours_left <= 168:
                score += 10
                reasons.append("Deadline within 7 days")
        except ValueError:
            reasons.append("Deadline could not be parsed")

    if score >= 60:
        priority = "HIGH"
    elif score >= 35:
        priority = "MEDIUM"
    else:
        priority = "LOW"

    return priority, reasons
