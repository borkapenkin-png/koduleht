from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, UploadFile, File, Request
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.responses import Response, HTMLResponse
from fastapi.staticfiles import StaticFiles
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
import subprocess


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

# Function to regenerate static HTML files
async def regenerate_static_pages():
    """Regenerate static HTML pages after content changes."""
    try:
        script_path = ROOT_DIR / "generate_static_direct.py"
        if script_path.exists():
            result = subprocess.run(
                ["python", str(script_path)],
                capture_output=True,
                text=True,
                cwd=str(ROOT_DIR),
                timeout=60
            )
            if result.returncode == 0:
                logging.info("Static pages regenerated successfully")
                return True
            else:
                logging.error(f"Static page generation failed: {result.stderr}")
                return False
    except Exception as e:
        logging.error(f"Error regenerating static pages: {e}")
        return False

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

# Password reset endpoint with secret key
@api_router.post("/admin/reset-password-emergency")
async def emergency_password_reset(request: Request):
    """Emergency password reset - requires ADMIN_RESET_KEY environment variable."""
    try:
        body = await request.json()
        reset_key = body.get('reset_key', '')
        new_password = body.get('new_password', 'jbadmin2024')
        
        # Check reset key from environment
        expected_key = os.environ.get('ADMIN_RESET_KEY', 'jb-emergency-reset-2024')
        
        if reset_key != expected_key:
            raise HTTPException(status_code=403, detail="Invalid reset key")
        
        # Update or create admin user
        hashed = hash_password(new_password)
        result = await db.admin_users.update_one(
            {"username": "admin"},
            {"$set": {
                "password_hash": hashed,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }},
            upsert=True
        )
        
        logging.info("Admin password reset via emergency endpoint")
        return {"success": True, "message": "Password reset successful"}
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Password reset error: {e}")
        raise HTTPException(status_code=500, detail="Reset failed")


# ========== MODELS ==========

# Site Settings Model (for Hero, About, Contact sections)
class SiteSettings(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = "site_settings"
    
    # ========== GLOBAL COMPANY INFO ==========
    company_name: str = "J&B Tasoitus ja Maalaus Oy"
    company_phone_primary: str = "+358 40 054 7270"
    company_phone_secondary: str = "+358 40 029 8247"
    company_email: str = "info@jbtasoitusmaalaus.fi"
    company_address: str = "Sienitie 25, 00760 Helsinki"
    company_city: str = "Helsinki"
    company_founded_year: str = "2018"
    company_vat_id: str = "3101220-1"
    # Service Areas
    service_areas: List[str] = ["Helsinki", "Espoo", "Vantaa", "Kauniainen", "Uusimaa"]
    # Global CTA
    cta_primary_text: str = "Pyydä ilmainen arvio"
    cta_secondary_text: str = "Soita nyt"
    cta_phone_text: str = "Pyydä tarjous"
    
    # ========== TRUST BADGES ==========
    trust_badge_1_title: str = "Vuodesta 2018"
    trust_badge_1_subtitle: str = "Luotettava kokemus"
    trust_badge_2_title: str = "Ammattitaitoinen työ"
    trust_badge_2_subtitle: str = "Laadukas lopputulos"
    trust_badge_3_title: str = "Kotitalousvähennys"
    trust_badge_3_subtitle: str = "Hyödynnä veroetu"
    trust_badge_4_title: str = "Tyytyväisyystakuu"
    trust_badge_4_subtitle: str = "100% tyytyväisyys"
    
    # ========== WHY CHOOSE US ==========
    why_choose_us: List[str] = [
        "Ammattitaitoiset ja kokeneet tekijät",
        "Laadukkaat materiaalit ja työvälineet",
        "Selkeä ja läpinäkyvä hinnoittelu",
        "Nopea aikataulu ja joustava palvelu",
        "Siisti ja huolellinen työnjälki",
        "Kotitalousvähennys kelpaa"
    ]
    
    # ========== PROCESS STEPS ==========
    process_step_1_title: str = "Ilmainen arvio"
    process_step_1_desc: str = "Kartoitamme kohteen ja tarpeet"
    process_step_2_title: str = "Tarjous"
    process_step_2_desc: str = "Saat selkeän kirjallisen tarjouksen"
    process_step_3_title: str = "Työn toteutus"
    process_step_3_desc: str = "Ammattitaitoinen toteutus sovitusti"
    process_step_4_title: str = "Valmis lopputulos"
    process_step_4_desc: str = "Tarkistamme yhdessä työn laadun"
    
    # ========== HERO SECTION ==========
    hero_slogan: str = "LAATUJOHTAJAT"
    hero_title_1: str = "Ammattitaitoista"
    hero_title_2: str = "maalausta"
    hero_title_3: str = "ja tasoitusta"
    hero_description: str = "Uudellamaalla toimiva luotettava ammattilainen vuodesta 2018. Sisä- ja ulkomaalaukset, julkisivurappaukset sekä tapetoinnit avaimet käteen -periaatteella."
    hero_image_url: Optional[str] = "https://images.pexels.com/photos/5493669/pexels-photo-5493669.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
    hero_badge_1: str = "Kotitalousvähennys"
    hero_badge_2: str = "Tyytyväisyystakuu"
    
    # ========== ABOUT SECTION ==========
    about_subtitle: str = "TIETOA MEISTÄ"
    about_title: str = "Luotettava kumppani pintaremontteihin"
    about_text_1: str = "J&B Tasoitus Ja Maalaus Oy on Uudellamaalla toimiva luotettava maalaustöiden ammattilainen. Olemme tehneet sisä- ja ulkomaalauksia vuodesta 2018."
    about_text_2: str = "Meiltä sujuu myös katto- ja julkisivumaalaukset, julkisivurappaukset sekä sisäpintojen tapetoinnit. Toiminnassa panostamme asiakaslähtöisyyteen, joustavuuteen ja ensiluokkaiseen työnlaatuun."
    about_text_3: str = "Teemme työt avaimet käteen -periaatteella ja tarjoamme asiakkaillemme tyytyväisyystakuun."
    about_image_url: Optional[str] = "https://images.pexels.com/photos/7941435/pexels-photo-7941435.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
    about_year: str = "2018"
    about_info_title: str = "Muista kotitalousvähennys!"
    about_info_text: str = "Maalaus luokitellaan kunnossapitotyöhön, joka oikeuttaa kotitalousvähennykseen."
    
    # ========== COMPANY STATS ==========
    company_stats: List[dict] = [
        {"value": "300+", "label": "Toteutettua kohdetta"},
        {"value": "3,7M€", "label": "Liikevaihto"},
        {"value": "18", "label": "Ammattilaista"},
        {"value": "40 000+", "label": "Neliömetriä maalattu"}
    ]
    
    # ========== TRUST BADGES ==========
    trust_badges: List[dict] = []
    
    # ========== CONTACT SECTION ==========
    contact_subtitle: str = "OTA YHTEYTTÄ"
    contact_title: str = "Yhteystiedot"
    contact_description: str = "Lähetä tarjouspyyntö tai pyydä meidät ilmaiselle arviokäynnille."
    contact_address: str = "Sienitie 25, 00760 Helsinki"
    contact_email: str = "info@jbtasoitusmaalaus.fi"
    contact_phone_1_name: str = "Boris Penkin"
    contact_phone_1: str = "+358 40 054 7270"
    contact_phone_2_name: str = "Joosep Rohusaar"
    contact_phone_2: str = "+358 40 029 8247"
    contact_jobs_title: str = "Työpaikkahaku"
    contact_jobs_text: str = "Haluatko töihin? Lähetä CV ja saatekirje: info@jbtasoitusmaalaus.fi"
    
    # ========== FOOTER ==========
    footer_text: str = "Laatujohtajat vuodesta 2018"
    footer_copyright: str = "Kaikki oikeudet pidätetään."
    footer_description: str = "Tasoitus- ja maalaustyöt Helsingissä ja Uudellamaalla."
    footer_services: str = "Tasoitustyöt,Sisämaalaus,Julkisivumaalaus,Julkisivurappaus,Mikrosementti,Kattomaalaus,Huoltomaalaus,Parvekemaalaus"
    footer_service_area: str = "Palvelemme asiakkaita Helsingissä ja koko Uudenmaan alueella."
    footer_trust_badge_1: str = ""
    footer_trust_badge_2: str = ""
    
    # ========== REFERENCES SECTION SETTINGS ==========
    references_subtitle: str = "TYÖNÄYTTEITÄ"
    references_title: str = "Referenssit"
    references_description: str = "Olemme toteuttaneet lukuisia projekteja yrityksille, taloyhtiöille ja yksityisille asiakkaille."
    references_initial_count_desktop: int = 4  # How many to show initially on desktop
    references_initial_count_mobile: int = 2  # How many to show initially on mobile
    references_load_more_enabled: bool = True  # Enable "Näytä lisää" button
    references_load_more_mode: str = "all"  # "all" = show all remaining, "batch" = load 4 more
    references_show_more_text: str = "Näytä lisää"
    references_show_less_text: str = "Näytä vähemmän"
    
    # ========== THEME SETTINGS ==========
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
    # Global Company Info
    company_name: Optional[str] = None
    company_phone_primary: Optional[str] = None
    company_phone_secondary: Optional[str] = None
    company_email: Optional[str] = None
    company_address: Optional[str] = None
    company_city: Optional[str] = None
    company_founded_year: Optional[str] = None
    company_vat_id: Optional[str] = None
    service_areas: Optional[List[str]] = None
    cta_primary_text: Optional[str] = None
    cta_secondary_text: Optional[str] = None
    cta_phone_text: Optional[str] = None
    # Trust Badges
    trust_badge_1_title: Optional[str] = None
    trust_badge_1_subtitle: Optional[str] = None
    trust_badge_2_title: Optional[str] = None
    trust_badge_2_subtitle: Optional[str] = None
    trust_badge_3_title: Optional[str] = None
    trust_badge_3_subtitle: Optional[str] = None
    trust_badge_4_title: Optional[str] = None
    trust_badge_4_subtitle: Optional[str] = None
    # Why Choose Us
    why_choose_us: Optional[List[str]] = None
    # Process Steps
    process_step_1_title: Optional[str] = None
    process_step_1_desc: Optional[str] = None
    process_step_2_title: Optional[str] = None
    process_step_2_desc: Optional[str] = None
    process_step_3_title: Optional[str] = None
    process_step_3_desc: Optional[str] = None
    process_step_4_title: Optional[str] = None
    process_step_4_desc: Optional[str] = None
    # Hero
    hero_slogan: Optional[str] = None
    hero_title_1: Optional[str] = None
    hero_title_2: Optional[str] = None
    hero_title_3: Optional[str] = None
    hero_description: Optional[str] = None
    hero_image_url: Optional[str] = None
    hero_badge_1: Optional[str] = None
    hero_badge_2: Optional[str] = None
    # About
    about_subtitle: Optional[str] = None
    about_title: Optional[str] = None
    about_text_1: Optional[str] = None
    about_text_2: Optional[str] = None
    about_text_3: Optional[str] = None
    about_image_url: Optional[str] = None
    about_year: Optional[str] = None
    about_info_title: Optional[str] = None
    about_info_text: Optional[str] = None
    # Company Stats
    company_stats: Optional[List[dict]] = None
    # Trust Badges
    trust_badges: Optional[List[dict]] = None
    # Contact
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
    # Footer
    footer_text: Optional[str] = None
    footer_copyright: Optional[str] = None
    footer_description: Optional[str] = None
    footer_services: Optional[str] = None
    footer_service_area: Optional[str] = None
    footer_trust_badge_1: Optional[str] = None
    footer_trust_badge_2: Optional[str] = None
    # References Section Settings
    references_subtitle: Optional[str] = None
    references_title: Optional[str] = None
    references_description: Optional[str] = None
    references_initial_count_desktop: Optional[int] = None
    references_initial_count_mobile: Optional[int] = None
    references_load_more_enabled: Optional[bool] = None
    references_load_more_mode: Optional[str] = None
    references_show_more_text: Optional[str] = None
    references_show_less_text: Optional[str] = None
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
    # New optional fields for improved form
    services: Optional[List[str]] = None  # Multi-select services
    propertyType: Optional[str] = None  # Kohde
    areaSize: Optional[str] = None  # Pinta-ala
    location: Optional[str] = None  # Sijainti
    timeline: Optional[str] = None  # Aikataulu

class ContactForm(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    firstName: str
    lastName: str
    email: str
    phone: Optional[str] = None
    subject: Optional[str] = None
    message: str
    # New optional fields
    services: Optional[List[str]] = None
    propertyType: Optional[str] = None
    areaSize: Optional[str] = None
    location: Optional[str] = None
    timeline: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    status: str = "new"

# Service
class ServiceCreate(BaseModel):
    title: str
    description: str
    icon: str = "Building2"
    image_url: Optional[str] = None
    image_alt: Optional[str] = None  # ALT text for image
    link_url: Optional[str] = None  # Link to service page, e.g., "tasoitustyot-helsinki"
    order: int = 0

class ServiceUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None
    image_url: Optional[str] = None
    image_alt: Optional[str] = None
    link_url: Optional[str] = None
    order: Optional[int] = None

class Service(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    icon: str = "Building2"
    image_url: Optional[str] = None
    image_alt: Optional[str] = None  # ALT text for image
    link_url: Optional[str] = None  # Link to service page, e.g., "tasoitustyot-helsinki"
    order: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ========== SERVICE PAGE (Full CMS) ==========
class ServiceFeature(BaseModel):
    title: str
    description: str
    icon: str = "Wrench"

class ServicePageCreate(BaseModel):
    # Basic Info
    service_id: str  # Links to Service
    slug: str  # URL slug, e.g., "tasoitustyot-helsinki"
    is_published: bool = True
    # SEO
    seo_title: str
    seo_description: str
    seo_keywords: str = ""
    # Hero Section
    hero_title: str  # H1
    hero_subtitle: str = ""  # Short intro
    hero_image_url: Optional[str] = None
    # Content Sections
    description_title: str = "Palvelun kuvaus"
    description_text: str = ""  # Rich text / HTML
    description_image_url: Optional[str] = None
    # Features
    features_title: str = "Mitä palvelu sisältää"
    features: List[ServiceFeature] = []
    # Why Choose Us (can override global)
    why_title: str = "Miksi valita J&B Tasoitus ja Maalaus"
    why_items: List[str] = []  # Empty = use global
    # Process (can override global)
    process_title: str = "Näin projekti etenee"
    use_global_process: bool = True
    # Service Areas
    areas_title: str = "Palvelualueet"
    areas_text: str = ""  # SEO text about areas
    use_global_areas: bool = True
    # Related Services
    related_service_ids: List[str] = []
    # CTA
    cta_title: str = ""
    cta_text: str = ""

class ServicePageUpdate(BaseModel):
    slug: Optional[str] = None
    is_published: Optional[bool] = None
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    seo_keywords: Optional[str] = None
    hero_title: Optional[str] = None
    hero_subtitle: Optional[str] = None
    hero_image_url: Optional[str] = None
    description_title: Optional[str] = None
    description_text: Optional[str] = None
    description_image_url: Optional[str] = None
    features_title: Optional[str] = None
    features: Optional[List[ServiceFeature]] = None
    why_title: Optional[str] = None
    why_items: Optional[List[str]] = None
    process_title: Optional[str] = None
    use_global_process: Optional[bool] = None
    areas_title: Optional[str] = None
    areas_text: Optional[str] = None
    use_global_areas: Optional[bool] = None
    related_service_ids: Optional[List[str]] = None
    cta_title: Optional[str] = None
    cta_text: Optional[str] = None

class ServicePage(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    service_id: str
    slug: str
    is_published: bool = True
    # SEO
    seo_title: str
    seo_description: str
    seo_keywords: str = ""
    # Hero
    hero_title: str
    hero_subtitle: str = ""
    hero_image_url: Optional[str] = None
    # Content
    description_title: str = "Palvelun kuvaus"
    description_text: str = ""
    description_image_url: Optional[str] = None
    features_title: str = "Mitä palvelu sisältää"
    features: List[ServiceFeature] = []
    why_title: str = "Miksi valita J&B Tasoitus ja Maalaus"
    why_items: List[str] = []
    process_title: str = "Näin projekti etenee"
    use_global_process: bool = True
    areas_title: str = "Palvelualueet"
    areas_text: str = ""
    use_global_areas: bool = True
    related_service_ids: List[str] = []
    cta_title: str = ""
    cta_text: str = ""
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# ========== AREA / CITY MODEL ==========
class AreaCreate(BaseModel):
    name: str  # Helsinki
    slug: str  # helsinki
    name_inessive: str  # Helsingissä (used in titles: "Maalaustyöt Helsingissä")
    is_default: bool = False
    order: int = 0

class AreaUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    name_inessive: Optional[str] = None
    is_default: Optional[bool] = None
    order: Optional[int] = None

class Area(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    slug: str
    name_inessive: str
    is_default: bool = False
    order: int = 0

# Reference - Enhanced with images and contractor support
class ReferenceCreate(BaseModel):
    name: str  # Project title
    type: str  # Service type/category
    description: Optional[str] = None  # Short description
    main_contractor: Optional[str] = None  # Pääurakoitsija / Peatöövötja
    location: Optional[str] = None  # City/location
    year: Optional[str] = None  # Year of project
    cover_image_url: Optional[str] = None  # Main image for card
    cover_image_alt: Optional[str] = None  # ALT text for cover image
    gallery_images: List[str] = []  # Gallery images for detail page
    full_description: Optional[str] = None  # Full text for detail page
    slug: Optional[str] = None  # URL slug for detail page
    is_published: bool = True  # Show/hide
    order: int = 0

class ReferenceUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    description: Optional[str] = None
    main_contractor: Optional[str] = None
    location: Optional[str] = None
    year: Optional[str] = None
    cover_image_url: Optional[str] = None
    cover_image_alt: Optional[str] = None
    gallery_images: Optional[List[str]] = None
    full_description: Optional[str] = None
    slug: Optional[str] = None
    is_published: Optional[bool] = None
    order: Optional[int] = None

class Reference(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    type: str
    description: Optional[str] = None
    main_contractor: Optional[str] = None  # Pääurakoitsija
    location: Optional[str] = None
    year: Optional[str] = None
    cover_image_url: Optional[str] = None
    cover_image_alt: Optional[str] = None  # ALT text for cover image
    gallery_images: List[str] = []
    full_description: Optional[str] = None
    slug: Optional[str] = None
    is_published: bool = True
    order: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Partner
# FAQ System for SEO - Service-specific FAQs
class FAQItem(BaseModel):
    question: str
    answer: str
    order: int = 0

class FAQCreate(BaseModel):
    question: str
    answer: str
    service_id: Optional[str] = None  # None = general FAQ, ID = service-specific
    order: int = 0

class FAQUpdate(BaseModel):
    question: Optional[str] = None
    answer: Optional[str] = None
    service_id: Optional[str] = None
    order: Optional[int] = None
    is_published: Optional[bool] = None

class FAQ(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    question: str
    answer: str
    service_id: Optional[str] = None  # None = general FAQ, ID = service-specific
    order: int = 0
    is_published: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

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

# Dynamic Sitemap - generates XML from database
@api_router.get("/sitemap.xml")
async def get_sitemap():
    from fastapi.responses import Response
    
    base_url = "https://jbtasoitusmaalaus.fi"
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    
    # Start XML
    xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    
    # Homepage
    xml += f'''  <url>
    <loc>{base_url}/</loc>
    <lastmod>{today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>\n'''
    
    # Service pages from database
    service_pages = await db.service_pages.find({}, {"_id": 0, "slug": 1}).to_list(100)
    for page in service_pages:
        xml += f'''  <url>
    <loc>{base_url}/{page["slug"]}/index.html</loc>
    <lastmod>{today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>\n'''
    
    # References page
    xml += f'''  <url>
    <loc>{base_url}/referenssit/index.html</loc>
    <lastmod>{today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>\n'''
    
    # FAQ page
    xml += f'''  <url>
    <loc>{base_url}/ukk/index.html</loc>
    <lastmod>{today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>\n'''
    
    xml += '</urlset>'
    
    return Response(content=xml, media_type="application/xml")

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
    refs = await db.references.find({"$or": [{"is_published": True}, {"is_published": {"$exists": False}}]}, {"_id": 0}).sort("order", 1).to_list(100)
    for r in refs:
        if isinstance(r.get('created_at'), str):
            r['created_at'] = datetime.fromisoformat(r['created_at'])
        # Ensure new fields have defaults for backward compatibility
        r.setdefault('main_contractor', None)
        r.setdefault('location', None)
        r.setdefault('year', None)
        r.setdefault('cover_image_url', None)
        r.setdefault('gallery_images', [])
        r.setdefault('full_description', None)
        r.setdefault('slug', None)
        r.setdefault('is_published', True)
    return refs

@api_router.get("/references/{slug}")
async def get_reference_by_slug(slug: str):
    """Get a single reference by its slug for detail page."""
    ref = await db.references.find_one({"slug": slug, "$or": [{"is_published": True}, {"is_published": {"$exists": False}}]}, {"_id": 0})
    if not ref:
        raise HTTPException(status_code=404, detail="Referenssiä ei löytynyt")
    if isinstance(ref.get('created_at'), str):
        ref['created_at'] = datetime.fromisoformat(ref['created_at'])
    # Ensure new fields have defaults
    ref.setdefault('main_contractor', None)
    ref.setdefault('location', None)
    ref.setdefault('year', None)
    ref.setdefault('cover_image_url', None)
    ref.setdefault('gallery_images', [])
    ref.setdefault('full_description', None)
    ref.setdefault('slug', None)
    ref.setdefault('is_published', True)
    return Reference(**ref)

# Partners - Public
@api_router.get("/partners", response_model=List[Partner])
async def get_partners():
    partners = await db.partners.find({}, {"_id": 0}).sort("order", 1).to_list(100)
    for p in partners:
        if isinstance(p.get('created_at'), str):
            p['created_at'] = datetime.fromisoformat(p['created_at'])
    return partners

# FAQ - Public (for SEO)
@api_router.get("/faqs", response_model=List[FAQ])
async def get_faqs(service_id: Optional[str] = None):
    """Get published FAQs. Optional service_id filter for service-specific FAQs."""
    query = {"$or": [{"is_published": True}, {"is_published": {"$exists": False}}]}
    if service_id:
        query["service_id"] = service_id
    faqs = await db.faqs.find(query, {"_id": 0}).sort("order", 1).to_list(100)
    for f in faqs:
        if isinstance(f.get('created_at'), str):
            f['created_at'] = datetime.fromisoformat(f['created_at'])
        f.setdefault('is_published', True)
        f.setdefault('service_id', None)
    return faqs

@api_router.get("/faqs/grouped")
async def get_faqs_grouped():
    """Get all published FAQs grouped by service for the FAQ hub page."""
    # Get all published FAQs
    faqs = await db.faqs.find(
        {"$or": [{"is_published": True}, {"is_published": {"$exists": False}}]}, 
        {"_id": 0}
    ).sort("order", 1).to_list(200)
    
    # Get all services for names
    services = await db.services.find({}, {"_id": 0, "id": 1, "title": 1}).to_list(100)
    service_map = {s["id"]: s["title"] for s in services}
    
    # Group FAQs
    grouped = {"general": [], "by_service": {}}
    for f in faqs:
        if isinstance(f.get('created_at'), str):
            f['created_at'] = datetime.fromisoformat(f['created_at'])
        f.setdefault('is_published', True)
        f.setdefault('service_id', None)
        
        service_id = f.get('service_id')
        if not service_id:
            grouped["general"].append(f)
        else:
            if service_id not in grouped["by_service"]:
                grouped["by_service"][service_id] = {
                    "service_title": service_map.get(service_id, "Tuntematon palvelu"),
                    "faqs": []
                }
            grouped["by_service"][service_id]["faqs"].append(f)
    
    return grouped

# Images - Public
@api_router.get("/images/{image_id}")
async def get_image(image_id: str):
    image = await db.images.find_one({"id": image_id}, {"_id": 0})
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
    image_data = base64.b64decode(image['data'])
    return Response(content=image_data, media_type=image['content_type'])


# ========== SERVICE PAGES - PUBLIC ==========

@api_router.get("/service-pages", response_model=List[ServicePage])
async def get_service_pages():
    """Get all published service pages."""
    pages = await db.service_pages.find({"is_published": True}, {"_id": 0}).to_list(100)
    for p in pages:
        if isinstance(p.get('created_at'), str):
            p['created_at'] = datetime.fromisoformat(p['created_at'])
        if isinstance(p.get('updated_at'), str):
            p['updated_at'] = datetime.fromisoformat(p['updated_at'])
    return pages

@api_router.get("/service-pages/{slug}", response_model=ServicePage)
async def get_service_page_by_slug(slug: str):
    """Get a single service page by its slug."""
    page = await db.service_pages.find_one({"slug": slug, "is_published": True}, {"_id": 0})
    if not page:
        raise HTTPException(status_code=404, detail="Palvelusivua ei löytynyt")
    if isinstance(page.get('created_at'), str):
        page['created_at'] = datetime.fromisoformat(page['created_at'])
    if isinstance(page.get('updated_at'), str):
        page['updated_at'] = datetime.fromisoformat(page['updated_at'])
    return ServicePage(**page)


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
    
    # Regenerate static pages in background
    import sys
    python_path = sys.executable
    asyncio.create_task(asyncio.to_thread(lambda: subprocess.run(
        [python_path, str(ROOT_DIR / "generate_static_direct.py")],
        capture_output=True, cwd=str(ROOT_DIR), timeout=60
    )))
    
    settings = await db.site_settings.find_one({"id": "site_settings"}, {"_id": 0})
    return SiteSettings(**settings)

# Admin - Regenerate Static Pages
@api_router.post("/admin/regenerate-static")
async def admin_regenerate_static(username: str = Depends(get_current_admin)):
    """Manually trigger static page regeneration."""
    try:
        # Use the same Python interpreter as the running server
        import sys
        python_path = sys.executable
        result = subprocess.run(
            [python_path, str(ROOT_DIR / "generate_static_direct.py")],
            capture_output=True,
            text=True,
            cwd=str(ROOT_DIR),
            timeout=60
        )
        if result.returncode == 0:
            return {"success": True, "message": "Static pages regenerated successfully"}
        else:
            return {"success": False, "message": f"Generation failed: {result.stderr[:500]}"}
    except Exception as e:
        return {"success": False, "message": str(e)}

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

@api_router.get("/admin/references", response_model=List[Reference])
async def admin_get_references(username: str = Depends(get_current_admin)):
    """Get all references including unpublished (for admin)."""
    refs = await db.references.find({}, {"_id": 0}).sort("order", 1).to_list(100)
    for r in refs:
        if isinstance(r.get('created_at'), str):
            r['created_at'] = datetime.fromisoformat(r['created_at'])
        # Ensure new fields have defaults
        r.setdefault('main_contractor', None)
        r.setdefault('location', None)
        r.setdefault('year', None)
        r.setdefault('cover_image_url', None)
        r.setdefault('gallery_images', [])
        r.setdefault('full_description', None)
        r.setdefault('slug', None)
        r.setdefault('is_published', True)
    return refs

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
    # Ensure new fields have defaults
    ref.setdefault('main_contractor', None)
    ref.setdefault('location', None)
    ref.setdefault('year', None)
    ref.setdefault('cover_image_url', None)
    ref.setdefault('gallery_images', [])
    ref.setdefault('full_description', None)
    ref.setdefault('slug', None)
    ref.setdefault('is_published', True)
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


# ========== Admin - FAQ CRUD ==========

@api_router.get("/admin/faqs", response_model=List[FAQ])
async def admin_get_faqs(username: str = Depends(get_current_admin)):
    """Get all FAQs including unpublished."""
    faqs = await db.faqs.find({}, {"_id": 0}).sort("order", 1).to_list(100)
    for f in faqs:
        if isinstance(f.get('created_at'), str):
            f['created_at'] = datetime.fromisoformat(f['created_at'])
        f.setdefault('is_published', True)
        f.setdefault('service_id', None)
    return faqs

@api_router.post("/admin/faqs", response_model=FAQ)
async def admin_create_faq(input: FAQCreate, username: str = Depends(get_current_admin)):
    """Create a new FAQ."""
    faq_obj = FAQ(**input.model_dump())
    doc = faq_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.faqs.insert_one(doc)
    return faq_obj

@api_router.put("/admin/faqs/{faq_id}", response_model=FAQ)
async def admin_update_faq(faq_id: str, input: FAQUpdate, username: str = Depends(get_current_admin)):
    """Update an existing FAQ."""
    update_data = {k: v for k, v in input.model_dump().items() if v is not None}
    # Allow setting service_id to null explicitly
    if 'service_id' in input.model_dump():
        update_data['service_id'] = input.service_id
    if not update_data:
        raise HTTPException(status_code=400, detail="No data")
    result = await db.faqs.update_one({"id": faq_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    faq = await db.faqs.find_one({"id": faq_id}, {"_id": 0})
    if isinstance(faq.get('created_at'), str):
        faq['created_at'] = datetime.fromisoformat(faq['created_at'])
    faq.setdefault('is_published', True)
    faq.setdefault('service_id', None)
    return FAQ(**faq)

@api_router.delete("/admin/faqs/{faq_id}")
async def admin_delete_faq(faq_id: str, username: str = Depends(get_current_admin)):
    """Delete a FAQ."""
    result = await db.faqs.delete_one({"id": faq_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"message": "Deleted"}


# ========== Admin - Service Pages CRUD ==========

@api_router.get("/admin/service-pages", response_model=List[ServicePage])
async def admin_get_service_pages(username: str = Depends(get_current_admin)):
    """Get all service pages (including unpublished)."""
    pages = await db.service_pages.find({}, {"_id": 0}).to_list(100)
    for p in pages:
        if isinstance(p.get('created_at'), str):
            p['created_at'] = datetime.fromisoformat(p['created_at'])
        if isinstance(p.get('updated_at'), str):
            p['updated_at'] = datetime.fromisoformat(p['updated_at'])
    return pages

@api_router.post("/admin/service-pages", response_model=ServicePage)
async def admin_create_service_page(input: ServicePageCreate, username: str = Depends(get_current_admin)):
    """Create a new service page."""
    # Check if slug already exists
    existing = await db.service_pages.find_one({"slug": input.slug})
    if existing:
        raise HTTPException(status_code=400, detail="URL-slug on jo käytössä")
    
    page_obj = ServicePage(**input.model_dump())
    doc = page_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    # Convert features to dicts
    doc['features'] = [f.model_dump() if hasattr(f, 'model_dump') else f for f in doc.get('features', [])]
    await db.service_pages.insert_one(doc)
    return page_obj

@api_router.put("/admin/service-pages/{page_id}", response_model=ServicePage)
async def admin_update_service_page(page_id: str, input: ServicePageUpdate, username: str = Depends(get_current_admin)):
    """Update a service page."""
    update_data = {}
    for k, v in input.model_dump().items():
        if v is not None:
            if k == 'features' and v:
                update_data[k] = [f.model_dump() if hasattr(f, 'model_dump') else f for f in v]
            else:
                update_data[k] = v
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No data")
    
    # Check slug uniqueness if changing
    if 'slug' in update_data:
        existing = await db.service_pages.find_one({"slug": update_data['slug'], "id": {"$ne": page_id}})
        if existing:
            raise HTTPException(status_code=400, detail="URL-slug on jo käytössä")
    
    update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    result = await db.service_pages.update_one({"id": page_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    
    page = await db.service_pages.find_one({"id": page_id}, {"_id": 0})
    if isinstance(page.get('created_at'), str):
        page['created_at'] = datetime.fromisoformat(page['created_at'])
    if isinstance(page.get('updated_at'), str):
        page['updated_at'] = datetime.fromisoformat(page['updated_at'])
    return ServicePage(**page)

@api_router.delete("/admin/service-pages/{page_id}")
async def admin_delete_service_page(page_id: str, username: str = Depends(get_current_admin)):
    """Delete a service page."""
    result = await db.service_pages.delete_one({"id": page_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"message": "Deleted"}


# ========== AREAS / CITIES API ==========

@api_router.get("/areas", response_model=List[Area])
async def get_areas():
    """Get all areas/cities."""
    areas = await db.areas.find({}, {"_id": 0}).sort("order", 1).to_list(100)
    return areas

@api_router.get("/admin/areas", response_model=List[Area])
async def admin_get_areas(username: str = Depends(get_current_admin)):
    """Get all areas for admin."""
    areas = await db.areas.find({}, {"_id": 0}).sort("order", 1).to_list(100)
    return areas

@api_router.post("/admin/areas", response_model=Area)
async def admin_create_area(area: AreaCreate, username: str = Depends(get_current_admin)):
    """Create a new area/city."""
    existing = await db.areas.find_one({"slug": area.slug})
    if existing:
        raise HTTPException(status_code=400, detail="Area with this slug already exists")
    # If marking as default, unset other defaults
    if area.is_default:
        await db.areas.update_many({}, {"$set": {"is_default": False}})
    doc = Area(**area.model_dump()).model_dump()
    await db.areas.insert_one(doc)
    return {k: v for k, v in doc.items() if k != "_id"}

@api_router.put("/admin/areas/{area_id}", response_model=Area)
async def admin_update_area(area_id: str, update: AreaUpdate, username: str = Depends(get_current_admin)):
    """Update an area/city."""
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    # If marking as default, unset other defaults
    if update_data.get("is_default"):
        await db.areas.update_many({"id": {"$ne": area_id}}, {"$set": {"is_default": False}})
    # Check slug uniqueness
    if "slug" in update_data:
        existing = await db.areas.find_one({"slug": update_data["slug"], "id": {"$ne": area_id}})
        if existing:
            raise HTTPException(status_code=400, detail="Area with this slug already exists")
    result = await db.areas.update_one({"id": area_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Area not found")
    area = await db.areas.find_one({"id": area_id}, {"_id": 0})
    return area

@api_router.delete("/admin/areas/{area_id}")
async def admin_delete_area(area_id: str, username: str = Depends(get_current_admin)):
    """Delete an area/city."""
    area = await db.areas.find_one({"id": area_id}, {"_id": 0})
    if not area:
        raise HTTPException(status_code=404, detail="Area not found")
    if area.get("is_default"):
        raise HTTPException(status_code=400, detail="Cannot delete the default area")
    await db.areas.delete_one({"id": area_id})
    return {"message": "Deleted"}


# ============================================================================
# PRICE CALCULATOR CONFIG
# ============================================================================

def get_default_calculator_config():
    return {
        "id": "calculator_config",
        "services": [
            {
                "id": "sisamaalaus",
                "name": "Sisämaalaus",
                "icon": "Paintbrush",
                "description": "Seinien ja kattojen maalaus sisätiloissa",
                "enabled": True,
                "order": 0,
                "base_price_per_m2": 19,
                "steps": [
                    {
                        "id": "target_type",
                        "title": "Millaisesta kohteesta on kyse?",
                        "type": "cards",
                        "options": [
                            {"id": "room", "label": "Huone", "multiplier": 1.0},
                            {"id": "studio", "label": "Yksiö", "multiplier": 1.0},
                            {"id": "2room", "label": "Kaksio", "multiplier": 1.0},
                            {"id": "3room", "label": "Kolmio", "multiplier": 1.0},
                            {"id": "4room", "label": "4h+", "multiplier": 1.0}
                        ]
                    },
                    {
                        "id": "area",
                        "title": "Kuinka suuri pinta-ala on?",
                        "type": "slider",
                        "min": 10,
                        "max": 200,
                        "default": 50,
                        "step": 5,
                        "unit": "m²",
                        "dont_know_options": [
                            {"id": "small", "label": "Pieni", "area_value": 25},
                            {"id": "medium", "label": "Keskikokoinen", "area_value": 55},
                            {"id": "large", "label": "Suuri", "area_value": 90}
                        ]
                    },
                    {
                        "id": "condition",
                        "title": "Missä kunnossa pinnat ovat?",
                        "type": "cards",
                        "options": [
                            {"id": "good", "label": "Hyvässä kunnossa", "description": "Pinnat tasaiset ja siistit", "multiplier": 1.0},
                            {"id": "minor", "label": "Pieniä epätasaisuuksia", "description": "Kolhuja tai pieniä reikiä", "multiplier": 1.15},
                            {"id": "leveling", "label": "Selvästi epätasainen", "description": "Pinnat vaativat käsittelyä", "multiplier": 1.4}
                        ]
                    }
                ],
                "addons": [
                    {"id": "halkeamien_korjaus", "label": "Halkeamien korjaus", "hint": "Korjataan seinien kolhut ja reiät ennen maalausta", "price_per_m2": 12, "enabled": True, "group": "esityot", "badge": "Suositeltu", "warning": "Ilman korjausta epätasaisuudet näkyvät maalipinnan läpi", "auto_trigger": {"step": "condition", "values": ["minor", "leveling"]}},
                    {"id": "wall_leveling", "label": "Seinien tasoitus", "hint": "Tasoitetaan epätasaiset pinnat ennen maalausta", "price_per_m2": 23, "enabled": True, "group": "tarvittaessa", "badge": "Suositeltu", "warning": "Ilman tasoitusta lopputulos ei ole tasainen", "auto_trigger": {"step": "condition", "values": ["leveling"]}},
                    {"id": "ceiling", "label": "Katon maalaus", "hint": "Usein tehdään samalla — säästää kokonaiskustannuksia", "price_per_m2": 22, "enabled": True, "group": "lisapalvelut", "badge": "Usein valitaan"},
                    {"id": "listojen_maalaus", "label": "Listojen maalaus", "hint": "Jalka- ja kattolistan maalaus viimeistelee kokonaisuuden", "price_per_m2": 5, "enabled": True, "group": "lisapalvelut", "badge": "Usein valitaan"},
                    {"id": "ovien_maalaus", "label": "Ovien ja karmien maalaus", "hint": "Ovet ja karmit maalataan samalla kertaa", "fixed_price": 120, "price_label": "120 € / ovipaketti", "enabled": True, "group": "lisapalvelut"},
                    {"id": "extra_color", "label": "Lisäsävy (+1 väri)", "hint": "Yksi lisävärisävy koko kohteeseen, esim. korosteseinä", "fixed_price": 100, "price_label": "100 € / kohde", "enabled": True, "group": "lisapalvelut"}
                ],
                "packages": [
                    {"id": "perus", "label": "Perus", "description": "Perustason maalaustyö", "addon_ids": []},
                    {"id": "suositeltu", "label": "Suositeltu", "description": "Eniten valittu — siisti lopputulos", "addon_ids": ["halkeamien_korjaus", "extra_color"], "default": True},
                    {"id": "premium", "label": "Premium", "description": "Kokonaisvaltainen pintaremontti", "addon_ids": ["halkeamien_korjaus", "wall_leveling", "ceiling", "listojen_maalaus", "extra_color"]}
                ],
                "auto_triggers": [
                    {"if_step": "condition", "if_values": ["minor", "leveling"], "enable_addons": ["halkeamien_korjaus"]},
                    {"if_step": "condition", "if_values": ["leveling"], "enable_addons": ["wall_leveling"]}
                ]
            },
            {
                "id": "tasoitustyot",
                "name": "Tasoitustyöt",
                "icon": "Layers",
                "description": "Seinien ja kattojen tasoitus ammattitaidolla",
                "enabled": True,
                "order": 1,
                "base_price_per_m2": 25,
                "steps": [
                    {
                        "id": "target_type",
                        "title": "Mitä tasoitetaan?",
                        "type": "cards",
                        "options": [
                            {"id": "walls", "label": "Seinät", "multiplier": 1.0},
                            {"id": "ceiling", "label": "Katto", "multiplier": 1.3},
                            {"id": "both", "label": "Seinät + katto", "multiplier": 1.2}
                        ]
                    },
                    {
                        "id": "area",
                        "title": "Kuinka suuri pinta-ala on?",
                        "type": "slider",
                        "min": 10,
                        "max": 200,
                        "default": 50,
                        "step": 5,
                        "unit": "m²",
                        "dont_know_options": [
                            {"id": "small", "label": "Pieni", "area_value": 25},
                            {"id": "medium", "label": "Keskikokoinen", "area_value": 55},
                            {"id": "large", "label": "Suuri", "area_value": 90}
                        ]
                    },
                    {
                        "id": "condition",
                        "title": "Kuinka sileä lopputulos halutaan?",
                        "type": "cards",
                        "options": [
                            {"id": "partial", "label": "Perustaso", "description": "Pienet korjaukset", "multiplier": 0.6},
                            {"id": "full", "label": "Sileä pinta", "description": "Tasainen ja siisti", "multiplier": 1.0},
                            {"id": "heavy", "label": "Erittäin sileä (maalivalmis)", "description": "Huippusileä lopputulos", "multiplier": 1.5}
                        ]
                    }
                ],
                "addons": [
                    {"id": "primer", "label": "Pohjamaalaus", "hint": "Parantaa maalin tarttuvuutta merkittävästi", "price_per_m2": 8, "enabled": True, "group": "esityot", "badge": "Suositeltu", "warning": "Ilman pohjamaalausta maali ei tartu kunnolla"},
                    {"id": "halkeamien_korjaus", "label": "Halkeamien korjaus", "hint": "Korjataan halkeamat ennen tasoitusta", "price_per_m2": 10, "enabled": True, "group": "tarvittaessa", "badge": "Suositeltu", "auto_trigger": {"step": "condition", "values": ["full", "heavy"]}},
                    {"id": "reinforcement", "label": "Vahvikekangas", "hint": "Estää halkeamien uusiutumisen tehokkaasti", "price_per_m2": 12, "enabled": True, "group": "tarvittaessa", "auto_trigger": {"step": "condition", "values": ["heavy"]}},
                    {"id": "kulmasuojat", "label": "Kulmasuojat", "hint": "Suojaavat ulkonurkat kolhuilta", "price_per_m2": 3, "enabled": True, "group": "tarvittaessa"},
                    {"id": "hionta", "label": "Hionta ja pölynhallinta", "hint": "Sileämpi lopputulos ja siistimpi työmaa", "price_per_m2": 6, "enabled": True, "group": "lisapalvelut", "badge": "Usein valitaan"}
                ],
                "packages": [
                    {"id": "perus", "label": "Perus", "description": "Perustason tasoitustyö", "addon_ids": ["primer"]},
                    {"id": "suositeltu", "label": "Suositeltu", "description": "Laadukas lopputulos — eniten valittu", "addon_ids": ["primer", "halkeamien_korjaus", "hionta"], "default": True},
                    {"id": "premium", "label": "Premium", "description": "Huippusileä ja kestävä pinta", "addon_ids": ["primer", "halkeamien_korjaus", "reinforcement", "kulmasuojat", "hionta"]}
                ],
                "auto_triggers": [
                    {"if_step": "condition", "if_values": ["full", "heavy"], "enable_addons": ["halkeamien_korjaus"]},
                    {"if_step": "condition", "if_values": ["heavy"], "enable_addons": ["reinforcement"]}
                ]
            },
            {
                "id": "mikrosementti",
                "name": "Mikrosementti",
                "icon": "Gem",
                "description": "Moderni mikrosementtipinta lattioihin ja seiniin",
                "enabled": True,
                "order": 2,
                "base_price_per_m2": 120,
                "steps": [
                    {
                        "id": "target_type",
                        "title": "Mihin mikrosementti tulee?",
                        "type": "cards",
                        "options": [
                            {"id": "floor", "label": "Lattia", "multiplier": 1.0},
                            {"id": "wall", "label": "Seinä", "multiplier": 0.9},
                            {"id": "bathroom", "label": "Kylpyhuone", "multiplier": 1.3},
                            {"id": "kitchen", "label": "Keittiön välitila", "multiplier": 1.2}
                        ]
                    },
                    {
                        "id": "area",
                        "title": "Kuinka suuri pinta-ala on?",
                        "type": "slider",
                        "min": 2,
                        "max": 80,
                        "default": 15,
                        "step": 1,
                        "unit": "m²",
                        "dont_know_options": [
                            {"id": "small", "label": "Pieni", "area_value": 8},
                            {"id": "medium", "label": "Keskikokoinen", "area_value": 20},
                            {"id": "large", "label": "Suuri", "area_value": 45}
                        ]
                    },
                    {
                        "id": "condition",
                        "title": "Minkälainen alusta on?",
                        "type": "cards",
                        "options": [
                            {"id": "good", "label": "Valmis hyvä alusta", "description": "Tasainen ja puhdas", "multiplier": 1.0},
                            {"id": "prep", "label": "Vaatii esikäsittelyä", "description": "Alusta vaatii valmistelua", "multiplier": 1.2}
                        ]
                    }
                ],
                "addons": [
                    {"id": "sealing", "label": "Suojalakkaus", "hint": "Suojaa pintaa kulutukselta — välttämätön lattioille", "price_per_m2": 15, "enabled": True, "group": "esityot", "badge": "Suositeltu", "warning": "Ilman suojalakkausta pinta kuluu ja likaantuu nopeasti"},
                    {"id": "alustan_tasoitus", "label": "Alustan tasoitus", "hint": "Tasoitetaan epätasainen alusta ennen mikrosementtiä", "price_per_m2": 20, "enabled": True, "group": "tarvittaessa", "badge": "Suositeltu", "auto_trigger": {"step": "condition", "values": ["prep"]}},
                    {"id": "vedeneristys", "label": "Vedeneristys", "hint": "Pakollinen märkätiloissa — estää kosteusvauriot", "price_per_m2": 35, "enabled": True, "group": "tarvittaessa", "badge": "Suositeltu", "auto_trigger": {"step": "target_type", "values": ["bathroom"]}}
                ],
                "packages": [
                    {"id": "perus", "label": "Perus", "description": "Mikrosementtipinta suojalakkauksella", "addon_ids": ["sealing"]},
                    {"id": "suositeltu", "label": "Suositeltu", "description": "Kestävä lopputulos — eniten valittu", "addon_ids": ["sealing", "alustan_tasoitus"], "default": True},
                    {"id": "premium", "label": "Premium", "description": "Täydellinen kokonaisuus märkätiloihin", "addon_ids": ["sealing", "alustan_tasoitus", "vedeneristys"]}
                ],
                "auto_triggers": [
                    {"if_step": "condition", "if_values": ["prep"], "enable_addons": ["alustan_tasoitus"]},
                    {"if_step": "target_type", "if_values": ["bathroom"], "enable_addons": ["vedeneristys"]}
                ]
            },
            {
                "id": "julkisivumaalaus",
                "name": "Julkisivumaalaus",
                "icon": "Home",
                "description": "Talon ulkoseinien maalaus ammattitaidolla",
                "enabled": True,
                "order": 3,
                "base_price_per_m2": 35,
                "steps": [
                    {
                        "id": "target_type",
                        "title": "Minkälainen talo?",
                        "type": "cards",
                        "options": [
                            {"id": "wood", "label": "Puutalo", "multiplier": 1.0},
                            {"id": "brick", "label": "Tiilitalo", "multiplier": 1.1},
                            {"id": "plaster", "label": "Rapattu talo", "multiplier": 1.15}
                        ]
                    },
                    {
                        "id": "area",
                        "title": "Kuinka suuri talo on? (pohjapinta-ala)",
                        "type": "slider",
                        "min": 50,
                        "max": 300,
                        "default": 120,
                        "step": 5,
                        "unit": "m²",
                        "dont_know_options": [
                            {"id": "small", "label": "Alle 100 m²", "area_value": 75},
                            {"id": "medium", "label": "100–150 m²", "area_value": 125},
                            {"id": "large", "label": "150–200 m²", "area_value": 175},
                            {"id": "xlarge", "label": "200 m²+", "area_value": 250}
                        ]
                    },
                    {
                        "id": "floors",
                        "title": "Kuinka monta kerrosta?",
                        "type": "cards",
                        "options": [
                            {"id": "1", "label": "1 kerros", "multiplier": 1.0},
                            {"id": "1.5", "label": "1,5 kerrosta", "multiplier": 1.15},
                            {"id": "2", "label": "2 kerrosta", "multiplier": 1.35},
                            {"id": "3", "label": "3 kerrosta", "multiplier": 1.6}
                        ]
                    },
                    {
                        "id": "condition",
                        "title": "Missä kunnossa pinta on?",
                        "type": "cards",
                        "options": [
                            {"id": "good", "label": "Hyvä kunto", "description": "Ei hilseilyä", "multiplier": 1.0},
                            {"id": "some", "label": "Maali kulunut", "description": "Paikoin kulunut", "multiplier": 1.2},
                            {"id": "heavy", "label": "Paljon hilseilyä", "description": "Usealla seinällä", "multiplier": 1.5}
                        ]
                    }
                ],
                "addons": [
                    {"id": "pesu", "label": "Julkisivun pesu", "hint": "Pestään pinta ennen maalausta — parantaa tarttuvuutta", "price_per_m2": 3, "enabled": True, "group": "esityot", "badge": "Suositeltu", "warning": "Ilman pesua maali tarttuu huonommin ja voi hilseillä aiemmin"},
                    {"id": "vanhan_maalin_poisto", "label": "Vanhan maalin poisto", "hint": "Poistetaan irtonainen ja hilseilevä maali", "price_per_m2": 12, "enabled": True, "group": "tarvittaessa", "badge": "Suositeltu", "auto_trigger": {"step": "condition", "values": ["some", "heavy"]}},
                    {"id": "halkeamien_korjaus", "label": "Halkeamien korjaus", "hint": "Korjataan seinien halkeamat ja vauriot", "price_per_m2": 15, "enabled": True, "group": "tarvittaessa", "auto_trigger": {"step": "condition", "values": ["heavy"]}},
                    {"id": "kaksinkertainen_maalaus", "label": "Kaksinkertainen maalaus", "hint": "Kaksi maalikerrosta kestää pidempään ja näyttää paremmalta", "price_per_m2": 12, "enabled": True, "group": "lisapalvelut", "badge": "Suositeltu", "warning": "Yksi kerros kuluu nopeammin ja vaatii huoltomaalauksen aiemmin"},
                    {"id": "ikkunoiden_maalaus", "label": "Ikkunoiden ja listojen maalaus", "hint": "Viimeistelee ulkonäön — usein tehty samalla", "fixed_price": 150, "price_label": "150 € / kohde", "enabled": True, "group": "lisapalvelut", "badge": "Usein valitaan"},
                    {"id": "wood_repair", "label": "Lautojen vaihto", "hint": "Vaihdetaan vaurioituneet laudat ennen maalausta", "price_per_m2": 45, "enabled": True, "group": "tarvittaessa"}
                ],
                "packages": [
                    {"id": "perus", "label": "Perus", "description": "Perustason julkisivumaalaus", "addon_ids": ["pesu"]},
                    {"id": "suositeltu", "label": "Suositeltu", "description": "Kestävä lopputulos — eniten valittu", "addon_ids": ["pesu", "vanhan_maalin_poisto", "kaksinkertainen_maalaus"], "default": True},
                    {"id": "premium", "label": "Premium", "description": "Kokonaisvaltainen julkisivuremontti", "addon_ids": ["pesu", "vanhan_maalin_poisto", "halkeamien_korjaus", "kaksinkertainen_maalaus", "ikkunoiden_maalaus"]}
                ],
                "auto_triggers": [
                    {"if_step": "condition", "if_values": ["some", "heavy"], "enable_addons": ["vanhan_maalin_poisto"]},
                    {"if_step": "condition", "if_values": ["heavy"], "enable_addons": ["halkeamien_korjaus"]}
                ]
            },
            {
                "id": "kattomaalaus",
                "name": "Kattomaalaus",
                "icon": "Triangle",
                "description": "Katon maalaus ja pinnoitus",
                "enabled": True,
                "order": 4,
                "base_price_per_m2": 18,
                "steps": [
                    {
                        "id": "target_type",
                        "title": "Minkälainen katto?",
                        "type": "cards",
                        "options": [
                            {"id": "metal", "label": "Peltikatto", "multiplier": 1.0},
                            {"id": "tile", "label": "Tiilikatto", "multiplier": 1.4}
                        ]
                    },
                    {
                        "id": "area",
                        "title": "Kuinka suuri katto? (pohjapinta-ala)",
                        "type": "slider",
                        "min": 50,
                        "max": 400,
                        "default": 150,
                        "step": 10,
                        "unit": "m²",
                        "dont_know_options": [
                            {"id": "small", "label": "Pieni", "area_value": 80},
                            {"id": "medium", "label": "Keskikokoinen", "area_value": 150},
                            {"id": "large", "label": "Suuri", "area_value": 250},
                            {"id": "xlarge", "label": "Erittäin suuri", "area_value": 350}
                        ]
                    },
                    {
                        "id": "condition",
                        "title": "Missä kunnossa katto on?",
                        "type": "cards",
                        "conditional_on": "target_type",
                        "conditional_options": {
                            "metal": [
                                {"id": "good", "label": "Hyvä kunto", "description": "Ei ruostetta", "multiplier": 1.0},
                                {"id": "some_rust", "label": "Vähän ruostetta", "description": "Paikoin pintaruostetta", "multiplier": 1.2},
                                {"id": "heavy_rust", "label": "Paljon ruostetta", "description": "Laajaa ruostumista", "multiplier": 1.45}
                            ],
                            "tile": [
                                {"id": "good", "label": "Hyvä kunto", "description": "Puhdas pinta", "multiplier": 1.0},
                                {"id": "moss", "label": "Vähän sammalta", "description": "Pieni sammalkasvusto", "multiplier": 1.15},
                                {"id": "heavy_moss", "label": "Paljon sammalta", "description": "Laaja sammalkasvusto", "multiplier": 1.35}
                            ]
                        },
                        "options": [
                            {"id": "good", "label": "Hyvä kunto", "description": "Puhdas pinta", "multiplier": 1.0},
                            {"id": "moss", "label": "Vähän sammalta", "description": "Pieni sammalkasvusto", "multiplier": 1.15},
                            {"id": "heavy_moss", "label": "Paljon sammalta", "description": "Laaja sammalkasvusto", "multiplier": 1.35}
                        ]
                    }
                ],
                "addons": [
                    {"id": "wash", "label": "Katon pesu", "hint": "Pestään katto ennen maalausta — välttämätön tartunnan kannalta", "price_per_m2": 5, "enabled": True, "group": "esityot", "badge": "Suositeltu", "warning": "Ilman pesua maali ei tartu kunnolla ja irtoaa nopeammin"},
                    {"id": "moss_treatment", "label": "Sammalesto", "hint": "Pidentää katon käyttöikää merkittävästi", "price_per_m2": 4, "enabled": True, "group": "esityot", "badge": "Suositeltu", "auto_trigger": {"step": "condition", "values": ["moss", "heavy_moss"]}},
                    {"id": "ruostekaesittely", "label": "Ruostekäsittely", "hint": "Pysäyttää ruosteen etenemisen ja suojaa peltiä", "price_per_m2": 8, "enabled": True, "group": "tarvittaessa", "badge": "Suositeltu"},
                    {"id": "paikkakorjaukset", "label": "Paikkakorjaukset", "hint": "Korjataan kolhut, reiät ja vauriot ennen maalausta", "price_per_m2": 15, "enabled": True, "group": "tarvittaessa"},
                    {"id": "saumojen_tiivistys", "label": "Saumojen tiivistys", "hint": "Tiivistetään vuotavat saumat — estää vesivauriot", "price_per_m2": 6, "enabled": True, "group": "tarvittaessa"},
                    {"id": "kaksinkertainen_maalaus", "label": "Kaksinkertainen maalaus", "hint": "Kaksi kerrosta kestää huomattavasti pidempään", "price_per_m2": 10, "enabled": True, "group": "lisapalvelut", "badge": "Suositeltu", "warning": "Yksi kerros kuluu nopeammin ja vaatii huoltomaalauksen aiemmin"},
                    {"id": "kourujen_puhdistus", "label": "Kourujen puhdistus", "hint": "Puhdistetaan räystäskourut samalla kertaa", "fixed_price": 150, "price_label": "150 €", "enabled": True, "group": "lisapalvelut", "badge": "Usein valitaan"}
                ],
                "packages": [
                    {"id": "perus", "label": "Perus", "description": "Pesu ja yksi maalikerros", "addon_ids": ["wash"]},
                    {"id": "suositeltu", "label": "Suositeltu", "description": "Kestävä lopputulos — eniten valittu", "addon_ids": ["wash", "moss_treatment", "kaksinkertainen_maalaus"], "default": True},
                    {"id": "premium", "label": "Premium", "description": "Täydellinen katon kunnostus", "addon_ids": ["wash", "moss_treatment", "ruostekaesittely", "kaksinkertainen_maalaus", "kourujen_puhdistus", "saumojen_tiivistys"]}
                ],
                "auto_triggers": [
                    {"if_step": "condition", "if_values": ["moss", "heavy_moss"], "enable_addons": ["wash", "moss_treatment"]},
                    {"if_step": "condition", "if_values": ["some_rust", "heavy_rust"], "enable_addons": ["wash", "ruostekaesittely"]}
                ]
            },
            {
                "id": "julkisivurappaus",
                "name": "Julkisivurappaus",
                "icon": "Building2",
                "description": "Julkisivun rappaus ja pinnoitus",
                "enabled": True,
                "order": 5,
                "base_price_per_m2": 55,
                "steps": [
                    {
                        "id": "target_type",
                        "title": "Minkälainen rappaus?",
                        "type": "cards",
                        "options": [
                            {"id": "thin", "label": "Ohutrappaus", "multiplier": 1.0},
                            {"id": "thick", "label": "Paksurappaus", "multiplier": 1.4},
                            {"id": "repair", "label": "Korjausrappaus", "multiplier": 0.8}
                        ]
                    },
                    {
                        "id": "area",
                        "title": "Kuinka suuri pinta-ala?",
                        "type": "slider",
                        "min": 20,
                        "max": 500,
                        "default": 100,
                        "step": 10,
                        "unit": "m²",
                        "dont_know_options": [
                            {"id": "small", "label": "Pieni", "area_value": 50},
                            {"id": "medium", "label": "Keskikokoinen", "area_value": 120},
                            {"id": "large", "label": "Suuri", "area_value": 250}
                        ]
                    },
                    {
                        "id": "condition",
                        "title": "Minkälainen alusta on?",
                        "type": "cards",
                        "options": [
                            {"id": "good", "label": "Hyvä alusta", "description": "Puhdas ja kiinteä", "multiplier": 1.0},
                            {"id": "repair", "label": "Vaatii korjausta", "description": "Halkeamia tai irtonaista rappausta", "multiplier": 1.3}
                        ]
                    }
                ],
                "addons": [
                    {"id": "groundwork", "label": "Pohjatyöt", "hint": "Alustan esikäsittely ja puhdistus — parantaa tartuntaa", "price_per_m2": 15, "enabled": True, "group": "esityot", "badge": "Suositeltu", "warning": "Ilman pohjatyötä rappaus ei tartu kunnolla"},
                    {"id": "halkeamien_korjaus", "label": "Halkeamien korjaus", "hint": "Korjataan vanhat halkeamat ennen rappausta", "price_per_m2": 18, "enabled": True, "group": "tarvittaessa", "badge": "Suositeltu", "auto_trigger": {"step": "condition", "values": ["repair"]}},
                    {"id": "vanhan_rappauksen_poisto", "label": "Vanhan rappauksen poisto", "hint": "Poistetaan irtonainen ja vaurioitunut rappaus", "price_per_m2": 20, "enabled": True, "group": "tarvittaessa", "auto_trigger": {"step": "condition", "values": ["repair"]}},
                    {"id": "pintakasittely", "label": "Pintakäsittely", "hint": "Viimeistelykäsittely suojaa rappausta ja parantaa ulkonäköä", "price_per_m2": 10, "enabled": True, "group": "lisapalvelut", "badge": "Usein valitaan"}
                ],
                "packages": [
                    {"id": "perus", "label": "Perus", "description": "Perustason rappaus", "addon_ids": ["groundwork"]},
                    {"id": "suositeltu", "label": "Suositeltu", "description": "Kestävä lopputulos — eniten valittu", "addon_ids": ["groundwork", "halkeamien_korjaus", "pintakasittely"], "default": True},
                    {"id": "premium", "label": "Premium", "description": "Kokonaisvaltainen julkisivun kunnostus", "addon_ids": ["groundwork", "halkeamien_korjaus", "vanhan_rappauksen_poisto", "pintakasittely"]}
                ],
                "auto_triggers": [
                    {"if_step": "condition", "if_values": ["repair"], "enable_addons": ["halkeamien_korjaus", "vanhan_rappauksen_poisto"]}
                ]
            }
        ],
        "global_settings": {
            "tax_rate": 25.5,
            "kotitalousvahennys_rate": 35,
            "kotitalousvahennys_max_per_person": 1600,
            "labor_percentage": 70,
            "material_percentage": 30,
            "cta_title": "Pyydä tarkka tarjous (maksuton)",
            "cta_subtitle": "Jätä yhteystietosi ja saat tarkan tarjouksen 24h sisällä – maksuton arviokäynti, ei sido mihinkään.",
            "disclaimer": "Hinnat ovat suuntaa-antavia ja sisältävät ALV:n. Lopullinen hinta varmistuu kartoituskäynnillä."
        }
    }

@api_router.get("/calculator-config")
async def get_calculator_config():
    """Public endpoint - returns calculator configuration."""
    config = await db.calculator_config.find_one({"id": "calculator_config"}, {"_id": 0})
    if not config:
        config = get_default_calculator_config()
        await db.calculator_config.insert_one(config)
        config.pop("_id", None)
    return config

@api_router.get("/admin/calculator-config")
async def admin_get_calculator_config(username: str = Depends(get_current_admin)):
    """Admin endpoint - returns full calculator config."""
    config = await db.calculator_config.find_one({"id": "calculator_config"}, {"_id": 0})
    if not config:
        config = get_default_calculator_config()
        await db.calculator_config.insert_one(config)
        config.pop("_id", None)
    return config

@api_router.put("/admin/calculator-config")
async def admin_update_calculator_config(config: dict, username: str = Depends(get_current_admin)):
    """Admin endpoint - update calculator configuration."""
    config["id"] = "calculator_config"
    await db.calculator_config.replace_one(
        {"id": "calculator_config"},
        config,
        upsert=True
    )
    updated = await db.calculator_config.find_one({"id": "calculator_config"}, {"_id": 0})
    return updated

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
    
    # Seed areas/cities
    if await db.areas.count_documents({}) == 0:
        areas = [
            {"id": str(uuid.uuid4()), "name": "Helsinki", "slug": "helsinki", "name_inessive": "Helsingissä", "is_default": True, "order": 0},
            {"id": str(uuid.uuid4()), "name": "Espoo", "slug": "espoo", "name_inessive": "Espoossa", "is_default": False, "order": 1},
            {"id": str(uuid.uuid4()), "name": "Vantaa", "slug": "vantaa", "name_inessive": "Vantaalla", "is_default": False, "order": 2},
            {"id": str(uuid.uuid4()), "name": "Kauniainen", "slug": "kauniainen", "name_inessive": "Kauniaisissa", "is_default": False, "order": 3},
        ]
        await db.areas.insert_many(areas)
        seeded["areas"] = 4
    
    # Seed FAQs
    if await db.faqs.count_documents({}) == 0:
        faqs = [
            {"id": str(uuid.uuid4()), "question": "Mitä kotitalousvähennys tarkoittaa maalaustyössä?", "answer": "Maalaustyöt luokitellaan kunnossapitotyöksi, josta voit saada kotitalousvähennystä. Vähennys on 40% työn osuudesta, enintään 2250€ vuodessa. Materiaalikustannukset eivät kuulu vähennykseen.", "order": 1, "is_published": True, "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "question": "Kuinka nopeasti voitte aloittaa projektin?", "answer": "Yleensä pystymme aloittamaan työt 1-2 viikon kuluessa yhteydenotosta. Kiireellisissä tapauksissa voimme usein järjestää nopeammankin aikataulun. Ota yhteyttä niin sovitaan teille sopiva ajankohta.", "order": 2, "is_published": True, "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "question": "Annatteko takuun työlle?", "answer": "Kyllä, tarjoamme kaikille töillemme tyytyväisyystakuun. Käytämme laadukkaita materiaaleja ja huolellista työtapaa varmistaaksemme kestävän lopputuloksen. Jos huomaat ongelmia, korjaamme ne veloituksetta.", "order": 3, "is_published": True, "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "question": "Millä alueilla toimitte?", "answer": "Palvelemme asiakkaita koko Uudenmaan alueella: Helsinki, Espoo, Vantaa, Kauniainen ja lähikunnat. Isommissa projekteissa toimimme myös muualla Etelä-Suomessa.", "order": 4, "is_published": True, "created_at": datetime.now(timezone.utc).isoformat()}
        ]
        await db.faqs.insert_many(faqs)
        seeded["faqs"] = 4
    
    return {"message": "Seed complete", "seeded": seeded}


# ========== DATA EXPORT/IMPORT FOR SYNC ==========

@api_router.get("/admin/export-all-data")
async def export_all_data(username: str = Depends(get_current_admin)):
    """Export all site data as JSON for backup or sync to another environment."""
    try:
        data = {
            "exported_at": datetime.now(timezone.utc).isoformat(),
            "settings": await db.settings.find_one({}, {"_id": 0}) or {},
            "services": await db.services.find({}, {"_id": 0}).to_list(1000),
            "references": await db.references.find({}, {"_id": 0}).to_list(1000),
            "partners": await db.partners.find({}, {"_id": 0}).to_list(1000),
            "faqs": await db.faqs.find({}, {"_id": 0}).to_list(1000),
            "service_pages": await db.service_pages.find({}, {"_id": 0}).to_list(1000),
        }
        return data
    except Exception as e:
        logging.error(f"Export error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/admin/import-all-data")
async def import_all_data(request: Request, username: str = Depends(get_current_admin)):
    """Import all site data from JSON. WARNING: This replaces all existing data!"""
    try:
        data = await request.json()
        
        # Validate data structure
        if not isinstance(data, dict):
            raise HTTPException(status_code=400, detail="Invalid data format")
        
        imported = []
        
        # Import settings
        if "settings" in data and data["settings"]:
            await db.settings.delete_many({})
            await db.settings.insert_one(data["settings"])
            imported.append("settings")
        
        # Import services
        if "services" in data and data["services"]:
            await db.services.delete_many({})
            if data["services"]:
                await db.services.insert_many(data["services"])
            imported.append(f"services ({len(data['services'])})")
        
        # Import references
        if "references" in data and data["references"]:
            await db.references.delete_many({})
            if data["references"]:
                await db.references.insert_many(data["references"])
            imported.append(f"references ({len(data['references'])})")
        
        # Import partners
        if "partners" in data and data["partners"]:
            await db.partners.delete_many({})
            if data["partners"]:
                await db.partners.insert_many(data["partners"])
            imported.append(f"partners ({len(data['partners'])})")
        
        # Import FAQs
        if "faqs" in data and data["faqs"]:
            await db.faqs.delete_many({})
            if data["faqs"]:
                await db.faqs.insert_many(data["faqs"])
            imported.append(f"faqs ({len(data['faqs'])})")
        
        # Import service pages
        if "service_pages" in data and data["service_pages"]:
            await db.service_pages.delete_many({})
            if data["service_pages"]:
                await db.service_pages.insert_many(data["service_pages"])
            imported.append(f"service_pages ({len(data['service_pages'])})")
        
        logging.info(f"Data imported: {imported}")
        return {"success": True, "imported": imported}
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Import error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# FAQ-only export/import endpoints
@api_router.get("/admin/export-faqs")
async def export_faqs_only(username: str = Depends(get_current_admin)):
    """Export only FAQs as JSON."""
    try:
        data = {
            "exported_at": datetime.now(timezone.utc).isoformat(),
            "type": "faqs_only",
            "faqs": await db.faqs.find({}, {"_id": 0}).to_list(1000),
        }
        return data
    except Exception as e:
        logging.error(f"FAQ export error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/admin/import-faqs")
async def import_faqs_only(request: Request, username: str = Depends(get_current_admin)):
    """Import only FAQs from JSON. Replaces existing FAQs."""
    try:
        data = await request.json()
        
        if "faqs" not in data or not isinstance(data["faqs"], list):
            raise HTTPException(status_code=400, detail="Invalid data format - 'faqs' array required")
        
        # Delete existing FAQs and import new ones
        await db.faqs.delete_many({})
        if data["faqs"]:
            await db.faqs.insert_many(data["faqs"])
        
        logging.info(f"FAQs imported: {len(data['faqs'])} items")
        return {"success": True, "imported_count": len(data["faqs"])}
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"FAQ import error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Public export endpoint (no auth required, for easy sync)
@api_router.get("/export-public-data")
async def export_public_data():
    """Export public site data (no admin required) - for syncing between environments."""
    sync_key = os.environ.get('DATA_SYNC_KEY', 'jb-sync-2024')
    try:
        data = {
            "exported_at": datetime.now(timezone.utc).isoformat(),
            "sync_key_required": sync_key,
            "settings": await db.settings.find_one({}, {"_id": 0}) or {},
            "services": await db.services.find({}, {"_id": 0}).to_list(1000),
            "references": await db.references.find({}, {"_id": 0}).to_list(1000),
            "partners": await db.partners.find({}, {"_id": 0}).to_list(1000),
            "faqs": await db.faqs.find({}, {"_id": 0}).to_list(1000),
            "service_pages": await db.service_pages.find({}, {"_id": 0}).to_list(1000),
        }
        return data
    except Exception as e:
        return {"error": str(e)}

@api_router.post("/import-with-key")
async def import_with_sync_key(request: Request):
    """Import data with sync key (no admin login required)."""
    try:
        body = await request.json()
        sync_key = body.get('sync_key', '')
        data = body.get('data', {})
        
        expected_key = os.environ.get('DATA_SYNC_KEY', 'jb-sync-2024')
        if sync_key != expected_key:
            raise HTTPException(status_code=403, detail="Invalid sync key")
        
        imported = []
        
        if "settings" in data and data["settings"]:
            await db.settings.delete_many({})
            await db.settings.insert_one(data["settings"])
            imported.append("settings")
        
        if "services" in data:
            await db.services.delete_many({})
            if data["services"]:
                await db.services.insert_many(data["services"])
            imported.append(f"services ({len(data.get('services', []))})")
        
        if "references" in data:
            await db.references.delete_many({})
            if data["references"]:
                await db.references.insert_many(data["references"])
            imported.append(f"references ({len(data.get('references', []))})")
        
        if "partners" in data:
            await db.partners.delete_many({})
            if data["partners"]:
                await db.partners.insert_many(data["partners"])
            imported.append(f"partners ({len(data.get('partners', []))})")
        
        if "faqs" in data:
            await db.faqs.delete_many({})
            if data["faqs"]:
                await db.faqs.insert_many(data["faqs"])
            imported.append(f"faqs ({len(data.get('faqs', []))})")
        
        if "service_pages" in data:
            await db.service_pages.delete_many({})
            if data["service_pages"]:
                await db.service_pages.insert_many(data["service_pages"])
            imported.append(f"service_pages ({len(data.get('service_pages', []))})")
        
        return {"success": True, "imported": imported}
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Import with key error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Include router
app.include_router(api_router)

# ============================================================================
# SSR (Server-Side Rendering) for SEO-friendly public pages
# ============================================================================
from ssr import (
    render_home_page, render_service_page, render_references_page, 
    render_faq_page, render_404_page, handle_dynamic_slug, 
    is_system_route, FIXED_SERVICE_SLUGS
)

# Get base URL for canonical links
def get_base_url(request: Request) -> str:
    """Get the base URL from request or environment."""
    # Prefer environment variable for production
    prod_url = os.environ.get('SITE_URL', '')
    if prod_url:
        return prod_url.rstrip('/')
    # Fallback to request URL
    return str(request.base_url).rstrip('/')

# Mount static files from React build
FRONTEND_BUILD_DIR = Path("/app/frontend/build")
if FRONTEND_BUILD_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(FRONTEND_BUILD_DIR / "static")), name="static")

# SSR Routes - these must come BEFORE the catch-all SPA route
# Priority: API > Fixed public routes > Dynamic slugs > SPA fallback

@app.get("/", response_class=HTMLResponse)
async def ssr_home(request: Request):
    """Render home page with SSR for SEO."""
    base_url = get_base_url(request)
    return await render_home_page(db, request, base_url)

@app.get("/referenssit", response_class=HTMLResponse)
async def ssr_references(request: Request):
    """Render references page with SSR for SEO."""
    base_url = get_base_url(request)
    return await render_references_page(db, request, base_url)

@app.get("/ukk", response_class=HTMLResponse)
async def ssr_faq(request: Request):
    """Render FAQ page with SSR for SEO."""
    base_url = get_base_url(request)
    return await render_faq_page(db, request, base_url)

# Fixed service page routes (known URLs)
@app.get("/tasoitustyot-helsinki", response_class=HTMLResponse)
async def ssr_tasoitustyot(request: Request):
    base_url = get_base_url(request)
    return await render_service_page(db, "tasoitustyot-helsinki", request, base_url)

@app.get("/maalaustyot-helsinki", response_class=HTMLResponse)
async def ssr_maalaustyot(request: Request):
    base_url = get_base_url(request)
    return await render_service_page(db, "maalaustyot-helsinki", request, base_url)

@app.get("/mikrosementti-helsinki", response_class=HTMLResponse)
async def ssr_mikrosementti(request: Request):
    base_url = get_base_url(request)
    return await render_service_page(db, "mikrosementti-helsinki", request, base_url)

@app.get("/julkisivumaalaus-helsinki", response_class=HTMLResponse)
async def ssr_julkisivumaalaus(request: Request):
    base_url = get_base_url(request)
    return await render_service_page(db, "julkisivumaalaus-helsinki", request, base_url)

@app.get("/julkisivurappaus-helsinki", response_class=HTMLResponse)
async def ssr_julkisivurappaus(request: Request):
    base_url = get_base_url(request)
    return await render_service_page(db, "julkisivurappaus-helsinki", request, base_url)

@app.get("/kattomaalaus-helsinki", response_class=HTMLResponse)
async def ssr_kattomaalaus(request: Request):
    base_url = get_base_url(request)
    return await render_service_page(db, "kattomaalaus-helsinki", request, base_url)

# Dynamic slug handler - catches any other public pages created in admin
# This MUST be defined after all fixed routes
@app.get("/{slug:path}", response_class=HTMLResponse)
async def ssr_dynamic_slug(slug: str, request: Request):
    """Handle dynamic slugs - check if it's a valid public page or serve SPA."""
    base_url = get_base_url(request)
    
    # Skip system routes - let them fall through to SPA/static handlers
    if is_system_route(slug):
        # Return the React SPA index.html for admin and other system routes
        index_path = FRONTEND_BUILD_DIR / "index.html"
        if index_path.exists():
            return HTMLResponse(content=index_path.read_text())
        raise HTTPException(status_code=404, detail="Not found")
    
    # Skip if it looks like a static file request
    if '.' in slug.split('/')[-1]:
        raise HTTPException(status_code=404, detail="Not found")
    
    # Check if this is a known service page slug
    page = await db.servicepages.find_one({"slug": slug})
    if page:
        return await render_service_page(db, slug, request, base_url)
    
    # Not a known page - return 404
    return await render_404_page(request, base_url)

# ============================================================================

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

async def seed_hintalaskuri_page():
    """Create a default hintalaskuri service page if not exists."""
    existing = await db.service_pages.find_one({"slug": "hintalaskuri"})
    if not existing:
        page = {
            "id": str(uuid.uuid4()),
            "service_id": "hintalaskuri",
            "slug": "hintalaskuri",
            "is_published": True,
            "seo_title": "Hintalaskuri – Maalaus- ja tasoitustöiden hinta-arvio",
            "seo_description": "Laske maalaus- ja tasoitustöiden hinta-arvio hetkessä. Sisämaalaus, ulkomaalaus, tasoitustyöt, mikrosementti, kattomaalaus ja julkisivurappaus.",
            "seo_keywords": "hintalaskuri, maalaus hinta, tasoitus hinta, sisämaalaus hinta, ulkomaalaus hinta",
            "hero_title": "Hintalaskuri",
            "hero_subtitle": "Laske maalaus- ja tasoitustöiden hinta-arvio hetkessä",
            "description_title": "Maalaus- ja tasoitustöiden hinnat",
            "description_text": "<p>Maalaus- ja tasoitustöiden hinta riippuu useista tekijöistä: pinta-alasta, pinnan kunnosta, valitusta palvelusta ja mahdollisista lisätöistä. Hintalaskurimme antaa suuntaa-antavan arvion, joka sisältää työn, materiaalit ja arvonlisäveron (ALV 25,5 %). Lopullinen hinta varmistetaan aina maksuttomalla kartoituskäynnillä.</p><h3>Sisämaalaus hinnat</h3><p>Sisämaalauksen hinta alkaa noin 19 €/m² ja sisältää seinien maalauksen ammattimaisilla materiaaleilla. Katon maalaus maksaa lisäksi noin 22 €/m². Hintaan vaikuttavat huoneen koko, seinien kunto ja tarvittavat esikäsittelyt.</p><h3>Tasoitustyöt hinnat</h3><p>Tasoitustyöt hinnoitellaan pinta-alan ja vaadittavan tasoituksen laajuuden mukaan. Osatasoitus on edullisempi vaihtoehto, kun taas ylitasoitus kattaa koko pinnan käsittelyn. Tasoitustöiden hinta alkaa 25 €/m².</p><h3>Julkisivumaalaus ja kattomaalaus</h3><p>Talon ulkomaalauksen hinta riippuu talon koosta, kerrosluvusta ja pinnan kunnosta. Julkisivumaalaus alkaa 35 €/m² ja kattomaalaus 18 €/m². Peltikaton maalaus on edullisempaa kuin tiilikaton käsittely.</p><h3>Mikrosementti hinnat</h3><p>Mikrosementti on moderni pintamateriaali, joka sopii lattioihin, seiniin ja kylpyhuoneisiin. Mikrosementin hinta alkaa 120 €/m² ja vaihtelee kohteen tyypin ja alustan kunnon mukaan.</p><h3>Kotitalousvähennys</h3><p>Voit hyödyntää kotitalousvähennystä maalaus- ja tasoitustöissä. Vuonna 2025–2026 vähennys on 35 % työn osuudesta, ja enimmäismäärä on 1 600 € henkilöä kohti vuodessa. Omavastuu on 150 €. Hintalaskurimme laskee kotitalousvähennyksen automaattisesti.</p>",
            "features_title": "Mitä hintalaskuri kattaa",
            "features": [
                {"icon": "Paintbrush", "title": "Sisämaalaus", "description": "Seinien ja kattojen maalaus ammattimaisilla materiaaleilla"},
                {"icon": "Layers", "title": "Tasoitustyöt", "description": "Osatasoitus ja ylitasoitus kaikille pinnoille"},
                {"icon": "Building2", "title": "Julkisivumaalaus", "description": "Talon ulkopintojen maalaus ja rappaus"},
                {"icon": "Square", "title": "Mikrosementti", "description": "Moderni pintamateriaali lattioihin ja seiniin"}
            ],
            "why_title": "Miksi käyttää hintalaskuria",
            "why_items": [
                "Saat hinta-arvion heti ilman rekisteröitymistä",
                "Kotitalousvähennys lasketaan automaattisesti",
                "Valitse palvelupaketit tarpeen mukaan",
                "Selkeä erittely hinnan muodostumisesta",
                "Maksuton kartoituskäynti tarkan hinnan varmistamiseksi",
                "Ammattitaitoinen toteutus yli 5 vuoden kokemuksella"
            ],
            "process_title": "Näin saat tarkan tarjouksen",
            "use_global_process": True,
            "areas_title": "Palvelualueet",
            "areas_text": "",
            "use_global_areas": True,
            "related_service_ids": [],
            "cta_title": "Haluatko tarkan tarjouksen?",
            "cta_text": "Hintalaskuri antaa suuntaa-antavan arvion. Tarkka hinta varmistuu kartoituskäynnillä – se on aina maksuton ja ei sido sinua mihinkään.",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        await db.service_pages.insert_one(page)
        logging.info("Seeded hintalaskuri service page")

@app.on_event("startup")
async def startup_event():
    await init_admin_user()
    await seed_hintalaskuri_page()

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
