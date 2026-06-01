from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date, datetime, timezone
from database import get_db
from models import Completion, ChoreAssignment, Chore
from schemas import CompletionCreate, CompletionReview, CompletionOut
from streak import chores_due_on

router = APIRouter(tags=["completions"])


@router.get("/", response_model=list[CompletionOut])
def list_completions(
    kid_id: int | None = None,
    due_date: date | None = None,
    status: str | None = None,
    db: Session = Depends(get_db),
):
    q = db.query(Completion)
    if kid_id is not None:
        q = q.filter(Completion.kid_id == kid_id)
    if due_date is not None:
        q = q.filter(Completion.due_date == due_date)
    if status is not None:
        q = q.filter(Completion.status == status)
    return q.order_by(Completion.due_date.desc()).all()


@router.get("/today/{kid_id}")
def todays_chores(kid_id: int, db: Session = Depends(get_db)):
    """
    Returns each chore due today for this kid, with its completion status.
    """
    today = date.today()
    due_chore_ids = chores_due_on(kid_id, today, db)

    completions = {
        c.chore_id: c
        for c in db.query(Completion).filter(
            Completion.kid_id == kid_id,
            Completion.due_date == today,
        ).all()
    }

    result = []
    for chore_id in due_chore_ids:
        chore = db.query(Chore).filter(Chore.id == chore_id).first()
        completion = completions.get(chore_id)
        result.append({
            "chore_id": chore_id,
            "title": chore.title if chore else "Unknown",
            "description": chore.description if chore else None,
            "status": completion.status if completion else "not_started",
            "completion_id": completion.id if completion else None,
            "completed_at": completion.completed_at if completion else None,
        })

    return {"date": today.isoformat(), "chores": result}


@router.post("/", response_model=CompletionOut, status_code=201)
def mark_complete(payload: CompletionCreate, db: Session = Depends(get_db)):
    # Prevent duplicate pending/approved completions for the same chore+day
    existing = (
        db.query(Completion)
        .filter(
            Completion.chore_id == payload.chore_id,
            Completion.kid_id == payload.kid_id,
            Completion.due_date == payload.due_date,
        )
        .first()
    )
    if existing:
        if existing.status in ("pending", "approved"):
            return existing
        # If rejected, allow re-submission by resetting it
        existing.status = "pending"
        existing.completed_at = datetime.now(timezone.utc)
        existing.reviewed_at = None
        existing.notes = None
        db.commit()
        db.refresh(existing)
        return existing

    completion = Completion(
        chore_id=payload.chore_id,
        kid_id=payload.kid_id,
        due_date=payload.due_date,
        status="pending",
        completed_at=datetime.now(timezone.utc),
    )
    db.add(completion)
    db.commit()
    db.refresh(completion)
    return completion


@router.patch("/{completion_id}/review", response_model=CompletionOut)
def review_completion(
    completion_id: int,
    payload: CompletionReview,
    db: Session = Depends(get_db),
):
    completion = db.query(Completion).filter(Completion.id == completion_id).first()
    if not completion:
        raise HTTPException(status_code=404, detail="Completion not found")
    if payload.status not in ("approved", "rejected"):
        raise HTTPException(status_code=400, detail="Status must be 'approved' or 'rejected'")

    completion.status = payload.status
    completion.notes = payload.notes
    completion.reviewed_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(completion)
    return completion
