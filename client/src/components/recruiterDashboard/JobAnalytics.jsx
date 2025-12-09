import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  Users, 
  TrendingUp, 
  Calendar,
  Eye,
  Edit,
  Trash2,
  Plus,
  BarChart3,
  PieChart,
  Activity,
  AlertCircle
} from 'lucide-react';
import { BASE_URL } from '../../config/api.config';

const JobAnalytics = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch jobs and applications data
  const fetchJobData = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      setError('Please login to view job analytics');
      setLoading(false);
      return;
    }

    try {
      // Fetch jobs
      const jobsResponse = await fetch(`${BASE_URL}/api/jobs/list`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Fetch candidates (which includes application data)
      const candidatesResponse = await fetch(`${BASE_URL}/api/recruiter_dashboard/candidates`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (jobsResponse.ok && candidatesResponse.ok) {
        const jobsData = await jobsResponse.json();
        const candidatesData = await candidatesResponse.json();
        
        setJobs(jobsData);
        setApplications(candidatesData);
        setError(null);
      } else {
        setError('Failed to fetch job data');
      }
    } catch (err) {
      console.error('Job analytics fetch error:', err);
      setError('Network error. Please check if backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobData();
  }, []);

  // Calculate job statistics
  const getJobStats = () => {
    const totalJobs = jobs.length;
    const activeJobs = jobs.filter(job => job.status === 'Active').length;
    const totalApplications = applications.length;
    const avgApplicationsPerJob = totalJobs > 0 ? (totalApplications / totalJobs).toFixed(1) : 0;

    return {
      totalJobs,
      activeJobs,
      totalApplications,
      avgApplicationsPerJob
    };
  };

  // Get applications per job
  const getApplicationsPerJob = () => {
    return jobs.map(job => {
      // For now, we'll assume all applications are for the first job
      // In a real scenario, you'd have job_id in the application data
      const jobApplications = applications.length; // Simplified for demo
      return {
        ...job,
        applicationCount: jobApplications,
        applicationRate: jobApplications > 0 ? '100%' : '0%'
      };
    });
  };

  const stats = getJobStats();
  const jobsWithApplications = getApplicationsPerJob();

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );

  const JobCard = ({ job }) => (
    <div className="dashboard-card">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{job.title}</h3>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span className="flex items-center">
              <Briefcase className="h-4 w-4 mr-1" />
              {job.department}
            </span>
            <span className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {new Date(job.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
        <span className={`px-2 py-1 text-xs rounded-full ${
          job.status === 'Active' ? 'bg-green-100 text-green-800' :
          job.status === 'Draft' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {job.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <p className="text-2xl font-bold text-blue-600">{job.applicationCount}</p>
          <p className="text-xs text-blue-600">Applications</p>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <p className="text-2xl font-bold text-green-600">{job.applicationRate}</p>
          <p className="text-xs text-green-600">Response Rate</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigate(`/jobslist`)}
            className="p-2 text-gray-400 hover:text-gray-600"
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => navigate(`/createjob?edit=${job.id}`)}
            className="p-2 text-gray-400 hover:text-gray-600"
            title="Edit Job"
          >
            <Edit className="h-4 w-4" />
          </button>
        </div>
        <button
          onClick={() => navigate(`/candidates`)}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          View Applications
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner h-8 w-8"></div>
        <span className="ml-2 text-gray-600">Loading job analytics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
          <p className="text-red-800">{error}</p>
        </div>
        <button
          onClick={fetchJobData}
          className="btn-primary mt-4"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job Analytics</h1>
          <p className="text-gray-600 mt-1">Track job performance and application metrics</p>
        </div>
        <button
          onClick={() => navigate('/createjob')}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Post New Job</span>
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="dashboard-grid">
        <StatCard
          title="Total Jobs"
          value={stats.totalJobs}
          icon={Briefcase}
          color="bg-blue-500"
          subtitle={`${stats.activeJobs} active`}
        />
        <StatCard
          title="Total Applications"
          value={stats.totalApplications}
          icon={Users}
          color="bg-green-500"
          subtitle="All time"
        />
        <StatCard
          title="Avg Applications"
          value={stats.avgApplicationsPerJob}
          icon={TrendingUp}
          color="bg-purple-500"
          subtitle="Per job"
        />
        <StatCard
          title="Response Rate"
          value="100%"
          icon={BarChart3}
          color="bg-orange-500"
          subtitle="Application rate"
        />
      </div>

      {/* Job Performance Chart */}
      <div className="chart-container">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Job Performance</h2>
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-600">Applications per Job</span>
          </div>
        </div>
        
        <div className="space-y-4">
          {jobsWithApplications.map((job) => (
            <div key={job.id} className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{job.title}</p>
                <p className="text-xs text-gray-500">{job.department}</p>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">{job.applicationCount} applications</span>
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 bg-blue-500 rounded-full"
                    style={{ width: `${Math.min((job.applicationCount / Math.max(stats.totalApplications, 1)) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Job List */}
      <div className="dashboard-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Job Listings</h2>
          <button
            onClick={() => navigate('/jobslist')}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            View All Jobs
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {jobsWithApplications.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </div>

      {/* Application Trends */}
      <div className="dashboard-grid-2">
        <div className="dashboard-card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Sources</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Direct Applications</span>
              <span className="text-sm font-medium text-gray-900">{stats.totalApplications}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Job Boards</span>
              <span className="text-sm font-medium text-gray-900">0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Referrals</span>
              <span className="text-sm font-medium text-gray-900">0</span>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Status Distribution</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active Jobs</span>
              <span className="text-sm font-medium text-green-600">{stats.activeJobs}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Draft Jobs</span>
              <span className="text-sm font-medium text-yellow-600">{stats.totalJobs - stats.activeJobs}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Closed Jobs</span>
              <span className="text-sm font-medium text-gray-600">0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobAnalytics;
