import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  FileText,
  DollarSign,
  Briefcase,
  AlertCircle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import { BASE_URL } from '../../config/api.config';

const OfferTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    department: '',
    template_content: '',
    salary_range_min: '',
    salary_range_max: '',
    benefits: [],
    validity_days: 30
  });
  const [newBenefit, setNewBenefit] = useState('');
  const [alert, setAlert] = useState(null);
  const [filters, setFilters] = useState({
    position: '',
    department: ''
  });

  // Fetch all templates
  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('❌ No authentication token found for fetching offer templates');
        showAlert('Authentication required. Please log in again.', 'error');
        setLoading(false);
        return;
      }

      const params = new URLSearchParams();
      if (filters.position) params.append('position', filters.position);
      if (filters.department) params.append('department', filters.department);
      
      const url = `${BASE_URL}/api/offers/offer-templates/?${params.toString()}`;
      console.log('📥 Fetching offer templates from:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('📊 Offer templates response status:', response.status, response.statusText);
      
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
        console.log(`📊 Total offer templates received: ${data.length}`);
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to fetch offer templates. Status:', response.status);
        console.error('❌ Error response:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { detail: errorText || 'Failed to fetch offer templates' };
        }
        
        // Handle Pydantic validation errors (array of error objects)
        let errorMessage = 'Error fetching templates';
        if (errorData.detail) {
          if (Array.isArray(errorData.detail)) {
            errorMessage = errorData.detail.map(err => {
              if (typeof err === 'object' && err.msg) {
                const field = err.loc ? err.loc.join('.') : 'field';
                return `${field}: ${err.msg}`;
              }
              return String(err);
            }).join(', ');
          } else {
            errorMessage = String(errorData.detail);
          }
        }
        
        showAlert(errorMessage, 'error');
      }
    } catch (error) {
      console.error('❌ Error fetching templates:', error);
      showAlert('Error fetching templates', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [filters]);

  // Show alert
  const showAlert = (message, type = 'success') => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 5000);
  };

  // Handle form input
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Add benefit
  const addBenefit = () => {
    if (newBenefit.trim()) {
      setFormData(prev => ({
        ...prev,
        benefits: [...prev.benefits, newBenefit.trim()]
      }));
      setNewBenefit('');
    }
  };

  // Remove benefit
  const removeBenefit = (index) => {
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index)
    }));
  };

  // Open create modal
  const openCreateModal = () => {
    setEditingTemplate(null);
    setFormData({
      name: '',
      position: '',
      department: '',
      template_content: '',
      salary_range_min: '',
      salary_range_max: '',
      benefits: [],
      validity_days: 30
    });
    setShowModal(true);
  };

  // Open edit modal
  const openEditModal = (template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      position: template.position || '',
      department: template.department || '',
      template_content: template.template_content,
      salary_range_min: template.salary_range_min || '',
      salary_range_max: template.salary_range_max || '',
      benefits: template.benefits || [],
      validity_days: template.validity_days
    });
    setShowModal(true);
  };

  // Save template
  const saveTemplate = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        showAlert('Authentication required. Please log in again.', 'error');
        return;
      }

      const url = editingTemplate
        ? `${BASE_URL}/api/offers/offer-templates/${editingTemplate.id}`
        : `${BASE_URL}/api/offers/offer-templates/`;
      
      const method = editingTemplate ? 'PUT' : 'POST';
      
      console.log(`📤 ${method} offer template to:`, url);
      console.log('📤 Template data:', formData);
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      console.log('📊 Save template response status:', response.status, response.statusText);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Template saved successfully:', data);
        showAlert(
          editingTemplate
            ? 'Template updated successfully'
            : 'Template created successfully',
          'success'
        );
        setShowModal(false);
        fetchTemplates();
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to save template. Status:', response.status);
        console.error('❌ Error response:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { detail: errorText || 'Error saving template' };
        }
        
        // Handle Pydantic validation errors (array of error objects)
        let errorMessage = 'Error saving template';
        if (errorData.detail) {
          if (Array.isArray(errorData.detail)) {
            errorMessage = errorData.detail.map(err => {
              if (typeof err === 'object' && err.msg) {
                const field = err.loc ? err.loc.join('.') : 'field';
                return `${field}: ${err.msg}`;
              }
              return String(err);
            }).join(', ');
          } else {
            errorMessage = String(errorData.detail);
          }
        }
        
        showAlert(errorMessage, 'error');
      }
    } catch (error) {
      console.error('❌ Error saving template:', error);
      showAlert('Error saving template', 'error');
    }
  };

  // Delete template
  const deleteTemplate = async (id) => {
    if (!window.confirm('Are you sure you want to delete this template?')) return;

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        showAlert('Authentication required. Please log in again.', 'error');
        return;
      }

      console.log(`🗑️ Deleting offer template: ${id}`);
      
      const response = await fetch(`${BASE_URL}/api/offers/offer-templates/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('📊 Delete template response status:', response.status, response.statusText);

      if (response.ok) {
        showAlert('Template deleted successfully', 'success');
        fetchTemplates();
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to delete template. Status:', response.status);
        console.error('❌ Error response:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { detail: errorText || 'Error deleting template' };
        }
        
        // Handle Pydantic validation errors (array of error objects)
        let errorMessage = 'Error deleting template';
        if (errorData.detail) {
          if (Array.isArray(errorData.detail)) {
            errorMessage = errorData.detail.map(err => {
              if (typeof err === 'object' && err.msg) {
                const field = err.loc ? err.loc.join('.') : 'field';
                return `${field}: ${err.msg}`;
              }
              return String(err);
            }).join(', ');
          } else {
            errorMessage = String(errorData.detail);
          }
        }
        
        showAlert(errorMessage, 'error');
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      showAlert('Error deleting template', 'error');
    }
  };

  return (
    <div className="container-fluid py-4">
      {/* Alert */}
      {alert && (
        <div className={`alert alert-${alert.type === 'success' ? 'success' : 'danger'} alert-dismissible fade show mb-4`} role="alert">
          <div className="d-flex align-items-center">
            {alert.type === 'success' ? <CheckCircle size={20} className="me-2" /> : <AlertCircle size={20} className="me-2" />}
            {alert.message}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-4 d-flex justify-content-between align-items-center">
        <div>
          <h4 className="mb-2">Offer Templates</h4>
          <p className="text-secondary-light mb-0">Create and manage offer letter templates</p>
        </div>
        <div className="d-flex flex-wrap align-items-center gap-2">
          <button 
            className="btn btn-primary d-flex align-items-center"
            onClick={fetchTemplates}
            disabled={loading}
          >
            {loading ? (
              <RefreshCw size={16} className="me-2 spinner" />
            ) : (
              <>
                <RefreshCw size={16} className="me-2" />
                Refresh
              </>
            )}
          </button>
          <button 
            className="btn btn-success d-flex align-items-center"
            onClick={openCreateModal}
          >
            <Plus size={18} className="me-2" />
            Create Template
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="row mb-4">
        <div className="col-md-6">
          <input
            type="text"
            className="form-control"
            placeholder="Filter by position..."
            value={filters.position}
            onChange={(e) => setFilters(prev => ({ ...prev, position: e.target.value }))}
          />
        </div>
        <div className="col-md-6">
          <input
            type="text"
            className="form-control"
            placeholder="Filter by department..."
            value={filters.department}
            onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
          />
        </div>
      </div>

      {/* Templates List */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : templates.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-5">
            <div className="d-flex justify-content-center align-items-center gap-2 mb-3">
              <FileText size={48} className="text-muted" />
              <div>
                <h5 className="text-muted mb-1">No templates found</h5>
                <p className="text-muted mb-0">Create your first offer template to get started</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="row">
          {templates.map(template => (
            <div key={template.id} className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <h5 className="card-title mb-0">{template.name}</h5>
                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        className="w-32-px h-32-px d-inline-flex justify-content-center align-items-center bg-warning-100 text-warning-600 bg-hover-warning-600 text-hover-white text-md rounded-circle border-0"
                        onClick={() => openEditModal(template)}
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        type="button"
                        className="w-32-px h-32-px d-inline-flex justify-content-center align-items-center bg-danger-100 text-danger-600 bg-hover-danger-600 text-hover-white text-md rounded-circle border-0"
                        onClick={() => deleteTemplate(template.id)}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="mb-2">
                    <Briefcase size={16} className="me-2 text-muted" />
                    <span className="text-muted small">
                      {template.position || 'Not specified'} 
                      {template.department && ` - ${template.department}`}
                    </span>
                  </div>

                  {template.salary_range_min && template.salary_range_max && (
                    <div className="mb-2">
                      <DollarSign size={16} className="me-2 text-muted" />
                      <span className="text-muted small">
                        ${template.salary_range_min.toLocaleString()} - ${template.salary_range_max.toLocaleString()}
                      </span>
                    </div>
                  )}

                  {template.benefits && template.benefits.length > 0 && (
                    <div className="mb-2">
                      <small className="text-muted">Benefits:</small>
                      <div className="d-flex flex-wrap gap-1 mt-1">
                        {template.benefits.slice(0, 3).map((benefit, idx) => (
                          <span key={idx} className="badge bg-secondary">{benefit}</span>
                        ))}
                        {template.benefits.length > 3 && (
                          <span className="badge bg-secondary">+{template.benefits.length - 3} more</span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="mt-3 pt-3 border-top">
                    <small className="text-muted">
                      Validity: {template.validity_days} days
                    </small>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingTemplate ? 'Edit Template' : 'Create Template'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Template Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g., Senior Developer Offer"
                  />
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Position</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.position}
                      onChange={(e) => handleInputChange('position', e.target.value)}
                      placeholder="e.g., Senior Software Engineer"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Department</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.department}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                      placeholder="e.g., Engineering"
                    />
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Minimum Salary</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.salary_range_min}
                      onChange={(e) => handleInputChange('salary_range_min', parseFloat(e.target.value))}
                      placeholder="e.g., 80000"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Maximum Salary</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.salary_range_max}
                      onChange={(e) => handleInputChange('salary_range_max', parseFloat(e.target.value))}
                      placeholder="e.g., 120000"
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Template Content *</label>
                  <textarea
                    className="form-control"
                    rows="8"
                    value={formData.template_content}
                    onChange={(e) => handleInputChange('template_content', e.target.value)}
                    placeholder="Dear [Candidate Name],&#10;&#10;We are pleased to offer you the position of [Position] at [Company Name]...&#10;&#10;Use placeholders like [Candidate Name], [Position], [Salary], etc."
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Benefits</label>
                  <div className="input-group mb-2">
                    <input
                      type="text"
                      className="form-control"
                      value={newBenefit}
                      onChange={(e) => setNewBenefit(e.target.value)}
                      placeholder="e.g., Health Insurance"
                      onKeyPress={(e) => e.key === 'Enter' && addBenefit()}
                    />
                    <button className="btn btn-outline-primary d-flex align-items-center" onClick={addBenefit}>
                      <Plus size={16} className="me-1" />
                      Add
                    </button>
                  </div>
                  <div className="d-flex flex-wrap gap-2">
                    {formData.benefits.map((benefit, index) => (
                      <span key={index} className="badge bg-primary">
                        {benefit}
                        <X
                          size={14}
                          className="ms-1"
                          style={{ cursor: 'pointer' }}
                          onClick={() => removeBenefit(index)}
                        />
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Validity (Days)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.validity_days}
                    onChange={(e) => handleInputChange('validity_days', parseInt(e.target.value))}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button className="btn btn-primary d-flex align-items-center" onClick={saveTemplate}>
                  <Save size={16} className="me-2" />
                  {editingTemplate ? 'Update' : 'Create'}
                </button>
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

export default OfferTemplates;

