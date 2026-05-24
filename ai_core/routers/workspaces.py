import uuid
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, HTTPException

from core.database import require_mongo, serialize_doc
from schemas import ActivityRequest, InviteRequest, JoinWorkspaceRequest, MemberUpdate, NotificationResolveRequest, WorkspaceUpdate
from services.workspaces import cleanup_expired_notifications, ensure_workspace, ensure_workspace_member, member_filter, notification_filter

router = APIRouter()

@router.get("/workspaces")
async def list_user_workspaces(email: Optional[str] = None, user_id: Optional[str] = None):

    db = require_mongo()

    if not email and not user_id:
        raise HTTPException(
            status_code=400,
            detail="Thiếu email hoặc user_id để lấy danh sách nhóm."
        )

    now = datetime.utcnow()
    items = []
    seen = set()

    if user_id:
        personal_workspace_id = f"user-{user_id}"
        personal_workspace = ensure_workspace(personal_workspace_id)

        if email:
            ensure_workspace_member(
                workspace_id=personal_workspace_id,
                user_id=user_id,
                email=email,
                name=email.split("@")[0]
            )

        items.append({
            "workspace": serialize_doc(personal_workspace),
            "membership": {
                "workspace_id": personal_workspace_id,
                "email": email,
                "role": "Chủ sở hữu",
                "status": "active",
                "created_at": now.isoformat()
            }
        })
        seen.add(personal_workspace_id)

    membership_query = {}

    if email:
        membership_query["email"] = email
    elif user_id:
        membership_query["user_id"] = user_id

    memberships = list(
        db["workspace_members"]
        .find(membership_query)
        .sort("updated_at", -1)
        .limit(100)
    )

    for membership in memberships:
        workspace_id = membership.get("workspace_id")

        if not workspace_id or workspace_id in seen:
            continue

        workspace = db["workspaces"].find_one({
            "id": workspace_id
        })

        if not workspace:
            workspace = ensure_workspace(workspace_id)

        items.append({
            "workspace": serialize_doc(workspace),
            "membership": serialize_doc(membership)
        })
        seen.add(workspace_id)

    return {
        "status": "success",
        "items": items
    }


@router.get("/workspaces/{workspace_id}/overview")
async def workspace_overview(workspace_id: str):

    db = require_mongo()

    cleanup_expired_notifications(workspace_id)

    workspace = ensure_workspace(workspace_id)

    members = list(
        db["workspace_members"]
        .find({"workspace_id": workspace_id})
        .sort("created_at", 1)
    )

    activities = list(
        db["workspace_activities"]
        .find({"workspace_id": workspace_id})
        .sort("created_at", -1)
        .limit(30)
    )

    notifications = list(
        db["notifications"]
        .find({"workspace_id": workspace_id})
        .sort("created_at", -1)
        .limit(30)
    )

    return {
        "workspace": serialize_doc(workspace),
        "members": [serialize_doc(member) for member in members],
        "activities": [serialize_doc(activity) for activity in activities],
        "notifications": [serialize_doc(notification) for notification in notifications]
    }


@router.get("/workspaces/{workspace_id}/notifications")
async def workspace_notifications(workspace_id: str):

    db = require_mongo()

    ensure_workspace(workspace_id)

    cleanup_expired_notifications(workspace_id)

    notifications = list(
        db["notifications"]
        .find({"workspace_id": workspace_id})
        .sort("created_at", -1)
        .limit(100)
    )

    return {
        "status": "success",
        "items": [serialize_doc(notification) for notification in notifications]
    }


@router.post("/workspaces/{workspace_id}/notifications/{notification_id}/resolve")
async def resolve_notification(workspace_id: str, notification_id: str, payload: NotificationResolveRequest):

    db = require_mongo()

    action = payload.action.strip().lower()

    if action not in ["accepted", "declined", "read"]:
        raise HTTPException(
            status_code=400,
            detail="Hành động thông báo không hợp lệ."
        )

    notification = db["notifications"].find_one(
        notification_filter(workspace_id, notification_id)
    )

    if not notification:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy thông báo."
        )

    now = datetime.utcnow()

    if notification.get("type") in ["invite", "join_request"] and action == "accepted":
        email = notification.get("metadata", {}).get("email")

        if email:
            db["workspace_members"].update_one(
                {
                    "workspace_id": workspace_id,
                    "email": email
                },
                {
                    "$set": {
                        "status": "active",
                        "updated_at": now
                    }
                }
            )

    db["notifications"].update_one(
        notification_filter(workspace_id, notification_id),
        {
            "$set": {
                "read": True,
                "resolved": action in ["accepted", "declined"],
                "action": action,
                "resolved_at": now,
                "updated_at": now
            }
        }
    )

    db["workspace_activities"].insert_one({
        "id": f"act_{uuid.uuid4().hex[:10]}",
        "workspace_id": workspace_id,
        "actor_name": "Người dùng",
        "type": f"notification_{action}",
        "message": f"đã {action} một thông báo",
        "created_at": now
    })

    return {
        "status": "success"
    }


@router.patch("/workspaces/{workspace_id}")
async def update_workspace(workspace_id: str, payload: WorkspaceUpdate):

    db = require_mongo()

    ensure_workspace(workspace_id)

    update_data = {
        key: value
        for key, value in payload.dict().items()
        if value is not None
    }

    update_data["updated_at"] = datetime.utcnow()

    db["workspaces"].update_one(
        {"id": workspace_id},
        {"$set": update_data}
    )

    return {
        "status": "success",
        "workspace": serialize_doc(
            db["workspaces"].find_one({"id": workspace_id})
        )
    }


@router.post("/workspaces/{workspace_id}/rotate-link")
async def rotate_workspace_link(workspace_id: str):

    db = require_mongo()

    ensure_workspace(workspace_id)

    db["workspaces"].update_one(
        {"id": workspace_id},
        {
            "$set": {
                "join_token": uuid.uuid4().hex,
                "updated_at": datetime.utcnow()
            }
        }
    )

    return {
        "status": "success",
        "workspace": serialize_doc(
            db["workspaces"].find_one({"id": workspace_id})
        )
    }


@router.post("/workspaces/join/{join_token}")
async def join_workspace_by_link(join_token: str, payload: JoinWorkspaceRequest):

    db = require_mongo()

    workspace = db["workspaces"].find_one({
        "join_token": join_token
    })

    if not workspace:
        raise HTTPException(
            status_code=404,
            detail="Link nhóm không tồn tại hoặc đã bị thay đổi."
        )

    workspace_id = workspace["id"]
    visibility = workspace.get("visibility", "private")
    now = datetime.utcnow()
    email_name = payload.email.split("@")[0]
    member_name = payload.name or payload.actor_name or email_name.replace(".", " ").replace("_", " ").title()

    existing = db["workspace_members"].find_one({
        "workspace_id": workspace_id,
        "email": payload.email
    })

    if visibility == "private":
        raise HTTPException(
            status_code=403,
            detail="Nhóm đang ở chế độ riêng tư. Bạn cần được mời để tham gia."
        )

    if visibility == "public":
        if existing:
            db["workspace_members"].update_one(
                {
                    "workspace_id": workspace_id,
                    "email": payload.email
                },
                {
                    "$set": {
                        "status": "active",
                        "updated_at": now
                    }
                }
            )
        else:
            db["workspace_members"].insert_one({
                "id": f"mem_{uuid.uuid4().hex[:10]}",
                "workspace_id": workspace_id,
                "name": member_name,
                "email": payload.email,
                "role": "Thành viên",
                "status": "active",
                "avatar": email_name[:2].upper(),
                "created_at": now,
                "updated_at": now
            })

        db["notifications"].insert_one({
            "id": f"noti_{uuid.uuid4().hex[:10]}",
            "workspace_id": workspace_id,
            "type": "success",
            "title": "Thành viên mới",
            "message": f"{member_name} đã tham gia nhóm bằng link công khai.",
            "read": False,
            "resolved": False,
            "created_at": now
        })

        return {
            "status": "joined",
            "message": "Bạn đã tham gia nhóm thành công.",
            "workspace_id": workspace_id,
            "workspace": serialize_doc(workspace)
        }

    if existing:
        db["workspace_members"].update_one(
            {
                "workspace_id": workspace_id,
                "email": payload.email
            },
            {
                "$set": {
                    "status": "pending",
                    "updated_at": now
                }
            }
        )
    else:
        db["workspace_members"].insert_one({
            "id": f"mem_{uuid.uuid4().hex[:10]}",
            "workspace_id": workspace_id,
            "name": member_name,
            "email": payload.email,
            "role": "Thành viên",
            "status": "pending",
            "avatar": email_name[:2].upper(),
            "created_at": now,
            "updated_at": now
        })

    db["notifications"].insert_one({
        "id": f"noti_{uuid.uuid4().hex[:10]}",
        "workspace_id": workspace_id,
        "type": "join_request",
        "title": "Yêu cầu tham gia nhóm",
        "message": f"{member_name} muốn tham gia nhóm nội bộ.",
        "metadata": {
            "email": payload.email,
            "role": "Thành viên"
        },
        "read": False,
        "resolved": False,
        "created_at": now
    })

    return {
        "status": "pending",
        "message": "Yêu cầu tham gia đã được gửi và đang chờ quản trị viên duyệt.",
        "workspace_id": workspace_id,
        "workspace": serialize_doc(workspace)
    }


@router.post("/workspaces/{workspace_id}/invites")
async def invite_member(workspace_id: str, payload: InviteRequest):

    db = require_mongo()

    ensure_workspace(workspace_id)

    now = datetime.utcnow()

    existing = db["workspace_members"].find_one({
        "workspace_id": workspace_id,
        "email": payload.email
    })

    if not existing:
        email_name = payload.email.split("@")[0]

        db["workspace_members"].insert_one({
            "id": f"mem_{uuid.uuid4().hex[:10]}",
            "workspace_id": workspace_id,
            "name": email_name.replace(".", " ").replace("_", " ").title(),
            "email": payload.email,
            "role": payload.role,
            "status": "pending",
            "avatar": email_name[:2].upper(),
            "created_at": now,
            "updated_at": now
        })

    message = f"{payload.actor_name} đã mời {payload.email} vào nhóm."

    db["workspace_activities"].insert_one({
        "id": f"act_{uuid.uuid4().hex[:10]}",
        "workspace_id": workspace_id,
        "actor_name": payload.actor_name,
        "type": "member_invited",
        "message": f"đã mời {payload.email} vào nhóm",
        "created_at": now
    })

    db["notifications"].insert_one({
        "id": f"noti_{uuid.uuid4().hex[:10]}",
        "workspace_id": workspace_id,
        "type": "invite",
        "title": "Lời mời thành viên",
        "message": message,
        "metadata": {
            "email": payload.email,
            "role": payload.role
        },
        "read": False,
        "resolved": False,
        "created_at": now
    })

    return {
        "status": "success"
    }


@router.post("/workspaces/{workspace_id}/invites/accept")
async def accept_workspace_invite(workspace_id: str, payload: JoinWorkspaceRequest):

    db = require_mongo()

    ensure_workspace(workspace_id)

    now = datetime.utcnow()

    membership = db["workspace_members"].find_one({
        "workspace_id": workspace_id,
        "email": payload.email
    })

    if not membership:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy lời mời dành cho email này."
        )

    db["workspace_members"].update_one(
        {
            "workspace_id": workspace_id,
            "email": payload.email
        },
        {
            "$set": {
                "status": "active",
                "updated_at": now
            }
        }
    )

    db["notifications"].update_many(
        {
            "workspace_id": workspace_id,
            "type": "invite",
            "metadata.email": payload.email
        },
        {
            "$set": {
                "read": True,
                "resolved": True,
                "action": "accepted",
                "resolved_at": now,
                "updated_at": now
            }
        }
    )

    db["workspace_activities"].insert_one({
        "id": f"act_{uuid.uuid4().hex[:10]}",
        "workspace_id": workspace_id,
        "actor_name": payload.actor_name or payload.email,
        "type": "invite_accepted",
        "message": "đã chấp nhận lời mời tham gia nhóm",
        "created_at": now
    })

    return {
        "status": "joined",
        "message": "Bạn đã chấp nhận lời mời và tham gia nhóm.",
        "workspace_id": workspace_id,
        "workspace": serialize_doc(
            db["workspaces"].find_one({"id": workspace_id})
        )
    }


@router.patch("/workspaces/{workspace_id}/members/{member_id}")
async def update_member(workspace_id: str, member_id: str, payload: MemberUpdate):

    db = require_mongo()

    result = db["workspace_members"].update_one(
        member_filter(workspace_id, member_id),
        {
            "$set": {
                "role": payload.role,
                "updated_at": datetime.utcnow()
            }
        }
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Không tìm thấy thành viên.")

    return {
        "status": "success"
    }


@router.delete("/workspaces/{workspace_id}/members/{member_id}")
async def delete_member(workspace_id: str, member_id: str):

    db = require_mongo()

    result = db["workspace_members"].delete_one(
        member_filter(workspace_id, member_id)
    )

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Không tìm thấy thành viên.")

    return {
        "status": "success"
    }


@router.post("/workspaces/{workspace_id}/activities")
async def create_activity(workspace_id: str, payload: ActivityRequest):

    db = require_mongo()

    ensure_workspace(workspace_id)

    now = datetime.utcnow()

    activity_doc = {
        "id": f"act_{uuid.uuid4().hex[:10]}",
        "workspace_id": workspace_id,
        "actor_name": payload.actor_name,
        "type": payload.type,
        "message": payload.message,
        "history_id": payload.history_id,
        "source_type": payload.source_type,
        "source_name": payload.source_name,
        "has_source_file": payload.has_source_file,
        "created_at": now
    }

    db["workspace_activities"].insert_one(activity_doc)

    db["notifications"].insert_one({
        "id": f"noti_{uuid.uuid4().hex[:10]}",
        "workspace_id": workspace_id,
        "type": payload.type,
        "title": "Hoạt động mới",
        "message": f"{payload.actor_name} {payload.message}",
        "history_id": payload.history_id,
        "source_type": payload.source_type,
        "source_name": payload.source_name,
        "has_source_file": payload.has_source_file,
        "read": False,
        "resolved": False,
        "created_at": now
    })

    return {
        "status": "success"
    }

