# Database configuration and connection
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path
import os

ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Collection references
settings_collection = db.settings
services_collection = db.services
references_collection = db.references
partners_collection = db.partners
faqs_collection = db.faqs
contacts_collection = db.contacts
service_pages_collection = db.service_pages
images_collection = db.images

async def close_db():
    """Close database connection."""
    client.close()
