import os
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from starlette.responses import JSONResponse
from pydantic import BaseModel

from core.database import SessionLocal, init_db
from model.models import CandidateRecord, Candidate, Application, LegacyCandidate, Job, User
from routers.Resume_parsing.routers.utils import extract_text, ai_extract_fields, ai_generate_jd, ai_similarity_score, send_email_smtp
from routers.Resume_parsing.routers.config import SCORE_THRESHOLD
from routers.Candidate_assessments.Assessment.utils.stage_sync import update_candidate_stage_all_tables
from sqlmodel import select
from sqlalchemy import text, func
from core.dependencies import get_current_user

class StageUpdate(BaseModel):
    stage: str

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/")
def root():
    return {"status": "ok"}

@router.get("/candidates")
def list_candidates(
    db: Session = Depends(get_db), 
    limit: int = 1000, 
    offset: int = 0,
    user: User = Depends(get_current_user),
    show_all: bool = Query(False, description="If True, show all screened candidates regardless of aptitude completion")
):
    """
    Get all AI-screened candidates from candidate_records table filtered by recruiter.
    Increased default limit to 1000 to ensure all screened candidates are returned.
    Set show_all=True to see all screened candidates regardless of aptitude test completion.
    """
    # Get all candidate emails that belong to this recruiter's jobs
    recruiter_candidate_emails = set()
    recruiter_has_jobs = False
    
    if user.role.lower() != "admin":
        # Get all job IDs for this recruiter
        job_ids = [row[0] for row in db.execute(select(Job.id).where(Job.recruiter_id == user.id)).all()]
        print(f"🔍 Recruiter {user.id} has {len(job_ids)} jobs")
        recruiter_has_jobs = len(job_ids) > 0
        
        if job_ids:
            # Get all applications for these jobs
            applications = db.execute(select(Application).where(Application.job_id.in_(job_ids))).scalars().all()
            print(f"🔍 Found {len(applications)} applications for recruiter's jobs")
            # Get unique candidate emails from applications
            for app in applications:
                if app.candidate_email:
                    recruiter_candidate_emails.add(app.candidate_email.lower().strip())
            
            # Also get emails from Candidate table that have applications to recruiter's jobs
            candidate_ids = list(set([app.candidate_id for app in applications if app.candidate_id]))
            if candidate_ids:
                candidates = db.execute(select(Candidate).where(Candidate.id.in_(candidate_ids))).scalars().all()
                for candidate in candidates:
                    if candidate.email:
                        recruiter_candidate_emails.add(candidate.email.lower().strip())
        
        print(f"🔍 Recruiter {user.id} has {len(recruiter_candidate_emails)} unique candidate emails from applications")
    
    # Query candidate records
    query = db.query(CandidateRecord).order_by(CandidateRecord.id.desc())
    
    # For non-admin users, filter by recruiter's candidate emails
    # NOTE: candidate_records table doesn't track which recruiter screened which resume
    # So we filter by applications to ensure recruiters only see candidates from their jobs
    if user.role.lower() != "admin":
        if recruiter_candidate_emails:
            # Filter by applications if they exist
            query = query.filter(
                func.lower(func.trim(CandidateRecord.candidate_email)).in_(
                    [email.lower().strip() for email in recruiter_candidate_emails]
                )
            )
            print(f"🔍 Filtering candidate_records by {len(recruiter_candidate_emails)} emails from applications")
        elif recruiter_has_jobs:
            # Recruiter has jobs but no applications yet
            # Show all screened candidates (resume_screened = "yes") for ResumeScreening page
            # This allows recruiters to see resumes they've screened directly through the UI
            # SECURITY NOTE: This shows ALL screened candidates, not just this recruiter's
            # This is acceptable for the ResumeScreening page where recruiters need to see what they've screened
            query = query.filter(CandidateRecord.resume_screened == "yes")
            print(f"🔍 Recruiter {user.id} has jobs but no applications - showing all screened candidates (resume_screened='yes')")
        else:
            # No jobs at all - return empty result
            print(f"⚠️ Recruiter {user.id} has no jobs, returning empty result")
            return []
    
    rows = query.offset(offset).limit(limit).all()
    print(f"📋 Found {len(rows)} candidate_records after filtering")
    
    # Get all emails that have completed aptitude tests (only if show_all is False)
    completed_aptitude_emails = set()
    if not show_all:
        try:
            aptitude_completed = db.query(LegacyCandidate).filter(
                LegacyCandidate.status.isnot(None),
                LegacyCandidate.status != '',
                LegacyCandidate.status.in_(['Qualified', 'Regret', 'Completed', 'Passed', 'Submitted'])
            ).all()
            completed_aptitude_emails = {c.email.lower() for c in aptitude_completed if c.email}
            print(f"📋 Found {len(completed_aptitude_emails)} candidates who completed aptitude test")
        except Exception as e:
            print(f"⚠️ Warning: Could not check aptitude completion status: {e}")
    else:
        print(f"📋 show_all=True: Showing all screened candidates regardless of aptitude completion")
    
    result = []
    for r in rows:
        # Get stage value - handle None, empty string, or actual value
        stage_value = None
        if hasattr(r, 'stage'):
            stage_value = r.stage
        if not stage_value or stage_value == '':
            stage_value = "Applied"  # Default to Applied if stage is None or empty
        
        # Only filter by aptitude completion if show_all is False
        if not show_all:
            # Don't filter out candidates who are in Interview stage or beyond, even if they completed aptitude test
            # This ensures Interview candidates are always visible
            candidate_stage_lower = stage_value.lower() if stage_value else ''
            is_advanced_stage = candidate_stage_lower in ['interview', 'offer', 'hired']
            
            # Filter out candidates who have completed aptitude test UNLESS they're in Interview stage or beyond
            if r.candidate_email and r.candidate_email.lower() in completed_aptitude_emails and not is_advanced_stage:
                continue
        
        result.append({
            "id": r.id, 
            "candidate_name": r.candidate_name,
            "candidate_email": r.candidate_email,
            "candidate_skills": r.candidate_skills,
            "role": r.role, 
            "experience_level": r.experience_level,
            "score": r.score, 
            "email_sent": r.email_sent,
            "resume_screened": getattr(r, 'resume_screened', 'no'),  # Include resume_screened field
            "stage": stage_value,  # Include stage field
            "created_at": r.created_at.isoformat() if r.created_at else None
        })
    
    print(f"✅ Returning {len(result)} candidate records (after filtering aptitude completed)")
    print(f"📊 Breakdown: Total rows={len(rows)}, Filtered out={len(rows) - len(result)}, Final result={len(result)}")
    return result

@router.patch("/candidates/{candidate_id}/stage")
def update_candidate_stage_endpoint(
    candidate_id: int,
    payload: StageUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """
    Update candidate stage in candidate_records and sync with other tables.
    """
    try:
        # Get candidate record
        candidate_record = db.query(CandidateRecord).filter(CandidateRecord.id == candidate_id).first()
        if not candidate_record:
            raise HTTPException(status_code=404, detail="Candidate not found")
        
        # Update stage using the utility function to sync all tables
        if candidate_record.candidate_email:
            success = update_candidate_stage_all_tables(db, candidate_record.candidate_email, payload.stage)
            if success:
                return JSONResponse({
                    "success": True,
                    "message": f"Stage updated to '{payload.stage}' for candidate {candidate_record.candidate_name}",
                    "candidate_id": candidate_id,
                    "email": candidate_record.candidate_email,
                    "new_stage": payload.stage
                })
            else:
                raise HTTPException(status_code=500, detail="Failed to update candidate stage")
        else:
            raise HTTPException(status_code=400, detail="Candidate email not found")
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating candidate stage: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error updating candidate stage: {str(e)}")

@router.post("/sync-stages")
def sync_candidate_stages_endpoint(db: Session = Depends(get_db)):
    """
    Sync candidate stages based on scores in candidate_records table.
    This fixes candidates who have been screened but their stages weren't updated correctly.
    """
    try:
        print("=" * 60)
        print("Syncing Candidate Stages Based on Scores")
        print("=" * 60)
        print(f"Score Threshold: {SCORE_THRESHOLD}")
        print()
        
        # 1. Update candidate_records stages based on scores
        print("1️⃣ Updating candidate_records stages...")
        update_records_query = text("""
            UPDATE candidate_records 
            SET stage = CASE 
                WHEN score IS NULL THEN 'Applied'
                WHEN score < :threshold THEN 'Rejected'
                ELSE 'Applied'
            END
            WHERE (stage IS NULL 
               OR (score IS NOT NULL AND score < :threshold AND stage NOT IN ('Screening', 'Interview', 'Offer', 'Hired') AND stage != 'Rejected')
               OR (score IS NOT NULL AND score >= :threshold AND stage = 'Rejected' AND stage NOT IN ('Screening', 'Interview', 'Offer', 'Hired')))
        """)
        
        result = db.execute(update_records_query, {"threshold": SCORE_THRESHOLD})
        db.commit()
        records_updated = result.rowcount
        print(f"   ✅ Updated {records_updated} candidate_records")
        
        # 2. Update candidate table stages based on candidate_records
        print("\n2️⃣ Syncing candidate table stages from candidate_records...")
        sync_candidates_query = text("""
            UPDATE candidate c
            SET stage = cr.stage
            FROM candidate_records cr
            WHERE LOWER(TRIM(c.email)) = LOWER(TRIM(cr.candidate_email))
              AND cr.stage IS NOT NULL
              AND (c.stage IS NULL 
                   OR (c.stage NOT IN ('Screening', 'Interview', 'Offer', 'Hired') AND c.stage != cr.stage))
        """)
        
        result = db.execute(sync_candidates_query)
        db.commit()
        candidates_updated = result.rowcount
        print(f"   ✅ Updated {candidates_updated} candidate records")
        
        # 3. Update application table stages based on candidate_records
        print("\n3️⃣ Syncing application table stages from candidate_records...")
        sync_applications_from_records_query = text("""
            UPDATE application a
            SET stage = cr.stage,
                updated_at = CURRENT_TIMESTAMP
            FROM candidate_records cr
            WHERE LOWER(TRIM(a.candidate_email)) = LOWER(TRIM(cr.candidate_email))
              AND cr.stage IS NOT NULL
              AND (a.stage IS NULL 
                   OR (a.stage NOT IN ('Screening', 'Interview', 'Offer', 'Hired') AND a.stage != cr.stage))
        """)
        
        result = db.execute(sync_applications_from_records_query)
        db.commit()
        applications_from_records_updated = result.rowcount
        print(f"   ✅ Updated {applications_from_records_updated} application records from candidate_records")
        
        # 4. Update application table stages based on candidate table
        print("\n4️⃣ Syncing application table stages from candidate table...")
        sync_applications_from_candidate_query = text("""
            UPDATE application a
            SET stage = c.stage,
                updated_at = CURRENT_TIMESTAMP
            FROM candidate c
            WHERE a.candidate_id = c.id
              AND c.stage IS NOT NULL
              AND (a.stage IS NULL 
                   OR (a.stage NOT IN ('Screening', 'Interview', 'Offer', 'Hired') AND a.stage != c.stage))
        """)
        
        result = db.execute(sync_applications_from_candidate_query)
        db.commit()
        applications_from_candidate_updated = result.rowcount
        print(f"   ✅ Updated {applications_from_candidate_updated} application records from candidate table")
        
        # 5. Show statistics
        print("\n5️⃣ Current Statistics:")
        
        # Count by stage in candidate_records
        stats_query = text("""
            SELECT 
                stage,
                COUNT(*) as count,
                AVG(score) as avg_score,
                COUNT(CASE WHEN score IS NULL THEN 1 END) as null_scores
            FROM candidate_records
            GROUP BY stage
            ORDER BY stage
        """)
        
        stats = db.execute(stats_query).fetchall()
        stats_list = []
        for stage, count, avg_score, null_scores in stats:
            avg_str = f"{avg_score:.2f}" if avg_score else "N/A"
            null_str = f" ({null_scores} NULL scores)" if null_scores > 0 else ""
            stats_list.append({
                "stage": stage,
                "count": count,
                "avg_score": float(avg_score) if avg_score else None,
                "null_scores": null_scores
            })
        
        return JSONResponse({
            "success": True,
            "message": "Stages synced successfully",
            "records_updated": records_updated,
            "candidates_updated": candidates_updated,
            "applications_from_records_updated": applications_from_records_updated,
            "applications_from_candidate_updated": applications_from_candidate_updated,
            "statistics": stats_list
        })
        
    except Exception as e:
        print(f"\n❌ Error during sync: {e}")
        import traceback
        traceback.print_exc()
        return JSONResponse({
            "success": False,
            "message": f"Error syncing stages: {str(e)}"
        }, status_code=500)

@router.post("/process")
async def process_resume(
    file: UploadFile = File(...),
    role: str = Form(...),
    experience_level: str = Form(...),
    db: Session = Depends(get_db)
):
    # 1) Extract resume text
    content = await file.read()
    try:
        resume_text = extract_text(file.filename, content)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))

    # 2) Extract fields with AI
    fields = ai_extract_fields(resume_text)
    name, email, skills, exp_summary = (
        fields["name"], fields["email"], fields["skills"], fields["experience_summary"]
    )

    # Check if this candidate's resume has already been screened
    if email:
        email_normalized = email.lower().strip()
        try:
            # Try to check if resume_screened column exists and if candidate was already screened
            existing_record = db.query(CandidateRecord).filter(
                func.lower(func.trim(CandidateRecord.candidate_email)) == email_normalized
            ).first()
            
            # Check if resume_screened attribute exists and is "yes"
            if existing_record and hasattr(existing_record, 'resume_screened') and getattr(existing_record, 'resume_screened', 'no') == "yes":
                raise HTTPException(
                    status_code=400, 
                    detail=f"Resume for {email} has already been screened. Cannot screen again."
                )
        except Exception as e:
            # If column doesn't exist, log and continue (will be handled by migration)
            if "resume_screened" in str(e) or "does not exist" in str(e):
                print(f"⚠️ Warning: resume_screened column may not exist yet: {e}")
            else:
                raise

    # 3) Generate JD with AI
    jd_text = ai_generate_jd(role, experience_level)

    # 4) Compare & Score
    score = ai_similarity_score(resume_text, jd_text)
    
    # Ensure score is not None (handle edge cases)
    if score is None:
        score = 0.0
        print(f"⚠️ Warning: Score was None for {email}, setting to 0.0")

    # 5) Save ALL candidates (both shortlisted and rejected) to prevent duplicate screening
    email_status = "skipped"
    save_path = os.path.join("uploads", file.filename)
    os.makedirs("uploads", exist_ok=True)
    with open(save_path, "wb") as f:
        f.write(content)

    # Determine initial stage based on score
    initial_stage = "Rejected" if score < SCORE_THRESHOLD else "Applied"
    
    # Create record with resume_screened field (handle if column doesn't exist yet)
    rec_data = {
        "role": role,
        "experience_level": experience_level,
        "candidate_name": name,
        "candidate_email": email,
        "candidate_skills": ", ".join(skills) if isinstance(skills, list) else str(skills),
        "candidate_experience_text": exp_summary,
        "resume_text": resume_text[:25000],
        "jd_text": jd_text[:25000],
        "score": score,
        "resume_filename": file.filename,
        "email_sent": "no",
        "stage": initial_stage
    }
    
    # Only add resume_screened if the column exists in the model
    if hasattr(CandidateRecord, 'resume_screened'):
        rec_data["resume_screened"] = "yes"  # Mark as screened
    
    rec = CandidateRecord(**rec_data)
    db.add(rec)
    db.commit()
    db.refresh(rec)
    rec_id = rec.id

    # 6) Create/Update Candidate record (SQLModel) to keep both tables in sync
    if email:
        try:
            # Normalize email for matching (lowercase, trim)
            email_normalized = email.lower().strip()
            
            # Check if Candidate record exists (case-insensitive email matching)
            try:
                statement = select(Candidate).where(func.lower(func.trim(Candidate.email)) == email_normalized)
                candidate = db.exec(statement).first()
            except AttributeError:
                # Fallback to SQLAlchemy query() if exec() not available
                candidate = db.query(Candidate).filter(
                    func.lower(func.trim(Candidate.email)) == email_normalized
                ).first()
            
            if not candidate:
                # Create new Candidate record if it doesn't exist
                candidate = Candidate(
                    name=name,
                    email=email,  # Store original email format
                    role=role,
                    skills=", ".join(skills) if isinstance(skills, list) else str(skills),
                    stage=initial_stage,
                    resume_url=f"uploads/{file.filename}" if file.filename else None
                )
                db.add(candidate)
                db.commit()
                print(f"✅ Created Candidate record for {email} with stage '{initial_stage}'")
            else:
                # Update existing Candidate record
                candidate.stage = initial_stage
                candidate.role = role
                candidate.skills = ", ".join(skills) if isinstance(skills, list) else str(skills)
                if not candidate.resume_url and file.filename:
                    candidate.resume_url = f"uploads/{file.filename}"
                db.add(candidate)
                db.commit()
                print(f"✅ Updated Candidate.stage to '{initial_stage}' for {email}")
        except Exception as e:
            print(f"Warning: Could not create/update Candidate record: {e}")
            import traceback
            traceback.print_exc()
            # Continue even if Candidate table update fails
    
    # 7) Send email ONLY if shortlisted (score >= threshold)
    if score >= SCORE_THRESHOLD and email:
        ok, msg = send_email_smtp(name, email, score, role)
        rec.email_sent = "yes" if ok else f"error: {msg}"
        rec.stage = "Applied"  # Ensure stage is "Applied" for shortlisted
        db.add(rec)
        db.commit()
        email_status = rec.email_sent
        # 🔥 STAGE MANAGEMENT: Ensure Candidate table is also updated
        try:
            if email:
                update_candidate_stage_all_tables(db, email, "Applied")
        except Exception as e:
            print(f"Warning: Could not update candidate stage: {e}")
    elif score < SCORE_THRESHOLD:
        # 🔥 REJECTED: Stage already set to "Rejected" above
        email_status = "not_sent_rejected"
        # Ensure stage is "Rejected" in candidate_records
        rec.stage = "Rejected"
        db.add(rec)
        db.commit()
        # 🔥 STAGE MANAGEMENT: Update Candidate table (SQLModel) to "Rejected" as well
        try:
            if email:
                update_candidate_stage_all_tables(db, email, "Rejected")
        except Exception as e:
            print(f"Warning: Could not update candidate stage: {e}")
        
        # 🔥 APPLICATION MANAGEMENT: Update all Application records for this candidate to "Rejected"
        try:
            if email:
                # Use raw SQL to update all Application records with stage "Applied" to "Rejected"
                # This handles both candidate_id and candidate_email matches
                try:
                    result = db.execute(
                        text("""
                            UPDATE application 
                            SET stage = 'Rejected',
                                updated_at = CURRENT_TIMESTAMP
                            WHERE (candidate_email = :email OR candidate_id IN (
                                SELECT id FROM candidate WHERE email = :email
                            ))
                            AND (stage = 'Applied' OR stage IS NULL)
                        """),
                        {"email": email}
                    )
                    db.commit()
                    sql_updated = result.rowcount
                    if sql_updated > 0:
                        print(f"✅ Updated {sql_updated} Application record(s) to 'Rejected' for {email}")
                except Exception as sql_error:
                    print(f"Warning: SQL update failed: {sql_error}")
                    # Fallback to ORM approach
                    try:
                        # Find candidate_id from Candidate table
                        candidate = None
                        try:
                            statement = select(Candidate).where(Candidate.email == email)
                            candidate = db.exec(statement).first()
                        except AttributeError:
                            candidate = db.query(Candidate).filter(Candidate.email == email).first()
                        
                        updated_apps = set()  # Track updated application IDs to avoid duplicates
                        
                        # Update by candidate_id
                        if candidate:
                            applications = db.query(Application).filter(
                                Application.candidate_id == candidate.id
                            ).all()
                            
                            for app in applications:
                                if (app.stage == "Applied" or app.stage is None):
                                    app.stage = "Rejected"
                                    db.add(app)
                                    updated_apps.add(app.id)
                        
                        # Update by email (avoid duplicates)
                        applications_by_email = db.query(Application).filter(
                            Application.candidate_email == email
                        ).all()
                        
                        for app in applications_by_email:
                            if app.id not in updated_apps:
                                if (app.stage == "Applied" or app.stage is None):
                                    app.stage = "Rejected"
                                    db.add(app)
                                    updated_apps.add(app.id)
                        
                        if updated_apps:
                            db.commit()
                            print(f"✅ Updated {len(updated_apps)} Application record(s) to 'Rejected' for {email} (ORM fallback)")
                    except Exception as orm_error:
                        print(f"Warning: ORM update also failed: {orm_error}")
                    
        except Exception as e:
            print(f"Warning: Could not update Application records: {e}")
            import traceback
            traceback.print_exc()
    else:
        email_status = "no_email_provided"

    return JSONResponse({
        "id": rec_id,
        "role": role,
        "experience_level": experience_level,
        "candidate": {"name": name, "email": email, "skills": skills, "experience_summary": exp_summary},
        "jd_preview": jd_text[:600],
        "score": score,
        "threshold": SCORE_THRESHOLD,
        "status": "shortlisted" if score >= SCORE_THRESHOLD else "rejected",
        "email_status": email_status
    })
