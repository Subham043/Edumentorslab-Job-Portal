from fastapi import APIRouter, HTTPException
from models.user import UserRegister, UserLogin, User, LearnerProfile, EmployerProfile, AdminProfile
from services.auth_service import hash_password, verify_password, create_access_token
from services.email_service import send_welcome_email
from utils.db import get_db
from utils.helpers import serialize_datetime, exclude_id

router = APIRouter(prefix="/auth", tags=["authentication"])
db = get_db()

@router.post("/register")
async def register(user_data: UserRegister):
    """Register a new user."""
    
    if user_data.role not in ['learner', 'employer', 'admin']:
        raise HTTPException(status_code=400, detail="Invalid role")
    
    existing_user = await db.users.find_one({"email": user_data.email}, exclude_id())
    if existing_user:
        raise HTTPException(status_code=409, detail="Email already registered")
    
    password_hash = hash_password(user_data.password)
    
    user = User(
        email=user_data.email,
        password_hash=password_hash,
        role=user_data.role
    )
    
    if user_data.role == 'learner':
        user.learner_profile = LearnerProfile(
            full_name=user_data.full_name or ""
        )
    elif user_data.role == 'employer':
        user.employer_profile = EmployerProfile(
            organization_name=user_data.organization_name or "",
            contact_person=user_data.full_name or ""
        )
    elif user_data.role == 'admin':
        user.admin_profile = AdminProfile(
            full_name=user_data.full_name or ""
        )
    
    user_dict = user.model_dump()
    user_dict = serialize_datetime(user_dict)
    
    await db.users.insert_one(user_dict)
    
    token = create_access_token({
        "user_id": user.id,
        "email": user.email,
        "role": user.role
    })
    
    name = user_data.full_name or user_data.email.split('@')[0]
    send_welcome_email(user.email, name, user.role)
    
    return {
        "message": "Registration successful",
        "user": {
            "id": user.id,
            "email": user.email,
            "role": user.role
        },
        "token": token
    }

@router.post("/login")
async def login(credentials: UserLogin):
    """Login with email and password."""
    
    user = await db.users.find_one({"email": credentials.email}, exclude_id())
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(credentials.password, user['password_hash']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if user.get('status') == 'blocked':
        raise HTTPException(status_code=403, detail="Account has been blocked")
    
    token = create_access_token({
        "user_id": user['id'],
        "email": user['email'],
        "role": user['role']
    })
    
    return {
        "message": "Login successful",
        "user": {
            "id": user['id'],
            "email": user['email'],
            "role": user['role'],
            "status": user.get('status', 'active')
        },
        "token": token
    }
