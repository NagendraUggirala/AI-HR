import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, FunnelChart, Funnel, LabelList } from 'recharts';
import { Calendar, Users, UserCheck, Clock, TrendingUp, Download, Mail, Filter } from 'lucide-react';

const JobPerformance = () => {
  // Sample data
  const jobData = [
    {
      id: 1,
      jobRole: 'Frontend Engineer',
      applications: 120,
      shortlisted: 60,
      interviews: 30,
      offers: 10,
      hires: 4,
      timeToHire: 18,
      department: 'Engineering',
      recruiter: 'Sarah Johnson',
      datePosted: '2025-01-15'
    },
    {
      id: 2,
      jobRole: 'Backend Engineer',
      applications: 90,
      shortlisted: 40,
      interviews: 18,
      offers: 8,
      hires: 3,
      timeToHire: 22,
      department: 'Engineering',
      recruiter: 'Mike Chen',
      datePosted: '2025-01-10'
    },
    {
      id: 3,
      jobRole: 'QA Tester',
      applications: 70,
      shortlisted: 25,
      interviews: 12,
      offers: 4,
      hires: 2,
      timeToHire: 20,
      department: 'Engineering',
      recruiter: 'Sarah Johnson',
      datePosted: '2025-01-20'
    },
    {
      id: 4,
      jobRole: 'Product Manager',
      applications: 85,
      shortlisted: 35,
      interviews: 20,
      offers: 6,
      hires: 2,
      timeToHire: 25,
      department: 'Product',
      recruiter: 'Alex Rivera',
      datePosted: '2025-01-08'
    },
    {
      id: 5,
      jobRole: 'UX Designer',
      applications: 95,
      shortlisted: 45,
      interviews: 25,
      offers: 9,
      hires: 3,
      timeToHire: 19,
      department: 'Design',
      recruiter: 'Emily Davis',
      datePosted: '2025-01-12'
    }
  ];

  const [dateRange, setDateRange] = useState('30 days');
  const [selectedJob, setSelectedJob] = useState('All Jobs');
  const [selectedRecruiter, setSelectedRecruiter] = useState('All Recruiters');
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');

  // Filter data based on selections
  const filteredData = useMemo(() => {
    return jobData.filter(job => {
      if (selectedJob !== 'All Jobs' && job.jobRole !== selectedJob) return false;
      if (selectedRecruiter !== 'All Recruiters' && job.recruiter !== selectedRecruiter) return false;
      if (selectedDepartment !== 'All Departments' && job.department !== selectedDepartment) return false;
      return true;
    });
  }, [selectedJob, selectedRecruiter, selectedDepartment]);

  // Calculate KPIs
  const kpis = useMemo(() => {
    const totals = filteredData.reduce((acc, job) => ({
      applications: acc.applications + job.applications,
      shortlisted: acc.shortlisted + job.shortlisted,
      interviews: acc.interviews + job.interviews,
      offers: acc.offers + job.offers,
      hires: acc.hires + job.hires
    }), { applications: 0, shortlisted: 0, interviews: 0, offers: 0, hires: 0 });

    return {
      ...totals,
      conversionRate: totals.applications > 0 ? ((totals.hires / totals.applications) * 100).toFixed(1) : 0
    };
  }, [filteredData]);

  // Prepare chart data
  const barChartData = filteredData.map(job => ({
    name: job.jobRole,
    applications: job.applications,
    shortlisted: job.shortlisted,
    interviews: job.interviews,
    offers: job.offers,
    hires: job.hires
  }));

  const funnelData = [
    { name: 'Applications', value: kpis.applications, fill: '#3b82f6' },
    { name: 'Shortlisted', value: kpis.shortlisted, fill: '#10b981' },
    { name: 'Interviews', value: kpis.interviews, fill: '#f59e0b' },
    { name: 'Offers', value: kpis.offers, fill: '#ef4444' },
    { name: 'Hires', value: kpis.hires, fill: '#8b5cf6' }
  ];

  const trendData = [
    { month: 'Jan', applications: 150 },
    { month: 'Feb', applications: 180 },
    { month: 'Mar', applications: 220 },
    { month: 'Apr', applications: 195 },
    { month: 'May', applications: 240 },
    { month: 'Jun', applications: 280 }
  ];

  const departmentData = [
    { name: 'Engineering', value: 280, fill: '#3b82f6' },
    { name: 'Product', value: 85, fill: '#10b981' },
    { name: 'Design', value: 95, fill: '#f59e0b' }
  ];

  const uniqueJobs = ['All Jobs', ...new Set(jobData.map(job => job.jobRole))];
  const uniqueRecruiters = ['All Recruiters', ...new Set(jobData.map(job => job.recruiter))];
  const uniqueDepartments = ['All Departments', ...new Set(jobData.map(job => job.department))];

  const insights = [
    "Frontend Engineer role has the highest number of applications but moderate conversion rate of 3.3%",
    "Backend Engineer positions are taking 4 days longer to fill compared to Frontend roles",
    "QA Tester jobs have fewer applicants but show consistent candidate quality with 2.8% conversion",
    "Product Manager roles show longest time-to-hire at 25 days on average",
    "Engineering department generates 62% of total applications across all roles"
  ];

  return (
    <div className="container-fluid py-4">
      <div className="mb-12">
        <h4 className="mb-2">Job Performance</h4>
        <p className="text-secondary-light mb-0">Track applications, conversion, and hires for each job role.</p>
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
              <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="form-select">
                <option>Last 7 days</option>
                <option>30 days</option>
                <option>Quarter</option>
                <option>Custom</option>
              </select>
            </div>
            <div className="col-12 col-md-3">
              <label className="form-label">Job Role</label>
              <select value={selectedJob} onChange={(e) => setSelectedJob(e.target.value)} className="form-select">
                {uniqueJobs.map(job => <option key={job}>{job}</option>)}
              </select>
            </div>
            <div className="col-12 col-md-3">
              <label className="form-label">Recruiter</label>
              <select value={selectedRecruiter} onChange={(e) => setSelectedRecruiter(e.target.value)} className="form-select">
                {uniqueRecruiters.map(recruiter => <option key={recruiter}>{recruiter}</option>)}
              </select>
            </div>
            <div className="col-12 col-md-3">
              <label className="form-label">Department</label>
              <select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)} className="form-select">
                {uniqueDepartments.map(dept => <option key={dept}>{dept}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3 mb-24 align-items-stretch">
        <div className="col-12 col-sm-6 col-lg-3 d-flex">
          <div className="card border shadow-none w-100">
            <div className="card-body p-16 d-flex align-items-center justify-content-between" style={{minHeight: '96px'}}>
              <div>
                <div className="text-secondary-light text-sm">Applications</div>
                <div className="h4 mb-0 text-primary-600">{kpis.applications}</div>
              </div>
              <Users className="text-primary-600" />
            </div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-lg-3 d-flex">
          <div className="card border shadow-none w-100">
            <div className="card-body p-16 d-flex align-items-center justify-content-between" style={{minHeight: '96px'}}>
              <div>
                <div className="text-secondary-light text-sm">Shortlisted</div>
                <div className="h4 mb-0 text-success">{kpis.shortlisted}</div>
              </div>
              <UserCheck className="text-success" />
            </div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-lg-3 d-flex">
          <div className="card border shadow-none w-100">
            <div className="card-body p-16 d-flex align-items-center justify-content-between" style={{minHeight: '96px'}}>
              <div>
                <div className="text-secondary-light text-sm">Interviews</div>
                <div className="h4 mb-0 text-warning">{kpis.interviews}</div>
              </div>
              <Calendar className="text-warning" />
            </div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-lg-3 d-flex">
          <div className="card border shadow-none w-100">
            <div className="card-body p-16 d-flex align-items-center justify-content-between" style={{minHeight: '96px'}}>
              <div>
                <div className="text-secondary-light text-sm">Offers</div>
                <div className="h4 mb-0 text-danger">{kpis.offers}</div>
              </div>
              <TrendingUp className="text-danger" />
            </div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-lg-3 d-flex">
          <div className="card border shadow-none w-100">
            <div className="card-body p-16 d-flex align-items-center justify-content-between" style={{minHeight: '96px'}}>
              <div>
                <div className="text-secondary-light text-sm">Hires</div>
                <div className="h4 mb-0 text-primary-600">{kpis.hires}</div>
              </div>
              <UserCheck className="text-primary-600" />
            </div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-lg-3 d-flex">
          <div className="card border shadow-none w-100">
            <div className="card-body p-16 d-flex align-items-center justify-content-between" style={{minHeight: '96px'}}>
              <div>
                <div className="text-secondary-light text-sm">Conversion</div>
                <div className="h4 mb-0 text-primary-600">{kpis.conversionRate}%</div>
              </div>
              <Clock className="text-primary-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3 mb-24">
        <div className="col-12 col-lg-6">
          <div className="card border shadow-none h-100">
            <div className="card-body p-24">
              <h6 className="mb-3">Applications by Job Role</h6>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="applications" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="col-12 col-lg-6">
          <div className="card border shadow-none h-100">
            <div className="card-body p-24">
              <h6 className="mb-3">Hiring Funnel</h6>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart layout="horizontal" data={funnelData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={80} />
                  <Tooltip />
                  <Bar dataKey="value" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="col-12 col-lg-6">
          <div className="card border shadow-none h-100">
            <div className="card-body p-24">
              <h6 className="mb-3">Applications Trend</h6>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="applications" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="col-12 col-lg-6">
          <div className="card border shadow-none h-100">
            <div className="card-body p-24">
              <h6 className="mb-3">Applications by Department</h6>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={departmentData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`} outerRadius={80} dataKey="value">
                    {departmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="card border shadow-none mb-24">
        <div className="card-body p-24">
          <h6 className="mb-3">Job Performance Table</h6>
          <div className="table-responsive">
            <table className="table mb-0 align-middle">
              <thead>
                <tr>
                  <th>Job Role</th>
                  <th>Applications</th>
                  <th>Shortlisted</th>
                  <th>Interviews</th>
                  <th>Offers</th>
                  <th>Hires</th>
                  <th>Conversion %</th>
                  <th>Time-to-Hire</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((job) => (
                  <tr key={job.id}>
                    <td className="fw-medium">{job.jobRole}</td>
                    <td>{job.applications}</td>
                    <td>{job.shortlisted}</td>
                    <td>{job.interviews}</td>
                    <td>{job.offers}</td>
                    <td>{job.hires}</td>
                    <td>{((job.hires / job.applications) * 100).toFixed(1)}%</td>
                    <td>{job.timeToHire} days</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="card border shadow-none mb-24">
        <div className="card-body p-24">
          <h6 className="mb-3">Key Insights</h6>
          <div className="d-grid gap-2">
            {insights.map((insight, index) => (
              <div key={index} className="d-flex align-items-start gap-2">
                <span className="w-8-px h-8-px rounded-circle bg-primary-600 mt-1 flex-shrink-0"></span>
                <span className="text-secondary-light">{insight}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card border shadow-none">
        <div className="card-body p-24">
          <h6 className="mb-3">Export & Reports</h6>
          <div className="d-flex flex-wrap gap-2">
            <button className="btn btn-primary d-inline-flex align-items-center gap-2">
              <Download size={16} />
              <span>Download Excel</span>
            </button>
            <button className="btn btn-danger d-inline-flex align-items-center gap-2">
              <Download size={16} />
              <span>Download PDF</span>
            </button>
            <button className="btn btn-success d-inline-flex align-items-center gap-2">
              <Mail size={16} />
              <span>Email Weekly Report</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobPerformance;