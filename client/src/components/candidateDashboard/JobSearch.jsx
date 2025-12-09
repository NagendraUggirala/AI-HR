import React, { useState, useMemo } from 'react';
import { Icon } from '@iconify/react';
import { Search, MapPin, DollarSign, Briefcase, Clock, Building2, Globe, Users, Award, FileText, User, CheckCircle, Upload, Mail } from 'lucide-react';

const JobSearch = () => {
  // Navigation state
  const [currentView, setCurrentView] = useState('search');
  const [selectedJob, setSelectedJob] = useState(null);

  // Sample job data
  const [jobs] = useState([
    {
      id: 1,
      title: "Frontend Developer (React.js)",
      company: "Veritech Software Pvt. Ltd.",
      location: "Hyderabad, India",
      salary: "₹6 LPA",
      experience: "0-1 Year",
      skills: ["React.js", "JavaScript (ES6+)", "HTML5", "CSS3", "REST API", "Git"],
      type: "Full-Time",
      workType: "Onsite",
      salaryRange: "3-6",
      roleType: "Frontend",
      postedDate: "2 Oct 2025",
      description: "We are looking for a talented Frontend Developer skilled in React.js and modern UI frameworks to join our team at Veritech Software.",
      responsibilities: [
        "Develop and maintain responsive front-end applications using React.js",
        "Work closely with backend teams to integrate APIs",
        "Ensure performance, scalability, and code quality",
        "Collaborate in daily stand-up meetings and sprint planning"
      ],
      companyDetails: {
        website: "www.veritechsoft.com",
        teamSize: "50-100",
        industry: "Software & Web Development",
        about: "Veritech Software specializes in web development and digital solutions. We focus on modern frontend technologies like React.js and Node.js.",
        email: "hr@veritechsoft.com"
      }
    },
    {
      id: 2,
      title: "Full Stack Developer",
      company: "DCM Tech Pvt Ltd",
      location: "Remote",
      salary: "₹5 – ₹8 LPA",
      experience: "1–3 Years",
      skills: ["Node.js", "React", "MongoDB", "Express", "JavaScript"],
      type: "Remote",
      workType: "Remote",
      salaryRange: "3-6",
      roleType: "Full Stack",
      postedDate: "1 Oct 2025",
      description: "Looking for a Full Stack Developer to build scalable web applications using modern technologies.",
      responsibilities: [
        "Build full-stack applications using MERN stack",
        "Design and implement RESTful APIs",
        "Write clean, maintainable code",
        "Collaborate with cross-functional teams"
      ],
      companyDetails: {
        website: "www.dcmtech.com",
        teamSize: "100-200",
        industry: "IT Services",
        about: "DCM Tech is a leading IT services company focused on digital transformation and cloud solutions.",
        email: "hr@dcmtech.com"
      }
    },
    {
      id: 3,
      title: "React Developer",
      company: "Tech Innovations",
      location: "Bangalore",
      salary: "₹6 – ₹10 LPA",
      experience: "2–4 Years",
      skills: ["React.js", "Redux", "TypeScript", "JavaScript", "CSS"],
      type: "Hybrid",
      workType: "Hybrid",
      salaryRange: "6-10",
      roleType: "Frontend",
      postedDate: "30 Sep 2025",
      description: "Join our innovative team as a React Developer to build cutting-edge web applications.",
      responsibilities: [
        "Develop complex React applications",
        "Implement state management with Redux",
        "Write TypeScript code for better maintainability",
        "Optimize application performance"
      ],
      companyDetails: {
        website: "www.techinnovations.com",
        teamSize: "50-100",
        industry: "Technology",
        about: "Tech Innovations is at the forefront of technology, creating solutions that shape the future.",
        email: "careers@techinnovations.com"
      }
    },
    {
      id: 4,
      title: "Backend Developer",
      company: "Cloud Systems",
      location: "Pune",
      salary: "₹7 – ₹12 LPA",
      experience: "3–5 Years",
      skills: ["Python", "Django", "PostgreSQL", "REST API", "Docker"],
      type: "Onsite",
      workType: "Onsite",
      salaryRange: "6-10",
      roleType: "Backend",
      postedDate: "29 Sep 2025",
      description: "Backend Developer to build robust server-side applications and APIs.",
      responsibilities: [
        "Develop RESTful APIs using Python and Django",
        "Design database schemas and optimize queries",
        "Implement security best practices",
        "Deploy applications using containerization"
      ],
      companyDetails: {
        website: "www.cloudsystems.com",
        teamSize: "150-300",
        industry: "Cloud Computing",
        about: "Cloud Systems provides enterprise-grade cloud solutions and backend services.",
        email: "jobs@cloudsystems.com"
      }
    },
    {
      id: 5,
      title: "UI/UX Designer",
      company: "Design Studio",
      location: "Remote",
      salary: "₹4 – ₹7 LPA",
      experience: "1–3 Years",
      skills: ["Figma", "Adobe XD", "Prototyping", "User Research", "Wireframing"],
      type: "Remote",
      workType: "Remote",
      salaryRange: "3-6",
      roleType: "UI/UX",
      postedDate: "28 Sep 2025",
      description: "Creative UI/UX Designer needed to design beautiful user experiences.",
      responsibilities: [
        "Create wireframes and prototypes",
        "Design user interfaces for web and mobile",
        "Conduct user research and usability testing",
        "Collaborate with development teams"
      ],
      companyDetails: {
        website: "www.designstudio.com",
        teamSize: "20-50",
        industry: "Design & Creative",
        about: "Design Studio specializes in creating exceptional user experiences and digital products.",
        email: "hello@designstudio.com"
      }
    },
    {
      id: 6,
      title: "Junior React Developer",
      company: "StartupHub",
      location: "Hyderabad",
      salary: "₹3 – ₹5 LPA",
      experience: "0–1 Years",
      skills: ["React.js", "JavaScript", "HTML/CSS", "Git", "Bootstrap"],
      type: "Onsite",
      workType: "Onsite",
      salaryRange: "0-3",
      roleType: "Frontend",
      postedDate: "27 Sep 2025",
      description: "Perfect opportunity for freshers to start their career in React development.",
      responsibilities: [
        "Learn and implement React.js components",
        "Work on responsive web designs",
        "Collaborate with senior developers",
        "Participate in code reviews and learning sessions"
      ],
      companyDetails: {
        website: "www.startuphub.com",
        teamSize: "10-20",
        industry: "Startup",
        about: "StartupHub is an innovative startup focused on building the next generation of web applications.",
        email: "join@startuphub.com"
      }
    }
  ]);

  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [savedJobs, setSavedJobs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 4;

  // Filters state
  const [filters, setFilters] = useState({
    salary: [],
    roleType: [],
    experience: [],
    workMode: []
  });

  // Toggle filter
  const toggleFilter = (category, value) => {
    setFilters(prev => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter(item => item !== value)
        : [...prev[category], value]
    }));
    setCurrentPage(1);
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      salary: [],
      roleType: [],
      experience: [],
      workMode: []
    });
    setSearchKeyword('');
    setSearchLocation('');
    setCurrentPage(1);
  };

  // Filter and search logic
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const matchesKeyword = !searchKeyword || 
        job.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        job.company.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        job.skills.some(skill => skill.toLowerCase().includes(searchKeyword.toLowerCase()));

      const matchesLocation = !searchLocation || 
        job.location.toLowerCase().includes(searchLocation.toLowerCase());

      const matchesSalary = filters.salary.length === 0 || 
        filters.salary.includes(job.salaryRange);

      const matchesRole = filters.roleType.length === 0 || 
        filters.roleType.includes(job.roleType);

      const matchesWorkMode = filters.workMode.length === 0 || 
        filters.workMode.includes(job.type);

      return matchesKeyword && matchesLocation && matchesSalary && matchesRole && matchesWorkMode;
    });
  }, [jobs, searchKeyword, searchLocation, filters]);

  // Pagination
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

  // Toggle save job
  const toggleSaveJob = (jobId) => {
    setSavedJobs(prev => 
      prev.includes(jobId) 
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
  };

  // Navigation handlers
  const handleJobClick = (job) => {
    setSelectedJob(job);
    setCurrentView('detail');
  };

  const handleBackToSearch = () => {
    setCurrentView('search');
    setSelectedJob(null);
  };

  // Job Detail Page Component
  const JobDetailPage = ({ job, onBack }) => {
    const [applicationMethod, setApplicationMethod] = useState('profile');
    const [selectedFile, setSelectedFile] = useState(null);
    const [submitted, setSubmitted] = useState(false);

    // Existing profile data
    const candidateProfile = {
      name: "Nagendra Uggirala",
      role: "Frontend Developer",
      skills: ["React.js", "JavaScript", "SQL"],
      resume: "/uploads/Nagendra_Resume.pdf"
    };

    const handleFileChange = (e) => {
      setSelectedFile(e.target.files[0]);
    };

    const handleApply = () => {
      setSubmitted(true);
      // Simulate API call
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    };

    // Use default job data if no job is selected (fallback)
    const currentJob = job || {
      id: 1,
      title: "Frontend Developer (React.js)",
      company: "Veritech Software Pvt. Ltd.",
      location: "Hyderabad, India",
      salary: "₹6 LPA",
      experience: "0-1 Year",
      skills: ["React.js", "JavaScript (ES6+)", "HTML5", "CSS3", "REST API", "Git"],
      type: "Full-Time",
      workType: "Onsite",
      postedDate: "2 Oct 2025",
      description: "We are looking for a talented Frontend Developer skilled in React.js and modern UI frameworks to join our team at Veritech Software.",
      responsibilities: [
        "Develop and maintain responsive front-end applications using React.js",
        "Work closely with backend teams to integrate APIs",
        "Ensure performance, scalability, and code quality",
        "Collaborate in daily stand-up meetings and sprint planning"
      ],
      companyDetails: {
        website: "www.veritechsoft.com",
        teamSize: "50-100",
        industry: "Software & Web Development",
        about: "Veritech Software specializes in web development and digital solutions. We focus on modern frontend technologies like React.js and Node.js.",
        email: "hr@veritechsoft.com"
      }
    };

    if (submitted) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #dbeafe 100%)' }}>
          <div className="p-12 max-w-2xl text-center" style={{ backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: '#10b981' }}>
              <CheckCircle className="w-12 h-12" style={{ color: '#ffffff' }} />
            </div>
            <h2 className="text-3xl font-bold mb-4" style={{ color: '#1f2937' }}>Application Submitted Successfully!</h2>
            <p className="text-lg mb-8" style={{ color: '#6b7280' }}>
              We'll notify you once {currentJob.company} reviews your profile.
            </p>
            <button 
              onClick={() => setSubmitted(false)}
              className="px-8 py-3 rounded-lg transition"
              style={{ backgroundColor: '#3b82f6', color: '#ffffff' }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
            >
              Back to Job Details
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen" style={{ backgroundColor: '#f8fafc' }}>
        {/* Header Section */}
        <div style={{ 
          background: 'linear-gradient(135deg, #4f46e5 0%, #1e40af 50%, #1e3a8a 100%)', 
          minHeight: '50vh',
          position: 'relative'
        }} className="text-white">
          <div className="max-w-6xl mx-auto px-8 py-16">
            {/* Back Button */}
            <button
              onClick={onBack}
              className="text-white hover:text-blue-100 font-medium mb-12 flex items-center gap-2 transition-colors"
              style={{ fontSize: '16px', opacity: '0.9' }}
            >
              ← Back to Search
            </button>

            {/* Main Header Content */}
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between">
              {/* Left Content */}
              <div className="flex-1 mb-12 lg:mb-0">
                <h1 className="text-6xl font-bold mb-6" style={{ color: '#ffffff', lineHeight: '1.1' }}>
                  {currentJob.title}
                </h1>
                <p className="text-2xl mb-0" style={{ color: '#ffffff', opacity: '0.9' }}>
                  {currentJob.company}
                </p>
              </div>

              {/* Right Content - Apply Button */}
              <div className="lg:ml-12">
                <button 
                  onClick={() => document.getElementById('apply-section').scrollIntoView({ behavior: 'smooth' })}
                  className="px-12 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-200 shadow-xl"
                  style={{ 
                    backgroundColor: '#ffffff', 
                    color: '#4f46e5',
                    fontSize: '18px',
                    minWidth: '180px',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Apply Now
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="max-w-5xl mx-auto px-8 py-12">
          {/* Single Large Content Card */}
          <div style={{ 
            backgroundColor: '#ffffff', 
            borderRadius: '16px', 
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            minHeight: '60vh'
          }} className="p-12">
            
            {/* Job Overview */}
            <div className="mb-12">
              <div className="flex flex-col space-y-3">
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4" style={{ color: '#6b7280' }} />
                  <span style={{ color: '#374151', fontSize: '16px', fontWeight: '500' }}>
                    {currentJob.location}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <DollarSign className="w-4 h-4" style={{ color: '#6b7280' }} />
                  <span style={{ color: '#374151', fontSize: '16px', fontWeight: '500' }}>
                    {currentJob.salary}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4" style={{ color: '#6b7280' }} />
                  <span style={{ color: '#374151', fontSize: '16px', fontWeight: '500' }}>
                    {currentJob.type}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Briefcase className="w-4 h-4" style={{ color: '#6b7280' }} />
                  <span style={{ color: '#374151', fontSize: '16px', fontWeight: '500' }}>
                    {currentJob.experience}
                  </span>
                </div>
              </div>
            </div>

            {/* Job Description */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#1f2937' }}>Job Description</h2>
              <p className="leading-relaxed" style={{ color: '#4b5563', fontSize: '16px', lineHeight: '1.6' }}>
                {currentJob.description || 'No description available.'}
              </p>
            </div>

            {/* Responsibilities */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#1f2937' }}>Responsibilities</h2>
              <div className="ml-4">
                <ul className="space-y-2">
                  {(currentJob.responsibilities || []).map((resp, idx) => (
                    <li key={idx} style={{ color: '#4b5563', fontSize: '16px', lineHeight: '1.5' }}>
                      {resp}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Required Skills */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#1f2937' }}>Required Skills</h2>
              <div className="flex flex-wrap gap-2 mb-6">
                {(currentJob.skills || []).map((skill, idx) => (
                  <span 
                    key={idx} 
                    className="px-3 py-2 rounded-lg text-sm font-medium"
                    style={{ backgroundColor: '#e0e7ff', color: '#4f46e5' }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2 text-sm" style={{ color: '#6b7280' }}>
                <Clock className="w-4 h-4" />
                <span>Posted on: {currentJob.postedDate || 'N/A'}</span>
              </div>
            </div>

            {/* Company Details */}
            <div>
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#1f2937' }}>Company Details</h2>
              <div>
                <h3 className="font-semibold text-xl mb-3" style={{ color: '#1f2937' }}>
                  {currentJob.company}
                </h3>
                <p className="leading-relaxed" style={{ color: '#6b7280', fontSize: '16px', lineHeight: '1.6' }}>
                  {currentJob.companyDetails?.about || 'Leading technology company focused on innovation and growth.'}
                </p>
              </div>
            </div>
          </div>

          {/* Apply Section */}
          <div id="apply-section" className="mt-12 p-10" style={{ 
            backgroundColor: '#ffffff', 
            borderRadius: '16px', 
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            <div className="flex items-center gap-3 mb-6">
              <Upload className="w-6 h-6" style={{ color: '#4f46e5' }} />
              <h2 className="text-2xl font-bold" style={{ color: '#1f2937' }}>
                Apply for this Job
              </h2>
            </div>

            <div className="space-y-4">
              <p style={{ color: '#6b7280', fontSize: '16px', marginBottom: '20px' }}>Choose how you want to apply:</p>

              {/* Upload Resume Option */}
              <div style={{ 
                border: applicationMethod === 'upload' ? '2px solid #4f46e5' : '1px solid #e5e7eb', 
                borderRadius: '12px', 
                padding: '24px',
                backgroundColor: '#ffffff'
              }} className="hover:border-indigo-400 transition-all duration-200">
                <label className="flex items-start gap-4 cursor-pointer">
                  <input
                    type="radio"
                    name="applicationMethod"
                    value="upload"
                    checked={applicationMethod === 'upload'}
                    onChange={(e) => setApplicationMethod(e.target.value)}
                    className="mt-1"
                    style={{ accentColor: '#4f46e5', width: '20px', height: '20px' }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Upload className="w-4 h-4" style={{ color: '#6b7280' }} />
                      <span className="font-semibold" style={{ color: '#1f2937', fontSize: '16px' }}>Upload Resume</span>
                    </div>
                    {applicationMethod === 'upload' && (
                      <div className="mt-3">
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={handleFileChange}
                          className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                          style={{ color: '#6b7280', fontSize: '14px' }}
                        />
                        {selectedFile && (
                          <p className="mt-2 text-sm font-medium" style={{ color: '#059669' }}>✓ {selectedFile.name}</p>
                        )}
                      </div>
                    )}
                  </div>
                </label>
              </div>

              {/* Use Existing Profile Option */}
              <div style={{ 
                border: applicationMethod === 'profile' ? '2px solid #4f46e5' : '1px solid #e5e7eb', 
                borderRadius: '12px', 
                padding: '24px',
                backgroundColor: '#ffffff'
              }} className="hover:border-indigo-400 transition-all duration-200">
                <label className="flex items-start gap-4 cursor-pointer">
                  <input
                    type="radio"
                    name="applicationMethod"
                    value="profile"
                    checked={applicationMethod === 'profile'}
                    onChange={(e) => setApplicationMethod(e.target.value)}
                    className="mt-1"
                    style={{ accentColor: '#4f46e5', width: '20px', height: '20px' }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4" style={{ color: '#6b7280' }} />
                      <span className="font-semibold" style={{ color: '#1f2937', fontSize: '16px' }}>Use Existing Profile</span>
                    </div>
                    {applicationMethod === 'profile' && (
                      <div className="mt-3" style={{ backgroundColor: '#f8fafc', borderRadius: '12px', padding: '16px' }}>
                        <p className="font-semibold mb-1" style={{ color: '#1f2937', fontSize: '16px' }}>{candidateProfile.name}</p>
                        <p className="text-sm mb-3" style={{ color: '#6b7280' }}>{candidateProfile.role}</p>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {candidateProfile.skills.map((skill, idx) => (
                            <span 
                              key={idx} 
                              className="px-3 py-1 rounded-lg text-xs border font-medium"
                              style={{ backgroundColor: '#ffffff', color: '#4b5563', borderColor: '#e5e7eb' }}
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                        <p className="text-sm" style={{ color: '#6b7280' }}>
                          Resume: <span className="font-semibold" style={{ color: '#4f46e5' }}>{candidateProfile.resume}</span>
                        </p>
                      </div>
                    )}
                  </div>
                </label>
              </div>

              <button
                onClick={handleApply}
                disabled={applicationMethod === 'upload' && !selectedFile}
                className="w-full py-3 rounded-lg font-semibold transition-all duration-200"
                style={{ 
                  backgroundColor: applicationMethod === 'upload' && !selectedFile ? '#9ca3af' : '#4f46e5',
                  color: '#ffffff',
                  cursor: applicationMethod === 'upload' && !selectedFile ? 'not-allowed' : 'pointer',
                  fontSize: '16px'
                }}
                onMouseOver={(e) => {
                  if (!(applicationMethod === 'upload' && !selectedFile)) {
                    e.target.style.backgroundColor = '#4338ca';
                  }
                }}
                onMouseOut={(e) => {
                  if (!(applicationMethod === 'upload' && !selectedFile)) {
                    e.target.style.backgroundColor = '#4f46e5';
                  }
                }}
              >
                Apply Now
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Conditional rendering
  if (currentView === 'detail') {
    return <JobDetailPage job={selectedJob} onBack={handleBackToSearch} />;
  }

  return (
    <div className='dashboard-main-body bg-neutral-50'>
      {/* Header */}
      <div className='bg-white shadow-sm border-bottom mb-20'>
        <div className='container-fluid px-24 py-16'>
          <h1 className='text-2xl  text-gray-800 mb-4'>Find Your Dream Job</h1>
          <p className='text-secondary-light text-sm mb-0'>Discover opportunities that match your skills</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className='bg-white shadow-sm border-bottom mb-24'>
        <div className='container-fluid px-24 py-20'>
          <div className='row g-3'>
            <div className='col-12 col-md-5'>
              <div className='position-relative'>
                <Icon icon='heroicons:magnifying-glass' className='position-absolute start-0 top-50 translate-middle-y ms-12 text-secondary-light' style={{ fontSize: '20px' }} />
                <input
                  type='text'
                  placeholder='Job Title / Skill / Company'
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className='form-control ps-40 py-12'
                />
              </div>
            </div>
            <div className='col-12 col-md-5'>
              <div className='position-relative'>
                <Icon icon='heroicons:map-pin' className='position-absolute start-0 top-50 translate-middle-y ms-12 text-secondary-light' style={{ fontSize: '20px' }} />
                <input
                  type='text'
                  placeholder='Location'
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className='form-control ps-40 py-12'
                />
              </div>
            </div>
            <div className='col-12 col-md-2'>
              <button className='btn btn-primary w-100 py-12 fw-medium'>
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='container-fluid px-24'>
        <div className='row g-4'>
          {/* Filters Sidebar */}
          <div className='col-12 col-lg-3'>
            <div className='card border-0 shadow-sm' style={{ position: 'sticky', top: '20px' }}>
              <div className='card-body p-20'>
                <div className='d-flex justify-content-between align-items-center mb-16'>
                  <h5 className='fw-semibold text-gray-800 mb-0'>Filters</h5>
                  <button onClick={clearFilters} className='btn btn-link btn-sm text-primary-600 p-0'>
                    Clear All
                  </button>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        
                </div>

                {/* Salary Range */}
                <div className='mb-20'>
                  <h6 className='fw-medium text-gray-700 mb-12 d-flex align-items-center gap-2'>
                    <Icon icon='heroicons:currency-dollar' style={{ fontSize: '16px' }} />
                    Salary Range
                  </h6>
                  <div className='d-flex flex-column gap-2'>
                    {['0-3', '3-6', '6-10', '10+'].map(range => (
                      <label key={range} className='d-flex align-items-center gap-2' style={{ cursor: 'pointer' }}>
                        <input
                          type='checkbox'
                          checked={filters.salary.includes(range)}
                          onChange={() => toggleFilter('salary', range)}
                          className='form-check-input mt-0'
                        />
                        <span className='text-sm text-gray-700'>{range} LPA</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Role Type */}
                <div className='mb-20'>
                  <h6 className='fw-medium text-gray-700 mb-12 d-flex align-items-center gap-2'>
                    <Icon icon='heroicons:briefcase' style={{ fontSize: '16px' }} />
                    Role Type
                  </h6>
                  <div className='d-flex flex-column gap-2'>
                    {['Frontend', 'Backend', 'Full Stack', 'UI/UX'].map(role => (
                      <label key={role} className='d-flex align-items-center gap-2' style={{ cursor: 'pointer' }}>
                        <input
                          type='checkbox'
                          checked={filters.roleType.includes(role)}
                          onChange={() => toggleFilter('roleType', role)}
                          className='form-check-input mt-0'
                        />
                        <span className='text-sm text-gray-700'>{role}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Work Mode */}
                <div className='mb-20'>
                  <h6 className='fw-medium text-gray-700 mb-12'>Work Mode</h6>
                  <div className='d-flex flex-column gap-2'>
                    {['Remote', 'Onsite', 'Hybrid'].map(mode => (
                      <label key={mode} className='d-flex align-items-center gap-2' style={{ cursor: 'pointer' }}>
                        <input
                          type='checkbox'
                          checked={filters.workMode.includes(mode)}
                          onChange={() => toggleFilter('workMode', mode)}
                          className='form-check-input mt-0'
                        />
                        <span className='text-sm text-gray-700'>{mode}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Experience */}
                <div className='mb-0'>
                  <h6 className='fw-medium text-gray-700 mb-12 d-flex align-items-center gap-2'>
                    <Icon icon='heroicons:academic-cap' style={{ fontSize: '16px' }} />
                    Experience
                  </h6>
                  <div className='d-flex flex-column gap-2'>
                    {['Fresher', '1-2 Years', '3-5 Years', '5+ Years'].map(exp => (
                      <label key={exp} className='d-flex align-items-center gap-2' style={{ cursor: 'pointer' }}>
                        <input
                          type='checkbox'
                          checked={filters.experience.includes(exp)}
                          onChange={() => toggleFilter('experience', exp)}
                          className='form-check-input mt-0'
                        />
                        <span className='text-sm text-gray-700'>{exp}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Job Listings */}
          <div className='col-12 col-lg-9'>
            <div className='mb-16 d-flex justify-content-between align-items-center'>
              <p className='text-secondary-light mb-0'>
                <span className='fw-semibold text-gray-800'>{filteredJobs.length}</span> Jobs Found
              </p>
            </div>

            {currentJobs.length === 0 ? (
              <div className='card border-0 shadow-sm text-center py-40'>
                <div className='card-body'>
                  <p className='text-secondary-light text-lg mb-12'>No jobs found matching your criteria</p>
                  <button onClick={clearFilters} className='btn btn-link text-primary-600'>
                    Clear filters to see all jobs
                  </button>
                </div>
              </div>
            ) : (
              <div className='d-flex flex-column gap-4'>
                {currentJobs.map(job => (
                  <div key={job.id} className='bg-white border rounded-lg shadow-sm p-5 hover:shadow-md transition'>
                    <div className='d-flex justify-content-between align-items-start'>
                      <div className='d-flex gap-4'>
                        {/* Company Logo */}
                        <div className='w-12 h-12 bg-blue-100 rounded-lg d-flex align-items-center justify-content-center'>
                          <span className='fw-semibold text-blue-600 fs-5'>
                            {job.company.split(' ').map(word => word.charAt(0)).join('').substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                        
                        {/* Job Details */}
                        <div style={{ flex: '1', minWidth: '0' }}>
                          <h3 className='fs-5 fw-semibold text-gray-800 mb-1'>{job.title}</h3>
                          <p className='text-gray-600 mb-2'>{job.company}</p>
                          
                          {/* Job Attributes */}
                          <div className='d-flex gap-4 text-sm text-gray-600 mb-3'>
                            <span className='d-flex align-items-center gap-1'>
                              <Icon icon='heroicons:map-pin' style={{ fontSize: '16px' }} />
                              {job.location}
                            </span>
                            <span className='d-flex align-items-center gap-1'>
                              <Icon icon='heroicons:currency-dollar' style={{ fontSize: '16px' }} />
                              {job.salary}
                            </span>
                            <span className='d-flex align-items-center gap-1'>
                              <Icon icon='heroicons:clock' style={{ fontSize: '16px' }} />
                              Full-Time
                            </span>
                          </div>
                          
                          {/* Skills */}
                          <div className='d-flex gap-2 flex-wrap'>
                            {job.skills.map((skill, idx) => (
                              <span key={idx} className='px-3 py-1 bg-gray-100 text-gray-700 rounded-pill text-xs fw-medium'>
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      {/* Apply Button */}
                      <button 
                        onClick={() => handleJobClick(job)}
                        className='px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 fw-medium text-sm' 
                        style={{backgroundColor:"green", color:"white", flexShrink: 0, marginLeft: '16px' }}
                        
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className='mt-24 d-flex justify-content-center align-items-center gap-2'>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className='btn btn-outline-secondary p-8'
                  style={{ opacity: currentPage === 1 ? 0.5 : 1 }}
                >
                  <Icon icon='heroicons:chevron-left' style={{ fontSize: '20px' }} />
                </button>

                {[...Array(totalPages)].map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentPage(idx + 1)}
                    className={`btn px-16 py-8 fw-medium ${
                      currentPage === idx + 1
                        ? 'btn-primary'
                        : 'btn-outline-secondary'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className='btn btn-outline-secondary p-8'
                  style={{ opacity: currentPage === totalPages ? 0.5 : 1 }}
                >
                  <Icon icon='heroicons:chevron-right' style={{ fontSize: '20px' }} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobSearch;