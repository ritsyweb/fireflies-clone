from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class ParticipantOut(BaseModel):
    id: int
    name: str
    class Config:
        from_attributes = True


class TranscriptSegmentOut(BaseModel):
    id: int
    speaker: str
    start_time: float
    end_time: float
    text: str
    class Config:
        from_attributes = True


class SummaryOut(BaseModel):
    overview_text: str
    class Config:
        from_attributes = True


class ActionItemOut(BaseModel):
    id: int
    text: str
    assignee: Optional[str] = None
    is_completed: bool
    class Config:
        from_attributes = True


class ActionItemCreate(BaseModel):
    text: str
    assignee: Optional[str] = None


class ActionItemUpdate(BaseModel):
    text: Optional[str] = None
    assignee: Optional[str] = None
    is_completed: Optional[bool] = None


class TopicOut(BaseModel):
    id: int
    label: str
    class Config:
        from_attributes = True


# --- Meeting list view (lighter payload for the dashboard) ---
class MeetingListOut(BaseModel):
    id: int
    title: str
    date: datetime
    duration_sec: int
    participants: list[ParticipantOut] = []
    class Config:
        from_attributes = True


# --- Meeting detail view (everything) ---
class MeetingDetailOut(BaseModel):
    id: int
    title: str
    date: datetime
    duration_sec: int
    audio_url: Optional[str] = None
    participants: list[ParticipantOut] = []
    segments: list[TranscriptSegmentOut] = []
    summary: Optional[SummaryOut] = None
    action_items: list[ActionItemOut] = []
    topics: list[TopicOut] = []
    class Config:
        from_attributes = True


class MeetingCreate(BaseModel):
    title: str
    date: datetime
    participants: list[str] = []
    raw_transcript: Optional[str] = None  # pasted transcript text, optional


class MeetingUpdate(BaseModel):
    title: Optional[str] = None
    date: Optional[datetime] = None
    participants: Optional[list[str]] = None
