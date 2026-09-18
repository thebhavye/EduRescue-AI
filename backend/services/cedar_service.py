import json
import subprocess
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SCHEMA = ROOT / "backend" / "policies" / "schema.cedarschema"
POLICY = ROOT / "backend" / "policies" / "eligibility.cedar"


def is_eligible(student: dict, announcement: dict) -> bool:
    min_cgpa = announcement.get("min_cgpa")

    entities = [
        {
            "uid": {"type": "Student", "id": "student"},
            "attrs": {
                "branch": student["branch"],
                "year": student["year"],
                "cgpa10": int(student["cgpa"] * 10),
            },
            "parents": [],
        },
        {
            "uid": {"type": "Announcement", "id": "announcement"},
            "attrs": {
                "eligible_branches": announcement.get("eligible_branches", []),
                "eligible_years": announcement.get("eligible_years", []),
                "min_cgpa10": int(min_cgpa * 10) if min_cgpa is not None else 0,
            },
            "parents": [],
        },
    ]

    request = {
        "principal": 'Student::"student"',
        "action": 'Action::"apply"',
        "resource": 'Announcement::"announcement"',
        "context": {},
    }

    with tempfile.TemporaryDirectory() as tmp:
        entities_file = Path(tmp) / "entities.json"
        request_file = Path(tmp) / "request.json"

        entities_file.write_text(json.dumps(entities), encoding="utf-8")
        request_file.write_text(json.dumps(request), encoding="utf-8")

        try:
            result = subprocess.run(
                [
                    "cedar",
                    "authorize",
                    "--schema",
                    str(SCHEMA),
                    "--policies",
                    str(POLICY),
                    "--entities",
                    str(entities_file),
                    "--request-json",
                    str(request_file),
                ],
                capture_output=True,
                text=True,
                check=False,
            )
        except FileNotFoundError as exc:
            raise RuntimeError(
                "Cedar CLI is not installed or not available on PATH."
            ) from exc

        output = (result.stdout + result.stderr).strip().upper()

        if "ALLOW" in output:
            return True

        if "DENY" in output:
            return False

        raise RuntimeError(
            f"Cedar authorization failed:\n{result.stdout}\n{result.stderr}"
        )
