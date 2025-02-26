from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import firebase_admin
from firebase_admin import credentials, db
import os

app = FastAPI()

origins = [
    "http://localhost:3000",    # React app
    "http://localhost:8000",    # FastAPI backend
    "https://restaurant-allergy-manager.vercel.app/" # Vercel deployment
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=600,
)

import os
import json
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials

load_dotenv()

def initialize_firebase():
    try:
        # Get credentials from .env
        cred_json = os.getenv('FIREBASE_CREDENTIALS')
        if not cred_json:
            raise ValueError("FIREBASE_CREDENTIALS not found in .env")
            
        # Parse the JSON string into a dictionary
        cred_dict = json.loads(cred_json)
        
        cred = credentials.Certificate(cred_dict)
        firebase_admin.initialize_app(cred, {
            'databaseURL': os.getenv('FIREBASE_DATABASE_URL')
        })
    except Exception as e:
        print(f"Firebase initialization error: {e}")

initialize_firebase()
# Import and include your router
from routes import router
app.include_router(router)

@app.get("/")
async def root():
    return {"message": "Restaurant Allergy Manager API"}