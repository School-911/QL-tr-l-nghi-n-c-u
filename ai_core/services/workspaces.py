import uuid
from datetime import datetime, timedelta
from typing import Optional

from bson import ObjectId

from core.database import mongo_db, require_mongo

def ensure_workspace(workspace_id: str):

    db = require_mongo()

    workspace = db["workspaces"].find_one({
        "id": workspace_id
    })

    if workspace:
        if not workspace.get("join_token"):
            join_token = uuid.uuid4().hex

            db["workspaces"].update_one(
                {
                    "id": workspace_id
                },
                {
                    "$set": {
                        "join_token": join_token,
                        "updated_at": datetime.utcnow()
                    }
                }
            )

            workspace["join_token"] = join_token

        return workspace

    now = datetime.utcnow()

    workspace = {
        "id": workspace_id,
        "join_token": uuid.uuid4().hex,
        "name": "Nhóm nghiên cứu School Research",
        "description": "Không gian cộng tác nghiên cứu của nhóm.",
        "visibility": "private",
        "created_at": now,
        "updated_at": now
    }

    db["workspaces"].insert_one(workspace)

    return workspace


def ensure_workspace_member(workspace_id: str, user_id: Optional[str], email: Optional[str], name: Optional[str]):

    if mongo_db is None or not email:
        return

    now = datetime.utcnow()

    existing = mongo_db["workspace_members"].find_one({
        "workspace_id": workspace_id,
        "email": email
    })

    if existing:
        return

    mongo_db["workspace_members"].insert_one({
        "id": f"mem_{uuid.uuid4().hex[:10]}",
        "workspace_id": workspace_id,
        "user_id": user_id,
        "name": name or email.split("@")[0],
        "email": email,
        "role": "Chủ sở hữu" if workspace_id == f"user-{user_id}" else "Thành viên",
        "status": "active",
        "avatar": (name or email)[:2].upper(),
        "created_at": now,
        "updated_at": now
    })


def member_filter(workspace_id: str, member_id: str):

    filters = [
        {
            "workspace_id": workspace_id,
            "id": member_id
        }
    ]

    try:
        filters.append({
            "workspace_id": workspace_id,
            "_id": ObjectId(member_id)
        })
    except Exception:
        pass

    return {
        "$or": filters
    }


def notification_filter(workspace_id: str, notification_id: str):

    filters = [
        {
            "workspace_id": workspace_id,
            "id": notification_id
        }
    ]

    try:
        filters.append({
            "workspace_id": workspace_id,
            "_id": ObjectId(notification_id)
        })
    except Exception:
        pass

    return {
        "$or": filters
    }


def cleanup_expired_notifications(workspace_id: Optional[str] = None):

    if mongo_db is None:
        return

    cutoff = datetime.utcnow() - timedelta(days=7)

    query = {
        "type": {
            "$nin": ["invite", "join_request"]
        },
        "created_at": {
            "$lt": cutoff
        }
    }

    if workspace_id:
        query["workspace_id"] = workspace_id

    mongo_db["notifications"].delete_many(query)
