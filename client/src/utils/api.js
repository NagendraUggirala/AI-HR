// API Utility for Backend Communication
import { BASE_URL, API_ENDPOINTS } from '../config/api.config';

// Get JWT token from localStorage
const getToken = () => localStorage.getItem('token');

// Generic API call function with error handling
export const apiCall = async (endpoint, options = {}) => {
  const token = getToken();
  
  const config = {
    ...options,
    headers: {
      ...options.headers,
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    
    // Handle successful responses
    if (response.ok) {
      // Check if response has content
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      return null;
    } else {
      // Handle error responses
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `API Error: ${response.status}`);
    }
  } catch (err) {
    console.error('API Call Error:', err);
    throw err;
  }
};

// ==========================================
// AUTHENTICATION APIs
// ==========================================
export const authAPI = {
  // Login
  login: (email, password) => 
    apiCall('/api/auth/login-json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    }),

  // Signup
  signup: (userData) => 
    apiCall('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    }),

  // Get current user
  getCurrentUser: () => 
    apiCall('/api/auth/me'),

  // Forgot password
  forgotPassword: (email) => 
    apiCall('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    }),

  // Reset password
  resetPassword: (token, newPassword) => 
    apiCall('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, new_password: newPassword })
    })
};

// ==========================================
// JOB APIs
// ==========================================
export const jobAPI = {
  // Create job (with file upload)
  create: (formData) => 
    apiCall('/api/jobs/create', {
      method: 'POST',
      body: formData // FormData for file upload
    }),

  // List all jobs
  list: () => 
    apiCall('/api/jobs/list'),

  // Get job by ID
  getById: (id) => 
    apiCall(`/api/jobs/${id}`),

  // Update job
  update: (id, formData) => 
    apiCall(`/api/jobs/update/${id}`, {
      method: 'PUT',
      body: formData
    }),

  // Delete job
  delete: (id) => 
    apiCall(`/api/jobs/delete/${id}`, {
      method: 'DELETE'
    }),

  // Search jobs
  search: (query) => 
    apiCall(`/api/jobs/search?q=${encodeURIComponent(query)}`)
};

// ==========================================
// CANDIDATE APIs
// ==========================================
export const candidateAPI = {
  // List all candidates
  list: () => 
    apiCall('/api/candidates/list'),

  // Get candidate by ID
  getById: (id) => 
    apiCall(`/api/candidates/${id}`),

  // Apply to job
  apply: (jobId, applicationData) => 
    apiCall(`/api/candidates/apply/${jobId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(applicationData)
    }),

  // Get candidate profile
  getProfile: () => 
    apiCall('/api/candidates/profile'),

  // Update candidate profile
  updateProfile: (profileData) => 
    apiCall('/api/candidates/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData)
    }),

  // Get job applications
  getApplications: () => 
    apiCall('/api/candidates/applications'),

  // Get saved jobs
  getSavedJobs: () => 
    apiCall('/api/candidates/saved-jobs'),

  // Save job
  saveJob: (jobId) => 
    apiCall(`/api/candidates/save-job/${jobId}`, {
      method: 'POST'
    })
};

// ==========================================
// PIPELINE APIs
// ==========================================
export const pipelineAPI = {
  // Get pipeline stages
  getStages: () => 
    apiCall('/api/pipeline/stages'),

  // Create stage
  createStage: (stageName, order) => 
    apiCall('/api/pipeline/stages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: stageName, order })
    }),

  // Update stage
  updateStage: (stageId, stageData) => 
    apiCall(`/api/pipeline/stages/${stageId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(stageData)
    }),

  // Delete stage
  deleteStage: (stageId) => 
    apiCall(`/api/pipeline/stages/${stageId}`, {
      method: 'DELETE'
    }),

  // Get candidates in pipeline
  getCandidates: (jobId) => 
    apiCall(`/api/pipeline/candidates?job_id=${jobId}`),

  // Move candidate to stage
  moveCandidate: (candidateId, stageId) => 
    apiCall(`/api/pipeline/candidates/${candidateId}/move`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage_id: stageId })
    })
};

// ==========================================
// ANALYTICS APIs
// ==========================================
export const analyticsAPI = {
  // Get hiring funnel data
  getHiringFunnel: () => 
    apiCall('/api/hiring_funnel'),

  // Get time to hire metrics
  getTimeToHire: () => 
    apiCall('/api/time_to_hire'),

  // Get recruiter dashboard stats
  getRecruiterStats: () => 
    apiCall('/api/recruiter_dashboard/analytics'),

  // Get applications over time
  getApplicationsOverTime: (days = 30) => 
    apiCall(`/api/recruiter_dashboard/analytics/applications-over-time?days=${days}`)
};

// ==========================================
// ASSESSMENT APIs
// ==========================================
export const assessmentAPI = {
  // List assessments
  list: () => 
    apiCall('/assessments'),

  // Create assessment
  create: (assessmentData) => 
    apiCall('/assessments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assessmentData)
    }),

  // Get assessment by ID
  getById: (id) =>
    apiCall(`/assessments/${id}`),

  // Update assessment
  update: (id, assessmentData) =>
    apiCall(`/assessments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assessmentData)
    }),

  // Delete assessment
  delete: (id) =>
    apiCall(`/assessments/${id}`, {
      method: 'DELETE'
    }),

  // Assign assessment to candidate
  assign: (candidateId, assessmentId, dueDate) => 
    apiCall('/assignments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        candidate_id: candidateId,
        assessment_id: assessmentId,
        due_date: dueDate
      })
    }),

  // List assignments
  listAssignments: () =>
    apiCall('/assignments'),

  // List assignments with actual completion status
  listAssignmentsWithStatus: () =>
    apiCall('/assignments/with-status'),

  // Get all assessment results directly from result tables
  getAllResults: () =>
    apiCall('/assignments/all-results'),

  // Get test results
  getTestResults: {
    // Get all aptitude test results
    aptitude: () =>
      apiCall('/api/assessment/aptitude/results/all'),
    
    // Get aptitude result by email
    aptitudeByEmail: (email) =>
      apiCall(`/api/assessment/aptitude/results/by-email/${email}`),
    
    // Get aptitude statistics
    aptitudeStats: () =>
      apiCall('/api/assessment/aptitude/results/statistics')
  },

  // Get assessment results
  getResults: (candidateId) => 
    apiCall(`/api/assessment_results/candidates/${candidateId}`),

  // Aptitude Test APIs
  aptitude: {
    sendOTP: (name, email) =>
      apiCall('/api/assessment/aptitude/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email })
      }),
    
    verifyOTP: (email, otp) =>
      apiCall('/api/assessment/aptitude/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      }),
    
    getInstructions: (email = null) => {
      const url = email 
        ? `/api/assessment/aptitude/instructions?email=${encodeURIComponent(email)}`
        : '/api/assessment/aptitude/instructions';
      return apiCall(url);
    },
    
    startExam: (studentId, email) =>
      apiCall('/api/assessment/aptitude/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: studentId, email: email })
      }),
    
    submitExam: (studentId, answers) =>
      apiCall('/api/assessment/aptitude/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: studentId, answers })
      })
  },

  // Coding Test APIs
  coding: {
    sendOTP: (name, email) =>
      apiCall('/coding/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email })
      }),
    
    verifyOTP: (email, otp) =>
      apiCall('/coding/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      }),
    
    getQuestions: () =>
      apiCall('/coding/questions'),
    
    runCode: (name, email, questionTitle, language, code) =>
      apiCall('/coding/run_code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, question_title: questionTitle, language, code })
      }),
    
    submitCode: (name, email, questionTitle, language, code) =>
      apiCall('/coding/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, question_title: questionTitle, language, code })
      }),
    
    finalize: (name, email) =>
      apiCall('/coding/finalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email })
      })
  },

  // Communication Test APIs
  communication: {
    sendOTP: (name, email) =>
      apiCall('/comm/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email })
      }),
    
    verifyOTP: (email, otp) =>
      apiCall('/comm/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      }),
    
    getExam: (name, email) =>
      apiCall(`/comm/exam?name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}`),
    
    submit: (name, email, writingAnswer, listeningAnswer, mcqAnswers) =>
      apiCall('/comm/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          writing_answer: writingAnswer,
          listening_answer: listeningAnswer,
          mcq_answers: mcqAnswers
        })
      })
  }
};

// ==========================================
// AI INTERVIEW APIs
// ==========================================
export const aiInterviewAPI = {
  // Send OTP to candidate
  sendOTP: (email, name) => 
    apiCall('/api/interviews/send_otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name })
    }),

  // Verify OTP
  verifyOTP: (email, otp) => 
    apiCall('/api/interviews/verify_otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp })
    }),

  // Get interview templates
  getTemplates: () => 
    apiCall('/api/interviews/templates'),

  // Get interview questions (from template)
  getQuestions: (templateId = null) => {
    const url = templateId 
      ? `/api/interviews/get_questions?template_id=${templateId}`
      : '/api/interviews/get_questions';
    return apiCall(url);
  },

  // Submit answer (FormData for video upload)
  submitAnswer: (formData) => 
    fetch(`${BASE_URL}/api/interviews/submit_answer`, {
      method: 'POST',
      body: formData
    }).then(res => {
      if (!res.ok) {
        return res.json().then(err => Promise.reject(err));
      }
      return res.json();
    }),

  // Get all interview results
  getResults: () => 
    apiCall('/api/interviews/results'),

  // Get specific candidate interview result
  getCandidateResult: (candidateId) => 
    apiCall(`/api/interviews/results/${candidateId}`)
};

// ==========================================
// HR AUTOMATION APIs
// ==========================================
export const hrAPI = {
  // Attendance
  attendance: {
    mark: (date, status) => 
      apiCall('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, status })
      }),
    
    list: () => 
      apiCall('/api/attendance')
  },

  // Leave Management
  leave: {
    request: (leaveData) => 
      apiCall('/api/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leaveData)
      }),
    
    list: () => 
      apiCall('/api/leave'),
    
    approve: (leaveId) => 
      apiCall(`/api/leave/${leaveId}/approve`, {
        method: 'PATCH'
      }),
    
    reject: (leaveId) => 
      apiCall(`/api/leave/${leaveId}/reject`, {
        method: 'PATCH'
      })
  },

  // Tasks
  tasks: {
    create: (taskData) => 
      apiCall('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      }),
    
    list: () => 
      apiCall('/api/tasks'),
    
    update: (taskId, taskData) => 
      apiCall(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      })
  },

  // Onboarding
  onboarding: {
    getCandidates: () => 
      apiCall('/api/candidates'),
    
    uploadDocument: (candidateId, documentData) => 
      apiCall(`/api/uploads/${candidateId}`, {
        method: 'POST',
        body: documentData // FormData
      })
  }
};

// ==========================================
// RESUME PARSING API
// ==========================================
export const resumeAPI = {
  // Parse resume
  parse: (resumeFile) => {
    const formData = new FormData();
    formData.append('file', resumeFile);
    
    return apiCall('/api/resume/parse', {
      method: 'POST',
      body: formData
    });
  },

  // Match resume with job
  matchWithJob: (resumeId, jobId) => 
    apiCall('/api/resume/match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resume_id: resumeId, job_id: jobId })
    })
};

// ==========================================
// ADMIN APIs
// ==========================================
export const adminAPI = {
  // Get all users
  getUsers: () => 
    apiCall('/api/admin/users'),

  // Get system summary
  getSummary: () => 
    apiCall('/api/admin/superadmin/summary'),

  // Create user
  createUser: (userData) => 
    apiCall('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    }),

  // Update user
  updateUser: (userId, userData) => 
    apiCall(`/api/admin/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    }),

  // Delete user
  deleteUser: (userId) => 
    apiCall(`/api/admin/users/${userId}`, {
      method: 'DELETE'
    })
};

// Export default for convenience
export default {
  authAPI,
  jobAPI,
  candidateAPI,
  pipelineAPI,
  analyticsAPI,
  assessmentAPI,
  aiInterviewAPI,
  hrAPI,
  resumeAPI,
  adminAPI
};

