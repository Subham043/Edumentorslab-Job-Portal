import os
import razorpay
import hmac
import hashlib

RAZORPAY_KEY_ID = os.environ.get('RAZORPAY_KEY_ID')
RAZORPAY_KEY_SECRET = os.environ.get('RAZORPAY_KEY_SECRET')

client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

def create_razorpay_order(amount: int, currency: str = "INR") -> dict:
    """Create a Razorpay order."""
    try:
        order_data = {
            "amount": amount,
            "currency": currency,
            "payment_capture": 1
        }
        order = client.order.create(data=order_data)
        return order
    except Exception as e:
        print(f"Error creating Razorpay order: {e}")
        return None

def verify_razorpay_signature(order_id: str, payment_id: str, signature: str) -> bool:
    """Verify Razorpay payment signature."""
    try:
        message = f"{order_id}|{payment_id}"
        generated_signature = hmac.new(
            RAZORPAY_KEY_SECRET.encode('utf-8'),
            message.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        
        return hmac.compare_digest(generated_signature, signature)
    except Exception as e:
        print(f"Error verifying signature: {e}")
        return False
