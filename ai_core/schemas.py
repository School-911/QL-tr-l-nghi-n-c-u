from typing import Optional

from pydantic import BaseModel, Field

class ProcessRequest(BaseModel):

    file_path: Optional[str] = None

    web_url: Optional[str] = None

    query: str = Field(...)

    workspace_id: Optional[str] = None

    user_id: Optional[str] = None

    user_email: Optional[str] = None

    user_name: Optional[str] = None

    original_file_name: Optional[str] = None


class WorkspaceUpdate(BaseModel):

    name: Optional[str] = None

    description: Optional[str] = None

    visibility: Optional[str] = None


class MemberUpdate(BaseModel):

    role: str


class InviteRequest(BaseModel):

    email: str

    role: str = "Thành viên"

    actor_name: str = "Người dùng"


class ActivityRequest(BaseModel):

    actor_name: str = "Người dùng"

    type: str = "activity"

    message: str


class NotificationResolveRequest(BaseModel):

    action: str


class JoinWorkspaceRequest(BaseModel):

    email: str

    name: Optional[str] = None

    actor_name: Optional[str] = None
