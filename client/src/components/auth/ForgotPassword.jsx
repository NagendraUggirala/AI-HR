import { Icon } from "@iconify/react/dist/iconify.js";
 
import { Link } from "react-router-dom";
 
const ForgotPassword = () => {
  return (
    <>
      <section className='auth forgot-password-page bg-base d-flex flex-wrap min-vh-100' style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className='auth-left d-lg-block d-none flex-grow-1 position-relative' style={{ 
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.95) 0%, rgba(118, 75, 162, 0.95) 100%)',
          overflow: 'hidden'
        }}>
          <div className='d-flex align-items-center flex-column h-100 justify-content-center p-5 position-relative' style={{ zIndex: 2 }}>
            <div className='text-center text-white mb-4'>
              <h2 className='display-4 fw-bold mb-3' style={{ textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>Reset Password</h2>
              <p className='lead' style={{ opacity: 0.9 }}>We'll help you get back into your account</p>
            </div>
            <img
              src='/assets/images/WhatsApp Image 2025-11-14 at 09.56.23.jpeg'
              alt='Forgot Password'
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
              <h2 className='fw-bold mb-2' style={{ fontSize: '2rem', color: '#1a1a1a' }}>Forgot Password</h2>
              <p className='text-muted mb-0' style={{ fontSize: '1rem' }}>
                Enter the email address associated with your account and we will send you a link to reset your password.
              </p>
            </div>
            <form action='#'>
              <div className='mb-4 mb-md-5'>
                <label className='form-label fw-semibold mb-2' style={{ color: '#495057', fontSize: '0.9rem' }}>Email Address</label>
                <div className='position-relative'>
                  <span className='position-absolute top-50 start-0 translate-middle-y ms-3' style={{ zIndex: 5, color: '#6c757d' }}>
                    <Icon icon='mage:email' style={{ fontSize: '20px' }} />
                  </span>
                  <input
                    type='email'
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
              <button
                type='button'
                className='btn btn-primary w-100 py-3 mb-4'
                style={{ 
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                  transition: 'all 0.3s ease',
                  border: 'none'
                }}
                data-bs-toggle='modal'
                data-bs-target='#exampleModal'
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
                }}
              >
                Continue
              </button>
              <div className='text-center mb-3'>
                <Link 
                  to='/login' 
                  className='text-primary fw-semibold text-decoration-none'
                  style={{ 
                    fontSize: '0.95rem',
                    transition: 'color 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#2563eb'}
                  onMouseLeave={(e) => e.target.style.color = '#3b82f6'}
                >
                  Back to Sign In
                </Link>
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
      {/* Modal */}
      <div
        className='modal fade'
        id='exampleModal'
        tabIndex={-1}
        aria-hidden='true'
      >
        <div className='modal-dialog modal-dialog-centered'>
          <div className='modal-content' style={{ borderRadius: '0.5rem', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.15)' }}>
            <div className='modal-body p-4 p-md-5 text-center'>
              <div className='mb-4'>
                <div className='d-inline-flex align-items-center justify-content-center rounded-circle bg-primary-subtle' style={{ width: '80px', height: '80px' }}>
                  <Icon icon='heroicons:envelope' style={{ fontSize: '40px', color: '#3b82f6' }} />
                </div>
              </div>
              <h5 className='fw-bold mb-3' style={{ color: '#1a1a1a' }}>Verify your Email</h5>
              <p className='text-muted mb-4' style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
                Thank you, check your email for instructions to reset your password
              </p>
              <button
                type='button'
                className='btn btn-primary w-100 py-3 mb-3'
                style={{ 
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                  transition: 'all 0.3s ease',
                  border: 'none'
                }}
                data-bs-dismiss='modal'
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
                }}
              >
                Close
              </button>
              <div className='mt-3'>
                <p className='mb-0 text-muted' style={{ fontSize: '0.9rem' }}>
                  Don't receive an email?{" "}
                  <Link 
                    to='/resend' 
                    className='text-primary fw-semibold text-decoration-none'
                    style={{ 
                      transition: 'color 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.color = '#2563eb'}
                    onMouseLeave={(e) => e.target.style.color = '#3b82f6'}
                  >
                    Resend
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
 
export default ForgotPassword;