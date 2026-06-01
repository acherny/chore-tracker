from sqlalchemy import Column, Integer, String, Boolean, DateTime, Date, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from database import Base


class Kid(Base):
    __tablename__ = "kids"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    avatar_color = Column(String, default="#6366f1")  # tailwind indigo
    pin = Column(String, nullable=True)               # 4-digit PIN, optional
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    assignments = relationship("ChoreAssignment", back_populates="kid", cascade="all, delete-orphan")
    completions = relationship("Completion", back_populates="kid", cascade="all, delete-orphan")
    achievements = relationship("Achievement", back_populates="kid", cascade="all, delete-orphan")


class Chore(Base):
    __tablename__ = "chores"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    # "daily" = every day, "weekly" = specific days
    frequency = Column(String, default="daily")
    # For weekly chores: JSON list of ints [0=Mon, 1=Tue, ... 6=Sun]
    days_of_week = Column(JSON, default=list)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    assignments = relationship("ChoreAssignment", back_populates="chore", cascade="all, delete-orphan")
    completions = relationship("Completion", back_populates="chore", cascade="all, delete-orphan")


class ChoreAssignment(Base):
    __tablename__ = "chore_assignments"

    id = Column(Integer, primary_key=True, index=True)
    chore_id = Column(Integer, ForeignKey("chores.id"), nullable=False)
    kid_id = Column(Integer, ForeignKey("kids.id"), nullable=False)

    chore = relationship("Chore", back_populates="assignments")
    kid = relationship("Kid", back_populates="assignments")


class Completion(Base):
    __tablename__ = "completions"

    id = Column(Integer, primary_key=True, index=True)
    chore_id = Column(Integer, ForeignKey("chores.id"), nullable=False)
    kid_id = Column(Integer, ForeignKey("kids.id"), nullable=False)
    # The calendar date this completion is for (not when it was submitted)
    due_date = Column(Date, nullable=False)
    # pending = kid marked it done, awaiting parent approval
    # approved = parent confirmed it's done right
    # rejected = parent sent it back
    status = Column(String, default="pending")
    completed_at = Column(DateTime, nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    notes = Column(String, nullable=True)  # parent feedback on rejection

    chore = relationship("Chore", back_populates="completions")
    kid = relationship("Kid", back_populates="completions")


class Achievement(Base):
    __tablename__ = "achievements"

    id = Column(Integer, primary_key=True, index=True)
    kid_id = Column(Integer, ForeignKey("kids.id"), nullable=False)
    # e.g. "streak_7", "streak_14", "streak_30", "perfect_week"
    achievement_type = Column(String, nullable=False)
    streak_count = Column(Integer, nullable=True)
    earned_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    kid = relationship("Kid", back_populates="achievements")
