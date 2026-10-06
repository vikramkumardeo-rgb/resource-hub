from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, String, Table, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base

resource_tags = Table(
    "resource_tags",
    Base.metadata,
    Column("resource_id", ForeignKey("resources.id", ondelete="CASCADE"), primary_key=True),
    Column("tag_id", ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True), 
)

class User(Base):
    __tablename__ = "users"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(50), unique=True)
    email: Mapped[str] = mapped_column(String(255), unique=True)
    hashed_password: Mapped[str] = mapped_column(String(255))

    resources: Mapped[list["Resource"]] = relationship(back_populates="submitted_by")

class Resource(Base):
    __tablename__ = "resources"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    author: Mapped[str] = mapped_column(String(200))
    resource_type: Mapped[str] = mapped_column(String(50))
    url: Mapped[str] = mapped_column(String(2000))
    summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    rating: Mapped[int | None] = mapped_column(nullable=True)
    submitted_by_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    submitted_by: Mapped["User"] = relationship(back_populates="resources")
    tags: Mapped[list["Tag"]] = relationship(
        secondary=resource_tags, back_populates="resources"
    )

class Tag(Base):
    __tablename__ = "tags"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50), unique=True)

    resources: Mapped[list["Resource"]] = relationship(
        secondary=resource_tags, back_populates="tags"
    )
