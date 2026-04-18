import asyncio
import json
import os
from pathlib import Path

from motor.motor_asyncio import AsyncIOMotorClient


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_BACKUP_PATH = ROOT / "production_data_export.json"
SUSPICIOUS_TEXT_MARKERS = (
    "Ã¤", "Ã„", "Ã¶", "Ã–", "Ã¥", "Ã…", "Ã©",
    "Â", "â€“", "â€”", "â€™", "â€œ", "â€", "â€¢", "â‚¬", "â„¢", "â€¦",
)


def mojibake_score(value: str) -> int:
    return sum(value.count(marker) for marker in SUSPICIOUS_TEXT_MARKERS)


def repair_text(value: str) -> str:
    original_score = mojibake_score(value)
    if original_score == 0:
        return value

    best_value = value
    best_score = original_score

    for encoding in ("cp1252", "latin-1"):
        try:
            candidate = value.encode(encoding).decode("utf-8")
        except (UnicodeEncodeError, UnicodeDecodeError):
            continue

        candidate_score = mojibake_score(candidate)
        if candidate_score < best_score:
            best_value = candidate
            best_score = candidate_score

    return best_value


def normalize_text_payload(value):
    if isinstance(value, str):
        return repair_text(value)
    if isinstance(value, list):
        return [normalize_text_payload(item) for item in value]
    if isinstance(value, dict):
        return {key: normalize_text_payload(item) for key, item in value.items()}
    return value


async def main():
    mongo_url = os.environ.get("MONGO_URL")
    db_name = os.environ.get("DB_NAME")
    backup_path = Path(os.environ.get("BACKUP_PATH", str(DEFAULT_BACKUP_PATH)))

    if not mongo_url or not db_name:
      raise RuntimeError("Set MONGO_URL and DB_NAME before running the import.")

    if not backup_path.exists():
      raise FileNotFoundError(f"Backup file not found: {backup_path}")

    data = normalize_text_payload(json.loads(backup_path.read_text(encoding="utf-8-sig")))
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
      "images": "images",
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
