import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Briefcase, 
  FileText, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Plus,
  Eye,
  Calendar,
  BarChart3,
  Activity,
  Upload
} from 'lucide-react';
import { BASE_URL } from '../../config/api.config';

const DashboardOverview = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalJobs: 0,
      totalCandidates: 0,
      totalApplications: 0,
      activeJobs: 0,
      hiredCandidates: 0,
      pendingApplications: 0
    },
    recentApplications: [],
    stageDistribution: {},
    loading: true,
    error: null
  });

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      setDashboardData(prev => ({ ...prev, error: 'Please login to view dashboard', loading: false }));
      return;
    }

    try {
      // Fetch candidates
      const candidatesResponse = await fetch(`${BASE_URL}/api/recruiter_dashboard/candidates`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Fetch jobs
      const jobsResponse = await fetch(`${BASE_URL}/api/jobs/list`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (candidatesResponse.ok && jobsResponse.ok) {
        const candidates = await candidatesResponse.json();
        const jobs = await jobsResponse.json();

        // Calculate statistics
        const stats = {
          totalJobs: jobs.length,
          totalCandidates: candidates.length,
          totalApplications: candidates.length, // Assuming 1:1 for now
          activeJobs: jobs.filter(job => job.status === 'Active').length,
          hiredCandidates: candidates.filter(c => c.stage === 'Hired').length,
          pendingApplications: candidates.filter(c => c.stage === 'Applied').length
        };

        // Stage distribution
        const stageDistribution = {};
        candidates.forEach(candidate => {
          stageDistribution[candidate.stage] = (stageDistribution[candidate.stage] || 0) + 1;
        });

        // Recent applications (last 5)
        const recentApplications = candidates.slice(0, 5).map(candidate => ({
          id: candidate.id,
          name: candidate.name,
          role: candidate.role,
          stage: candidate.stage,
          appliedAt: new Date().toISOString(), // Mock date
          skills: candidate.skills
        }));

        setDashboardData({
          stats,
          recentApplications,
          stageDistribution,
          loading: false,
          error: null
        });
      } else {
        setDashboardData(prev => ({ 
          ...prev, 
          error: 'Failed to fetch dashboard data', 
          loading: false 
        }));
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setDashboardData(prev => ({ 
        ...prev, 
        error: 'Network error. Please check if backend is running.', 
        loading: false 
      }));
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="stat-card">
      <div className="flex items-center justify-between">
        <div>
          <p className="stat-card-label">{title}</p>
          <p className="stat-card-value">{value}</p>
          {subtitle && <p className="stat-card-subtitle">{subtitle}</p>}
        </div>
        <div className={`stat-card-icon ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );

  const QuickActionButton = ({ title, icon: Icon, onClick, color }) => (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 px-4 py-3 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-colors ${color}`}
    >
      <Icon className="h-5 w-5 text-gray-600" />
      <span className="text-sm font-medium text-gray-700">{title}</span>
    </button>
  );

  if (dashboardData.loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner h-8 w-8"></div>
        <span className="ml-2 text-gray-600">Loading dashboard...</span>
      </div>
    );
  }

  if (dashboardData.error) {
    return (
      <div className="alert alert-error">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
          <p className="text-red-800">{dashboardData.error}</p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="btn-primary mt-4"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="w-100 mb-4">
      {/* Welcome Header */}
      <div className="bg-primary rounded p-4 text-white mb-4">
        <div className="d-flex align-items-center justify-content-between">
          <div>
            <h1 className="h3 fw-bold mb-2">Welcome back!</h1>
            <p className="text-white-50 mb-0">Here's what's happening with your recruitment pipeline</p>
          </div>
          <div className="text-end">
            <p className="text-white-50 mb-1 small">Last updated</p>
            <p className="h5 fw-semibold mb-0">{new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="dashboard-grid mb-4">
        <StatCard
          title="Total Jobs"
          value={dashboardData.stats.totalJobs}
          icon={Briefcase}
          color="bg-blue-500"
          subtitle={`${dashboardData.stats.activeJobs} active`}
        />
        <StatCard
          title="Total Candidates"
          value={dashboardData.stats.totalCandidates}
          icon={Users}
          color="bg-green-500"
          subtitle={`${dashboardData.stats.pendingApplications} pending`}
        />
        <StatCard
          title="Applications"
          value={dashboardData.stats.totalApplications}
          icon={FileText}
          color="bg-purple-500"
          subtitle="All time"
        />
        <StatCard
          title="Hired"
          value={dashboardData.stats.hiredCandidates}
          icon={CheckCircle}
          color="bg-emerald-500"
          subtitle="This month"
        />
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-grid-2 mb-4">
        {/* Pipeline Overview */}
        <div className="lg:col-span-2 dashboard-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Pipeline Overview</h2>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {Object.entries(dashboardData.stageDistribution).map(([stage, count]) => (
              <div key={stage} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    stage === 'Applied' ? 'bg-blue-500' :
                    stage === 'Screening' ? 'bg-yellow-500' :
                    stage === 'Interview' ? 'bg-orange-500' :
                    stage === 'Offer' ? 'bg-purple-500' :
                    stage === 'Hired' ? 'bg-green-500' : 'bg-gray-500'
                  }`}></div>
                  <span className="text-sm font-medium text-gray-700">{stage}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">{count}</span>
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        stage === 'Applied' ? 'bg-blue-500' :
                        stage === 'Screening' ? 'bg-yellow-500' :
                        stage === 'Interview' ? 'bg-orange-500' :
                        stage === 'Offer' ? 'bg-purple-500' :
                        stage === 'Hired' ? 'bg-green-500' : 'bg-gray-500'
                      }`}
                      style={{ width: `${(count / dashboardData.stats.totalCandidates) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-2 dashboard-card mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
            <span className="text-sm text-gray-500">Need to move fast? Use these actions.</span>
          </div>
          <div className="flex justify-content-center gap-3">
            <button className='btn btn-outline-primary d-flex align-items-center gap-2 px-3 py-2' onClick={() => navigate('/jobs/new')}>
              <Plus className="h-4 w-4"/> <span>Create Job</span>
            </button>
            <button className='btn btn-outline-primary d-flex align-items-center gap-2 px-3 py-2' onClick={() => navigate('/candidates')}>
              <Eye className="h-4 w-4"/> <span>View Candidates</span>
            </button>
            <button className='btn btn-outline-primary d-flex align-items-center gap-2 px-3 py-2' onClick={() => navigate('/resume-screening')}>
              <Upload className="h-4 w-4"/> <span>AI Resume Screening</span>
            </button>
            <button className='btn btn-outline-primary d-flex align-items-center gap-2 px-3 py-2' onClick={() => navigate('/jobslist')}>
              <Briefcase className="h-4 w-4"/> <span>Job Listings</span>
            </button>
            <button className='btn btn-outline-primary d-flex align-items-center gap-2 px-3 py-2' onClick={() => navigate('/pipeline/view')}>
              <Activity className="h-4 w-4"/> <span>Pipeline View</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Applications */}
      <div className="dashboard-card mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Applications</h2>
          <button
            onClick={() => navigate('/candidates')}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            View All
          </button>
        </div>
        
        <div className="space-y-3">
          {dashboardData.recentApplications.map((application) => (
            <div key={application.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-600">
                    {application.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{application.name}</p>
                  <p className="text-xs text-gray-500">{application.role}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  application.stage === 'Applied' ? 'bg-blue-100 text-blue-800' :
                  application.stage === 'Screening' ? 'bg-yellow-100 text-yellow-800' :
                  application.stage === 'Interview' ? 'bg-orange-100 text-orange-800' :
                  application.stage === 'Offer' ? 'bg-purple-100 text-purple-800' :
                  application.stage === 'Hired' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {application.stage}
                </span>
                <button
                  onClick={() => navigate(`/candidates/${application.id}`)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <Eye className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Summary */}
      <div className="dashboard-grid-2">
        <div className="dashboard-card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">This Week</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">New Applications</span>
              <span className="text-sm font-medium text-gray-900">{dashboardData.stats.pendingApplications}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Interviews Scheduled</span>
              <span className="text-sm font-medium text-gray-900">0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Offers Extended</span>
              <span className="text-sm font-medium text-gray-900">0</span>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Application Rate</span>
              <span className="text-sm font-medium text-green-600">100%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Time to Hire</span>
              <span className="text-sm font-medium text-gray-900">-</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Success Rate</span>
              <span className="text-sm font-medium text-gray-900">-</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
