// API Configuration
// Base URL for all backend API calls

// Development environment
export const BASE_URL = 'http://localhost:8000';

// For production, you can use environment variable:
// export const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    SIGNUP: '/api/auth/signup',
    LOGIN: '/api/auth/login-json',
    LOGIN_FORM: '/api/auth/login',
    CURRENT_USER: '/api/auth/me',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
  },
  
  // Jobs (Note: create.py and update.py have double prefix, others have single)
  JOBS: {
    CREATE: '/api/jobs/api/jobs/create',  // Double prefix (create.py has prefix)
    LIST: '/api/jobs/list',                // Single prefix
    GET: (id) => `/api/jobs/${id}`,        // Single prefix
    UPDATE: (id) => `/api/jobs/api/jobs/update/${id}`,  // Double prefix (update.py has prefix)
    DELETE: (id) => `/api/jobs/delete/${id}`,  // Single prefix
    SEARCH: '/api/jobs/search',            // Single prefix
  },
  
  // Candidates
  CANDIDATES: {
    LIST: '/api/candidates/list',
    GET: (id) => `/api/candidates/${id}`,
    PROFILE: '/api/candidates/profile',
    APPLICATIONS: '/api/candidates/applications',
    SAVED_JOBS: '/api/candidates/saved-jobs',
    SAVE_JOB: (id) => `/api/candidates/save-job/${id}`,
    APPLY: (jobId) => `/api/candidates/apply/${jobId}`,
  },
  
  // Pipeline
  PIPELINE: {
    STAGES: '/api/pipeline/stages',
    STAGE: (id) => `/api/pipeline/stages/${id}`,
    CANDIDATES: '/api/pipeline/candidates',
    MOVE_CANDIDATE: (id) => `/api/pipeline/candidates/${id}/move`,
  },
  
  // Analytics
  ANALYTICS: {
    HIRING_FUNNEL: '/api/hiring_funnel',
    TIME_TO_HIRE: '/api/time_to_hire',
    RECRUITER_STATS: '/api/recruiter_dashboard/analytics',
    APPLICATIONS_OVER_TIME: '/api/recruiter_dashboard/analytics/applications-over-time',
  },
  
  // Assessments
  ASSESSMENTS: {
    LIST: '/api/assessments',
    CREATE: '/api/assessments',
    ASSIGN: '/api/assignments',
    RESULTS: (candidateId) => `/api/assessment_results/candidates/${candidateId}`,
  },
  
  // AI Interviews
  INTERVIEWS: {
    CREATE: '/api/interviews',
    QUESTIONS: (id) => `/api/interviews/${id}/questions`,
    ANSWERS: (id) => `/api/interviews/${id}/answers`,
    RESULTS: (id) => `/api/interviews/${id}/results`,
  },
  
  // HR Automation
  HR: {
    ATTENDANCE: '/api/attendance',
    LEAVE: '/api/leave',
    LEAVE_APPROVE: (id) => `/api/leave/${id}/approve`,
    LEAVE_REJECT: (id) => `/api/leave/${id}/reject`,
    TASKS: '/api/tasks',
    TASK: (id) => `/api/tasks/${id}`,
    ONBOARDING_CANDIDATES: '/api/candidates',
    UPLOAD_DOCUMENT: (id) => `/api/uploads/${id}`,
  },
  
  // Resume Parsing & AI Screening
  RESUME: {
    PARSE: '/api/resume/parse',
    MATCH: '/api/resume/match',
    PROCESS: '/api/resume/process',      // AI screening endpoint
    CANDIDATES: '/api/resume/candidates', // Get AI-screened candidates
  },
  
  // Admin
  ADMIN: {
    USERS: '/api/admin/users',
    USER: (id) => `/api/admin/users/${id}`,
    SUMMARY: '/api/admin/superadmin/summary',
  },
  
  // Offers
  OFFERS: {
    TEMPLATES: '/api/offers/offer-templates',
    TEMPLATE: (id) => `/api/offers/offer-templates/${id}`,
    TRACKING: '/api/offers/offer-tracking',
    TRACKING_ITEM: (id) => `/api/offers/offer-tracking/${id}`,
    UPDATE_STATUS: (id) => `/api/offers/offer-tracking/${id}/status`,
    STATS: '/api/offers/offer-tracking/stats',
  },
  
  // Test endpoint
  TEST: '/api/test',
};

// Helper function to build full URL
export const buildUrl = (endpoint) => {
  return `${BASE_URL}${endpoint}`;
};

export default {
  BASE_URL,
  API_ENDPOINTS,
  buildUrl,
};

