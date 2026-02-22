from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# Contact Form Models
class ContactFormCreate(BaseModel):
    firstName: str
    lastName: str
    email: str
    phone: Optional[str] = None
    subject: Optional[str] = None
    message: str

class ContactForm(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    firstName: str
    lastName: str
    email: str
    phone: Optional[str] = None
    subject: Optional[str] = None
    message: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    status: str = "new"

# Reference Model
class Reference(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    type: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ReferenceCreate(BaseModel):
    name: str
    type: str
    description: Optional[str] = None
    image_url: Optional[str] = None


# Routes
@api_router.get("/")
async def root():
    return {"message": "J&B Tasoitus ja Maalaus API"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks

# Contact Form Routes
@api_router.post("/contact", response_model=ContactForm)
async def submit_contact_form(input: ContactFormCreate):
    """Submit a contact/quote request form"""
    contact_dict = input.model_dump()
    contact_obj = ContactForm(**contact_dict)
    
    doc = contact_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    _ = await db.contact_forms.insert_one(doc)
    
    logging.info(f"New contact form submission from {contact_obj.email}")
    return contact_obj

@api_router.get("/contact", response_model=List[ContactForm])
async def get_contact_forms():
    """Get all contact form submissions (admin use)"""
    forms = await db.contact_forms.find({}, {"_id": 0}).to_list(1000)
    
    for form in forms:
        if isinstance(form.get('created_at'), str):
            form['created_at'] = datetime.fromisoformat(form['created_at'])
    
    return forms

# Reference Routes
@api_router.get("/references", response_model=List[Reference])
async def get_references():
    """Get all project references"""
    references = await db.references.find({}, {"_id": 0}).to_list(100)
    
    for ref in references:
        if isinstance(ref.get('created_at'), str):
            ref['created_at'] = datetime.fromisoformat(ref['created_at'])
    
    return references

@api_router.post("/references", response_model=Reference)
async def create_reference(input: ReferenceCreate):
    """Create a new project reference"""
    ref_dict = input.model_dump()
    ref_obj = Reference(**ref_dict)
    
    doc = ref_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    _ = await db.references.insert_one(doc)
    return ref_obj

@api_router.delete("/references/{reference_id}")
async def delete_reference(reference_id: str):
    """Delete a project reference"""
    result = await db.references.delete_one({"id": reference_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Reference not found")
    
    return {"message": "Reference deleted successfully"}


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
