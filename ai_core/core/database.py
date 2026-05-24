from fastapi import HTTPException
from pymongo import MongoClient
from datetime import datetime

from core.settings import MONGO_COLLECTION, MONGO_DB, MONGO_URI

mongo_collection = None
mongo_db = None

if MONGO_URI:
    try:
        mongo_client = MongoClient(MONGO_URI)
        mongo_client.admin.command("ping")
        mongo_db = mongo_client[MONGO_DB]
        mongo_collection = mongo_db[MONGO_COLLECTION]
        print("[OK] MongoDB connected")
    except Exception as e:
        print(f"[WARN] MongoDB connection failed: {e}")
else:
    print("[WARN] MONGO_URI missing")

def serialize_doc(doc):

    if not doc:
        return doc

    next_doc = {}

    for key, value in doc.items():
        if key == "_id":
            next_doc["_id"] = str(value)
        elif isinstance(value, datetime):
            next_doc[key] = value.isoformat()
        else:
            next_doc[key] = value

    return next_doc


def require_mongo():

    if mongo_db is None:
        raise HTTPException(
            status_code=503,
            detail="MongoDB chưa được cấu hình."
        )

    return mongo_db


def save_history(data: dict):
    if mongo_collection is None:
        return None

    try:
        result = mongo_collection.insert_one(data)
        return result.inserted_id
    except Exception as e:
        print(f"[WARN] Mongo save failed: {e}")
        return None
