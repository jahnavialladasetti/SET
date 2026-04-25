from pydantic import BaseModel
from typing import Optional, Union
import datetime
import json

class ExpenseCreate(BaseModel):
    amount: float
    description: str
    category: str
    date: Union[datetime.date, None] = None
    type: Union[str, None] = "expense"

print("Schema:", ExpenseCreate.model_json_schema())

try:
    obj = ExpenseCreate(amount=10.0, description="test", category="Food", date="2026-04-24")
    print("Success:", obj.model_dump())
except Exception as e:
    print("Error:", e)
