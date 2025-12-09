import React, { useState } from 'react';
import { Download, Mail, Phone, MapPin, Calendar, Briefcase, DollarSign, Clock, Linkedin, Github, X, CheckCircle } from 'lucide-react';

const CandidateProfilePage = ({ candidate, onClose }) => {
  const fullData = candidate.fullData || {};
  const [activeTab, setActiveTab] = useState('overview');
  const [currentStage, setCurrentStage] = useState(candidate.stage);
  const [actionMessage, setActionMessage] = useState(null);

  const avatar = candidate.name?.split(' ').map(n => n[0]).join('') || '?';
  const email = candidate.email || fullData.email || 'Not provided';
  const phone = fullData.phone || 'Not provided';
  const role = candidate.role || fullData.role || 'Not specified';
  const appliedDate = fullData.applied_date
    ? new Date(fullData.applied_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'Not available';
  const summary = fullData.summary || fullData.about || 'No summary provided.';
  const educationDetails = fullData.education_details || {};
  const educationDegree = educationDetails.degree || fullData.education || null;
  const educationInstitution = educationDetails.institution || educationDetails.college || null;
  const educationYear = educationDetails.year || fullData.graduation_year || null;
  const experienceValue = fullData.experience || fullData.experience_years || fullData.total_experience || null;
  const lastCompany = fullData.last_company || fullData.current_company || null;
  const expectedSalary = fullData.expected_salary || 'Not specified';
  const location = fullData.location || 'Not specified';
  const availability = fullData.availability || 'Not specified';
  const noticePeriod = fullData.notice_period || 'Not specified';
  const linkedinUrl = fullData.linkedin || '';
  const githubUrl = fullData.github || '';
  const skills = Array.isArray(candidate.skills)
    ? candidate.skills
    : fullData.skills
    ? fullData.skills.split(',').map(skill => skill.trim())
    : [];
  const workHistory = Array.isArray(fullData.work_history) ? fullData.work_history : [];
  const resumeUrl = candidate.resume_url || fullData.resume_url || '';

  const showActionMessage = (message, type = 'success') => {
    setActionMessage({ message, type });
    setTimeout(() => setActionMessage(null), 3000);
  };

  const handleShortlist = () => {
    if (currentStage === 'Applied') {
      setCurrentStage('Screening');
      showActionMessage(`✅ ${candidate.name} has been shortlisted and moved to Screening stage!`);
    } else {
      showActionMessage(`✅ ${candidate.name} has been shortlisted!`);
    }
  };

  const handleReject = () => {
    if (window.confirm(`Are you sure you want to reject ${candidate.name}?`)) {
      setCurrentStage('Rejected');
      showActionMessage(`❌ ${candidate.name} has been rejected.`, 'danger');
    }
  };

  const handleStageChange = (e) => {
    const newStage = e.target.value;
    if (newStage && newStage !== '⏭ Move to Stage') {
      setCurrentStage(newStage);
      showActionMessage(`✅ ${candidate.name} has been moved to ${newStage} stage!`);
    }
  };

  const handleSubmit = () => {
    showActionMessage(`✅ Profile updated successfully! All changes for ${candidate.name} have been saved.`);
    // You can add API call here to save the changes to the backend
  };

  const getStageColor = (stage) => {
    const colors = {
      'Applied': 'bg-primary-subtle text-primary',
      'Screening': 'bg-info-subtle text-info',
      'Interview': 'bg-warning-subtle text-warning',
      'Offer': 'bg-success-subtle text-success',
      'Hired': 'bg-success-subtle text-success',
      'Rejected': 'bg-danger-subtle text-danger'
    };
    return colors[stage] || 'bg-secondary-subtle text-secondary';
  };

  return (
    <div className="modal-dialog modal-xxl modal-dialog-scrollable" style={{ 
      maxWidth: '1350px', 
      width: '95%', 
      margin: '0 auto',
      display: 'flex',
      alignItems: 'center',
      minHeight: 'calc(100vh - 40px)'
    }}>
      <div className="modal-content" style={{
        maxHeight: '90vh', 
        borderRadius: '0.5rem',
        margin: 'auto',
        width: '100%'
      }} onClick={(e) => e.stopPropagation()}>
          <div className="modal-header align-items-center border-0 pb-0">
            <div>
              <p className="text-uppercase text-muted small mb-1">Candidate Profile</p>
            </div>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div className="container-fluid">
              
              {/* Action Message */}
              {actionMessage && (
                <div className={`alert alert-${actionMessage.type} alert-dismissible fade show`} role="alert">
                  {actionMessage.message}
                  <button type="button" className="btn-close" onClick={() => setActionMessage(null)}></button>
                </div>
              )}

              {/* Profile Header */}
              <div className="card border shadow-sm mb-4">
                <div className="card-body p-4">
                  <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start gap-4">
                    <div className="d-flex gap-4 flex-grow-1 align-items-center">
                     
                      <div>
                        <h6 className="mb-1">{candidate.name}</h6>
                        <p className="text-muted mb-3">{role}</p>
                        <div className="d-flex flex-wrap gap-3 mb-2">
                          <div className="d-inline-flex align-items-center gap-2 text-muted small">
                            <Phone size={16} />
                            <span>{phone}</span>
                          </div>
                          <div className="d-inline-flex align-items-center gap-2 text-muted small">
                            <Mail size={16} />
                            <span>{email}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-lg-end w-100 w-lg-auto">
                    </div>
                  </div>
                </div>
              </div>

            

              {/* Tabs Navigation */}
              <div className="card border shadow-sm">
                <div className="card-header bg-white border-bottom">
                  <ul className="nav nav-tabs card-header-tabs border-0">
                    {['overview', 'skills', 'work history'].map((tab) => (
                      <li className="nav-item" key={tab}>
                        <button
                          onClick={() => setActiveTab(tab)}
                          className={`nav-link text-capitalize ${activeTab === tab ? 'active' : ''}`}
                        >
                          {tab}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Tab Content */}
                <div className="card-body p-4">
                  
                  {/* Overview Tab */}
                  {activeTab === 'overview' && (
                    <div>
                      <div className="mb-4">
                        <h6 className="mb-3">About Me</h6>
                        <p className="text-muted">{summary}</p>
                      </div>

                      <div className="row mb-4">
                        <div className="col-md-6 mb-3 mb-md-0">
                          <h6 className="mb-3">Education</h6>
                          <div className="card bg-light border-0">
                            <div className="card-body">
                              {educationDegree || educationInstitution || educationYear ? (
                                <>
                                  {educationDegree && <p className="fw-semibold mb-1">{educationDegree}</p>}
                                  {educationInstitution && <p className="text-muted mb-1">{educationInstitution}</p>}
                                  {educationYear && <p className="text-muted small mb-0">Graduated: {educationYear}</p>}
                                </>
                              ) : (
                                <p className="text-muted mb-0">Education details not provided.</p>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="col-md-6">
                          <h6 className="mb-3">Experience</h6>
                          <div className="card bg-light border-0">
                            <div className="card-body">
                              <div className="d-flex align-items-center gap-2 mb-2">
                                <Briefcase size={18} className="text-muted" />
                                <span className="fw-semibold">{experienceValue || 'Not specified'}</span>
                              </div>
                              <p className="text-muted small mb-0">
                                Last Company: {lastCompany || 'Not specified'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="d-flex flex-column gap-3">
                        <div className="border rounded-3 p-3 bg-primary-subtle">
                          <div className="text-primary small fw-semibold text-uppercase mb-1">Expected Salary</div>
                          <div className="fw-bold fs-5">{expectedSalary}</div>
                        </div>
                        <div className="border rounded-3 p-3 bg-success-subtle">
                          <div className="text-success small fw-semibold text-uppercase mb-1">Location</div>
                          <div className="fw-bold fs-5">{location}</div>
                        </div>
                        <div className="border rounded-3 p-3" style={{ backgroundColor: '#f3e8ff' }}>
                          <div className="small fw-semibold text-uppercase mb-1" style={{ color: '#7c3aed' }}>Availability</div>
                          <div className="fw-bold fs-5">{availability}</div>
                        </div>
                        <div className="border rounded-3 p-3 bg-warning-subtle">
                          <div className="text-warning small fw-semibold text-uppercase mb-1">Notice Period</div>
                          <div className="fw-bold fs-5">{noticePeriod}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Skills Tab */}
                  {activeTab === 'skills' && (
                    <div>
                      <h5 className="mb-4">Technical & Soft Skills</h5>
                      <div className="d-flex flex-wrap gap-2">
                        {skills.length > 0 ? skills.map((skill, index) => (
                          <span key={index} className="badge bg-primary fs-6 px-3 py-2">
                            {skill}
                          </span>
                        )) : (
                          <span className="text-muted">No skills provided.</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Work History Tab */}
                  {activeTab === 'work history' && (
                    <div>
                      <h5 className="mb-4">Work Experience</h5>
                      <div className="d-flex flex-column gap-3">
                        {workHistory.length > 0 ? workHistory.map((job, index) => (
                          <div key={index} className="card border">
                            <div className="card-body">
                              <div className="d-flex justify-content-between align-items-start mb-3 flex-wrap">
                                <div>
                                  <h6 className="mb-1">{job.role}</h6>
                                  <p className="text-primary fw-semibold mb-0">{job.company}</p>
                                </div>
                                <span className="badge bg-light text-dark">
                                  {job.duration}
                                </span>
                              </div>
                              <p className="text-muted small mb-0">{job.description}</p>
                            </div>
                          </div>
                        )) : (
                          <div className="card border">
                            <div className="card-body">
                              <p className="text-muted mb-0">No work history provided.</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="modal-footer border-top d-flex flex-wrap justify-content-between align-items-center gap-2">
            <div className="text-muted small">
              <span>
                Last Updated:{' '}
                {fullData.updated_at
                  ? new Date(fullData.updated_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                  : 'Not available'}
              </span>
            </div>
            <div className="d-flex flex-wrap gap-2">
              <button
                type="button"
                className="btn btn-outline-primary d-inline-flex align-items-center gap-2"
                disabled={!resumeUrl}
                onClick={() => resumeUrl && window.open(resumeUrl, '_blank')}
              >
                <Download size={16} />
                Download Resume
              </button>
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
  );
};

export default CandidateProfilePage;

