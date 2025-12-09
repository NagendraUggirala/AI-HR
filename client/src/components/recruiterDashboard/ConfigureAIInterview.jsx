import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  ClipboardList,
  Clock,
  AlertCircle,
  CheckCircle,
  Settings,
  MessageSquare,
  Link,
  Copy
} from 'lucide-react';
import { BASE_URL } from '../../config/api.config';

const ConfigureAIInterview = () => {
  const [templates, setTemplates] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    interview_type: 'technical',
    time_limit: 30,
    difficulty: 'medium',
    questions: []
  });
  const [newQuestion, setNewQuestion] = useState({ q: '', a: '' });
  const [alert, setAlert] = useState(null);

  // Fetch interview questions (from AI_Interview_Bot)
  const fetchQuestions = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/interviews/get_questions`);
      if (response.ok) {
        const data = await response.json();
        setQuestions(data);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  // Fetch all templates from backend
  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/ai-interviews/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTemplates(data || []);
      } else {
        console.error('Error fetching templates:', response.statusText);
        setTemplates([]);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
    fetchTemplates();
  }, []);

  // Show alert
  const showAlert = (message, type = 'success') => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 5000);
  };

  // Handle form input
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Add question to template
  const addQuestion = () => {
    if (newQuestion.q.trim()) {
      setFormData(prev => ({
        ...prev,
        questions: [...prev.questions, { ...newQuestion }]
      }));
      setNewQuestion({ q: '', a: '' });
    }
  };

  // Remove question from template
  const removeQuestion = (index) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  // Open create modal
  const openCreateModal = () => {
    setEditingTemplate(null);
    setFormData({
      name: '',
      interview_type: 'technical',
      time_limit: 30,
      difficulty: 'medium',
      questions: []
    });
    setShowModal(true);
  };

  // Open edit modal
  const openEditModal = (template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      interview_type: template.interview_type,
      time_limit: template.time_limit || 30,
      difficulty: template.difficulty || 'medium',
      questions: template.questions || []
    });
    setShowModal(true);
  };

  // Save template
  const saveTemplate = async () => {
    try {
      // created_by is now automatically set by backend from authenticated user
      const payload = {
        ...formData
      };

      if (editingTemplate) {
        // Update existing
        const response = await fetch(`${BASE_URL}/ai-interviews/${editingTemplate.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          showAlert('Template updated successfully!');
          setShowModal(false);
          fetchTemplates(); // Refresh templates from backend
        } else {
          const errorData = await response.json().catch(() => ({ detail: 'Failed to update template' }));
          showAlert(errorData.detail || 'Failed to update template', 'danger');
        }
      } else {
        // Create new
        const response = await fetch(`${BASE_URL}/ai-interviews/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          showAlert('Template created successfully!');
          setShowModal(false);
          fetchTemplates(); // Refresh templates from backend
        } else {
          const errorData = await response.json().catch(() => ({ detail: 'Failed to create template' }));
          showAlert(errorData.detail || 'Failed to create template', 'danger');
        }
      }
    } catch (error) {
      console.error('Error saving template:', error);
      showAlert('Failed to save template', 'danger');
    }
  };

  // Delete template
  const deleteTemplate = async (templateId) => {
    if (!window.confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/ai-interviews/${templateId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        showAlert('Template deleted successfully!');
        fetchTemplates(); // Refresh templates from backend
      } else {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to delete template' }));
        showAlert(errorData.detail || 'Failed to delete template', 'danger');
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      showAlert('Failed to delete template', 'danger');
    }
  };

  // Get difficulty badge color
  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: 'bg-success-subtle text-success',
      medium: 'bg-warning-subtle text-warning',
      hard: 'bg-danger-subtle text-danger'
    };
    return colors[difficulty] || colors.medium;
  };

  // Copy interview link with template ID
  const copyInterviewLink = (templateId, templateName) => {
    const link = `${window.location.origin}/ai-interview?template_id=${templateId}&name=Candidate&email=candidate@example.com`;
    navigator.clipboard.writeText(link).then(() => {
      showAlert(`Interview link for "${templateName}" copied to clipboard!`, 'success');
    }).catch(err => {
      console.error('Failed to copy:', err);
      showAlert('Failed to copy link', 'danger');
    });
  };

  return (
    <div className="container-fluid py-4">
      {/* Page Header */}
      <div className="mb-4 d-flex justify-content-between align-items-center">
        <div>
          <h4 className="mb-2">Configure AI Interview</h4>
          <p className="text-secondary-light mb-0">Create and manage AI interview templates</p>
        </div>
        <button 
          onClick={openCreateModal} 
          className="btn btn-primary d-flex align-items-center"
        >
          <Plus size={18} className="me-2" />
          Create Template
        </button>
      </div>

      {/* Alert */}
      {alert && (
        <div className={`alert alert-${alert.type} alert-dismissible fade show mb-24`} role="alert">
          <div className="d-flex align-items-center gap-2">
            {alert.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            {alert.message}
          </div>
          <button type="button" className="btn-close" onClick={() => setAlert(null)}></button>
        </div>
      )}


      {/* Templates List */}
      {loading ? (
        <div className="d-flex justify-content-center align-items-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : templates.length === 0 ? (
        <div className="card shadow-none border">
          <div className="card-body text-center py-5">
            <div className="d-flex align-items-center justify-content-center gap-2 mb-3">
              <Settings size={48} className="text-secondary-light" />
              <div>
                <h6 className="text-secondary-light mb-1">No Templates Yet</h6>
                <p className="text-secondary-light text-sm mb-0">
                  Create your first AI interview template to get started
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="row g-3">
          {templates.map((template) => (
            <div key={template.id} className="col-md-6 col-lg-4">
              <div className="card shadow-none border h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="flex-grow-1">
                      <h6 className="mb-2">{template.name}</h6>
                      <div className="d-flex flex-wrap gap-2">
                        <span className="badge bg-primary-subtle text-primary text-capitalize">
                          {template.interview_type}
                        </span>
                        <span className={`badge ${getDifficultyColor(template.difficulty)} text-capitalize`}>
                          {template.difficulty}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="d-flex align-items-center gap-2 text-sm text-secondary-light mb-2">
                      <ClipboardList size={16} />
                      <span>{template.questions?.length || 0} Questions</span>
                    </div>
                    {template.time_limit && (
                      <div className="d-flex align-items-center gap-2 text-sm text-secondary-light">
                        <Clock size={16} />
                        <span>{template.time_limit} minutes</span>
                      </div>
                    )}
                  </div>

                  {/* Questions Preview */}
                  {template.questions && template.questions.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-secondary-light mb-2">Preview:</p>
                      <div className="bg-neutral-50 p-2 rounded">
                        <p className="text-xs mb-0 text-truncate">
                          {template.questions[0].q}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Interview Link */}
                  <div className="mb-3 p-2 bg-info-subtle rounded">
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <Link size={14} className="text-info" />
                      <span className="text-xs fw-semibold text-info">Interview Link</span>
                    </div>
                    <button
                      onClick={() => copyInterviewLink(template.id, template.name)}
                      className="btn btn-sm btn-info w-100 d-flex align-items-center justify-content-center"
                      title="Copy interview link with this template"
                    >
                      <Copy size={14} className="me-1" />
                      Copy Link
                    </button>
                  </div>

                  <div className="d-flex gap-2">
                    <button
                      onClick={() => openEditModal(template)}
                      className="btn btn-sm btn-outline-primary flex-fill d-flex align-items-center justify-content-center"
                    >
                      <Edit size={14} className="me-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => deleteTemplate(template.id)}
                      className="btn btn-sm btn-outline-danger flex-fill d-flex align-items-center justify-content-center"
                    >
                      <Trash2 size={14} className="me-1" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    

      {/* Create/Edit Template Modal */}
      {showModal && (
        <div className="modal fade show" style={{display: 'block', backgroundColor: 'rgba(0,0,0,0.5)'}} onClick={() => setShowModal(false)}>
          <div className="modal-dialog modal-lg modal-dialog-scrollable" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingTemplate ? 'Edit' : 'Create'} Interview Template
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                {/* Template Name */}
                <div className="mb-3">
                  <label className="form-label">Template Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g., Senior Developer Interview"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                  />
                </div>

                {/* Interview Type */}
                <div className="mb-3">
                  <label className="form-label">Interview Type *</label>
                  <select
                    className="form-select"
                    value={formData.interview_type}
                    onChange={(e) => handleInputChange('interview_type', e.target.value)}
                  >
                    <option value="technical">Technical</option>
                    <option value="behavioral">Behavioral</option>
                    <option value="hr">HR</option>
                    <option value="mixed">Mixed</option>
                  </select>
                </div>

                {/* Difficulty */}
                <div className="mb-3">
                  <label className="form-label">Difficulty Level</label>
                  <select
                    className="form-select"
                    value={formData.difficulty}
                    onChange={(e) => handleInputChange('difficulty', e.target.value)}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                {/* Time Limit */}
                <div className="mb-3">
                  <label className="form-label">Time Limit (minutes)</label>
                  <input
                    type="number"
                    className="form-control"
                    min="5"
                    max="120"
                    value={formData.time_limit}
                    onChange={(e) => handleInputChange('time_limit', parseInt(e.target.value))}
                  />
                </div>

                {/* Questions */}
                <div className="mb-3">
                  <label className="form-label">Questions</label>
                  
                  {/* Question List */}
                  {formData.questions.length > 0 && (
                    <div className="mb-3">
                      {formData.questions.map((q, idx) => (
                        <div key={idx} className="bg-neutral-50 p-3 rounded mb-2">
                          <div className="d-flex justify-content-between align-items-start">
                            <div className="flex-grow-1">
                              <p className="mb-1 fw-medium">{idx + 1}. {q.q}</p>
                              {q.a && (
                                <p className="text-sm text-secondary-light mb-0">
                                  Sample Answer: {q.a}
                                </p>
                              )}
                            </div>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => removeQuestion(idx)}
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Question Form */}
                  <div className="card border">
                    <div className="card-body">
                      <h6 className="mb-3">Add Question</h6>
                      <div className="mb-3">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Enter question..."
                          value={newQuestion.q}
                          onChange={(e) => setNewQuestion({...newQuestion, q: e.target.value})}
                        />
                      </div>
                      <div className="mb-3">
                        <textarea
                          className="form-control"
                          rows="2"
                          placeholder="Sample answer (optional)..."
                          value={newQuestion.a}
                          onChange={(e) => setNewQuestion({...newQuestion, a: e.target.value})}
                        />
                      </div>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary d-flex align-items-center"
                        onClick={addQuestion}
                        disabled={!newQuestion.q.trim()}
                      >
                        <Plus size={14} className="me-1" />
                        Add Question
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary d-flex align-items-center"
                  onClick={saveTemplate}
                  disabled={!formData.name.trim() || formData.questions.length === 0}
                >
                  <Save size={18} className="me-2" />
                  {editingTemplate ? 'Update' : 'Create'} Template
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfigureAIInterview;


