from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
from emergentintegrations.llm.chat import LlmChat, UserMessage
from telegram import Bot
import asyncio

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ.get('MONGO_URL')
db_name = os.environ.get('DB_NAME')
JWT_SECRET = os.environ.get('JWT_SECRET', 'fallback-secret-key')
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')
TELEGRAM_BOT_TOKEN = os.environ.get('TELEGRAM_BOT_TOKEN', '')

client = AsyncIOMotorClient(mongo_url)
db = client[db_name]

telegram_bot = None
if TELEGRAM_BOT_TOKEN:
    telegram_bot = Bot(token=TELEGRAM_BOT_TOKEN)

app = FastAPI()
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    name: Optional[str] = None
    google_id: Optional[str] = None
    password_hash: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class GoogleAuthRequest(BaseModel):
    google_id: str
    email: EmailStr
    name: str

class ValidationSession(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    idea_summary: Optional[str] = None
    current_step: int = 1
    market_fit_score: Optional[int] = None
    decision: Optional[str] = None
    reasoning: Optional[str] = None
    next_actions: Optional[List[str]] = None
    status: str = "in_progress"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SessionCreate(BaseModel):
    pass

class Message(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    role: str
    content: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ChatMessageRequest(BaseModel):
    session_id: str
    message: str

class ChatMessageResponse(BaseModel):
    message: str
    role: str
    current_step: int
    step_name: str

class FinalAnalysisRequest(BaseModel):
    session_id: str

class FinalAnalysisResponse(BaseModel):
    market_fit_score: int
    decision: str
    reasoning: str
    next_actions: List[str]

class TelegramBotSetup(BaseModel):
    bot_token: str

class TelegramConnection(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    telegram_chat_id: str
    bot_token: str
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

def create_token(user_id: str) -> str:
    payload = {
        'user_id': user_id,
        'exp': datetime.now(timezone.utc) + timedelta(days=7)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm='HS256')

def verify_token(token: str) -> str:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
        return payload['user_id']
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    token = credentials.credentials
    return verify_token(token)

STEP_NAMES = {
    1: "Idea Intake",
    2: "Assumption Testing",
    3: "Customer Discovery",
    4: "Feedback Analysis",
    5: "Final Analysis"
}

VALIDATION_SYSTEM_PROMPT = """You are an experienced startup co-founder focused on validation. Your role is to help founders validate their startup ideas through thoughtful questioning and analysis.

Tone: Curious, Direct, Supportive, Honest (not hype-driven)

Your conversation follows these steps:
1. Idea Intake - Ask about the problem, target users, current solutions, and why their solution is better
2. Assumption Testing - Identify biggest assumptions and riskiest unknowns
3. Customer Discovery - Generate interview questions, warn against biased questions
4. Feedback Analysis - Extract pain points, detect emotional signals, group themes
5. Final Analysis - Provide market fit score and Build/Pivot/Kill decision

Be conversational but decisive. Ask clarifying questions. Don't give false hope."""

async def get_ai_response(session_id: str, user_message: str, step: int) -> str:
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"session_{session_id}",
        system_message=VALIDATION_SYSTEM_PROMPT
    )
    chat.with_model("openai", "gpt-5.2")
    
    step_context = f"\nCurrent step: {step} - {STEP_NAMES.get(step, 'Unknown')}\n"
    full_message = step_context + user_message
    
    message = UserMessage(text=full_message)
    response = await chat.send_message(message)
    return response

@api_router.post("/auth/register")
async def register(user_data: UserCreate):
    existing = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    password_hash = bcrypt.hashpw(user_data.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    user = User(
        email=user_data.email,
        name=user_data.name,
        password_hash=password_hash
    )
    
    user_dict = user.model_dump()
    user_dict['created_at'] = user_dict['created_at'].isoformat()
    
    await db.users.insert_one(user_dict)
    
    token = create_token(user.id)
    return {"token": token, "user": {"id": user.id, "email": user.email, "name": user.name}}

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not user.get('password_hash'):
        raise HTTPException(status_code=401, detail="Please use Google login")
    
    if not bcrypt.checkpw(credentials.password.encode('utf-8'), user['password_hash'].encode('utf-8')):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user['id'])
    return {"token": token, "user": {"id": user['id'], "email": user['email'], "name": user.get('name')}}

@api_router.post("/auth/google")
async def google_auth(auth_data: GoogleAuthRequest):
    user = await db.users.find_one({"google_id": auth_data.google_id}, {"_id": 0})
    
    if not user:
        user = User(
            email=auth_data.email,
            name=auth_data.name,
            google_id=auth_data.google_id
        )
        user_dict = user.model_dump()
        user_dict['created_at'] = user_dict['created_at'].isoformat()
        await db.users.insert_one(user_dict)
    else:
        user = User(**user)
    
    token = create_token(user.id)
    return {"token": token, "user": {"id": user.id, "email": user.email, "name": user.name}}

@api_router.get("/auth/me")
async def get_me(user_id: str = Depends(get_current_user)):
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"id": user['id'], "email": user['email'], "name": user.get('name')}

@api_router.post("/sessions", response_model=ValidationSession)
async def create_session(session_data: SessionCreate, user_id: str = Depends(get_current_user)):
    session = ValidationSession(user_id=user_id)
    session_dict = session.model_dump()
    session_dict['created_at'] = session_dict['created_at'].isoformat()
    session_dict['updated_at'] = session_dict['updated_at'].isoformat()
    
    await db.sessions.insert_one(session_dict)
    return session

@api_router.get("/sessions", response_model=List[ValidationSession])
async def get_sessions(user_id: str = Depends(get_current_user)):
    sessions = await db.sessions.find({"user_id": user_id}, {"_id": 0}).sort("created_at", -1).to_list(100)
    for session in sessions:
        if isinstance(session.get('created_at'), str):
            session['created_at'] = datetime.fromisoformat(session['created_at'])
        if isinstance(session.get('updated_at'), str):
            session['updated_at'] = datetime.fromisoformat(session['updated_at'])
    return sessions

@api_router.get("/sessions/{session_id}", response_model=ValidationSession)
async def get_session(session_id: str, user_id: str = Depends(get_current_user)):
    session = await db.sessions.find_one({"id": session_id, "user_id": user_id}, {"_id": 0})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    if isinstance(session.get('created_at'), str):
        session['created_at'] = datetime.fromisoformat(session['created_at'])
    if isinstance(session.get('updated_at'), str):
        session['updated_at'] = datetime.fromisoformat(session['updated_at'])
    
    return session

@api_router.get("/sessions/{session_id}/messages", response_model=List[Message])
async def get_messages(session_id: str, user_id: str = Depends(get_current_user)):
    session = await db.sessions.find_one({"id": session_id, "user_id": user_id}, {"_id": 0})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    messages = await db.messages.find({"session_id": session_id}, {"_id": 0}).sort("timestamp", 1).to_list(1000)
    for msg in messages:
        if isinstance(msg.get('timestamp'), str):
            msg['timestamp'] = datetime.fromisoformat(msg['timestamp'])
    return messages

@api_router.post("/chat/message", response_model=ChatMessageResponse)
async def send_message(request: ChatMessageRequest, user_id: str = Depends(get_current_user)):
    session = await db.sessions.find_one({"id": request.session_id, "user_id": user_id}, {"_id": 0})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    user_msg = Message(
        session_id=request.session_id,
        role="user",
        content=request.message
    )
    user_msg_dict = user_msg.model_dump()
    user_msg_dict['timestamp'] = user_msg_dict['timestamp'].isoformat()
    await db.messages.insert_one(user_msg_dict)
    
    current_step = session.get('current_step', 1)
    
    ai_response = await get_ai_response(request.session_id, request.message, current_step)
    
    ai_msg = Message(
        session_id=request.session_id,
        role="assistant",
        content=ai_response
    )
    ai_msg_dict = ai_msg.model_dump()
    ai_msg_dict['timestamp'] = ai_msg_dict['timestamp'].isoformat()
    await db.messages.insert_one(ai_msg_dict)
    
    if current_step < 5 and len(request.message) > 50:
        if current_step < 4:
            current_step += 1
        
        await db.sessions.update_one(
            {"id": request.session_id},
            {"$set": {"current_step": current_step, "updated_at": datetime.now(timezone.utc).isoformat()}}
        )
    
    return ChatMessageResponse(
        message=ai_response,
        role="assistant",
        current_step=current_step,
        step_name=STEP_NAMES.get(current_step, "Unknown")
    )

@api_router.post("/chat/analyze", response_model=FinalAnalysisResponse)
async def analyze_session(request: FinalAnalysisRequest, user_id: str = Depends(get_current_user)):
    session = await db.sessions.find_one({"id": request.session_id, "user_id": user_id}, {"_id": 0})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    messages = await db.messages.find({"session_id": request.session_id}, {"_id": 0}).sort("timestamp", 1).to_list(1000)
    
    conversation_summary = "\n".join([f"{msg['role']}: {msg['content']}" for msg in messages])
    
    analysis_prompt = f"""Based on this validation conversation, provide a final analysis:

{conversation_summary}

Provide your analysis in this exact format:
SCORE: [0-100]
DECISION: [BUILD/PIVOT/KILL]
REASONING: [2-3 sentences explaining the decision]
NEXT_ACTIONS: [3-5 specific action items, separated by |]
"""
    
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"analysis_{request.session_id}",
        system_message="You are a startup validation expert providing final analysis."
    )
    chat.with_model("openai", "gpt-5.2")
    
    message = UserMessage(text=analysis_prompt)
    response = await chat.send_message(message)
    
    lines = response.strip().split('\n')
    score = 50
    decision = "PIVOT"
    reasoning = "Analysis in progress"
    next_actions = ["Continue customer interviews", "Refine value proposition", "Test pricing models"]
    
    for line in lines:
        if line.startswith("SCORE:"):
            try:
                score = int(line.split(":")[1].strip())
            except:
                pass
        elif line.startswith("DECISION:"):
            decision = line.split(":")[1].strip()
        elif line.startswith("REASONING:"):
            reasoning = line.split(":", 1)[1].strip()
        elif line.startswith("NEXT_ACTIONS:"):
            actions_str = line.split(":", 1)[1].strip()
            next_actions = [a.strip() for a in actions_str.split("|") if a.strip()]
    
    await db.sessions.update_one(
        {"id": request.session_id},
        {"$set": {
            "market_fit_score": score,
            "decision": decision,
            "reasoning": reasoning,
            "next_actions": next_actions,
            "status": "completed",
            "current_step": 5,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return FinalAnalysisResponse(
        market_fit_score=score,
        decision=decision,
        reasoning=reasoning,
        next_actions=next_actions
    )

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()