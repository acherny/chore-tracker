from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Kid, Completion
from schemas import KidStats
from streak import compute_streak, compute_longest_streak, award_new_achievements

router = APIRouter(tags=["stats"])


@router.get("/{kid_id}", response_model=KidStats)
def get_kid_stats(kid_id: int, db: Session = Depends(get_db)):
    kid = db.query(Kid).filter(Kid.id == kid_id).first()
    if not kid:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Kid not found")

    streak = compute_streak(kid_id, db)
    longest = compute_longest_streak(kid_id, db)
    total_approved = (
        db.query(Completion)
        .filter(Completion.kid_id == kid_id, Completion.status == "approved")
        .count()
    )
    new_achievements = award_new_achievements(kid_id, streak, db)

    return KidStats(
        kid_id=kid.id,
        kid_name=kid.name,
        avatar_color=kid.avatar_color,
        current_streak=streak,
        longest_streak=longest,
        total_approved=total_approved,
        new_achievements=new_achievements,
    )


@router.get("/")
def all_kids_stats(db: Session = Depends(get_db)):
    kids = db.query(Kid).order_by(Kid.created_at).all()
    return [
        {
            "kid_id": kid.id,
            "kid_name": kid.name,
            "avatar_color": kid.avatar_color,
            "current_streak": compute_streak(kid.id, db),
        }
        for kid in kids
    ]
