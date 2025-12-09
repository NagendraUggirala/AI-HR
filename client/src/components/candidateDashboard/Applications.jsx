import React, { useState } from 'react';
import { Icon } from '@iconify/react';

const Applications = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const applicationsData = [
    {
      id: 1,
      jobTitle: "Frontend Developer",
      company: "Veritech Software",
      dateApplied: "2025-10-05",
      status: "In Review"
    },
    {
      id: 2,
      jobTitle: "Backend Developer",
      company: "DCM Tech",
      dateApplied: "2025-09-28",
      status: "Interview Scheduled"
    },
    {
      id: 3,
      jobTitle: "UI/UX Designer",
      company: "DesignPro Labs",
      dateApplied: "2025-09-20",
      status: "Rejected"
    },
    {
      id: 4,
      jobTitle: "Full Stack Developer",
      company: "TechNova Solutions",
      dateApplied: "2025-09-22",
      status: "Offer"
    },
    {
      id: 5,
      jobTitle: "React Developer",
      company: "WebCraft Inc",
      dateApplied: "2025-09-15",
      status: "In Review"
    },
    {
      id: 6,
      jobTitle: "Senior Software Engineer",
      company: "CloudSystems Ltd",
      dateApplied: "2025-09-10",
      status: "Interview Scheduled"
    }
  ];

  const statusConfig = {
    "In Review": { color: "bg-primary-50 text-primary-600 border-primary-200", icon: "🔵" },
    "Interview Scheduled": { color: "bg-warning-50 text-warning-600 border-warning-200", icon: "🟡" },
    "Offer": { color: "bg-success-50 text-success-600 border-success-200", icon: "🟢" },
    "Rejected": { color: "bg-danger-50 text-danger-600 border-danger-200", icon: "🔴" }
  };

  const filterOptions = ["All", "In Review", "Interview Scheduled", "Offer", "Rejected"];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const filteredApplications = applicationsData.filter(app => {
    const matchesFilter = activeFilter === 'All' || app.status === activeFilter;
    const matchesSearch = app.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.company.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusCount = (status) => {
    if (status === 'All') return applicationsData.length;
    return applicationsData.filter(app => app.status === status).length;
  };

  return (
    <div className='dashboard-main-body'>
      <div className='container-fluid'>
        {/* Header Section */}
        <div className='mb-24'>
          <div className='d-flex align-items-center gap-3 mb-8'>
            <h1 className='text-2xl  text-gray-800 mb-4'>My Applications</h1>
          </div>
          <p className='text-secondary-light text-lg'>Track the progress of jobs you've applied for</p>
        </div>

        {/* Search and Export Bar */}
        <div className='card border-0 shadow-sm mb-20'>
          <div className='card-body p-16'>
            <div className='row g-3 align-items-center'>
              <div className='col-12 col-md-9'>
                <div className='position-relative'>
                  <Icon 
                    icon='heroicons:magnifying-glass' 
                    className='position-absolute start-0 top-50 translate-middle-y ms-12 text-secondary-light' 
                    style={{ fontSize: '20px' }} 
                  />
                  <input
                    type='text'
                    placeholder='Search by job title or company...'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className='form-control ps-40'
                  />
                </div>
              </div>
              <div className='col-12 col-md-3'>
                <button className='btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-2'>
                  <Icon icon='heroicons:arrow-down-tray' style={{ fontSize: '16px' }} />
                  Export
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className='card border-0 shadow-sm mb-20'>
          <div className='card-body p-8'>
            <div className='d-flex gap-2 overflow-auto'>
              {filterOptions.map(filter => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`btn px-16 py-8 fw-medium text-nowrap ${
                    activeFilter === filter
                      ? 'btn-primary'
                      : 'btn-outline-secondary'
                  }`}
                >
                  {filter}
                  <span className={`badge ms-8 ${
                    activeFilter === filter
                      ? 'bg-primary-600 text-white'
                      : 'bg-secondary-200 text-secondary-600'
                  }`}>
                    {getStatusCount(filter)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Applications Table - Desktop */}
        <div className='card border-0 shadow-sm d-none d-md-block'>
          <div className='table-responsive'>
            <table className='table table-hover mb-0'>
              <thead className='bg-neutral-50'>
                <tr>
                  <th className='px-20 py-16 fw-semibold text-gray-700'>Job Title</th>
                  <th className='px-20 py-16 fw-semibold text-gray-700'>Company</th>
                  <th className='px-20 py-16 fw-semibold text-gray-700'>Date Applied</th>
                  <th className='px-20 py-16 fw-semibold text-gray-700'>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.length > 0 ? (
                  filteredApplications.map((app) => (
                    <tr
                      key={app.id}
                      className='hover-bg-primary-50 transition cursor-pointer'
                    >
                      <td className='px-20 py-16'>
                        <div className='d-flex align-items-center gap-2'>
                          <Icon icon='heroicons:briefcase' className='text-secondary-light' style={{ fontSize: '16px' }} />
                          <span className='fw-medium text-gray-900'>{app.jobTitle}</span>
                        </div>
                      </td>
                      <td className='px-20 py-16'>
                        <div className='d-flex align-items-center gap-2'>
                          <Icon icon='heroicons:building-office-2' className='text-secondary-light' style={{ fontSize: '16px' }} />
                          <span className='text-gray-700'>{app.company}</span>
                        </div>
                      </td>
                      <td className='px-20 py-16'>
                        <div className='d-flex align-items-center gap-2'>
                          <Icon icon='heroicons:calendar' className='text-secondary-light' style={{ fontSize: '16px' }} />
                          <span className='text-secondary-light'>{formatDate(app.dateApplied)}</span>
                        </div>
                      </td>
                      <td className='px-20 py-16'>
                        <span className={`badge px-12 py-6 text-xs fw-medium border ${statusConfig[app.status].color}`}>
                          {app.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan='4' className='px-20 py-32 text-center text-secondary-light'>
                      No applications found matching your criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Applications Cards - Mobile */}
        <div className='d-md-none'>
          {filteredApplications.length > 0 ? (
            <div className='d-flex flex-column gap-3'>
              {filteredApplications.map(app => (
                <div key={app.id} className='card border-0 shadow-sm hover-shadow-md transition'>
                  <div className='card-body p-16'>
                    <div className='d-flex justify-content-between align-items-start mb-12'>
                      <div className='flex-grow-1'>
                        <h3 className='fw-semibold text-gray-900 text-lg mb-4'>{app.jobTitle}</h3>
                        <div className='d-flex align-items-center gap-2 text-secondary-light mb-8'>
                          <Icon icon='heroicons:building-office-2' style={{ fontSize: '16px' }} />
                          <span className='text-sm'>{app.company}</span>
                        </div>
                      </div>
                      <span className={`badge px-12 py-6 text-xs fw-medium border ${statusConfig[app.status].color}`}>
                        {app.status}
                      </span>
                    </div>
                    <div className='d-flex align-items-center gap-2 text-secondary-light text-sm'>
                      <Icon icon='heroicons:calendar' style={{ fontSize: '16px' }} />
                      <span>Applied on {formatDate(app.dateApplied)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='card border-0 shadow-sm text-center py-32'>
              <div className='card-body'>
                <p className='text-secondary-light mb-0'>No applications found matching your criteria</p>
              </div>
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredApplications.length > 0 && (
          <div className='mt-24 d-flex justify-content-center align-items-center gap-2'>
            <button className='btn btn-outline-secondary px-16 py-8 fw-medium'>
              Previous
            </button>
            <button className='btn btn-primary px-16 py-8 fw-medium'>1</button>
            <button className='btn btn-outline-secondary px-16 py-8 fw-medium'>2</button>
            <button className='btn btn-outline-secondary px-16 py-8 fw-medium'>
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Applications;

