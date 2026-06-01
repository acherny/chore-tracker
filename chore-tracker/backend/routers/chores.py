from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Chore, ChoreAssignment, Kid
from schemas import ChoreCreate, ChoreUpdate, ChoreOut, AssignmentCreate, AssignmentOut

router = APIRouter(tags=["chores"])


@router.get("/", response_model=list[ChoreOut])
def list_chores(active_only: bool = False, db: Session = Depends(get_db)):
    q = db.query(Chore)
    if active_only:
        q = q.filter(Chore.active == True)
    return q.order_by(Chore.created_at).all()


@router.post("/", response_model=ChoreOut, status_code=201)
def create_chore(payload: ChoreCreate, db: Session = Depends(get_db)):
    chore = Chore(**payload.model_dump())
    db.add(chore)
    db.commit()
    db.refresh(chore)
    return chore


@router.patch("/{chore_id}", response_model=ChoreOut)
def update_chore(chore_id: int, payload: ChoreUpdate, db: Session = Depends(get_db)):
    chore = db.query(Chore).filter(Chore.id == chore_id).first()
    if not chore:
        raise HTTPException(status_code=404, detail="Chore not found")
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(chore, field, value)
    db.commit()
    db.refresh(chore)
    return chore


@router.delete("/{chore_id}", status_code=204)
def delete_chore(chore_id: int, db: Session = Depends(get_db)):
    chore = db.query(Chore).filter(Chore.id == chore_id).first()
    if not chore:
        raise HTTPException(status_code=404, detail="Chore not found")
    db.delete(chore)
    db.commit()


# ── Assignments ───────────────────────────────────────────────────────────────

@router.get("/assignments", response_model=list[AssignmentOut])
def list_assignments(kid_id: int | None = None, db: Session = Depends(get_db)):
    q = db.query(ChoreAssignment)
    if kid_id is not None:
        q = q.filter(ChoreAssignment.kid_id == kid_id)
    return q.all()


@router.post("/assignments", response_model=AssignmentOut, status_code=201)
def assign_chore(payload: AssignmentCreate, db: Session = Depends(get_db)):
    # Check for duplicate
    existing = (
        db.query(ChoreAssignment)
        .filter(
            ChoreAssignment.chore_id == payload.chore_id,
            ChoreAssignment.kid_id == payload.kid_id,
        )
        .first()
    )
    if existing:
        return existing
    assignment = ChoreAssignment(**payload.model_dump())
    db.add(assignment)
    db.commit()
    db.refresh(assignment)
    return assignment


@router.delete("/assignments/{assignment_id}", status_code=204)
def remove_assignment(assignment_id: int, db: Session = Depends(get_db)):
    assignment = db.query(ChoreAssignment).filter(ChoreAssignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    db.delete(assignment)
    db.commit()


@router.get("/{chore_id}/assigned-kids")
def assigned_kids(chore_id: int, db: Session = Depends(get_db)):
    assignments = (
        db.query(ChoreAssignment)
        .filter(ChoreAssignment.chore_id == chore_id)
        .all()
    )
    return [{"kid_id": a.kid_id, "assignment_id": a.id} for a in assignments]
