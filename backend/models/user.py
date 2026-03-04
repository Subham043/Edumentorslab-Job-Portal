from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, List
from datetime import datetime, timezone
import uuid

class Education(BaseModel):
    degree: str
    institution: str
    year: int
    description: Optional[str] = ""

class Experience(BaseModel):
    company: str
    role: str
    duration: str
    description: Optional[str] = ""

class LearnerProfile(BaseModel):
    full_name: Optional[str] = ""
    phone: Optional[str] = ""
    location: Optional[str] = ""
    bio: Optional[str] = ""
    resume_url: Optional[str] = ""
    
    # Professional links
    portfolio_url: Optional[str] = ""
    linkedin_url: Optional[str] = ""
    github_url: Optional[str] = ""
    
    # Skills and qualifications
    skills: List[str] = Field(default_factory=list)
    languages: List[str] = Field(default_factory=list)
    certifications: List[str] = Field(default_factory=list)
    
    # Education and experience
    education: List[Education] = Field(default_factory=list)
    experience: List[Experience] = Field(default_factory=list)
    
    # Job preferences
    expected_salary_min: Optional[int] = 0
    expected_salary_max: Optional[int] = 0
    notice_period: Optional[str] = ""
    work_authorization: Optional[str] = ""
    willing_to_relocate: bool = False
    
    # Profile metadata
    profile_completion: int = 0
    visibility: str = "public"
    saved_jobs: List[str] = Field(default_factory=list)

class EmployerProfile(BaseModel):
    organization_name: Optional[str] = ""
    organization_type: Optional[str] = ""
    contact_person: Optional[str] = ""
    phone: Optional[str] = ""
    location: Optional[str] = ""
    website: Optional[str] = ""
    description: Optional[str] = ""
    logo_url: Optional[str] = ""
    verified: bool = False
    subscription_status: str = "none"
    subscription_plan: str = "free"
    subscription_end_date: Optional[datetime] = None

class AdminProfile(BaseModel):
    full_name: Optional[str] = ""

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    password_hash: str
    role: str
    status: str = "active"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    learner_profile: Optional[LearnerProfile] = None
    employer_profile: Optional[EmployerProfile] = None
    admin_profile: Optional[AdminProfile] = None

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    role: str
    full_name: Optional[str] = None
    organization_name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    bio: Optional[str] = None
    skills: Optional[List[str]] = None
    education: Optional[List[Education]] = None
    experience: Optional[List[Experience]] = None
    visibility: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    email: str
    role: str
    status: str
