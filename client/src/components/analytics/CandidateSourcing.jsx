import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, FunnelChart, Funnel, LabelList } from 'recharts';
import { Calendar, Filter, Download, Share, TrendingUp, Users, Target, DollarSign } from 'lucide-react';

const CandidateSourcing = () => {
  const [selectedDateRange, setSelectedDateRange] = useState('30 days');
  const [selectedRole, setSelectedRole] = useState('All Roles');
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [selectedRecruiter, setSelectedRecruiter] = useState('All Recruiters');

  // Sample data
  const kpiData = {
    totalCandidates: 500,
    uniqueChannels: 6,
    bestChannel: 'Referrals',
    avgCostPerHire: 25000,
    avgConversionRate: 5
  };

  const channelDistribution = [
    { name: 'LinkedIn', value: 40, count: 200, color: '#0077B5' },
    { name: 'Referrals', value: 20, count: 100, color: '#34D399' },
    { name: 'Naukri', value: 24, count: 120, color: '#F59E0B' },
    { name: 'Career Page', value: 16, count: 80, color: '#8B5CF6' }
  ];

  const channelPerformance = [
    {
      channel: 'LinkedIn',
      applications: 200,
      shortlisted: 80,
      interviews: 40,
      offers: 15,
      hires: 6,
      conversion: 3,
      costPerHire: 28000
    },
    {
      channel: 'Referrals',
      applications: 100,
      shortlisted: 50,
      interviews: 25,
      offers: 12,
      hires: 8,
      conversion: 8,
      costPerHire: 12000
    },
    {
      channel: 'Naukri',
      applications: 120,
      shortlisted: 40,
      interviews: 15,
      offers: 6,
      hires: 3,
      conversion: 2.5,
      costPerHire: 30000
    },
    {
      channel: 'Career Page',
      applications: 80,
      shortlisted: 25,
      interviews: 12,
      offers: 4,
      hires: 2,
      conversion: 2.5,
      costPerHire: 20000
    }
  ];

  const recruiterData = [
    { recruiter: 'Rajesh', Candidates: 32, Interviews: 16, Hires: 4 },
    { recruiter: 'Nagendra', Candidates: 25, Interviews: 12, Hires: 3 },
    { recruiter: 'Priya', Candidates: 20, Interviews: 8, Hires: 2 },
    { recruiter: 'Asha', Candidates: 15, Interviews: 6, Hires: 1 }
  ];

  const timeToHireData = [
    { month: 'Jan', timeToHire: 14 },
    { month: 'Feb', timeToHire: 12 },
    { month: 'Mar', timeToHire: 11 },
    { month: 'Apr', timeToHire: 12 }
  ];

  const funnelData = [
    { name: 'Applications', value: 500, fill: '#3B82F6' },
    { name: 'Shortlisted', value: 195, fill: '#10B981' },
    { name: 'Interviews', value: 92, fill: '#F59E0B' },
    { name: 'Offers', value: 37, fill: '#EF4444' },
    { name: 'Hires', value: 19, fill: '#8B5CF6' }
  ];

  const channelComparisonData = channelPerformance.map(channel => ({
    channel: channel.channel,
    Applications: channel.applications,
    Interviews: channel.interviews,
    Hires: channel.hires
  }));

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="container-fluid py-4">
      <div className="mb-12 d-flex align-items-start justify-content-between">
        <div>
          <h4 className="mb-2">Candidate Sourcing Analytics</h4>
          <p className="text-secondary-light mb-0">Track sourcing channels, conversion rates, and hiring efficiency.</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-primary d-inline-flex align-items-center gap-2"><Download size={16} /><span>Export</span></button>
          <button className="btn btn-success d-inline-flex align-items-center gap-2"><Share size={16} /><span>Share Report</span></button>
        </div>
      </div>

      <div className="card border shadow-none mb-24">
        <div className="card-body p-24">
          <div className="row g-3">
            <div>
              <label className="form-label">Date Range</label>
              <select 
                className="form-select"
                value={selectedDateRange}
                onChange={(e) => setSelectedDateRange(e.target.value)}
              >
                <option>Last 7 days</option>
                <option>30 days</option>
                <option>Quarter</option>
                <option>Custom</option>
              </select>
            </div>
            <div>
              <label className="form-label">Job Role</label>
              <select 
                className="form-select"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                <option>All Roles</option>
                <option>Frontend Engineer</option>
                <option>Backend Engineer</option>
                <option>Full Stack Developer</option>
                <option>Data Scientist</option>
              </select>
            </div>
            <div>
              <label className="form-label">Department</label>
              <select 
                className="form-select"
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
              >
                <option>All Departments</option>
                <option>Technology</option>
                <option>Sales</option>
                <option>Marketing</option>
                <option>HR</option>
              </select>
            </div>
            <div>
              <label className="form-label">Recruiter</label>
              <select 
                className="form-select"
                value={selectedRecruiter}
                onChange={(e) => setSelectedRecruiter(e.target.value)}
              >
                <option>All Recruiters</option>
                <option>Sarah Johnson</option>
                <option>Mike Chen</option>
                <option>Priya Patel</option>
                <option>Alex Rodriguez</option>
              </select>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="row g-3 mb-24 align-items-stretch p-24" >
          <div className="col-12 col-sm-6 col-lg-3 d-flex">
            <div className="card border shadow-none w-100">
              <div className="card-body p-16 d-flex align-items-center justify-content-between" style={{minHeight: '96px'}}>
                <div>
                  <div className="text-secondary-light text-sm">Total Candidates</div>
                  <div className="h4 mb-0">{kpiData.totalCandidates}</div>
                </div>
                <Users className="text-primary-600" />
              </div>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-lg-3 d-flex">
            <div className="card border shadow-none w-100">
              <div className="card-body p-16 d-flex align-items-center justify-content-between" style={{minHeight: '96px'}}>
                <div>
                  <div className="text-secondary-light text-sm">Unique Channels</div>
                  <div className="h4 mb-0 text-success">{kpiData.uniqueChannels}</div>
                </div>
                <Target className="text-success" />
              </div>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-lg-3 d-flex">
            <div className="card border shadow-none w-100">
              <div className="card-body p-16 d-flex align-items-center justify-content-between" style={{minHeight: '96px'}}>
                <div>
                  <div className="text-secondary-light text-sm">Best Channel</div>
                  <div className="h6 mb-0">{kpiData.bestChannel}</div>
                </div>
                <TrendingUp className="text-primary-600" />
              </div>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-lg-3 d-flex">
            <div className="card border shadow-none w-100">
              <div className="card-body p-16 d-flex align-items-center justify-content-between" style={{minHeight: '96px'}}>
                <div>
                  <div className="text-secondary-light text-sm">Avg Cost per Hire</div>
                  <div className="h6 mb-0">{formatCurrency(kpiData.avgCostPerHire)}</div>
                </div>
                <DollarSign className="text-warning" />
              </div>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-lg-3 d-flex">
            <div className="card border shadow-none w-100">
              <div className="card-body p-16 d-flex align-items-center justify-content-between" style={{minHeight: '96px'}}>
                <div>
                  <div className="text-secondary-light text-sm">Avg Conversion</div>
                  <div className="h4 mb-0 text-primary-600">{kpiData.avgConversionRate}%</div>
                </div>
                <Filter className="text-primary-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="row g-3 mb-24 p-24">
          <div className="col-12 col-lg-6">
            <div className="card border shadow-none h-100">
              <div className="card-body p-24">
                <h6 className="mb-3">Candidate Distribution by Source</h6>
                <div style={{height: '256px'}}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={channelDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {channelDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
          <div className="col-12 col-lg-6">
            <div className="card border shadow-none h-100">
              <div className="card-body p-24">
                <h6 className="mb-3">Channel Performance Comparison</h6>
                <div style={{height: '256px'}}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={channelComparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="channel" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="Applications" fill="#3B82F6" />
                      <Bar dataKey="Interviews" fill="#10B981" />
                      <Bar dataKey="Hires" fill="#8B5CF6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="row g-3 mb-24 p-24">
          <div className="col-12 col-lg-6">
            <div className="card border shadow-none h-100">
              <div className="card-body p-24">
                <h6 className="mb-3">Candidates Processed by Recruiter</h6>
                <div style={{height: '256px'}}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={recruiterData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="recruiter" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="Candidates" fill="#3B82F6" />
                      <Bar dataKey="Interviews" fill="#10B981" />
                      <Bar dataKey="Hires" fill="#F59E0B" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
          <div className="col-12 col-lg-6">
            <div className="card border shadow-none h-100">
              <div className="card-body p-24">
                <h6 className="mb-3">Time-to-Hire Trend</h6>
                <div style={{height: '256px'}}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timeToHireData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis domain={[0, 16]} />
                      <Tooltip formatter={(value) => [`${value} days`, 'Time to Hire']} />
                      <Line 
                        type="monotone" 
                        dataKey="timeToHire" 
                        stroke="#3B82F6" 
                        strokeWidth={2}
                        dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Table */}
        <div className="card  body shadow-none mb-24 p-24">
          <div className="card-body p-24">
            <h6 className="mb-3">Sourcing Performance Table</h6>
            <div className="table-responsive">
              <table className="table mb-0 align-middle">
                <thead>
                  <tr>
                    <th>Channel</th>
                    <th>Applications</th>
                    <th>Shortlisted</th>
                    <th>Interviews</th>
                    <th>Offers</th>
                    <th>Hires</th>
                    <th>Conversion %</th>
                    <th>Cost per Hire</th>
                  </tr>
                </thead>
                <tbody>
                  {channelPerformance.map((channel, index) => (
                    <tr key={index}>
                      <td className="fw-medium">{channel.channel}</td>
                      <td>{channel.applications}</td>
                      <td>{channel.shortlisted}</td>
                      <td>{channel.interviews}</td>
                      <td>{channel.offers}</td>
                      <td>{channel.hires}</td>
                      <td>
                        <span className={`badge ${channel.conversion >= 5 ? 'bg-success-subtle text-success-main' : 'bg-warning-subtle text-warning-main'}`}>{channel.conversion}%</span>
                      </td>
                      <td>{formatCurrency(channel.costPerHire)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Insights Section */}
        <div className="row g-3 p-24">
          <div className="col-12 col-lg-4">
            <div className="card border shadow-none h-100">
              <div className="card-body p-24 bg-success-subtle">
                <h6 className="mb-2 text-success-main">Top Performer</h6>
                <p className="mb-0 text-success">Referrals are the highest performing channel with 8% conversion rate and lowest cost per hire at ₹12,000.</p>
              </div>
            </div>
          </div>
          <div className="col-12 col-lg-4">
            <div className="card border shadow-none h-100">
              <div className="card-body p-24 bg-primary-50">
                <h6 className="mb-2 text-primary-600">Volume Leader</h6>
                <p className="mb-0 text-secondary-light">LinkedIn generates the most applications (200) but has lower conversion at 3%. Consider improving screening process.</p>
              </div>
            </div>
          </div>
          <div className="col-12 col-lg-4">
            <div className="card border shadow-none h-100">
              <div className="card-body p-24 bg-purple-50">
                <h6 className="mb-2 text-purple">Opportunity</h6>
                <p className="mb-0 text-secondary-light">Career Page attracts candidates at lower cost (₹20,000) but needs better screening to improve 2.5% conversion rate.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateSourcing;