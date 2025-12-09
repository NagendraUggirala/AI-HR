import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { BASE_URL, API_ENDPOINTS } from '../../config/api.config';

const RecruiterProfile = () => {
  const [profileData, setProfileData] = useState({
    name: '',
    username: '',
    email: '',
    role: '',
    company_name: '',
    company_website: '',
    company_id: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      setError('Please login to view profile');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}${API_ENDPOINTS.AUTH.CURRENT_USER}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProfileData(data);
        setError(null);
      } else {
        setError('Failed to fetch profile data');
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
      setError('Network error. Please check if backend is running.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <Icon icon="heroicons:exclamation-circle" className="me-2" />
        {error}
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0 d-flex align-items-center">
                <Icon icon="solar:user-linear" className="me-2" />
                My Profile
              </h4>
            </div>
            <div className="card-body p-4">
              <div className="row">
                {/* Personal Information */}
                <div className="col-12 col-md-6 mb-4">
                  <h5 className="text-primary mb-3 d-flex align-items-center">
                    <Icon icon="f7:person" className="me-2" />
                    Personal Information
                  </h5>
                  <div className="mb-3">
                    <label className="form-label fw-semibold text-secondary">Full Name</label>
                    <div className="form-control bg-light border-0">
                      {profileData.name || 'Not provided'}
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold text-secondary">Username</label>
                    <div className="form-control bg-light border-0">
                      {profileData.username || 'Not provided'}
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold text-secondary">Email Address</label>
                    <div className="form-control bg-light border-0">
                      {profileData.email || 'Not provided'}
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold text-secondary">Role</label>
                    <div className="form-control bg-light border-0">
                      <span className="badge bg-primary">{profileData.role || 'Not assigned'}</span>
                    </div>
                  </div>
                </div>

                {/* Company Information */}
                <div className="col-12 col-md-6 mb-4">
                  <h5 className="text-primary mb-3 d-flex align-items-center">
                    <Icon icon="mdi:office-building" className="me-2" />
                    Company Information
                  </h5>
                  <div className="mb-3">
                    <label className="form-label fw-semibold text-secondary">Company Name</label>
                    <div className="form-control bg-light border-0">
                      {profileData.company_name || 'Not provided'}
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold text-secondary">Company Website</label>
                    <div className="form-control bg-light border-0">
                      {profileData.company_website ? (
                        <a 
                          href={profileData.company_website.startsWith('http') ? profileData.company_website : `https://${profileData.company_website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary text-decoration-none"
                        >
                          {profileData.company_website}
                          <Icon icon="heroicons:arrow-top-right-on-square" className="ms-1" style={{ fontSize: '14px' }} />
                        </a>
                      ) : (
                        'Not provided'
                      )}
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold text-secondary">Company ID</label>
                    <div className="form-control bg-light border-0">
                      {profileData.company_id || 'Not provided'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Status */}
              <div className="row mt-4">
                <div className="col-12">
                  <div className="alert alert-info d-flex align-items-center mb-0">
                    <div>
                      <strong>Account Status:</strong> Active
                      <br />
                      <small>Your account is active and you can access all features.</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruiterProfile;

