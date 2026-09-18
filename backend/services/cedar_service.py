import json
import subprocess
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SCHEMA = ROOT / "backend" / "policies" / "schema.cedarschema"
POLICY = ROOT / "backend" / "policies" / "eligibility.cedar"


def is_eligible(student: dict, announcement: dict) -> bool:
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
                "eligible_branches": announcement["eligible_branches"],
                "eligible_years": announcement["eligible_years"],
                "min_cgpa10": int(announcement["min_cgpa"] * 10),
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

        result = subprocess.run(
            [
                "cedar",
                "authorize",
                "--schema", str(SCHEMA),
                "--policies", str(POLICY),
                "--entities", str(entities_file),
                "--request-json", str(request_file),
            ],
            capture_output=True,
            text=True,
        )

        output = (result.stdout + result.stderr).strip().upper()

        if "ALLOW" in output:
            return True

        if "DENY" in output:
            return False

        raise RuntimeError(
            f"Cedar authorization failed:\n{result.stdout}\n{result.stderr}"
        )
