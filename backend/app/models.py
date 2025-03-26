from pydantic import BaseModel
from typing import List, Optional

class Restaurant(BaseModel):
    name: str
    address: str
    phone: str
    cuisine_type: str

class MenuItem(BaseModel):
    name: str
    description: str
    price: float
    allergens: List[str] = [] 
    dietaryCategories: List[str] = [] 

class UserCreate(BaseModel):
    email: str
    password: str
    display_name: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    uid: str
    email: str
    display_name: Optional[str] = None