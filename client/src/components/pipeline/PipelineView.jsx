import React, { useState, useEffect } from 'react';
import { Search, Plus, Eye, MoreVertical, Users, TrendingUp, Calendar, ArrowRight, RefreshCw } from 'lucide-react';
import { BASE_URL } from '../../config/api.config';

const PipelineView = () => {
  const [stages, setStages] = useState([]);
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [draggedCard, setDraggedCard] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [showAddStage, setShowAddStage] = useState(false);
  const [newStageName, setNewStageName] = useState('');
  const [openMenuId, setOpenMenuId] = useState(null);
  const [editingStageId, setEditingStageId] = useState(null);
  const [editStageName, setEditStageName] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  // Stage configurations
  const defaultStages = [
    { id: 'applied', name: 'Applied', color: 'bg-primary text-white', bgColor: 'bg-primary-subtle' },
    { id: 'screening', name: 'Screening', color: 'bg-info text-white', bgColor: 'bg-info-subtle' },
    { id: 'interview', name: 'Interview', color: 'bg-warning text-dark', bgColor: 'bg-warning-subtle' },
    { id: 'offer', name: 'Offer', color: 'bg-success text-white', bgColor: 'bg-success-subtle' },
    { id: 'hired', name: 'Hired', color: 'bg-danger text-white', bgColor: 'bg-danger-subtle' }
  ];

  // Fetch data from backend
  const fetchData = async () => {
    setLoading(true);
    try {
      const [applicationsRes, jobsRes] = await Promise.all([
        fetch(`${BASE_URL}/api/candidates/applications`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }),
        fetch(`${BASE_URL}/api/jobs/list`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
      ]);

      const applicationsData = await applicationsRes.json();
      const jobsData = await jobsRes.json();

      console.log('📥 Fetched applications data:', applicationsData);
      console.log('📥 Total applications:', applicationsData?.length || 0);
      
      // Log all candidate stages for debugging
      if (Array.isArray(applicationsData)) {
        const stagesFound = applicationsData.map(app => ({
          name: app.candidate_name,
          email: app.candidate_email,
          candidate_stage: app.candidate_stage,
          status: app.status
        }));
        console.log('📊 All candidate stages in fetched data:', stagesFound);
        
        // Specifically log "Offered" candidates
        const offeredCandidates = applicationsData.filter(app => {
          const stage = (app.candidate_stage || '').toLowerCase().trim();
          return stage === 'offered' || stage === 'offer';
        });
        console.log('🎯 Candidates with "Offered" stage in fetched data:', offeredCandidates);
      }

      setApplications(Array.isArray(applicationsData) ? applicationsData : []);
      setJobs(Array.isArray(jobsData) ? jobsData : []);
      
      // Organize applications by stage
      organizeDataByStage(applicationsData || []);
    } catch (error) {
      console.error('Error fetching pipeline data:', error);
      setApplications([]);
      setJobs([]);
      organizeDataByStage([]);
    } finally {
      setLoading(false);
    }
  };

  // Organize applications into stages
  const organizeDataByStage = (applicationsData) => {
    console.log('📊 Organizing applications by stage. Total applications:', applicationsData.length);
    
    const stagesWithCandidates = defaultStages.map(stage => {
      const candidates = applicationsData
        .filter(app => {
          const status = (app.status?.toLowerCase() || '').trim();
          const candidateStage = (app.candidate_stage?.toLowerCase() || '').trim();
          
          // Map status/stage to our stage IDs (case-insensitive matching)
          if (stage.id === 'applied') return status === 'applied' || candidateStage === 'applied';
          if (stage.id === 'screening') return candidateStage === 'screening';
          if (stage.id === 'interview') return candidateStage === 'interview' || candidateStage === 'interview stage';
          if (stage.id === 'offer') {
            // Match "offer" or "offered" (case-insensitive, with trimming)
            const isOffer = candidateStage === 'offer' || candidateStage === 'offered';
            if (isOffer) {
              console.log(`✅ Found candidate in Offer stage:`, {
                name: app.candidate_name,
                email: app.candidate_email,
                candidate_stage: app.candidate_stage,
                normalized: candidateStage,
                raw_stage: app.candidate_stage
              });
            }
            return isOffer;
          }
          if (stage.id === 'hired') return status === 'hired' || candidateStage === 'hired';
          return false;
        })
        .map(app => ({
          id: app.id,
          applicationId: app.id,
          candidateId: app.candidate_id,
          name: app.candidate_name || 'Unknown',
          email: app.candidate_email || '',
          role: app.role || 'Not specified',
          avatar: getInitials(app.candidate_name || 'UN'),
          appliedDate: app.applied_at ? new Date(app.applied_at).toLocaleDateString() : 'N/A',
          jobId: app.job_id,
          status: app.status,
          skills: app.skills || '',
          resumeUrl: app.resume_url || null
        }));

      return {
        ...stage,
        candidates
      };
    });

    setStages(stagesWithCandidates);
    
    // Log summary
    console.log('📊 Pipeline stages organized:');
    stagesWithCandidates.forEach(stage => {
      console.log(`   ${stage.name}: ${stage.candidates.length} candidates`);
    });
  };

  // Get initials from name
  const getInitials = (name) => {
    if (!name) return 'UN';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Get job title by ID
  const getJobTitle = (jobId) => {
    const job = jobs.find(j => j.id === jobId);
    return job?.title || 'Unknown Position';
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleViewProfile = (candidate) => {
    setSelectedCandidate(candidate);
  };

  const handleScheduleInterview = () => {
    if (selectedCandidate) {
      alert(`Interview scheduled for ${selectedCandidate.name}!`);
    }
  };

  const handleSendEmail = () => {
    if (selectedCandidate) {
      alert(`Email sent to ${selectedCandidate.name} at ${selectedCandidate.name.toLowerCase().replace(' ', '.')}@email.com`);
    }
  };

  const handleRejectCandidate = () => {
    if (selectedCandidate && window.confirm(`Are you sure you want to reject ${selectedCandidate.name}?`)) {
      // Move candidate to rejected stage or remove from pipeline
      setStages(prevStages => {
        return prevStages.map(stage => ({
          ...stage,
          candidates: stage.candidates.filter(c => c.id !== selectedCandidate.id)
        }));
      });
      setSelectedCandidate(null);
      alert(`${selectedCandidate.name} has been rejected and removed from the pipeline.`);
    }
  };

  const handleEditStage = (stageId, currentName) => {
    setEditingStageId(stageId);
    setEditStageName(currentName);
    setOpenMenuId(null);
  };

  const handleSaveEditStage = () => {
    if (editStageName.trim()) {
      setStages(prevStages => 
        prevStages.map(stage => 
          stage.id === editingStageId 
            ? { ...stage, name: editStageName }
            : stage
        )
      );
      setEditingStageId(null);
      setEditStageName('');
    }
  };

  const handleDeleteStage = (stageId) => {
    if (window.confirm('Are you sure you want to delete this stage? All candidates will be moved to "Applied" stage.')) {
      const stageToDelete = stages.find(s => s.id === stageId);
      const candidatesToMove = stageToDelete?.candidates || [];
      
      setStages(prevStages => {
        const filtered = prevStages.filter(s => s.id !== stageId);
        if (candidatesToMove.length > 0) {
          return filtered.map(stage => 
            stage.id === 'applied'
              ? { ...stage, candidates: [...stage.candidates, ...candidatesToMove] }
              : stage
          );
        }
        return filtered;
      });
      setOpenMenuId(null);
    }
  };

  const handleDragStart = (e, candidate, stageId) => {
    setDraggedCard({ candidate, sourceStageId: stageId });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, targetStageId) => {
    e.preventDefault();
    
    if (!draggedCard || draggedCard.sourceStageId === targetStageId) {
      setDraggedCard(null);
      return;
    }

    const candidate = draggedCard.candidate;
    
    // Optimistically update UI
    setStages(prevStages => {
      const newStages = prevStages.map(stage => {
        if (stage.id === draggedCard.sourceStageId) {
          return {
            ...stage,
            candidates: stage.candidates.filter(c => c.id !== candidate.id)
          };
        }
        if (stage.id === targetStageId) {
          return {
            ...stage,
            candidates: [...stage.candidates, candidate]
          };
        }
        return stage;
      });
      return newStages;
    });

    // Update backend
    try {
      const updateData = {
        status: targetStageId === 'hired' ? 'hired' : (targetStageId === 'applied' ? 'applied' : 'pipeline')
      };

      await fetch(`${BASE_URL}/api/candidates/applications/${candidate.applicationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updateData)
      });

      // Refresh data to ensure consistency
      fetchData();
    } catch (error) {
      console.error('Error updating candidate stage:', error);
      alert('Failed to update candidate stage. Please try again.');
      // Revert optimistic update
      fetchData();
    }

    setDraggedCard(null);
  };

  const handleAddStage = () => {
    if (newStageName.trim()) {
      const colors = [
        { color: 'bg-secondary-subtle text-secondary', bgColor: 'bg-secondary-subtle' },
        { color: 'bg-dark-subtle text-dark', bgColor: 'bg-dark-subtle' },
        { color: 'bg-light text-dark', bgColor: 'bg-light' }
      ];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      
      const newStage = {
        id: `stage-${Date.now()}`,
        name: newStageName,
        ...randomColor,
        candidates: []
      };
      setStages([...stages, newStage]);
      setNewStageName('');
      setShowAddStage(false);
    }
  };

  const filteredStages = stages.map(stage => ({
    ...stage,
    candidates: stage.candidates.filter(candidate => {
      const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           candidate.role.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = filterRole === 'all' || candidate.role.toLowerCase().includes(filterRole.toLowerCase());
      return matchesSearch && matchesRole;
    })
  }));

  const totalCandidates = stages.reduce((sum, stage) => sum + stage.candidates.length, 0);

  return (
    <div className="container-fluid py-4">
      {loading && stages.length === 0 ? (
        <div className="d-flex justify-content-center align-items-center" style={{minHeight: '400px'}}>
          <div className="text-center">
            <div className="spinner-border text-primary" role="status" style={{width: '3rem', height: '3rem'}}>
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted mt-3">Loading pipeline data...</p>
          </div>
        </div>
      ) : (
        <>
      {/* Header */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="mb-2">Recruitment Pipeline</h2>
            <p className="text-muted mb-0">Track and manage candidates through hiring stages</p>
          </div>
          <div className="d-flex gap-2">
            <button
              onClick={fetchData}
              disabled={loading}
              className="btn btn-outline-primary d-flex align-items-center gap-2"
            >
              <RefreshCw size={18} className={loading ? 'spinner' : ''} />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="card border shadow-sm mb-4">
          <div className="row g-0">
            <div className="col-md-3 border-end">
              <div className="card-body text-center">
                <div className="d-flex align-items-center justify-content-center gap-3 mb-2">
                  <div className="p-2 bg-primary-subtle rounded">
                    <Users size={20} className="text-primary" />
                  </div>
                  <span className="text-muted small">Total Candidates</span>
                </div>
                <h3 className="mb-0">{totalCandidates}</h3>
              </div>
            </div>
          
            <div className="col-md-3 border-end">
              <div className="card-body text-center">
                <div className="d-flex align-items-center justify-content-center gap-3 mb-2">
                  <div className="p-2 bg-success-subtle rounded">
                    <TrendingUp size={20} className="text-success" />
                  </div>
                  <span className="text-muted small">Hired This Month</span>
                </div>
                <h3 className="mb-0">{stages.find(s => s.id === 'hired')?.candidates.length || 0}</h3>
              </div>
            </div>

            <div className="col-md-3 border-end">
              <div className="card-body text-center">
                <div className="d-flex align-items-center justify-content-center gap-3 mb-2">
                  <div className="p-2 bg-warning-subtle rounded">
                    <Calendar size={20} className="text-warning" />
                  </div>
                  <span className="text-muted small">Active Offers</span>
                </div>
                <h3 className="mb-0">{stages.find(s => s.id === 'offer')?.candidates.length || 0}</h3>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card-body text-center">
                <div className="d-flex align-items-center justify-content-center gap-3 mb-2">
                  <div className="p-2 bg-info-subtle rounded">
                    <ArrowRight size={20} className="text-info" />
                  </div>
                  <span className="text-muted small">Pipeline Stages</span>
                </div>
                <h3 className="mb-0">{stages.length}</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="d-flex gap-3 mb-4">
          <div className="flex-grow-1">
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0">
                <Search size={16} className="text-muted" />
              </span>
              <input
                type="text"
                placeholder="Search candidates by name or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-control border-start-0"
              />
            </div>
          </div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="form-select w-auto"
          >
            <option value="all">All Roles</option>
            <option value="frontend">Frontend</option>
            <option value="backend">Backend</option>
            <option value="designer">Designer</option>
            <option value="devops">DevOps</option>
          </select>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="d-flex gap-3 overflow-auto pb-3">
        {filteredStages.map(stage => (
          <div
            key={stage.id}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, stage.id)}
            className={`flex-shrink-0 border rounded p-3 ${stage.bgColor}`}
            style={{width: '320px'}}
          >
            {/* Stage Header */}
            <div className="d-flex justify-content-between align-items-center mb-3 p-2 rounded bg-white bg-opacity-75">
              <div className="d-flex align-items-center gap-2">
                <span className={`badge ${stage.color} fs-6 px-3 py-2 fw-bold`}>
                  {stage.name}
                </span>
                <span className="text-muted fw-semibold fs-5">
                  {stage.candidates.length}
                </span>
              </div>
              <div className="position-relative">
                <button 
                  onClick={() => setOpenMenuId(openMenuId === stage.id ? null : stage.id)}
                  className="btn btn-link btn-sm text-muted p-1"
                >
                  <MoreVertical size={20} />
                </button>
                {openMenuId === stage.id && (
                  <>
                    <div 
                      className="position-fixed top-0 start-0 w-100 h-100" 
                      style={{zIndex: 10}}
                      onClick={() => setOpenMenuId(null)}
                    />
                    <div className="position-absolute end-0 mt-2 bg-white rounded shadow border" style={{width: '200px', zIndex: 20}}>
                      <button 
                        onClick={() => handleEditStage(stage.id, stage.name)}
                        className="w-100 px-3 py-2 btn btn-link text-start text-dark border-0 rounded-top"
                      >
                        Edit Stage
                      </button>
                      <button 
                        onClick={() => handleDeleteStage(stage.id)}
                        className="w-100 px-3 py-2 btn btn-link text-start text-danger border-0 rounded-bottom"
                      >
                        Delete Stage
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Candidate Cards */}
            <div className="d-flex flex-column gap-2" style={{minHeight: '200px'}}>
              {stage.candidates.map(candidate => (
                <div
                  key={candidate.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, candidate, stage.id)}
                  className="card border shadow-sm"
                  style={{cursor: 'move'}}
                >
                  <div className="card-body p-3">
                    <div className="d-flex align-items-start gap-3">
                      <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{width: '40px', height: '40px'}}>
                        {candidate.avatar}
                      </div>
                      <div className="flex-grow-1">
                        <h6 className="mb-1">{candidate.name}</h6>
                        <p className="text-muted small mb-1">{candidate.role}</p>
                        <p className="text-muted small mb-0">Applied: {candidate.appliedDate}</p>
                      </div>
                    </div>
                    
                    <div className="d-flex gap-2 mt-3">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewProfile(candidate);
                        }}
                        className="btn btn-outline-info btn-sm d-flex align-items-center gap-1"
                      >
                        <Eye size={14} />
                        View
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Add Stage Column */}
        <div className="flex-shrink-0" style={{width: '320px'}}>
          <button
            onClick={() => setShowAddStage(true)}
            className="w-100 h-100 border-2 border-dashed border-secondary rounded d-flex flex-column align-items-center justify-content-center gap-2 text-muted"
            style={{minHeight: '200px'}}
          >
            <Plus size={32} />
            <span className="fw-semibold">Add New Stage</span>
          </button>
        </div>
      </div>

      {/* Candidate Profile Modal */}
      {selectedCandidate && (
        <div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050}} tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
              {/* Modal Header */}
              <div className="modal-header">
                <div className="d-flex align-items-center gap-3">
                  <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{width: '60px', height: '60px', fontSize: '24px', fontWeight: 'bold'}}>
                    {selectedCandidate.avatar}
                  </div>
                  <div>
                    <h5 className="modal-title mb-1">{selectedCandidate.name}</h5>
                    <p className="text-muted mb-0">{selectedCandidate.role}</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedCandidate(null)}
                ></button>
              </div>

              {/* Modal Content */}
              <div className="modal-body">
                {/* Contact Information */}
                <div className="mb-4">
                  <h6 className="fw-semibold mb-3">Contact Information</h6>
                  <div className="card bg-light">
                    <div className="card-body">
                      <div className="row g-2">
                        <div className="col-4 text-muted">Email:</div>
                        <div className="col-8 fw-medium">{selectedCandidate.email || 'N/A'}</div>
                        <div className="col-4 text-muted">Status:</div>
                        <div className="col-8">
                          <span className="badge bg-primary text-capitalize">{selectedCandidate.status || 'Applied'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Application Details */}
                <div className="mb-4">
                  <h6 className="fw-semibold mb-3">Application Details</h6>
                  <div className="card bg-light">
                    <div className="card-body">
                      <div className="row g-2">
                        <div className="col-4 text-muted">Applied Date:</div>
                        <div className="col-8 fw-medium">{selectedCandidate.appliedDate}</div>
                        <div className="col-4 text-muted">Position:</div>
                        <div className="col-8 fw-medium">{selectedCandidate.role}</div>
                        <div className="col-4 text-muted">Job:</div>
                        <div className="col-8 fw-medium">{getJobTitle(selectedCandidate.jobId)}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Skills */}
                {selectedCandidate.skills && (
                  <div className="mb-4">
                    <h6 className="fw-semibold mb-3">Skills</h6>
                    <div className="d-flex flex-wrap gap-2">
                      {selectedCandidate.skills.split(',').map((skill, index) => (
                        <span key={index} className="badge bg-primary">
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Resume */}
                {selectedCandidate.resumeUrl && (
                  <div className="mb-4">
                    <h6 className="fw-semibold mb-3">Resume</h6>
                    <a 
                      href={selectedCandidate.resumeUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-2"
                    >
                      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download Resume
                    </a>
                  </div>
                )}

                {/* Notes */}
                <div className="mb-4">
                  <h6 className="fw-semibold mb-3">Interview Notes</h6>
                  <textarea
                    placeholder="Add notes about this candidate..."
                    className="form-control"
                    rows="4"
                  ></textarea>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="modal-footer">
                <button 
                  className="btn btn-success"
                  onClick={handleScheduleInterview}
                >
                  Schedule Interview
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={handleSendEmail}
                >
                  Send Email
                </button>
                <button 
                  className="btn btn-outline-secondary"
                  onClick={handleRejectCandidate}
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Stage Modal */}
      {editingStageId && (
        <div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050}} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Stage</h5>
                <button type="button" className="btn-close" onClick={() => {
                  setEditingStageId(null);
                  setEditStageName('');
                }}></button>
              </div>
              <div className="modal-body">
                <input
                  type="text"
                  placeholder="Enter stage name..."
                  value={editStageName}
                  onChange={(e) => setEditStageName(e.target.value)}
                  className="form-control"
                  autoFocus
                />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setEditingStageId(null);
                    setEditStageName('');
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSaveEditStage}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Stage Modal */}
      {showAddStage && (
        <div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050}} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New Stage</h5>
                <button type="button" className="btn-close" onClick={() => {
                  setShowAddStage(false);
                  setNewStageName('');
                }}></button>
              </div>
              <div className="modal-body">
                <input
                  type="text"
                  placeholder="Enter stage name..."
                  value={newStageName}
                  onChange={(e) => setNewStageName(e.target.value)}
                  className="form-control"
                  autoFocus
                />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowAddStage(false);
                    setNewStageName('');
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleAddStage}
                >
                  Add Stage
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
        </>
      )}
      
      <style jsx>{`
        .spinner {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .hover-bg-light:hover {
          background-color: #f8f9fa;
        }
      `}</style>
    </div>
  );
};

export default PipelineView;
