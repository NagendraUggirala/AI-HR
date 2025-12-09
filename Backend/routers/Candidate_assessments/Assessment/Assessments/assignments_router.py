from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from core.database import get_db
from schema.assignment import AssignmentCreate, AssignmentOut
from routers.Candidate_assessments.Assessment.Assessments.services import assignment_service
from routers.Candidate_assessments.Assessment.Assessments.services.results_service import get_all_assessment_results
from core.dependencies import get_current_user
from models import User
from typing import List, Dict, Any

router = APIRouter(prefix="/assignments", tags=["Assignments"])

@router.post("/", response_model=AssignmentOut)
def assign(data: AssignmentCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return assignment_service.create_assignment(db, data, user)

@router.get("/", response_model=List[AssignmentOut])
def list_assignments(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return assignment_service.get_assignments(db, user)

@router.get("/with-status", response_model=List[Dict[str, Any]])
def list_assignments_with_completion_status(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """
    Get assignments with actual completion status by checking test completion tables
    """
    return assignment_service.get_assignments_with_completion_status(db, user)

@router.get("/all-results", response_model=List[Dict[str, Any]])
def get_all_results(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """
    Get all assessment results directly from result tables (aptitude, communication, coding)
    without requiring assignments. Groups results by candidate email.
    Filtered by recruiter.
    """
    return get_all_assessment_results(db, user)
