from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime, timezone, timedelta
import uuid

class Job(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    employer_id: str
    employer_name: str
    
    title: str
    description: str
    location: str
    job_type: str
    salary_min: Optional[int] = 0
    salary_max: Optional[int] = 0
    currency: str = "INR"
    
    required_skills: List[str] = Field(default_factory=list)
    required_education: Optional[str] = ""
    experience_required: Optional[str] = ""
    
    status: str = "active"
    
    applicants_count: int = 0
    views_count: int = 0
    
    is_boosted: bool = False
    boost_expires_at: Optional[datetime] = None
    
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    expires_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc) + timedelta(days=30))

class JobCreate(BaseModel):
    title: str
    description: str
    location: str
    job_type: str
    salary_min: Optional[int] = 0
    salary_max: Optional[int] = 0
    required_skills: List[str] = Field(default_factory=list)
    required_education: Optional[str] = ""
    experience_required: Optional[str] = ""

class JobUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    job_type: Optional[str] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    required_skills: Optional[List[str]] = None
    required_education: Optional[str] = None
    experience_required: Optional[str] = None
    status: Optional[str] = None
