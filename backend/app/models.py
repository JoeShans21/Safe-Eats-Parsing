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
    allergens: List[str] = []  # List of allergen IDs
    dietaryCategories: List[str] = []  # List of dietary category IDs