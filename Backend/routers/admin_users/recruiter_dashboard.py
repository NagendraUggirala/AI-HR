from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select, func
from typing import List, Optional
from datetime import datetime, timedelta
from schema import schemas
from core.database import get_db
from model.models import Job, Candidate, User, Application, CandidateRecord
from core.dependencies import require_roles
from schema.schemas import JobCreate, JobRead, JobUpdate, CandidateRead

router = APIRouter()

# --- Jobs Endpoints ---
@router.post("/jobs", response_model=JobRead)
def create_job(payload: JobCreate, db: Session = Depends(get_db), user: User = Depends(require_roles(["recruiter", "admin"]))):
    now = datetime.utcnow()
    job = Job(**payload.dict(), recruiter_id=user.id, created_at=now, updated_at=now)
    db.add(job)
    db.commit()
    db.refresh(job)
    return job

@router.get("/jobs", response_model=List[JobRead])
def list_jobs(
    status: Optional[str] = Query(None),
    title: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(["recruiter", "admin"]))
):
    statement = select(Job).where(Job.recruiter_id == user.id)
    if status:
        statement = statement.where(Job.status.ilike(f"%{status}%"))
    if title:
        statement = statement.where(Job.title.ilike(f"%{title}%"))
    if location:
        statement = statement.where(Job.location.ilike(f"%{location}%"))
    if start_date:
        statement = statement.where(Job.created_at >= start_date)
    if end_date:
        statement = statement.where(Job.created_at <= end_date)
    return db.exec(statement).all()

@router.get("/jobs/{job_id}", response_model=JobRead)
def job_detail(job_id: int, db: Session = Depends(get_db), user: User = Depends(require_roles(["recruiter", "admin"]))):
    job = db.get(Job, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job.recruiter_id != user.id and user.role.lower() != "admin":
        raise HTTPException(status_code=403, detail="Access forbidden")
    return job

@router.put("/jobs/{job_id}", response_model=JobRead)
def update_job(job_id: int, payload: JobUpdate, db: Session = Depends(get_db), user: User = Depends(require_roles(["recruiter", "admin"]))):
    job = db.get(Job, job_id)
    if not job or (job.recruiter_id != user.id and user.role.lower() != "admin"):
        raise HTTPException(status_code=404, detail="Job not found or unauthorized")
    for key, value in payload.dict(exclude_unset=True).items():
        setattr(job, key, value)
    job.updated_at = datetime.utcnow()
    db.add(job)
    db.commit()
    db.refresh(job)
    return job

@router.delete("/jobs/{job_id}")
def delete_job(job_id: int, db: Session = Depends(get_db), user: User = Depends(require_roles(["recruiter", "admin"]))):
    job = db.get(Job, job_id)
    if not job or (job.recruiter_id != user.id and user.role.lower() != "admin"):
        raise HTTPException(status_code=404, detail="Job not found or unauthorized")
    db.delete(job)
    db.commit()
    return {"detail": "Job deleted"}

# --- Candidates Endpoints ---
@router.get("/candidates")
def list_candidates(
    skills: Optional[str] = Query(None),
    job_id: Optional[int] = None,
    stage: Optional[str] = None,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(["recruiter", "admin"]))
):
    # Get all job IDs for the current recruiter (unless admin)
    if user.role.lower() == "admin":
        # Admins can see all candidates
        job_ids = list(db.exec(select(Job.id)).all())
    else:
        # Recruiters can only see candidates for their jobs
        job_ids = list(db.exec(select(Job.id).where(Job.recruiter_id == user.id)).all())
    
    if not job_ids:
        return []
    
    # Get all applications for these jobs
    application_statement = select(Application).where(Application.job_id.in_(job_ids))
    if job_id:
        application_statement = application_statement.where(Application.job_id == job_id)
    applications = db.exec(application_statement).all()
    
    # Get unique candidate IDs from applications
    candidate_ids = list(set([app.candidate_id for app in applications]))
    
    if not candidate_ids:
        return []
    
    # Get candidates for these IDs
    candidate_statement = select(Candidate).where(Candidate.id.in_(candidate_ids))
    if stage:
        candidate_statement = candidate_statement.where(Candidate.stage == stage)
    if skills:
        candidate_statement = candidate_statement.where(Candidate.skills.ilike(f"%{skills}%"))
    
    candidates = db.exec(candidate_statement).all()
    
    # Get all candidate emails for lookup
    candidate_emails = [c.email.lower().strip() for c in candidates if c.email]
    
    # Fetch resume_screened status from candidate_records table
    resume_screened_map = {}
    if candidate_emails:
        # Query candidate_records for resume_screened status
        # Use SQLAlchemy query since db is a SQLAlchemy Session
        from sqlalchemy.orm import Session as SQLSession
        if isinstance(db, SQLSession):
            candidate_records = db.query(CandidateRecord).filter(
                func.lower(func.trim(CandidateRecord.candidate_email)).in_(
                    [email.lower().strip() for email in candidate_emails]
                )
            ).all()
        else:
            # Fallback: try SQLModel exec
            try:
                candidate_records = db.exec(
                    select(CandidateRecord).where(
                        func.lower(func.trim(CandidateRecord.candidate_email)).in_(
                            [email.lower().strip() for email in candidate_emails]
                        )
                    )
                ).all()
            except:
                candidate_records = []
        
        # Create a map of email -> resume_screened status
        for record in candidate_records:
            if record.candidate_email:
                email_key = record.candidate_email.lower().strip()
                resume_screened_map[email_key] = getattr(record, 'resume_screened', 'no')
    
    # Convert to dict format
    result = []
    for candidate in candidates:
        # Get resume_screened status from candidate_records
        email_key = candidate.email.lower().strip() if candidate.email else None
        resume_screened = resume_screened_map.get(email_key, 'no') if email_key else 'no'
        
        result.append({
            "id": candidate.id,
            "name": candidate.name,
            "email": candidate.email,
            "role": candidate.role,
            "skills": candidate.skills,
            "stage": candidate.stage,
            "resume_url": candidate.resume_url,
            "notes": candidate.notes,
            "recruiter_comments": candidate.recruiter_comments,
            "resume_screened": resume_screened  # Include resume_screened from candidate_records
        })
    
    return result

@router.get("/candidates/{candidate_id}", response_model=CandidateRead)
def candidate_detail(candidate_id: int, db: Session = Depends(get_db), user: User = Depends(require_roles(["recruiter", "admin"]))):
    candidate = db.get(Candidate, candidate_id)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    # Check if user has access to this candidate through their jobs
    if user.role.lower() != "admin":
        # Get all applications for this candidate
        applications = db.exec(select(Application).where(Application.candidate_id == candidate_id)).all()
        if not applications:
            raise HTTPException(status_code=403, detail="Access forbidden")
        
        # Check if any of the jobs belong to this recruiter
        job_ids = [app.job_id for app in applications]
        recruiter_jobs = db.exec(select(Job.id).where(Job.id.in_(job_ids), Job.recruiter_id == user.id)).all()
        if not recruiter_jobs:
            raise HTTPException(status_code=403, detail="Access forbidden")
    
    return candidate

# --- Pipeline Endpoint ---
@router.get("/pipeline/{job_id}")
def pipeline_view(job_id: int, db: Session = Depends(get_db), user: User = Depends(require_roles(["recruiter", "admin"]))):
    job = db.get(Job, job_id)
    if not job or (job.recruiter_id != user.id and user.role.lower() != "admin"):
        raise HTTPException(status_code=404, detail="Job not found or unauthorized")
    
    # Get applications for this job
    applications = db.exec(select(Application).where(Application.job_id == job_id)).all()
    candidate_ids = [app.candidate_id for app in applications]
    
    if not candidate_ids:
        return {}
    
    # Get candidate stages grouped by stage
    stages = db.exec(
        select(Candidate.stage, func.count(Candidate.id))
        .where(Candidate.id.in_(candidate_ids))
        .group_by(Candidate.stage)
    ).all()
    return {stage[0]: stage[1] for stage in stages}

# --- Analytics Endpoint ---
@router.get("/analytics/applications-over-time")
def applications_over_time(days: int = 30, db: Session = Depends(get_db), user: User = Depends(require_roles(["recruiter", "admin"]))):
    start_date = datetime.utcnow() - timedelta(days=days)
    job_ids = list(db.exec(select(Job.id).where(Job.recruiter_id == user.id)).all())
    
    if not job_ids:
        return []
    
    # Get applications for these jobs
    applications = db.exec(select(Application).where(Application.job_id.in_(job_ids))).all()
    candidate_ids = list(set([app.candidate_id for app in applications]))
    
    if not candidate_ids:
        return []
    
    # Get candidates and group by date
    query = select(func.date(Candidate.created_at), func.count(Candidate.id)).where(
        Candidate.id.in_(candidate_ids),
        Candidate.created_at >= start_date
    ).group_by(func.date(Candidate.created_at)).order_by(func.date(Candidate.created_at))
    return [{"date": d[0], "count": d[1]} for d in db.exec(query).all()]

# --- Settings Endpoint ---
@router.get("/settings")
def recruiter_settings(user: User = Depends(require_roles(["recruiter", "admin"]))):
    return {"user_id": user.id, "email": user.email, "role": user.role}
