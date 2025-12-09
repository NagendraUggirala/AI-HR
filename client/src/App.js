import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Landing from './components/Landing';
import Signup from './components/auth/Signup';
import Login from './components/auth/Login';
import ForgotPassword from './components/auth/ForgotPassword';
import PricingPage from './components/auth/PricingPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminPanel from './components/recruiterDashboard/AdminPanel';
import SuperAdminPanel from './components/superAdmin/SuperAdminPanel';
import SuperAdminLogin from './components/superAdmin/SuperAdminLogin';
import SuperAdminLayout from './components/superAdmin/SuperAdminLayout';
import Candidates from './components/recruiterDashboard/Candidates';
import DashboardOverview from './components/recruiterDashboard/DashboardOverview';
import PipelineOverview from './components/recruiterDashboard/PipelineOverview';
import JobAnalytics from './components/recruiterDashboard/JobAnalytics';
import RecruiterDashboardLayout from './components/recruiterDashboard/RecruiterDashboardLayout';
import ResumeScreening from './components/recruiterDashboard/ResumeScreening';
import CreateJob from './components/CreateJob';
import JobList from './components/JobList';
import PipelineView from './components/pipeline/PipelineView';
import Stages from './components/pipeline/Stages';
import DragDrop from './components/pipeline/DragDrop';
import CollaborationTools from './components/pipeline/CollaborationTools';
import RecruiterPerformance from './components/analytics/RecruiterPerformance';
import TimeToHire from './components/analytics/TimeToHire';
import CandidateSourcing from './components/analytics/CandidateSourcing';
import JobPerformance from './components/analytics/JobPerformance';
import Settings from './components/Settings';
import OrgInfo from './components/recruiterDashboard/OrgInfo';
import Integrations from './components/recruiterDashboard/Integrations';
import Billing from './components/recruiterDashboard/Billing';
import RecruiterProfile from './components/recruiterDashboard/RecruiterProfile';
import CandidateLogin from './components/candidateDashboard/CandidateLogin';
import CandidateDashboard from './components/candidateDashboard/CandidateDashboard';
import CandidateDashboardLayout from './components/candidateDashboard/CandidateDashboardLayout';
import JobSearch from './components/candidateDashboard/JobSearch';
import Applications from './components/candidateDashboard/Applications';
import Profile from './components/candidateDashboard/Profile';
import CandidateSettings from './components/candidateDashboard/CandidateSettings';
import AssessmentManagement from './components/assessments/AssessmentManagement';
import AssessmentLibrary from './components/assessments/AssessmentLibrary';
import AssignAssessments from './components/assessments/AssignAssessments';
import TestResultsViewer from './components/assessments/TestResultsViewer';
import AptitudeTest from './components/assessments/AptitudeTest';
import CodingTest from './components/assessments/CodingTest';
import CommunicationTest from './components/assessments/CommunicationTest';
import AIPrescreening from './components/recruiterDashboard/AIPrescreening';
import ConfigureAIInterview from './components/recruiterDashboard/ConfigureAIInterview';
import ReviewAIInterview from './components/recruiterDashboard/ReviewAIInterview';
import AIInterviewPortal from './components/AIInterviewPortal';
import OfferTemplates from './components/recruiterDashboard/OfferTemplates';
import OfferTracking from './components/recruiterDashboard/OfferTracking';


const App = () => {
  return (
    <Routes>
      <Route path='/' element={<Landing />} />
      <Route path='/signup' element={<Signup />} />
      <Route path='/login' element={<Login />} />
      <Route path='/ForgotPassword' element={<ForgotPassword />} />
      <Route path='/pricing' element={<PricingPage />} />

      <Route
        path='/dashboard'
        element={
          <ProtectedRoute>
            <RecruiterDashboardLayout>
              <DashboardOverview />
            </RecruiterDashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path='/candidates'
        element={
          <ProtectedRoute>
            <RecruiterDashboardLayout>
              <Candidates />
            </RecruiterDashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path='/resume-screening'
        element={
          <ProtectedRoute>
            <RecruiterDashboardLayout>
              <ResumeScreening />
            </RecruiterDashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path='/jobs/new'
        element={
          <ProtectedRoute>
            <RecruiterDashboardLayout>
              <CreateJob />
            </RecruiterDashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path='/jobslist'
        element={
          <ProtectedRoute>
            <RecruiterDashboardLayout>
              <JobList />
            </RecruiterDashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path='/pipeline/view'
        element={
          <ProtectedRoute>
            <RecruiterDashboardLayout>
              <PipelineOverview />
            </RecruiterDashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path='/pipeline/stages'
        element={
          <ProtectedRoute>
            <RecruiterDashboardLayout>
              <Stages />
            </RecruiterDashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path='/pipeline/drag-drop'
        element={
          <ProtectedRoute>
            <RecruiterDashboardLayout>
              <DragDrop />
            </RecruiterDashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path='/pipeline/collaboration'
        element={
          <ProtectedRoute>
            <RecruiterDashboardLayout>
              <CollaborationTools />
            </RecruiterDashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path='/analytics/jobs'
        element={
          <ProtectedRoute>
            <RecruiterDashboardLayout>
              <JobAnalytics />
            </RecruiterDashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path='/analytics/recruiter-performance'
        element={
          <ProtectedRoute>
            <RecruiterDashboardLayout>
              <RecruiterPerformance />
            </RecruiterDashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path='/analytics/time-to-hire'
        element={
          <ProtectedRoute>
            <RecruiterDashboardLayout>
              <TimeToHire />
            </RecruiterDashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path='/analytics/job-sourcing'
        element={
          <ProtectedRoute>
            <RecruiterDashboardLayout>
              <CandidateSourcing />
            </RecruiterDashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path='/analytics/job-performance'
        element={
          <ProtectedRoute>
            <RecruiterDashboardLayout>
              <JobPerformance />
            </RecruiterDashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path='/settings'
        element={
          <ProtectedRoute>
            <RecruiterDashboardLayout>
              <Settings />
            </RecruiterDashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path='/settings/org-info'
        element={
          <ProtectedRoute>
            <RecruiterDashboardLayout>
              <OrgInfo />
            </RecruiterDashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path='/settings/integrations'
        element={
          <ProtectedRoute>
            <RecruiterDashboardLayout>
              <Integrations />
            </RecruiterDashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path='/settings/billing'
        element={
          <ProtectedRoute>
            <RecruiterDashboardLayout>
              <Billing />
            </RecruiterDashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path='/view-profile'
        element={
          <ProtectedRoute>
            <RecruiterDashboardLayout>
              <RecruiterProfile />
            </RecruiterDashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Candidate Routes */}
      <Route path='/candidate/login' element={<CandidateLogin />} />
      <Route
        path='/candidate/dashboard'
        element={
          <ProtectedRoute>
            <CandidateDashboardLayout>
              <CandidateDashboard />
            </CandidateDashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path='/candidate/jobs'
        element={
          <ProtectedRoute>
            <CandidateDashboardLayout>
              <JobSearch />
            </CandidateDashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path='/candidate/applications'
        element={
          <ProtectedRoute>
            <CandidateDashboardLayout>
              <Applications />
            </CandidateDashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path='/candidate/profile'
        element={
          <ProtectedRoute>
            <CandidateDashboardLayout>
              <Profile />
            </CandidateDashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path='/candidate/settings'
        element={
          <ProtectedRoute>
            <CandidateDashboardLayout>
              <CandidateSettings />
            </CandidateDashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Assessment Management Routes - Recruiter */}
      <Route
        path='/assessments'
        element={
          <ProtectedRoute>
            <RecruiterDashboardLayout>
              <AssessmentManagement />
            </RecruiterDashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path='/recruiter/assessments-library'
        element={
          <ProtectedRoute>
            <RecruiterDashboardLayout>
              <AssessmentLibrary />
            </RecruiterDashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path='/recruiter/assign-assessment'
        element={
          <ProtectedRoute>
            <RecruiterDashboardLayout>
              <AssignAssessments />
            </RecruiterDashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path='/recruiter/test-results'
        element={
          <ProtectedRoute>
            <RecruiterDashboardLayout>
              <TestResultsViewer />
            </RecruiterDashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path='/recruiter/prescreening'
        element={
          <ProtectedRoute>
            <RecruiterDashboardLayout>
              <AIPrescreening />
            </RecruiterDashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path='/recruiter/ai-interview-configure'
        element={
          <ProtectedRoute>
            <RecruiterDashboardLayout>
              <ConfigureAIInterview />
            </RecruiterDashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path='/recruiter/ai-interview-review'
        element={
          <ProtectedRoute>
            <RecruiterDashboardLayout>
              <ReviewAIInterview />
            </RecruiterDashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path='/recruiter/offer-templates'
        element={
          <ProtectedRoute>
            <RecruiterDashboardLayout>
              <OfferTemplates />
            </RecruiterDashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path='/recruiter/offer-tracking'
        element={
          <ProtectedRoute>
            <RecruiterDashboardLayout>
              <OfferTracking />
            </RecruiterDashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Assessment Test Routes - Public/Candidate */}
      <Route path='/assessment/aptitude' element={<AptitudeTest />} />
      <Route path='/assessment/coding' element={<CodingTest />} />
      <Route path='/assessment/communication' element={<CommunicationTest />} />

      {/* AI Interview Portal - Public Route */}
      <Route path='/ai-interview' element={<AIInterviewPortal />} />

      <Route path='/super-admin/login' element={<SuperAdminLogin />} />

      {/* Super Admin Route */}
      <Route
        path='/super-admin'
        element={
          <ProtectedRoute superAdminOnly={true}>
            <SuperAdminLayout>
              <SuperAdminPanel />
            </SuperAdminLayout>
          </ProtectedRoute>
        }
      />

      <Route path='*' element={<Navigate to='/' replace />} />
    </Routes>
  );
};

export default App;




