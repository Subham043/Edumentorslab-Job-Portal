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


@router.post("/jobs/{job_id}/save")
async def save_job(job_id: str, current_user: dict = Depends(get_current_user)):
    """Save a job to favorites."""
    await require_role(current_user, ['learner'])
    
    job = await db.jobs.find_one({"id": job_id}, exclude_id())
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    user = await db.users.find_one({"id": current_user['user_id']}, exclude_id())
    learner_profile = user.get('learner_profile', {})
    saved_jobs = learner_profile.get('saved_jobs', [])
    
    if job_id in saved_jobs:
        raise HTTPException(status_code=409, detail="Job already saved")
    
    saved_jobs.append(job_id)
    
    await db.users.update_one(
        {"id": current_user['user_id']},
        {"$set": {"learner_profile.saved_jobs": saved_jobs}}
    )
    
    return {"message": "Job saved successfully"}

@router.delete("/jobs/{job_id}/save")
async def unsave_job(job_id: str, current_user: dict = Depends(get_current_user)):
    """Remove a job from favorites."""
    await require_role(current_user, ['learner'])
    
    user = await db.users.find_one({"id": current_user['user_id']}, exclude_id())
    learner_profile = user.get('learner_profile', {})
    saved_jobs = learner_profile.get('saved_jobs', [])
    
    if job_id not in saved_jobs:
        raise HTTPException(status_code=404, detail="Job not in saved list")
    
    saved_jobs.remove(job_id)
    
    await db.users.update_one(
        {"id": current_user['user_id']},
        {"$set": {"learner_profile.saved_jobs": saved_jobs}}
    )
    
    return {"message": "Job removed from saved"}

@router.get("/saved-jobs")
async def get_saved_jobs(current_user: dict = Depends(get_current_user)):
    """Get learner's saved jobs."""
    await require_role(current_user, ['learner'])
    
    user = await db.users.find_one({"id": current_user['user_id']}, exclude_id())
    learner_profile = user.get('learner_profile', {})
    saved_job_ids = learner_profile.get('saved_jobs', [])
    
    if not saved_job_ids:
        return {"jobs": [], "total": 0}
    
    jobs = await db.jobs.find({"id": {"$in": saved_job_ids}}, exclude_id()).to_list(100)
    
    return {
        "jobs": jobs,
        "total": len(jobs)
    }


@router.get("/recommended-jobs")
async def get_recommended_jobs(current_user: dict = Depends(get_current_user)):
    """Get job recommendations based on skills."""
    await require_role(current_user, ['learner'])
    user = await db.users.find_one({"id": current_user['user_id']}, exclude_id())
    skills = user.get('learner_profile', {}).get('skills', [])
    if not skills:
        jobs = await db.jobs.find({"status": "active"}, exclude_id()).sort("created_at", -1).limit(10).to_list(10)
        return {"jobs": jobs, "message": "Add skills for recommendations"}
    jobs = await db.jobs.find({"status": "active", "required_skills": {"$in": skills}}, exclude_id()).limit(20).to_list(20)
    return {"jobs": jobs, "total": len(jobs)}

@router.delete("/applications/{application_id}")
async def withdraw_application(application_id: str, current_user: dict = Depends(get_current_user)):
    """Withdraw application."""
    await require_role(current_user, ['learner'])
    app = await db.applications.find_one({"id": application_id, "learner_id": current_user['user_id']}, exclude_id())
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    if app['status'] in ['selected', 'rejected']:
        raise HTTPException(status_code=400, detail="Cannot withdraw")
    await db.applications.delete_one({"id": application_id})
    await db.jobs.update_one({"id": app['job_id']}, {"$inc": {"applicants_count": -1}})
    return {"message": "Withdrawn successfully"}


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
