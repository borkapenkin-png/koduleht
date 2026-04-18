import asyncio
import os
import re

from motor.motor_asyncio import AsyncIOMotorClient


IMAGE_URL_PATTERN = re.compile(
    r"https?://[^/]+/api/images/([a-f0-9-]+)",
    re.IGNORECASE,
)


def rewrite_value(value: str, target_base_url: str):
    def replacer(match):
        image_id = match.group(1)
        return f"{target_base_url}/api/images/{image_id}"

    return IMAGE_URL_PATTERN.sub(replacer, value)


async def main():
    mongo_url = os.environ.get("MONGO_URL")
    db_name = os.environ.get("DB_NAME")
    target_base_url = os.environ.get("TARGET_BASE_URL", "").rstrip("/")

    if not mongo_url or not db_name or not target_base_url:
        raise RuntimeError("Set MONGO_URL, DB_NAME and TARGET_BASE_URL before running.")

    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]

    collections = [
        ("site_settings", ["logo_url", "favicon_url", "hero_image_url", "about_image_url"]),
        ("services", ["image_url"]),
        ("references", ["cover_image_url"]),
        ("service_pages", ["hero_image_url", "description_image_url"]),
    ]

    for collection_name, fields in collections:
        documents = await db[collection_name].find({}).to_list(5000)
        changed = 0

        for document in documents:
            updates = {}
            for field in fields:
                value = document.get(field)
                if isinstance(value, str):
                    new_value = rewrite_value(value, target_base_url)
                    if new_value != value:
                        updates[field] = new_value

            gallery_images = document.get("gallery_images")
            if isinstance(gallery_images, list):
                rewritten = [rewrite_value(item, target_base_url) if isinstance(item, str) else item for item in gallery_images]
                if rewritten != gallery_images:
                    updates["gallery_images"] = rewritten

            if updates:
                await db[collection_name].update_one({"id": document["id"]}, {"$set": updates})
                changed += 1

        print(f"{collection_name}: updated {changed} document(s)")

    client.close()
    print("Image URL rewrite complete.")


if __name__ == "__main__":
    asyncio.run(main())
