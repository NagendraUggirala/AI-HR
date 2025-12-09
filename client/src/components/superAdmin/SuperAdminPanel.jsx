import React, { useState, useEffect } from 'react';
import { Edit } from 'lucide-react';
import { adminAPI } from '../../utils/api';
import { BASE_URL } from '../../config/api.config';

const SuperAdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    role: 'recruiter',
    is_active: true
  });

  // Fetch users and summary
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        setError('Authentication required. Please log in again.');
        setLoading(false);
        return;
      }

      // Fetch summary
      const summaryResponse = await fetch(`${BASE_URL}/api/admin/superadmin/summary`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (summaryResponse.ok) {
        const summaryData = await summaryResponse.json();
        setSummary(summaryData);
        setUsers(summaryData.users || []);
      } else {
        const errorText = await summaryResponse.text();
        setError('Failed to fetch admin data');
        console.error('Error fetching summary:', errorText);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Network error. Please check if backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = filterRole === 'all' || user.role?.toLowerCase() === filterRole.toLowerCase();

    return matchesSearch && matchesRole;
  });

  // Handle form input
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Open create modal
  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      username: '',
      email: '',
      role: 'recruiter',
      is_active: true
    });
    setShowModal(true);
  };

  // Open edit modal
  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      username: user.username || '',
      email: user.email || '',
      role: user.role || 'recruiter',
      is_active: user.is_active !== undefined ? user.is_active : true
    });
    setShowModal(true);
  };

  // Save user
  const saveUser = async () => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        alert('Authentication required. Please log in again.');
        return;
      }

      const url = editingUser
        ? `${BASE_URL}/api/admin/superadmin/users/${editingUser.id}`
        : `${BASE_URL}/api/admin/superadmin/users`;

      const method = editingUser ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert(editingUser ? 'User updated successfully' : 'User created successfully');
        setShowModal(false);
        fetchData();
      } else {
        const errorData = await response.json();
        alert(errorData.detail || 'Error saving user');
      }
    } catch (error) {
      console.error('Error saving user:', error);
      alert('Error saving user');
    }
  };

  // Get role badge color
  const getRoleBadge = (role) => {
    const colors = {
      'superadmin': 'danger',
      'admin': 'warning',
      'recruiter': 'primary',
      'company': 'info',
      'candidate': 'secondary'
    };
    return colors[role?.toLowerCase()] || 'secondary';
  };

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="mb-4 d-flex justify-content-between align-items-center">
        <div>
          <h4 className="mb-2">Super Admin Panel</h4>
          <p className="text-secondary-light mb-0">Manage users and system settings</p>
        </div>
        <div className="d-flex flex-wrap align-items-center gap-2">
          <button
            className="btn btn-primary"
            onClick={fetchData}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            className="btn btn-success d-inline-flex align-items-center"
            onClick={openCreateModal}
          >
            Create User
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-danger mb-4" role="alert">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      {summary && (
        <div className="card border shadow-none mb-4">
          <div className="card-body d-flex">
            <div className="text-center w-25">
              <div className="text-secondary-light small">Total Users</div>
              <div className="h4 mb-0">{summary.total_users || 0}</div>
            </div>
            <div className="text-center w-25 border-start ps-4">
              <div className="text-secondary-light small">Active Users</div>
              <div className="h4 mb-0 text-success">
                {users.filter(u => u.is_active).length}
              </div>
            </div>
            <div className="text-center w-25 border-start ps-4">
              <div className="text-secondary-light small">Inactive Users</div>
              <div className="h4 mb-0 text-warning">
                {users.filter(u => !u.is_active).length}
              </div>
            </div>
            <div className="text-center w-25 border-start ps-4">
              <div className="text-secondary-light small">Super Admins</div>
              <div className="h4 mb-0 text-danger">
                {users.filter(u => u.role?.toLowerCase() === 'superadmin').length}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card border shadow-none mb-4">
        <div className="card-body d-flex gap-3 align-items-center">
          <div className="flex-grow-1">
            <input
              className="form-control"
              style={{ maxWidth: '400px' }}
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="form-select w-auto"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="superadmin">Super Admin</option>
            <option value="admin">Admin</option>
            <option value="recruiter">Recruiter</option>
            <option value="company">Company</option>
            <option value="candidate">Candidate</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-secondary-light">Loading users...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="card border shadow-none">
          <div className="card-body text-center py-5">
            <h5 className="mb-2">No Users Found</h5>
            <p className="text-secondary-light mb-3">
              {searchTerm || filterRole !== 'all'
                ? 'No users match your search criteria.'
                : 'No users found in the system.'}
            </p>
            {!searchTerm && filterRole === 'all' && (
              <button
                className="btn btn-primary d-inline-flex align-items-center gap-2"
                onClick={openCreateModal}
              >
                <UserPlus size={18} />
                <span>Create First User</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="card border shadow-none">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="text-start">USER</th>
                    <th className="text-start">EMAIL</th>
                    <th className="text-center">ROLE</th>
                    <th className="text-center">STATUS</th>
                    <th className="text-center">CREATED</th>
                    <th className="text-center">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <tr key={user.id}>
                      <td className="text-start">
                        <div className="d-flex align-items-center">
                          <div className="w-40-px h-40-px bg-primary-subtle text-primary rounded-circle d-flex justify-content-center align-items-center fw-bold me-2">
                            {user.name?.charAt(0)?.toUpperCase() || user.username?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <div className="fw-medium">{user.name || user.username || 'N/A'}</div>
                            <small className="text-muted">@{user.username || 'N/A'}</small>
                          </div>
                        </div>
                      </td>
                      <td className="text-start">
                        {user.email || 'N/A'}
                      </td>
                      <td className="text-center">
                        <span className={`badge bg-${getRoleBadge(user.role)}`}>
                          {user.role || 'N/A'}
                        </span>
                      </td>
                      <td className="text-center">
                        <span className={`badge ${user.is_active ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="text-center">
                        <span className="text-muted small">
                          {user.created_at
                            ? new Date(user.created_at).toLocaleDateString()
                            : 'N/A'}
                        </span>
                      </td>
                      <td className="text-center">
                        <div className="d-flex gap-2 justify-content-center">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-warning"
                            onClick={() => openEditModal(user)}
                            title="Edit"
                          >
                            <Edit size={16} />
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

      {/* Create/Edit User Modal */}
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
          <div className="modal-dialog modal-dialog-centered modal-lg" style={{
            maxWidth: '600px',
            width: '95%',
            margin: '0 auto'
          }}>
            <div className="modal-content" style={{ borderRadius: '0.5rem' }} onClick={(e) => e.stopPropagation()}>
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">
                  {editingUser ? 'Edit User' : 'Create New User'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Username *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      placeholder="Enter username"
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Email *</label>
                    <input
                      type="email"
                      className="form-control"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Enter email"
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Role *</label>
                    <select
                      className="form-select"
                      value={formData.role}
                      onChange={(e) => handleInputChange('role', e.target.value)}
                      required
                    >
                      <option value="recruiter">Recruiter</option>
                      <option value="admin">Admin</option>
                      <option value="company">Company</option>
                      <option value="candidate">Candidate</option>
                      {editingUser && editingUser.role?.toLowerCase() === 'superadmin' && (
                        <option value="superadmin">Super Admin</option>
                      )}
                    </select>
                  </div>
                  <div className="col-md-12">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => handleInputChange('is_active', e.target.checked)}
                        id="isActive"
                      />
                      <label className="form-check-label" htmlFor="isActive">
                        Active User
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-top">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={saveUser}
                >
                  {editingUser ? 'Update' : 'Create'}
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

export default SuperAdminPanel;


