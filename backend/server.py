from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from datetime import datetime, timezone
import httpx
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(Path(__file__).parent / '.env')

app = FastAPI(title="HabitGen API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_ANON_KEY = os.environ.get("SUPABASE_ANON_KEY")


class AuthRequest(BaseModel):
    email: str
    password: str


@app.get("/api/health")
async def health():
    return {
        "status": "ok",
        "service": "HabitGen API",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


@app.post("/api/auth/signup")
async def signup(req: AuthRequest):
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{SUPABASE_URL}/auth/v1/signup",
            json={"email": req.email, "password": req.password},
            headers={"apikey": SUPABASE_ANON_KEY, "Content-Type": "application/json"}
        )
        data = resp.json()
        if resp.status_code >= 400:
            detail = data.get("msg") or data.get("error_description") or str(data)
            raise HTTPException(status_code=resp.status_code, detail=detail)
        return data


@app.post("/api/auth/login")
async def login(req: AuthRequest):
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{SUPABASE_URL}/auth/v1/token?grant_type=password",
            json={"email": req.email, "password": req.password},
            headers={"apikey": SUPABASE_ANON_KEY, "Content-Type": "application/json"}
        )
        data = resp.json()
        if resp.status_code >= 400:
            detail = data.get("error_description") or data.get("msg") or str(data)
            raise HTTPException(status_code=resp.status_code, detail=detail)
        return data


@app.get("/api/auth/user")
async def get_user(request: Request):
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")
    token = auth.split(" ")[1]
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{SUPABASE_URL}/auth/v1/user",
            headers={"apikey": SUPABASE_ANON_KEY, "Authorization": f"Bearer {token}"}
        )
        if resp.status_code >= 400:
            raise HTTPException(status_code=401, detail="Invalid token")
        return resp.json()
