import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, Calendar, Clock, TrendingUp, Award, Download, Filter, Eye, ArrowUp, ArrowDown, CalendarCheck, Timer, Target, Trophy, X, RefreshCw, AlertCircle } from 'lucide-react';
import { BASE_URL } from '../../config/api.config';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function RecruiterPerformance() {
  const navigate = useNavigate();
  const [recruiters, setRecruiters] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  const [selectedRecruiter, setSelectedRecruiter] = useState('all');
  const [dateRange, setDateRange] = useState('30');
  const [jobRole, setJobRole] = useState('all');
  const [showDrillDown, setShowDrillDown] = useState(null);
  const [selectedRecruiterDetails, setSelectedRecruiterDetails] = useState(null);
  const [sortBy, setSortBy] = useState('hires');
  const [sortOrder, setSortOrder] = useState('desc');

  // Fetch all data from backend
  const fetchData = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      setError('Please login to view recruiter performance');
      setLoading(false);
      return;
    }

    try {
      setRefreshing(true);
      setError(null);

      // Fetch recruiters (users with recruiter role)
      const recruitersResponse = await fetch(`${BASE_URL}/api/admin/users`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (recruitersResponse.ok) {
        const allUsers = await recruitersResponse.json();
        const recruiterUsers = Array.isArray(allUsers) 
          ? allUsers.filter(user => user.role?.toLowerCase() === 'recruiter' || user.role?.toLowerCase() === 'admin')
          : [];
        setRecruiters(recruiterUsers);
      }

      // Fetch jobs
      const jobsResponse = await fetch(`${BASE_URL}/api/jobs/list`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (jobsResponse.ok) {
        const jobsData = await jobsResponse.json();
        setJobs(Array.isArray(jobsData) ? jobsData : []);
      }

      // Fetch candidates
      const candidatesResponse = await fetch(`${BASE_URL}/api/recruiter_dashboard/candidates`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (candidatesResponse.ok) {
        const candidatesData = await candidatesResponse.json();
        setCandidates(Array.isArray(candidatesData) ? candidatesData : []);
      }

    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Network error. Please check if backend is running.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Calculate date range filter
  const getDateFilter = () => {
    const days = parseInt(dateRange);
    if (days) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      return startDate;
    }
    return null;
  };

  // Calculate recruiter performance metrics
  const recruiterPerformanceData = useMemo(() => {
    if (!recruiters.length || !jobs.length || !candidates.length) {
      return [];
    }

    const startDate = getDateFilter();
    
    return recruiters.map(recruiter => {
      // Get jobs for this recruiter
      const recruiterJobs = jobs.filter(job => 
        job.recruiter_id === recruiter.id || 
        (job.recruiter && job.recruiter.id === recruiter.id)
      );

      // Get job IDs
      const jobIds = recruiterJobs.map(job => job.id);

      // Filter candidates by recruiter's jobs and date range
      let recruiterCandidates = candidates.filter(candidate => 
        jobIds.includes(candidate.job_id) || 
        (candidate.job && jobIds.includes(candidate.job.id))
      );

      if (startDate) {
        recruiterCandidates = recruiterCandidates.filter(candidate => {
          const candidateDate = new Date(candidate.created_at || candidate.applied_at);
          return candidateDate >= startDate;
        });
      }

      // Filter by job role if selected
      if (jobRole !== 'all') {
        recruiterCandidates = recruiterCandidates.filter(candidate => {
          const candidateJob = recruiterJobs.find(j => j.id === (candidate.job_id || candidate.job?.id));
          return candidateJob && candidateJob.role?.toLowerCase().includes(jobRole.toLowerCase());
        });
      }

      // Calculate metrics
      const candidatesAdded = recruiterCandidates.length;
      const interviewsScheduled = recruiterCandidates.filter(c => 
        c.stage === 'Interview' || c.stage === 'Offer' || c.stage === 'Hired'
      ).length;
      
      const hiredCandidates = recruiterCandidates.filter(c => c.stage === 'Hired');
      const hires = hiredCandidates.length;

      // Calculate time to hire (average days from application to hire)
      let timeToHire = 0;
      if (hiredCandidates.length > 0) {
        const timeToHireValues = hiredCandidates
          .map(c => {
            const appliedDate = new Date(c.created_at || c.applied_at);
            const hiredDate = new Date(c.updated_at || new Date());
            return Math.max(0, Math.floor((hiredDate - appliedDate) / (1000 * 60 * 60 * 24)));
          })
          .filter(days => days > 0);
        
        if (timeToHireValues.length > 0) {
          timeToHire = Math.round(
            timeToHireValues.reduce((sum, days) => sum + days, 0) / timeToHireValues.length
          );
        }
      }

      // Calculate offer acceptance rate
      const offersSent = recruiterCandidates.filter(c => c.stage === 'Offer' || c.stage === 'Hired').length;
      const offerAcceptanceRate = offersSent > 0 
        ? Math.round((hires / offersSent) * 100) 
        : 0;

      // Pipeline data
      const pipelineData = {
        applied: recruiterCandidates.filter(c => c.stage === 'Applied' || !c.stage).length,
        screening: recruiterCandidates.filter(c => c.stage === 'Screening').length,
        interview: recruiterCandidates.filter(c => c.stage === 'Interview').length,
        offer: recruiterCandidates.filter(c => c.stage === 'Offer').length,
        hired: hires
      };

      // Monthly hires (last 4 months)
      const monthlyHires = [];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const now = new Date();
      
      for (let i = 3; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        
        const monthHired = hiredCandidates.filter(c => {
          const hiredDate = new Date(c.updated_at || c.created_at);
          return hiredDate >= monthDate && hiredDate <= monthEnd;
        }).length;

        const monthTimeToHire = monthHired > 0 
          ? Math.round(
              hiredCandidates
                .filter(c => {
                  const hiredDate = new Date(c.updated_at || c.created_at);
                  return hiredDate >= monthDate && hiredDate <= monthEnd;
                })
                .map(c => {
                  const appliedDate = new Date(c.created_at || c.applied_at);
                  const hiredDate = new Date(c.updated_at || c.created_at);
                  return Math.max(0, Math.floor((hiredDate - appliedDate) / (1000 * 60 * 60 * 24)));
                })
                .filter(days => days > 0)
                .reduce((sum, days, _, arr) => sum + days / arr.length, 0)
            )
          : 0;

        monthlyHires.push({
          month: months[monthDate.getMonth()],
          hires: monthHired,
          timeToHire: monthTimeToHire
        });
      }

      return {
        id: recruiter.id,
        name: recruiter.name || recruiter.email || 'Unknown',
        email: recruiter.email,
        candidatesAdded,
        interviewsScheduled,
        timeToHire,
        offerAcceptanceRate,
        hires,
        pipelineData,
        monthlyHires
      };
    }).filter(r => r.candidatesAdded > 0); // Only show recruiters with candidates
  }, [recruiters, jobs, candidates, dateRange, jobRole]);

  // Filter and sort data
  const filteredData = useMemo(() => {
    let data = [...recruiterPerformanceData];
    
    if (selectedRecruiter !== 'all') {
      data = data.filter(r => r.id === parseInt(selectedRecruiter));
    }

    // Sort data
    data.sort((a, b) => {
      const aVal = a[sortBy] || 0;
      const bVal = b[sortBy] || 0;
      return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
    });

    return data;
  }, [recruiterPerformanceData, selectedRecruiter, sortBy, sortOrder]);

  // Calculate total metrics
  const totalMetrics = useMemo(() => {
    if (filteredData.length === 0) {
      return {
        activeJobs: 0,
        avgTimeToHire: 0,
        applicationsThisWeek: 0,
        totalHires: 0
      };
    }

    const activeJobs = jobs.filter(job => 
      job.status === 'active' || job.status === 'Active' || job.status === 'Open'
    ).length;

    const avgTimeToHire = Math.round(
      filteredData.reduce((sum, r) => sum + (r.timeToHire || 0), 0) / filteredData.length
    );

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const applicationsThisWeek = candidates.filter(c => {
      const candidateDate = new Date(c.created_at || c.applied_at);
      return candidateDate >= weekAgo;
    }).length;

    const totalHires = filteredData.reduce((sum, r) => sum + (r.hires || 0), 0);

    return {
      activeJobs,
      avgTimeToHire,
      applicationsThisWeek,
      totalHires
    };
  }, [filteredData, jobs, candidates]);

  // Get unique job roles for filter
  const uniqueJobRoles = useMemo(() => {
    const roles = new Set();
    jobs.forEach(job => {
      if (job.role) roles.add(job.role);
    });
    return Array.from(roles).sort();
  }, [jobs]);

  // Chart data
  const barChartData = useMemo(() => filteredData.map(r => ({
    name: r.name.split(' ')[0],
    candidates: r.candidatesAdded,
    interviews: r.interviewsScheduled,
    hires: r.hires
  })), [filteredData]);

  const timeToHireData = useMemo(() => filteredData[0]?.monthlyHires || [], [filteredData]);

  const pipelineData = useMemo(() => {
    if (selectedRecruiter !== 'all' && filteredData.length === 1) {
      return Object.entries(filteredData[0].pipelineData).map(([stage, count]) => ({
        name: stage.charAt(0).toUpperCase() + stage.slice(1),
        value: count
      }));
    }
    return [
      { name: 'Applied', value: filteredData.reduce((sum, r) => sum + (r.pipelineData?.applied || 0), 0) },
      { name: 'Screening', value: filteredData.reduce((sum, r) => sum + (r.pipelineData?.screening || 0), 0) },
      { name: 'Interview', value: filteredData.reduce((sum, r) => sum + (r.pipelineData?.interview || 0), 0) },
      { name: 'Offer', value: filteredData.reduce((sum, r) => sum + (r.pipelineData?.offer || 0), 0) },
      { name: 'Hired', value: filteredData.reduce((sum, r) => sum + (r.pipelineData?.hired || 0), 0) }
    ];
  }, [selectedRecruiter, filteredData]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return null;
    return sortOrder === 'desc' ? <ArrowDown size={14} /> : <ArrowUp size={14} />;
  };

  // Export functions
  const exportRecruiterDetails = (details) => {
    if (!details) return;
    const csvEscape = (val) => {
      if (val === null || val === undefined) return '""';
      return '"' + String(val).replace(/"/g, '""') + '"';
    };

    const parts = [];
    parts.push('Metric,Value');
    parts.push(['Name', details.name].map(csvEscape).join(','));
    parts.push(['Candidates', details.candidatesAdded].map(csvEscape).join(','));
    parts.push(['Interviews', details.interviewsScheduled].map(csvEscape).join(','));
    parts.push(['Avg Time To Hire (days)', details.timeToHire].map(csvEscape).join(','));
    parts.push(['Offer Acceptance Rate (%)', details.offerAcceptanceRate].map(csvEscape).join(','));
    parts.push(['Hires', details.hires].map(csvEscape).join(','));

    parts.push('');
    parts.push('Pipeline Stage,Count');
    Object.entries(details.pipelineData).forEach(([stage, count]) => {
      parts.push([stage, count].map(csvEscape).join(','));
    });

    parts.push('');
    parts.push('Month,Hires,TimeToHire');
    (details.monthlyHires || []).forEach(m => {
      parts.push([m.month, m.hires, m.timeToHire].map(csvEscape).join(','));
    });

    const csv = parts.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const fileNameSafe = details.name ? details.name.replace(/[^a-z0-9-_\. ]/gi, '_') : 'recruiter';
    const a = document.createElement('a');
    a.href = url;
    a.download = `recruiter-${fileNameSafe}-details.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const exportReport = () => {
    const csvEscape = (val) => {
      if (val === null || val === undefined) return '""';
      return '"' + String(val).replace(/"/g, '""') + '"';
    };

    const parts = [];
    parts.push(`Filters,Date Range=${dateRange},Recruiter=${selectedRecruiter},JobRole=${jobRole}`);
    parts.push('');

    parts.push('Summary,Value');
    parts.push(['Total Recruiters', filteredData.length].map(csvEscape).join(','));
    parts.push(['Total Candidates (sum)', filteredData.reduce((s, r) => s + r.candidatesAdded, 0)].map(csvEscape).join(','));
    parts.push(['Total Interviews (sum)', filteredData.reduce((s, r) => s + r.interviewsScheduled, 0)].map(csvEscape).join(','));
    parts.push(['Total Hires (sum)', filteredData.reduce((s, r) => s + r.hires, 0)].map(csvEscape).join(','));
    parts.push('');

    parts.push('Recruiter,Candidates,Interviews,TimeToHire,OfferAcceptanceRate,Hires');
    filteredData.forEach(r => {
      parts.push([
        r.name,
        r.candidatesAdded,
        r.interviewsScheduled,
        r.timeToHire,
        r.offerAcceptanceRate,
        r.hires
      ].map(csvEscape).join(','));
    });

    parts.push('');
    parts.push('Pipeline Stage,Count');
    const pipelineTotals = {
      applied: filteredData.reduce((s, r) => s + (r.pipelineData?.applied || 0), 0),
      screening: filteredData.reduce((s, r) => s + (r.pipelineData?.screening || 0), 0),
      interview: filteredData.reduce((s, r) => s + (r.pipelineData?.interview || 0), 0),
      offer: filteredData.reduce((s, r) => s + (r.pipelineData?.offer || 0), 0),
      hired: filteredData.reduce((s, r) => s + (r.pipelineData?.hired || 0), 0)
    };
    Object.entries(pipelineTotals).forEach(([k, v]) => parts.push([k, v].map(csvEscape).join(',')));

    const csv = parts.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const now = new Date().toISOString().slice(0,19).replace(/[:T]/g, '-');
    a.download = `recruiter-report-${now}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-primary mb-3" />
            <p className="text-secondary-light">Loading recruiter performance data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-danger d-flex align-items-center">
          <AlertCircle className="h-5 w-5 me-2" />
          <div>
            <strong>Error:</strong> {error}
          </div>
          <button className="btn btn-sm btn-outline-danger ms-auto" onClick={fetchData}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* Page Header */}
      <div className="mb-4 d-flex justify-content-between align-items-center">
        <div>
          <h4 className="mb-2">Recruiter Performance</h4>
          <p className="text-secondary-light mb-0">Track performance and efficiency of recruiters.</p>
        </div>
        <button
          onClick={fetchData}
          className="btn btn-primary d-flex align-items-center"
          disabled={refreshing}
        >
          {refreshing ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <RefreshCw className="h-4 w-4 me-2" />
              Refresh
            </>
          )}
        </button>
      </div>

      {/* KPI Summary */}
      <div className="card border shadow-none mb-4">
        <div className="card-body d-flex">
          <div className="text-center w-25">
            <div className="text-secondary-light small">Active Jobs</div>
            <div className="h4 mb-0">{totalMetrics.activeJobs}</div>
          </div>
          <div className="text-center w-25 border-start ps-4">
            <div className="text-secondary-light small">Avg. Time-to-Hire</div>
            <div className="h4 mb-0 text-primary">{totalMetrics.avgTimeToHire} days</div>
          </div>
          <div className="text-center w-25 border-start ps-4">
            <div className="text-secondary-light small">Applications This Week</div>
            <div className="h4 mb-0 text-success">{totalMetrics.applicationsThisWeek}</div>
          </div>
          <div className="text-center w-25 border-start ps-4">
            <div className="text-secondary-light small">Total Hires</div>
            <div className="h4 mb-0 text-danger">{totalMetrics.totalHires}</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card border shadow-none mb-4">
        <div className="card-body p-24">
          <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
            <Filter className="text-secondary-light" />
            <span className="fw-medium">Filters:</span>
          </div>
          <div className="row g-2 align-items-center">
            <div className="col-12 col-md-3">
              <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="form-select">
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="180">Last 6 months</option>
              </select>
            </div>
            <div className="col-12 col-md-3">
              <select value={selectedRecruiter} onChange={(e) => setSelectedRecruiter(e.target.value)} className="form-select">
                <option value="all">All Recruiters</option>
                {recruiterPerformanceData.map(recruiter => (
                  <option key={recruiter.id} value={recruiter.id}>{recruiter.name}</option>
                ))}
              </select>
            </div>
            <div className="col-12 col-md-3">
              <select value={jobRole} onChange={(e) => setJobRole(e.target.value)} className="form-select">
                <option value="all">All Job Roles</option>
                {uniqueJobRoles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
            <div className="col-12 col-md-3 d-flex justify-content-md-end">
              <button className="btn btn-primary d-inline-flex align-items-center gap-2" onClick={exportReport}>
                <Download size={16} />
                <span>Export Report</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {filteredData.length === 0 ? (
        <div className="card border shadow-none">
          <div className="card-body text-center py-5">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-3" />
            <h6 className="mb-2">No Data Available</h6>
            <p className="text-secondary-light mb-0">
              No recruiter performance data found for the selected filters.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Charts */}
          <div className="row g-3 mb-4">
            <div className="col-12 col-lg-6">
              <div className="card border shadow-none h-100">
                <div className="card-body p-24">
                  <h6 className="mb-3">Candidates Processed by Recruiter</h6>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={barChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="candidates" fill="#3b82f6" name="Candidates" />
                      <Bar dataKey="interviews" fill="#10b981" name="Interviews" />
                      <Bar dataKey="hires" fill="#f59e0b" name="Hires" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            <div className="col-12 col-lg-6">
              <div className="card border shadow-none h-100">
                <div className="card-body p-24">
                  <h6 className="mb-3">Time-to-Hire Trend</h6>
                  {timeToHireData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={timeToHireData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="timeToHire" stroke="#3b82f6" strokeWidth={2} name="Time to Hire (days)" />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center text-secondary-light py-4">No time-to-hire data available</div>
                  )}
                </div>
              </div>
            </div>
            <div className="col-12 col-lg-6">
              <div className="card border shadow-none h-100">
                <div className="card-body p-24">
                  <h6 className="mb-3">Pipeline Distribution</h6>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie 
                        data={pipelineData} 
                        cx="50%" 
                        cy="50%" 
                        labelLine={false} 
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} 
                        outerRadius={60} 
                        dataKey="value"
                      >
                        {pipelineData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            <div className="col-12 col-lg-6">
              <div className="card border shadow-none h-100">
                <div className="card-body p-24">
                  <h6 className="mb-3">Top Performers</h6>
                  <div className="d-grid gap-2">
                    {filteredData.slice(0, 3).map((recruiter, index) => (
                      <div key={recruiter.id} className="d-flex align-items-center gap-2">
                        <span className="w-24-px h-24-px bg-primary-600 text-white rounded-circle d-flex justify-content-center align-items-center text-xs fw-bold">{index + 1}</span>
                        <div className="flex-grow-1 text-truncate">
                          <div className="fw-medium text-sm text-truncate">{recruiter.name}</div>
                          <div className="text-xs text-secondary-light">{recruiter.hires} hires • {recruiter.timeToHire}d avg</div>
                        </div>
                        <div className="text-end">
                          <div className="fw-semibold text-success text-sm">{recruiter.offerAcceptanceRate}%</div>
                          <div className="text-xs text-secondary-light">accept</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recruiter Comparison Table */}
          <div className="card border shadow-sm">
            <div className="card-header bg-white border-bottom">
              <h6 className="mb-0">Recruiter Comparison</h6>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="text-start fw-semibold">Recruiter</th>
                      <th className="text-center fw-semibold" onClick={() => handleSort('candidatesAdded')} style={{cursor:'pointer'}}>
                        Candidates Added {getSortIcon('candidatesAdded')}
                      </th>
                      <th className="text-center fw-semibold" onClick={() => handleSort('interviewsScheduled')} style={{cursor:'pointer'}}>
                        Interviews {getSortIcon('interviewsScheduled')}
                      </th>
                      <th className="text-center fw-semibold" onClick={() => handleSort('hires')} style={{cursor:'pointer'}}>
                        Hires {getSortIcon('hires')}
                      </th>
                      <th className="text-center fw-semibold" onClick={() => handleSort('timeToHire')} style={{cursor:'pointer'}}>
                        Time-to-Hire {getSortIcon('timeToHire')}
                      </th>
                      <th className="text-center fw-semibold" onClick={() => handleSort('offerAcceptanceRate')} style={{cursor:'pointer'}}>
                        Offer % {getSortIcon('offerAcceptanceRate')}
                      </th>
                      <th className="text-center fw-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((recruiter) => (
                      <tr key={recruiter.id}>
                        <td className="text-start">
                          <div className="d-flex align-items-center gap-3">
                            <div className="bg-primary text-white rounded-circle d-flex justify-content-center align-items-center fw-bold" style={{width: '40px', height: '40px'}}>
                              {recruiter.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                            </div>
                            <span className="fw-medium">{recruiter.name}</span>
                          </div>
                        </td>
                        <td className="text-center">
                          <span className="fw-semibold">{recruiter.candidatesAdded}</span>
                        </td>
                        <td className="text-center">
                          <span className="fw-semibold">{recruiter.interviewsScheduled}</span>
                        </td>
                        <td className="text-center">
                          <span className="badge bg-success-subtle text-success px-3 py-2 fw-semibold">
                            {recruiter.hires}
                          </span>
                        </td>
                        <td className="text-center">
                          <span className="fw-semibold">{recruiter.timeToHire} days</span>
                        </td>
                        <td className="text-center">
                          <div className="d-flex align-items-center justify-content-center gap-2">
                            <div className="bg-light rounded-pill" style={{width:'80px', height:'8px'}}>
                              <div className="bg-primary rounded-pill" style={{width: `${recruiter.offerAcceptanceRate}%`, height:'8px'}}></div>
                            </div>
                            <span className="fw-semibold small">{recruiter.offerAcceptanceRate}%</span>
                          </div>
                        </td>
                        <td className="text-center">
                          <button 
                            onClick={() => setSelectedRecruiterDetails(recruiter)} 
                            className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1"
                          >
                            <Eye size={14} /> View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Recruiter Details Modal */}
      {selectedRecruiterDetails && (
        <>
          <div className="modal d-block" tabIndex="-1" role="dialog" style={{zIndex: 1050}}>
            <div className="modal-dialog modal-xl" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <div className="d-flex align-items-center gap-3">
                    <span className="w-48-px h-48-px bg-primary-600 text-white rounded-circle d-flex justify-content-center align-items-center fw-bold">
                      {selectedRecruiterDetails.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </span>
                    <div>
                      <h6 className="mb-0">{selectedRecruiterDetails.name}</h6>
                      <div className="text-secondary-light">Recruiter Performance Details</div>
                    </div>
                  </div>
                  <button type="button" className="btn-close" aria-label="Close" onClick={() => setSelectedRecruiterDetails(null)}></button>
                </div>
                <div className="modal-body">
                  <div className="row g-3 mb-3">
                    <div className="col-6 col-md-4 col-xl-2">
                      <div className="border rounded p-16 text-center h-100">
                        <div className="h5 mb-0 text-primary-600">{selectedRecruiterDetails.candidatesAdded}</div>
                        <div className="text-secondary-light text-sm">Candidates</div>
                      </div>
                    </div>
                    <div className="col-6 col-md-4 col-xl-2">
                      <div className="border rounded p-16 text-center h-100">
                        <div className="h5 mb-0 text-success">{selectedRecruiterDetails.interviewsScheduled}</div>
                        <div className="text-secondary-light text-sm">Interviews</div>
                      </div>
                    </div>
                    <div className="col-6 col-md-4 col-xl-2">
                      <div className="border rounded p-16 text-center h-100">
                        <div className="h5 mb-0 text-warning">{selectedRecruiterDetails.timeToHire}</div>
                        <div className="text-secondary-light text-sm">Days Avg</div>
                      </div>
                    </div>
                    <div className="col-6 col-md-4 col-xl-2">
                      <div className="border rounded p-16 text-center h-100">
                        <div className="h5 mb-0 text-primary-600">{selectedRecruiterDetails.offerAcceptanceRate}%</div>
                        <div className="text-secondary-light text-sm">Acceptance</div>
                      </div>
                    </div>
                    <div className="col-6 col-md-4 col-xl-2">
                      <div className="border rounded p-16 text-center h-100">
                        <div className="h5 mb-0 text-success">{selectedRecruiterDetails.hires}</div>
                        <div className="text-secondary-light text-sm">Hires</div>
                      </div>
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-12 col-lg-6">
                      <div className="border rounded p-16 h-100">
                        <h6 className="mb-3">Pipeline Breakdown</h6>
                        <div className="d-grid gap-2">
                          {Object.entries(selectedRecruiterDetails.pipelineData).map(([stage, count]) => {
                            const percentage = selectedRecruiterDetails.candidatesAdded > 0
                              ? Math.round((count / selectedRecruiterDetails.candidatesAdded) * 100)
                              : 0;
                            return (
                              <div key={stage} className="d-flex align-items-center justify-content-between">
                                <div className="d-flex align-items-center gap-2">
                                  <span className="text-sm text-capitalize">{stage}:</span>
                                  <div className="bg-neutral-200 rounded-pill" style={{width:'120px', height:'6px'}}>
                                    <div className="bg-primary-600 rounded-pill" style={{width: `${percentage}%`, height:'6px'}}></div>
                                  </div>
                                </div>
                                <div>
                                  <span className="fw-semibold">{count}</span>
                                  <span className="text-secondary-light text-xs ms-1">({percentage}%)</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="col-12 col-lg-6">
                      <div className="border rounded p-16 h-100">
                        <h6 className="mb-3">Monthly Performance</h6>
                        {selectedRecruiterDetails.monthlyHires && selectedRecruiterDetails.monthlyHires.length > 0 ? (
                          <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={selectedRecruiterDetails.monthlyHires}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="month" />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Bar dataKey="hires" fill="#3b82f6" name="Hires" />
                              <Bar dataKey="timeToHire" fill="#10b981" name="Time to Hire (days)" />
                            </BarChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="text-center text-secondary-light py-4">No monthly data available</div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="border rounded p-16">
                    <h6 className="mb-3">Performance Insights</h6>
                    <div className="row g-2">
                      <div className="col-12 col-md-6 d-grid gap-2">
                        <div className="d-flex align-items-center gap-2">
                          <span className="w-8-px h-8-px rounded-circle bg-success"></span>
                          <span className="text-sm">
                            <strong>Conversion Rate:</strong> {
                              selectedRecruiterDetails.candidatesAdded > 0
                                ? Math.round((selectedRecruiterDetails.hires / selectedRecruiterDetails.candidatesAdded) * 100)
                                : 0
                            }% from candidates to hires
                          </span>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <span className="w-8-px h-8-px rounded-circle bg-primary-600"></span>
                          <span className="text-sm">
                            <strong>Interview Success:</strong> {
                              selectedRecruiterDetails.interviewsScheduled > 0
                                ? Math.round((selectedRecruiterDetails.hires / selectedRecruiterDetails.interviewsScheduled) * 100)
                                : 0
                            }% of interviews lead to hires
                          </span>
                        </div>
                      </div>
                      <div className="col-12 col-md-6 d-grid gap-2">
                        <div className="d-flex align-items-center gap-2">
                          <span className="w-8-px h-8-px rounded-circle bg-warning"></span>
                          <span className="text-sm">
                            <strong>Efficiency:</strong> {
                              selectedRecruiterDetails.timeToHire < 15 ? 'Above Average' : 
                              selectedRecruiterDetails.timeToHire === 15 ? 'Average' : 'Below Average'
                            } time-to-hire
                          </span>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <span className="w-8-px h-8-px rounded-circle bg-purple"></span>
                          <span className="text-sm">
                            <strong>Offer Success:</strong> {
                              selectedRecruiterDetails.offerAcceptanceRate > 80 ? 'Excellent' : 
                              selectedRecruiterDetails.offerAcceptanceRate > 70 ? 'Good' : 'Needs Improvement'
                            } offer acceptance rate
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-outline-secondary" onClick={() => setSelectedRecruiterDetails(null)}>Close</button>
                  <button className="btn btn-primary" onClick={() => exportRecruiterDetails(selectedRecruiterDetails)}>Export Details</button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}
    </div>
  );
}
