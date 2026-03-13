# Authentication utilities
import os
import secrets
import jwt
import bcrypt
from datetime import datetime, timezone, timedelta
from typing import Optional
from collections import defaultdict
import time
from fastapi import HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', secrets.token_hex(32))
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/admin/login", auto_error=False)

# Rate limiting for login attempts
login_attempts = defaultdict(list)
MAX_LOGIN_ATTEMPTS = 5
LOCKOUT_DURATION = 300  # 5 minutes

def check_rate_limit(ip: str) -> bool:
    """Check if IP is rate limited. Returns True if allowed, False if blocked."""
    current_time = time.time()
    login_attempts[ip] = [t for t in login_attempts[ip] if current_time - t < LOCKOUT_DURATION]
    return len(login_attempts[ip]) < MAX_LOGIN_ATTEMPTS

def record_login_attempt(ip: str):
    """Record a failed login attempt."""
    login_attempts[ip].append(time.time())

def get_remaining_lockout(ip: str) -> int:
    """Get remaining lockout time in seconds."""
    if not login_attempts[ip]:
        return 0
    oldest_attempt = min(login_attempts[ip])
    remaining = LOCKOUT_DURATION - (time.time() - oldest_attempt)
    return max(0, int(remaining))

def hash_password(password: str) -> str:
    """Hash a password using bcrypt."""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def create_access_token(username: str) -> str:
    """Create a JWT access token."""
    expire = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    payload = {
        "sub": username,
        "exp": expire,
        "iat": datetime.now(timezone.utc)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_access_token(token: str) -> Optional[str]:
    """Decode and verify a JWT token. Returns username if valid."""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload.get("sub")
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

async def get_current_user(token: str = Depends(oauth2_scheme)) -> str:
    """Dependency to get the current authenticated user."""
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    username = decode_access_token(token)
    if not username:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
    return username
