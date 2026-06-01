from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Kid
from schemas import KidCreate, KidUpdate, KidOut

router = APIRouter(tags=["kids"])


@router.get("/", response_model=list[KidOut])
def list_kids(db: Session = Depends(get_db)):
    return db.query(Kid).order_by(Kid.created_at).all()


@router.post("/", response_model=KidOut, status_code=201)
def create_kid(payload: KidCreate, db: Session = Depends(get_db)):
    kid = Kid(**payload.model_dump())
    db.add(kid)
    db.commit()
    db.refresh(kid)
    return kid


@router.patch("/{kid_id}", response_model=KidOut)
def update_kid(kid_id: int, payload: KidUpdate, db: Session = Depends(get_db)):
    kid = db.query(Kid).filter(Kid.id == kid_id).first()
    if not kid:
        raise HTTPException(status_code=404, detail="Kid not found")
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(kid, field, value)
    db.commit()
    db.refresh(kid)
    return kid


@router.delete("/{kid_id}", status_code=204)
def delete_kid(kid_id: int, db: Session = Depends(get_db)):
    kid = db.query(Kid).filter(Kid.id == kid_id).first()
    if not kid:
        raise HTTPException(status_code=404, detail="Kid not found")
    db.delete(kid)
    db.commit()


@router.post("/{kid_id}/verify-pin")
def verify_pin(kid_id: int, pin: str, db: Session = Depends(get_db)):
    kid = db.query(Kid).filter(Kid.id == kid_id).first()
    if not kid:
        raise HTTPException(status_code=404, detail="Kid not found")
    if kid.pin is None or kid.pin == pin:
        return {"valid": True}
    return {"valid": False}
