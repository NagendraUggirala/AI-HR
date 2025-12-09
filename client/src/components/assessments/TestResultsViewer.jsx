import React, { useState, useEffect } from 'react';
import {
  Award,
  TrendingUp,
  Users,
  Search,
  Download,
  Calendar,
  Clock,
  Target,
  Eye,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';
import { assessmentAPI } from '../../utils/api';
import { BASE_URL } from '../../config/api.config';

const TestResultsViewer = () => {
  const [candidateResults, setCandidateResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [filters, setFilters] = useState({
    assessment: '',
    candidate: '',
    minScore: 0,
    maxScore: 100,
    status: '',
    stage: '' // Filter by assessment stage
  });

  // Fetch all assessment results directly from result tables
  const fetchResults = async () => {
    setLoading(true);
    try {
      const resultsData = await assessmentAPI.getAllResults();
      console.log('📊 TestResultsViewer - All Results Data:', resultsData);
      setCandidateResults(resultsData || []);
    } catch (error) {
      console.error('Error fetching test results:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  // Get candidate stages (already grouped by email from backend)
  const candidateStages = candidateResults;

  // Calculate statistics from all results
  const stats = {
    totalCandidates: candidateStages.length,
    completed: candidateStages.filter(c => 
      c.aptitude?.status === 'Completed' || 
      c.communication?.status === 'Completed' || 
      c.coding?.status === 'Completed'
    ).length,
    passed: candidateStages.filter(c => 
      c.aptitude?.test_status === 'Qualified' || 
      c.communication?.test_status === 'Qualified' || 
      c.coding?.test_status === 'Qualified'
    ).length,
    failed: candidateStages.filter(c => 
      c.aptitude?.test_status === 'Regret' || 
      c.communication?.test_status === 'Regret' || 
      c.coding?.test_status === 'Regret'
    ).length,
    avgScore: (() => {
      const allScores = [];
      candidateStages.forEach(c => {
        if (c.aptitude?.score !== null && c.aptitude?.score !== undefined) {
          const qCount = c.aptitude.question_count || 25;
          allScores.push((c.aptitude.score / qCount) * 100);
        }
        if (c.communication?.score !== null && c.communication?.score !== undefined) {
          const qCount = c.communication.question_count || 20;
          allScores.push((c.communication.score / qCount) * 100);
        }
        if (c.coding?.score !== null && c.coding?.score !== undefined) {
          // Coding score is already a count, so we'll use it as percentage
          allScores.push(c.coding.score * 20); // Assuming max 5 questions = 100%
        }
      });
      return allScores.length > 0 
        ? Math.round(allScores.reduce((sum, score) => sum + score, 0) / allScores.length)
        : 0;
    })()
  };

  // Filter candidate stages
  const filteredCandidateStages = candidateStages.filter(candidateStage => {
    const matchesCandidate = 
      candidateStage.candidate_name?.toLowerCase().includes(filters.candidate.toLowerCase()) ||
      candidateStage.candidate_email?.toLowerCase().includes(filters.candidate.toLowerCase());
    
    if (!matchesCandidate) return false;
    
    // Check if any stage matches the assessment filter
    if (filters.assessment && filters.assessment !== 'all') {
      const assessmentType = filters.assessment.toLowerCase();
      if (assessmentType === 'aptitude' && !candidateStage.aptitude) return false;
      if (assessmentType === 'communication' && !candidateStage.communication) return false;
      if (assessmentType === 'coding' && !candidateStage.coding) return false;
    }
    
    // Check if any stage matches the status filter
    if (filters.status && filters.status !== 'all') {
      const statusLower = filters.status.toLowerCase();
      const hasMatchingStatus = 
        (candidateStage.aptitude?.status?.toLowerCase() === statusLower) ||
        (candidateStage.communication?.status?.toLowerCase() === statusLower) ||
        (candidateStage.coding?.status?.toLowerCase() === statusLower);
      
      if (!hasMatchingStatus) return false;
    }
    
    // Check score range (if any stage has a score)
    if (filters.minScore > 0 || filters.maxScore < 100) {
      const hasScoreInRange = 
        (candidateStage.aptitude?.score !== null && candidateStage.aptitude?.score !== undefined &&
         ((candidateStage.aptitude.score / (candidateStage.aptitude.question_count || 25)) * 100) >= filters.minScore &&
         ((candidateStage.aptitude.score / (candidateStage.aptitude.question_count || 25)) * 100) <= filters.maxScore) ||
        (candidateStage.communication?.score !== null && candidateStage.communication?.score !== undefined &&
         ((candidateStage.communication.score / (candidateStage.communication.question_count || 20)) * 100) >= filters.minScore &&
         ((candidateStage.communication.score / (candidateStage.communication.question_count || 20)) * 100) <= filters.maxScore) ||
        (candidateStage.coding?.score !== null && candidateStage.coding?.score !== undefined &&
         candidateStage.coding.score >= filters.minScore && candidateStage.coding.score <= filters.maxScore);
      
      if (!hasScoreInRange) return false;
    }
    
    return true;
  });

  // Get status badge
  const getStatusBadge = (status) => {
    if (!status) return <span className="badge bg-secondary-subtle text-secondary">Not Assigned</span>;
    
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'passed':
      case 'qualified':
        return <span className="badge bg-success-subtle text-success">Completed</span>;
      case 'in progress':
        return <span className="badge bg-info-subtle text-info">In Progress</span>;
      case 'assigned':
        return <span className="badge bg-warning-subtle text-warning">Assigned</span>;
      case 'failed':
      case 'regret':
        return <span className="badge bg-danger-subtle text-danger">Failed</span>;
      default:
        return <span className="badge bg-secondary-subtle text-secondary">{status}</span>;
    }
  };

  // Helper function to render stage status in table
  const renderStageStatus = (stage) => {
    if (!stage) {
      return (
        <div className="text-center">
          <span className="badge bg-secondary-subtle text-secondary">Not Completed</span>
        </div>
      );
    }
    
    const status = stage.status || 'Completed';
    return (
      <div className="text-center">
        <div>
          {getStatusBadge(status)}
        </div>
        {stage.score !== null && stage.score !== undefined && (
          <div className="mt-1">
            <small className="text-secondary-light">
              {stage.score}{stage.question_count ? `/${stage.question_count}` : ''}
            </small>
          </div>
        )}
        {stage.test_status && (
          <div className="mt-1">
            <span className={`badge ${stage.test_status === 'Qualified' ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'} text-xs`}>
              {stage.test_status}
            </span>
          </div>
        )}
      </div>
    );
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Candidate Name', 'Email', 'Aptitude Status', 'Aptitude Score', 'Communication Status', 'Communication Score', 'Coding Status', 'Coding Score'];
    const rows = filteredCandidateStages.map(candidateStage => [
      candidateStage.candidate_name,
      candidateStage.candidate_email,
      candidateStage.aptitude?.status || 'Not Assigned',
      candidateStage.aptitude?.score ? `${candidateStage.aptitude.score}/${candidateStage.aptitude.question_count || 25}` : 'N/A',
      candidateStage.communication?.status || 'Not Assigned',
      candidateStage.communication?.score ? `${candidateStage.communication.score}/${candidateStage.communication.question_count || 20}` : 'N/A',
      candidateStage.coding?.status || 'Not Assigned',
      candidateStage.coding?.score ? `${candidateStage.coding.score}/${candidateStage.coding.question_count || 'N/A'}` : 'N/A'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `assessment_results_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="container-fluid py-4">
      {/* Page Header */}
      <div className="mb-4 d-flex justify-content-between align-items-center">
        <div>
          <h4 className="mb-2">Test Results</h4>
          <p className="text-secondary-light mb-0">Review candidate scores, performance, and detailed breakdowns.</p>
        </div>
        <div className="d-flex flex-wrap align-items-center gap-2">
          <button
            className="btn btn-primary d-flex align-items-center"
            onClick={fetchResults}
            disabled={loading}
          >
            {loading ? (
              <RefreshCw size={18} className="me-2 spinner" />
            ) : (
              <>
                <RefreshCw size={18} className="me-2" />
                Refresh
              </>
            )}
          </button>
          <button className="btn btn-success d-flex align-items-center" onClick={exportToCSV}>
            <Download size={18} className="me-2" />
            Export CSV
          </button>
        </div>
      </div>

      {/* KPI Summary */}
      <div className="card border shadow-none mb-4">
        <div className="card-body d-flex">
          <div className="text-center w-25">
            <div className="text-secondary-light small">Average Score</div>
            <div className="h4 mb-0">{stats.avgScore}%</div>
          </div>
          <div className="text-center w-25 border-start ps-4">
            <div className="text-secondary-light small">Total Candidates</div>
            <div className="h4 mb-0 text-primary">{stats.totalCandidates}</div>
          </div>
          <div className="text-center w-25 border-start ps-4">
            <div className="text-secondary-light small">Passed</div>
            <div className="h4 mb-0 text-success">{stats.passed}</div>
          </div>
          <div className="text-center w-25 border-start ps-4">
            <div className="text-secondary-light small">Failed</div>
            <div className="h4 mb-0 text-danger">{stats.failed}</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card border shadow-none mb-4">
        <div className="card-body">
          <h5 className="mb-3">Filter by:</h5>
          <div className="row g-3">
            <div className="col-md-3">
              <select
                className="form-select"
                value={filters.assessment}
                onChange={(e) => setFilters({ ...filters, assessment: e.target.value })}
              >
                <option value="all">All Assessments</option>
                <option value="aptitude">Aptitude</option>
                <option value="communication">Communication</option>
                <option value="coding">Coding</option>
              </select>
            </div>
            <div className="col-md-3">
              <div className="input-group">
                <span className="input-group-text">
                  <Search size={16} />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search candidate..."
                  value={filters.candidate}
                  onChange={(e) => setFilters({ ...filters, candidate: e.target.value })}
                />
              </div>
            </div>
            <div className="col-md-2">
              <input
                type="number"
                className="form-control"
                placeholder="Min Score"
                value={filters.minScore}
                onChange={(e) =>
                  setFilters({ ...filters, minScore: parseInt(e.target.value) || 0 })
                }
              />
            </div>
            <div className="col-md-2">
              <input
                type="number"
                className="form-control"
                placeholder="Max Score"
                value={filters.maxScore}
                onChange={(e) =>
                  setFilters({ ...filters, maxScore: parseInt(e.target.value) || 100 })
                }
              />
            </div>
            <div className="col-md-2">
              <select
                className="form-select"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="in progress">In Progress</option>
                <option value="assigned">Assigned</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="card border shadow-none">
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : filteredCandidateStages.length === 0 ? (
          <div className="text-center py-5">
            <div className="d-flex align-items-center justify-content-center gap-2">
              <Users size={48} className="text-muted" />
              <p className="text-muted mb-0">No results found</p>
            </div>
          </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="px-4 py-3">Candidate Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3 text-center">Aptitude Stage</th>
                    <th className="px-4 py-3 text-center">Communication Stage</th>
                    <th className="px-4 py-3 text-center">Coding Stage</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCandidateStages.map((candidateStage) => (
                    <tr key={candidateStage.candidate_email}>
                      <td className="px-4 py-3">
                        <div className="fw-medium">{candidateStage.candidate_name}</div>
                      </td>
                      <td className="px-4 py-3 text-secondary-light">
                        <small>{candidateStage.candidate_email}</small>
                      </td>
                      <td className="px-4 py-3">
                        {renderStageStatus(candidateStage.aptitude)}
                      </td>
                      <td className="px-4 py-3">
                        {renderStageStatus(candidateStage.communication)}
                      </td>
                      <td className="px-4 py-3">
                        {renderStageStatus(candidateStage.coding)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedCandidate && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              {/* Modal Header */}
              <div className="modal-header bg-primary text-white py-3">
                <div>
                  <h5 className="modal-title mb-0">Assessment Details</h5>
                  <p className="mb-0 text-primary-subtle small">Performance breakdown</p>
                </div>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setSelectedCandidate(null)}
                ></button>
              </div>

              {/* Modal Content */}
              <div className="modal-body">
                {/* Candidate Info */}
                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <div className="card bg-light border-0">
                      <div className="card-body py-3">
                        <p className="text-secondary-light small mb-1">Candidate Name</p>
                        <p className="fw-semibold mb-0">{selectedCandidate.candidate_name || 'Unknown'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card bg-light border-0">
                      <div className="card-body py-3">
                        <p className="text-secondary-light small mb-1">Email</p>
                        <p className="fw-semibold mb-0">{selectedCandidate.candidate_email || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* All Assessment Stages */}
                <div className="mb-4">
                  <h6 className="mb-3 fw-semibold">All Assessment Stages</h6>
                  <div className="row g-3">
                    {/* Aptitude Stage */}
                    <div className="col-md-4">
                      <div className="card border h-100">
                        <div className="card-body text-center">
                          <p className="text-secondary-light small mb-2 fw-semibold">Aptitude Stage</p>
                          {selectedCandidate.aptitude ? (
                            <>
                              {getStatusBadge(selectedCandidate.aptitude.status)}
                              {selectedCandidate.aptitude.score !== null && selectedCandidate.aptitude.score !== undefined && (
                                <div className="mt-2">
                                  <p className="mb-0">
                                    <span className="fw-bold text-primary">
                                      {selectedCandidate.aptitude.score}/{selectedCandidate.aptitude.question_count || 25}
                                    </span>
                                  </p>
                                  <small className="text-secondary-light">
                                    {Math.round((selectedCandidate.aptitude.score / (selectedCandidate.aptitude.question_count || 25)) * 100)}%
                                  </small>
                                </div>
                              )}
                              {selectedCandidate.aptitude.test_status && (
                                <div className="mt-2">
                                  <span className={`badge ${selectedCandidate.aptitude.test_status === 'Qualified' ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                                    {selectedCandidate.aptitude.test_status}
                                  </span>
                                </div>
                              )}
                              {selectedCandidate.aptitude.completed_at && (
                                <div className="mt-2">
                                  <small className="text-secondary-light">
                                    <Calendar size={12} className="me-1" />
                                    {new Date(selectedCandidate.aptitude.completed_at).toLocaleDateString()}
                                  </small>
                                </div>
                              )}
                            </>
                          ) : (
                            <span className="badge bg-secondary-subtle text-secondary">Not Assigned</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Communication Stage */}
                    <div className="col-md-4">
                      <div className="card border h-100">
                        <div className="card-body text-center">
                          <p className="text-secondary-light small mb-2 fw-semibold">Communication Stage</p>
                          {selectedCandidate.communication ? (
                            <>
                              {getStatusBadge(selectedCandidate.communication.status)}
                              {selectedCandidate.communication.score !== null && selectedCandidate.communication.score !== undefined && (
                                <div className="mt-2">
                                  <p className="mb-0">
                                    <span className="fw-bold text-primary">
                                      {selectedCandidate.communication.score}/{selectedCandidate.communication.question_count || 20}
                                    </span>
                                  </p>
                                  <small className="text-secondary-light">
                                    {Math.round((selectedCandidate.communication.score / (selectedCandidate.communication.question_count || 20)) * 100)}%
                                  </small>
                                </div>
                              )}
                              {selectedCandidate.communication.test_status && (
                                <div className="mt-2">
                                  <span className={`badge ${selectedCandidate.communication.test_status === 'Qualified' ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                                    {selectedCandidate.communication.test_status}
                                  </span>
                                </div>
                              )}
                              {selectedCandidate.communication.completed_at && (
                                <div className="mt-2">
                                  <small className="text-secondary-light">
                                    <Calendar size={12} className="me-1" />
                                    {new Date(selectedCandidate.communication.completed_at).toLocaleDateString()}
                                  </small>
                                </div>
                              )}
                            </>
                          ) : (
                            <span className="badge bg-secondary-subtle text-secondary">Not Assigned</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Coding Stage */}
                    <div className="col-md-4">
                      <div className="card border h-100">
                        <div className="card-body text-center">
                          <p className="text-secondary-light small mb-2 fw-semibold">Coding Stage</p>
                          {selectedCandidate.coding ? (
                            <>
                              {getStatusBadge(selectedCandidate.coding.status)}
                              {selectedCandidate.coding.score !== null && selectedCandidate.coding.score !== undefined && (
                                <div className="mt-2">
                                  <p className="mb-0">
                                    <span className="fw-bold text-primary">
                                      {selectedCandidate.coding.score} successful
                                    </span>
                                  </p>
                                  <small className="text-secondary-light">
                                    {selectedCandidate.coding.question_count ? `out of ${selectedCandidate.coding.question_count}` : ''}
                                  </small>
                                </div>
                              )}
                              {selectedCandidate.coding.test_status && (
                                <div className="mt-2">
                                  <span className={`badge ${selectedCandidate.coding.test_status === 'Qualified' ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                                    {selectedCandidate.coding.test_status}
                                  </span>
                                </div>
                              )}
                              {selectedCandidate.coding.completed_at && (
                                <div className="mt-2">
                                  <small className="text-secondary-light">
                                    <Calendar size={12} className="me-1" />
                                    {new Date(selectedCandidate.coding.completed_at).toLocaleDateString()}
                                  </small>
                                </div>
                              )}
                            </>
                          ) : (
                            <span className="badge bg-secondary-subtle text-secondary">Not Assigned</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .spinner {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default TestResultsViewer;
