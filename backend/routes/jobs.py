from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional, List
from middleware.auth_middleware import get_current_user, require_role
from models.job import Job, JobCreate, JobUpdate
from models.application import Application, ApplicationCreate
from services.email_service import send_application_confirmation
from utils.db import get_db
from utils.helpers import serialize_datetime, exclude_id
from datetime import datetime, timezone

router = APIRouter(prefix="/jobs", tags=["jobs"])
db = get_db()

@router.get("")
async def get_jobs(
    search: Optional[str] = None,
    location: Optional[str] = None,
    job_type: Optional[str] = None,
    skills: Optional[str] = None,
    page: int = 1,
    limit: int = 20
):
    """Get job listings with filters."""
    query = {"status": "active"}
    
    if search:
        query['$or'] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]
    
    if location:
        query['location'] = {"$regex": location, "$options": "i"}
    
    if job_type:
        query['job_type'] = job_type
    
    if skills:
        skill_list = [s.strip() for s in skills.split(',')]
        query['required_skills'] = {"$in": skill_list}
    
    skip = (page - 1) * limit
    
    jobs = await db.jobs.find(query, exclude_id()).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    total = await db.jobs.count_documents(query)
    
    return {
        "jobs": jobs,
        "total": total,
        "page": page,
        "total_pages": (total + limit - 1) // limit
    }

@router.get("/{job_id}")
async def get_job(job_id: str):
    """Get single job details."""
    job = await db.jobs.find_one({"id": job_id}, exclude_id())
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    await db.jobs.update_one(
        {"id": job_id},
        {"$inc": {"views_count": 1}}
    )
    
    return job

@router.post("/{job_id}/apply")
async def apply_to_job(
    job_id: str,
    application_data: ApplicationCreate,
    current_user: dict = Depends(get_current_user)
):
    """Apply to a job."""
    await require_role(current_user, ['learner'])
    
    job = await db.jobs.find_one({"id": job_id}, exclude_id())
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if job['status'] != 'active':
        raise HTTPException(status_code=400, detail="This job is no longer accepting applications")
    
    existing_application = await db.applications.find_one({
        "job_id": job_id,
        "learner_id": current_user['user_id']
    }, exclude_id())
    
    if existing_application:
        raise HTTPException(status_code=409, detail="You have already applied to this job")
    
    user = await db.users.find_one({"id": current_user['user_id']}, exclude_id())
    learner_profile = user.get('learner_profile', {})
    
    application = Application(
        job_id=job_id,
        learner_id=current_user['user_id'],
        employer_id=job['employer_id'],
        learner_name=learner_profile.get('full_name', user['email']),
        learner_email=user['email'],
        learner_phone=learner_profile.get('phone', ''),
        resume_url=learner_profile.get('resume_url', ''),
        cover_letter=application_data.cover_letter
    )
    
    app_dict = application.model_dump()
    app_dict = serialize_datetime(app_dict)
    
    await db.applications.insert_one(app_dict)
    
    await db.jobs.update_one(
        {"id": job_id},
        {"$inc": {"applicants_count": 1}}
    )
    
    send_application_confirmation(
        user['email'],
        learner_profile.get('full_name', user['email']),
        job['title']
    )
    
    return {
        "message": "Application submitted successfully",
        "application": {
            "id": application.id,
            "job_id": job_id,
            "status": application.status,
            "applied_at": application.applied_at.isoformat()
        }
    }
