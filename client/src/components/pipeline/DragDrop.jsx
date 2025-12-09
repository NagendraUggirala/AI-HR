import React, { useState, useEffect } from 'react';
import { Search, Filter, User, Calendar, MapPin, Phone, Mail, FileText, MoreVertical } from 'lucide-react';

const PipelineDragDrop = () => {
  // Mock data for stages
  const stages = [
    { id: 'applied', name: 'Applied' },
    { id: 'phone-screen', name: 'Phone Screen' },
    { id: 'onsite-interview', name: 'Onsite Interview' },
    { id: 'offer-extended', name: 'Offer Extended' },
    { id: 'hired', name: 'Hired' },
    { id: 'rejected', name: 'Rejected' }
  ];

  const getStageBadgeClass = (stageIdOrName) => {
    const key = String(stageIdOrName).toLowerCase();
    if (key.includes('applied')) return 'badge bg-info-subtle text-info-main';
    if (key.includes('phone')) return 'badge bg-primary-subtle text-primary-600';
    if (key.includes('onsite')) return 'badge bg-warning-subtle text-warning-main';
    if (key.includes('offer')) return 'badge bg-success-subtle text-success-main';
    if (key.includes('hired')) return 'badge bg-success-subtle text-success-main';
    if (key.includes('reject')) return 'badge bg-danger-subtle text-danger-main';
    return 'badge bg-neutral-200 text-black';
  };

  // Mock candidates data
  const [candidates, setCandidates] = useState([
    // Applied Stage
    {
      id: '1',
      name: 'Priya Singh',
      email: 'priya.singh@email.com',
      role: 'Frontend Engineer',
      stage: 'applied',
      appliedDate: '1 day ago',
      location: 'Pune, India',
      phone: '+91 98765 11111',
      timeline: [
        { stage: 'Applied', date: '2024-01-23', note: 'Fresh application received' }
      ]
    },
    {
      id: '2',
      name: 'Vikram Gupta',
      email: 'vikram.gupta@email.com',
      role: 'Backend Developer',
      stage: 'applied',
      appliedDate: '3 hours ago',
      location: 'Noida, India',
      phone: '+91 98765 22222',
      timeline: [
        { stage: 'Applied', date: '2024-01-23', note: 'Application submitted via LinkedIn' }
      ]
    },
    {
      id: '3',
      name: 'Sneha Reddy',
      email: 'sneha.reddy@email.com',
      role: 'Full Stack Developer',
      stage: 'applied',
      appliedDate: '6 hours ago',
      location: 'Hyderabad, India',
      phone: '+91 98765 33333',
      timeline: [
        { stage: 'Applied', date: '2024-01-23', note: 'Application received from job portal' }
      ]
    },
    
    // Phone Screen Stage
    {
      id: '4',
      name: 'Aisha Sharma',
      email: 'aisha.sharma@email.com',
      role: 'Frontend Engineer',
      stage: 'phone-screen',
      appliedDate: '2 days ago',
      location: 'Mumbai, India',
      phone: '+91 98765 43210',
      timeline: [
        { stage: 'Applied', date: '2024-01-20', note: 'Application submitted' },
        { stage: 'Phone Screen', date: '2024-01-22', note: 'Scheduled for screening call' }
      ]
    },
    
    // Onsite Interview Stage
    {
      id: '5',
      name: 'Meera Patel',
      email: 'meera.patel@email.com',
      role: 'Backend Developer',
      stage: 'onsite-interview',
      appliedDate: '5 days ago',
      location: 'Bangalore, India',
      phone: '+91 87654 32109',
      timeline: [
        { stage: 'Applied', date: '2024-01-17', note: 'Application submitted' },
        { stage: 'Phone Screen', date: '2024-01-19', note: 'Passed screening' },
        { stage: 'Onsite Interview', date: '2024-01-21', note: 'Interview scheduled' }
      ]
    },
    
    // Offer Extended Stage
    {
      id: '6',
      name: 'Arjun Nair',
      email: 'arjun.nair@email.com',
      role: 'Senior Frontend Engineer',
      stage: 'offer-extended',
      appliedDate: '2 weeks ago',
      location: 'Kochi, India',
      phone: '+91 98765 55555',
      timeline: [
        { stage: 'Applied', date: '2024-01-08', note: 'Application submitted' },
        { stage: 'Phone Screen', date: '2024-01-10', note: 'Excellent technical screening' },
        { stage: 'Onsite Interview', date: '2024-01-12', note: 'Outstanding performance' },
        { stage: 'Offer Extended', date: '2024-01-20', note: 'Offer sent - ₹15L CTC package' }
      ]
    },
    {
      id: '7',
      name: 'Kavya Iyer',
      email: 'kavya.iyer@email.com',
      role: 'DevOps Engineer',
      stage: 'offer-extended',
      appliedDate: '10 days ago',
      location: 'Chennai, India',
      phone: '+91 98765 66666',
      timeline: [
        { stage: 'Applied', date: '2024-01-12', note: 'Application submitted' },
        { stage: 'Phone Screen', date: '2024-01-14', note: 'Strong technical knowledge' },
        { stage: 'Onsite Interview', date: '2024-01-16', note: 'Impressive system design skills' },
        { stage: 'Offer Extended', date: '2024-01-21', note: 'Competitive offer extended' }
      ]
    },
    
    // Hired Stage
    {
      id: '8',
      name: 'Rahul Verma',
      email: 'rahul.verma@email.com',
      role: 'Full Stack Developer',
      stage: 'hired',
      appliedDate: '3 weeks ago',
      location: 'Gurgaon, India',
      phone: '+91 98765 77777',
      timeline: [
        { stage: 'Applied', date: '2024-01-05', note: 'Application submitted' },
        { stage: 'Phone Screen', date: '2024-01-07', note: 'Passed technical screening' },
        { stage: 'Onsite Interview', date: '2024-01-09', note: 'Excellent coding and cultural fit' },
        { stage: 'Offer Extended', date: '2024-01-12', note: 'Offer accepted immediately' },
        { stage: 'Hired', date: '2024-01-15', note: 'Onboarding completed - Start date: Feb 1st' }
      ]
    },
    {
      id: '9',
      name: 'Ananya Das',
      email: 'ananya.das@email.com',
      role: 'UI/UX Designer',
      stage: 'hired',
      appliedDate: '1 month ago',
      location: 'Kolkata, India',
      phone: '+91 98765 88888',
      timeline: [
        { stage: 'Applied', date: '2024-01-01', note: 'Portfolio review requested' },
        { stage: 'Phone Screen', date: '2024-01-03', note: 'Design discussion went well' },
        { stage: 'Onsite Interview', date: '2024-01-05', note: 'Portfolio presentation was outstanding' },
        { stage: 'Offer Extended', date: '2024-01-08', note: 'Offer accepted with negotiations' },
        { stage: 'Hired', date: '2024-01-12', note: 'Successfully onboarded - Already contributing!' }
      ]
    },
    
    // Rejected Stage
    {
      id: '10',
      name: 'Ravi Kumar',
      email: 'ravi.kumar@email.com',
      role: 'Full Stack Developer',
      stage: 'rejected',
      appliedDate: '1 week ago',
      location: 'Delhi, India',
      phone: '+91 76543 21098',
      timeline: [
        { stage: 'Applied', date: '2024-01-15', note: 'Application submitted' },
        { stage: 'Phone Screen', date: '2024-01-17', note: 'Did not meet requirements' },
        { stage: 'Rejected', date: '2024-01-17', note: 'Insufficient experience in required tech stack' }
      ]
    }
  ]);

  const [draggedCandidate, setDraggedCandidate] = useState(null);
  const [selectedJob, setSelectedJob] = useState('all');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState('');

  const jobs = ['All Jobs', 'Frontend Engineer', 'Backend Developer', 'Full Stack Developer'];

  // Filter candidates based on search and job selection
  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesJob = selectedJob === 'all' || candidate.role === selectedJob;
    return matchesSearch && matchesJob;
  });

  // Group candidates by stage
  const candidatesByStage = stages.reduce((acc, stage) => {
    acc[stage.id] = filteredCandidates.filter(candidate => candidate.stage === stage.id);
    return acc;
  }, {});

  const handleDragStart = (e, candidate) => {
    setDraggedCandidate(candidate);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetStage) => {
    e.preventDefault();
    
    if (draggedCandidate && draggedCandidate.stage !== targetStage) {
      // Update candidate stage
      setCandidates(prev => prev.map(candidate => 
        candidate.id === draggedCandidate.id 
          ? { 
              ...candidate, 
              stage: targetStage,
              timeline: [...candidate.timeline, {
                stage: stages.find(s => s.id === targetStage)?.name || targetStage,
                date: new Date().toISOString().split('T')[0],
                note: `Moved to ${stages.find(s => s.id === targetStage)?.name || targetStage}`
              }]
            }
          : candidate
      ));
      
      // Show toast notification
      const stageName = stages.find(s => s.id === targetStage)?.name || targetStage;
      setToast(`${draggedCandidate.name} moved to ${stageName}`);
      setTimeout(() => setToast(''), 3000);
    }
    
    setDraggedCandidate(null);
  };

  const CandidateCard = ({ candidate }) => {
    const handleViewClick = (e) => {
      e.stopPropagation(); // Prevent card drag when clicking view button
      setSelectedCandidate(candidate);
    };

    return (
      <div
        draggable
        onDragStart={(e) => handleDragStart(e, candidate)}
        className="card border shadow-none cursor-move"
        style={{ width: '18rem' }}
      >
        <div className="card-body p-16">
          <div className="d-flex align-items-start justify-content-between mb-2">
            <div className="d-flex align-items-center gap-2">
              <span className="w-40-px h-40-px bg-primary-600 text-white rounded-circle d-flex justify-content-center align-items-center">
                <User size={18} />
              </span>
              <div>
                <h6 className="mb-2">{candidate.name}</h6>
                <div className="text-secondary-light text-sm">{candidate.role}</div>
              </div>
            </div>
            <MoreVertical size={16} className="text-secondary-light" />
          </div>
          <div className="d-flex align-items-center text-secondary-light text-sm mb-2">
            <Calendar size={14} className="me-2" />
            <span>Applied {candidate.appliedDate}</span>
          </div>
          <div className="d-flex align-items-center justify-content-between">
            <span className={getStageBadgeClass(candidate.stage)}>
              Current: {stages.find(s => s.id === candidate.stage)?.name}
            </span>
            <button onClick={handleViewClick} className="btn btn-link p-0 text-primary-600">
              View →
            </button>
          </div>
        </div>
      </div>
    );
  };

  const StageRow = ({ stage, candidates: stageCandidates }) => (
    <div className="card border shadow-none">
      <div className="card-body p-24">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div className="d-flex align-items-center gap-2">
            <h6 className="mb-0">{stage.name}</h6>
            <span className="badge bg-neutral-200 text-black">{stageCandidates.length} candidates</span>
          </div>
          <span className={getStageBadgeClass(stage.id)}>{stage.name}</span>
        </div>
        <div onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, stage.id)} style={{ minHeight: '128px' }}>
          {stageCandidates.length > 0 ? (
            <div className="d-flex flex-wrap gap-2">
              {stageCandidates.map(candidate => (
                <CandidateCard key={candidate.id} candidate={candidate} />
              ))}
            </div>
          ) : (
            <div className="d-flex align-items-center justify-content-center p-24 border rounded">
              <div className="text-center">
                <User size={24} className="mb-2 text-secondary-light" />
                <div className="text-sm">No candidates in this stage yet</div>
                <div className="text-xs text-secondary-light mt-1">Drag candidates here to move them to {stage.name}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const CandidateModal = ({ candidate, onClose }) => (
    <>
      <div className="modal d-block" tabIndex="-1" role="dialog">
        <div className="modal-dialog modal-lg" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <div className="d-flex align-items-center gap-3">
                <span className="w-56-px h-56-px bg-primary-600 text-white rounded-circle d-flex justify-content-center align-items-center">
                  <User size={24} />
                </span>
                <div>
                  <h6 className="mb-2">{candidate.name}</h6>
                  <div className="text-secondary-light">{candidate.role}</div>
                  <span className={getStageBadgeClass(candidate.stage)}>{stages.find(s => s.id === candidate.stage)?.name}</span>
                </div>
              </div>
              <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
            </div>
            <div className="modal-body">
              <div className="row g-3 mb-3">
                <div className="col-md-6 d-grid gap-2">
                  <div className="d-flex align-items-center gap-2 text-secondary-light">
                    <Mail size={18} />
                    <span>{candidate.email}</span>
                  </div>
                  <div className="d-flex align-items-center gap-2 text-secondary-light">
                    <Phone size={18} />
                    <span>{candidate.phone}</span>
                  </div>
                  <div className="d-flex align-items-center gap-2 text-secondary-light">
                    <MapPin size={18} />
                    <span>{candidate.location}</span>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <FileText size={18} />
                    <button className="btn btn-link p-0">View Resume</button>
                  </div>
                </div>
                <div className="col-md-6">
                  <h6 className="mb-2">Quick Actions</h6>
                  <div className="d-grid gap-2">
                    <button
                      onClick={() => { setToast(`${candidate.name} has been shortlisted!`); setTimeout(() => setToast(''), 3000); }}
                      className="btn btn-success"
                    >Shortlist Candidate</button>
                    <button
                      onClick={() => { setToast(`Interview scheduled for ${candidate.name}`); setTimeout(() => setToast(''), 3000); }}
                      className="btn btn-primary"
                    >Schedule Interview</button>
                    <button
                      onClick={() => {
                        setCandidates(prev => prev.map(c => c.id === candidate.id ? { ...c, stage: 'rejected', timeline: [...c.timeline, { stage: 'Rejected', date: new Date().toISOString().split('T')[0], note: 'Candidate rejected from quick actions' }] } : c));
                        setToast(`${candidate.name} moved to Rejected`);
                        setTimeout(() => setToast(''), 3000);
                        setSelectedCandidate(null);
                      }}
                      className="btn btn-danger"
                    >Reject Candidate</button>
                  </div>
                </div>
              </div>
              <div>
                <h6 className="mb-2">Timeline</h6>
                <div className="d-grid gap-2">
                  {candidate.timeline.map((item, index) => (
                    <div key={index} className="d-flex align-items-start gap-2 pb-2 border-bottom">
                      <span className="w-8-px h-8-px rounded-circle bg-primary-600 mt-1"></span>
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center justify-content-between">
                          <span className="fw-medium">{item.stage}</span>
                          <span className="text-sm text-secondary-light">{item.date}</span>
                        </div>
                        <div className="text-secondary-light text-sm mt-1">{item.note}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show"></div>
    </>
  );

  return (
    <div className="container-fluid py-4">
      <div className="mb-12">
        <h4 className="mb-2">Pipeline (Drag & Drop)</h4>
        <p className="text-secondary-light mb-0">Manage candidate progress by moving them across stages</p>
      </div>

      <div className="card border shadow-none mb-24">
        <div className="card-body p-16">
          <div className="row g-2 align-items-center">
            <div className="col-12 col-md-6">
              <div className="input-group">
                <span className="input-group-text"><Search size={16} /></span>
                <input type="text" placeholder="Search candidates or roles..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="form-control" />
              </div>
            </div>
            <div className="col-12 col-md-3">
              <select value={selectedJob} onChange={(e) => setSelectedJob(e.target.value)} className="form-select">
                <option value="all">All Jobs</option>
                {jobs.slice(1).map(job => (
                  <option key={job} value={job}>{job}</option>
                ))}
              </select>
            </div>
            <div className="col-12 col-md-3 d-flex justify-content-md-end">
              <button className="btn btn-outline-secondary d-inline-flex align-items-center gap-2">
                <Filter size={16} />
                <span>More Filters</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="d-grid gap-3">
        {stages.map(stage => (
          <StageRow key={stage.id} stage={stage} candidates={candidatesByStage[stage.id] || []} />
        ))}
      </div>

      {toast && (
        <div className="position-fixed bottom-0 end-0 m-3 alert alert-success shadow" role="alert" style={{ zIndex: 1060 }}>
          {toast}
        </div>
      )}

      {selectedCandidate && (
        <CandidateModal candidate={selectedCandidate} onClose={() => setSelectedCandidate(null)} />
      )}
    </div>
  );
};

export default PipelineDragDrop;