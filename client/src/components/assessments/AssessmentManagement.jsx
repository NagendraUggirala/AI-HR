import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Send, 
  Eye, 
  RefreshCw,
  CheckCircle,
  XCircle,
  FileText,
  Code,
  MessageSquare,
  Brain
} from 'lucide-react';
import { assessmentAPI } from '../../utils/api';
import { Icon } from '@iconify/react/dist/iconify.js';

const AssessmentManagement = () => {
  const [activeTab, setActiveTab] = useState('assessments');
  const [assessments, setAssessments] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'aptitude',
    skill: '',
    difficulty: 'medium',
    role: '',
    question_count: 25,
    created_by: 1 // Get from auth context
  });

  // Fetch assessments
  const fetchAssessments = async () => {
    setLoading(true);
    try {
      const data = await assessmentAPI.list();
      setAssessments(data || []);
    } catch (error) {
      console.error('Error fetching assessments:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch assignments
  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const data = await assessmentAPI.listAssignments();
      setAssignments(data || []);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'assessments') {
      fetchAssessments();
    } else {
      fetchAssignments();
    }
  }, [activeTab]);

  const handleCreateAssessment = async () => {
    try {
      await assessmentAPI.create(formData);
      setShowCreateModal(false);
      fetchAssessments();
      setFormData({
        name: '',
        type: 'aptitude',
        skill: '',
        difficulty: 'medium',
        role: '',
        question_count: 25,
        created_by: 1
      });
    } catch (error) {
      console.error('Error creating assessment:', error);
      alert('Failed to create assessment');
    }
  };

  const handleDeleteAssessment = async (id) => {
    if (window.confirm('Are you sure you want to delete this assessment?')) {
      try {
        await assessmentAPI.delete(id);
        fetchAssessments();
      } catch (error) {
        console.error('Error deleting assessment:', error);
        alert('Failed to delete assessment');
      }
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'aptitude':
        return <Brain className="h-5 w-5" />;
      case 'coding':
        return <Code className="h-5 w-5" />;
      case 'communication':
        return <MessageSquare className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'aptitude':
        return 'bg-purple-50 text-purple-600 border-purple-200';
      case 'coding':
        return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'communication':
        return 'bg-green-50 text-green-600 border-green-200';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'badge bg-success-subtle text-success';
      case 'medium':
        return 'badge bg-warning-subtle text-warning';
      case 'hard':
        return 'badge bg-danger-subtle text-danger';
      default:
        return 'badge bg-secondary-subtle text-secondary';
    }
  };

  return (
    <div className="dashboard-main-body">
      {/* Page Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-24">
        <h6 className="fw-semibold mb-0">Assessment Management</h6>
        <ul className="d-flex align-items-center gap-2">
          <li className="fw-medium">
            <a href="#" className="d-flex align-items-center gap-1 hover-text-primary">
              <Icon icon="solar:home-smile-angle-outline" className="icon text-lg" />
              Dashboard
            </a>
          </li>
          <li>-</li>
          <li className="fw-medium">Assessments</li>
        </ul>
      </div>

      {/* Stats Cards */}
      <div className="row mb-24">
        <div className="col-md-3">
          <div className="card shadow-none border">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-secondary-light mb-1">Total Assessments</p>
                  <h4 className="mb-0">{assessments.length}</h4>
                </div>
                <div className="bg-primary-subtle p-3 rounded">
                  <FileText className="text-primary" size={24} />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-none border">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-secondary-light mb-1">Active Assignments</p>
                  <h4 className="mb-0">{assignments.length}</h4>
                </div>
                <div className="bg-success-subtle p-3 rounded">
                  <Send className="text-success" size={24} />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-none border">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-secondary-light mb-1">Aptitude Tests</p>
                  <h4 className="mb-0">
                    {assessments.filter(a => a.type === 'aptitude').length}
                  </h4>
                </div>
                <div className="bg-purple-subtle p-3 rounded">
                  <Brain className="text-purple" size={24} />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-none border">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-secondary-light mb-1">Coding Tests</p>
                  <h4 className="mb-0">
                    {assessments.filter(a => a.type === 'coding').length}
                  </h4>
                </div>
                <div className="bg-info-subtle p-3 rounded">
                  <Code className="text-info" size={24} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card mb-24">
        <div className="card-body p-0">
          <div className="d-flex border-bottom">
            <button
              onClick={() => setActiveTab('assessments')}
              className={`px-4 py-3 fw-medium border-0 bg-transparent ${
                activeTab === 'assessments'
                  ? 'text-primary border-bottom border-primary border-3'
                  : 'text-secondary-light'
              }`}
            >
              <FileText size={16} className="me-2" />
              Assessments
            </button>
            <button
              onClick={() => setActiveTab('assignments')}
              className={`px-4 py-3 fw-medium border-0 bg-transparent ${
                activeTab === 'assignments'
                  ? 'text-primary border-bottom border-primary border-3'
                  : 'text-secondary-light'
              }`}
            >
              <Send size={16} className="me-2" />
              Assignments
            </button>
          </div>
        </div>
      </div>

      {/* Assessments Tab */}
      {activeTab === 'assessments' && (
        <div className="card shadow-none border">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h6 className="mb-0">Available Assessments</h6>
            <div className="d-flex gap-2">
              <button
                onClick={fetchAssessments}
                className="btn btn-outline-primary btn-sm"
                disabled={loading}
              >
                <RefreshCw size={16} className={loading ? 'spin' : ''} />
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn btn-primary btn-sm"
              >
                <Plus size={16} className="me-1" />
                Create Assessment
              </button>
            </div>
          </div>
          <div className="card-body p-0">
            {loading ? (
              <div className="text-center py-5">
                <RefreshCw size={32} className="spin text-primary" />
                <p className="text-secondary-light mt-2">Loading...</p>
              </div>
            ) : assessments.length === 0 ? (
              <div className="text-center py-5">
                <FileText size={48} className="text-secondary-light mb-3" />
                <h6>No Assessments Created</h6>
                <p className="text-secondary-light mb-3">
                  Create your first assessment to start evaluating candidates
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="btn btn-primary"
                >
                  <Plus size={16} className="me-2" />
                  Create Assessment
                </button>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Assessment Name</th>
                      <th>Type</th>
                      <th>Skill/Role</th>
                      <th>Difficulty</th>
                      <th>Questions</th>
                      <th>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assessments.map((assessment) => (
                      <tr key={assessment.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className={`p-2 rounded border me-3 ${getTypeColor(assessment.type)}`}>
                              {getTypeIcon(assessment.type)}
                            </div>
                            <div>
                              <p className="mb-0 fw-medium">{assessment.name}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${getTypeColor(assessment.type)} border`}>
                            {assessment.type}
                          </span>
                        </td>
                        <td>
                          {assessment.skill || assessment.role || 'General'}
                        </td>
                        <td>
                          <span className={getDifficultyColor(assessment.difficulty)}>
                            {assessment.difficulty || 'Medium'}
                          </span>
                        </td>
                        <td>{assessment.question_count || 'N/A'}</td>
                        <td className="text-secondary-light">
                          {new Date(assessment.last_updated).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Assignments Tab */}
      {activeTab === 'assignments' && (
        <div className="card shadow-none border">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h6 className="mb-0">Assessment Assignments</h6>
            <button
              onClick={fetchAssignments}
              className="btn btn-outline-primary btn-sm"
              disabled={loading}
            >
              <RefreshCw size={16} className={loading ? 'spin' : ''} />
            </button>
          </div>
          <div className="card-body p-0">
            {loading ? (
              <div className="text-center py-5">
                <RefreshCw size={32} className="spin text-primary" />
                <p className="text-secondary-light mt-2">Loading...</p>
              </div>
            ) : assignments.length === 0 ? (
              <div className="text-center py-5">
                <Send size={48} className="text-secondary-light mb-3" />
                <h6>No Assignments Yet</h6>
                <p className="text-secondary-light">
                  Assign assessments to candidates from the Candidates page
                </p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Candidate ID</th>
                      <th>Assessment ID</th>
                      <th>Due Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignments.map((assignment) => (
                      <tr key={assignment.id}>
                        <td>{assignment.candidate_id}</td>
                        <td>{assignment.assessment_id}</td>
                        <td>{assignment.due_date || 'No deadline'}</td>
                        <td>
                          <span className="badge bg-info-subtle text-info">
                            {assignment.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Assessment Modal */}
      {showCreateModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Create New Assessment</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowCreateModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Assessment Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Python Developer Aptitude Test"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Type *</label>
                  <select
                    className="form-select"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="aptitude">Aptitude/Reasoning</option>
                    <option value="coding">Coding</option>
                    <option value="communication">Communication</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Skill (Optional)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.skill}
                    onChange={(e) => setFormData({ ...formData, skill: e.target.value })}
                    placeholder="e.g., Python, React, SQL"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Role (Optional)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    placeholder="e.g., Software Engineer, Data Analyst"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Difficulty</label>
                  <select
                    className="form-select"
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Number of Questions</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.question_count}
                    onChange={(e) => setFormData({ ...formData, question_count: parseInt(e.target.value) })}
                    min="1"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleCreateAssessment}
                  disabled={!formData.name || !formData.type}
                >
                  Create Assessment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssessmentManagement;

