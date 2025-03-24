from fastapi import APIRouter, HTTPException
from firebase_admin import db
import random
from models import Restaurant, MenuItem
from typing import List, Optional

router = APIRouter()

def generate_id(ref_path: str, length: int = 5, max_attempts: int = 5) -> str:
    """
    Generate a unique numeric ID and verify it doesn't exist in the database.
    
    Args:
        ref_path: Firebase reference path to check for existing IDs
        length: Length of the ID to generate
        max_attempts: Maximum number of attempts to generate a unique ID
    
    Returns:
        str: A unique numeric ID
    
    Raises:
        HTTPException: If unable to generate a unique ID after max_attempts
    """
    ref = db.reference(ref_path)
    
    for _ in range(max_attempts):
        # Generate a number with exact length (e.g., 10000 to 99999 for length=5)
        min_value = 10 ** (length - 1)
        max_value = (10 ** length) - 1
        new_id = str(random.randint(min_value, max_value))
        
        # Check if ID exists in database
        if not ref.child(new_id).get():
            return new_id
    
    raise HTTPException(
        status_code=500,
        detail=f"Unable to generate unique ID after {max_attempts} attempts"
    )

@router.post("/restaurants/")
async def create_restaurant(restaurant: Restaurant):
    try:
        restaurant_id = generate_id('restaurants')
        restaurant_dict = restaurant.dict()
        
        ref = db.reference('restaurants')
        print(f"Attempting to create restaurant: {restaurant_dict}")
        
        ref.child(restaurant_id).set(restaurant_dict)
        print(f"Successfully created restaurant with ID: {restaurant_id}")
        
        return {"id": restaurant_id, **restaurant_dict}
    except Exception as e:
        print(f"Error creating restaurant: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/restaurants")
async def get_restaurants():
    try:
        ref = db.reference('restaurants')
        restaurants_data = ref.get()
        
        if not restaurants_data:
            return []
            
        restaurants_list = [
            {"id": str(restaurant_id), **restaurant_data}
            for restaurant_id, restaurant_data in restaurants_data.items()
        ]
        
        return restaurants_list
    except Exception as e:
        print(f"Error fetching restaurants: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/restaurants/{restaurant_id}/menu")
async def add_menu_item(restaurant_id: str, menu_item: MenuItem):
    try:
        # Verify restaurant exists
        restaurant_ref = db.reference(f'restaurants/{restaurant_id}')
        restaurant_data = restaurant_ref.get()
        
        if not restaurant_data:
            raise HTTPException(status_code=404, detail=f"Restaurant {restaurant_id} not found")
        
        # Validate allergens and dietary categories
        valid_allergens = {
            'milk', 'eggs', 'fish', 'tree_nuts', 'wheat', 
            'crustaceans', 'gluten_free', 'peanuts', 'soybeans', 'sesame'
        }
        valid_dietary_categories = {'vegan', 'vegetarian'}
        
        # Validate allergens
        invalid_allergens = set(menu_item.allergens) - valid_allergens
        if invalid_allergens:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid allergens: {', '.join(invalid_allergens)}"
            )
        
        # Validate dietary categories
        invalid_categories = set(menu_item.dietaryCategories) - valid_dietary_categories
        if invalid_categories:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid dietary categories: {', '.join(invalid_categories)}"
            )
        
        menu_item_id = generate_id('menu_items')
        menu_item_dict = menu_item.dict()
        
        # Add restaurant_id and item_id to the menu item data
        menu_item_data = {
            **menu_item_dict,
            "restaurant_id": restaurant_id,
            "id": menu_item_id
        }
        
        # Store menu item
        menu_ref = db.reference('menu_items')
        menu_ref.child(menu_item_id).set(menu_item_data)
        
        return menu_item_data
        
    except HTTPException as he:
        # Re-raise HTTP exceptions as is
        raise he
    except Exception as e:
        print(f"Error adding menu item: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Add a route to get menu items with filtering capabilities
@router.get("/restaurants/{restaurant_id}/menu")
async def get_menu_items(
    restaurant_id: str,
    dietary_category: Optional[str] = None,
    allergen_free: Optional[List[str]] = None
):
    try:
        # Verify restaurant exists
        restaurant_ref = db.reference(f'restaurants/{restaurant_id}')
        restaurant_data = restaurant_ref.get()
        
        if not restaurant_data:
            raise HTTPException(status_code=404, detail=f"Restaurant {restaurant_id} not found")
        
        # Get all menu items for the restaurant
        menu_ref = db.reference('menu_items')
        menu_items = menu_ref.get()
        
        if not menu_items:
            return []
        
        # Filter menu items for this restaurant
        restaurant_menu = [
            {"id": str(item_id), **item_data}
            for item_id, item_data in menu_items.items()
            if item_data.get('restaurant_id') == restaurant_id
        ]
        
        # Apply dietary category filter if specified
        if dietary_category:
            restaurant_menu = [
                item for item in restaurant_menu
                if dietary_category in item.get('dietaryCategories', [])
            ]
        
        # Apply allergen-free filter if specified
        if allergen_free:
            restaurant_menu = [
                item for item in restaurant_menu
                if not any(allergen in item.get('allergens', []) for allergen in allergen_free)
            ]
        
        return restaurant_menu
        
    except Exception as e:
        print(f"Error fetching menu items: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    
@router.put("/restaurants/{restaurant_id}/menu/{menu_item_id}")
async def update_menu_item(restaurant_id: str, menu_item_id: str, menu_item: MenuItem):
    try:
        # Verify restaurant exists
        restaurant_ref = db.reference(f'restaurants/{restaurant_id}')
        restaurant_data = restaurant_ref.get()
        
        if not restaurant_data:
            raise HTTPException(status_code=404, detail=f"Restaurant {restaurant_id} not found")
        
        # Verify menu item exists and belongs to the restaurant
        menu_ref = db.reference(f'menu_items/{menu_item_id}')
        menu_item_data = menu_ref.get()
        
        if not menu_item_data:
            raise HTTPException(status_code=404, detail=f"Menu item {menu_item_id} not found")
        
        if menu_item_data.get('restaurant_id') != restaurant_id:
            raise HTTPException(
                status_code=403, 
                detail=f"Menu item {menu_item_id} does not belong to restaurant {restaurant_id}"
            )
        
        # Update menu item data while preserving ID and restaurant_id
        menu_item_dict = menu_item.dict()
        updated_menu_item = {
            **menu_item_dict,
            "id": menu_item_id,
            "restaurant_id": restaurant_id
        }
        
        # Update in database
        menu_ref.set(updated_menu_item)
        
        return updated_menu_item
        
    except HTTPException as he:
        # Re-raise HTTP exceptions as is
        raise he
    except Exception as e:
        print(f"Error updating menu item: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/restaurants/{restaurant_id}/menu/{menu_item_id}")
async def delete_menu_item(restaurant_id: str, menu_item_id: str):
    try:
        # Verify restaurant exists
        restaurant_ref = db.reference(f'restaurants/{restaurant_id}')
        restaurant_data = restaurant_ref.get()
        
        if not restaurant_data:
            raise HTTPException(status_code=404, detail=f"Restaurant {restaurant_id} not found")
        
        # Verify menu item exists and belongs to the restaurant
        menu_ref = db.reference(f'menu_items/{menu_item_id}')
        menu_item_data = menu_ref.get()
        
        if not menu_item_data:
            raise HTTPException(status_code=404, detail=f"Menu item {menu_item_id} not found")
        
        if menu_item_data.get('restaurant_id') != restaurant_id:
            raise HTTPException(
                status_code=403, 
                detail=f"Menu item {menu_item_id} does not belong to restaurant {restaurant_id}"
            )
        
        # Delete the menu item
        menu_ref.delete()
        
        return {"message": f"Menu item {menu_item_id} successfully deleted"}
        
    except HTTPException as he:
        # Re-raise HTTP exceptions as is
        raise he
    except Exception as e:
        print(f"Error deleting menu item: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))