from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime, timezone
import uuid

class SystemSettings(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    
    # Subscription pricing
    basic_plan_price: int = 9900
    premium_plan_price: int = 19900
    boost_price: int = 4900
    
    # Platform settings
    platform_commission: float = 0.0
    max_free_jobs: int = 2
    job_expiry_days: int = 30
    boost_duration_days: int = 7
    
    # Feature flags
    enable_boost: bool = True
    enable_subscriptions: bool = True
    maintenance_mode: bool = False
    
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_by: Optional[str] = ""
