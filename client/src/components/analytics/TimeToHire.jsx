import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Calendar, Clock, TrendingUp, AlertCircle, Download, Filter, Users } from 'lucide-react';

const TimeToHire = () => {
  // Sample data for time-to-hire analytics
  const sampleData = [
    {
      id: 1,
      candidateName: "Nagendra Uggirala",
      jobRole: "Frontend Engineer",
      department: "Engineering",
      recruiter: "Sarah Johnson",
      appliedDate: "2024-08-15",
      screenedDate: "2024-08-17",
      interviewedDate: "2024-08-20",
      offerDate: "2024-08-22",
      hiredDate: "2024-08-22",
      totalDays: 7,
      stageBreakdown: {
        appliedToScreen: 2,
        screenToInterview: 3,
        interviewToOffer: 2,
        offerToHire: 0
      }
    },
    {
      id: 2,
      candidateName: "Ravi Kumar",
      jobRole: "Backend Engineer",
      department: "Engineering",
      recruiter: "Mike Chen",
      appliedDate: "2024-07-10",
      screenedDate: "2024-07-14",
      interviewedDate: "2024-07-22",
      offerDate: "2024-08-05",
      hiredDate: "2024-08-11",
      totalDays: 32,
      stageBreakdown: {
        appliedToScreen: 4,
        screenToInterview: 8,
        interviewToOffer: 14,
        offerToHire: 6
      }
    },
    {
      id: 3,
      candidateName: "Priya Sharma",
      jobRole: "Frontend Engineer",
      department: "Engineering",
      recruiter: "Sarah Johnson",
      appliedDate: "2024-08-01",
      screenedDate: "2024-08-04",
      interviewedDate: "2024-08-09",
      offerDate: "2024-08-15",
      hiredDate: "2024-08-18",
      totalDays: 17,
      stageBreakdown: {
        appliedToScreen: 3,
        screenToInterview: 5,
        interviewToOffer: 6,
        offerToHire: 3
      }
    },
    {
      id: 4,
      candidateName: "Amit Patel",
      jobRole: "DevOps Engineer",
      department: "Engineering",
      recruiter: "Lisa Wong",
      appliedDate: "2024-08-05",
      screenedDate: "2024-08-08",
      interviewedDate: "2024-08-14",
      offerDate: "2024-08-20",
      hiredDate: "2024-08-25",
      totalDays: 20,
      stageBreakdown: {
        appliedToScreen: 3,
        screenToInterview: 6,
        interviewToOffer: 6,
        offerToHire: 5
      }
    },
    {
      id: 5,
      candidateName: "Sneha Reddy",
      jobRole: "Sales Representative",
      department: "Sales",
      recruiter: "Tom Bradley",
      appliedDate: "2024-08-10",
      screenedDate: "2024-08-12",
      interviewedDate: "2024-08-16",
      offerDate: "2024-08-18",
      hiredDate: "2024-08-20",
      totalDays: 10,
      stageBreakdown: {
        appliedToScreen: 2,
        screenToInterview: 4,
        interviewToOffer: 2,
        offerToHire: 2
      }
    },
    {
      id: 6,
      candidateName: "Karthik Rao",
      jobRole: "Backend Engineer",
      department: "Engineering",
      recruiter: "Mike Chen",
      appliedDate: "2024-07-20",
      screenedDate: "2024-07-24",
      interviewedDate: "2024-07-30",
      offerDate: "2024-08-08",
      hiredDate: "2024-08-12",
      totalDays: 23,
      stageBreakdown: {
        appliedToScreen: 4,
        screenToInterview: 6,
        interviewToOffer: 9,
        offerToHire: 4
      }
    }
  ];

  // Filter states
  const [selectedDateRange, setSelectedDateRange] = useState('Last 30 days');
  const [selectedJobRole, setSelectedJobRole] = useState('All Roles');
  const [selectedRecruiter, setSelectedRecruiter] = useState('All Recruiters');
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');

  // Get unique values for filters
  const jobRoles = ['All Roles', ...new Set(sampleData.map(item => item.jobRole))];
  const recruiters = ['All Recruiters', ...new Set(sampleData.map(item => item.recruiter))];
  const departments = ['All Departments', ...new Set(sampleData.map(item => item.department))];

  // Filter data based on selections
  const filteredData = useMemo(() => {
    return sampleData.filter(item => {
      return (selectedJobRole === 'All Roles' || item.jobRole === selectedJobRole) &&
             (selectedRecruiter === 'All Recruiters' || item.recruiter === selectedRecruiter) &&
             (selectedDepartment === 'All Departments' || item.department === selectedDepartment);
    });
  }, [selectedJobRole, selectedRecruiter, selectedDepartment]);

  // Calculate KPIs
  const kpis = useMemo(() => {
    if (filteredData.length === 0) return { avgTime: 0, fastest: null, slowest: null, delayStage: 'N/A' };

    const avgTime = Math.round(filteredData.reduce((sum, item) => sum + item.totalDays, 0) / filteredData.length);
    const fastest = filteredData.reduce((min, item) => item.totalDays < min.totalDays ? item : min);
    const slowest = filteredData.reduce((max, item) => item.totalDays > max.totalDays ? item : max);
    
    // Find stage causing most delay
    const stageDelays = {
      'Applied → Screen': filteredData.reduce((sum, item) => sum + item.stageBreakdown.appliedToScreen, 0) / filteredData.length,
      'Screen → Interview': filteredData.reduce((sum, item) => sum + item.stageBreakdown.screenToInterview, 0) / filteredData.length,
      'Interview → Offer': filteredData.reduce((sum, item) => sum + item.stageBreakdown.interviewToOffer, 0) / filteredData.length,
      'Offer → Hire': filteredData.reduce((sum, item) => sum + item.stageBreakdown.offerToHire, 0) / filteredData.length
    };
    
    const delayStage = Object.keys(stageDelays).reduce((a, b) => stageDelays[a] > stageDelays[b] ? a : b);

    return { avgTime, fastest, slowest, delayStage };
  }, [filteredData]);

  // Prepare chart data
  const trendData = [
    { month: 'Jul', avgTime: 25 },
    { month: 'Aug', avgTime: 18 },
    { month: 'Sep', avgTime: 20 }
  ];

  const roleData = useMemo(() => {
    const roleStats = {};
    filteredData.forEach(item => {
      if (!roleStats[item.jobRole]) {
        roleStats[item.jobRole] = { total: 0, count: 0 };
      }
      roleStats[item.jobRole].total += item.totalDays;
      roleStats[item.jobRole].count += 1;
    });

    return Object.keys(roleStats).map(role => ({
      role,
      avgTime: Math.round(roleStats[role].total / roleStats[role].count)
    }));
  }, [filteredData]);

  const stageData = [
    { stage: 'Applied → Screen', avgDays: 3.2 },
    { stage: 'Screen → Interview', avgDays: 5.5 },
    { stage: 'Interview → Offer', avgDays: 7.3 },
    { stage: 'Offer → Hire', avgDays: 3.5 }
  ];

  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

  return (
    <div className="container-fluid py-4">
      <div className="mb-12">
        <h4 className="mb-2">Time to Hire</h4>
        <p className="text-secondary-light mb-0">Analyze average hiring duration and stage-wise delays.</p>
      </div>

      <div className="card border shadow-none mb-24">
        <div className="card-body p-24">
          <div className="d-flex align-items-center gap-2 mb-3">
            <Filter className="text-secondary-light" />
            <h6 className="mb-0">Filters</h6>
          </div>
          <div className="row g-3">
            <div className="col-12 col-md-3">
              <label className="form-label">Date Range</label>
              <select value={selectedDateRange} onChange={(e) => setSelectedDateRange(e.target.value)} className="form-select">
                <option>Last 30 days</option>
                <option>Quarter</option>
                <option>Year</option>
                <option>Custom</option>
              </select>
            </div>
            <div className="col-12 col-md-3">
              <label className="form-label">Job Role</label>
              <select value={selectedJobRole} onChange={(e) => setSelectedJobRole(e.target.value)} className="form-select">
                {jobRoles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
            <div className="col-12 col-md-3">
              <label className="form-label">Recruiter</label>
              <select value={selectedRecruiter} onChange={(e) => setSelectedRecruiter(e.target.value)} className="form-select">
                {recruiters.map(recruiter => (
                  <option key={recruiter} value={recruiter}>{recruiter}</option>
                ))}
              </select>
            </div>
            <div className="col-12 col-md-3">
              <label className="form-label">Department</label>
              <select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)} className="form-select">
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3 mb-24">
        <div className="col-12 col-md-6 col-xl-3">
          <div className="card border shadow-none h-100">
            <div className="card-body p-24 d-flex align-items-center justify-content-between">
              <div>
                <div className="text-secondary-light text-sm">Average Time to Hire</div>
                <div className="h3 mb-0 text-primary-600">{kpis.avgTime} days</div>
              </div>
              <Clock className="text-primary-600" />
            </div>
          </div>
        </div>
        <div className="col-12 col-md-6 col-xl-3">
          <div className="card border shadow-none h-100">
            <div className="card-body p-24 d-flex align-items-center justify-content-between">
              <div>
                <div className="text-secondary-light text-sm">Fastest Hire</div>
                <div className="h4 mb-0 text-success">{kpis.fastest?.totalDays || 0} days</div>
                <div className="text-xs text-secondary-light">{kpis.fastest?.candidateName || 'N/A'}</div>
              </div>
              <TrendingUp className="text-success" />
            </div>
          </div>
        </div>
        <div className="col-12 col-md-6 col-xl-3">
          <div className="card border shadow-none h-100">
            <div className="card-body p-24 d-flex align-items-center justify-content-between">
              <div>
                <div className="text-secondary-light text-sm">Slowest Hire</div>
                <div className="h4 mb-0 text-danger">{kpis.slowest?.totalDays || 0} days</div>
                <div className="text-xs text-secondary-light">{kpis.slowest?.candidateName || 'N/A'}</div>
              </div>
              <Calendar className="text-danger" />
            </div>
          </div>
        </div>
        <div className="col-12 col-md-6 col-xl-3">
          <div className="card border shadow-none h-100">
            <div className="card-body p-24 d-flex align-items-center justify-content-between">
              <div>
                <div className="text-secondary-light text-sm">Stage Causing Most Delay</div>
                <div className="h6 mb-0 text-warning">{kpis.delayStage}</div>
              </div>
              <AlertCircle className="text-warning" />
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3 mb-24">
        <div className="col-12 col-lg-6">
          <div className="card border shadow-none h-100">
            <div className="card-body p-24">
              <h6 className="mb-3">Time-to-Hire Trend</h6>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="avgTime" stroke="#3B82F6" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="col-12 col-lg-6">
          <div className="card border shadow-none h-100">
            <div className="card-body p-24">
              <h6 className="mb-3">Time by Job Role</h6>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={roleData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="role" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="avgTime">
                    {roleData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="card border shadow-none mb-24">
        <div className="card-body p-24">
          <h6 className="mb-3">Stage-wise Breakdown</h6>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stageData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="stage" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="avgDays" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card border shadow-none mb-24">
        <div className="card-body p-24">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h6 className="mb-0">Detailed Stage Analysis</h6>
            <button className="btn btn-primary d-inline-flex align-items-center gap-2">
              <Download size={16} />
              <span>Export</span>
            </button>
          </div>
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead>
                <tr>
                  <th>Job Role</th>
                  <th>Avg Time</th>
                  <th>Applied → Screen</th>
                  <th>Screen → Interview</th>
                  <th>Interview → Offer</th>
                  <th>Offer → Hire</th>
                </tr>
              </thead>
              <tbody>
                {roleData.map((role, index) => {
                  const roleItems = filteredData.filter(item => item.jobRole === role.role);
                  const avgStages = {
                    appliedToScreen: Math.round(roleItems.reduce((sum, item) => sum + item.stageBreakdown.appliedToScreen, 0) / roleItems.length),
                    screenToInterview: Math.round(roleItems.reduce((sum, item) => sum + item.stageBreakdown.screenToInterview, 0) / roleItems.length),
                    interviewToOffer: Math.round(roleItems.reduce((sum, item) => sum + item.stageBreakdown.interviewToOffer, 0) / roleItems.length),
                    offerToHire: Math.round(roleItems.reduce((sum, item) => sum + item.stageBreakdown.offerToHire, 0) / roleItems.length)
                  };
                  return (
                    <tr key={index}>
                      <td className="fw-medium">{role.role}</td>
                      <td className="fw-semibold">{role.avgTime} days</td>
                      <td>{avgStages.appliedToScreen} days</td>
                      <td>{avgStages.screenToInterview} days</td>
                      <td>{avgStages.interviewToOffer} days</td>
                      <td>{avgStages.offerToHire} days</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="card border shadow-none">
        <div className="card-body p-24">
          <div className="d-flex align-items-center gap-2 mb-3">
            <AlertCircle className="text-warning" />
            <h6 className="mb-0">Bottleneck Insights</h6>
          </div>
          <div className="alert alert-warning" role="alert">
            <strong>Interview → Offer stage is taking 7.3 days on average.</strong> Consider scheduling multiple interview panels simultaneously or streamlining the decision-making process to reduce delays.
          </div>
          <div className="alert alert-primary mb-0" role="alert">
            <strong>Recommendation:</strong> Frontend Engineer roles are being filled faster (avg 18 days) compared to Backend Engineer roles (avg 23 days). Consider applying Frontend hiring best practices to Backend recruitment.
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeToHire;