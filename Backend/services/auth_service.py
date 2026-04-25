from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from datetime import datetime, timedelta
import secrets

import models, schemas, auth

class AuthService:
    @staticmethod
    def create_user(db: Session, user: schemas.UserCreate):
        db_user = db.query(models.User).filter(models.User.email == user.email).first()
        if db_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        hashed_password = auth.get_password_hash(user.password)
        verification_token = secrets.token_urlsafe(32)
        
        new_user = models.User(
            email=user.email, 
            hashed_password=hashed_password,
            verification_token=verification_token,
            is_verified=False
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return new_user

    @staticmethod
    def authenticate_user(db: Session, form_data):
        user = db.query(models.User).filter(models.User.email == form_data.username).first()
        if not user or not auth.verify_password(form_data.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # In a real app, you might want to check if the user is verified
        # if not user.is_verified:
        #     raise HTTPException(status_code=400, detail="Email not verified")

        access_token = auth.create_access_token(data={"sub": user.email})
        refresh_token = auth.create_refresh_token(data={"sub": user.email})
        
        # Store refresh token in DB for rotation/validation
        user.refresh_token = refresh_token
        db.commit()
        
        return {
            "access_token": access_token, 
            "refresh_token": refresh_token,
            "token_type": "bearer"
        }

    @staticmethod
    def refresh_access_token(db: Session, refresh_token: str):
        payload = auth.decode_token(refresh_token)
        if not payload or payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid refresh token")
        
        email = payload.get("sub")
        user = db.query(models.User).filter(models.User.email == email).first()
        
        if not user or user.refresh_token != refresh_token:
            raise HTTPException(status_code=401, detail="Refresh token reuse or invalid")
        
        # Rotate refresh token
        new_access_token = auth.create_access_token(data={"sub": user.email})
        new_refresh_token = auth.create_refresh_token(data={"sub": user.email})
        
        user.refresh_token = new_refresh_token
        db.commit()
        
        return {
            "access_token": new_access_token,
            "refresh_token": new_refresh_token,
            "token_type": "bearer"
        }

    @staticmethod
    def forgot_password(db: Session, email: str):
        user = db.query(models.User).filter(models.User.email == email).first()
        if not user:
            # For security, don't reveal if user exists. Just return OK.
            return {"message": "If the email exists, a reset link has been sent."}
        
        reset_token = secrets.token_urlsafe(32)
        user.reset_token = reset_token
        user.reset_token_expiry = datetime.utcnow() + timedelta(hours=1)
        db.commit()
        
        # Simulate sending email
        print(f"DEBUG: Reset link for {email}: /reset-password?token={reset_token}")
        
        return {"message": "If the email exists, a reset link has been sent."}

    @staticmethod
    def reset_password(db: Session, reset_data: schemas.ResetPassword):
        user = db.query(models.User).filter(models.User.reset_token == reset_data.token).first()
        
        if not user or not user.reset_token_expiry or user.reset_token_expiry < datetime.utcnow():
            raise HTTPException(status_code=400, detail="Invalid or expired reset token")
        
        user.hashed_password = auth.get_password_hash(reset_data.new_password)
        user.reset_token = None
        user.reset_token_expiry = None
        db.commit()
        
        return {"message": "Password reset successfully"}

    @staticmethod
    def verify_email(db: Session, token: str):
        user = db.query(models.User).filter(models.User.verification_token == token).first()
        if not user:
            raise HTTPException(status_code=400, detail="Invalid verification token")
        
        user.is_verified = True
        user.verification_token = None
        db.commit()
        
        return {"message": "Email verified successfully"}
