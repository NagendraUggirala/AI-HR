import React, { useState } from 'react';
import { Icon } from "@iconify/react/dist/iconify.js";
import { Link, useNavigate } from "react-router-dom";
import { BASE_URL, API_ENDPOINTS } from '../../config/api.config';

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
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
          password: formData.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Store authentication data
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('refreshToken', data.refresh_token);
        localStorage.setItem('userRole', data.role);
        localStorage.setItem('userEmail', data.email);
        
        console.log('Login successful:', data);
        
        // Normalize role/email and navigate accordingly
        const role = data.role || (data.user && data.user.role);
        const email = data.email || (data.user && data.user.email) || formData.email;

        if (role === 'superadmin' || email === 'superadmin@example.com') {
          navigate('/super-admin', { replace: true });
        } else if (role === 'recruiter' || role === 'company' || role === 'admin') {
          navigate('/dashboard', { replace: true });
        } else if (role === 'candidate') {
          navigate('/candidate/dashboard', { replace: true });
        } else {
          // default fallback
          navigate('/dashboard', { replace: true });
        }
      } else {
        // Handle error response
        setError(data.detail || 'Invalid email or password');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Network error. Please check if backend is running.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <section className='auth bg-base d-flex flex-wrap min-vh-100' style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div className='auth-left d-lg-block d-none flex-grow-1 position-relative' style={{ 
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.95) 0%, rgba(118, 75, 162, 0.95) 100%)',
        overflow: 'hidden'
      }}>
        <div className='d-flex align-items-center flex-column h-100 justify-content-center p-5 position-relative' style={{ zIndex: 2 }}>
          <div className='text-center text-white mb-4'>
            <h4 className='display-4 fw-bold mb-3' style={{ textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>Welcome Back!</h4>
            <p className='lead' style={{ opacity: 0.9 }}>Sign in to continue your journey with AI Recruitment</p>
          </div>
          <img 
            src='/assets/images/WhatsApp Image 2025-11-14 at 09.56.23.jpeg' 
            alt='Login' 
            className='img-fluid login-image rounded-4 shadow-lg' 
            style={{ 
              maxWidth: '600px', 
              width: '100%',
              borderRadius: '1rem',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
            }}
          />
        </div>
        {/* Decorative elements */}
        <div className='position-absolute' style={{ 
          top: '-100px', 
          right: '-100px', 
          width: '400px', 
          height: '400px', 
          background: 'rgba(255,255,255,0.1)', 
          borderRadius: '50%',
          zIndex: 1
        }}></div>
        <div className='position-absolute' style={{ 
          bottom: '-150px', 
          left: '-150px', 
          width: '500px', 
          height: '500px', 
          background: 'rgba(255,255,255,0.08)', 
          borderRadius: '50%',
          zIndex: 1
        }}></div>
      </div>
      <div className='auth-right py-5 px-4 px-lg-5 d-flex flex-column justify-content-center' style={{ 
        backgroundColor: '#ffffff',
        minHeight: '100vh',
        boxShadow: '-10px 0 30px rgba(0,0,0,0.1)'
      }}>
        <div className='max-w-464-px mx-auto w-100'>
          <div className='mb-4 mb-md-5'>
            <div className='d-flex align-items-center gap-3 mb-3'>
              <img 
                src='/assets/images/168X40.jpeg' 
                alt='Logo' 
                className='img-fluid' 
                style={{ height: '40px', width: 'auto' }}
              />
              <span className='text-primary fw-bold fs-5'>AI Recruitment</span>
            </div>
            <h4 className='fw-bold mb-2' style={{ fontSize: '2rem', color: '#1a1a1a' }}>Sign In to your Account</h4>
            <p className='text-muted mb-0' style={{ fontSize: '1rem' }}>
              Welcome back! Please enter your details to continue
            </p>
          </div>
          <form onSubmit={handleSignIn}>
            <div className='mb-3 mb-md-4'>
              <label className='form-label fw-semibold mb-2' style={{ color: '#495057', fontSize: '0.9rem' }}>Email Address</label>
              <div className='position-relative'>
                <span className='position-absolute top-50 start-0 translate-middle-y ms-3' style={{ zIndex: 5, color: '#6c757d' }}>
                  <Icon icon='mage:email' style={{ fontSize: '20px' }} />
                </span>
                <input
                  type='email'
                  name='email'
                  value={formData.email}
                  onChange={handleInputChange}
                  className='form-control ps-5 py-3'
                  style={{ 
                    borderRadius: '0.5rem',
                    border: '1px solid #dee2e6',
                    fontSize: '0.95rem',
                    transition: 'all 0.3s ease'
                  }}
                  placeholder='Enter your email'
                  required
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6';
                    e.target.style.boxShadow = '0 0 0 0.2rem rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#dee2e6';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>
            <div className='mb-3 mb-md-4'>
              <label className='form-label fw-semibold mb-2' style={{ color: '#495057', fontSize: '0.9rem' }}>Password</label>
              <div className='position-relative'>
                <span className='position-absolute top-50 start-0 translate-middle-y ms-3' style={{ zIndex: 5, color: '#6c757d' }}>
                  <Icon icon='solar:lock-password-outline' style={{ fontSize: '20px' }} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name='password'
                  value={formData.password}
                  onChange={handleInputChange}
                  className='form-control ps-5 pe-5 py-3'
                  style={{ 
                    borderRadius: '0.5rem',
                    border: '1px solid #dee2e6',
                    fontSize: '0.95rem',
                    transition: 'all 0.3s ease'
                  }}
                  id='your-password'
                  placeholder='Enter your password'
                  required
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6';
                    e.target.style.boxShadow = '0 0 0 0.2rem rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#dee2e6';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <span
                  className='position-absolute top-50 end-0 translate-middle-y me-3'
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ 
                    cursor: 'pointer', 
                    zIndex: 10,
                    color: '#6c757d',
                    transition: 'color 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#3b82f6'}
                  onMouseLeave={(e) => e.target.style.color = '#6c757d'}
                >
                  <Icon icon={showPassword ? 'solar:eye-closed-outline' : 'solar:eye-outline'} style={{ fontSize: '20px' }} />
                </span>
              </div>
            </div>

            {error && (
              <div className='alert alert-danger d-flex align-items-center mb-3 mb-md-4' role='alert' style={{ 
                borderRadius: '0.5rem',
                border: 'none',
                boxShadow: '0 2px 8px rgba(220, 53, 69, 0.2)'
              }}>
                <Icon icon='heroicons:exclamation-circle' className='me-2' style={{ fontSize: '20px' }} />
                <span>{error}</span>
              </div>
            )}
            
            <div className='mb-4 mb-md-5'>
              <div className='d-flex justify-content-between align-items-center flex-wrap gap-2'>
                <div className='form-check d-flex align-items-center'>
                  <input
                    className='form-check-input'
                    type='checkbox'
                    defaultValue=''
                    id='remeber'
                    style={{ 
                      cursor: 'pointer',
                      width: '18px',
                      height: '18px',
                      marginTop: '2px'
                    }}
                  />
                  <label className='form-check-label ms-2' htmlFor='remeber' style={{ 
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    color: '#495057'
                  }}>
                    Remember me
                  </label>
                </div>
                <Link 
                  to='/ForgotPassword' 
                  className='text-primary fw-semibold text-decoration-none'
                  style={{ 
                    fontSize: '0.9rem',
                    transition: 'color 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#2563eb'}
                  onMouseLeave={(e) => e.target.style.color = '#3b82f6'}
                >
                  Forgot Password?
                </Link>
              </div>
            </div>
            <button
              type='submit'
              className='btn btn-primary w-100 py-3 mb-4'
              style={{ 
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                transition: 'all 0.3s ease',
                border: 'none'
              }}
              onClick={handleSignIn}
              disabled={loading}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
                }
              }}
            >
              {loading ? (
                <>
                  <span className='spinner-border spinner-border-sm me-2' role='status' aria-hidden='true'></span>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
            <div className='position-relative my-4'>
              <hr className='my-0' />
              <span className='position-absolute top-50 start-50 translate-middle bg-white px-3 text-muted' style={{ fontSize: '0.85rem' }}>
                Or sign in with
              </span>
            </div>
            <div className='text-center'>
              <p className='mb-0 text-muted' style={{ fontSize: '0.95rem' }}>
                Don't have an account?{" "}
                <Link 
                  to='/signup' 
                  className='text-primary fw-bold text-decoration-none'
                  style={{ 
                    transition: 'color 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#2563eb'}
                  onMouseLeave={(e) => e.target.style.color = '#3b82f6'}
                >
                  Sign Up
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Login;
