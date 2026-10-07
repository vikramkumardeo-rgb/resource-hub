from fastapi import Depends, FastAPI, HTTPException, Query, Response
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
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
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

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

def get_or_create_tags(db: Session, names: list[str]) -> list[models.Tag]:
    clean = {n.strip().lower() for n in names if n.strip()}
    tags = []
    for name in sorted(clean):
        tag = db.scalar(select(models.Tag).where(models.Tag.name == name))
        if tag is None:
            tag = models.Tag(name=name)
            db.add(tag)
        tags.append(tag)
    return tags

def get_resource_or_404(db: Session, resource_id: int) -> models.Resource:
    resource = db.get(models.Resource, resource_id)
    if resource is None:
        raise HTTPException(status_code=404, detail="Resource not found")
    return resource

def require_owner(resource: models.Resource, user: models.User) -> None:
    if resource.submitted_by_id != user.id:
        raise HTTPException(status_code=403, detail="You can change only your own resources")

@app.post("/resources", response_model=schemas.ResourceOut, status_code=201)
def create_resource(
    data: schemas.ResourceCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    resource = models.Resource(
        title=data.title,
        author=data.author,
        resource_type=data.resource_type,
        url=data.url,
        summary=data.summary,
        rating=data.rating,
        submitted_by_id=current_user.id,
        tags=get_or_create_tags(db, data.tags),
    )
    db.add(resource)
    db.commit()
    db.refresh(resource)
    return resource 

@app.get("/resources", response_model=list[schemas.ResourceOut])
def list_resources(
    tag: str | None = Query(default=None),
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),
):
    query = select(models.Resource).order_by(models.Resource.created_at.desc())
    if tag:
        query = query.join(models.Resource.tags).where(
            models.Tag.name == tag.strip().lower()
        )
    return db.scalars(query).all()

@app.get("/resources/{resource_id}", response_model=schemas.ResourceOut)
def get_resource(
    resource_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),
):
    return get_resource_or_404(db, resource_id) 

@app.patch("/resources/{resource_id}", response_model=schemas.ResourceOut)
def update_resource(
    resource_id: int,
    data: schemas.ResourceUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    resource = get_resource_or_404(db, resource_id)
    require_owner(resource, current_user)
    changes = data.model_dump(exclude_unset=True)
    tag_names = changes.pop("tags", None)
    for field, value in changes.items():
        if value is None and field not in ("summary", "rating"):
            continue
        setattr(resource, field, value)
        if tag_names is not None:
            resource.tags = get_or_create_tags(db, tag_names)
        db.commit()
        db.refresh(resource)
        return resource

@app.delete("/resources/{resource_id}", status_code=204)
def delete_resource(
        resource_id: int,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user),
    ):
        resource = get_resource_or_404(db, resource_id)
        require_owner(resource, current_user)
        db.delete(resource)
        db.commit()
        return Response(status_code=204)

@app.get("/tags", response_model=list[schemas.TagOut])
def list_tags(
        db: Session = Depends(get_db),
        _: models.User = Depends(get_current_user),
    ):
        return db.scalars(select(models.Tag).order_by(models.Tag.name)).all()