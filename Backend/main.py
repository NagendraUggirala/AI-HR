# main.py
import os
import base64
from fastapi import FastAPI, Request
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlmodel import SQLModel, Session, select
from core.database import engine, Base
from model.models import User

# Debug info
import sqladmin, inspect
print(">>> SQLADMIN VERSION:", sqladmin.__version__)
print(">>> SQLADMIN FILE:", inspect.getfile(sqladmin))

# -------------------------------------------------------
# CREATE FASTAPI APP  (THIS MUST COME FIRST)
# -------------------------------------------------------
app = FastAPI(title="AI Recruitment HR Platform")


# -------------------------------------------------------
# ADMIN BASIC AUTH MIDDLEWARE
# -------------------------------------------------------
@app.middleware("http")
async def admin_protect(request: Request, call_next):

    if request.url.path.startswith("/admin"):
        auth = request.headers.get("Authorization")

        if not auth or not auth.startswith("Basic "):
            return Response(
                status_code=401,
                headers={
                    "WWW-Authenticate": 'Basic realm="AdminPanel"',
                    "Cache-Control": "no-store"
                },
                content="Authentication required"
            )

        try:
            encoded = auth.split(" ")[1]
            decoded = base64.b64decode(encoded).decode()
            username, password = decoded.split(":", 1)

            ADMIN_USERNAME = os.getenv("ADMIN_USERNAME")
            ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")

            if username != ADMIN_USERNAME or password != ADMIN_PASSWORD:
                return Response(
                    status_code=401,
                    headers={
                        "WWW-Authenticate": 'Basic realm="AdminPanel"',
                        "Cache-Control": "no-store"
                    },
                    content="Invalid username or password"
                )

        except Exception:
            return Response(
                status_code=401,
                headers={
                    "WWW-Authenticate": 'Basic realm="AdminPanel"',
                    "Cache-Control": "no-store"
                },
                content="Invalid authentication format"
            )

    return await call_next(request)


# -------------------------------------------------------
# IMPORT ROUTERS
# -------------------------------------------------------
from routers.admin_users.auth import router as auth_router
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
from routers.Candidate_assessments.Assessment.coding.coding import router as coding_router
from routers.Candidate_assessments.Assessment.Assessments.Assessment_Result.candidates import router as candidates_result_router
from routers.Candidate_assessments.Assessment.aptitude.routers import exam, results as aptitude_results
from routers.Basic_analytics.hiring_funnel.routers.hiring_funnel import router as hiring_funnel_router
from routers.Basic_analytics.hiring_funnel.routers.hiring_funnel import router as time_hire_router
from routers.HR_Automation.Task_Management.router.tasks_router import router as tasks_router
from routers.Resume_parsing.routers.resume_router import router as resume_router
from routers.admin_users.send_assessment_email import router as email_router
from routers.offers.offer_template_router import router as offer_template_router
from routers.offers.offer_tracking_router import router as offer_tracking_router
from routers.HR_Automation.Onboarding.routers import candidates as onboard_candidates, uploads
from routers.HR_Automation.attendance.routers import attendance, leave
from routers.AI_Interview_Bot.routes import interviews


# -------------------------------------------------------
# CORS
# -------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------------------------------------------------------
# STARTUP — CREATE TABLES & DEFAULT SUPERADMIN
# -------------------------------------------------------
@app.on_event("startup")
def on_startup():
    SQLModel.metadata.create_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    with Session(engine) as session:
        superadmin = session.exec(select(User).where(User.role == "superadmin")).first()

        if not superadmin:
            from passlib.context import CryptContext
            pwd = CryptContext(schemes=["bcrypt"])

            user = User(
                name="Super Admin",
                username="superadmin",
                email="superadmin@example.com",
                hashed_password=pwd.hash("admin123"),
                role="superadmin",
                is_active=True,
            )
            session.add(user)
            session.commit()
            print(" Default Super Admin created: superadmin / admin123")


# -------------------------------------------------------
# SQLADMIN PANEL
# -------------------------------------------------------
from sqladmin import Admin, ModelView

class UserAdmin(ModelView, model=User):
    column_list = [User.id, User.username, User.email, User.role, User.is_active, User.created_at]
    form_columns = [User.username, User.email, User.role, User.is_active]
    name = "User"
    name_plural = "Users"
    icon = "fa-solid fa-user"

admin = Admin(app=app, engine=engine, title="Super Admin Dashboard")
admin.add_view(UserAdmin)


# -------------------------------------------------------
# ROUTE REGISTRATION
# -------------------------------------------------------
app.include_router(auth_router)
app.include_router(jobs_router)
app.include_router(admin_router, prefix="/api/admin")
app.include_router(candidates_router)
app.include_router(pipeline_router)
app.include_router(recruiter_dashboard_router, prefix="/api/recruiter_dashboard")
app.include_router(analytics_router)
app.include_router(assessments_router)
app.include_router(assignments_router)
app.include_router(candidates_result_router, prefix="/api/assessment_results")
app.include_router(ai_interview_router)
app.include_router(comm_router, prefix="/comm")
app.include_router(coding_router, prefix="/coding")
app.include_router(exam.router, prefix="/api/assessment/aptitude")
app.include_router(aptitude_results.router, prefix="/api/assessment/aptitude")
app.include_router(hiring_funnel_router, prefix="/api/hiring_funnel")
app.include_router(time_hire_router, prefix="/api/time_to_hire")
app.include_router(attendance.router, prefix="/api/attendance")
app.include_router(leave.router, prefix="/api/leave")
app.include_router(documents_router, prefix="/api/documents")
app.include_router(signatures_router, prefix="/api/signatures")
app.include_router(onboard_candidates.router, prefix="/api/candidates")
app.include_router(uploads.router, prefix="/api/uploads")
app.include_router(tasks_router, prefix="/api/tasks")
app.include_router(resume_router, prefix="/api/resume")
app.include_router(interviews.router, prefix="/api/interviews")
app.include_router(email_router)
app.include_router(offer_template_router, prefix="/api/offers")
app.include_router(offer_tracking_router, prefix="/api/offers")


# -------------------------------------------------------
# STATIC FILES
# -------------------------------------------------------
if not os.path.exists("uploads"):
    os.makedirs("uploads")

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


# -------------------------------------------------------
# TEST ENDPOINT
# -------------------------------------------------------
@app.get("/api/test")
def test_api():
    return {"message": "Backend is working correctly!"}
