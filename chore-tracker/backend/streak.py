"""
Streak and achievement calculation logic.
A day "counts" if every chore assigned to the kid and due on that day
has a completion record with status="approved".
"""
from datetime import date, timedelta
from sqlalchemy.orm import Session
from models import ChoreAssignment, Completion, Chore, Achievement
from datetime import datetime, timezone

MILESTONE_DAYS = [7, 14, 21, 30, 60, 90, 180, 365]


def chores_due_on(kid_id: int, target_date: date, db: Session) -> list[int]:
    """Return list of chore IDs assigned to this kid that are due on target_date."""
    weekday = target_date.weekday()  # 0=Mon, 6=Sun
    assignments = (
        db.query(ChoreAssignment)
        .join(Chore)
        .filter(
            ChoreAssignment.kid_id == kid_id,
            Chore.active == True,
        )
        .all()
    )
    due = []
    for a in assignments:
        chore = a.chore
        if chore.frequency == "daily":
            due.append(chore.id)
        elif chore.frequency == "weekly" and weekday in (chore.days_of_week or []):
            due.append(chore.id)
    return due


def day_complete(kid_id: int, target_date: date, db: Session) -> bool:
    """Return True if all chores due that day have been approved."""
    due = chores_due_on(kid_id, target_date, db)
    if not due:
        return False  # no chores = no streak credit
    approved_ids = {
        c.chore_id
        for c in db.query(Completion).filter(
            Completion.kid_id == kid_id,
            Completion.due_date == target_date,
            Completion.status == "approved",
        ).all()
    }
    return all(chore_id in approved_ids for chore_id in due)


def compute_streak(kid_id: int, db: Session, as_of: date | None = None) -> int:
    """Count consecutive complete days ending on as_of (defaults to today)."""
    if as_of is None:
        as_of = date.today()
    streak = 0
    current = as_of
    while True:
        if day_complete(kid_id, current, db):
            streak += 1
            current -= timedelta(days=1)
        else:
            break
        if streak > 3650:  # safety cap
            break
    return streak


def compute_longest_streak(kid_id: int, db: Session) -> int:
    """Scan all completion history to find the longest-ever streak."""
    # Find earliest completion date
    first = (
        db.query(Completion)
        .filter(Completion.kid_id == kid_id, Completion.status == "approved")
        .order_by(Completion.due_date)
        .first()
    )
    if not first:
        return 0

    longest = 0
    run = 0
    current = first.due_date
    today = date.today()

    while current <= today:
        if day_complete(kid_id, current, db):
            run += 1
            longest = max(longest, run)
        else:
            run = 0
        current += timedelta(days=1)

    return longest


def award_new_achievements(kid_id: int, streak: int, db: Session) -> list[Achievement]:
    """
    Check if the current streak unlocks any new milestone achievements.
    Returns a list of newly created Achievement records.
    """
    existing_types = {
        a.achievement_type
        for a in db.query(Achievement).filter(Achievement.kid_id == kid_id).all()
    }
    new_achievements = []
    for days in MILESTONE_DAYS:
        atype = f"streak_{days}"
        if streak >= days and atype not in existing_types:
            achievement = Achievement(
                kid_id=kid_id,
                achievement_type=atype,
                streak_count=days,
                earned_at=datetime.now(timezone.utc),
            )
            db.add(achievement)
            new_achievements.append(achievement)
    if new_achievements:
        db.commit()
        for a in new_achievements:
            db.refresh(a)
    return new_achievements
