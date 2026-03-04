from fastapi import APIRouter, HTTPException, Depends
from typing import Optional
from middleware.auth_middleware import get_current_user, require_role
from models.settings import SystemSettings
from models.job import JobUpdate
from utils.db import get_db
from utils.helpers import serialize_datetime, exclude_id
from datetime import datetime, timezone

router = APIRouter(prefix="/admin", tags=["admin"])
db = get_db()

# ============= SYSTEM SETTINGS =============

@router.get("/settings")
async def get_settings(current_user: dict = Depends(get_current_user)):
    """Get system settings."""
    await require_role(current_user, ['admin'])
    
    settings = await db.settings.find_one({}, exclude_id())
    if not settings:
        # Create default settings
        default_settings = SystemSettings()
        settings_dict = default_settings.model_dump()
        settings_dict = serialize_datetime(settings_dict)
        await db.settings.insert_one(settings_dict)
        return default_settings.model_dump()
    
    return settings

@router.put("/settings")
async def update_settings(settings: SystemSettings, current_user: dict = Depends(get_current_user)):
    """Update system settings."""
    await require_role(current_user, ['admin'])
    
    settings.updated_at = datetime.now(timezone.utc)
    settings.updated_by = current_user['user_id']
    
    settings_dict = settings.model_dump()
    settings_dict = serialize_datetime(settings_dict)
    
    existing = await db.settings.find_one({}, exclude_id())
    if existing:
        await db.settings.update_one(
            {"id": existing['id']},
            {"$set": settings_dict}
        )
    else:
        await db.settings.insert_one(settings_dict)
    
    return {"message": "Settings updated successfully"}

# ============= USER MANAGEMENT =============

@router.get("/users")
async def get_users(
    role: Optional[str] = None,
    status: Optional[str] = None,
    page: int = 1,
    limit: int = 50,
    current_user: dict = Depends(get_current_user)
):
    """Get all users."""
    await require_role(current_user, ['admin'])
    
    query = {}
    if role:
        query['role'] = role
    if status:
        query['status'] = status
    
    skip = (page - 1) * limit
    
    users = await db.users.find(query, exclude_id()).skip(skip).limit(limit).to_list(limit)
    
    for user in users:
        user.pop('password_hash', None)
    
    total = await db.users.count_documents(query)
    
    return {
        "users": users,
        "total": total,
        "page": page,
        "total_pages": (total + limit - 1) // limit
    }

@router.get("/users/{user_id}")
async def get_user_details(user_id: str, current_user: dict = Depends(get_current_user)):
    """Get detailed user information."""


# ============= JOB MANAGEMENT =============

@router.get("/all-jobs")
async def get_all_jobs(
    status: Optional[str] = None,
    page: int = 1,
    limit: int = 50,
    current_user: dict = Depends(get_current_user)
):
    """Get all jobs in the system."""
    await require_role(current_user, ['admin'])
    
    query = {}
    if status:
        query['status'] = status
    
    skip = (page - 1) * limit
    
    jobs = await db.jobs.find(query, exclude_id()).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    total = await db.jobs.count_documents(query)
    
    return {
        "jobs": jobs,
        "total": total,
        "page": page,
        "total_pages": (total + limit - 1) // limit
    }

@router.put("/jobs/{job_id}")
async def admin_update_job(
    job_id: str,
    job_data: JobUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Admin can edit any job."""
    await require_role(current_user, ['admin'])
    
    job = await db.jobs.find_one({"id": job_id}, exclude_id())
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
async def admin_delete_job(job_id: str, current_user: dict = Depends(get_current_user)):
    """Admin can delete any job."""
    await require_role(current_user, ['admin'])
    
    job = await db.jobs.find_one({"id": job_id}, exclude_id())
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    await db.jobs.delete_one({"id": job_id})
    await db.applications.delete_many({"job_id": job_id})
    
    return {"message": "Job deleted successfully"}

# ============= APPLICATION MANAGEMENT =============

@router.get("/all-applications")
async def get_all_applications(
    status: Optional[str] = None,
    page: int = 1,
    limit: int = 50,
    current_user: dict = Depends(get_current_user)
):
    """Get all applications in the system."""
    await require_role(current_user, ['admin'])
    
    query = {}
    if status:
        query['status'] = status
    
    skip = (page - 1) * limit
    
    applications = await db.applications.find(query, exclude_id()).sort("applied_at", -1).skip(skip).limit(limit).to_list(limit)
    total = await db.applications.count_documents(query)
    
    return {
        "applications": applications,
        "total": total,
        "page": page,
        "total_pages": (total + limit - 1) // limit
    }

@router.get("/subscriptions")
async def get_all_subscriptions(current_user: dict = Depends(get_current_user)):
    """Get all subscriptions."""
    await require_role(current_user, ['admin'])
    
    subscriptions = await db.subscriptions.find({}, exclude_id()).sort("created_at", -1).to_list(1000)
    
    return {
        "subscriptions": subscriptions,
        "total": len(subscriptions)
    }

@router.get("/payments")
async def get_all_payments(
    status: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get all payments."""
    await require_role(current_user, ['admin'])
    
    query = {}
    if status:
        query['status'] = status
    
    payments = await db.payments.find(query, exclude_id()).sort("created_at", -1).to_list(1000)
    
    return {
        "payments": payments,
        "total": len(payments)
    }



@router.get("/export/users-csv")
async def export_users_csv(current_user: dict = Depends(get_current_user)):
    """Export users CSV."""
    await require_role(current_user, ['admin'])
    users = await db.users.find({}, exclude_id()).to_list(5000)
    csv = "ID,Email,Role,Status\\n" + "\\n".join([f"{u['id']},{u['email']},{u['role']},{u.get('status','active')}" for u in users])
    return {"csv": csv, "count": len(users)}

@router.get("/export/jobs-csv")
async def export_jobs_csv(current_user: dict = Depends(get_current_user)):
    """Export jobs CSV."""
    await require_role(current_user, ['admin'])
    jobs = await db.jobs.find({}, exclude_id()).to_list(5000)
    csv = "ID,Title,Employer,Applicants,Views\\n" + "\\n".join([f"{j['id']},\\\"{j['title']}\\\",{j['employer_name']},{j.get('applicants_count',0)},{j.get('views_count',0)}" for j in jobs])
    return {"csv": csv, "count": len(jobs)}

    await require_role(current_user, ['admin'])
    
    user = await db.users.find_one({"id": user_id}, exclude_id())
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.pop('password_hash', None)
    return user

@router.put("/users/{user_id}")
async def update_user(user_id: str, update_data: dict, current_user: dict = Depends(get_current_user)):
    """Admin can edit any user profile."""
    await require_role(current_user, ['admin'])
    
    user = await db.users.find_one({"id": user_id}, exclude_id())
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.users.update_one(
        {"id": user_id},
        {"$set": update_data}
    )
    
    return {"message": "User updated successfully"}

@router.put("/users/{user_id}/status")
async def update_user_status(
    user_id: str,
    status: str,
    current_user: dict = Depends(get_current_user)
):
    """Update user status (block/unblock)."""
    await require_role(current_user, ['admin'])
    
    if status not in ['active', 'blocked']:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    user = await db.users.find_one({"id": user_id}, exclude_id())
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    await db.users.update_one(
        {"id": user_id},
        {"$set": {
            "status": status,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {"message": f"User {status} successfully"}

@router.delete("/users/{user_id}")
async def delete_user(user_id: str, current_user: dict = Depends(get_current_user)):
    """Delete user."""
    await require_role(current_user, ['admin'])
    
    user = await db.users.find_one({"id": user_id}, exclude_id())
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    await db.users.delete_one({"id": user_id})
    
    if user['role'] == 'employer':
        await db.jobs.delete_many({"employer_id": user_id})
        await db.subscriptions.delete_many({"employer_id": user_id})
        await db.payments.delete_many({"employer_id": user_id})
    elif user['role'] == 'learner':
        await db.applications.delete_many({"learner_id": user_id})
    
    return {"message": "User deleted successfully"}

@router.get("/analytics")
async def get_analytics(current_user: dict = Depends(get_current_user)):
    """Get platform analytics."""
    await require_role(current_user, ['admin'])
    
    total_users = await db.users.count_documents({})
    total_learners = await db.users.count_documents({"role": "learner"})
    total_employers = await db.users.count_documents({"role": "employer"})
    total_admins = await db.users.count_documents({"role": "admin"})
    
    total_jobs = await db.jobs.count_documents({})
    total_applications = await db.applications.count_documents({})
    
    payments = await db.payments.find({"status": "success"}, exclude_id()).to_list(10000)
    total_revenue = sum(p.get('amount', 0) for p in payments)
    
    active_subscriptions = await db.subscriptions.count_documents({"status": "active"})
    
    return {
        "total_users": total_users,
        "total_learners": total_learners,
        "total_employers": total_employers,
        "total_admins": total_admins,
        "total_jobs": total_jobs,
        "total_applications": total_applications,
        "total_revenue": total_revenue,
        "active_subscriptions": active_subscriptions
    }

@router.get("/jobs/pending")
async def get_pending_jobs(current_user: dict = Depends(get_current_user)):
    """Get jobs pending approval."""
    await require_role(current_user, ['admin'])
    
    jobs = await db.jobs.find(
        {"status": "pending_approval"},
        exclude_id()
    ).sort("created_at", -1).to_list(1000)
    
    return {
        "jobs": jobs,
        "total": len(jobs)
    }

@router.put("/jobs/{job_id}/approve")
async def approve_job(
    job_id: str,
    action: str,
    reason: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Approve or reject job posting."""
    await require_role(current_user, ['admin'])
    
    if action not in ['approve', 'reject']:
        raise HTTPException(status_code=400, detail="Invalid action")
    
    job = await db.jobs.find_one({"id": job_id}, exclude_id())
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    new_status = "active" if action == "approve" else "rejected"
    
    update_data = {
        "status": new_status,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    if action == "reject" and reason:
        update_data['rejection_reason'] = reason
    
    await db.jobs.update_one(
        {"id": job_id},
        {"$set": update_data}
    )
    
    return {"message": f"Job {action}d successfully"}
