from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any
import pandas as pd
from app.config import REPORTS_DIR

def generate_attendance_excel(
    attendees: List[Dict[str, Any]],
    course_code: str = "CSE-ATTENDANCE"
) -> Path:
    """
    Generates a formatted Excel attendance sheet using pandas.
    """
    now = datetime.now()
    timestamp_str = now.strftime("%Y%m%d_%H%M%S")
    filename = f"attendance_{course_code}_{timestamp_str}.xlsx"
    file_path = REPORTS_DIR / filename

    data = []
    for idx, item in enumerate(attendees, start=1):
        data.append({
            "Sl. No": idx,
            "SRN": item.get("srn"),
            "Student Name": item.get("name"),
            "Status": "PRESENT",
            "Verification Confidence": f"{round(item.get('confidence', 1.0) * 100, 2)}%",
            "Timestamp": now.strftime("%Y-%m-%d %H:%M:%S")
        })

    if not data:
        # Fallback if no attendees found
        df = pd.DataFrame(columns=["Sl. No", "SRN", "Student Name", "Status", "Verification Confidence", "Timestamp"])
    else:
        df = pd.DataFrame(data)

    df.to_excel(file_path, index=False, engine="openpyxl")
    return file_path
