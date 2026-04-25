from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from database import engine, Base
import models
from routers import auth, expenses, subscriptions, goals
from limiter import limiter

# Create the database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="SET API")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Configure CORS
origins = [
    "http://localhost:5173",  # Vite default port
    "http://localhost:5174",  # Vite fallback port
    "http://localhost:3000",  # alternate dev port
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.vercel\.app", # Allow all Vercel deployments
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(expenses.router, prefix="/api/expenses", tags=["expenses"])
app.include_router(subscriptions.router, prefix="/api/subscriptions", tags=["subscriptions"])
app.include_router(goals.router, prefix="/api/goals", tags=["goals"])

@app.get("/")
@limiter.limit("5/minute")
async def read_root(request: Request):
    return {"message": "Welcome to SET API"}
