import React, { useState } from 'react'
import { Icon } from "@iconify/react/dist/iconify.js";
import { Link, useNavigate } from "react-router-dom";
import { BASE_URL, API_ENDPOINTS } from '../../config/api.config';

const Signup = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    companyName: '',
    companyWebsite: '',
    companyId: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [agreed, setAgreed] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validation
    if (!formData.name || !formData.email || !formData.password || !formData.companyName) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    if (!agreed) {
      setError('Please agree to the Terms & Conditions');
      setLoading(false);
      return;
    }

    try {
      // Call backend API
      const response = await fetch(`${BASE_URL}${API_ENDPOINTS.AUTH.SIGNUP}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          username: formData.username || formData.name,
          email: formData.email,
          password: formData.password,
          role: 'recruiter', // Default role for company signup
          company_name: formData.companyName,
          company_website: formData.companyWebsite || null,
          company_id: formData.companyId || null
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Signup successful
        setSuccess('Account created successfully! Redirecting to login...');
        console.log('Signup successful:', data);
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        // Handle error response
        setError(data.detail || 'Signup failed. Please try again.');
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError('Network error. Please check if backend is running.');
    } finally {
      setLoading(false);
    }
  };
  return(
    <section className='auth bg-base d-flex flex-wrap min-vh-100' style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div className='auth-left d-lg-block d-none flex-grow-1 position-relative' style={{ 
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.95) 0%, rgba(118, 75, 162, 0.95) 100%)',
        overflow: 'hidden'
      }}>
        <div className='d-flex align-items-center flex-column h-100 justify-content-center p-5 position-relative' style={{ zIndex: 2 }}>
          <div className='text-center text-white mb-4'>
            <h2 className='display-4 fw-bold mb-3' style={{ textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>Join Us Today!</h2>
            <p className='lead' style={{ opacity: 0.9 }}>Create your account and start your journey with AI Recruitment</p>
          </div>
          <img 
            src='/assets/images/WhatsApp Image 2025-11-14 at 09.56.23.jpeg' 
            alt='Signup' 
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
        boxShadow: '-10px 0 30px rgba(0,0,0,0.1)',
        overflowY: 'auto'
      }}>
        <div className='mx-auto w-100' style={{ maxWidth: '800px' }}>
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
            <h2 className='fw-bold mb-2' style={{ fontSize: '2rem', color: '#1a1a1a' }}>Company Signup</h2>
            <p className='text-muted mb-0' style={{ fontSize: '1rem' }}>
              Register your company! Please enter your details to get started
            </p>
          </div>
          <form onSubmit={handleSignup}>
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
            
            {success && (
              <div className='alert alert-success d-flex align-items-center mb-3 mb-md-4' role='alert' style={{ 
                borderRadius: '0.5rem',
                border: 'none',
                boxShadow: '0 2px 8px rgba(25, 135, 84, 0.2)'
              }}>
                <Icon icon='heroicons:check-circle' className='me-2' style={{ fontSize: '20px' }} />
                <span>{success}</span>
              </div>
            )}

            {/* Row 1: Full Name | Company Name */}
            <div className='row g-3 mb-3 mb-md-4'>
              <div className='col-md-6'>
                <label className='form-label fw-semibold mb-2' style={{ color: '#495057', fontSize: '0.9rem' }}>Full Name <span className='text-danger'>*</span></label>
                <div className='position-relative'>
                  <span className='position-absolute top-50 start-0 translate-middle-y ms-3' style={{ zIndex: 5, color: '#6c757d' }}>
                    <Icon icon='f7:person' style={{ fontSize: '20px' }} />
                  </span>
                  <input
                    type='text'
                    name='name'
                    value={formData.name}
                    onChange={handleInputChange}
                    className='form-control ps-5 py-3'
                    style={{ 
                      borderRadius: '0.5rem',
                      border: '1px solid #dee2e6',
                      fontSize: '0.95rem',
                      transition: 'all 0.3s ease'
                    }}
                    placeholder='Enter your full name'
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
              <div className='col-md-6'>
                <label className='form-label fw-semibold mb-2' style={{ color: '#495057', fontSize: '0.9rem' }}>Company Name <span className='text-danger'>*</span></label>
                <div className='position-relative'>
                  <span className='position-absolute top-50 start-0 translate-middle-y ms-3' style={{ zIndex: 5, color: '#6c757d' }}>
                    <Icon icon='mdi:office-building' style={{ fontSize: '20px' }} />
                  </span>
                  <input
                    type='text'
                    name='companyName'
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className='form-control ps-5 py-3'
                    style={{ 
                      borderRadius: '0.5rem',
                      border: '1px solid #dee2e6',
                      fontSize: '0.95rem',
                      transition: 'all 0.3s ease'
                    }}
                    placeholder='Enter your company name'
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
            </div>

            {/* Row 2: Company Email | Company Website */}
            <div className='row g-3 mb-3 mb-md-4'>
              <div className='col-md-6'>
                <label className='form-label fw-semibold mb-2' style={{ color: '#495057', fontSize: '0.9rem' }}>Company Email <span className='text-danger'>*</span></label>
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
                    placeholder='Enter company email'
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
              <div className='col-md-6'>
                <label className='form-label fw-semibold mb-2' style={{ color: '#495057', fontSize: '0.9rem' }}>Company Website <span className='text-muted' style={{ fontSize: '0.8rem' }}>(optional)</span></label>
                <div className='position-relative'>
                  <span className='position-absolute top-50 start-0 translate-middle-y ms-3' style={{ zIndex: 5, color: '#6c757d' }}>
                    <Icon icon='heroicons:globe-alt' style={{ fontSize: '20px' }} />
                  </span>
                  <input
                    type='text'
                    name='companyWebsite'
                    value={formData.companyWebsite}
                    onChange={handleInputChange}
                    className='form-control ps-5 py-3'
                    style={{ 
                      borderRadius: '0.5rem',
                      border: '1px solid #dee2e6',
                      fontSize: '0.95rem',
                      transition: 'all 0.3s ease'
                    }}
                    placeholder='Enter company website'
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
            </div>

            {/* Row 3: Company ID */}
            <div className='row g-3 mb-3 mb-md-4'>
              <div className='col-md-6'>
                <label className='form-label fw-semibold mb-2' style={{ color: '#495057', fontSize: '0.9rem' }}>Company ID <span className='text-muted' style={{ fontSize: '0.8rem' }}>(optional)</span></label>
                <div className='position-relative'>
                  <span className='position-absolute top-50 start-0 translate-middle-y ms-3' style={{ zIndex: 5, color: '#6c757d' }}>
                    <Icon icon='mdi:card-account-details' style={{ fontSize: '20px' }} />
                  </span>
                  <input
                    type='text'
                    name='companyId'
                    value={formData.companyId}
                    onChange={handleInputChange}
                    className='form-control ps-5 py-3'
                    style={{ 
                      borderRadius: '0.5rem',
                      border: '1px solid #dee2e6',
                      fontSize: '0.95rem',
                      transition: 'all 0.3s ease'
                    }}
                    placeholder='Enter company ID'
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
            </div>

            {/* Row 4: Password | Confirm Password */}
            <div className='row g-3 mb-3 mb-md-4'>
              <div className='col-md-6'>
                <label className='form-label fw-semibold mb-2' style={{ color: '#495057', fontSize: '0.9rem' }}>Password <span className='text-danger'>*</span></label>
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
                    placeholder='Enter password'
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
              <div className='col-md-6'>
                <label className='form-label fw-semibold mb-2' style={{ color: '#495057', fontSize: '0.9rem' }}>Confirm Password <span className='text-danger'>*</span></label>
                <div className='position-relative'>
                  <span className='position-absolute top-50 start-0 translate-middle-y ms-3' style={{ zIndex: 5, color: '#6c757d' }}>
                    <Icon icon='solar:lock-password-outline' style={{ fontSize: '20px' }} />
                  </span>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name='confirmPassword'
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className='form-control ps-5 pe-5 py-3'
                    style={{ 
                      borderRadius: '0.5rem',
                      border: '1px solid #dee2e6',
                      fontSize: '0.95rem',
                      transition: 'all 0.3s ease'
                    }}
                    id='confirm-password'
                    placeholder='Re-enter password'
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
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{ 
                      cursor: 'pointer', 
                      zIndex: 10,
                      color: '#6c757d',
                      transition: 'color 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.color = '#3b82f6'}
                    onMouseLeave={(e) => e.target.style.color = '#6c757d'}
                  >
                    <Icon icon={showConfirmPassword ? 'solar:eye-closed-outline' : 'solar:eye-outline'} style={{ fontSize: '20px' }} />
                  </span>
                </div>
              </div>
            </div>

            <div className='mb-4 mb-md-5'>
              <div className='form-check d-flex align-items-start'>
                <input
                  className='form-check-input mt-1'
                  type='checkbox'
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  id='condition'
                  style={{ 
                    cursor: 'pointer',
                    width: '18px',
                    height: '18px',
                    marginTop: '4px'
                  }}
                />
                <label
                  className='form-check-label ms-2'
                  htmlFor='condition'
                  style={{ 
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    color: '#495057',
                    lineHeight: '1.5'
                  }}
                >
                  By creating an account means you agree to the{" "}
                  <Link to='#' className='text-primary fw-semibold text-decoration-none' style={{ transition: 'color 0.3s ease' }} onMouseEnter={(e) => e.target.style.color = '#2563eb'} onMouseLeave={(e) => e.target.style.color = '#3b82f6'}>
                    Terms &amp; Conditions
                  </Link>
                  {" "}and our{" "}
                  <Link to='#' className='text-primary fw-semibold text-decoration-none' style={{ transition: 'color 0.3s ease' }} onMouseEnter={(e) => e.target.style.color = '#2563eb'} onMouseLeave={(e) => e.target.style.color = '#3b82f6'}>
                    Privacy Policy
                  </Link>
                </label>
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
                  Creating account...
                </>
              ) : (
                'Sign Up'
              )}
            </button>

            <div className='position-relative my-4'>
              <hr className='my-0' />
              <span className='position-absolute top-50 start-50 translate-middle bg-white px-3 text-muted' style={{ fontSize: '0.85rem' }}>
                Or sign up with
              </span>
            </div>

            <div className='text-center'>
              <p className='mb-0 text-muted' style={{ fontSize: '0.95rem' }}>
                Already have an account?{" "}
                <Link 
                  to='/login' 
                  className='text-primary fw-bold text-decoration-none'
                  style={{ 
                    transition: 'color 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#2563eb'}
                  onMouseLeave={(e) => e.target.style.color = '#3b82f6'}
                >
                  Sign In
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  ) ; 
}

export default Signup