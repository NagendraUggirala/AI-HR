/* eslint-disable react/prop-types */
import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';

const CandidateDashboardLayout = ({ children }) => {
  const [sidebarActive, setSidebarActive] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();

  const candidateData = {
    name: localStorage.getItem('candidateName') || 'Candidate',
    email: localStorage.getItem('userEmail') || 'candidate@example.com'
  };

  const navItems = [
    { id: 'dashboard', icon: 'heroicons:home', label: 'Dashboard', path: '/candidate/dashboard' },
    { id: 'jobs', icon: 'heroicons:magnifying-glass', label: 'Job Search', path: '/candidate/jobs' },
    { id: 'applications', icon: 'heroicons:document-text', label: 'Applications', path: '/candidate/applications' },
    { id: 'profile', icon: 'heroicons:user', label: 'Profile', path: '/candidate/profile' },
    { id: 'settings', icon: 'icon-park-outline:setting-two', label: 'Settings', path: '/candidate/settings' }
  ];

  const sidebarControl = () => {
    setSidebarActive(!sidebarActive);
  };

  const mobileMenuControl = () => {
    setMobileMenu(!mobileMenu);
  };

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('candidateName');
    navigate('/candidate/login');
  };

  return (
    <>
      <section className={mobileMenu ? "overlay active" : "overlay"}>
        {/* Sidebar */}
        <aside
          className={
            sidebarActive
              ? "sidebar active"
              : mobileMenu
              ? "sidebar sidebar-open"
              : "sidebar"
          }
        >
          <button
            onClick={mobileMenuControl}
            type='button'
            className='sidebar-close-btn'
          >
            <Icon icon='radix-icons:cross-2' />
          </button>
          
          {/* Logo */}
          <div className='p-24 border-bottom'>
            <Link to='/candidate/dashboard' className='d-flex align-items-center gap-2'>
              <img src='/assets/images/168X40.jpeg' alt='Logo' style={{ width: '168px', height: '40px', objectFit: 'contain' }} />
            </Link>
          </div>

          {/* Navigation */}
          <nav className='sidebar-menu-area p-16'>
            <ul className='sidebar-menu' id='sidebar-menu'>
              {navItems.map((item) => (
                <li key={item.id}>
                  <NavLink
                    to={item.path}
                    className={(navData) => (navData.isActive ? "active-page" : "")}
                  >
                    <Icon icon={item.icon} className='menu-icon' />
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className={sidebarActive ? "dashboard-main active" : "dashboard-main"}>
          {/* Header/Topbar */}
          <header className='navbar-header bg-base'>
            <div className='row align-items-center justify-content-between'>
              <div className='col-auto'>
                <div className='d-flex flex-wrap align-items-center gap-4'>
                  <button
                    type='button'
                    className='sidebar-toggle'
                    onClick={sidebarControl}
                  >
                    {sidebarActive ? (
                      <Icon
                        icon='iconoir:arrow-right'
                        className='icon text-2xl non-active'
                      />
                    ) : (
                      <Icon
                        icon='heroicons:bars-3-solid'
                        className='icon text-2xl non-active'
                      />
                    )}
                  </button>
                  <button
                    onClick={mobileMenuControl}
                    type='button'
                    className='sidebar-mobile-toggle'
                  >
                    <Icon icon='heroicons:bars-3-solid' className='icon' />
                  </button>
                  
                  {/* Search Bar */}
                  <form className='navbar-search'>
                    <input
                      type='text'
                      name='search'
                      placeholder='Search jobs...'
                    />
                    <Icon icon='ion:search-outline' className='icon' />
                  </form>
                </div>
              </div>

              <div className='col-auto'>
                <div className='d-flex flex-wrap align-items-center gap-3'>
                  {/* Notifications */}
                  <div className='dropdown'>
                    <button
                      className='has-indicator w-40-px h-40-px bg-neutral-200 rounded-circle d-flex justify-content-center align-items-center'
                      type='button'
                      data-bs-toggle='dropdown'
                    >
                      <Icon icon='iconoir:bell' className='text-primary-light text-xl' />
                    </button>
                    <div className='dropdown-menu to-top dropdown-menu-lg p-0'>
                      <div className='m-16 py-12 px-16 radius-8 bg-primary-50 mb-16 d-flex align-items-center justify-content-between gap-2'>
                        <div>
                          <h6 className='text-lg text-primary-light fw-semibold mb-0'>
                            Notifications
                          </h6>
                        </div>
                        <span className='text-primary-600 fw-semibold text-lg w-40-px h-40-px rounded-circle bg-base d-flex justify-content-center align-items-center'>
                          3
                        </span>
                      </div>
                      <div className='max-h-400-px overflow-y-auto scroll-sm pe-4'>
                        <Link
                          to='#'
                          className='px-24 py-12 d-flex align-items-start gap-3 mb-2 justify-content-between'
                        >
                          <div className='text-black hover-bg-transparent hover-text-primary d-flex align-items-center gap-3'>
                            <span className='w-44-px h-44-px bg-success-subtle text-success-main rounded-circle d-flex justify-content-center align-items-center flex-shrink-0'>
                              <Icon icon='bitcoin-icons:verify-outline' className='icon text-xxl' />
                            </span>
                            <div>
                              <h6 className='text-md fw-semibold mb-4'>
                                Application Update
                              </h6>
                              <p className='mb-0 text-sm text-secondary-light text-w-200-px'>
                                Your application has been reviewed
                              </p>
                            </div>
                          </div>
                          <span className='text-sm text-secondary-light flex-shrink-0'>
                            10 mins ago
                          </span>
                        </Link>
                      </div>
                      <div className='text-center py-12 px-16'>
                        <Link
                          to='#'
                          className='text-primary-600 fw-semibold text-md'
                        >
                          See All Notifications
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Profile Dropdown */}
                  <div className='dropdown'>
                    <button
                      className='d-flex justify-content-center align-items-center rounded-circle'
                      type='button'
                      data-bs-toggle='dropdown'
                      onClick={() => setShowProfileMenu(!showProfileMenu)}
                    >
                      <div className='d-flex align-items-center gap-2'>
                        <div className='w-40-px h-40-px bg-primary-600 rounded-circle d-flex align-items-center justify-content-center text-white fw-semibold'>
                          {candidateData.name.charAt(0).toUpperCase()}
                        </div>
                        <span className='fw-medium text-gray-700 d-none d-md-inline'>
                          {candidateData.name.split(' ')[0]}
                        </span>
                        <Icon icon='heroicons:chevron-down' className='text-gray-500' />
                      </div>
                    </button>
                    <div className='dropdown-menu to-top dropdown-menu-sm'>
                      <div className='py-12 px-16 radius-8 bg-primary-50 mb-16 d-flex align-items-center justify-content-between gap-2'>
                        <div>
                          <h6 className='text-lg text-primary-light fw-semibold mb-2'>
                            {candidateData.name}
                          </h6>
                          <span className='text-secondary-light fw-medium text-sm'>
                            {candidateData.email}
                          </span>
                        </div>
                        <button
                          type='button'
                          className='hover-text-danger'
                          onClick={() => setShowProfileMenu(false)}
                        >
                          <Icon icon='radix-icons:cross-1' className='icon text-xl' />
                        </button>
                      </div>
                      <ul className='to-top-list'>
                        <li>
                          <Link
                            className='dropdown-item text-black px-0 py-8 hover-bg-transparent hover-text-primary d-flex align-items-center gap-3'
                            to='/candidate/profile'
                          >
                            <Icon icon='solar:user-linear' className='icon text-xl' />
                            Edit Profile
                          </Link>
                        </li>
                        <li>
                          <Link
                            className='dropdown-item text-black px-0 py-8 hover-bg-transparent hover-text-primary d-flex align-items-center gap-3'
                            to='/candidate/settings'
                            
                          >
                            <Icon icon='icon-park-outline:setting-two' className='icon text-xl' />
                            Settings
                          </Link>
                        </li>
                        <li>
                          <hr className='my-2' />
                        </li>
                        <li>
                          <button
                            className='dropdown-item text-black px-0 py-8 hover-bg-transparent hover-text-danger d-flex align-items-center gap-3 border-0 bg-transparent w-100'
                            onClick={handleLogout}
                            style={{ textAlign: 'left', cursor: 'pointer' }}
                          >
                            <Icon icon='lucide:power' className='icon text-xl' />
                            Logout
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Dashboard Body */}
          <div className='dashboard-main-body'>{children}</div>

          {/* Footer */}
          <footer className='d-footer'>
            <div className='row align-items-center justify-content-between'>
              <div className='col-auto'>
                <p className='mb-0'>© 2025 Candidate Portal. All Rights Reserved.</p>
              </div>
              <div className='col-auto'>
                <p className='mb-0'>
                  Need help? <Link to='/candidate/support' className='text-primary-600'>Contact Support</Link>
                </p>
              </div>
            </div>
          </footer>
        </main>
      </section>
    </>
  );
};

export default CandidateDashboardLayout;

