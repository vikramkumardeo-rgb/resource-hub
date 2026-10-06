from fastapi import Depends, FastAPI, HTTPException
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

import models
import schemas
from database import get_db
from security import (
    create_access_token,
    decode_taken,
    hash_password,
    verify_password,
)

app = FastAPI(title="Resource Hub API")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
) -> models.User:
    user_id = decode_taken(token)
    user = db.get(models.User, user_id) if user_id else None
    if user is None:
        raise HTTPException(
            status_code=401, 
            detail="Invalid or expired token", 
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

@app.get("/")
def home():
    return {"message": "Resource Hub API is running."}

@app.post("/auth/register", response_model=schemas.UserOut, status_code=201)
def register(data: schemas.UserCreate, db: Session = Depends(get_db)):
    existing = db.scalar(
        select(models.User).where(
            or_(models.User.username == data.username, models.User.email == data.email)
        )
    )
    if existing:
        raise HTTPException(status_code=400, detail="Username or email already registered")
    
    user = models.User(
        username=data.username, 
        email=data.email, 
        hashed_password=hash_password(data.password)
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@app.post("/auth/login")
def login(
    form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
):
    user = db.scalar(select(models.User).where(models.User.username == form.username))
    if user is None or not verify_password(form.password, user.hashed_password):
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return {"access_token": create_access_token(user.id), "token_type": "bearer"}

@app.get("/auth/me", response_model=schemas.UserOut)
def me(current_user: models.User = Depends(get_current_user)):
    return current_user