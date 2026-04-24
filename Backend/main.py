from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
import models
from routers import auth, expenses, subscriptions

# Create the database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="SpendSense API")

# Configure CORS
origins = [
    "http://localhost:5173", # Vite default port
    "*" # Update this for production
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(expenses.router, prefix="/api/expenses", tags=["expenses"])
app.include_router(subscriptions.router, prefix="/api/subscriptions", tags=["subscriptions"])

@app.get("/")
def read_root():
    return {"message": "Welcome to SpendSense API"}
