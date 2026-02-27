from fastapi import HTTPException, Header
from typing import Optional
from services.auth_service import decode_access_token

async def get_current_user(authorization: Optional[str] = Header(None)):
    """Verify JWT token and return current user data."""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")
    
    try:
        scheme, token = authorization.split()
        if scheme.lower() != 'bearer':
            raise HTTPException(status_code=401, detail="Invalid authentication scheme")
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid authorization header format")
    
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    return payload

async def require_role(user: dict, allowed_roles: list):
    """Check if user has required role."""
    if user.get('role') not in allowed_roles:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    return user
