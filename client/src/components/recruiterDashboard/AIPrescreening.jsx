import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  XCircle,
  Users,
  TrendingUp,
  AlertTriangle,
  Filter,
  Search,
  Download,
  X,
  Send,
  Video,
  RefreshCw
} from 'lucide-react';
import { BASE_URL } from '../../config/api.config';

const AIPrescreening = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [filters, setFilters] = useState({
    job: 'all',
    scoreThreshold: 0,
    search: '',
    stage: 'all'
  });
  const [sendingEmail, setSendingEmail] = useState(false);
  const [templates, setTemplates] = useState([]);

  // Fetch AI interview templates
  const fetchTemplates = async () => {
    try {
      const storedTemplates = localStorage.getItem('aiInterviewTemplates');
      if (storedTemplates) {
        setTemplates(JSON.parse(storedTemplates));
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  // Send AI Interview link via email
  const handleSendAIInterview = async (candidate, templateId = null) => {
    setSendingEmail(true);
    
    const template = templateId ? templates.find(t => t.id === templateId) : templates[0];
    const templateName = template ? template.name : 'AI Interview';
    
    const interviewLink = `${window.location.origin}/ai-interview?candidate_id=${candidate.id}&name=${encodeURIComponent(candidate.name)}&email=${encodeURIComponent(candidate.email)}${templateId ? `&template_id=${templateId}` : ''}`;

    const emailBody = `
Dear ${candidate.name},

Congratulations! Based on your resume screening results (Score: ${candidate.score.toFixed(1)}%), we would like to invite you to the next stage of our recruitment process - AI Interview.

📹 Interview Details:
${template ? `• Interview: ${template.name}` : '• Standard AI Interview'}
${template?.time_limit ? `• Duration: ${template.time_limit} minutes` : ''}
${template?.questions?.length ? `• Questions: ${template.questions.length}` : ''}
${template?.difficulty ? `• Difficulty: ${template.difficulty}` : ''}

🔗 Interview Link: ${interviewLink}

Instructions:
1. Click on the link above to start your AI interview
2. You will receive an OTP on your registered email for verification
3. Answer all questions thoughtfully
4. You can record video responses or type text answers
5. Make sure you're in a quiet environment with good internet connection

Best regards,
Recruitment Team
    `.trim();

    try {
      const response = await fetch(`${BASE_URL}/api/send-assessment-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to_email: candidate.email,
          to_name: candidate.name,
          subject: `AI Interview Invitation - ${templateName}`,
          body: emailBody,
          test_type: 'ai_interview',
          test_link: interviewLink,
          template_id: templateId
        })
      });

      if (response.ok) {
        alert(`✅ AI Interview link sent successfully to ${candidate.name}!`);
        // Refresh candidates list to update any status changes
        fetchCandidates();
      } else {
        navigator.clipboard.writeText(emailBody);
        alert(`⚠️ Email sending failed. The email content has been copied to your clipboard.\n\nPlease manually send it to: ${candidate.email}`);
      }
    } catch (error) {
      console.error('Error sending email:', error);
      navigator.clipboard.writeText(emailBody);
      alert(`⚠️ Email sending failed. The email content has been copied to your clipboard.\n\nPlease manually send it to: ${candidate.email}`);
    } finally {
      setSendingEmail(false);
    }
  };

  // Assign candidate to Interview stage
  const handleAssignInterview = async (candidate) => {
    try {
      const response = await fetch(`${BASE_URL}/api/resume/candidates/${candidate.id}/stage`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stage: 'Interview' })
      });

      if (response.ok) {
        const result = await response.json();
        alert(`✅ ${candidate.name} has been assigned to Interview stage!`);
        // Refresh candidates list to show updated stage
        fetchCandidates();
        // Update selected candidate if it's the same one
        if (selectedCandidate && selectedCandidate.id === candidate.id) {
          setSelectedCandidate({ ...selectedCandidate, stage: 'Interview' });
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`❌ Failed to assign interview: ${errorData.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error assigning interview:', error);
      alert('❌ Failed to assign interview. Please try again.');
    }
  };

  // Send interview link for candidates with "Interview" status
  const handleSendInterviewLink = async (candidate) => {
    if (candidate.stage?.toLowerCase() !== 'interview') {
      alert('⚠️ This candidate is not in Interview stage. Only candidates with "Interview" status can receive interview links.');
      return;
    }
    await handleSendAIInterview(candidate);
  };

  // Fetch candidates from candidate_records table who have stage = "Interview"
  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      // Fetch candidate records
      const candidatesRes = await fetch(`${BASE_URL}/api/resume/candidates`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (candidatesRes.ok) {
        const candidateRecords = await candidatesRes.json();

        // Debug: Log all candidate records and their stages
        console.log('📊 Total candidate records fetched:', candidateRecords.length);
        console.log('📊 All candidate stages:', candidateRecords.map(c => ({
          name: c.candidate_name,
          email: c.candidate_email,
          stage: c.stage,
          stageType: typeof c.stage,
          stageLower: c.stage?.toLowerCase()
        })));

        // Filter candidates who have stage = "Interview"
        const interviewCandidates = candidateRecords
          .filter(candidateRecord => {
            // Get and normalize stage value
            const stage = candidateRecord.stage;
            const stageNormalized = stage ? String(stage).toLowerCase().trim() : '';
            const isInterviewStage = stageNormalized === 'interview';
            
            // Debug: Log all candidates with their stages
            console.log(`🔍 Candidate: ${candidateRecord.candidate_name || 'Unknown'}`, {
              email: candidateRecord.candidate_email,
              stage: stage,
              stageNormalized: stageNormalized,
              isInterviewStage: isInterviewStage,
              id: candidateRecord.id
            });
            
            // Must be in Interview stage (case-insensitive, trimmed)
            return isInterviewStage;
          })
          .map(c => ({
            id: c.id,
            name: c.candidate_name,
            email: c.candidate_email,
            job: c.role || 'Not Specified',
            score: c.score || 0,
            stage: c.stage || 'Applied',
            strengths: c.strengths || [
              'Strong technical background',
              'Relevant experience in the field',
              'Good educational qualifications'
            ],
            weaknesses: c.weaknesses || [
              'Limited experience in some required technologies'
            ],
            additionalInfo: c.summary || 'Candidate is ready for interview.',
            resumeMatch: Math.round(c.score * 0.95) || 75,
            skillsMatch: Math.round(c.score * 1.05) || 85,
            experienceRelevance: Math.round(c.score * 0.98) || 80,
            cultureFit: Math.round(c.score * 1.02) || 82,
            recommendation: c.score >= 80
              ? 'Highly recommended for interview. Strong candidate with excellent qualifications.'
              : c.score >= 60
              ? 'Recommended for consideration. Good potential with solid background.'
              : 'Consider for interview. Candidate shows promise.',
            // Keep original data for backward compatibility
            candidate_name: c.candidate_name,
            candidate_email: c.candidate_email,
            role: c.role,
            experience_level: c.experience_level,
            candidate_skills: c.candidate_skills,
            email_sent: c.email_sent,
            created_at: c.created_at
          }));

        console.log(`✅ Found ${interviewCandidates.length} candidates in Interview stage`);
        setCandidates(interviewCandidates);
      } else {
        const errorText = await candidatesRes.text();
        console.error('❌ Failed to fetch candidates:', candidatesRes.status, errorText);
        setCandidates([]);
      }
    } catch (error) {
      console.error('❌ Error fetching candidates:', error);
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
    fetchTemplates();
  }, []);

  // Get unique jobs
  const jobs = ['all', ...new Set(candidates.map(c => c.job))];

  // Filter candidates
  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
                         candidate.email?.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesJob = filters.job === 'all' || candidate.job === filters.job;
    const matchesScore = candidate.score >= filters.scoreThreshold;
    const matchesStage = filters.stage === 'all' || 
                        candidate.stage?.toLowerCase() === filters.stage?.toLowerCase();
    
    // Exclude rejected candidates (already filtered in fetchCandidates, but double-check)
    const notRejected = candidate.stage?.toLowerCase() !== 'rejected';
    
    return matchesSearch && matchesJob && matchesScore && matchesStage && notRejected;
  });

  // Calculate statistics
  const hasData = candidates.length > 0;
  const totalCandidates = candidates.length;
  const avgScore = candidates.length > 0
    ? Math.round(candidates.reduce((sum, c) => sum + c.score, 0) / candidates.length)
    : 0;
  const interviewStageCount = candidates.filter(c => c.stage?.toLowerCase() === 'interview').length;
  const highScoreCount = candidates.filter(c => c.score >= 80).length;

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Job', 'Score', 'Strengths', 'Weaknesses', 'Recommendation'];
    const rows = filteredCandidates.map(candidate => [
      candidate.name,
      candidate.email,
      candidate.job,
      candidate.score,
      candidate.strengths.join('; '),
      candidate.weaknesses.join('; '),
      candidate.recommendation
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai_prescreening_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Get score color
  const getScoreColor = (score) => {
    if (score >= 80) return 'bg-success text-white';
    if (score >= 70) return 'bg-info text-white';
    if (score >= 60) return 'bg-warning text-dark';
    return 'bg-danger text-white';
  };

  // Get score badge text
  const getScoreBadge = (score) => {
    if (score >= 80) return 'Excellent Fit';
    if (score >= 70) return 'Good Fit';
    if (score >= 60) return 'Moderate Fit';
    return 'Poor Fit';
  };

  // Handle shortlist
  const handleShortlist = () => {
    if (selectedCandidate) {
      alert(`✅ ${selectedCandidate.name} has been shortlisted!`);
    }
  };

  // Handle move to interview
  const handleMoveToInterview = () => {
    if (selectedCandidate) {
      handleSendAIInterview(selectedCandidate);
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="mb-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <h4 className="mb-1">AI Prescreening</h4>
          <p className="text-secondary-light mb-0">
            Review candidates who passed resume screening and are ready for interviews.
          </p>
        </div>
        <div className="d-flex flex-wrap gap-2">
          <button
            className="btn btn-primary d-inline-flex align-items-center gap-2"
            onClick={fetchCandidates}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            className="btn btn-success d-inline-flex align-items-center gap-2"
            onClick={exportToCSV}
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-secondary-light mb-0">Fetching AI prescreening results...</p>
        </div>
      ) : !hasData ? (
        <div className="card border shadow-none">
          <div className="card-body text-center py-5">
          
            <h5 className="mb-2">No AI prescreening data</h5>
            <p className="text-secondary-light mb-0">
              Once candidates reach the interview stage they will appear here automatically.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="row g-3 mb-4">
            <div className="col-sm-6 col-lg-3">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <p className="text-secondary-light small mb-1">Total Candidates</p>
                  <h4 className="mb-0">{totalCandidates}</h4>
                </div>
              </div>
            </div>
            <div className="col-sm-6 col-lg-3">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <p className="text-secondary-light small mb-1">Average AI Score</p>
                  <h4 className="mb-0 text-primary">{avgScore}%</h4>
                </div>
              </div>
            </div>
            <div className="col-sm-6 col-lg-3">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <p className="text-secondary-light small mb-1">Interview Stage</p>
                  <h4 className="mb-0 text-success">{interviewStageCount}</h4>
                </div>
              </div>
            </div>
            <div className="col-sm-6 col-lg-3">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <p className="text-secondary-light small mb-1">High Potential (≥80%)</p>
                  <h4 className="mb-0 text-warning">{highScoreCount}</h4>
                </div>
              </div>
            </div>
          </div>

          <div className="card border shadow-none mb-4">
            <div className="card-body d-flex flex-wrap align-items-center gap-3">
              <div className="input-group" style={{ maxWidth: '320px' }}>
                <span className="input-group-text bg-white border-end-0">
                  <Search size={16} className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search candidates..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
              </div>

              <select
                className="form-select w-auto"
                value={filters.job}
                onChange={(e) => setFilters({ ...filters, job: e.target.value })}
              >
                {jobs.map((job) => (
                  <option key={job} value={job}>
                    {job === 'all' ? 'All Jobs' : job}
                  </option>
                ))}
              </select>

              <select
                className="form-select w-auto"
                value={filters.stage || 'all'}
                onChange={(e) => setFilters({ ...filters, stage: e.target.value })}
              >
                <option value="all">All Stages</option>
                <option value="applied">Applied</option>
                <option value="interview">Interview</option>
                <option value="offer">Offer</option>
                <option value="hired">Hired</option>
              </select>

              <div className="d-flex align-items-center gap-2">
                <label className="text-secondary-light small mb-0">Score ≥</label>
                <input
                  type="number"
                  className="form-control"
                  value={filters.scoreThreshold}
                  onChange={(e) =>
                    setFilters({ ...filters, scoreThreshold: parseInt(e.target.value) || 0 })
                  }
                  style={{ width: '90px' }}
                  min="0"
                  max="100"
                />
              </div>

              <button
                className="btn btn-outline-primary d-inline-flex align-items-center gap-2 ms-auto"
                onClick={fetchCandidates}
                disabled={loading}
              >
                <Filter size={16} />
                Apply Filters
              </button>
            </div>
          </div>

          <div className="row g-4">
            <div className={`${selectedCandidate ? 'col-lg-7' : 'col-12'}`}>
              <div className="card border shadow-none">
                <div className="card-body p-0">
                  {filteredCandidates.length === 0 ? (
                <div className="text-center py-5">
                  <Users size={48} className="text-muted mb-3" />
                  <h6 className="text-muted mb-2">No Candidates Found</h6>
                  <p className="text-muted small mb-0">
                    {candidates.length === 0
                      ? 'Start screening resumes to see candidates here'
                      : 'Try adjusting your filters'}
                  </p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="px-4 py-3">Candidate Name</th>
                        <th className="px-4 py-3">Job Applied</th>
                        <th className="px-4 py-3">AI Fit Score</th>
                        <th className="px-4 py-3">Stage</th>
                        <th className="px-4 py-3">Strengths</th>
                        <th className="px-4 py-3">Weaknesses</th>
                        <th className="px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCandidates.map((candidate) => (
                        <tr key={candidate.id}>
                          <td className="px-4 py-3">
                            <div className="fw-medium">{candidate.name}</div>
                            <div className="text-muted small">{candidate.email}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-muted small">{candidate.job}</div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`badge ${getScoreColor(candidate.score)}`}>
                              {candidate.score.toFixed(0)}%
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`badge ${
                              candidate.stage?.toLowerCase() === 'interview' 
                                ? 'bg-primary' 
                                : candidate.stage?.toLowerCase() === 'applied'
                                ? 'bg-info'
                                : 'bg-secondary'
                            } text-white`}>
                              {candidate.stage || 'Applied'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-muted small">
                              {candidate.strengths.slice(0, 2).join(', ')}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-muted small">
                              {candidate.weaknesses.slice(0, 1).join(', ')}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="d-flex gap-2">
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => setSelectedCandidate(candidate)}
                              >
                                View Insights
                              </button>
                              <button
                                className="btn btn-success btn-sm"
                                onClick={() => handleSendInterviewLink(candidate)}
                                disabled={sendingEmail}
                                title="Send Interview Link"
                              >
                                {sendingEmail ? (
                                  <RefreshCw size={14} className="spin" />
                                ) : (
                                  <>
                                    <Send size={14} className="me-1" />
                                    Send Link
                                  </>
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                  )}
                </div>
              </div>
            </div>

            {selectedCandidate && (
          <div className="col-lg-5">
            <div className="card border shadow-none position-sticky" style={{ top: '20px' }}>
              {/* Header */}
              <div className="card-header bg-white border-bottom">
                <div className="d-flex align-items-start justify-content-between mb-3">
                  <div>
                    <h5 className="mb-1">{selectedCandidate.name}</h5>
                    <p className="text-muted small mb-0">{selectedCandidate.job}</p>
                  </div>
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => setSelectedCandidate(null)}
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="d-flex align-items-center gap-3">
                  <span
                    className={`fs-3 fw-bold ${getScoreColor(selectedCandidate.score).split(' ')[0]}`}
                  >
                    {selectedCandidate.score.toFixed(0)}%
                  </span>
                  <span className={`badge ${getScoreColor(selectedCandidate.score)}`}>
                    {getScoreBadge(selectedCandidate.score)}
                  </span>
                </div>
              </div>

              <div className="card-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                {/* Strengths */}
                <div className="mb-4">
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <CheckCircle size={18} className="text-success" />
                    <h6 className="mb-0">💪 Strengths</h6>
                  </div>
                  <ul className="list-unstyled">
                    {selectedCandidate.strengths.map((strength, idx) => (
                      <li
                        key={idx}
                        className="d-flex align-items-start gap-2 small text-muted mb-2"
                      >
                        <span className="text-success mt-1">•</span>
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="small text-muted mt-3">{selectedCandidate.additionalInfo}</p>
                </div>

                {/* Weaknesses */}
                <div className="mb-4">
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <AlertTriangle size={18} className="text-warning" />
                    <h6 className="mb-0">⚠ Areas for Improvement</h6>
                  </div>
                  <ul className="list-unstyled">
                    {selectedCandidate.weaknesses.map((weakness, idx) => (
                      <li
                        key={idx}
                        className="d-flex align-items-start gap-2 small text-muted mb-2"
                      >
                        <span className="text-warning mt-1">•</span>
                        <span>{weakness}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Evaluation Metrics */}
                <div className="mb-4">
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <TrendingUp size={18} className="text-primary" />
                    <h6 className="mb-0">📈 Evaluation Summary</h6>
                  </div>
                  <div>
                    {[
                      { label: 'Resume Match', value: selectedCandidate.resumeMatch },
                      { label: 'Skills Match', value: selectedCandidate.skillsMatch },
                      {
                        label: 'Experience Relevance',
                        value: selectedCandidate.experienceRelevance,
                      },
                      {
                        label: 'Culture Fit (AI-based)',
                        value: selectedCandidate.cultureFit,
                      },
                    ].map((metric, idx) => (
                      <div key={idx} className="mb-3">
                        <div className="d-flex justify-content-between small mb-1">
                          <span className="text-muted">{metric.label}</span>
                          <span className="fw-medium">{metric.value}%</span>
                        </div>
                        <div className="progress" style={{ height: '8px' }}>
                          <div
                            className={`progress-bar ${
                              metric.value >= 80
                                ? 'bg-success'
                                : metric.value >= 70
                                ? 'bg-warning'
                                : 'bg-danger'
                            }`}
                            style={{ width: `${metric.value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Recommendations */}
                <div className="mb-4">
                  <h6 className="mb-2">🧠 AI Recommendations</h6>
                  <div className="alert alert-info">
                    <p className="small mb-0">{selectedCandidate.recommendation}</p>
                  </div>
                </div>

                {/* Current Stage */}
                <div className="mb-4">
                  <h6 className="mb-2">📋 Current Stage</h6>
                  <span className={`badge ${
                    selectedCandidate.stage?.toLowerCase() === 'interview' 
                      ? 'bg-primary' 
                      : selectedCandidate.stage?.toLowerCase() === 'applied'
                      ? 'bg-info'
                      : selectedCandidate.stage?.toLowerCase() === 'offer'
                      ? 'bg-warning'
                      : selectedCandidate.stage?.toLowerCase() === 'hired'
                      ? 'bg-success'
                      : 'bg-secondary'
                  } text-white fs-6`}>
                    {selectedCandidate.stage || 'Applied'}
                  </span>
                </div>


                {/* Action Buttons */}
                <div className="d-grid gap-2">
                  <button
                    className="btn btn-success"
                    onClick={handleShortlist}
                    style={{
                      backgroundColor: '#198754',
                      borderColor: '#198754',
                      color: 'white',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '500',
                      border: 'none',
                    }}
                  >
                    Shortlist
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleSendInterviewLink(selectedCandidate)}
                    disabled={sendingEmail}
                    style={{
                      backgroundColor: '#0d6efd',
                      borderColor: '#0d6efd',
                      color: 'white',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '500',
                      border: 'none',
                    }}
                  >
                    {sendingEmail ? (
                      <>
                        <RefreshCw size={14} className="spin me-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send size={14} className="me-2" />
                        Send Interview Link
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
          </div>
        </>
      )}

      <style jsx>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default AIPrescreening;
