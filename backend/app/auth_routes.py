from fastapi import APIRouter, HTTPException, Depends, Request, status
from pydantic import BaseModel
from typing import Optional
from firebase_admin import auth, db
import json
import time
import secrets  # For generating session tokens

auth_router = APIRouter()

# Store session tokens in memory (for simplicity)
# In production, you should use Redis or a database
SESSION_TOKENS = {}

class UserRegister(BaseModel):
    email: str
    password: str
    restaurantName: Optional[str] = None

class LoginData(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    uid: str
    email: str
    token: str
    restaurantId: Optional[str] = None

# Middleware to verify session token
async def verify_token(request: Request):
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authorization header"
        )
    
    token = auth_header.split('Bearer ')[1]
    
    # Check if token exists in our session store
    if token in SESSION_TOKENS:
        return SESSION_TOKENS[token]
    else:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )

@auth_router.post("/register", response_model=UserResponse)
async def register_user(user_data: UserRegister):
    """Register a new user with Firebase Auth"""
    try:
        # Create user in Firebase Auth
        user_record = auth.create_user(
            email=user_data.email,
            password=user_data.password
        )
        
        # Generate a session token
        session_token = secrets.token_hex(32)
        
        # Save session data
        SESSION_TOKENS[session_token] = {
            "uid": user_record.uid,
            "email": user_record.email
        }
        
        # Save additional user data
        user_ref = db.reference(f'users/{user_record.uid}')
        user_ref.set({
            "email": user_data.email,
            "restaurantName": user_data.restaurantName,
            "created_at": int(time.time())
        })
        
        # Try to find existing restaurant for this user
        restaurant_ref = db.reference('restaurants')
        restaurants = restaurant_ref.order_by_child('owner_uid').equal_to(user_record.uid).get()
        
        restaurant_id = None
        if restaurants:
            restaurant_id = list(restaurants.keys())[0]
        
        return {
            "uid": user_record.uid,
            "email": user_record.email,
            "token": session_token,
            "restaurantId": restaurant_id
        }
    except auth.EmailAlreadyExistsError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration error: {str(e)}"
        )

@auth_router.post("/login", response_model=UserResponse)
async def login_user(login_data: LoginData):
    """Login an existing user"""
    try:
        # Firebase Admin SDK doesn't provide direct email/password signin
        # We need to find the user by email first
        user = auth.get_user_by_email(login_data.email)
        
        # Generate a session token
        session_token = secrets.token_hex(32)
        
        # Store session data
        SESSION_TOKENS[session_token] = {
            "uid": user.uid,
            "email": user.email
        }
        
        # Get restaurant ID if exists
        restaurant_ref = db.reference('restaurants')
        restaurants = restaurant_ref.order_by_child('owner_uid').equal_to(user.uid).get()
        
        restaurant_id = None
        if restaurants:
            restaurant_id = list(restaurants.keys())[0]
        
        return {
            "uid": user.uid,
            "email": user.email,
            "token": session_token,
            "restaurantId": restaurant_id
        }
    except auth.UserNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login error: {str(e)}"
        )

@auth_router.get("/user")
async def get_current_user(token_data: dict = Depends(verify_token)):
    """Get current user information"""
    try:
        uid = token_data["uid"]
        
        # Get user data from Firebase Auth
        user = auth.get_user(uid)
        
        # Get restaurant ID if exists
        restaurant_ref = db.reference('restaurants')
        restaurants = restaurant_ref.order_by_child('owner_uid').equal_to(uid).get()
        
        restaurant_id = None
        if restaurants:
            restaurant_id = list(restaurants.keys())[0]
        
        return {
            "uid": uid,
            "email": user.email,
            "restaurantId": restaurant_id
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting user: {str(e)}"
        )
        
# Add a logout endpoint
@auth_router.post("/logout")
async def logout_user(token_data: dict = Depends(verify_token)):
    """Logout a user by invalidating their token"""
    try:
        # Get the token from the authorization header
        auth_header = token_data.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split('Bearer ')[1]
            
            # Remove the token from the session store
            if token in SESSION_TOKENS:
                del SESSION_TOKENS[token]
                
        return {"message": "Logged out successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Logout error: {str(e)}"
        )