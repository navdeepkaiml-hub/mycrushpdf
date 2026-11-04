"""JWT email/password authentication for the admin area."""
import os
import bcrypt
import jwt
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, HTTPException, Request, Response, Depends
from pydantic import BaseModel, EmailStr

from db import repo, now_utc

JWT_ALGORITHM = "HS256"
LOCKOUT_THRESHOLD = 5
LOCKOUT_MINUTES = 15

auth_router = APIRouter(prefix="/api/auth")


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def _secret() -> str:
    return os.environ["JWT_SECRET"]


def create_access_token(user_id: str, email: str, role: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=12),
        "type": "access",
    }
    return jwt.encode(payload, _secret(), algorithm=JWT_ALGORITHM)


class LoginInput(BaseModel):
    email: EmailStr
    password: str


async def get_current_admin(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        header = request.headers.get("Authorization", "")
        if header.startswith("Bearer "):
            token = header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, _secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = await repo.find_user_by_email(payload["email"])
    if not user or user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return {"email": user["email"], "name": user.get("name", "Admin"), "role": user["role"]}


@auth_router.post("/login")
async def login(data: LoginInput, request: Request, response: Response):
    email = data.email.lower()
    ip = request.client.host if request.client else "unknown"
    identifier = f"{ip}:{email}"

    attempts = await repo.get_attempts(identifier)
    if attempts and attempts.get("count", 0) >= LOCKOUT_THRESHOLD:
        last = attempts.get("last_attempt")
        if last:
            last_dt = datetime.fromisoformat(last)
            if now_utc() - last_dt < timedelta(minutes=LOCKOUT_MINUTES):
                raise HTTPException(status_code=429, detail="Too many attempts. Try again later.")
            else:
                await repo.clear_attempts(identifier)

    user = await repo.find_user_by_email(email)
    if not user or not verify_password(data.password, user["password_hash"]):
        await repo.record_failed_attempt(identifier)
        raise HTTPException(status_code=401, detail="Invalid email or password")

    await repo.clear_attempts(identifier)
    token = create_access_token(str(user.get("_id", email)), user["email"], user.get("role", "admin"))
    response.set_cookie(
        key="access_token", value=token, httponly=True, secure=True,
        samesite="none", max_age=43200, path="/",
    )
    return {"email": user["email"], "name": user.get("name", "Admin"), "role": user.get("role", "admin")}


@auth_router.post("/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    return {"message": "Logged out"}


@auth_router.get("/me")
async def me(admin: dict = Depends(get_current_admin)):
    return admin


async def seed_admin():
    email = os.environ.get("ADMIN_EMAIL", "admin@mycrushpdf.com").lower()
    password = os.environ.get("ADMIN_PASSWORD", "admin123")
    existing = await repo.find_user_by_email(email)
    if existing is None:
        await repo.insert_user({
            "email": email,
            "password_hash": hash_password(password),
            "name": "Admin",
            "role": "admin",
            "created_at": now_utc().isoformat(),
        })
