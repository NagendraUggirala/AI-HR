import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../../utils/auth';

const SuperAdminLayout = ({ children }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/super-admin/login');
  };

  return (
    <div className="min-vh-100 bg-light">
      <header className="bg-white border-bottom shadow-sm">
        <div className="container-fluid d-flex align-items-center justify-content-between py-3">
          <div className="d-flex align-items-center gap-3">
            <Link to="/" className="text-decoration-none">
              <img src="/assets/images/168X40.jpeg" alt="logo" style={{ height: '32px' }} />
            </Link>
            <div>
              <div className="fw-semibold text-dark">Super Admin Portal</div>
              <small className="text-muted">Manage system-wide recruitment access</small>
            </div>
          </div>
          <div className="d-flex gap-2">
            <button type="button" className="btn btn-danger btn-sm" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="container-fluid py-4">
        {children}
      </main>
    </div>
  );
};

export default SuperAdminLayout;

