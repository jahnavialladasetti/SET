from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

import models, schemas, auth, database
from services.auth_service import AuthService
from limiter import limiter

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = auth.decode_token(token)
    if payload is None or payload.get("type") != "access":
        raise credentials_exception
    
    email: str = payload.get("sub")
    if email is None:
        raise credentials_exception
        
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

@router.post("/signup", response_model=schemas.UserResponse)
@limiter.limit("5/minute")
def signup(request: Request, user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    return AuthService.create_user(db, user)

@router.post("/login", response_model=schemas.Token)
@limiter.limit("10/minute")
def login(request: Request, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    return AuthService.authenticate_user(db, form_data)

@router.post("/refresh", response_model=schemas.Token)
def refresh_token(refresh_data: schemas.TokenRefresh, db: Session = Depends(database.get_db)):
    return AuthService.refresh_access_token(db, refresh_data.refresh_token)

@router.post("/forgot-password")
def forgot_password(data: schemas.ForgotPassword, db: Session = Depends(database.get_db)):
    return AuthService.forgot_password(db, data.email)

@router.post("/reset-password")
def reset_password(data: schemas.ResetPassword, db: Session = Depends(database.get_db)):
    return AuthService.reset_password(db, data)

@router.get("/verify-email/{token}")
def verify_email(token: str, db: Session = Depends(database.get_db)):
    return AuthService.verify_email(db, token)

@router.post("/logout")
def logout(current_user: models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    current_user.refresh_token = None
    db.commit()
    return {"message": "Successfully logged out"}

@router.get("/me", response_model=schemas.UserResponse)
def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=schemas.UserResponse)
def update_user_profile(user_update: schemas.UserUpdate, db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_user)):
    update_data = user_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(current_user, key, value)
    
    db.commit()
    db.refresh(current_user)
    return current_user
