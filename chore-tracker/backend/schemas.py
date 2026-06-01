from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime


# ── Kids ──────────────────────────────────────────────────────────────────────

class KidCreate(BaseModel):
    name: str
    avatar_color: Optional[str] = "#6366f1"
    pin: Optional[str] = None


class KidUpdate(BaseModel):
    name: Optional[str] = None
    avatar_color: Optional[str] = None
    pin: Optional[str] = None


class KidOut(BaseModel):
    id: int
    name: str
    avatar_color: str
    pin: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Chores ────────────────────────────────────────────────────────────────────

class ChoreCreate(BaseModel):
    title: str
    description: Optional[str] = None
    frequency: str = "daily"           # "daily" | "weekly"
    days_of_week: Optional[List[int]] = []  # [0..6], used when frequency="weekly"


class ChoreUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    frequency: Optional[str] = None
    days_of_week: Optional[List[int]] = None
    active: Optional[bool] = None


class ChoreOut(BaseModel):
    id: int
    title: str
    description: Optional[str]
    frequency: str
    days_of_week: List[int]
    active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Assignments ───────────────────────────────────────────────────────────────

class AssignmentCreate(BaseModel):
    chore_id: int
    kid_id: int


class AssignmentOut(BaseModel):
    id: int
    chore_id: int
    kid_id: int

    model_config = {"from_attributes": True}


# ── Completions ───────────────────────────────────────────────────────────────

class CompletionCreate(BaseModel):
    chore_id: int
    kid_id: int
    due_date: date


class CompletionReview(BaseModel):
    status: str   # "approved" | "rejected"
    notes: Optional[str] = None


class CompletionOut(BaseModel):
    id: int
    chore_id: int
    kid_id: int
    due_date: date
    status: str
    completed_at: Optional[datetime]
    reviewed_at: Optional[datetime]
    notes: Optional[str]

    model_config = {"from_attributes": True}


# ── Stats / Gamification ──────────────────────────────────────────────────────

class AchievementOut(BaseModel):
    id: int
    kid_id: int
    achievement_type: str
    streak_count: Optional[int]
    earned_at: datetime

    model_config = {"from_attributes": True}


class KidStats(BaseModel):
    kid_id: int
    kid_name: str
    avatar_color: str
    current_streak: int
    longest_streak: int
    total_approved: int
    new_achievements: List[AchievementOut]  # achievements just earned (to celebrate)
