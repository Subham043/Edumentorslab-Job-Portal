from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime, timezone
import uuid

class Payment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    employer_id: str
    subscription_id: Optional[str] = ""
    
    razorpay_order_id: str
    razorpay_payment_id: Optional[str] = ""
    razorpay_signature: Optional[str] = ""
    
    amount: int
    currency: str = "INR"
    status: str = "created"
    
    payment_method: Optional[str] = ""
    
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PaymentCreate(BaseModel):
    plan: str
    amount: int
    currency: str = "INR"

class PaymentVerify(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    plan: str
