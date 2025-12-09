from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import models
from core.database import get_db
from core.dependencies import get_current_user
from models import User, Job, Application
from sqlmodel import select
from schema import schemas


router = APIRouter(
    prefix="/api/candidates",
    tags=["candidates"]
)

@router.get("/", response_model=list[schemas.CandidateSchema])
def read_candidates(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    # Get all job IDs for the current recruiter (unless admin)
    if user.role.lower() == "admin":
        return db.query(models.Candidate).all()
    
    job_ids = list(db.exec(select(Job.id).where(Job.recruiter_id == user.id)).all())
    
    if not job_ids:
        return []
    
    # Get all applications for these jobs
    applications = db.exec(select(Application).where(Application.job_id.in_(job_ids))).all()
    candidate_ids = list(set([app.candidate_id for app in applications if app.candidate_id]))
    
    if not candidate_ids:
        return []
    
    # Get candidates for these IDs
    return db.query(models.Candidate).filter(models.Candidate.id.in_(candidate_ids)).all()

@router.get("/{candidate_id}", response_model=schemas.CandidateSchema)
def read_candidate(candidate_id: int, db: Session = Depends(get_db)):
    candidate = db.query(models.Candidate).filter(models.Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return candidate
