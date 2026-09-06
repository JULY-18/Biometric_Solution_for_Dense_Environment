from datetime import datetime
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from fastapi.responses import FileResponse
from app.config import API_VERSION
from app.database.models import HealthStatus, AttendanceVerificationResponse, AttendanceRecordItem, StudentEnrollmentResponse
from app.database.db import get_enrolled_count, get_all_enrolled_students, save_student, log_attendance
from app.utils.image_processing import decode_image_bytes
from app.core.detector import BiometricPipeline
from app.core.recognizer import match_face
from app.core.report import generate_attendance_excel

router = APIRouter()

@router.get("/health", response_model=HealthStatus, summary="API Health Check")
async def health_check():
    return HealthStatus(
        status="healthy",
        version=API_VERSION,
        timestamp=datetime.utcnow(),
        enrolled_students_count=get_enrolled_count()
    )

@router.post("/students/enroll", response_model=StudentEnrollmentResponse, summary="Enroll Student Profile with Face Biometrics")
async def enroll_student(
    srn: str = Form(..., description="Student Registration Number"),
    name: str = Form(..., description="Full student name"),
    email: Optional[str] = Form(None, description="Official student email"),
    branch: Optional[str] = Form("CSE", description="Student department/branch"),
    image: UploadFile = File(..., description="Reference facial image")
):
    image_bytes = await image.read()
    try:
        img_bgr = decode_image_bytes(image_bytes)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid image format: {exc}"
        )

    pipeline = BiometricPipeline.get_instance()
    faces = pipeline.process_image(img_bgr)

    # In case InsightFace is initializing or in testing mode, generate dummy 512D vector if no face found
    if not faces:
        import numpy as np
        embedding = np.random.randn(512).astype(np.float32)
        has_embedding = False
    else:
        embedding = faces[0]["embedding"]
        has_embedding = True

    save_student(srn=srn, name=name, email=email, branch=branch, embedding=embedding)

    return StudentEnrollmentResponse(
        srn=srn,
        name=name,
        email=email,
        branch=branch,
        enrolled_at=datetime.utcnow(),
        has_embedding=has_embedding
    )

@router.post("/attendance/verify", response_model=AttendanceVerificationResponse, summary="Process Classroom Image for Attendance")
async def verify_attendance(
    image: UploadFile = File(..., description="High-resolution classroom frame"),
    course_code: str = Form("CSE-401", description="Course or lecture identifier")
):
    image_bytes = await image.read()
    try:
        img_bgr = decode_image_bytes(image_bytes)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unable to decode uploaded image: {exc}"
        )

    pipeline = BiometricPipeline.get_instance()
    detected_faces = pipeline.process_image(img_bgr)
    enrolled_students = get_all_enrolled_students()

    attendees = []
    seen_srns = set()

    for face in detected_faces:
        face_emb = face.get("embedding")
        if face_emb is None:
            continue

        match = match_face(face_emb, enrolled_students)
        if match:
            srn = match["srn"]
            if srn not in seen_srns:
                seen_srns.add(srn)
                attendees.append(AttendanceRecordItem(
                    srn=srn,
                    name=match["name"],
                    confidence=match["confidence"],
                    marked_at=datetime.utcnow()
                ))
                log_attendance(srn=srn, confidence=match["confidence"], course_code=course_code)

    recognized_count = len(attendees)
    total_detected = len(detected_faces)
    unknown_count = max(0, total_detected - recognized_count)

    # Generate Excel Report asynchronously or on the fly
    if attendees:
        attendees_dict = [a.model_dump() for a in attendees]
        generate_attendance_excel(attendees_dict, course_code=course_code)

    return AttendanceVerificationResponse(
        success=True,
        faces_detected=total_detected,
        recognized_count=recognized_count,
        unknown_count=unknown_count,
        attendees=attendees,
        message=f"Detected {total_detected} face(s), recognized {recognized_count} student(s)."
    )
