from fastapi import APIRouter, HTTPException, Depends
from middleware.auth_middleware import get_current_user, require_role
from models.payment import Payment, PaymentCreate, PaymentVerify
from models.subscription import Subscription
from services.payment_service import create_razorpay_order, verify_razorpay_signature
from services.email_service import send_subscription_confirmation
from utils.db import get_db
from utils.helpers import serialize_datetime, exclude_id
from datetime import datetime, timezone, timedelta
import os

router = APIRouter(prefix="/payments", tags=["payments"])
db = get_db()

PLAN_PRICES = {
    "basic": 9900,
    "premium": 19900
}

BOOST_PRICE = 4900  # ₹49 for 7-day boost

@router.post("/create-order")
async def create_order(payment_data: PaymentCreate, current_user: dict = Depends(get_current_user)):
    """Create Razorpay order for subscription."""
    await require_role(current_user, ['employer'])
    
    if payment_data.plan not in PLAN_PRICES:
        raise HTTPException(status_code=400, detail="Invalid subscription plan")
    
    amount = PLAN_PRICES[payment_data.plan]
    
    razorpay_order = create_razorpay_order(amount, payment_data.currency)
    
    if not razorpay_order:
        raise HTTPException(status_code=500, detail="Failed to create payment order")
    
    payment = Payment(
        employer_id=current_user['user_id'],
        razorpay_order_id=razorpay_order['id'],
        amount=amount * 100,
        currency=payment_data.currency,
        status="created"
    )
    
    payment_dict = payment.model_dump()
    payment_dict = serialize_datetime(payment_dict)
    
    await db.payments.insert_one(payment_dict)
    
    return {
        "order_id": razorpay_order['id'],
        "amount": amount * 100,
        "currency": payment_data.currency,
        "key_id": os.environ.get('RAZORPAY_KEY_ID')
    }

@router.post("/verify")
async def verify_payment(payment_verify: PaymentVerify, current_user: dict = Depends(get_current_user)):
    """Verify payment and activate subscription."""
    await require_role(current_user, ['employer'])
    
    is_valid = verify_razorpay_signature(
        payment_verify.razorpay_order_id,
        payment_verify.razorpay_payment_id,
        payment_verify.razorpay_signature
    )
    
    if not is_valid:
        raise HTTPException(status_code=400, detail="Invalid payment signature")
    
    payment = await db.payments.find_one(
        {"razorpay_order_id": payment_verify.razorpay_order_id},
        exclude_id()
    )
    
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    await db.payments.update_one(
        {"id": payment['id']},
        {"$set": {
            "razorpay_payment_id": payment_verify.razorpay_payment_id,
            "razorpay_signature": payment_verify.razorpay_signature,
            "status": "success",
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    end_date = datetime.now(timezone.utc) + timedelta(days=30)
    
    subscription = Subscription(
        employer_id=current_user['user_id'],
        plan=payment_verify.plan,
        status="active",
        amount=payment['amount'],
        end_date=end_date
    )
    
    subscription_dict = subscription.model_dump()
    subscription_dict = serialize_datetime(subscription_dict)
    
    await db.subscriptions.insert_one(subscription_dict)
    
    await db.payments.update_one(
        {"id": payment['id']},
        {"$set": {"subscription_id": subscription.id}}
    )
    
    await db.users.update_one(
        {"id": current_user['user_id']},
        {"$set": {
            "employer_profile.subscription_status": "active",
            "employer_profile.subscription_plan": payment_verify.plan,
            "employer_profile.subscription_end_date": end_date.isoformat()
        }}
    )
    
    user = await db.users.find_one({"id": current_user['user_id']}, exclude_id())
    employer_profile = user.get('employer_profile', {})
    
    send_subscription_confirmation(
        user['email'],
        employer_profile.get('contact_person', user['email']),
        payment_verify.plan,
        end_date.strftime('%Y-%m-%d')
    )
    
    return {
        "message": "Payment verified and subscription activated",
        "subscription": {
            "id": subscription.id,
            "plan": subscription.plan,
            "status": subscription.status,
            "end_date": subscription.end_date.isoformat()
        }
    }
