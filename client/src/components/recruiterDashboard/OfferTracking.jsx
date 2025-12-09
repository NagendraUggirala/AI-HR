import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Send,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  FileText,
  Mail,
  Calendar,
  DollarSign,
  TrendingUp,
  RefreshCw,
  Save,
  X
} from 'lucide-react';
import { BASE_URL } from '../../config/api.config';

const OfferTracking = () => {
  const [offers, setOffers] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [formData, setFormData] = useState({
    candidate_id: '',
    job_id: '',
    template_id: '',
    candidate_name: '',
    candidate_email: '',
    position: '',
    department: '',
    salary_offered: '',
    benefits: [],
    offer_content: '',
    expiry_date: '',
    notes: ''
  });
  const [newBenefit, setNewBenefit] = useState('');
  const [alert, setAlert] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    position: ''
  });

  // Fetch offers
  const fetchOffers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('❌ No authentication token found for fetching offers');
        showAlert('Authentication required. Please log in again.', 'error');
        setLoading(false);
        return;
      }

      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.position) params.append('position', filters.position);
      
      const url = `${BASE_URL}/api/offers/offer-tracking?${params.toString()}`;
      console.log('📥 Fetching offers from:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('📊 Offers response status:', response.status, response.statusText);
      
      if (response.ok) {
        const data = await response.json();
        setOffers(data);
        console.log(`📊 Total offers received: ${data.length}`);
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to fetch offers. Status:', response.status);
        console.error('❌ Error response:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { detail: errorText || 'Failed to fetch offers' };
        }
        
        showAlert(errorData.detail || 'Error fetching offers', 'error');
      }
    } catch (error) {
      console.error('❌ Error fetching offers:', error);
      showAlert('Error fetching offers', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('❌ No authentication token found for fetching stats');
        return;
      }

      console.log('📥 Fetching offer stats from:', `${BASE_URL}/api/offers/offer-tracking/stats`);
      
      const response = await fetch(`${BASE_URL}/api/offers/offer-tracking/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('📊 Stats response status:', response.status, response.statusText);
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
        console.log('📊 Offer stats received:', data);
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to fetch stats. Status:', response.status);
        console.error('❌ Error response:', errorText);
      }
    } catch (error) {
      console.error('❌ Error fetching stats:', error);
    }
  };

  // Fetch templates
  const fetchTemplates = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('❌ No authentication token found for fetching templates');
        return;
      }

      console.log('📥 Fetching offer templates from:', `${BASE_URL}/api/offers/offer-templates/`);
      
      const response = await fetch(`${BASE_URL}/api/offers/offer-templates/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('📊 Templates response status:', response.status, response.statusText);
      
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
        console.log(`📊 Total templates received: ${data.length}`);
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to fetch templates. Status:', response.status);
        console.error('❌ Error response:', errorText);
      }
    } catch (error) {
      console.error('❌ Error fetching templates:', error);
    }
  };

  // Fetch candidates
  const fetchCandidates = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('❌ No authentication token found for fetching candidates');
        return;
      }

      console.log('📥 Fetching candidates from:', `${BASE_URL}/api/recruiter_dashboard/candidates`);
      
      const response = await fetch(`${BASE_URL}/api/recruiter_dashboard/candidates`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('📊 Candidates response status:', response.status, response.statusText);
      
      if (response.ok) {
        const data = await response.json();
        setCandidates(data);
        console.log(`📊 Total candidates received: ${data.length}`);
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to fetch candidates. Status:', response.status);
        console.error('❌ Error response:', errorText);
      }
    } catch (error) {
      console.error('❌ Error fetching candidates:', error);
    }
  };

  useEffect(() => {
    fetchOffers();
    fetchStats();
    fetchTemplates();
    fetchCandidates();
  }, [filters]);

  // Show alert
  const showAlert = (message, type = 'success') => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 5000);
  };

  // Handle form input
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-populate template content
    if (field === 'template_id' && value) {
      const template = templates.find(t => t.id === parseInt(value));
      if (template) {
        setFormData(prev => ({
          ...prev,
          position: template.position || prev.position,
          department: template.department || prev.department,
          offer_content: template.template_content,
          benefits: template.benefits || []
        }));
      }
    }

    // Auto-populate candidate info
    if (field === 'candidate_id' && value) {
      const candidate = candidates.find(c => c.id === parseInt(value));
      if (candidate) {
        setFormData(prev => ({
          ...prev,
          candidate_name: candidate.name,
          candidate_email: candidate.email
        }));
      }
    }
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
    setEditingOffer(null);
    setFormData({
      candidate_id: '',
      job_id: '',
      template_id: '',
      candidate_name: '',
      candidate_email: '',
      position: '',
      department: '',
      salary_offered: '',
      benefits: [],
      offer_content: '',
      expiry_date: '',
      notes: ''
    });
    setShowModal(true);
  };

  // Open edit modal
  const openEditModal = (offer) => {
    setEditingOffer(offer);
    setFormData({
      candidate_id: offer.candidate_id,
      job_id: offer.job_id || '',
      template_id: offer.template_id || '',
      candidate_name: offer.candidate_name,
      candidate_email: offer.candidate_email,
      position: offer.position,
      department: offer.department || '',
      salary_offered: offer.salary_offered || '',
      benefits: offer.benefits || [],
      offer_content: offer.offer_content,
      expiry_date: offer.expiry_date || '',
      notes: offer.notes || ''
    });
    setShowModal(true);
  };

  // View offer details
  const viewOffer = (offer) => {
    setSelectedOffer(offer);
    setShowDetailModal(true);
  };

  // Save offer
  const saveOffer = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        showAlert('Authentication required. Please log in again.', 'error');
        return;
      }

      const url = editingOffer
        ? `${BASE_URL}/api/offers/offer-tracking/${editingOffer.id}`
        : `${BASE_URL}/api/offers/offer-tracking/`;
      
      const method = editingOffer ? 'PUT' : 'POST';
      
      console.log(`📤 ${method} offer to:`, url);
      console.log('📤 Offer data:', formData);
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      console.log('📊 Save offer response status:', response.status, response.statusText);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Offer saved successfully:', data);
        showAlert(
          editingOffer
            ? 'Offer updated successfully'
            : 'Offer created successfully',
          'success'
        );
        setShowModal(false);
        fetchOffers();
        fetchStats();
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to save offer. Status:', response.status);
        console.error('❌ Error response:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { detail: errorText || 'Error saving offer' };
        }
        
        // Handle Pydantic validation errors
        let errorMessage = 'Error saving offer';
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
      console.error('❌ Error saving offer:', error);
      showAlert('Error saving offer', 'error');
    }
  };

  // Update offer status
  const updateStatus = async (offerId, status) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        showAlert('Authentication required. Please log in again.', 'error');
        return;
      }

      console.log(`📤 Updating offer ${offerId} status to:`, status);
      
      const response = await fetch(`${BASE_URL}/api/offers/offer-tracking/${offerId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      console.log('📊 Update status response status:', response.status, response.statusText);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Status updated successfully:', data);
        showAlert('Status updated successfully', 'success');
        fetchOffers();
        fetchStats();
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to update status. Status:', response.status);
        console.error('❌ Error response:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { detail: errorText || 'Error updating status' };
        }
        
        showAlert(errorData.detail || 'Error updating status', 'error');
      }
    } catch (error) {
      console.error('❌ Error updating status:', error);
      showAlert('Error updating status', 'error');
    }
  };

  // Delete offer
  const deleteOffer = async (id) => {
    if (!window.confirm('Are you sure you want to delete this offer?')) return;

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        showAlert('Authentication required. Please log in again.', 'error');
        return;
      }

      console.log(`🗑️ Deleting offer: ${id}`);
      
      const response = await fetch(`${BASE_URL}/api/offers/offer-tracking/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('📊 Delete offer response status:', response.status, response.statusText);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Offer deleted successfully:', data);
        showAlert('Offer deleted successfully', 'success');
        fetchOffers();
        fetchStats();
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to delete offer. Status:', response.status);
        console.error('❌ Error response:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { detail: errorText || 'Error deleting offer' };
        }
        
        showAlert(errorData.detail || 'Error deleting offer', 'error');
      }
    } catch (error) {
      console.error('❌ Error deleting offer:', error);
      showAlert('Error deleting offer', 'error');
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      Draft: { color: 'secondary', icon: FileText },
      Sent: { color: 'info', icon: Send },
      Accepted: { color: 'success', icon: CheckCircle },
      Rejected: { color: 'danger', icon: XCircle },
      Expired: { color: 'warning', icon: Clock }
    };

    const config = statusConfig[status] || statusConfig.Draft;
    const Icon = config.icon;

    return (
      <span className={`badge bg-${config.color} d-inline-flex align-items-center`}>
        <Icon size={12} className="me-1" />
        <span>{status}</span>
      </span>
    );
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
          <h4 className="mb-2">Offer Tracking</h4>
          <p className="text-secondary-light mb-0">Track and manage job offers</p>
        </div>
        <div className="d-flex flex-wrap align-items-center gap-2">
          <button 
            className="btn btn-primary d-inline-flex align-items-center"
            onClick={fetchOffers}
            disabled={loading}
          >
            {loading ? (
              <>
                <RefreshCw size={16} className="me-2 spinner" />
                <span>Refreshing...</span>
              </>
            ) : (
              <>
                <RefreshCw size={16} className="me-2" />
                <span>Refresh</span>
              </>
            )}
          </button>
          <button 
            className="btn btn-success d-inline-flex align-items-center"
            onClick={openCreateModal}
          >
            <Plus size={18} className="me-2" />
            <span>Create Offer</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="card border shadow-none mb-4">
          <div className="card-body d-flex">
            <div className="text-center w-25">
              <div className="text-secondary-light small">Total Offers</div>
              <div className="h4 mb-0">{stats.total}</div>
            </div>
            <div className="text-center w-25 border-start ps-4">
              <div className="text-secondary-light small">Sent</div>
              <div className="h4 mb-0 text-primary">{stats.sent}</div>
            </div>
            <div className="text-center w-25 border-start ps-4">
              <div className="text-secondary-light small">Accepted</div>
              <div className="h4 mb-0 text-success">{stats.accepted}</div>
            </div>
            <div className="text-center w-25 border-start ps-4">
              <div className="text-secondary-light small">Acceptance Rate</div>
              <div className="h4 mb-0 text-danger">{stats.acceptance_rate}%</div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="row mb-4">
        <div className="col-md-6">
          <select
            className="form-select"
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
          >
            <option value="">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Sent">Sent</option>
            <option value="Accepted">Accepted</option>
            <option value="Rejected">Rejected</option>
            <option value="Expired">Expired</option>
          </select>
        </div>
        <div className="col-md-6">
          <input
            type="text"
            className="form-control"
            placeholder="Filter by position..."
            value={filters.position}
            onChange={(e) => setFilters(prev => ({ ...prev, position: e.target.value }))}
          />
        </div>
      </div>

      {/* Offers Table */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : offers.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-5">
            <div className="d-flex justify-content-center align-items-center gap-2 mb-3">
              <FileText size={48} className="text-muted" />
              <div>
                <h5 className="text-muted mb-1">No offers found</h5>
                <p className="text-muted mb-0">Create your first offer to get started</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Position</th>
                    <th>Salary</th>
                    <th>Status</th>
                    <th>Sent Date</th>
                    <th>Expiry Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {offers.map(offer => (
                    <tr key={offer.id}>
                      <td>
                        <div>
                          <strong>{offer.candidate_name}</strong>
                          <br />
                          <small className="text-muted">{offer.candidate_email}</small>
                        </div>
                      </td>
                      <td>
                        {offer.position}
                        {offer.department && (
                          <><br /><small className="text-muted">{offer.department}</small></>
                        )}
                      </td>
                      <td>
                        {offer.salary_offered ? `$${offer.salary_offered.toLocaleString()}` : '-'}
                      </td>
                      <td>{getStatusBadge(offer.status)}</td>
                      <td>
                        {offer.sent_date ? new Date(offer.sent_date).toLocaleDateString() : '-'}
                      </td>
                      <td>
                        {offer.expiry_date ? new Date(offer.expiry_date).toLocaleDateString() : '-'}
                      </td>
                      <td className="text-center">
                        <div className="d-flex gap-2 justify-content-center">
                          <button
                            type="button"
                            className="w-32-px h-32-px d-inline-flex justify-content-center align-items-center bg-primary-100 text-primary-600 bg-hover-primary-600 text-hover-white text-md rounded-circle border-0"
                            onClick={() => viewOffer(offer)}
                            title="View"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            type="button"
                            className="w-32-px h-32-px d-inline-flex justify-content-center align-items-center bg-warning-100 text-warning-600 bg-hover-warning-600 text-hover-white text-md rounded-circle border-0"
                            onClick={() => openEditModal(offer)}
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          {offer.status === 'Draft' && (
                            <button
                              type="button"
                              className="w-32-px h-32-px d-inline-flex justify-content-center align-items-center bg-success-100 text-success-600 bg-hover-success-600 text-hover-white text-md rounded-circle border-0"
                              onClick={() => updateStatus(offer.id, 'Sent')}
                              title="Send Offer"
                            >
                              <Send size={16} />
                            </button>
                          )}
                          <button
                            type="button"
                            className="w-32-px h-32-px d-inline-flex justify-content-center align-items-center bg-danger-100 text-danger-600 bg-hover-danger-600 text-hover-white text-md rounded-circle border-0"
                            onClick={() => deleteOffer(offer.id)}
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
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
              setShowModal(false);
            }
          }}
        >
          <div className="modal-dialog modal-lg modal-dialog-scrollable" style={{ 
            maxWidth: '800px', 
            width: '95%', 
            margin: '0 auto'
          }}>
            <div className="modal-content" style={{ borderRadius: '0.5rem' }} onClick={(e) => e.stopPropagation()}>
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">
                  {editingOffer ? 'Edit Offer' : 'Create Offer'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Template (Optional)</label>
                    <select
                      className="form-select"
                      value={formData.template_id}
                      onChange={(e) => handleInputChange('template_id', e.target.value)}
                    >
                      <option value="">Select a template...</option>
                      {templates.map(template => (
                        <option key={template.id} value={template.id}>
                          {template.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Candidate *</label>
                    <select
                      className="form-select"
                      value={formData.candidate_id}
                      onChange={(e) => handleInputChange('candidate_id', e.target.value)}
                    >
                      <option value="">Select a candidate...</option>
                      {candidates.map(candidate => (
                        <option key={candidate.id} value={candidate.id}>
                          {candidate.name} ({candidate.email})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Candidate Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.candidate_name}
                      onChange={(e) => handleInputChange('candidate_name', e.target.value)}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Candidate Email *</label>
                    <input
                      type="email"
                      className="form-control"
                      value={formData.candidate_email}
                      onChange={(e) => handleInputChange('candidate_email', e.target.value)}
                    />
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Position *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.position}
                      onChange={(e) => handleInputChange('position', e.target.value)}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Department</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.department}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                    />
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Salary Offered</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.salary_offered}
                      onChange={(e) => handleInputChange('salary_offered', parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Expiry Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={formData.expiry_date}
                      onChange={(e) => handleInputChange('expiry_date', e.target.value)}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Offer Content *</label>
                  <textarea
                    className="form-control"
                    rows="8"
                    value={formData.offer_content}
                    onChange={(e) => handleInputChange('offer_content', e.target.value)}
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
                    <button className="btn btn-outline-primary d-inline-flex align-items-center" onClick={addBenefit}>
                      <Plus size={16} className="me-1" />
                      <span>Add</span>
                    </button>
                  </div>
                  <div className="d-flex flex-wrap gap-2">
                    {formData.benefits.map((benefit, index) => (
                      <span key={index} className="badge bg-primary">
                        {benefit}
                        <span
                          className="ms-1"
                          style={{ cursor: 'pointer' }}
                          onClick={() => removeBenefit(index)}
                        >
                          ×
                        </span>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Notes</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Internal notes about this offer..."
                  />
                </div>
              </div>
              <div className="modal-footer border-top">
                <button className="btn btn-secondary d-inline-flex align-items-center" onClick={() => setShowModal(false)}>
                  <X size={16} className="me-2" />
                  <span>Cancel</span>
                </button>
                <button className="btn btn-primary d-inline-flex align-items-center" onClick={saveOffer}>
                  <Save size={16} className="me-2" />
                  <span>{editingOffer ? 'Update' : 'Create'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedOffer && (
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
              setShowDetailModal(false);
            }
          }}
        >
          <div className="modal-dialog modal-lg modal-dialog-scrollable" style={{ 
            maxWidth: '900px', 
            width: '95%', 
            margin: '0 auto'
          }}>
            <div className="modal-content" style={{ borderRadius: '0.5rem' }} onClick={(e) => e.stopPropagation()}>
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Offer Details</h5>
                <button type="button" className="btn-close" onClick={() => setShowDetailModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <h6>Candidate Information</h6>
                  <p><strong>Name:</strong> {selectedOffer.candidate_name}</p>
                  <p><strong>Email:</strong> {selectedOffer.candidate_email}</p>
                </div>
                
                <div className="mb-3">
                  <h6>Position Details</h6>
                  <p><strong>Position:</strong> {selectedOffer.position}</p>
                  {selectedOffer.department && <p><strong>Department:</strong> {selectedOffer.department}</p>}
                  {selectedOffer.salary_offered && (
                    <p><strong>Salary:</strong> ${selectedOffer.salary_offered.toLocaleString()}</p>
                  )}
                </div>

                {selectedOffer.benefits && selectedOffer.benefits.length > 0 && (
                  <div className="mb-3">
                    <h6>Benefits</h6>
                    <div className="d-flex flex-wrap gap-2">
                      {selectedOffer.benefits.map((benefit, idx) => (
                        <span key={idx} className="badge bg-secondary">{benefit}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mb-3">
                  <h6>Offer Letter</h6>
                  <div className="border rounded p-3" style={{ whiteSpace: 'pre-wrap' }}>
                    {selectedOffer.offer_content}
                  </div>
                </div>

                <div className="mb-3">
                  <h6>Status & Dates</h6>
                  <p><strong>Status:</strong> {getStatusBadge(selectedOffer.status)}</p>
                  {selectedOffer.sent_date && (
                    <p><strong>Sent Date:</strong> {new Date(selectedOffer.sent_date).toLocaleString()}</p>
                  )}
                  {selectedOffer.expiry_date && (
                    <p><strong>Expiry Date:</strong> {new Date(selectedOffer.expiry_date).toLocaleDateString()}</p>
                  )}
                  {selectedOffer.response_date && (
                    <p><strong>Response Date:</strong> {new Date(selectedOffer.response_date).toLocaleString()}</p>
                  )}
                </div>

                {selectedOffer.notes && (
                  <div className="mb-3">
                    <h6>Notes</h6>
                    <p>{selectedOffer.notes}</p>
                  </div>
                )}
              </div>
              <div className="modal-footer border-top d-flex flex-wrap justify-content-between align-items-center gap-2">
                <div>
                  {selectedOffer.status === 'Sent' && (
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-success d-inline-flex align-items-center"
                        onClick={() => {
                          updateStatus(selectedOffer.id, 'Accepted');
                          setShowDetailModal(false);
                        }}
                      >
                        <CheckCircle size={16} className="me-2" />
                        <span>Mark as Accepted</span>
                      </button>
                      <button
                        className="btn btn-danger d-inline-flex align-items-center"
                        onClick={() => {
                          updateStatus(selectedOffer.id, 'Rejected');
                          setShowDetailModal(false);
                        }}
                      >
                        <XCircle size={16} className="me-2" />
                        <span>Mark as Rejected</span>
                      </button>
                    </div>
                  )}
                </div>
                <button className="btn btn-secondary d-inline-flex align-items-center" onClick={() => setShowDetailModal(false)}>
                  <X size={16} className="me-2" />
                  <span>Close</span>
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

export default OfferTracking;

