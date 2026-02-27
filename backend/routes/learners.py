from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from typing import Optional
from middleware.auth_middleware import get_current_user, require_role
from models.user import UserUpdate
from models.application import ApplicationCreate
from services.resume_parser import parse_resume
from services.profile_service import calculate_profile_completion
from services.email_service import send_application_confirmation
from utils.db import get_db
from utils.helpers import serialize_datetime, exclude_id
import os
import shutil
from datetime import datetime, timezone

router = APIRouter(prefix="/learners", tags=["learners"])
db = get_db()

UPLOAD_DIR = "/app/backend/uploads/resumes"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("/profile")
async def get_profile(current_user: dict = Depends(get_current_user)):
    """Get learner profile."""
    await require_role(current_user, ['learner'])
    
    user = await db.users.find_one({"id": current_user['user_id']}, exclude_id())
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "id": user['id'],
        "email": user['email'],
        "learner_profile": user.get('learner_profile', {})
    }

@router.put("/profile")
async def update_profile(profile_data: UserUpdate, current_user: dict = Depends(get_current_user)):
    """Update learner profile."""
    await require_role(current_user, ['learner'])
    
    user = await db.users.find_one({"id": current_user['user_id']}, exclude_id())
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    learner_profile = user.get('learner_profile', {})
    
    update_data = profile_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        learner_profile[key] = value
    
    profile_completion = calculate_profile_completion(learner_profile)
    learner_profile['profile_completion'] = profile_completion
    
    update_dict = {
        "learner_profile": learner_profile,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.update_one(
        {"id": current_user['user_id']},
        {"$set": update_dict}
    )
    
    return {
        "message": "Profile updated successfully",
        "profile_completion": profile_completion
    }

@router.post("/upload-resume")
async def upload_resume(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """Upload and parse resume."""
    await require_role(current_user, ['learner'])
    
    if not file.filename.endswith(('.pdf', '.doc', '.docx')):
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are supported")
    
    file_extension = file.filename.split('.')[-1]
    filename = f"{current_user['user_id']}_{int(datetime.now().timestamp())}.{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    parsed_data = parse_resume(file_path, filename)
    
    resume_url = f"/uploads/resumes/{filename}"
    
    user = await db.users.find_one({"id": current_user['user_id']}, exclude_id())
    learner_profile = user.get('learner_profile', {})
    learner_profile['resume_url'] = resume_url
    
    profile_completion = calculate_profile_completion(learner_profile)
    learner_profile['profile_completion'] = profile_completion
    
    await db.users.update_one(
        {"id": current_user['user_id']},
        {"$set": {
            "learner_profile": learner_profile,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {
        "message": "Resume uploaded successfully",
        "resume_url": resume_url,
        "parsed_data": parsed_data,
        "profile_completion": profile_completion
    }

@router.get("/applications")
async def get_applications(
    status: Optional[str] = None,
    page: int = 1,
    limit: int = 20,
    current_user: dict = Depends(get_current_user)
):
    """Get learner's applications."""
    await require_role(current_user, ['learner'])
    
    query = {"learner_id": current_user['user_id']}
    if status:
        query['status'] = status
    
    skip = (page - 1) * limit
    
    applications = await db.applications.find(query, exclude_id()).sort("applied_at", -1).skip(skip).limit(limit).to_list(limit)
    total = await db.applications.count_documents(query)
    
    result_applications = []
    for app in applications:
        job = await db.jobs.find_one({"id": app['job_id']}, exclude_id())
        result_applications.append({
            "id": app['id'],
            "job": {
                "id": job['id'] if job else "",
                "title": job['title'] if job else "N/A",
                "employer_name": job['employer_name'] if job else "N/A"
            },
            "status": app['status'],
            "applied_at": app['applied_at']
        })
    
    return {
        "applications": result_applications,
        "total": total,
        "page": page,
        "total_pages": (total + limit - 1) // limit
    }
