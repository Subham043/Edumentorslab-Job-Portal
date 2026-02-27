from fastapi import APIRouter, HTTPException, Depends
from typing import Optional
from middleware.auth_middleware import get_current_user, require_role
from utils.db import get_db
from utils.helpers import exclude_id
from datetime import datetime, timezone

router = APIRouter(prefix="/admin", tags=["admin"])
db = get_db()

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
