from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum
import uuid

class GenderType(str, Enum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    name: str
    age: Optional[int] = None
    gender: Optional[GenderType] = None
    height: Optional[float] = None  # in cm
    weight: Optional[float] = None  # in kg
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class UserCreate(BaseModel):
    email: EmailStr
    name: str
    age: Optional[int] = None
    gender: Optional[GenderType] = None
    height: Optional[float] = None
    weight: Optional[float] = None

class UserUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[GenderType] = None
    height: Optional[float] = None
    weight: Optional[float] = None