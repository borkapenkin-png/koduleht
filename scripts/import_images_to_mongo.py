import asyncio
import json
import os
from pathlib import Path

from motor.motor_asyncio import AsyncIOMotorClient


async def main():
    mongo_url = os.environ.get("MONGO_URL")
    db_name = os.environ.get("DB_NAME")
    backup_path_value = os.environ.get("BACKUP_PATH")

    if not mongo_url or not db_name:
        raise RuntimeError("Set MONGO_URL and DB_NAME before running the import.")

    if not backup_path_value:
        raise RuntimeError("Set BACKUP_PATH to the images JSON file before running the import.")

    backup_path = Path(backup_path_value)
    if not backup_path.exists():
        raise FileNotFoundError(f"Backup file not found: {backup_path}")

    data = json.loads(backup_path.read_text(encoding="utf-8-sig"))
    if not isinstance(data, list):
        raise ValueError("Expected images backup to be a JSON array.")

    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]

    await db.images.delete_many({})
    if data:
        await db.images.insert_many(data)

    client.close()
    print(f"Imported {len(data)} item(s) into images")


if __name__ == "__main__":
    asyncio.run(main())
