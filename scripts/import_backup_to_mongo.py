import asyncio
import json
import os
from pathlib import Path

from motor.motor_asyncio import AsyncIOMotorClient


ROOT = Path(__file__).resolve().parents[1]
BACKUP_PATH = ROOT / "production_data_export.json"


async def main():
    mongo_url = os.environ.get("MONGO_URL")
    db_name = os.environ.get("DB_NAME")

    if not mongo_url or not db_name:
      raise RuntimeError("Set MONGO_URL and DB_NAME before running the import.")

    if not BACKUP_PATH.exists():
      raise FileNotFoundError(f"Backup file not found: {BACKUP_PATH}")

    data = json.loads(BACKUP_PATH.read_text(encoding="utf-8"))
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]

    collection_map = {
      "site_settings": "site_settings",
      "services": "services",
      "references": "references",
      "partners": "partners",
      "faqs": "faqs",
      "service_pages": "service_pages",
      "areas": "areas",
      "calculator_config": "calculator_config",
    }

    for source_key, collection_name in collection_map.items():
      items = data.get(source_key)
      if items is None:
        continue

      if not isinstance(items, list):
        items = [items]

      await db[collection_name].delete_many({})
      if items:
        await db[collection_name].insert_many(items)
      print(f"Imported {len(items)} item(s) into {collection_name}")

    client.close()
    print("Mongo import complete.")


if __name__ == "__main__":
    asyncio.run(main())
