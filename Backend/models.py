from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)

    expenses = relationship("Expense", back_populates="owner")
    subscriptions = relationship("Subscription", back_populates="owner")

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float, nullable=False)
    description = Column(String, nullable=False)
    category = Column(String, nullable=False) # e.g. Food, Travel, Entertainment
    date = Column(Date, default=datetime.date.today)
    user_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="expenses")

class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    billing_cycle = Column(String, nullable=False) # "monthly", "yearly"
    start_date = Column(Date, default=datetime.date.today)
    next_billing_date = Column(Date, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="subscriptions")
