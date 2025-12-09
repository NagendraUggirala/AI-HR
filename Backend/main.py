from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel
from sqlalchemy import select, func
from core.database import engine, Base
import os

# -------------------------
# --- Routers -------------
# -------------------------
from routers.admin_users.auth import router as auth_router, get_current_user
from routers.jobs import router as jobs_router
from routers.admin_users.admin import router as admin_router
from routers.candidates import router as candidates_router
from routers.admin_users.recruiter_dashboard import router as recruiter_dashboard_router
from routers.pipeline import router as pipeline_router
from routers.Analytics_Dashboard.analytics import router as analytics_router
from routers.HR_Automation.digital_signature.routers.documents import router as documents_router
from routers.HR_Automation.digital_signature.routers.signatures import router as signatures_router
from routers.Candidate_assessments.Assessment.Assessments.assessments_router import router as assessments_router
from routers.Candidate_assessments.Assessment.Assessments.assignments_router import router as assignments_router
from routers.Candidate_assessments.Assessment.Assessments.ai_interview_router import router as ai_interview_router
from routers.Candidate_assessments.Assessment.communication.comm_routes import router as comm_router
from routers.Candidate_assessments.Assessment.coding.coding import router as codind_router
from routers.Candidate_assessments.Assessment.Assessments.Assessment_Result.candidates import router as candidates_result_router
from routers.Candidate_assessments.Assessment.aptitude.routers import exam, otp, results as aptitude_results
from routers.Basic_analytics.hiring_funnel.routers import hiring_funnel
from routers.Basic_analytics.hiring_funnel.routers.hiring_funnel import router as time_hire
from routers.HR_Automation.Task_Management.router.tasks_router import router as tasks_router
from routers.Resume_parsing.routers.resume_router import router as resume_router
from routers.admin_users.send_assessment_email import router as email_router
from routers.offers.offer_template_router import router as offer_template_router
from routers.offers.offer_tracking_router import router as offer_tracking_router
from routers.HR_Automation.Onboarding.routers import candidates, uploads
from routers.HR_Automation.attendance.routers import attendance, leave
from routers.AI_Interview_Bot.routes import interviews

# -------------------------
# --- Import for SQLAdmin (Admin Dashboard) ---
# -------------------------
from sqladmin import Admin, ModelView
from models import User
from fastapi_mail import FastMail, MessageSchema, MessageType, ConnectionConfig

# -------------------------
# --- Email Config (reuse env) ---
# -------------------------
conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("EMAIL_USER"),
    MAIL_PASSWORD=os.getenv("EMAIL_PASS"),
    MAIL_FROM=os.getenv("EMAIL_USER"),
    MAIL_PORT=587,
    MAIL_SERVER="smtp.gmail.com",
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

# -------------------------
# --- Initialize FastAPI ---
# -------------------------
app = FastAPI(title="AI Recruitment HR Platform")

# -------------------------
# --- Enable CORS ---------
# -------------------------
origins = ["http://localhost:3000", "http://127.0.0.1:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------
# --- Startup Event -------
# -------------------------
@app.on_event("startup")
def on_startup():
    SQLModel.metadata.create_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    # Optional: seed a Super Admin if none exists
    from sqlmodel import Session, select
    with Session(engine) as session:
        from models import User
        superadmin = session.exec(select(User).where(User.role == "superadmin")).first()
        if not superadmin:
            from passlib.context import CryptContext
            pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
            user = User(
                name="Super Admin",
                username="superadmin",
                email="superadmin@example.com",
                hashed_password=pwd_context.hash("admin123"),
                role="superadmin",
                is_active=True
            )
            session.add(user)
            session.commit()
            print("✅ Default Super Admin created: superadmin@example.com / admin123")

# -------------------------
# --- Super Admin Protection ---
# -------------------------
def super_admin_required(current_user=Depends(get_current_user)):
    if not current_user or getattr(current_user, "role", None).lower() != "superadmin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    return current_user

# -------------------------
# --- Enhanced User Admin Dashboard ---
# -------------------------
class UserAdmin(ModelView, model=User):
    column_list = [User.id, User.username, User.email, User.role, User.is_active, User.created_at]
    form_columns = [User.username, User.email, User.role, User.is_active]
    column_searchable_list = [User.username, User.email, User.role]
    column_sortable_list = [User.id, User.created_at]
    name = "User"
    name_plural = "Users"
    icon = "fa-solid fa-user"

    # --- Show pending inactive users count ---
    async def get_badge(self, request: Request):
        async with request.state.sessionmaker() as session:
            result = await session.execute(select(func.count()).where(User.is_active == False))
            count = result.scalar_one()
            return str(count) if count > 0 else None

    # --- Send activation email automatically ---
    async def after_model_change(self, data, model, is_created, request: Request):
        if not is_created and getattr(model, "is_active", False):
            fm = FastMail(conf)
            message = MessageSchema(
                subject="Your Account Has Been Activated",
                recipients=[model.email],
                body=f"""
Hi {model.username or model.name},

Your account has been activated by the Super Admin.
You can now log in and start using the platform.

Login URL: http://localhost:3000/login

Best Regards,
HR Automation System
""",
                subtype=MessageType.plain,
            )
            try:
                await fm.send_message(message)
                print(f"📧 Activation email sent to {model.email}")
            except Exception as e:
                print(f"[WARN] Failed to send activation email to {model.email}: {e}")

        return await super().after_model_change(data, model, is_created, request)

# -------------------------
# --- Initialize Admin ---
# -------------------------
admin = Admin(app=app, engine=engine, title="Super Admin Dashboard")
admin.add_view(UserAdmin)

# -------------------------
# --- Include Routers -----
# -------------------------
app.include_router(auth_router)
app.include_router(jobs_router)
app.include_router(admin_router, prefix="/api/admin", tags=["Admin"])
app.include_router(candidates_router)
app.include_router(pipeline_router)
app.include_router(recruiter_dashboard_router, prefix="/api/recruiter_dashboard", tags=["Recruiter Dashboard"])
app.include_router(analytics_router)
app.include_router(assessments_router)
app.include_router(assignments_router)
app.include_router(candidates_result_router, prefix="/api/assessment_results", tags=["Assessment Results"])
app.include_router(ai_interview_router)
app.include_router(comm_router, prefix="/comm", tags=["Communication Exam"])
app.include_router(codind_router, prefix="/coding", tags=["Coding Exam"])
app.include_router(exam.router, prefix="/api/assessment/aptitude", tags=["Aptitude Exam"])
app.include_router(aptitude_results.router, prefix="/api/assessment/aptitude", tags=["Aptitude Results"])
app.include_router(hiring_funnel.router, prefix="/api/hiring_funnel", tags=["Hiring Funnel"])
app.include_router(time_hire, prefix="/api/time_to_hire", tags=["Time to Hire"])
app.include_router(attendance.router, prefix="/api/attendance", tags=["Attendance"])
app.include_router(leave.router, prefix="/api/leave", tags=["Leave"])
app.include_router(documents_router, prefix="/api/documents", tags=["Documents"])
app.include_router(signatures_router, prefix="/api/signatures", tags=["Signatures"])
app.include_router(candidates.router, prefix="/api/candidates", tags=["Candidates"])
app.include_router(uploads.router, prefix="/api/uploads", tags=["Uploads"])
app.include_router(tasks_router, prefix="/api/tasks", tags=["Tasks"])
app.include_router(resume_router, prefix="/api/resume", tags=["Resume AI"])
app.include_router(interviews.router, prefix="/api/interviews", tags=["Interviews"])
app.include_router(email_router, tags=["Email"])
app.include_router(offer_template_router, prefix="/api/offers", tags=["Offer Templates"])
app.include_router(offer_tracking_router, prefix="/api/offers", tags=["Offer Tracking"])

# -------------------------
# --- Static Files --------
# -------------------------
uploads_dir = "uploads"
if not os.path.exists(uploads_dir):
    os.makedirs(uploads_dir)
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

# -------------------------
# --- Test Endpoint -------
# -------------------------
@app.get("/api/test")
def test_api():
    return {"message": "Backend is working and CORS is enabled!"}
