from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field

class StudentBase(BaseModel):
    srn: str = Field(..., description="Student Registration Number (e.g. SCFU424020)")
    name: str = Field(..., description="Full Name of the student")
    email: Optional[str] = Field(None, description="Official college email")
    branch: Optional[str] = Field("CSE", description="Department / Branch")

class StudentEnrollmentResponse(StudentBase):
    enrolled_at: datetime
    has_embedding: bool

class AttendanceRecordItem(BaseModel):
    srn: str
    name: str
    confidence: float
    marked_at: datetime

class AttendanceVerificationResponse(BaseModel):
    success: bool
    faces_detected: int
    recognized_count: int
    unknown_count: int
    attendees: List[AttendanceRecordItem]
    message: str

class HealthStatus(BaseModel):
    status: str
    version: str
    timestamp: datetime
    enrolled_students_count: int
