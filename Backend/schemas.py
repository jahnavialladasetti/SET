from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import date

# User Schemas
class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: EmailStr

    class Config:
        from_attributes = True

# Expense Schemas
class ExpenseCreate(BaseModel):
    amount: float
    description: str
    category: str
    date: Optional[date] = None

class ExpenseResponse(BaseModel):
    id: int
    amount: float
    description: str
    category: str
    date: date
    user_id: int

    class Config:
        from_attributes = True

# Subscription Schemas
class SubscriptionCreate(BaseModel):
    name: str
    amount: float
    billing_cycle: str
    start_date: Optional[date] = None

class SubscriptionResponse(BaseModel):
    id: int
    name: str
    amount: float
    billing_cycle: str
    start_date: date
    next_billing_date: date
    user_id: int

    class Config:
        from_attributes = True

# Token Schema
class Token(BaseModel):
    access_token: str
    token_type: str
