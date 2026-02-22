from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import secrets
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Basic Auth for Admin
security = HTTPBasic()

# Admin credentials (in production, use environment variables)
ADMIN_USERNAME = os.environ.get('ADMIN_USERNAME', 'admin')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'jbadmin2024')

def verify_admin(credentials: HTTPBasicCredentials = Depends(security)):
    correct_username = secrets.compare_digest(credentials.username, ADMIN_USERNAME)
    correct_password = secrets.compare_digest(credentials.password, ADMIN_PASSWORD)
    if not (correct_username and correct_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Basic"},
        )
    return credentials.username


# ========== Models ==========

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

# Service Models
class ServiceCreate(BaseModel):
    title: str
    description: str
    icon: str = "Building2"
    image_url: Optional[str] = None
    order: int = 0

class ServiceUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None
    image_url: Optional[str] = None
    order: Optional[int] = None

class Service(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    icon: str = "Building2"
    image_url: Optional[str] = None
    order: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Reference Models
class ReferenceCreate(BaseModel):
    name: str
    type: str
    description: Optional[str] = None
    order: int = 0

class ReferenceUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    description: Optional[str] = None
    order: Optional[int] = None

class Reference(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    type: str
    description: Optional[str] = None
    order: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ========== Public Routes ==========

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

# Contact Form - Public
@api_router.post("/contact", response_model=ContactForm)
async def submit_contact_form(input: ContactFormCreate):
    contact_dict = input.model_dump()
    contact_obj = ContactForm(**contact_dict)
    doc = contact_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    _ = await db.contact_forms.insert_one(doc)
    logging.info(f"New contact form submission from {contact_obj.email}")
    return contact_obj

# Services - Public (Read only)
@api_router.get("/services", response_model=List[Service])
async def get_services():
    services = await db.services.find({}, {"_id": 0}).sort("order", 1).to_list(100)
    for service in services:
        if isinstance(service.get('created_at'), str):
            service['created_at'] = datetime.fromisoformat(service['created_at'])
    return services

# References - Public (Read only)
@api_router.get("/references", response_model=List[Reference])
async def get_references():
    references = await db.references.find({}, {"_id": 0}).sort("order", 1).to_list(100)
    for ref in references:
        if isinstance(ref.get('created_at'), str):
            ref['created_at'] = datetime.fromisoformat(ref['created_at'])
    return references


# ========== Admin Routes ==========

# Admin Auth Check
@api_router.get("/admin/verify")
async def verify_admin_access(username: str = Depends(verify_admin)):
    return {"authenticated": True, "username": username}

# Admin - Contact Forms
@api_router.get("/admin/contacts", response_model=List[ContactForm])
async def admin_get_contacts(username: str = Depends(verify_admin)):
    forms = await db.contact_forms.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    for form in forms:
        if isinstance(form.get('created_at'), str):
            form['created_at'] = datetime.fromisoformat(form['created_at'])
    return forms

@api_router.delete("/admin/contacts/{contact_id}")
async def admin_delete_contact(contact_id: str, username: str = Depends(verify_admin)):
    result = await db.contact_forms.delete_one({"id": contact_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Contact not found")
    return {"message": "Contact deleted successfully"}

# Admin - Services CRUD
@api_router.post("/admin/services", response_model=Service)
async def admin_create_service(input: ServiceCreate, username: str = Depends(verify_admin)):
    service_dict = input.model_dump()
    service_obj = Service(**service_dict)
    doc = service_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    _ = await db.services.insert_one(doc)
    return service_obj

@api_router.put("/admin/services/{service_id}", response_model=Service)
async def admin_update_service(service_id: str, input: ServiceUpdate, username: str = Depends(verify_admin)):
    update_data = {k: v for k, v in input.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    
    result = await db.services.update_one({"id": service_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Service not found")
    
    service = await db.services.find_one({"id": service_id}, {"_id": 0})
    if isinstance(service.get('created_at'), str):
        service['created_at'] = datetime.fromisoformat(service['created_at'])
    return Service(**service)

@api_router.delete("/admin/services/{service_id}")
async def admin_delete_service(service_id: str, username: str = Depends(verify_admin)):
    result = await db.services.delete_one({"id": service_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Service not found")
    return {"message": "Service deleted successfully"}

# Admin - References CRUD
@api_router.post("/admin/references", response_model=Reference)
async def admin_create_reference(input: ReferenceCreate, username: str = Depends(verify_admin)):
    ref_dict = input.model_dump()
    ref_obj = Reference(**ref_dict)
    doc = ref_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    _ = await db.references.insert_one(doc)
    return ref_obj

@api_router.put("/admin/references/{reference_id}", response_model=Reference)
async def admin_update_reference(reference_id: str, input: ReferenceUpdate, username: str = Depends(verify_admin)):
    update_data = {k: v for k, v in input.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    
    result = await db.references.update_one({"id": reference_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Reference not found")
    
    ref = await db.references.find_one({"id": reference_id}, {"_id": 0})
    if isinstance(ref.get('created_at'), str):
        ref['created_at'] = datetime.fromisoformat(ref['created_at'])
    return Reference(**ref)

@api_router.delete("/admin/references/{reference_id}")
async def admin_delete_reference(reference_id: str, username: str = Depends(verify_admin)):
    result = await db.references.delete_one({"id": reference_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Reference not found")
    return {"message": "Reference deleted successfully"}


# ========== Seed Data ==========

@api_router.post("/admin/seed")
async def seed_initial_data(username: str = Depends(verify_admin)):
    """Seed initial services and references data"""
    
    # Check if data already exists
    services_count = await db.services.count_documents({})
    refs_count = await db.references.count_documents({})
    
    seeded = {"services": 0, "references": 0}
    
    if services_count == 0:
        initial_services = [
            {
                "id": str(uuid.uuid4()),
                "title": "Julkisivurappaus",
                "description": "Julkisivun rappaus antaa tasalaatuisen sadetta ja muita sään rasituksia suojaavan pinnan rakenteille. Teemme kokonaisvaltaisia julkisivurappauksia sekä osarappauksia.",
                "icon": "Building2",
                "image_url": "https://images.pexels.com/photos/5691622/pexels-photo-5691622.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
                "order": 1,
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Tasoitustyöt",
                "description": "Tasoitetyöt tulee tehdä huolella ennen uutta pintamateriaalia. Kokenut ammattilainen takaa tasaisen ja siistin lopputuloksen oikeilla välineillä.",
                "icon": "Layers",
                "image_url": "https://images.pexels.com/photos/5691544/pexels-photo-5691544.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
                "order": 2,
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Maalaustyöt",
                "description": "Maalaustyöt sisätiloihin ja ulkopinnoille huolellisesti toiveidenne mukaan. Palvelemme yrityksiä, yksityisasiakkaita ja taloyhtiöitä.",
                "icon": "Paintbrush",
                "image_url": "https://images.pexels.com/photos/5691629/pexels-photo-5691629.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
                "order": 3,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
        ]
        await db.services.insert_many(initial_services)
        seeded["services"] = len(initial_services)
    
    if refs_count == 0:
        initial_refs = [
            {"id": str(uuid.uuid4()), "name": "Mehiläinen Ympyrätalo", "type": "Tasoitus- ja maalaustyöt", "description": "Laaja sisätilojen pintakäsittely terveydenhuollon tiloissa.", "order": 1, "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "name": "Crowne Plaza Hotel", "type": "Tasoitus- ja maalaustyöt", "description": "Hotellin julkisten tilojen ja huoneiden maalaustyöt.", "order": 2, "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "name": "Ressun lukio", "type": "Tasoitus- ja maalaustyöt", "description": "Koulun sisätilojen kunnostus ja maalaus.", "order": 3, "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "name": "Jumbo Stockmann", "type": "Tasoitus- ja maalaustyöt", "description": "Liiketilan pintakäsittely ja viimeistely.", "order": 4, "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "name": "Myllypuro koulu", "type": "Tasoitus- ja maalaustyöt", "description": "Uuden koulun sisäpintojen tasoitus ja maalaus.", "order": 5, "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "name": "Ester1", "type": "Tasoitus- ja maalaustyöt", "description": "Asuinrakennuksen sisäpintojen käsittely.", "order": 6, "created_at": datetime.now(timezone.utc).isoformat()}
        ]
        await db.references.insert_many(initial_refs)
        seeded["references"] = len(initial_refs)
    
    return {"message": "Seed complete", "seeded": seeded}


# Include the router
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
