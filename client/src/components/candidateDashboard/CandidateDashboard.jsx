import React, { useState } from 'react';
import { Icon } from '@iconify/react';

const CandidateDashboard = () => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Sample data
  const candidateData = {
    name: "Nagendra Uggirala",
    email: "nagendra@example.com",
    profileCompletion: 85,
    savedJobs: [
      { id: 1, title: "Frontend Developer", company: "Veritech Software", savedOn: "Oct 5, 2025", location: "Hyderabad" },
      { id: 2, title: "UI Designer", company: "DCM Tech", savedOn: "Oct 6, 2025", location: "Remote" },
      { id: 3, title: "React Developer", company: "WebX Studio", savedOn: "Oct 4, 2025", location: "Bangalore" }
    ],
    recentApplications: [
      { id: 1, title: "Frontend Developer", company: "Veritech", status: "Interview", appliedOn: "Oct 2, 2025", statusColor: "blue" },
      { id: 2, title: "Backend Developer", company: "DCM Tech", status: "Screening", appliedOn: "Sep 30, 2025", statusColor: "yellow" },
      { id: 3, title: "UI Designer", company: "WebX Studio", status: "Hired", appliedOn: "Sep 28, 2025", statusColor: "green" },
      { id: 4, title: "Full Stack Developer", company: "Tech Solutions", status: "Applied", appliedOn: "Sep 25, 2025", statusColor: "gray" }
    ],
    recommendedJobs: [
      { id: 1, title: "React Frontend Developer", company: "Veritech Software", skills: ["React.js", "Tailwind CSS"], location: "Hyderabad", type: "Full-time" },
      { id: 2, title: "Full Stack Intern", company: "DCM Tech", skills: ["JavaScript", "Node.js"], location: "Remote", type: "Internship" },
      { id: 3, title: "UI Developer", company: "Pixel Labs", skills: ["HTML", "CSS", "Figma"], location: "Bangalore", type: "Full-time" }
    ]
  };

  const getStatusColor = (status) => {
    const colors = {
      Interview: 'bg-primary-50 text-primary-600',
      Screening: 'bg-warning-50 text-warning-600',
      Hired: 'bg-success-50 text-success-600',
      Applied: 'bg-secondary-50 text-secondary-600',
      Offer: 'bg-purple-50 text-purple-600',
      Rejected: 'bg-danger-50 text-danger-600'
    };
    return colors[status] || 'bg-secondary-50 text-secondary-600';
  };

  return (
    <div className='dashboard-main-body'>
      <div className='container-fluid'>
        {/* Welcome Section */}
        <div className='mb-24'>
          <h2 className='text-3xl fw-bold text-gray-800 mb-8'>Welcome back, {candidateData.name.split(' ')[0]}! 👋</h2>
          <p className='text-secondary-light'>Here's what's happening with your job search today.</p>
        </div>

        {/* Stats Cards - Column Format */}
        <div className='card border-0 shadow-sm mb-24'>
          <div className='card-body p-24'>
            <div className='row g-4'>
              <div className='col-12 col-md-6 col-lg-3'>
                <div className='d-flex align-items-center gap-3'>
                  <Icon icon='heroicons:document-text' className='text-primary-600' style={{ fontSize: '24px' }} />
                  <div>
                    <p className='text-secondary-light text-sm mb-2'>Total Applications</p>
                    <p className='text-2xl fw-bold text-gray-800 mb-0'>{candidateData.recentApplications.length}</p>
                  </div>
                </div>
              </div>
              
              <div className='col-12 col-md-6 col-lg-3'>
                <div className='d-flex align-items-center gap-3'>
                  <Icon icon='heroicons:heart' className='text-danger-600' style={{ fontSize: '24px' }} />
                  <div>
                    <p className='text-secondary-light text-sm mb-2'>Saved Jobs</p>
                    <p className='text-2xl fw-bold text-gray-800 mb-0'>{candidateData.savedJobs.length}</p>
                  </div>
                </div>
              </div>
              
              <div className='col-12 col-md-6 col-lg-3'>
                <div className='d-flex align-items-center gap-3'>
                  <Icon icon='heroicons:arrow-trending-up' className='text-warning-600' style={{ fontSize: '24px' }} />
                  <div>
                    <p className='text-secondary-light text-sm mb-2'>In Progress</p>
                    <p className='text-2xl fw-bold text-gray-800 mb-0'>2</p>
                  </div>
                </div>
              </div>
              
              <div className='col-12 col-md-6 col-lg-3'>
                <div className='d-flex align-items-center gap-3'>
                  <Icon icon='heroicons:user' className='text-success-600' style={{ fontSize: '24px' }} />
                  <div>
                    <p className='text-secondary-light text-sm mb-2'>Profile Completion</p>
                    <p className='text-2xl fw-bold text-gray-800 mb-0'>{candidateData.profileCompletion}%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className='row g-4 mb-24'>
          {/* Recent Applications */}
          <div className='col-12 col-lg-8'>
            <div className='card border-0 shadow-sm h-100'>
              <div className='card-body p-24'>
                <h3 className='text-xl fw-bold text-gray-800 mb-16'>📩 Recent Applications</h3>
                <div className='d-flex flex-column gap-3'>
                  {candidateData.recentApplications.map((app) => (
                    <div key={app.id} className='d-flex align-items-center justify-content-between p-16 border rounded-lg hover-shadow-sm transition'>
                      <div className='flex-grow-1'>
                        <h4 className='fw-semibold text-gray-800 mb-4'>{app.title}</h4>
                        <p className='text-sm text-secondary-light mb-4'>{app.company}</p>
                        <p className='text-xs text-secondary-light d-flex align-items-center gap-1'>
                          <Icon icon='heroicons:calendar' style={{ fontSize: '12px' }} />
                          Applied: {app.appliedOn}
                        </p>
                      </div>
                      <span className={`badge px-12 py-6 rounded-pill fw-medium ${getStatusColor(app.status)}`}>
                        {app.status}
                      </span>
                    </div>
                  ))}
                </div>
                <button className='btn btn-outline-primary w-100 mt-16'>
                  View All Applications →
                </button>
              </div>
            </div>
          </div>

          {/* Saved Jobs */}
          <div className='col-12 col-lg-4'>
            <div className='card border-0 shadow-sm h-100'>
              <div className='card-body p-24'>
                <h3 className='text-xl fw-bold text-gray-800 mb-16'>❤️ Saved Jobs</h3>
                <div className='d-flex flex-column gap-3'>
                  {candidateData.savedJobs.map((job) => (
                    <div key={job.id} className='p-12 border rounded-lg hover-bg-gray-50 transition'>
                      <h4 className='fw-semibold text-gray-800 text-sm mb-4'>{job.title}</h4>
                      <p className='text-xs text-secondary-light mb-8'>{job.company}</p>
                      <div className='d-flex align-items-center justify-content-between'>
                        <p className='text-xs text-secondary-light mb-0'>{job.savedOn}</p>
                        <button className='btn btn-link btn-sm text-primary-600 p-0'>View</button>
                      </div>
                    </div>
                  ))}
                </div>
                <button className='btn btn-outline-primary w-100 mt-16 text-sm'>
                  View All Saved →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Jobs */}
        <div className='card border-0 shadow-sm'>
          <div className='card-body p-24'>
            <h3 className='text-xl fw-bold text-gray-800 mb-16'>💡 Recommended Jobs For You</h3>
            <div className='row g-4'>
              {candidateData.recommendedJobs.map((job) => (
                <div key={job.id} className='col-12 col-lg-6'>
                  <div className='border rounded-lg p-20 hover-shadow-md transition bg-white h-100'>
                    <div className='d-flex align-items-start justify-content-between mb-16'>
                      <div>
                        <h4 className='text-sm text-secondary-light mb-4'>{job.company}</h4>
                        <h3 className='text-lg fw-semibold text-gray-800'>{job.title}</h3>
                      </div>
                      <div className='w-40-px h-40-px bg-primary-50 rounded d-flex align-items-center justify-content-center flex-shrink-0'>
                        <Icon icon='heroicons:briefcase' className='text-primary-600' style={{ fontSize: '20px' }} />
                      </div>
                    </div>
                    
                    <div className='row g-3 mb-16'>
                      <div className='col-4'>
                        <div className='d-flex align-items-center gap-1 text-secondary-light text-xs mb-4'>
                          <Icon icon='heroicons:map-pin' style={{ fontSize: '12px' }} />
                          <span className='text-uppercase'>Location</span>
                        </div>
                        <p className='text-sm fw-medium text-gray-800 mb-0'>{job.location}</p>
                      </div>
                      
                      <div className='col-4'>
                        <div className='d-flex align-items-center gap-1 text-secondary-light text-xs mb-4'>
                          <Icon icon='heroicons:briefcase' style={{ fontSize: '12px' }} />
                          <span className='text-uppercase'>Type</span>
                        </div>
                        <p className='text-sm fw-medium text-gray-800 mb-0'>{job.type}</p>
                      </div>
                      
                      <div className='col-4'>
                        <div className='d-flex align-items-center gap-1 text-secondary-light text-xs mb-4'>
                          <Icon icon='heroicons:arrow-trending-up' style={{ fontSize: '12px' }} />
                          <span className='text-uppercase'>Openings</span>
                        </div>
                        <p className='text-sm fw-medium text-gray-800 mb-0'>3</p>
                      </div>
                    </div>
                    
                    <div className='d-flex flex-wrap gap-2 mb-16'>
                      {job.skills.map((skill, idx) => (
                        <span key={idx} className='badge bg-secondary-50 text-secondary-600 px-8 py-4 text-xs'>
                          {skill}
                        </span>
                      ))}
                    </div>
                    
                    <div className='d-flex align-items-center justify-content-between pt-12 border-top'>
                      <button className='btn btn-link text-sm text-secondary-light p-0 d-flex align-items-center gap-2'>
                        <span className='w-8-px h-8-px bg-secondary-400 rounded-circle'></span>
                        Did Not Apply
                      </button>
                      <button className='btn btn-primary px-20 py-8 text-sm fw-medium'>
                        Apply Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDashboard;
