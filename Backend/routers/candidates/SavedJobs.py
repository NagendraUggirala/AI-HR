from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import model.models
from core.database import SessionLocal
from schema import schemas


router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=schemas.SavedJobs)
def create_saved_job(job: schemas.SavedJobsCreate, db: Session = Depends(get_db)):
    db_job = model.models.SavedJobs(title=job.title, company=job.company, location=job.location)
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return db_job

@router.get("/", response_model=list[schemas.SavedJobs])
def read_saved_jobs(db: Session = Depends(get_db)):
    return db.query(model.models.SavedJobs).all()

@router.delete("/{job_id}", status_code=204)
def delete_saved_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(model.models.SavedJobs).filter(model.models.SavedJobs.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Saved job not found")
    db.delete(job)
    db.commit()
