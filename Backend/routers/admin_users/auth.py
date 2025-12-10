from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlmodel import Session, select
from pydantic import BaseModel, EmailStr
from typing import Optional, Literal
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import jwt, JWTError
from fastapi.concurrency import run_in_threadpool
from fastapi_mail import FastMail, MessageSchema, MessageType, ConnectionConfig
import os
from core.database import get_db
from model.models import User
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/api/auth", tags=["Auth"])

# -----------------------------
# Password Hashing
# -----------------------------
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

# -----------------------------
# JWT Config
# -----------------------------
SECRET_KEY = "your_super_secret_key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # 24 hours (changed from 15 minutes)
REFRESH_TOKEN_EXPIRE_DAYS = 30  # 30 days (changed from 7 days)
RESET_TOKEN_EXPIRE_MINUTES = 60  # 1 hour (changed from 15 minutes)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# -----------------------------
# Mail Config
# -----------------------------
conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("EMAIL_USER"),
    MAIL_PASSWORD=os.getenv("EMAIL_PASS"),
    MAIL_FROM=os.getenv("EMAIL_USER"),
    MAIL_PORT=587,
    MAIL_SERVER="smtp.gmail.com",
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

async def send_email(to: str, subject: str, body: str):
    message = MessageSchema(
        subject=subject,
        recipients=[to],
        body=body,
        subtype=MessageType.plain
    )
    fm = FastMail(conf)
    await fm.send_message(message)

# -----------------------------
# Schemas
# -----------------------------
class UserCreate(BaseModel):
    name: str
    username: Optional[str] = None
    email: EmailStr
    password: str
    role: Literal["recruiter", "company", "superadmin"]
    company_name: Optional[str] = None
    company_website: Optional[str] = None
    company_id: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class RefreshRequest(BaseModel):
    refresh_token: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

# -----------------------------
# JWT Helpers
# -----------------------------
def create_access_token(data: dict, expires_delta: timedelta):
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def create_refresh_token(data: dict):
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode = {"sub": data["sub"], "exp": expire, "type": "refresh"}
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def create_reset_token(user_id: int):
    expire = datetime.utcnow() + timedelta(minutes=RESET_TOKEN_EXPIRE_MINUTES)
    to_encode = {"sub": str(user_id), "exp": expire, "type": "reset"}
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_reset_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "reset":
            raise HTTPException(status_code=400, detail="Invalid token type")
        return int(payload.get("sub"))
    except JWTError:
        raise HTTPException(status_code=400, detail="Invalid or expired token")

# -----------------------------
# Signup - Inactive by Default + Email Notifications
# -----------------------------
@router.post("/signup", status_code=status.HTTP_201_CREATED)
async def signup(payload: UserCreate, session: Session = Depends(get_db)):
    if payload.role == "recruiter" and not payload.company_name:
        raise HTTPException(status_code=400, detail="company_name required")

    existing = session.exec(select(User).where(User.email == payload.email)).first()
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    hashed = get_password_hash(payload.password)
    user = User(
        name=payload.name,
        username=payload.username,
        email=str(payload.email),
        hashed_password=hashed,
        role=payload.role,
        company_name=payload.company_name,
        company_website=payload.company_website,
        company_id=payload.company_id,
        is_active=False,  # 🔒 New users are inactive until Super Admin approves
    )

    session.add(user)
    session.commit()
    session.refresh(user)

    # Notify the user
    try:
        await send_email(
            to=user.email,
            subject="Account Created - Pending Approval",
            body=f"Hi {user.name},\n\nYour account has been created successfully and is pending approval by a Super Admin.\nYou'll be notified once your account is activated.\n\nBest,\nHR Automation System"
        )
    except Exception as e:
        print(f"[WARN] Failed to send user signup email: {e}")

    # Notify all Super Admins
    super_admins = session.exec(select(User).where(User.role == "superadmin")).all()
    for sa in super_admins:
        try:
            await send_email(
                to=sa.email,
                subject="New User Registration Pending Approval",
                body=f"New user registration detected:\n\n"
                     f"Name: {user.name}\nEmail: {user.email}\nRole: {user.role}\n"
                     f"Company: {user.company_name or 'N/A'}\n\n"
                     f"Approve or activate the user here:\nhttp://127.0.0.1:8000/admin",
            )
        except Exception as e:
            print(f"[WARN] Failed to notify Super Admin ({sa.email}): {e}")

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "is_active": user.is_active,
        "message": "Account created successfully. Waiting for Super Admin approval."
    }

# -----------------------------
# Login (JSON)
# -----------------------------
@router.post("/login-json")
def login_json(payload: LoginRequest, session: Session = Depends(get_db)):
    user = session.exec(select(User).where(User.email == payload.email)).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if hasattr(user, "is_active") and not user.is_active:
        raise HTTPException(status_code=403, detail="Your account is inactive. Contact your Super Admin.")

    access_token = create_access_token(
        {"sub": str(user.id), "role": user.role}, timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    refresh_token = create_refresh_token({"sub": str(user.id)})

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "role": user.role,
        "email": user.email
    }

# -----------------------------
# Login (OAuth2)
# -----------------------------
@router.post("/login", response_model=TokenResponse)
def login(form_data: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(get_db)):
    user = session.exec(select(User).where(User.email == form_data.username)).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if hasattr(user, "is_active") and not user.is_active:
        raise HTTPException(status_code=403, detail="Your account is inactive. Contact your Super Admin.")

    access_token = create_access_token(
        {"sub": str(user.id)}, timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    refresh_token = create_refresh_token({"sub": str(user.id)})

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "role": user.role
    }

# -----------------------------
# Forgot Password
# -----------------------------
@router.post("/forgot-password")
async def forgot_password(payload: ForgotPasswordRequest, session: Session = Depends(get_db)):
    user = session.exec(select(User).where(User.email == payload.email)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    reset_token = create_reset_token(user.id)
    reset_link = f"http://localhost:3000/ResetPassword?token={reset_token}"

    await send_email(
        to=payload.email,
        subject="Password Reset Request",
        body=f"Click the link to reset your password: {reset_link}",
    )
    return {"msg": "Reset link sent to your email"}

# -----------------------------
# Reset Password
# -----------------------------
@router.post("/reset-password")
async def reset_password(payload: ResetPasswordRequest, session: Session = Depends(get_db)):
    user_id = verify_reset_token(payload.token)

    def update_password():
        user = session.get(User, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        user.hashed_password = get_password_hash(payload.new_password)
        session.add(user)
        session.commit()
        return user

    user = await run_in_threadpool(update_password)

    await send_email(
        to=user.email,
        subject="Password Reset Successful",
        body="Your password has been successfully reset."
    )
    return {"msg": "Password reset successful. A confirmation email has been sent."}

# -----------------------------
# Get Current User + Role Guard
# -----------------------------
def get_current_user(token: str = Depends(oauth2_scheme), session: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = session.get(User, int(user_id))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if hasattr(user, "is_active") and not user.is_active:
        raise HTTPException(status_code=403, detail="Account inactive. Contact Super Admin.")
    return user

@router.get("/me")
def read_current_user(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "username": current_user.username,
        "email": current_user.email,
        "role": current_user.role,
        "company_name": current_user.company_name,
        "company_website": current_user.company_website,
        "company_id": current_user.company_id,
    }

def require_roles(allowed_roles: list[str]):
    def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role.lower() not in [r.lower() for r in allowed_roles]:
            raise HTTPException(status_code=403, detail="Operation not permitted")
        return current_user
    return role_checker
