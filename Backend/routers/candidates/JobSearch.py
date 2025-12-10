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

@router.post("/", response_model=schemas.JobSearch)
def create_jobsearch(job: schemas.JobSearchCreate, db: Session = Depends(get_db)):
    db_job = model.models.JobSearch(title=job.title, company=job.company, location=job.location)
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return db_job

@router.get("/", response_model=list[schemas.JobSearch])
def read_jobsearch(db: Session = Depends(get_db)):
    return db.query(model.models.JobSearch).all()

@router.delete("/{job_id}", status_code=204)
def delete_jobsearch(job_id: int, db: Session = Depends(get_db)):
    job = db.query(model.models.JobSearch).filter(model.models.JobSearch.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="JobSearch item not found")
    db.delete(job)
    db.commit()
