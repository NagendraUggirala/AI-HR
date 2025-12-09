import React from 'react';
import { Icon } from '@iconify/react';

const Settings = () => {
  return (
    <div className='container-fluid'>
      <div className='row justify-content-center align-items-center' style={{ minHeight: '70vh' }}>
        <div className='col-12 col-md-8 col-lg-6'>
          <div className='card border-0 shadow-lg'>
            <div className='card-body text-center p-40'>
              {/* Icon */}
              <div className='mb-24'>
                <div className='w-120-px h-120-px bg-primary-50 rounded-circle d-flex align-items-center justify-content-center mx-auto'>
                  <Icon 
                    icon='icon-park-outline:setting-two' 
                    className='text-primary-600' 
                    style={{ fontSize: '64px' }}
                  />
                </div>
              </div>

              {/* Title */}
              <h2 className='mb-16 text-primary-600 fw-bold'>Settings</h2>
              
              {/* Coming Soon Badge */}
              <div className='mb-24'>
                <span className='badge bg-warning-600 text-white px-24 py-8 text-lg fw-semibold rounded-pill'>
                  Coming Soon
                </span>
              </div>

              {/* Description */}
              <p className='text-secondary-light text-lg mb-32'>
                We're working hard to bring you an amazing settings experience. 
                This feature will be available soon with comprehensive configuration options.
              </p>

              {/* Features List */}
              <div className='row g-3 mb-32'>
                <div className='col-12 col-md-6'>
                  <div className='d-flex align-items-center gap-2 justify-content-center justify-content-md-start'>
                    <Icon icon='heroicons:check-circle' className='text-success-600' style={{ fontSize: '24px' }} />
                    <span className='text-secondary-light'>Profile Settings</span>
                  </div>
                </div>
                <div className='col-12 col-md-6'>
                  <div className='d-flex align-items-center gap-2 justify-content-center justify-content-md-start'>
                    <Icon icon='heroicons:check-circle' className='text-success-600' style={{ fontSize: '24px' }} />
                    <span className='text-secondary-light'>Notification Preferences</span>
                  </div>
                </div>
                <div className='col-12 col-md-6'>
                  <div className='d-flex align-items-center gap-2 justify-content-center justify-content-md-start'>
                    <Icon icon='heroicons:check-circle' className='text-success-600' style={{ fontSize: '24px' }} />
                    <span className='text-secondary-light'>Security Options</span>
                  </div>
                </div>
                <div className='col-12 col-md-6'>
                  <div className='d-flex align-items-center gap-2 justify-content-center justify-content-md-start'>
                    <Icon icon='heroicons:check-circle' className='text-success-600' style={{ fontSize: '24px' }} />
                    <span className='text-secondary-light'>Integration Settings</span>
                  </div>
                </div>
              </div>

              {/* Countdown or Info */}
              <div className='alert alert-info d-flex align-items-center justify-content-center gap-2 mb-0'>
                <Icon icon='heroicons:information-circle' style={{ fontSize: '20px' }} />
                <span>Stay tuned for updates!</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
