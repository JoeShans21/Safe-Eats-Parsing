from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import firebase_admin
from firebase_admin import credentials, db
import os

app = FastAPI()

origins = [
    "http://localhost:3000",    # React app
    "http://localhost:8000",    # FastAPI backend
    "https://restaurant-allergy-manager.onrender.com" # Render app
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
        # Check for Render secret file first
        render_cred_path = "/etc/secrets/firebase-credentials.json"
        
        if os.path.exists(render_cred_path):
            print("Using Render secret file for Firebase credentials")
            cred = credentials.Certificate(render_cred_path)
        else:
            # Fall back to environment variable
            print("Render secret file not found, trying environment variable")
            cred_json = os.getenv('FIREBASE_CREDENTIALS')
            if not cred_json:
                print("FIREBASE_CREDENTIALS not found in environment")
                raise ValueError("Firebase credentials not found")
                
            try:
                # Parse the JSON string into a dictionary
                cred_dict = json.loads(cred_json)
                print("Successfully parsed credentials JSON")
                cred = credentials.Certificate(cred_dict)
            except json.JSONDecodeError as json_err:
                print(f"JSON parsing error: {json_err}")
                print(f"First 50 chars of credential string: {cred_json[:50]}...")
                raise
        
        # Get database URL
        database_url = os.environ.get('DATABASE_URL')
        if not database_url:
            print("FIREBASE_DATABASE_URL not found in environment")
            raise ValueError("Firebase database URL not found")
            
        firebase_admin.initialize_app(cred, {
            'databaseURL': database_url
        })
        print("Firebase initialized successfully")
    except Exception as e:
        print(f"Firebase initialization error: {e}")
        import traceback
        traceback.print_exc()

initialize_firebase()
# Import and include your router
from routes import router
app.include_router(router)

@app.get("/")
async def root():
    return {"message": "Restaurant Allergy Manager API"}