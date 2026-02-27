from fastapi import APIRouter, HTTPException, Depends
from typing import Optional
from middleware.auth_middleware import get_current_user, require_role
from models.job import Job, JobCreate, JobUpdate
from models.application import ApplicationStatusUpdate
from services.email_service import send_status_update_email
from utils.db import get_db
from utils.helpers import serialize_datetime, exclude_id
from datetime import datetime, timezone

router = APIRouter(prefix="/employers", tags=["employers"])
db = get_db()

@router.get("/profile")
async def get_profile(current_user: dict = Depends(get_current_user)):
    """Get employer profile."""
    await require_role(current_user, ['employer'])
    
    user = await db.users.find_one({"id": current_user['user_id']}, exclude_id())
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "id": user['id'],
        "email": user['email'],
        "employer_profile": user.get('employer_profile', {})
    }

@router.post("/jobs")
async def create_job(job_data: JobCreate, current_user: dict = Depends(get_current_user)):
    """Create a new job posting."""
    await require_role(current_user, ['employer'])
    
    user = await db.users.find_one({"id": current_user['user_id']}, exclude_id())
    employer_profile = user.get('employer_profile', {})
    
    job = Job(
        employer_id=current_user['user_id'],
        employer_name=employer_profile.get('organization_name', user['email']),
        **job_data.model_dump()
    )
    
    job_dict = job.model_dump()
    job_dict = serialize_datetime(job_dict)
    
    await db.jobs.insert_one(job_dict)
    
    return {
        "message": "Job posted successfully",
        "job": {
            "id": job.id,
            "title": job.title,
            "status": job.status,
            "created_at": job.created_at.isoformat()
        }
    }

@router.get("/jobs")
async def get_my_jobs(current_user: dict = Depends(get_current_user)):
    """Get employer's job postings."""
    await require_role(current_user, ['employer'])
    
    jobs = await db.jobs.find(
        {"employer_id": current_user['user_id']},
        exclude_id()
    ).sort("created_at", -1).to_list(1000)
    
    return {
        "jobs": jobs,
        "total": len(jobs)
    }

@router.put("/jobs/{job_id}")
async def update_job(
    job_id: str,
    job_data: JobUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update job posting."""
    await require_role(current_user, ['employer'])
    
    job = await db.jobs.find_one({"id": job_id, "employer_id": current_user['user_id']}, exclude_id())
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    update_data = job_data.model_dump(exclude_unset=True)
    update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.jobs.update_one(
        {"id": job_id},
        {"$set": update_data}
    )
    
    return {"message": "Job updated successfully"}

@router.delete("/jobs/{job_id}")
async def delete_job(job_id: str, current_user: dict = Depends(get_current_user)):
    """Delete job posting."""
    await require_role(current_user, ['employer'])
    
    job = await db.jobs.find_one({"id": job_id, "employer_id": current_user['user_id']}, exclude_id())
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    await db.jobs.delete_one({"id": job_id})
    await db.applications.delete_many({"job_id": job_id})
    
    return {"message": "Job deleted successfully"}

@router.get("/jobs/{job_id}/applicants")
async def get_applicants(job_id: str, current_user: dict = Depends(get_current_user)):
    """Get applicants for a job (requires active subscription)."""
    await require_role(current_user, ['employer'])
    
    job = await db.jobs.find_one({"id": job_id, "employer_id": current_user['user_id']}, exclude_id())
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    user = await db.users.find_one({"id": current_user['user_id']}, exclude_id())
    employer_profile = user.get('employer_profile', {})
    
    if employer_profile.get('subscription_status') != 'active':
        raise HTTPException(
            status_code=403,
            detail="Active subscription required to view applicants"
        )
    
    applicants = await db.applications.find(
        {"job_id": job_id},
        exclude_id()
    ).sort("applied_at", -1).to_list(1000)
    
    return {
        "applicants": applicants,
        "total": len(applicants)
    }

@router.put("/applications/{application_id}/status")
async def update_application_status(
    application_id: str,
    status_data: ApplicationStatusUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update application status."""
    await require_role(current_user, ['employer'])
    
    application = await db.applications.find_one(
        {"id": application_id, "employer_id": current_user['user_id']},
        exclude_id()
    )
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    update_data = {
        "status": status_data.status,
        "notes": status_data.notes,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.applications.update_one(
        {"id": application_id},
        {"$set": update_data}
    )
    
    job = await db.jobs.find_one({"id": application['job_id']}, exclude_id())
    
    send_status_update_email(
        application['learner_email'],
        application['learner_name'],
        job['title'] if job else "the job",
        status_data.status
    )
    
    return {"message": "Application status updated successfully"}

@router.get("/analytics")
async def get_analytics(current_user: dict = Depends(get_current_user)):
    """Get employer analytics."""
    await require_role(current_user, ['employer'])
    
    total_jobs = await db.jobs.count_documents({"employer_id": current_user['user_id']})
    active_jobs = await db.jobs.count_documents({"employer_id": current_user['user_id'], "status": "active"})
    closed_jobs = await db.jobs.count_documents({"employer_id": current_user['user_id'], "status": "closed"})
    
    total_applicants = await db.applications.count_documents({"employer_id": current_user['user_id']})
    
    jobs = await db.jobs.find({"employer_id": current_user['user_id']}, exclude_id()).to_list(1000)
    total_views = sum(job.get('views_count', 0) for job in jobs)
    
    conversion_rate = (total_applicants / total_views * 100) if total_views > 0 else 0
    
    return {
        "total_jobs": total_jobs,
        "total_applicants": total_applicants,
        "total_views": total_views,
        "conversion_rate": round(conversion_rate, 2),
        "jobs_by_status": {
            "active": active_jobs,
            "closed": closed_jobs
        }
    }
