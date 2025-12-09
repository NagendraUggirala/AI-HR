
import React, { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';
import JobList from '../JobList';
import RecruiterDashboardLayout from './RecruiterDashboardLayout';

const RecruiterDashboardHome = () => {
  const [searchFocused, setSearchFocused] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showCandidates, setShowCandidates] = useState(false);
  const [showCandidateProfile, setShowCandidateProfile] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const [animatedStats, setAnimatedStats] = useState({ activeJobs: 0, applications: 0, pipeline: 0 });
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedStats({ activeJobs: 12, applications: 1243, pipeline: 84 });
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const recentApplicants = [
    { id: 1, name: 'Aisha Sharma', position: 'Frontend Engineer', stage: 'Phone Screen', applied: '2 days ago', stageColor: 'success', email: 'aisha.sharma@email.com', experience: '3 years', phone: '+91 98765 43210', location: 'Bangalore, India', skills: ['React', 'JavaScript', 'TypeScript', 'Node.js', 'CSS'], education: 'B.Tech Computer Science - IIT Delhi', previousCompany: 'Tech Solutions Ltd.', salary: '₹12-15 LPA', resume: 'aisha_sharma_resume.pdf', notes: 'Strong frontend skills, good communication. Cleared initial screening.', interviewDate: '2024-09-25 at 10:00 AM', rating: 4.2 },
    { id: 2, name: 'Ravi Kumar', position: 'Product Manager', stage: 'Rejected', applied: '5 days ago', stageColor: 'danger', email: 'ravi.kumar@email.com', experience: '5 years', phone: '+91 87654 32109', location: 'Mumbai, India', skills: ['Product Strategy', 'Analytics', 'Agile', 'Roadmapping', 'Stakeholder Management'], education: 'MBA - IIM Ahmedabad, B.E. Electronics', previousCompany: 'Product Innovations Inc.', salary: '₹25-30 LPA', resume: 'ravi_kumar_resume.pdf', notes: 'Good product experience but cultural fit concerns during interview.', interviewDate: 'Completed - Not Selected', rating: 2.8 },
    { id: 3, name: 'Meera Patel', position: 'Data Scientist', stage: 'Onsite', applied: '1 day ago', stageColor: 'success', email: 'meera.patel@email.com', experience: '4 years', phone: '+91 76543 21098', location: 'Hyderabad, India', skills: ['Python', 'Machine Learning', 'TensorFlow', 'SQL', 'Statistics', 'AWS'], education: 'M.S. Data Science - ISI Kolkata, B.Tech CSE', previousCompany: 'DataTech Analytics', salary: '₹18-22 LPA', resume: 'meera_patel_resume.pdf', notes: 'Excellent technical skills, strong ML background. Ready for final round.', interviewDate: '2024-09-24 at 2:00 PM', rating: 4.7 }
  ];

  const AnimatedNumber = ({ value }) => {
    const [current, setCurrent] = useState(0);
    useEffect(() => {
      let start = 0;
      const end = value;
      const increment = Math.max(1, Math.floor(end / 60));
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCurrent(end);
          clearInterval(timer);
        } else {
          setCurrent(start);
        }
      }, 16);
      return () => clearInterval(timer);
    }, [value]);
    return <span>{current.toLocaleString()}</span>;
  };

  const handleViewCandidate = (id) => {
    const c = recentApplicants.find(x => x.id === id);
    setSelectedCandidate(c);
    setShowCandidateProfile(true);
    setShowCandidates(false);
  };

  return (
    <div className='container-fluid py-4 bg-neutral-50'>
      <div className='mb-24'>
        <h4 className='mb-8'>Recruiter Dashboard</h4>
        <p className='text-secondary-light'>Track your hiring progress and manage jobs efficiently.</p>
      </div>

      {/* Stats */}
      <div className='row row-cols-xxxl-5 row-cols-lg-3 row-cols-sm-2 row-cols-1 gy-4 mb-24'>
        <div className='col'>
          <div className='card shadow-none border bg-gradient-start-1 h-100'>
            <div className='card-body p-20'>
              <div className='d-flex flex-wrap align-items-center justify-content-between gap-3'>
                <div>
                  <p className='fw-medium text-primary-light mb-1'>Active Jobs</p>
                  <h6 className='mb-0'><AnimatedNumber value={animatedStats.activeJobs} /></h6>
                </div>
                <div className='w-50-px h-50-px bg-cyan rounded-circle d-flex justify-content-center align-items-center'>
                  <Icon icon='mdi:briefcase-outline' className='text-white text-2xl mb-0' />
                </div>
              </div>
              <p className='fw-medium text-sm text-primary-light mt-12 mb-0 d-flex align-items-center gap-2'>
                <span className='d-inline-flex align-items-center gap-1 text-success-main'>
                  <Icon icon='bxs:up-arrow' className='text-xs' /> +2
                </span>
                Since last week
              </p>
            </div>
          </div>
        </div>
        <div className='col'>
          <div className='card shadow-none border bg-gradient-start-2 h-100'>
            <div className='card-body p-20'>
              <div className='d-flex flex-wrap align-items-center justify-content-between gap-3'>
                <div>
                  <p className='fw-medium text-primary-light mb-1'>Applications Received</p>
                  <h6 className='mb-0'><AnimatedNumber value={animatedStats.applications} /></h6>
                </div>
                <div className='w-50-px h-50-px bg-purple rounded-circle d-flex justify-content-center align-items-center'>
                  <Icon icon='fa-solid:award' className='text-white text-2xl mb-0' />
                </div>
              </div>
              <p className='fw-medium text-sm text-primary-light mt-12 mb-0 d-flex align-items-center gap-2'>
                <span className='d-inline-flex align-items-center gap-1 text-primary-600'>
                  <Icon icon='bxs:up-arrow' className='text-xs' /> +254
                </span>
                New this week
              </p>
            </div>
          </div>
        </div>
        <div className='col'>
          <div className='card shadow-none border bg-gradient-start-3 h-100'>
            <div className='card-body p-20'>
              <div className='d-flex flex-wrap align-items-center justify-content-between gap-3'>
                <div>
                  <p className='fw-medium text-primary-light mb-1'>Candidates in Pipeline</p>
                  <h6 className='mb-0'><AnimatedNumber value={animatedStats.pipeline} /></h6>
                </div>
                <div className='w-50-px h-50-px bg-info rounded-circle d-flex justify-content-center align-items-center'>
                  <Icon icon='fluent:people-20-filled' className='text-white text-2xl mb-0' />
                </div>
              </div>
              <p className='fw-medium text-sm text-primary-light mt-12 mb-0 d-flex align-items-center gap-2'>
                <span className='d-inline-flex align-items-center gap-1 text-warning-main'>
                  <Icon icon='bxs:up-arrow' className='text-xs' /> 15
                </span>
                In final round
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className='card border shadow-none mb-24'>
        <div className='card-body'>
          <div className='d-flex align-items-center justify-content-between flex-wrap gap-2 mb-12'>
            <h5 className='mb-0'>Quick Actions</h5>
            <span className='text-secondary-light text-sm'>Need to move fast? Use these actions.</span>
          </div>
          <div className='d-flex flex-wrap justify-content-center gap-3'>
            <Link to='/jobs/new' className='btn btn-outline-primary d-flex align-items-center gap-2'>
              <Icon icon='heroicons:plus'/> <span>Create Job</span>
            </Link>
            <Link to='/candidates' className='btn btn-outline-primary d-flex align-items-center gap-2'>
              <Icon icon='solar:eye-linear'/> <span>View Candidates</span>
            </Link>
            <button className='btn btn-outline-primary d-flex align-items-center gap-2' onClick={() => setShowImportModal(true)}>
              <Icon icon='mdi:tray-arrow-down'/> <span>Import Candidates</span>
            </button>
            <button className='btn btn-outline-primary d-flex align-items-center gap-2' onClick={() => setShowPostModal(true)}>
              <Icon icon='mdi:send-outline'/> <span>Post to Job Board</span>
            </button>
          </div>
        </div>
      </div>

      {/* Job list and recent applicants */}
      <div className='card border shadow-none mb-24'>
        <div className='card-body p-0'>
          <JobList />
        </div>
      </div>
      <div className='card border shadow-none'>
        <div className='card-header bg-base border-bottom'>
          <div className='d-flex align-items-center justify-content-between'>
            <h5 className='mb-0'>Recent Applicants</h5>
            <div className='d-flex align-items-center gap-3'>
              <span className='text-secondary-light text-sm'>Showing latest 3</span>
              <button onClick={() => setShowCandidates(true)} className='text-primary-600 fw-semibold text-sm border-0 bg-transparent'>View All Applicants →</button>
            </div>
          </div>
        </div>
        <div className='card-body p-0'>
          <div className='table-responsive'>
            <table className='table mb-0'>
              <thead>
                <tr>
                  <th>CANDIDATE</th>
                  <th>POSITION</th>
                  <th>STAGE</th>
                  <th>APPLIED</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {recentApplicants.map((a) => (
                  <tr key={a.id}>
                    <td className='fw-semibold'>{a.name}</td>
                    <td className='text-secondary-light'>{a.position}</td>
                    <td>
                      <span className={`badge bg-${a.stageColor}-subtle text-${a.stageColor}-main`}>{a.stage}</span>
                    </td>
                    <td className='text-secondary-light'>{a.applied}</td>
                    <td>
                      <button className='text-primary-600 fw-semibold border-0 bg-transparent' onClick={() => handleViewCandidate(a.id)}>View Profile</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modals (candidates, profile, import, post) remain unchanged below */}
      {showCandidates && (
        <div className='position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex justify-content-center align-items-center z-3'>
          <div className='card w-100' style={{maxWidth: '960px'}}>
            <div className='card-header d-flex align-items-center justify-content-between'>
              <h6 className='mb-0'>All Candidates</h6>
              <button className='btn btn-sm btn-outline-secondary' onClick={() => setShowCandidates(false)}>Close</button>
            </div>
            <div className='card-body p-0'>
              <div className='table-responsive'>
                <table className='table mb-0'>
                  <thead>
                    <tr>
                      <th>CANDIDATE</th>
                      <th>POSITION</th>
                      <th>EMAIL</th>
                      <th>EXPERIENCE</th>
                      <th>STAGE</th>
                      <th>APPLIED</th>
                      <th>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentApplicants.map((a) => (
                      <tr key={a.id}>
                        <td className='fw-medium'>{a.name}</td>
                        <td>{a.position}</td>
                        <td>{a.email}</td>
                        <td>{a.experience}</td>
                        <td><span className={`badge bg-${a.stageColor}-subtle text-${a.stageColor}-main`}>{a.stage}</span></td>
                        <td className='text-secondary-light'>{a.applied}</td>
                        <td><button className='btn btn-link text-primary-600 p-0' onClick={() => handleViewCandidate(a.id)}>View Profile</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCandidateProfile && selectedCandidate && (
        <div className='position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex justify-content-center align-items-center z-3'>
          <div className='card w-100' style={{maxWidth: '840px'}}>
            <div className='card-header d-flex align-items-center justify-content-between'>
              <div className='d-flex align-items-center gap-3'>
                <span className='w-44-px h-44-px bg-primary-600 text-white rounded-circle d-flex justify-content-center align-items-center fw-bold'>
                  {selectedCandidate.name.split(' ').map(n => n[0]).join('')}
                </span>
                <div>
                  <h6 className='mb-4'>{selectedCandidate.name}</h6>
                  <span className='text-primary-600 fw-medium text-sm'>{selectedCandidate.position}</span>
                </div>
              </div>
              <button className='btn btn-sm btn-outline-secondary' onClick={() => { setShowCandidateProfile(false); setSelectedCandidate(null); }}>Close</button>
            </div>
            <div className='card-body'>
              <div className='row g-3'>
                <div className='col-md-6'>
                  <div className='border rounded p-3 mb-3'>
                    <h6 className='mb-12'>Contact Information</h6>
                    <div className='text-secondary-light text-sm'>{selectedCandidate.email}</div>
                    <div className='text-secondary-light text-sm'>{selectedCandidate.phone}</div>
                    <div className='text-secondary-light text-sm'>{selectedCandidate.location}</div>
                  </div>
                  <div className='border rounded p-3 mb-3'>
                    <h6 className='mb-12'>Professional Details</h6>
                    <div className='text-secondary-light text-sm'>Experience: {selectedCandidate.experience}</div>
                    <div className='text-secondary-light text-sm'>Previous Company: {selectedCandidate.previousCompany}</div>
                    <div className='text-secondary-light text-sm'>Expected Salary: {selectedCandidate.salary}</div>
                    <div className='text-secondary-light text-sm'>Education: {selectedCandidate.education}</div>
                  </div>
                  <div className='border rounded p-3'>
                    <h6 className='mb-12'>Skills</h6>
                    <div className='d-flex flex-wrap gap-2'>
                      {selectedCandidate.skills.map((s, i) => (
                        <span key={i} className='badge bg-primary-50 text-primary-600 border'>{s}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className='col-md-6'>
                  <div className='border rounded p-3 mb-3'>
                    <h6 className='mb-12'>Interview Schedule</h6>
                    <div className='text-secondary-light text-sm'>Next Interview: {selectedCandidate.interviewDate}</div>
                  </div>
                  <div className='border rounded p-3 mb-3'>
                    <h6 className='mb-12'>Recruiter Notes</h6>
                    <div className='text-secondary-light text-sm'>{selectedCandidate.notes}</div>
                  </div>
                  <div className='border rounded p-3'>
                    <h6 className='mb-12'>Documents</h6>
                    <a href='#' className='text-primary-600 text-sm'>{selectedCandidate.resume}</a>
                  </div>
                </div>
              </div>
            </div>
            <div className='card-footer d-flex flex-wrap justify-content-center gap-2'>
              <button className='btn btn-success btn-sm'>Move to Next Stage</button>
              <button className='btn btn-primary btn-sm'>Schedule Interview</button>
              <button className='btn btn-warning btn-sm text-white'>Add Note</button>
              <button className='btn btn-outline-secondary btn-sm'>Hold</button>
              <button className='btn btn-danger btn-sm'>Reject</button>
            </div>
          </div>
        </div>
      )}

      {showImportModal && (
        <div className='position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex justify-content-center align-items-center z-3'>
          <div className='card w-100' style={{maxWidth: '520px'}}>
            <div className='card-header d-flex align-items-center justify-content-between'>
              <h6 className='mb-0'>Import Candidates</h6>
              <button className='btn btn-sm btn-outline-secondary' onClick={() => setShowImportModal(false)}>Close</button>
            </div>
            <div className='card-body'>
              <p className='text-secondary-light'>Upload a CSV exported from your ATS.</p>
              <button className='btn btn-primary'>Choose CSV File</button>
            </div>
          </div>
        </div>
      )}

      {showPostModal && (
        <div className='position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex justify-content-center align-items-center z-3'>
          <div className='card w-100' style={{maxWidth: '520px'}}>
            <div className='card-header d-flex align-items-center justify-content-between'>
              <h6 className='mb-0'>Post to Job Board</h6>
              <button className='btn btn-sm btn-outline-secondary' onClick={() => setShowPostModal(false)}>Close</button>
            </div>
            <div className='card-body'>
              <div className='d-grid gap-2'>
                {['LinkedIn', 'Indeed', 'Glassdoor', 'Monster', 'AngelList'].map((b) => (
                  <button key={b} className='btn btn-outline-primary d-flex align-items-center justify-content-between'>
                    <span>{b}</span>
                    <span className='text-sm text-secondary-light'>Post Job →</span>
                  </button>
                ))}
              </div>
              <div className='alert alert-primary mt-3 mb-0'>
                <strong>Note:</strong> This will integrate with external job board APIs to automatically post your job listings.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AdminPanel = () => {
  return (
    <RecruiterDashboardLayout>
      <RecruiterDashboardHome />
    </RecruiterDashboardLayout>
  );
};

export default AdminPanel;