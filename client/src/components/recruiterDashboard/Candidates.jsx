import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Download, X, ChevronLeft, ChevronRight, UserPlus, ArrowRight, Eye, Copy, Trash2, Printer, RefreshCw, AlertCircle, Upload, CheckCircle, XCircle, FileText } from 'lucide-react';
import CandidateProfilePage from './CandidateProfilePage';
import { BASE_URL } from '../../config/api.config';

const CandidatesPage = () => {
  const navigate = useNavigate();
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    skills: '',
    job: '',
    stage: '',
    recruiter: ''
  });
  const [showCandidateModal, setShowCandidateModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  // Backend integration
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // AI Screening state
  const [aiScreening, setAiScreening] = useState({
    isProcessing: false,
    currentIndex: 0,
    total: 0,
    results: [],
    showModal: false
  });

  // Track which candidates have been AI screened (for backward compatibility)
  const [aiScreenedEmails, setAiScreenedEmails] = useState(new Set());

  // Fetch candidates from backend
  const fetchCandidates = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      setError('Please login to view candidates');
      setLoading(false);
      return;
    }

    try {
      setRefreshing(true);
      const url = `${BASE_URL}/api/recruiter_dashboard/candidates`;
      
      console.log('📥 Fetching candidates from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Candidates fetched:', data);
        
        // Transform backend data to match display format
        const transformedCandidates = data.map(candidate => ({
          id: candidate.id,
          name: candidate.name,
          email: candidate.email,
          role: candidate.role,
          skills: candidate.skills ? candidate.skills.split(',').map(s => s.trim()) : [],
          stage: candidate.stage || 'Applied',
          status: candidate.stage === 'Hired' ? 'Completed' : 
                  candidate.stage === 'Interview' ? 'In Progress' : 
                  candidate.stage === 'Offer' ? 'Awaiting Decision' : 'Pending',
          resume_url: candidate.resume_url,
          notes: candidate.notes,
          recruiter_comments: candidate.recruiter_comments,
          resume_screened: candidate.resume_screened || 'no', // Get from backend API response
          fullData: candidate
        }));
        
        setCandidates(transformedCandidates);
        setError(null);
      } else if (response.status === 401) {
        setError('Session expired. Please login again.');
        setTimeout(() => navigate('/login'), 2000);
      } else if (response.status === 403) {
        setError('You do not have permission to view candidates.');
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.detail || 'Failed to fetch candidates');
      }
    } catch (err) {
      console.error('❌ Error fetching candidates:', err);
      setError('Network error. Please check if backend is running.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchAIScreenedCandidates = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/resume/candidates`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const screenedSet = new Set(
          data
            .filter(c => c.resume_screened === "yes" || c.resume_screened === "Yes")
            .map(c => c.candidate_email?.toLowerCase().trim())
            .filter(Boolean)
        );
        setAiScreenedEmails(screenedSet);
      }
    } catch (error) {
      console.error('Error fetching AI screened candidates:', error);
    }
  };

  // Update aiScreenedEmails set from candidates data (for backward compatibility)
  useEffect(() => {
    if (candidates.length > 0) {
      const screenedEmails = new Set(
        candidates
          .filter(c => c.resume_screened === "yes" || c.resume_screened === "Yes")
          .map(c => c.email?.toLowerCase().trim())
          .filter(email => email)
      );
      console.log('🔍 AI-Screened emails from candidates:', Array.from(screenedEmails));
      setAiScreenedEmails(screenedEmails);
    }
  }, [candidates]);

  // Fetch candidates and AI-screened list when component mounts
  useEffect(() => {
    fetchCandidates();
    fetchAIScreenedCandidates();
  }, []);

  const insights = {
    total: candidates.length,
    inInterview: candidates.filter(c => c.stage === 'Interview').length,
    offersSent: candidates.filter(c => c.stage === 'Offer').length,
    hired: candidates.filter(c => c.stage === 'Hired').length
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedCandidates(candidates.map(c => c.id));
    } else {
      setSelectedCandidates([]);
    }
  };

  const handleSelectCandidate = (id) => {
    setSelectedCandidates(prev => 
      prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]
    );
  };

  const getStageColor = (stage) => {
    const colors = {
      'Applied': 'bg-primary-subtle text-primary',
      'Screening': 'bg-info-subtle text-info',
      'Interview': 'bg-warning-subtle text-warning',
      'Offer': 'bg-success-subtle text-success',
      'Hired': 'bg-success-subtle text-success'
    };
    return colors[stage] || 'bg-secondary-subtle text-secondary';
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'text-secondary',
      'In Progress': 'text-primary',
      'Completed': 'text-success',
      'Awaiting Decision': 'text-warning'
    };
    return colors[status] || 'text-secondary';
  };

  // Filter candidates based on search and filters
  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesSkills = !filters.skills || candidate.skills.some(skill => 
      skill.toLowerCase().includes(filters.skills.toLowerCase())
    );
    
    const matchesJob = !filters.job || candidate.role.toLowerCase().includes(filters.job.toLowerCase());
    
    const matchesStage = !filters.stage || candidate.stage.toLowerCase() === filters.stage.toLowerCase();
    
    const matchesRecruiter = !filters.recruiter || filters.recruiter === 'AI'; // All candidates are managed by AI
    
    return matchesSearch && matchesSkills && matchesJob && matchesStage && matchesRecruiter;
  });

  const totalPages = Math.ceil(filteredCandidates.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCandidates = filteredCandidates.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters]);

  const handleExport = () => {
    const csv = [
      ['Candidate Name', 'Job Role', 'Skills', 'Stage', 'Status'],
      ...filteredCandidates.map(candidate => [
        candidate.name,
        candidate.role,
        candidate.skills.join(', '),
        candidate.stage,
        candidate.status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'candidates-list.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleViewCandidate = (candidateId) => {
    const candidate = candidates.find(c => c.id === candidateId);
    if (candidate) {
      setSelectedCandidate(candidate);
      setShowCandidateModal(true);
    }
  };

  const handleCloseCandidateModal = () => {
    setShowCandidateModal(false);
    setSelectedCandidate(null);
  };

  // AI Resume Screening for bulk candidates
  const handleAIScreening = async () => {
    const selectedCandidateData = candidates.filter(c => selectedCandidates.includes(c.id));
    
    console.log('📋 Selected Candidates:', selectedCandidateData);
    console.log('📋 Resume URLs:', selectedCandidateData.map(c => ({ name: c.name, resume_url: c.resume_url })));
    
    // Filter candidates that have resume URLs (check for truthy and non-empty strings)
    const candidatesWithResumes = selectedCandidateData.filter(c => 
      c.resume_url && c.resume_url.trim() !== '' && c.resume_url !== 'null' && c.resume_url !== 'undefined'
    );
    
    console.log('📋 Candidates with resumes:', candidatesWithResumes.length);
    
    if (candidatesWithResumes.length === 0) {
      const candidateNames = selectedCandidateData.map(c => c.name).join(', ');
      alert(`⚠️ No resumes found for selected candidates.\n\nSelected: ${candidateNames}\n\nPlease ensure candidates have uploaded resumes. Check the 'resume_url' field in the database.`);
      return;
    }

    // Check which candidates have already been screened
    try {
      const token = localStorage.getItem('token');
      const aiScreenedResponse = await fetch(`${BASE_URL}/api/resume/candidates`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const aiScreenedCandidates = aiScreenedResponse.ok ? await aiScreenedResponse.json() : [];
      
      // Create a set of already screened emails for quick lookup (using resume_screened field)
      const screenedEmails = new Set(
        aiScreenedCandidates
          .filter(c => c.resume_screened === "yes" || c.resume_screened === "Yes")
          .map(c => c.candidate_email?.toLowerCase().trim())
          .filter(email => email)
      );
      
      // Filter out already screened candidates (trim and lowercase for robust matching)
      const notYetScreened = candidatesWithResumes.filter(c => 
        !screenedEmails.has(c.email?.toLowerCase().trim())
      );
      
      const alreadyScreened = candidatesWithResumes.filter(c => 
        screenedEmails.has(c.email?.toLowerCase().trim())
      );
      
      console.log('📋 Already screened:', alreadyScreened.length);
      console.log('📋 Not yet screened:', notYetScreened.length);
      
      if (alreadyScreened.length > 0 && notYetScreened.length === 0) {
        alert(`⚠️ All selected candidates have already been screened with AI.\n\nAlready screened:\n${alreadyScreened.map(c => '• ' + c.name).join('\n')}\n\nThey cannot be screened again. Please select different candidates.`);
        return;
      }
      
      if (alreadyScreened.length > 0) {
        const proceed = window.confirm(
          `⚠️ ${alreadyScreened.length} candidate(s) have already been screened and will be skipped:\n${alreadyScreened.map(c => '• ' + c.name).join('\n')}\n\n✅ ${notYetScreened.length} new candidate(s) will be screened:\n${notYetScreened.map(c => '• ' + c.name).join('\n')}\n\nDo you want to proceed with screening the new candidates only?`
        );
        if (!proceed) return;
      }
      
      // Update candidatesWithResumes to only include not yet screened
      if (notYetScreened.length === 0) {
        alert('⚠️ No new candidates to screen. All selected candidates have already been screened.');
        return;
      }
      
      // Continue with notYetScreened candidates
      candidatesWithResumes.length = 0;
      candidatesWithResumes.push(...notYetScreened);
      
    } catch (error) {
      console.error('Error checking already screened candidates:', error);
      // Continue anyway if check fails
    }

    if (candidatesWithResumes.length < selectedCandidateData.length) {
      const withoutResumes = selectedCandidateData.filter(c => !c.resume_url || c.resume_url.trim() === '');
      if (withoutResumes.length > 0) {
        const proceed = window.confirm(
          `Only ${candidatesWithResumes.length} of ${selectedCandidateData.length} selected candidates can be screened.\n\nCandidates without resumes:\n${withoutResumes.map(c => '• ' + c.name).join('\n')}\n\nDo you want to proceed with AI screening for those with resumes?`
        );
        if (!proceed) return;
      }
    }

    // Initialize AI screening state
    setAiScreening({
      isProcessing: true,
      currentIndex: 0,
      total: candidatesWithResumes.length,
      results: [],
      showModal: true
    });

    // Process each resume one by one
    const results = [];
    for (let i = 0; i < candidatesWithResumes.length; i++) {
      const candidate = candidatesWithResumes[i];
      
      setAiScreening(prev => ({
        ...prev,
        currentIndex: i + 1
      }));

      try {
        // Fetch the resume file from the server
        const resumeResponse = await fetch(`${BASE_URL}/${candidate.resume_url}`);
        
        if (!resumeResponse.ok) {
          results.push({
            candidate: candidate.name,
            status: 'error',
            message: 'Resume file not found'
          });
          continue;
        }

        const resumeBlob = await resumeResponse.blob();
        const fileName = candidate.resume_url.split('/').pop();
        
        // Create FormData for AI screening
        const formData = new FormData();
        formData.append('file', resumeBlob, fileName);
        formData.append('role', candidate.role);
        formData.append('experience_level', 'mid'); // Default, can be enhanced

        // Send to AI screening endpoint
        const screeningResponse = await fetch(`${BASE_URL}/api/resume/process`, {
          method: 'POST',
          body: formData
        });

        if (screeningResponse.ok) {
          const result = await screeningResponse.json();
          results.push({
            candidate: candidate.name,
            status: result.status,
            score: result.score,
            email_status: result.email_status,
            message: `Score: ${result.score.toFixed(1)}% - ${result.status}`
          });
        } else {
          const errorData = await screeningResponse.json();
          results.push({
            candidate: candidate.name,
            status: 'error',
            message: errorData.detail || 'Processing failed'
          });
        }
      } catch (error) {
        console.error(`Error processing ${candidate.name}:`, error);
        results.push({
          candidate: candidate.name,
          status: 'error',
          message: 'Network error'
        });
      }

      // Small delay between requests to avoid overwhelming the server
      if (i < candidatesWithResumes.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Update final state
    setAiScreening(prev => ({
      ...prev,
      isProcessing: false,
      results: results
    }));

    // Clear selection after processing
    setSelectedCandidates([]);
    
    // Refresh the AI screened candidates list
    fetchAIScreenedCandidates();
  };

  const closeAIScreeningModal = () => {
    setAiScreening({
      isProcessing: false,
      currentIndex: 0,
      total: 0,
      results: [],
      showModal: false
    });
  };

  const viewAIScreeningResults = () => {
    closeAIScreeningModal();
    navigate('/resume-screening', { state: { tab: 'candidates' } });
  };

  return (
    <div className="container-fluid py-4">
      {/* Page Header */}
      <div className="mb-4 d-flex justify-content-between align-items-center">
        <div>
          <h4 className="mb-2">Candidates</h4>
          <p className="text-secondary-light mb-0">View, filter, and manage all job applicants.</p>
        </div>
        <div className="d-flex flex-wrap align-items-center gap-2">
          <button 
            className="btn btn-primary d-inline-flex align-items-center gap-2"
            onClick={async () => {
              setRefreshing(true);
              await fetchCandidates();
              await fetchAIScreenedCandidates();
              setRefreshing(false);
            }}
            disabled={refreshing}
          >
            <RefreshCw size={16} className={refreshing ? 'spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button 
            className="btn btn-success d-inline-flex align-items-center gap-2"
            onClick={async () => {
              try {
                const response = await fetch(`${BASE_URL}/api/resume/sync-stages`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                  }
                });
                if (response.ok) {
                  const result = await response.json();
                  alert(`✅ Stages synced successfully!\n\nUpdated ${result.records_updated} candidate_records\nUpdated ${result.candidates_updated} candidate records`);
                  await fetchCandidates();
                  await fetchAIScreenedCandidates();
                } else {
                  alert('⚠️ Failed to sync stages. Please check backend logs.');
                }
              } catch (error) {
                console.error('Error syncing stages:', error);
                alert('⚠️ Error syncing stages. Please check console.');
              }
            }}
            title="Sync candidate stages based on scores"
          >
            <RefreshCw size={16} />
            Sync Stages
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-danger d-flex align-items-center mb-4" role="alert">
          <AlertCircle size={20} className="me-2" />
          <div>{error}</div>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-secondary-light">Loading candidates...</p>
        </div>
      ) : candidates.length === 0 && !error ? (
        <div className="card border shadow-none">
          <div className="card-body text-center py-5">
            <h5 className="mb-2">No Candidates Yet</h5>
            <p className="text-secondary-light mb-3">
              No candidates have applied to your jobs yet. Make sure your jobs are published!
            </p>
            <button 
              className="btn btn-primary d-inline-flex align-items-center gap-2"
              onClick={() => navigate('/jobslist')}
            >
              View Jobs
            </button>
          </div>
        </div>
      ) : null}

      {/* Candidates Content - Only show if not loading and has candidates */}
      {!loading && candidates.length > 0 && (
        <>

      {/* KPI Summary */}
      <div className="card border shadow-none mb-4">
        <div className="card-body d-flex">
          <div className="text-center w-25">
            <div className="text-secondary-light small">Total Candidates</div>
            <div className="h4 mb-0">{insights.total}</div>
          </div>
          <div className="text-center w-25 border-start ps-4">
            <div className="text-secondary-light small">In Interview</div>
            <div className="h4 mb-0 text-primary">{insights.inInterview}</div>
          </div>
          <div className="text-center w-25 border-start ps-4">
            <div className="text-secondary-light small">Offers Sent</div>
            <div className="h4 mb-0 text-success">{insights.offersSent}</div>
          </div>
          <div className="text-center w-25 border-start ps-4">
            <div className="text-secondary-light small">Hired</div>
            <div className="h4 mb-0 text-danger">{insights.hired}</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card border shadow-none mb-4">
        <div className="card-body d-flex gap-3 align-items-center">
          <div className="flex-grow-1">
            <div className="input-group" style={{maxWidth: '400px'}}>
              <span className="input-group-text bg-white border-end-0" style={{
                borderTopLeftRadius: '0.375rem', 
                borderBottomLeftRadius: '0.375rem',
                borderRight: 'none'
              }}>
                <Search size={16} className="text-muted" />
              </span>
              <input 
                className="form-control border-start-0" 
                placeholder="Search candid" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  borderTopRightRadius: '0.375rem', 
                  borderBottomRightRadius: '0.375rem',
                  borderLeft: 'none',
                  fontSize: '14px',
                  padding: '8px 12px'
                }}
              />
            </div>
          </div>

          <select 
            className="form-select w-auto" 
            value={filters.skills}
            onChange={(e) => setFilters(prev => ({ ...prev, skills: e.target.value }))}
          >
            <option value="">All Skills</option>
            <option value="react">React.js</option>
            <option value="python">Python</option>
            <option value="sql">SQL</option>
            <option value="figma">Figma</option>
            <option value="js">JavaScript</option>
            <option value="css">CSS</option>
            <option value="html">HTML</option>
            <option value="typescript">TypeScript</option>
            <option value="node">Node.js</option>
            <option value="mongodb">MongoDB</option>
            <option value="selenium">Selenium</option>
            <option value="tableau">Tableau</option>
            <option value="aws">AWS</option>
            <option value="docker">Docker</option>
          </select>

          <select 
            className="form-select w-auto"
            value={filters.job}
            onChange={(e) => setFilters(prev => ({ ...prev, job: e.target.value }))}
          >
            <option value="">All Jobs</option>
            <option value="frontend">Frontend Developer</option>
            <option value="backend">Backend Engineer</option>
            <option value="qa">QA Engineer</option>
            <option value="designer">UI Designer</option>
            <option value="data">Data Analyst</option>
            <option value="devops">DevOps Engineer</option>
          </select>

          <select 
            className="form-select w-auto"
            value={filters.stage}
            onChange={(e) => setFilters(prev => ({ ...prev, stage: e.target.value }))}
          >
            <option value="">All Stages</option>
            <option value="applied">Applied</option>
            <option value="screening">Screening</option>
            <option value="interview">Interview</option>
            <option value="offer">Offer</option>
            <option value="hired">Hired</option>
          </select>

          <select 
            className="form-select w-auto"
            value={filters.recruiter}
            onChange={(e) => setFilters(prev => ({ ...prev, recruiter: e.target.value }))}
          >
            <option value="">All Recruiters</option>
            <option value="AI">AI</option>
          </select>

          <div className="d-flex gap-2">
            <button className="btn btn-success d-inline-flex align-items-center gap-2" onClick={handleExport}>
              <Download size={16} />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedCandidates.length > 0 && (
        <div className="alert alert-info d-flex align-items-center justify-content-between mb-4">
          <div className="d-flex align-items-center gap-3">
            <span className="fw-medium">
              {selectedCandidates.length} candidate{selectedCandidates.length > 1 ? 's' : ''} selected
            </span>
            <div className="vr"></div>
            <button 
              className="btn btn-primary btn-sm d-inline-flex align-items-center gap-2"
              onClick={handleAIScreening}
              title="Process selected candidates with AI Resume Screening"
              disabled={selectedCandidates.some(id => {
                const candidate = candidates.find(c => c.id === id);
                return candidate && (candidate.resume_screened === "yes" || candidate.resume_screened === "Yes");
              })}
            >
              <Upload size={16} />
              AI Resume Screening
            </button>
            <button className="btn btn-danger btn-sm d-inline-flex align-items-center gap-2">
              <Trash2 size={16} />
              Delete
            </button>
          </div>
          <button
            onClick={() => setSelectedCandidates([])}
            className="btn btn-link p-0 text-decoration-none"
          >
            Clear Selection
          </button>
        </div>
      )}

      {/* Candidates Table */}
      <div className="card border shadow-none mb-4">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th style={{width: 40}} className="text-center">
                  <input 
                    type="checkbox" 
                    className="form-check-input"
                    checked={selectedCandidates.length === currentCandidates.length && currentCandidates.length > 0} 
                    onChange={handleSelectAll} 
                  />
                </th>
                <th className="text-start">CANDIDATE NAME</th>
                <th className="text-start">JOB ROLE</th>
                <th className="text-start">SKILLS</th>
                <th className="text-center">RESUME</th>
                <th className="text-center">AI SCREENED</th>
                <th className="text-center">STAGE</th>
                <th className="text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {currentCandidates.map(candidate => (
                <tr key={candidate.id}>
                  <td className="text-center">
                    <input 
                      type="checkbox" 
                      className="form-check-input"
                      checked={selectedCandidates.includes(candidate.id)} 
                      onChange={() => handleSelectCandidate(candidate.id)}
                      disabled={candidate.resume_screened === "yes" || candidate.resume_screened === "Yes"}
                      title={candidate.resume_screened === "yes" || candidate.resume_screened === "Yes" ? "This candidate's resume has already been screened" : ""}
                    />
                  </td>
                  <td className="text-start">
                    <div className="d-flex align-items-center">
                     
                      <span className="fw-medium">{candidate.name}</span>
                    </div>
                  </td>
                  <td className="text-start text-muted">{candidate.role}</td>
                  <td className="text-start">
                    <div className="d-flex flex-wrap gap-1">
                      {candidate.skills.slice(0, 4).map((skill, idx) => (
                        <span key={idx} className="badge bg-light text-dark">
                          {skill}
                        </span>
                      ))}
                      {candidate.skills.length > 4 && (
                        <span className="badge bg-primary-subtle text-primary">
                          +{candidate.skills.length - 4} more
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="text-center">
                    {candidate.resume_url && candidate.resume_url.trim() !== '' ? (
                      <span className="badge bg-success-subtle text-success d-inline-flex align-items-center gap-1" title={candidate.resume_url}>
                        <FileText size={12} />
                        <span>Available</span>
                      </span>
                    ) : (
                      <span className="badge bg-danger-subtle text-danger d-inline-flex align-items-center gap-1">
                        <XCircle size={12} />
                        <span>Missing</span>
                      </span>
                    )}
                  </td>
                  <td className="text-center">
                    {candidate.resume_screened === "yes" || candidate.resume_screened === "Yes" ? (
                      <span className="badge bg-success-subtle text-success d-inline-flex align-items-center gap-1" title="Resume has been screened with AI">
                        <CheckCircle size={12} />
                        <span>Yes</span>
                      </span>
                    ) : (
                      <span className="badge bg-warning-subtle text-warning d-inline-flex align-items-center gap-1" title="Resume not yet screened">
                        <XCircle size={12} />
                        <span>No</span>
                      </span>
                    )}
                  </td>
                  <td className="text-center">
                    <span className={`badge ${getStageColor(candidate.stage)}`}>
                      {candidate.stage}
                    </span>
                  </td>
                  <td className="text-center">
                    <button 
                      type='button'
                      className='w-32-px h-32-px d-inline-flex justify-content-center align-items-center bg-primary-100 text-primary-600 bg-hover-primary-600 text-hover-white text-md rounded-circle border-0'
                      title="View"
                      onClick={() => handleViewCandidate(candidate.id)}
                    >
                      <i className='ri-eye-line' />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <small className="text-secondary-light">
            Showing <strong>{startIndex+1}</strong> to <strong>{Math.min(endIndex, filteredCandidates.length)}</strong> of <strong>{filteredCandidates.length}</strong> candidates
          </small>
        </div>

        <div className="d-flex align-items-center gap-3">
          <div className="btn-group" role="group">
            <button 
              className="btn btn-outline-secondary" 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} 
              disabled={currentPage === 1}
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, idx) => {
              const pageNum = idx + 1;
              return (
                <button 
                  key={pageNum}
                  className={pageNum === currentPage ? 'btn btn-primary' : 'btn btn-outline-secondary'} 
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}
            <button 
              className="btn btn-outline-secondary" 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} 
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>

       
        </div>
      </div>

      {/* Candidate Profile Modal */}
      {showCandidateModal && selectedCandidate && (
        <div 
          className="modal fade show d-block" 
          style={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.5)', 
            zIndex: 1050,
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            overflow: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }} 
          tabIndex="-1"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseCandidateModal();
            }
          }}
        >
          <CandidateProfilePage 
            candidate={selectedCandidate} 
            onClose={handleCloseCandidateModal} 
          />
        </div>
      )}

      {/* AI Screening Progress Modal */}
      {aiScreening.showModal && (
        <div 
          className="modal show d-block" 
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          tabIndex="-1"
        >
          <div
            className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable"
            style={{ maxWidth: '1200px', width: '95%' }}
          >
            <div className="modal-content">
              <div className="modal-header border-0">
                <h5 className="modal-title">
                  <Upload className="me-2" size={20} />
                  AI Resume Screening Progress
                </h5>
                {!aiScreening.isProcessing && (
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={closeAIScreeningModal}
                  ></button>
                )}
              </div>
              <div className="modal-body">
                {aiScreening.isProcessing ? (
                  <>
                    {/* Processing State */}
                    <div className="text-center mb-4">
                      <div className="spinner-border text-primary mb-3" role="status">
                        <span className="visually-hidden">Processing...</span>
                      </div>
                      <h6 className="mb-2">
                        Processing {aiScreening.currentIndex} of {aiScreening.total} resumes...
                      </h6>
                      <p className="text-secondary-light mb-3">
                        Please wait while we analyze resumes with AI. This may take a few minutes.
                      </p>
                      {/* Progress Bar */}
                      <div className="progress" style={{ height: '8px' }}>
                        <div 
                          className="progress-bar progress-bar-striped progress-bar-animated"
                          role="progressbar"
                          style={{ 
                            width: `${(aiScreening.currentIndex / aiScreening.total) * 100}%` 
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Already Processed Results */}
                    {aiScreening.results.length > 0 && (
                      <div className="mt-4">
                        <h6 className="mb-3">Processed Candidates:</h6>
                        <div className="list-group">
                          {aiScreening.results.map((result, idx) => (
                            <div 
                              key={idx} 
                              className="list-group-item d-flex justify-content-between align-items-center"
                            >
                              <div className="d-flex align-items-center">
                                {result.status === 'shortlisted' ? (
                                  <CheckCircle size={16} className="text-success me-2" />
                                ) : result.status === 'rejected' ? (
                                  <XCircle size={16} className="text-warning me-2" />
                                ) : (
                                  <XCircle size={16} className="text-danger me-2" />
                                )}
                                <div>
                                  <strong>{result.candidate}</strong>
                                  <br />
                                  <small className="text-secondary-light">{result.message}</small>
                                </div>
                              </div>
                              {result.status === 'shortlisted' && (
                                <span className="badge bg-success">Shortlisted</span>
                              )}
                              {result.status === 'rejected' && (
                                <span className="badge bg-warning">Rejected</span>
                              )}
                              {result.status === 'error' && (
                                <span className="badge bg-danger">Error</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {/* Completed State */}
                    <div className="text-center mb-4">
                      <CheckCircle size={48} className="text-success mb-3" />
                      <h5 className="mb-2">Screening Complete!</h5>
                      <p className="text-secondary-light">
                        Processed {aiScreening.total} candidate{aiScreening.total > 1 ? 's' : ''}
                      </p>
                    </div>

                    {/* Results Summary */}
                    <div className="row mb-4">
                      <div className="col-4 text-center">
                        <div className="card border shadow-none">
                          <div className="card-body">
                            <div className="h3 mb-0 text-success">
                              {aiScreening.results.filter(r => r.status === 'shortlisted').length}
                            </div>
                            <small className="text-secondary-light">Shortlisted</small>
                          </div>
                        </div>
                      </div>
                      <div className="col-4 text-center">
                        <div className="card border shadow-none">
                          <div className="card-body">
                            <div className="h3 mb-0 text-warning">
                              {aiScreening.results.filter(r => r.status === 'rejected').length}
                            </div>
                            <small className="text-secondary-light">Rejected</small>
                          </div>
                        </div>
                      </div>
                      <div className="col-4 text-center">
                        <div className="card border shadow-none">
                          <div className="card-body">
                            <div className="h3 mb-0 text-danger">
                              {aiScreening.results.filter(r => r.status === 'error').length}
                            </div>
                            <small className="text-secondary-light">Errors</small>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Detailed Results */}
                    <div>
                      <h6 className="mb-3">Detailed Results:</h6>
                      <div className="list-group">
                        {aiScreening.results.map((result, idx) => (
                          <div 
                            key={idx} 
                            className="list-group-item d-flex justify-content-between align-items-center"
                          >
                            <div className="d-flex align-items-center">
                              {result.status === 'shortlisted' ? (
                                <CheckCircle size={16} className="text-success me-2" />
                              ) : result.status === 'rejected' ? (
                                <XCircle size={16} className="text-warning me-2" />
                              ) : (
                                <XCircle size={16} className="text-danger me-2" />
                              )}
                              <div>
                                <strong>{result.candidate}</strong>
                                <br />
                                <small className="text-secondary-light">{result.message}</small>
                                {result.email_status && result.email_status === 'yes' && (
                                  <span className="ms-2">
                                    <span className="badge bg-success-subtle text-success">✉ Email Sent</span>
                                  </span>
                                )}
                              </div>
                            </div>
                            {result.status === 'shortlisted' && (
                              <span className="badge bg-success">Shortlisted</span>
                            )}
                            {result.status === 'rejected' && (
                              <span className="badge bg-warning">Rejected</span>
                            )}
                            {result.status === 'error' && (
                              <span className="badge bg-danger">Error</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
              {!aiScreening.isProcessing && (
                <div className="modal-footer border-0">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={closeAIScreeningModal}
                  >
                    Close
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-primary" 
                    onClick={viewAIScreeningResults}
                  >
                    View All Results
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      </>
      )}
    </div>
  );
};

export default CandidatesPage;
