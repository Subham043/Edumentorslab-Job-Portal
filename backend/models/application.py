from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime, timezone
import uuid

class Application(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    job_id: str
    learner_id: str
    employer_id: str
    
    learner_name: str
    learner_email: str
    learner_phone: str
    resume_url: str
    cover_letter: Optional[str] = ""
    
    status: str = "applied"
    
    applied_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    notes: Optional[str] = ""

class ApplicationCreate(BaseModel):
    cover_letter: Optional[str] = ""

class ApplicationStatusUpdate(BaseModel):
    status: str
    notes: Optional[str] = ""
