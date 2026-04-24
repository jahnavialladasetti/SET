from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import date, timedelta
from dateutil.relativedelta import relativedelta

import models, schemas, database
from routers.auth import get_current_user

router = APIRouter()

def calculate_next_billing_date(start_date: date, billing_cycle: str) -> date:
    today = date.today()
    next_date = start_date
    
    if billing_cycle == "monthly":
        while next_date < today:
            next_date += relativedelta(months=1)
    elif billing_cycle == "yearly":
        while next_date < today:
            next_date += relativedelta(years=1)
            
    return next_date

@router.post("/", response_model=schemas.SubscriptionResponse)
def create_subscription(sub: schemas.SubscriptionCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_user)):
    start_date = sub.start_date or date.today()
    next_billing_date = calculate_next_billing_date(start_date, sub.billing_cycle)
    
    db_sub = models.Subscription(
        name=sub.name,
        amount=sub.amount,
        billing_cycle=sub.billing_cycle,
        start_date=start_date,
        next_billing_date=next_billing_date,
        user_id=current_user.id
    )
    db.add(db_sub)
    db.commit()
    db.refresh(db_sub)
    return db_sub

@router.get("/", response_model=List[schemas.SubscriptionResponse])
def get_subscriptions(db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_user)):
    subs = db.query(models.Subscription).filter(models.Subscription.user_id == current_user.id).all()
    
    # Update next_billing_date dynamically
    today = date.today()
    for sub in subs:
        if sub.next_billing_date < today:
            sub.next_billing_date = calculate_next_billing_date(sub.start_date, sub.billing_cycle)
            db.commit()
            
    return subs

@router.delete("/{sub_id}", status_code=204)
def delete_subscription(sub_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_user)):
    db_sub = db.query(models.Subscription).filter(models.Subscription.id == sub_id, models.Subscription.user_id == current_user.id).first()
    if not db_sub:
        raise HTTPException(status_code=404, detail="Subscription not found")
    
    db.delete(db_sub)
    db.commit()
    return {"ok": True}
