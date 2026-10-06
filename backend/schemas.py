from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field

ResourceType = Literal["Book", "Article", "Video", "Whitepaper"]

class UserCreate(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(min_length=8)

class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    email: EmailStr

class TagOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str

class ResourceCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    author: str = Field(min_length=1, max_length=200)
    resource_type: ResourceType
    url: str = Field(max_length=2000)
    summary: str | None = None
    rating: int | None = Field(default=None, ge=1, le=5)
    tags: list[str] = []

class ResourceUpdate(BaseModel):
    title: str | None = None
    author: str | None = None
    resource_type: ResourceType | None = None
    url: str | None = None
    summary: str | None = None
    rating: int | None = Field(default=None, ge=1, le=5)
    tags: list[str] | None = None

class ResourceOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    author: str
    resource_type: str
    url: str
    summary: str | None
    rating: int | None
    submitted_by_id: int
    created_at: datetime
    tags: list[TagOut]
    