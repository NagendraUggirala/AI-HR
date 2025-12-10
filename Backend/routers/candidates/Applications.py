from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, selectinload
import model.models
from core.database import SessionLocal
from schema import schemas
from model.models import CandidateRecord

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=schemas.Applications)
def create_application(application: schemas.ApplicationsCreate, db: Session = Depends(get_db)):
    db_app = model.models.Applications(
        job_title=application.job_title,
        company=application.company,
        status=application.status,
        applied_days_ago=application.applied_days_ago
    )
    db.add(db_app)
    db.commit()
    db.refresh(db_app)
    return db_app

@router.get("/")
def read_applications(db: Session = Depends(get_db)):
    """
    Get all applications with candidate information and stage.
    Returns Application records (from Application model) with candidate_stage.
    Also includes candidates from Candidate table who may not have Application records yet.
    This endpoint is used by the PipelineView component.
    """
    try:
        result = []
        
        # Query Application model (not Applications) with candidate relationship loaded
        applications = db.query(model.models.Application).options(selectinload(model.models.Application.candidate)).all()
        
        # Format applications for frontend PipelineView
        for app in applications:
            candidate_stage = app.candidate.stage if app.candidate else None
            result.append({
                "id": app.id,
                "applicationId": app.id,
                "candidate_id": app.candidate_id,
                "candidate_name": app.candidate_name,
                "candidate_email": app.candidate_email,
                "job_id": app.job_id,
                "status": app.stage or "Applied",  # Application stage
                "candidate_stage": candidate_stage or "Applied",  # Candidate stage (from Candidate table) - this is what PipelineView uses
                "stage": app.stage or "Applied",  # Alias for status
                "applied_at": app.applied_at.isoformat() if app.applied_at else None,
                "role": app.candidate.role if app.candidate else "Not specified",
                "skills": app.candidate.skills if app.candidate else "",
                "resume_url": app.candidate.resume_url if app.candidate else None
            })
        
        # Build a map of email -> best record (prioritize candidate_records for latest stage)
        email_to_record = {}
        
        # First, add all Application records
        for app in applications:
            email_lower = app.candidate_email.lower() if app.candidate_email else None
            if email_lower:
                candidate_stage = app.candidate.stage if app.candidate else None
                email_to_record[email_lower] = {
                    "id": app.id,
                    "applicationId": app.id,
                    "candidate_id": app.candidate_id,
                    "candidate_name": app.candidate_name,
                    "candidate_email": app.candidate_email,
                    "job_id": app.job_id,
                    "status": app.stage or "Applied",
                    "candidate_stage": candidate_stage or "Applied",
                    "stage": app.stage or "Applied",
                    "applied_at": app.applied_at.isoformat() if app.applied_at else None,
                    "role": app.candidate.role if app.candidate else "Not specified",
                    "skills": app.candidate.skills if app.candidate else "",
                    "resume_url": app.candidate.resume_url if app.candidate else None,
                    "source": "application"
                }
        
        # Then, add/update with Candidate table records (if not already present or if stage is more advanced)
        try:
            all_candidates = db.query(model.models.Candidate).all()
            for candidate in all_candidates:
                email_lower = candidate.email.lower() if candidate.email else None
                if email_lower:
                    candidate_stage = candidate.stage or "Applied"
                    # Only add if not present, or if this has a more advanced stage
                    if email_lower not in email_to_record:
                        email_to_record[email_lower] = {
                            "id": f"candidate_{candidate.id}",
                            "applicationId": None,
                            "candidate_id": candidate.id,
                            "candidate_name": candidate.name,
                            "candidate_email": candidate.email,
                            "job_id": None,
                            "status": candidate_stage,
                            "candidate_stage": candidate_stage,
                            "stage": candidate_stage,
                            "applied_at": None,
                            "role": candidate.role or "Not specified",
                            "skills": candidate.skills or "",
                            "resume_url": candidate.resume_url,
                            "source": "candidate"
                        }
        except Exception as e:
            print(f"⚠️ Warning: Could not fetch additional candidates from Candidate table: {e}")
            import traceback
            traceback.print_exc()
        
        # Finally, add/update with candidate_records (PRIORITY - these have the most up-to-date stage)
        # This is critical for candidates who were screened via AI and updated via ReviewAIInterview
        try:
            candidate_records = db.query(CandidateRecord).all()
            print(f"📋 Found {len(candidate_records)} candidate_records")
            
            for record in candidate_records:
                record_email_lower = record.candidate_email.lower() if record.candidate_email else None
                if record_email_lower:
                    record_stage = record.stage or "Applied"
                    # ALWAYS use candidate_record if it exists (it has the latest stage from ReviewAIInterview)
                    email_to_record[record_email_lower] = {
                        "id": f"candidate_record_{record.id}",
                        "applicationId": None,
                        "candidate_id": None,
                        "candidate_name": record.candidate_name,
                        "candidate_email": record.candidate_email,
                        "job_id": None,
                        "status": record_stage,
                        "candidate_stage": record_stage,  # This is the key field PipelineView uses
                        "stage": record_stage,
                        "applied_at": record.created_at.isoformat() if record.created_at else None,
                        "role": record.role or "Not specified",
                        "skills": record.candidate_skills or "",
                        "resume_url": None,
                        "source": "candidate_record"
                    }
                    
                    # Log if this is an "Offered" candidate
                    if record_stage and record_stage.lower() in ['offer', 'offered']:
                        print(f"🎯 Added/Updated candidate_record with 'Offered' stage: {record.candidate_name} ({record.candidate_email}) - stage='{record_stage}'")
        except Exception as e:
            print(f"⚠️ Warning: Could not fetch candidate_records: {e}")
            import traceback
            traceback.print_exc()
        
        # Convert map to list
        result = list(email_to_record.values())
        
        # Log candidates with "Offered" stage for debugging
        offered_candidates = [r for r in result if r.get('candidate_stage', '').lower() in ['offer', 'offered']]
        if offered_candidates:
            print(f"🎯 Found {len(offered_candidates)} candidate(s) with 'Offered' stage:")
            for c in offered_candidates:
                print(f"   - {c.get('candidate_name')} ({c.get('candidate_email')}): stage='{c.get('candidate_stage')}'")
        else:
            print("⚠️ No candidates found with 'Offered' stage")
        
        print(f"✅ Returning {len(result)} application/candidate records for pipeline")
        return result
    except Exception as e:
        print(f"Error fetching applications: {e}")
        import traceback
        traceback.print_exc()
        # Fallback to old Applications model if Application model doesn't exist
        try:
            return db.query(model.models.Applications).all()
        except:
            return []

@router.delete("/{app_id}", status_code=204)
def delete_application(app_id: int, db: Session = Depends(get_db)):
    app = db.query(model.models.Applications).filter(model.models.Applications.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    db.delete(app)
    db.commit()
