import React, { useState, useEffect } from 'react';
import { MessageCircle, User, Clock, Paperclip, Bell, UserCheck, Eye, EyeOff, ArrowRight, X, Plus, Send, AtSign } from 'lucide-react';

const CollaborationTools = () => {
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [noteType, setNoteType] = useState('shared');
  const [showAddModal, setShowAddModal] = useState(false);
  const [addModalStage, setAddModalStage] = useState('');
  const [newCandidateForm, setNewCandidateForm] = useState({
    name: '',
    position: '',
    assignedTo: 'Nagendra Uggirala'
  });
  const [candidates, setCandidates] = useState({
    'Applied': [
      { id: 1, name: 'Raj Kumar', position: 'Backend Engineer', avatar: 'RK', assignedTo: 'Nagendra Uggirala', comments: 2, lastActivity: '2 hours ago' },
      { id: 2, name: 'Meera Singh', position: 'Data Scientist', avatar: 'MS', assignedTo: 'Aisha Sharma', comments: 0, lastActivity: '1 day ago' }
    ],
    'Phone Screen': [
      { id: 3, name: 'Aisha Sharma', position: 'Frontend Engineer', avatar: 'AS', assignedTo: 'Nagendra Uggirala', comments: 3, lastActivity: '30 minutes ago' },
      { id: 4, name: 'Karthik Reddy', position: 'DevOps Engineer', avatar: 'KR', assignedTo: 'Priya Nair', comments: 1, lastActivity: '3 hours ago' }
    ],
    'Technical Interview': [
      { id: 5, name: 'Priya Nair', position: 'Full Stack Developer', avatar: 'PN', assignedTo: 'Kavya Iyer', comments: 5, lastActivity: '1 hour ago' }
    ],
    'Final Interview': [
      { id: 6, name: 'Arjun Patel', position: 'Product Manager', avatar: 'AP', assignedTo: 'Nagendra Uggirala', comments: 2, lastActivity: '4 hours ago' }
    ],
    'Offer': [
      { id: 7, name: 'Kavya Iyer', position: 'UX Designer', avatar: 'KI', assignedTo: 'Aisha Sharma', comments: 1, lastActivity: '6 hours ago' }
    ],
    'Hired': [
      { id: 8, name: 'Nagendra Uggirala', position: 'Senior Developer', avatar: 'NU', assignedTo: 'Priya Nair', comments: 0, lastActivity: '2 days ago' }
    ]
  });

  // Sample data
  const stages = ['Applied', 'Phone Screen', 'Technical Interview', 'Final Interview', 'Offer', 'Hired'];
  

  const teamMembers = ['Nagendra Uggirala', 'Aisha Sharma', 'Priya Nair', 'Kavya Iyer', 'Arjun Patel'];

  const mockComments = [
    { id: 1, author: 'Arjun Patel', text: 'Strong coding test results. Recommend moving to interview.', time: '2 hours ago', avatar: 'AP' },
    { id: 2, author: 'Nagendra Uggirala', text: '@Priya please schedule technical interview for this candidate.', time: '1 hour ago', avatar: 'NU' },
    { id: 3, author: 'Priya Nair', text: 'Scheduled for tomorrow 2 PM. Candidate confirmed availability.', time: '30 minutes ago', avatar: 'PN' }
  ];

  const mockTimeline = [
    { id: 1, action: 'Applied for position', author: 'System', time: 'Sept 10, 2024' },
    { id: 2, action: 'Moved to Phone Screen', author: 'Kavya Iyer', time: 'Sept 12, 2024' },
    { id: 3, action: 'Assigned to Nagendra Uggirala', author: 'Priya Nair', time: 'Sept 13, 2024' },
    { id: 4, action: 'Comment added', author: 'Arjun Patel', time: '2 hours ago' }
  ];

  const notifications = [
    { id: 1, text: 'Aisha Sharma moved to Phone Screen', time: '30 minutes ago' },
    { id: 2, text: 'New comment on Priya Nair', time: '1 hour ago' },
    { id: 3, text: 'Karthik Reddy assigned to you', time: '2 hours ago' }
  ];

  const handleAddComment = () => {
    if (newComment.trim()) {
      // In a real app, this would send to backend
      console.log('Adding comment:', newComment);
      setNewComment('');
    }
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      console.log('Adding note:', newNote, 'Type:', noteType);
      setNewNote('');
    }
  };

  const handleAddCandidate = (stage) => {
    setAddModalStage(stage);
    setShowAddModal(true);
  };

  const handleCreateCandidate = () => {
    if (newCandidateForm.name.trim() && newCandidateForm.position.trim()) {
      const newId = Math.max(...Object.values(candidates).flat().map(c => c.id)) + 1;
      const avatar = newCandidateForm.name.split(' ').map(n => n[0]).join('').toUpperCase();
      
      const newCandidate = {
        id: newId,
        name: newCandidateForm.name,
        position: newCandidateForm.position,
        avatar: avatar,
        assignedTo: newCandidateForm.assignedTo,
        comments: 0,
        lastActivity: 'Just now'
      };
      
      setCandidates(prev => ({
        ...prev,
        [addModalStage]: [...(prev[addModalStage] || []), newCandidate]
      }));
      
      // Reset form and close modal
      setNewCandidateForm({
        name: '',
        position: '',
        assignedTo: 'Nagendra Uggirala'
      });
      setShowAddModal(false);
    }
  };

  const handleCancelAdd = () => {
    setNewCandidateForm({
      name: '',
      position: '',
      assignedTo: 'Nagendra Uggirala'
    });
    setShowAddModal(false);
  };

  const handleAssignmentChange = (candidateId, newAssignee) => {
    setCandidates(prev => {
      const newCandidates = { ...prev };
      
      // Find and update the candidate in the appropriate stage
      Object.keys(newCandidates).forEach(stage => {
        newCandidates[stage] = newCandidates[stage].map(candidate => 
          candidate.id === candidateId 
            ? { ...candidate, assignedTo: newAssignee }
            : candidate
        );
      });
      
      return newCandidates;
    });
    
    // Update the selected candidate as well
    setSelectedCandidate(prev => ({
      ...prev,
      assignedTo: newAssignee
    }));
  };

  const CandidateCard = ({ candidate, stage }) => (
    <div className="card border shadow-none mb-3 cursor-pointer" onClick={() => setSelectedCandidate({ ...candidate, stage })}>
      <div className="card-body p-16">
        <div className="d-flex align-items-start justify-content-between mb-2">
          <div className="d-flex align-items-center gap-2">
            <span className="w-32-px h-32-px bg-primary-600 text-white rounded-circle d-flex justify-content-center align-items-center text-sm fw-semibold">
              {candidate.avatar}
            </span>
            <div>
              <h6 className="mb-2">{candidate.name}</h6>
              <div className="text-secondary-light text-sm">{candidate.position}</div>
            </div>
          </div>
          {candidate.comments > 0 && (
            <div className="d-inline-flex align-items-center gap-1 text-primary-600">
              <MessageCircle size={14} />
              <span className="text-sm">{candidate.comments}</span>
            </div>
          )}
        </div>
        <div className="d-flex align-items-center justify-content-between text-secondary-light text-sm">
          <div className="d-inline-flex align-items-center gap-1">
            <User size={12} />
            <span>{candidate.assignedTo}</span>
          </div>
          <div className="d-inline-flex align-items-center gap-1">
            <Clock size={12} />
            <span>{candidate.lastActivity}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const CollaborationSidebar = () => (
    <div className="card border shadow-none h-100">
      <div className="card-header d-flex align-items-center justify-content-between">
        <h6 className="mb-0">Candidate Details</h6>
        <button onClick={() => setSelectedCandidate(null)} className="btn btn-sm btn-outline-secondary">
          <X size={16} />
        </button>
      </div>
      <div className="card-body p-16 d-flex flex-column">
        <div className="d-flex align-items-center gap-2 mb-3">
          <span className="w-44-px h-44-px bg-primary-600 text-white rounded-circle d-flex justify-content-center align-items-center fw-semibold">
            {selectedCandidate.avatar}
          </span>
          <div>
            <h6 className="mb-2">{selectedCandidate.name}</h6>
            <div className="text-secondary-light text-sm">{selectedCandidate.position}</div>
            <div className="text-primary-600 text-sm">{selectedCandidate.stage}</div>
          </div>
        </div>
        <div className="mb-3">
          <label className="form-label">Assigned To</label>
          <select className="form-select" value={selectedCandidate.assignedTo} onChange={(e) => handleAssignmentChange(selectedCandidate.id, e.target.value)}>
            {teamMembers.map(member => (
              <option key={member} value={member}>{member}</option>
            ))}
          </select>
        </div>
        <div className="d-flex gap-2 mb-3">
          <button className="btn btn-success btn-sm flex-fill">Move Forward</button>
          <button className="btn btn-danger btn-sm flex-fill">Reject</button>
          <button className="btn btn-warning btn-sm text-white flex-fill">Needs Review</button>
        </div>

        <div className="border-top pt-3">
          <div className="d-flex">
            <button className="btn btn-link text-primary-600 px-0 me-3">Discussion</button>
            <button className="btn btn-link px-0 me-3">Timeline</button>
            <button className="btn btn-link px-0">Notes</button>
          </div>
        </div>

        <div className="flex-grow-1 overflow-auto">
          <div className="d-grid gap-2">
            {mockComments.map(comment => (
              <div key={comment.id} className="d-flex gap-2">
                <span className="w-32-px h-32-px bg-neutral-300 text-black rounded-circle d-flex justify-content-center align-items-center text-sm fw-semibold">
                  {comment.avatar}
                </span>
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <span className="fw-medium text-sm">{comment.author}</span>
                    <span className="text-xs text-secondary-light">{comment.time}</span>
                  </div>
                  <div className="text-sm">{comment.text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-top pt-3">
          <div className="d-flex gap-2">
            <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Add a comment... Use @name to mention" className="form-control" onKeyPress={(e) => e.key === 'Enter' && handleAddComment()} />
            <button onClick={handleAddComment} className="btn btn-primary">
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container-fluid py-4">
      <div className="mb-12 d-flex align-items-center justify-content-between">
        <div>
          <h4 className="mb-2">Pipeline Collaboration</h4>
          <p className="text-secondary-light mb-0">Collaborate with your team on candidate progress.</p>
        </div>
        <div className="d-flex align-items-center gap-3 position-relative">
          <div className="position-relative">
            <button onClick={() => setShowNotifications(!showNotifications)} className="btn btn-outline-secondary position-relative">
              <Bell size={16} />
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">3</span>
            </button>
            {showNotifications && (
              <div className="position-absolute end-0 mt-2" style={{ width: '320px', zIndex: 1050 }}>
                <div className="card border shadow-sm">
                  <div className="card-header">
                    <h6 className="mb-0">Notifications</h6>
                  </div>
                  <div className="card-body p-0" style={{ maxHeight: '260px', overflowY: 'auto' }}>
                    {notifications.map(notification => (
                      <div key={notification.id} className="px-16 py-12 border-bottom">
                        <div className="text-sm">{notification.text}</div>
                        <div className="text-xs text-secondary-light mt-1">{notification.time}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="d-flex align-items-center gap-2">
            <div className="d-flex" style={{ marginRight: '-8px' }}>
              {teamMembers.slice(0, 4).map((member) => (
                <span key={member} className="w-32-px h-32-px bg-primary-600 text-white rounded-circle d-flex justify-content-center align-items-center text-xs fw-semibold border border-2 border-white" style={{ marginRight: '-8px' }}>
                  {member.split(' ').map(n => n[0]).join('')}
                </span>
              ))}
            </div>
            <span className="text-sm text-secondary-light">+{teamMembers.length - 4} more</span>
          </div>
        </div>
      </div>

      <div className="row g-3">
        <div className={selectedCandidate ? 'col-lg-8' : 'col-12'}>
          <div className="row g-3">
            {stages.map(stage => (
              <div key={stage} className="col-12 col-md-6 col-xl-4">
                <div className="card border shadow-none h-100">
                  <div className="card-body p-16">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <h6 className="mb-0">{stage}</h6>
                      <span className="badge bg-neutral-200 text-black">{candidates[stage]?.length || 0}</span>
                    </div>
                    <div>
                      {candidates[stage]?.map(candidate => (
                        <CandidateCard key={candidate.id} candidate={candidate} stage={stage} />
                      ))}
                    </div>
                    <button onClick={() => handleAddCandidate(stage)} className="btn btn-outline-secondary w-100 d-inline-flex align-items-center justify-content-center gap-2 mt-2">
                      <Plus size={14} />
                      <span className="text-sm">Add Candidate</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedCandidate && (
          <div className="col-lg-4">
            <CollaborationSidebar />
          </div>
        )}
      </div>

      {showAddModal && (
        <>
          <div className="modal d-block" tabIndex="-1" role="dialog">
            <div className="modal-dialog" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h6 className="modal-title mb-0">Add New Candidate</h6>
                  <button type="button" className="btn-close" aria-label="Close" onClick={handleCancelAdd}></button>
                </div>
                <div className="modal-body">
                  <div className="d-grid gap-2">
                    <div>
                      <label className="form-label">Candidate Name *</label>
                      <input type="text" value={newCandidateForm.name} onChange={(e) => setNewCandidateForm(prev => ({ ...prev, name: e.target.value }))} placeholder="Enter candidate name" className="form-control" />
                    </div>
                    <div>
                      <label className="form-label">Position *</label>
                      <input type="text" value={newCandidateForm.position} onChange={(e) => setNewCandidateForm(prev => ({ ...prev, position: e.target.value }))} placeholder="Enter position title" className="form-control" />
                    </div>
                    <div>
                      <label className="form-label">Assign To</label>
                      <select value={newCandidateForm.assignedTo} onChange={(e) => setNewCandidateForm(prev => ({ ...prev, assignedTo: e.target.value }))} className="form-select">
                        {teamMembers.map(member => (
                          <option key={member} value={member}>{member}</option>
                        ))}
                      </select>
                    </div>
                    <div className="text-secondary-light bg-neutral-100 p-2 rounded">
                      <strong>Adding to:</strong> {addModalStage}
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button onClick={handleCancelAdd} className="btn btn-outline-secondary">Cancel</button>
                  <button onClick={handleCreateCandidate} disabled={!newCandidateForm.name.trim() || !newCandidateForm.position.trim()} className="btn btn-primary">Add Candidate</button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}
    </div>
  );
};

export default CollaborationTools;