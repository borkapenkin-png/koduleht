from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, UploadFile, File, Request
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.responses import Response
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import secrets
import base64
import asyncio
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt
from collections import defaultdict
import time
import resend


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Resend setup
resend.api_key = os.environ.get('RESEND_API_KEY')
NOTIFICATION_EMAIL = os.environ.get('NOTIFICATION_EMAIL', 'info@jbtasoitusmaalaus.fi')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', secrets.token_hex(32))
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/admin/login", auto_error=False)

# Rate limiting for login attempts
login_attempts = defaultdict(list)
MAX_LOGIN_ATTEMPTS = 5
LOCKOUT_DURATION = 300  # 5 minutes in seconds

def check_rate_limit(ip: str) -> bool:
    """Check if IP is rate limited. Returns True if allowed, False if blocked."""
    current_time = time.time()
    # Clean old attempts
    login_attempts[ip] = [t for t in login_attempts[ip] if current_time - t < LOCKOUT_DURATION]
    return len(login_attempts[ip]) < MAX_LOGIN_ATTEMPTS

def record_login_attempt(ip: str):
    """Record a failed login attempt."""
    login_attempts[ip].append(time.time())

def get_remaining_lockout(ip: str) -> int:
    """Get remaining lockout time in seconds."""
    if not login_attempts[ip]:
        return 0
    oldest_attempt = min(login_attempts[ip])
    remaining = LOCKOUT_DURATION - (time.time() - oldest_attempt)
    return max(0, int(remaining))

# Password hashing functions
def hash_password(password: str) -> str:
    """Hash a password using bcrypt."""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

# JWT functions
def create_access_token(username: str) -> str:
    """Create a JWT access token."""
    expire = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    payload = {
        "sub": username,
        "exp": expire,
        "iat": datetime.now(timezone.utc)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_access_token(token: str) -> Optional[str]:
    """Decode and verify a JWT token. Returns username if valid."""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload.get("sub")
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

async def get_current_admin(token: str = Depends(oauth2_scheme)) -> str:
    """Dependency to get current authenticated admin user."""
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"}
        )
    username = decode_access_token(token)
    if not username:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"}
        )
    # Verify user still exists in DB
    user = await db.admin_users.find_one({"username": username}, {"_id": 0})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"}
        )
    return username

# Initialize default admin user on startup
async def init_admin_user():
    """Create default admin user if none exists."""
    existing = await db.admin_users.find_one({"username": "admin"})
    if not existing:
        default_password = os.environ.get('ADMIN_PASSWORD', 'jbadmin2024')
        hashed = hash_password(default_password)
        await db.admin_users.insert_one({
            "username": "admin",
            "password_hash": hashed,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        })
        logging.info("Default admin user created")


# ========== MODELS ==========

# Site Settings Model (for Hero, About, Contact sections)
class SiteSettings(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = "site_settings"
    # Hero Section
    hero_slogan: str = "LAATUJOHTAJAT"
    hero_title_1: str = "Ammattitaitoista"
    hero_title_2: str = "maalausta"
    hero_title_3: str = "ja tasoitusta"
    hero_description: str = "Uudellamaalla toimiva luotettava ammattilainen vuodesta 2018. Sisä- ja ulkomaalaukset, julkisivurappaukset sekä tapetoinnit avaimet käteen -periaatteella."
    hero_image_url: Optional[str] = "https://images.pexels.com/photos/5493669/pexels-photo-5493669.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
    hero_badge_1: str = "Kotitalousvähennys"
    hero_badge_2: str = "Tyytyväisyystakuu"
    # About Section
    about_subtitle: str = "TIETOA MEISTÄ"
    about_title: str = "Luotettava kumppani pintaremontteihin"
    about_text_1: str = "J&B Tasoitus Ja Maalaus Oy on Uudellamaalla toimiva luotettava maalaustöiden ammattilainen. Olemme tehneet sisä- ja ulkomaalauksia vuodesta 2018."
    about_text_2: str = "Meiltä sujuu myös katto- ja julkisivumaalaukset, julkisivurappaukset sekä sisäpintojen tapetoinnit. Toiminnassa panostamme asiakaslähtöisyyteen, joustavuuteen ja ensiluokkaiseen työnlaatuun."
    about_text_3: str = "Teemme työt avaimet käteen -periaatteella ja tarjoamme asiakkaillemme tyytyväisyystakuun."
    about_image_url: Optional[str] = "https://images.pexels.com/photos/7941435/pexels-photo-7941435.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
    about_year: str = "2018"
    about_info_title: str = "Muista kotitalousvähennys!"
    about_info_text: str = "Maalaus luokitellaan kunnossapitotyöhön, joka oikeuttaa kotitalousvähennykseen."
    # Contact Section
    contact_subtitle: str = "OTA YHTEYTTÄ"
    contact_title: str = "Yhteystiedot"
    contact_description: str = "Lähetä tarjouspyyntö tai pyydä meidät ilmaiselle arviokäynnille."
    contact_address: str = "Sienitie 52, 00760 Helsinki"
    contact_email: str = "info@jbtasoitusmaalaus.fi"
    contact_phone_1_name: str = "Boris Penkin"
    contact_phone_1: str = "+358 40 054 7270"
    contact_phone_2_name: str = "Joosep Rohusaar"
    contact_phone_2: str = "+358 40 029 8247"
    contact_jobs_title: str = "Työpaikkahaku"
    contact_jobs_text: str = "Haluatko töihin? Lähetä CV ja saatekirje: info@jbtasoitusmaalaus.fi"
    # Theme Settings
    theme_font: str = "Inter"
    theme_color: str = "#0056D2"
    theme_size: str = "medium"  # small, medium, large
    logo_url: Optional[str] = None
    favicon_url: Optional[str] = None
    # Subtitle/Slogan settings
    subtitle_font: str = "Inter"
    subtitle_size: str = "normal"  # small, normal, large
    subtitle_weight: str = "normal"  # normal, medium, bold
    subtitle_spacing: str = "normal"  # normal, wide, wider, widest

class SiteSettingsUpdate(BaseModel):
    hero_slogan: Optional[str] = None
    hero_title_1: Optional[str] = None
    hero_title_2: Optional[str] = None
    hero_title_3: Optional[str] = None
    hero_description: Optional[str] = None
    hero_image_url: Optional[str] = None
    hero_badge_1: Optional[str] = None
    hero_badge_2: Optional[str] = None
    about_subtitle: Optional[str] = None
    about_title: Optional[str] = None
    about_text_1: Optional[str] = None
    about_text_2: Optional[str] = None
    about_text_3: Optional[str] = None
    about_image_url: Optional[str] = None
    about_year: Optional[str] = None
    about_info_title: Optional[str] = None
    about_info_text: Optional[str] = None
    contact_subtitle: Optional[str] = None
    contact_title: Optional[str] = None
    contact_description: Optional[str] = None
    contact_address: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone_1_name: Optional[str] = None
    contact_phone_1: Optional[str] = None
    contact_phone_2_name: Optional[str] = None
    contact_phone_2: Optional[str] = None
    contact_jobs_title: Optional[str] = None
    contact_jobs_text: Optional[str] = None
    # Theme Settings
    theme_font: Optional[str] = None
    theme_color: Optional[str] = None
    theme_size: Optional[str] = None
    logo_url: Optional[str] = None
    favicon_url: Optional[str] = None
    # Subtitle/Slogan settings
    subtitle_font: Optional[str] = None
    subtitle_size: Optional[str] = None
    subtitle_weight: Optional[str] = None
    subtitle_spacing: Optional[str] = None

# Contact Form
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

# Service
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

# Reference
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

# Partner
class PartnerCreate(BaseModel):
    name: str
    image_url: Optional[str] = None
    order: int = 0

class PartnerUpdate(BaseModel):
    name: Optional[str] = None
    image_url: Optional[str] = None
    order: Optional[int] = None

class Partner(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    image_url: Optional[str] = None
    order: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ========== PUBLIC ROUTES ==========

@api_router.get("/")
async def root():
    return {"message": "J&B Tasoitus ja Maalaus API"}

# Site Settings - Public
@api_router.get("/settings", response_model=SiteSettings)
async def get_site_settings():
    settings = await db.site_settings.find_one({"id": "site_settings"}, {"_id": 0})
    if not settings:
        return SiteSettings()
    return SiteSettings(**settings)

# Contact Form - Public
@api_router.post("/contact", response_model=ContactForm)
async def submit_contact_form(input: ContactFormCreate):
    contact_dict = input.model_dump()
    contact_obj = ContactForm(**contact_dict)
    doc = contact_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.contact_forms.insert_one(doc)
    logging.info(f"New contact form from {contact_obj.email}")
    
    # Send email notification
    try:
        html_content = f"""
        <h2>Uusi tarjouspyyntö</h2>
        <table style="border-collapse: collapse; width: 100%;">
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Nimi:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">{contact_obj.firstName} {contact_obj.lastName}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Sähköposti:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">{contact_obj.email}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Puhelin:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">{contact_obj.phone or '-'}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Aihe:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">{contact_obj.subject or '-'}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Viesti:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">{contact_obj.message}</td></tr>
        </table>
        <p style="margin-top: 20px; color: #666;">Tämä viesti lähetettiin J&B Tasoitus ja Maalaus verkkosivuilta.</p>
        """
        
        params = {
            "from": "J&B Tarjouspyynnöt <noreply@jbtasoitusmaalaus.fi>",
            "to": [NOTIFICATION_EMAIL],
            "subject": f"Uusi tarjouspyyntö: {contact_obj.subject or 'Ei aihetta'}",
            "html": html_content,
            "reply_to": contact_obj.email
        }
        
        await asyncio.to_thread(resend.Emails.send, params)
        logging.info(f"Email notification sent to {NOTIFICATION_EMAIL}")
    except Exception as e:
        logging.error(f"Failed to send email notification: {str(e)}")
        # Don't fail the request if email fails - form is still saved
    
    return contact_obj

# Services - Public
@api_router.get("/services", response_model=List[Service])
async def get_services():
    services = await db.services.find({}, {"_id": 0}).sort("order", 1).to_list(100)
    for s in services:
        if isinstance(s.get('created_at'), str):
            s['created_at'] = datetime.fromisoformat(s['created_at'])
    return services

# References - Public
@api_router.get("/references", response_model=List[Reference])
async def get_references():
    refs = await db.references.find({}, {"_id": 0}).sort("order", 1).to_list(100)
    for r in refs:
        if isinstance(r.get('created_at'), str):
            r['created_at'] = datetime.fromisoformat(r['created_at'])
    return refs

# Partners - Public
@api_router.get("/partners", response_model=List[Partner])
async def get_partners():
    partners = await db.partners.find({}, {"_id": 0}).sort("order", 1).to_list(100)
    for p in partners:
        if isinstance(p.get('created_at'), str):
            p['created_at'] = datetime.fromisoformat(p['created_at'])
    return partners

# Images - Public
@api_router.get("/images/{image_id}")
async def get_image(image_id: str):
    image = await db.images.find_one({"id": image_id}, {"_id": 0})
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
    image_data = base64.b64decode(image['data'])
    return Response(content=image_data, media_type=image['content_type'])


# ========== AUTH MODELS ==========

class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    username: str
    expires_in: int = JWT_EXPIRATION_HOURS * 3600

class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str

# ========== ADMIN ROUTES ==========

@api_router.post("/admin/login", response_model=LoginResponse)
async def admin_login(request: Request, login_data: LoginRequest):
    """Login endpoint with rate limiting."""
    client_ip = request.client.host if request.client else "unknown"
    
    # Check rate limit
    if not check_rate_limit(client_ip):
        remaining = get_remaining_lockout(client_ip)
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Liian monta kirjautumisyritystä. Yritä uudelleen {remaining} sekunnin kuluttua."
        )
    
    # Find user in database
    user = await db.admin_users.find_one({"username": login_data.username}, {"_id": 0})
    
    if not user or not verify_password(login_data.password, user["password_hash"]):
        record_login_attempt(client_ip)
        attempts_left = MAX_LOGIN_ATTEMPTS - len(login_attempts[client_ip])
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Väärä käyttäjätunnus tai salasana. {attempts_left} yritystä jäljellä."
        )
    
    # Clear login attempts on success
    login_attempts[client_ip] = []
    
    # Create token
    token = create_access_token(login_data.username)
    
    return LoginResponse(
        access_token=token,
        username=login_data.username
    )

@api_router.get("/admin/verify")
async def verify_admin_access(username: str = Depends(get_current_admin)):
    """Verify token validity."""
    return {"authenticated": True, "username": username}

@api_router.post("/admin/change-password")
async def change_password(
    password_data: PasswordChangeRequest,
    username: str = Depends(get_current_admin)
):
    """Change admin password."""
    # Get current user
    user = await db.admin_users.find_one({"username": username}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="Käyttäjää ei löydy")
    
    # Verify current password
    if not verify_password(password_data.current_password, user["password_hash"]):
        raise HTTPException(status_code=400, detail="Nykyinen salasana on väärin")
    
    # Validate new password
    if len(password_data.new_password) < 8:
        raise HTTPException(status_code=400, detail="Uusi salasana on liian lyhyt (min. 8 merkkiä)")
    
    # Update password
    new_hash = hash_password(password_data.new_password)
    await db.admin_users.update_one(
        {"username": username},
        {"$set": {
            "password_hash": new_hash,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {"message": "Salasana vaihdettu onnistuneesti"}

# Admin - Image Upload
@api_router.post("/admin/upload")
async def upload_image(file: UploadFile = File(...), username: str = Depends(get_current_admin)):
    allowed_types = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Invalid file type")
    
    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 5MB)")
    
    encoded = base64.b64encode(contents).decode('utf-8')
    image_id = str(uuid.uuid4())
    
    await db.images.insert_one({
        "id": image_id,
        "filename": file.filename,
        "content_type": file.content_type,
        "data": encoded,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    return {"id": image_id, "url": f"/api/images/{image_id}", "filename": file.filename}

# Admin - Site Settings
@api_router.put("/admin/settings", response_model=SiteSettings)
async def update_site_settings(input: SiteSettingsUpdate, username: str = Depends(get_current_admin)):
    update_data = {k: v for k, v in input.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    
    await db.site_settings.update_one(
        {"id": "site_settings"},
        {"$set": update_data},
        upsert=True
    )
    
    settings = await db.site_settings.find_one({"id": "site_settings"}, {"_id": 0})
    return SiteSettings(**settings)

# Admin - Contact Forms
@api_router.get("/admin/contacts", response_model=List[ContactForm])
async def admin_get_contacts(username: str = Depends(get_current_admin)):
    forms = await db.contact_forms.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    for f in forms:
        if isinstance(f.get('created_at'), str):
            f['created_at'] = datetime.fromisoformat(f['created_at'])
    return forms

@api_router.delete("/admin/contacts/{contact_id}")
async def admin_delete_contact(contact_id: str, username: str = Depends(get_current_admin)):
    result = await db.contact_forms.delete_one({"id": contact_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Contact not found")
    return {"message": "Contact deleted"}

# Admin - Services CRUD
@api_router.post("/admin/services", response_model=Service)
async def admin_create_service(input: ServiceCreate, username: str = Depends(get_current_admin)):
    service_obj = Service(**input.model_dump())
    doc = service_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.services.insert_one(doc)
    return service_obj

@api_router.put("/admin/services/{service_id}", response_model=Service)
async def admin_update_service(service_id: str, input: ServiceUpdate, username: str = Depends(get_current_admin)):
    update_data = {k: v for k, v in input.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No data")
    result = await db.services.update_one({"id": service_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    service = await db.services.find_one({"id": service_id}, {"_id": 0})
    if isinstance(service.get('created_at'), str):
        service['created_at'] = datetime.fromisoformat(service['created_at'])
    return Service(**service)

@api_router.delete("/admin/services/{service_id}")
async def admin_delete_service(service_id: str, username: str = Depends(get_current_admin)):
    result = await db.services.delete_one({"id": service_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"message": "Deleted"}

# Admin - References CRUD
@api_router.post("/admin/references", response_model=Reference)
async def admin_create_reference(input: ReferenceCreate, username: str = Depends(get_current_admin)):
    ref_obj = Reference(**input.model_dump())
    doc = ref_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.references.insert_one(doc)
    return ref_obj

@api_router.put("/admin/references/{reference_id}", response_model=Reference)
async def admin_update_reference(reference_id: str, input: ReferenceUpdate, username: str = Depends(get_current_admin)):
    update_data = {k: v for k, v in input.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No data")
    result = await db.references.update_one({"id": reference_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    ref = await db.references.find_one({"id": reference_id}, {"_id": 0})
    if isinstance(ref.get('created_at'), str):
        ref['created_at'] = datetime.fromisoformat(ref['created_at'])
    return Reference(**ref)

@api_router.delete("/admin/references/{reference_id}")
async def admin_delete_reference(reference_id: str, username: str = Depends(get_current_admin)):
    result = await db.references.delete_one({"id": reference_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"message": "Deleted"}

# Admin - Partners CRUD
@api_router.post("/admin/partners", response_model=Partner)
async def admin_create_partner(input: PartnerCreate, username: str = Depends(get_current_admin)):
    partner_obj = Partner(**input.model_dump())
    doc = partner_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.partners.insert_one(doc)
    return partner_obj

@api_router.put("/admin/partners/{partner_id}", response_model=Partner)
async def admin_update_partner(partner_id: str, input: PartnerUpdate, username: str = Depends(get_current_admin)):
    update_data = {k: v for k, v in input.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No data")
    result = await db.partners.update_one({"id": partner_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    partner = await db.partners.find_one({"id": partner_id}, {"_id": 0})
    if isinstance(partner.get('created_at'), str):
        partner['created_at'] = datetime.fromisoformat(partner['created_at'])
    return Partner(**partner)

@api_router.delete("/admin/partners/{partner_id}")
async def admin_delete_partner(partner_id: str, username: str = Depends(get_current_admin)):
    result = await db.partners.delete_one({"id": partner_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"message": "Deleted"}

# Admin - Seed Data
@api_router.post("/admin/seed")
async def seed_initial_data(username: str = Depends(get_current_admin)):
    seeded = {"services": 0, "references": 0, "partners": 0, "settings": False}
    
    # Seed settings
    settings_exists = await db.site_settings.find_one({"id": "site_settings"})
    if not settings_exists:
        default_settings = SiteSettings().model_dump()
        await db.site_settings.insert_one(default_settings)
        seeded["settings"] = True
    
    # Seed services
    if await db.services.count_documents({}) == 0:
        services = [
            {"id": str(uuid.uuid4()), "title": "Julkisivurappaus", "description": "Julkisivun rappaus antaa tasalaatuisen sadetta ja muita sään rasituksia suojaavan pinnan rakenteille. Teemme kokonaisvaltaisia julkisivurappauksia sekä osarappauksia.", "icon": "Building2", "image_url": "https://images.pexels.com/photos/5691622/pexels-photo-5691622.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", "order": 1, "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "title": "Tasoitustyöt", "description": "Tasoitetyöt tulee tehdä huolella ennen uutta pintamateriaalia. Kokenut ammattilainen takaa tasaisen ja siistin lopputuloksen oikeilla välineillä.", "icon": "Layers", "image_url": "https://images.pexels.com/photos/5691544/pexels-photo-5691544.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", "order": 2, "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "title": "Maalaustyöt", "description": "Maalaustyöt sisätiloihin ja ulkopinnoille huolellisesti toiveidenne mukaan. Palvelemme yrityksiä, yksityisasiakkaita ja taloyhtiöitä.", "icon": "Paintbrush", "image_url": "https://images.pexels.com/photos/5691629/pexels-photo-5691629.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", "order": 3, "created_at": datetime.now(timezone.utc).isoformat()}
        ]
        await db.services.insert_many(services)
        seeded["services"] = 3
    
    # Seed references
    if await db.references.count_documents({}) == 0:
        refs = [
            {"id": str(uuid.uuid4()), "name": "Mehiläinen Ympyrätalo", "type": "Tasoitus- ja maalaustyöt", "description": "Laaja sisätilojen pintakäsittely terveydenhuollon tiloissa.", "order": 1, "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "name": "Crowne Plaza Hotel", "type": "Tasoitus- ja maalaustyöt", "description": "Hotellin julkisten tilojen ja huoneiden maalaustyöt.", "order": 2, "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "name": "Ressun lukio", "type": "Tasoitus- ja maalaustyöt", "description": "Koulun sisätilojen kunnostus ja maalaus.", "order": 3, "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "name": "Jumbo Stockmann", "type": "Tasoitus- ja maalaustyöt", "description": "Liiketilan pintakäsittely ja viimeistely.", "order": 4, "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "name": "Myllypuro koulu", "type": "Tasoitus- ja maalaustyöt", "description": "Uuden koulun sisäpintojen tasoitus ja maalaus.", "order": 5, "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "name": "Ester1", "type": "Tasoitus- ja maalaustyöt", "description": "Asuinrakennuksen sisäpintojen käsittely.", "order": 6, "created_at": datetime.now(timezone.utc).isoformat()}
        ]
        await db.references.insert_many(refs)
        seeded["references"] = 6
    
    # Seed partners
    if await db.partners.count_documents({}) == 0:
        partners = [
            {"id": str(uuid.uuid4()), "name": "Tyytyväisyystakuu", "image_url": None, "order": 1, "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "name": "Avaimet käteen -palvelu", "image_url": None, "order": 2, "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "name": "Kotitalousvähennys", "image_url": None, "order": 3, "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "name": "Ilmainen arviokäynti", "image_url": None, "order": 4, "created_at": datetime.now(timezone.utc).isoformat()}
        ]
        await db.partners.insert_many(partners)
        seeded["partners"] = 4
    
    return {"message": "Seed complete", "seeded": seeded}


# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

@app.on_event("startup")
async def startup_event():
    await init_admin_user()

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
