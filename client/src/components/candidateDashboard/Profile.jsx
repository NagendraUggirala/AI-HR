import React, { useState } from 'react';
import { Icon } from '@iconify/react';

export default function Profile() {
  const [profile, setProfile] = useState({
    name: 'Nagendra Uggirala',
    email: 'nagendra@gmail.com',
    phone: '+91 98765 43210',
    location: 'Hyderabad, India',
    portfolio: 'https://github.com/nagendra',
    linkedin: 'https://linkedin.com/in/nagendra',
    education: {
      degree: 'B.Tech – Computer Science',
      college: 'VIT University',
      graduationYear: '2023'
    },
    workHistory: {
      company: 'Veritech Software',
      role: 'Web Development Intern',
      duration: 'Jan 2024 – Apr 2024',
      description: 'Developed responsive web apps using React.js and Python backend.'
    },
    skills: ['React.js', 'JavaScript', 'Python', 'SQL'],
    resume: 'nagendra_resume.pdf'
  });

  const [showToast, setShowToast] = useState(false);
  
  const availableSkills = ['React.js', 'JavaScript', 'Python', 'SQL', 'HTML', 'CSS', 'Tailwind', 'Node.js', 'MongoDB', 'TypeScript', 'Git', 'Docker'];

  const handleInputChange = (section, field, value) => {
    if (section) {
      setProfile(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    } else {
      setProfile(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const addSkill = (skill) => {
    if (!profile.skills.includes(skill)) {
      setProfile(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }));
    }
  };

  const removeSkill = (skillToRemove) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skillToRemove)
    }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfile(prev => ({
        ...prev,
        resume: file.name
      }));
    }
  };

  const handleSaveProfile = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const calculateCompleteness = () => {
    let filled = 0;
    let total = 8;
    
    if (profile.name) filled++;
    if (profile.email) filled++;
    if (profile.phone) filled++;
    if (profile.location) filled++;
    if (profile.education.degree) filled++;
    if (profile.workHistory.company) filled++;
    if (profile.skills.length > 0) filled++;
    if (profile.resume) filled++;
    
    return Math.round((filled / total) * 100);
  };

  const completeness = calculateCompleteness();

  return (
    <div className='dashboard-main-body'>
      {/* Success Modal */}
      {showToast && (
        <div className='position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center z-3' style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className='bg-white rounded-lg shadow-lg p-24 text-center' style={{ maxWidth: '400px', width: '90%' }}>
            <div className='mb-16'>
              <div className='w-64-px h-64-px bg-success-600 rounded-circle mx-auto mb-12 d-flex align-items-center justify-content-center'>
                <Icon icon='heroicons:check' className='text-white' style={{ fontSize: '24px' }} />
              </div>
              <h3 className='text-xl fw-bold text-gray-900 mb-8'>Profile Updated Successfully!</h3>
              <p className='text-secondary-light mb-0'>Your profile has been saved and updated.</p>
            </div>
            <button 
              onClick={() => setShowToast(false)}
              className='btn btn-primary px-20 py-8'
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className='bg-white border-bottom shadow-sm mb-24'>
        <div className='container-fluid px-24 py-20'>
          <div className='row align-items-center justify-content-between'>
            <div className='col-12 col-md-7'>
              <h1 className='text-2xl  text-gray-800 mb-4'>
                My Profile
              </h1>
              <p className='text-secondary-light mb-0'>Update your details, skills, and resume to get matched with suitable jobs.</p>
            </div>
            <div className='col-12 col-md-5 text-md-end mt-3 mt-md-0'>
              <div className='text-sm text-secondary-light mb-4'>Profile Completeness</div>
              <div className='d-flex align-items-center gap-3 justify-content-md-end'>
                <div className='progress' style={{ width: '128px', height: '8px' }}>
                  <div 
                    className='progress-bar bg-gradient-primary'
                    style={{ width: `${completeness}%` }}
                  />
                </div>
                <span className='text-lg fw-bold text-primary-600'>{completeness}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='container-fluid px-24'>
        <div className='row g-4'>
          {/* Left Column - Form */}
          <div className='col-12 col-lg-8'>
            
            {/* Personal Information */}
            <div className='card border-0 shadow-sm mb-20'>
              <div className='card-body p-24'>
                <h2 className='text-xl fw-bold text-gray-900 mb-16 d-flex align-items-center gap-2'>
                  <Icon icon='heroicons:user' className='text-primary-600' style={{ fontSize: '20px' }} />
                  Personal Information
                </h2>
                <div className='row g-3'>
                  <div className='col-12 col-md-6'>
                    <label className='form-label text-sm fw-medium text-gray-700'>Full Name</label>
                    <input
                      type='text'
                      value={profile.name}
                      onChange={(e) => handleInputChange(null, 'name', e.target.value)}
                      className='form-control'
                    />
                  </div>
                  <div className='col-12 col-md-6'>
                    <label className='form-label text-sm fw-medium text-gray-700'>Email</label>
                    <div className='position-relative'>
                      <Icon icon='heroicons:envelope' className='position-absolute start-0 top-50 translate-middle-y ms-12 text-secondary-light' style={{ fontSize: '20px' }} />
                      <input
                        type='email'
                        value={profile.email}
                        onChange={(e) => handleInputChange(null, 'email', e.target.value)}
                        className='form-control ps-40'
                      />
                    </div>
                  </div>
                  <div className='col-12 col-md-6'>
                    <label className='form-label text-sm fw-medium text-gray-700'>Phone</label>
                    <div className='position-relative'>
                      <Icon icon='heroicons:phone' className='position-absolute start-0 top-50 translate-middle-y ms-12 text-secondary-light' style={{ fontSize: '20px' }} />
                      <input
                        type='tel'
                        value={profile.phone}
                        onChange={(e) => handleInputChange(null, 'phone', e.target.value)}
                        className='form-control ps-40'
                      />
                    </div>
                  </div>
                  <div className='col-12 col-md-6'>
                    <label className='form-label text-sm fw-medium text-gray-700'>Location</label>
                    <div className='position-relative'>
                      <Icon icon='heroicons:map-pin' className='position-absolute start-0 top-50 translate-middle-y ms-12 text-secondary-light' style={{ fontSize: '20px' }} />
                      <input
                        type='text'
                        value={profile.location}
                        onChange={(e) => handleInputChange(null, 'location', e.target.value)}
                        className='form-control ps-40'
                      />
                    </div>
                  </div>
                  <div className='col-12 col-md-6'>
                    <label className='form-label text-sm fw-medium text-gray-700'>Portfolio / GitHub</label>
                    <div className='position-relative'>
                      <Icon icon='mdi:github' className='position-absolute start-0 top-50 translate-middle-y ms-12 text-secondary-light' style={{ fontSize: '20px' }} />
                      <input
                        type='url'
                        value={profile.portfolio}
                        onChange={(e) => handleInputChange(null, 'portfolio', e.target.value)}
                        className='form-control ps-40'
                      />
                    </div>
                  </div>
                  <div className='col-12 col-md-6'>
                    <label className='form-label text-sm fw-medium text-gray-700'>LinkedIn</label>
                    <div className='position-relative'>
                      <Icon icon='mdi:linkedin' className='position-absolute start-0 top-50 translate-middle-y ms-12 text-secondary-light' style={{ fontSize: '20px' }} />
                      <input
                        type='url'
                        value={profile.linkedin}
                        onChange={(e) => handleInputChange(null, 'linkedin', e.target.value)}
                        className='form-control ps-40'
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Education */}
            <div className='card border-0 shadow-sm mb-20'>
              <div className='card-body p-24'>
                <h2 className='text-xl fw-bold text-gray-900 mb-16 d-flex align-items-center gap-2'>
                  <Icon icon='heroicons:academic-cap' className='text-primary-600' style={{ fontSize: '20px' }} />
                  Education
                </h2>
                <div className='row g-3'>
                  <div className='col-12'>
                    <label className='form-label text-sm fw-medium text-gray-700'>Degree</label>
                    <input
                      type='text'
                      value={profile.education.degree}
                      onChange={(e) => handleInputChange('education', 'degree', e.target.value)}
                      className='form-control'
                    />
                  </div>
                  <div className='col-12 col-md-6'>
                    <label className='form-label text-sm fw-medium text-gray-700'>College</label>
                    <input
                      type='text'
                      value={profile.education.college}
                      onChange={(e) => handleInputChange('education', 'college', e.target.value)}
                      className='form-control'
                    />
                  </div>
                  <div className='col-12 col-md-6'>
                    <label className='form-label text-sm fw-medium text-gray-700'>Graduation Year</label>
                    <input
                      type='text'
                      value={profile.education.graduationYear}
                      onChange={(e) => handleInputChange('education', 'graduationYear', e.target.value)}
                      className='form-control'
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Work History */}
            <div className='card border-0 shadow-sm mb-20'>
              <div className='card-body p-24'>
                <h2 className='text-xl fw-bold text-gray-900 mb-16 d-flex align-items-center gap-2'>
                  <Icon icon='heroicons:briefcase' className='text-primary-600' style={{ fontSize: '20px' }} />
                  Work History
                </h2>
                <div className='row g-3'>
                  <div className='col-12 col-md-6'>
                    <label className='form-label text-sm fw-medium text-gray-700'>Company</label>
                    <input
                      type='text'
                      value={profile.workHistory.company}
                      onChange={(e) => handleInputChange('workHistory', 'company', e.target.value)}
                      className='form-control'
                    />
                  </div>
                  <div className='col-12 col-md-6'>
                    <label className='form-label text-sm fw-medium text-gray-700'>Role</label>
                    <input
                      type='text'
                      value={profile.workHistory.role}
                      onChange={(e) => handleInputChange('workHistory', 'role', e.target.value)}
                      className='form-control'
                    />
                  </div>
                  <div className='col-12'>
                    <label className='form-label text-sm fw-medium text-gray-700'>Duration</label>
                    <input
                      type='text'
                      value={profile.workHistory.duration}
                      onChange={(e) => handleInputChange('workHistory', 'duration', e.target.value)}
                      className='form-control'
                    />
                  </div>
                  <div className='col-12'>
                    <label className='form-label text-sm fw-medium text-gray-700'>Description</label>
                    <textarea
                      value={profile.workHistory.description}
                      onChange={(e) => handleInputChange('workHistory', 'description', e.target.value)}
                      rows='3'
                      className='form-control'
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className='card border-0 shadow-sm mb-20'>
              <div className='card-body p-24'>
                <h2 className='text-xl fw-bold text-gray-900 mb-16 d-flex align-items-center gap-2'>
                  <Icon icon='heroicons:code-bracket' className='text-primary-600' style={{ fontSize: '20px' }} />
                  Skills
                </h2>
                <div className='mb-16'>
                  <label className='form-label text-sm fw-medium text-gray-700 mb-8'>Add Skills</label>
                  <div className='d-flex flex-wrap gap-2 mb-12'>
                    {availableSkills.filter(s => !profile.skills.includes(s)).map(skill => (
                      <button
                        key={skill}
                        onClick={() => addSkill(skill)}
                        className='btn btn-sm btn-outline-secondary rounded-pill'
                      >
                        + {skill}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className='form-label text-sm fw-medium text-gray-700 mb-8'>Selected Skills</label>
                  <div className='d-flex flex-wrap gap-2'>
                    {profile.skills.map(skill => (
                      <span
                        key={skill}
                        className='badge bg-primary-50 text-primary-600 px-12 py-8 text-sm fw-medium d-flex align-items-center gap-2'
                      >
                        {skill}
                        <button
                          onClick={() => removeSkill(skill)}
                          className='btn btn-link p-0 text-primary-600'
                          style={{ textDecoration: 'none' }}
                        >
                          <Icon icon='heroicons:x-mark' style={{ fontSize: '16px' }} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Resume Upload */}
            <div className='card border-0 shadow-sm mb-20'>
              <div className='card-body p-24'>
                <h2 className='text-xl fw-bold text-gray-900 mb-16 d-flex align-items-center gap-2'>
                  <Icon icon='heroicons:document-text' className='text-primary-600' style={{ fontSize: '20px' }} />
                  Resume Upload
                </h2>
                <div className='border border-2 border-dashed rounded-lg p-24 text-center mb-16'>
                  <Icon icon='heroicons:arrow-up-tray' className='text-secondary-light mx-auto mb-8' style={{ fontSize: '32px' }} />
                  <p className='text-sm text-secondary-light mb-8'>Upload Resume (PDF, DOCX – max 2MB)</p>
                  <input
                    type='file'
                    accept='.pdf,.docx'
                    onChange={handleFileUpload}
                    className='d-none'
                    id='resume-upload'
                  />
                  <label
                    htmlFor='resume-upload'
                    className='btn btn-primary'
                  >
                    Choose File
                  </label>
                </div>
                {profile.resume && (
                  <div className='d-flex align-items-center justify-content-between p-16 bg-success-50 border border-success-200 rounded-lg'>
                    <div className='d-flex align-items-center gap-3'>
                      <Icon icon='heroicons:check' className='text-success-600' style={{ fontSize: '20px' }} />
                      <div>
                        <p className='text-sm fw-medium text-success-900 mb-0'>Resume Uploaded</p>
                        <p className='text-xs text-success-700 mb-0'>{profile.resume}</p>
                      </div>
                    </div>
                    <div className='d-flex gap-2'>
                      <button className='btn btn-sm btn-success'>
                        Download
                      </button>
                      <label
                        htmlFor='resume-upload'
                        className='btn btn-sm btn-secondary'
                        style={{ cursor: 'pointer' }}
                      >
                        Replace
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSaveProfile}
              className='btn btn-primary w-100 py-12 fw-semibold'
            >
              💾 Save Profile
            </button>
          </div>

          {/* Right Column - Live Preview */}
          <div className='col-12 col-lg-4'>
            <div className='card border-0 shadow-lg sticky-top' style={{ top: '20px' }}>
              <div className='card-body p-24'>
                <h3 className='text-lg fw-bold text-gray-900 mb-16'>Live Preview</h3>
                
                <div className='text-center mb-20'>
                  <div className='w-96-px h-96-px bg-gradient-primary rounded-circle mx-auto mb-12 d-flex align-items-center justify-content-center text-white text-3xl fw-bold'>
                    {profile.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <h4 className='text-xl fw-bold text-gray-900 mb-4'>{profile.name}</h4>
                  <p className='text-primary-600 fw-medium mb-0'>{profile.workHistory.role}</p>
                </div>

                <div className='d-flex flex-column gap-3 text-sm'>
                  <div className='d-flex align-items-start gap-2'>
                    <Icon icon='heroicons:map-pin' className='text-secondary-light flex-shrink-0' style={{ fontSize: '16px', marginTop: '2px' }} />
                    <span className='text-gray-700'>{profile.location}</span>
                  </div>
                  
                  <div className='d-flex align-items-start gap-2'>
                    <Icon icon='heroicons:academic-cap' className='text-secondary-light flex-shrink-0' style={{ fontSize: '16px', marginTop: '2px' }} />
                    <span className='text-gray-700'>{profile.education.degree} ({profile.education.graduationYear})</span>
                  </div>
                  
                  <div className='d-flex align-items-start gap-2'>
                    <Icon icon='heroicons:briefcase' className='text-secondary-light flex-shrink-0' style={{ fontSize: '16px', marginTop: '2px' }} />
                    <div>
                      <p className='text-gray-900 fw-medium mb-0'>{profile.workHistory.company}</p>
                      <p className='text-secondary-light text-xs mb-0'>{profile.workHistory.duration}</p>
                    </div>
                  </div>

                  <div className='pt-12 border-top'>
                    <p className='text-gray-700 fw-medium mb-8 d-flex align-items-center gap-2'>
                      <Icon icon='heroicons:code-bracket' style={{ fontSize: '16px' }} />
                      Skills
                    </p>
                    <div className='d-flex flex-wrap gap-1'>
                      {profile.skills.map(skill => (
                        <span key={skill} className='badge bg-primary-50 text-primary-600 px-8 py-4 text-xs'>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {profile.resume && (
                    <div className='pt-12 border-top'>
                      <p className='text-gray-700 fw-medium mb-8 d-flex align-items-center gap-2'>
                        <Icon icon='heroicons:document-text' style={{ fontSize: '16px' }} />
                        Resume
                      </p>
                      <div className='d-flex align-items-center gap-2 text-xs'>
                        <span className='text-secondary-light'>{profile.resume}</span>
                        <Icon icon='heroicons:arrow-down-tray' className='text-primary-600' style={{ fontSize: '12px' }} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


