import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BASE_URL, API_ENDPOINTS } from '../../config/api.config';

const SuperAdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${BASE_URL}${API_ENDPOINTS.AUTH.LOGIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.detail || 'Invalid email or password');
        setLoading(false);
        return;
      }

      if (data.role !== 'superadmin') {
        setError('Super admin access is required for this area.');
        setLoading(false);
        return;
      }

      localStorage.setItem('token', data.access_token);
      localStorage.setItem('refreshToken', data.refresh_token);
      localStorage.setItem('userRole', data.role);
      localStorage.setItem('userEmail', data.email);

      setLoading(false);
      navigate('/super-admin');
    } catch (err) {
      console.error('Super admin login failed:', err);
      setError('Network error. Please make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-vh-100 d-flex align-items-center bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-5">
            <div className="card shadow-sm border-0 rounded-4">
              <div className="card-body p-4">
                <div className="mb-4 text-center">
                  <h1 className="h4 fw-bold mb-1">Super Admin Sign In</h1>
                  <p className="text-muted mb-0">Use your super admin credentials to access the control panel.</p>
                </div>

                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="superadminEmail" className="form-label">
                      Email Address
                    </label>
                    <input
                      id="superadminEmail"
                      type="email"
                      className="form-control"
                      placeholder="superadmin@example.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="superadminPassword" className="form-label">
                      Password
                    </label>
                    <input
                      id="superadminPassword"
                      type="password"
                      className="form-control"
                      placeholder="Enter password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      required
                    />
                  </div>

                  <div className="d-grid gap-2">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Signing in...
                        </>
                      ) : (
                        'Sign In'
                      )}
                    </button>
                  </div>
                </form>

                <div className="mt-4 text-center">
                  <p className="mb-2">
                    Not a super admin?{' '}
                    <Link to="/login" className="text-decoration-none fw-medium">
                      Go to recruiter login
                    </Link>
                  </p>
                  <Link to="/" className="text-muted small">
                    Back to home
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SuperAdminLogin;

