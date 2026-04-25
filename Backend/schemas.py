from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Union
import datetime

# User Schemas
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, description="Password must be at least 8 characters long")

class UserUpdate(BaseModel):
    name: Optional[str] = None
    monthly_budget: Optional[float] = None
    currency: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    name: Optional[str] = None
    monthly_budget: Optional[float] = 2000.0
    currency: Optional[str] = "INR"
    is_verified: bool

    class Config:
        from_attributes = True

# Expense Schemas
class ExpenseCreate(BaseModel):
    amount: float
    description: str
    category: str
    date: Union[datetime.date, None] = None
    type: Union[str, None] = "expense"

class ExpenseUpdate(BaseModel):
    amount: Union[float, None] = None
    description: Union[str, None] = None
    category: Union[str, None] = None
    date: Union[datetime.date, None] = None
    type: Union[str, None] = None

class ExpenseResponse(BaseModel):
    id: int
    amount: float
    description: str
    category: str
    date: datetime.date
    type: Optional[str] = "expense"   # nullable in old rows
    user_id: int

    class Config:
        from_attributes = True

# Subscription Schemas
class SubscriptionCreate(BaseModel):
    name: str
    amount: float
    billing_cycle: str
    start_date: Union[datetime.date, None] = None
    color: Union[str, None] = "#a855f7"
    icon: Union[str, None] = "💳"
    category: Union[str, None] = None
    note: Union[str, None] = None

class SubscriptionUpdate(BaseModel):
    name: Union[str, None] = None
    amount: Union[float, None] = None
    billing_cycle: Union[str, None] = None
    start_date: Union[datetime.date, None] = None
    color: Union[str, None] = None
    icon: Union[str, None] = None
    category: Union[str, None] = None
    note: Union[str, None] = None

class SubscriptionResponse(BaseModel):
    id: int
    name: str
    amount: float
    billing_cycle: str
    start_date: datetime.date
    next_billing_date: datetime.date
    color: Optional[str] = "#a855f7"   # nullable in old rows
    icon: Optional[str] = "💳"          # nullable in old rows
    category: Optional[str] = None
    note: Optional[str] = None
    user_id: int

    class Config:
        from_attributes = True

# Token Schema
class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str

class TokenRefresh(BaseModel):
    refresh_token: str

class ForgotPassword(BaseModel):
    email: EmailStr

class ResetPassword(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8, description="Password must be at least 8 characters long")

# Goal Schemas
class GoalCreate(BaseModel):
    name: str
    target_amount: float
    current_amount: Optional[float] = 0.0
    deadline: Optional[datetime.date] = None

class GoalUpdate(BaseModel):
    name: Optional[str] = None
    target_amount: Optional[float] = None
    current_amount: Optional[float] = None
    deadline: Optional[datetime.date] = None

class GoalResponse(BaseModel):
    id: int
    name: str
    target_amount: float
    current_amount: float
    deadline: Optional[datetime.date] = None
    user_id: int

    class Config:
        from_attributes = True
