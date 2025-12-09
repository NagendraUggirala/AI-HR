import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Upload,
  FileText,
  CheckCircle,
  XCircle,
  Mail,
  User,
  Briefcase,
  TrendingUp,
  AlertCircle,
  Eye,
  RefreshCw
} from 'lucide-react';
import { Icon } from '@iconify/react/dist/iconify.js';
import { BASE_URL } from '../../config/api.config';

const ResumeScreening = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.tab || 'candidates');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [formData, setFormData] = useState({
    role: '',
    experienceLevel: 'fresher'
  });
  const [errors, setErrors] = useState({});

  // Fetch AI-screened candidates
  const fetchCandidates = async () => {
    setLoadingCandidates(true);
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('❌ No authentication token found');
        setCandidates([]);
        setLoadingCandidates(false);
        return;
      }

      console.log('📥 Fetching AI-screened candidates from:', `${BASE_URL}/api/resume/candidates`);
      
      const response = await fetch(`${BASE_URL}/api/resume/candidates?limit=1000&show_all=true`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('📊 Response status:', response.status, response.statusText);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Fetched AI screening candidates:', data);
        console.log(`📊 Total candidates received: ${data.length}`);
        
        if (data.length === 0) {
          console.warn('⚠️ No candidates returned. Possible reasons:');
          console.warn('  1. No candidates have been screened yet');
          console.warn('  2. Recruiter has no jobs/applications');
          console.warn('  3. All candidates are filtered out');
        }
        
        setCandidates(data);
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to fetch candidates. Status:', response.status);
        console.error('❌ Error response:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { detail: errorText || 'Failed to fetch candidates' };
        }
        
        console.error('❌ Error details:', errorData);
        setCandidates([]); // Set empty array on error
      }
    } catch (error) {
      console.error('❌ Network error fetching candidates:', error);
      console.error('❌ Error stack:', error.stack);
      setCandidates([]); // Set empty array on error
    } finally {
      setLoadingCandidates(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'candidates') {
      fetchCandidates();
    }
  }, [activeTab]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        setErrors({ file: 'Only PDF and DOCX files are allowed' });
        return;
      }
      setSelectedFile(file);
      setErrors({});
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!selectedFile) newErrors.file = 'Please select a resume file';
    if (!formData.role.trim()) newErrors.role = 'Role is required';
    if (!formData.experienceLevel) newErrors.experienceLevel = 'Experience level is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleUpload = async () => {
    if (!validateForm()) return;

    setIsUploading(true);
    setUploadResult(null);

    const formDataToSend = new FormData();
    formDataToSend.append('file', selectedFile);
    formDataToSend.append('role', formData.role);
    formDataToSend.append('experience_level', formData.experienceLevel);

    try {
      const response = await fetch(`${BASE_URL}/api/resume/process`, {
        method: 'POST',
        body: formDataToSend
      });

      if (response.ok) {
        const result = await response.json();
        setUploadResult(result);
        // Clear form
        setSelectedFile(null);
        setFormData({ role: '', experienceLevel: 'fresher' });
        // Reset file input
        document.getElementById('resume-file-input').value = '';
      } else {
        const errorData = await response.json();
        setUploadResult({
          status: 'error',
          message: errorData.detail || 'Failed to process resume'
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadResult({
        status: 'error',
        message: 'Network error. Please check if backend is running.'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const renderUploadTab = () => {
    return (
      <div className="space-y-6">
        {/* Upload Form */}
        <div className="card">
          <div className="card-header">
            <h6 className="mb-0">AI Resume Screening</h6>
            <p className="text-secondary-light text-sm mt-1">
              Upload a resume to automatically extract information, generate job description, and calculate match score
            </p>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {/* File Upload */}
              <div>
                <label className="form-label">Resume File *</label>
                <div className="file-upload-wrapper">
                  <input
                    id="resume-file-input"
                    type="file"
                    accept=".pdf,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="resume-file-input"
                    className="file-upload-label cursor-pointer"
                  >
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-sm font-medium text-gray-700">
                      {selectedFile ? selectedFile.name : 'Click to upload PDF or DOCX'}
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      Maximum file size: 10MB
                    </span>
                  </label>
                </div>
                {errors.file && (
                  <p className="text-danger-600 text-sm mt-1">{errors.file}</p>
                )}
              </div>

              {/* Role Input */}
              <div>
                <label className="form-label">Role / Position *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g., Software Engineer, Data Analyst"
                  value={formData.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                />
                {errors.role && (
                  <p className="text-danger-600 text-sm mt-1">{errors.role}</p>
                )}
              </div>

              {/* Experience Level */}
              <div>
                <label className="form-label">Experience Level *</label>
                <select
                  className="form-select"
                  value={formData.experienceLevel}
                  onChange={(e) => handleInputChange('experienceLevel', e.target.value)}
                >
                  <option value="fresher">Fresher / Entry Level</option>
                  <option value="junior">Junior (1-3 years)</option>
                  <option value="mid">Mid-Level (3-5 years)</option>
                  <option value="senior">Senior (5-10 years)</option>
                  <option value="lead">Lead / Principal (10+ years)</option>
                </select>
                {errors.experienceLevel && (
                  <p className="text-danger-600 text-sm mt-1">{errors.experienceLevel}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="btn btn-primary w-full"
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Processing Resume...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Screen Resume with AI
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Upload Result */}
        {uploadResult && (
          <div className={`card ${uploadResult.status === 'error' ? 'border-danger-600' : uploadResult.status === 'shortlisted' ? 'border-success-600' : 'border-warning-600'}`}>
            <div className="card-body">
              <div className="flex items-start space-x-4">
                {uploadResult.status === 'error' ? (
                  <XCircle className="h-8 w-8 text-danger-600 flex-shrink-0" />
                ) : uploadResult.status === 'shortlisted' ? (
                  <CheckCircle className="h-8 w-8 text-success-600 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-8 w-8 text-warning-600 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <h5 className="font-semibold mb-2">
                    {uploadResult.status === 'error'
                      ? 'Processing Failed'
                      : uploadResult.status === 'shortlisted'
                        ? 'Candidate Shortlisted!'
                        : 'Candidate Rejected'}
                  </h5>

                  {uploadResult.status === 'error' ? (
                    <p className="text-secondary-light">{uploadResult.message}</p>
                  ) : (
                    <div className="space-y-3">
                      {/* Candidate Info */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-secondary-light">Name</p>
                          <p className="font-medium">{uploadResult.candidate?.name || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-secondary-light">Email</p>
                          <p className="font-medium">{uploadResult.candidate?.email || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-secondary-light">Role</p>
                          <p className="font-medium">{uploadResult.role}</p>
                        </div>
                        <div>
                          <p className="text-xs text-secondary-light">Experience</p>
                          <p className="font-medium capitalize">{uploadResult.experience_level}</p>
                        </div>
                      </div>

                      {/* Skills */}
                      {uploadResult.candidate?.skills && (
                        <div>
                          <p className="text-xs text-secondary-light mb-2">Skills</p>
                          <div className="flex flex-wrap gap-2">
                            {(Array.isArray(uploadResult.candidate.skills)
                              ? uploadResult.candidate.skills
                              : uploadResult.candidate.skills.split(',')
                            ).map((skill, idx) => (
                              <span key={idx} className="badge bg-primary-50 text-primary-600">
                                {skill.trim()}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Score */}
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Match Score</span>
                          <span className={`text-lg font-bold ${uploadResult.score >= uploadResult.threshold
                            ? 'text-success-600'
                            : 'text-danger-600'
                            }`}>
                            {uploadResult.score.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${uploadResult.score >= uploadResult.threshold
                              ? 'bg-success-600'
                              : 'bg-danger-600'
                              }`}
                            style={{ width: `${uploadResult.score}%` }}
                          />
                        </div>
                        <p className="text-xs text-secondary-light mt-2">
                          Threshold: {uploadResult.threshold}%
                        </p>
                      </div>

                      {/* Email Status */}
                      <div className="flex items-center space-x-2 text-sm">
                        <Mail className="h-4 w-4" />
                        <span>
                          Email Status:
                          <span className={`ml-1 font-medium ${uploadResult.email_status === 'yes'
                            ? 'text-success-600'
                            : uploadResult.email_status === 'skipped'
                              ? 'text-secondary-light'
                              : 'text-danger-600'
                            }`}>
                            {uploadResult.email_status === 'yes'
                              ? 'Sent Successfully'
                              : uploadResult.email_status === 'skipped'
                                ? 'Skipped (Not Shortlisted)'
                                : 'Failed'}
                          </span>
                        </span>
                      </div>

                      {/* JD Preview */}
                      {uploadResult.jd_preview && (
                        <div>
                          <p className="text-xs text-secondary-light mb-2">Generated Job Description (Preview)</p>
                          <div className="bg-gray-50 p-3 rounded text-sm text-secondary-light">
                            {uploadResult.jd_preview}...
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderCandidatesTab = () => {
    return (
      <div className="space-y-4">
        {/* Candidates List */}
        {loadingCandidates ? (
          <div className="flex justify-center items-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-primary-600" />
          </div>
        ) : candidates.length === 0 ? (
          <div className="card">
            <div className="card-body text-center py-12">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h6 className="mb-2">No Candidates Yet</h6>
              <p className="text-secondary-light">
                Start screening resumes to see candidates here
              </p>
            </div>
          </div>
        ) : (
          <div className="card">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table bordered-table mb-0">
                  <thead>
                    <tr>
                      <th>Candidate</th>
                      <th>Role</th>
                      <th>Experience</th>
                      <th>Skills</th>
                      <th>Score</th>
                      <th>Email Status</th>
                      <th>Screened On</th>
                    </tr>
                  </thead>
                  <tbody>
                    {candidates.map((candidate) => (
                      <tr key={candidate.id}>
                        <td>
                          <div className="flex items-center space-x-3">
                           
                            <div>
                              <p className="font-medium">{candidate.candidate_name || 'N/A'}</p>
                              <p className="text-sm text-secondary-light">{candidate.candidate_email || 'N/A'}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center">
                            <Briefcase className="h-4 w-4 text-secondary-light mr-2" />
                            {candidate.role}
                          </div>
                        </td>
                        <td>
                          <span className="badge bg-info-50 text-info-600 capitalize">
                            {candidate.experience_level}
                          </span>
                        </td>
                        <td>
                          <div className="flex flex-wrap gap-1">
                            {candidate.candidate_skills?.split(',').slice(0, 3).map((skill, idx) => (
                              <span key={idx} className="badge bg-gray-100 text-gray-700 text-xs">
                                {skill.trim()}
                              </span>
                            ))}
                            {candidate.candidate_skills?.split(',').length > 3 && (
                              <span className="badge bg-gray-100 text-gray-700 text-xs">
                                +{candidate.candidate_skills.split(',').length - 3}
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center space-x-2">
                            <span className={`font-semibold ${candidate.score >= 40 ? 'text-success-600' : 'text-danger-600'
                              }`}>
                              {candidate.score.toFixed(1)}%
                            </span>
                            {candidate.score >= 40 ? (
                              <CheckCircle className="h-4 w-4 text-success-600" />
                            ) : (
                              <XCircle className="h-4 w-4 text-danger-600" />
                            )}
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${candidate.email_sent === 'yes'
                            ? 'bg-success-50 text-success-600'
                            : candidate.email_sent === 'no'
                              ? 'bg-gray-100 text-gray-700'
                              : 'bg-danger-50 text-danger-600'
                            }`}>
                            {candidate.email_sent === 'yes'
                              ? 'Sent'
                              : candidate.email_sent === 'no'
                                ? 'Not Sent'
                                : 'Failed'}
                          </span>
                        </td>
                        <td className="text-sm text-secondary-light">
                          {new Date(candidate.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Calculate stats
  const totalScreened = candidates.length;
  const shortlisted = candidates.filter(c => c.score >= 40).length;
  const avgScore = candidates.length > 0 ?
    (candidates.reduce((acc, c) => acc + c.score, 0) / candidates.length).toFixed(1) :
    '0';

  return (
    <div className="dashboard-main-body">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h5 className="mb-1">AI-Screened Candidates</h5>
          <p className="text-sm text-secondary-light mb-0">
            View all candidates processed through AI resume screening
          </p>
        </div>
        <button
          onClick={fetchCandidates}
          className="btn btn-primary d-flex align-items-center"
          disabled={loadingCandidates}
        >
          {loadingCandidates ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <RefreshCw className="h-4 w-4 me-2" />
              Refresh
            </>
          )}
        </button>
      </div>

      {/* Stats Row */}
      <div className="card border shadow-none mb-4">
        <div className="card-body d-flex">
          <div className="text-center w-25">
            <div className="text-secondary-light small">Total Screened</div>
            <div className="h4 mb-0">{totalScreened}</div>
          </div>
          <div className="text-center w-25 border-start ps-4">
            <div className="text-secondary-light small">Shortlisted</div>
            <div className="h4 mb-0 text-success">{shortlisted}</div>
          </div>
          <div className="text-center w-25 border-start ps-4">
            <div className="text-secondary-light small">Avg Score</div>
            <div className="h4 mb-0 text-primary">{avgScore}%</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="card mb-24">
        <div className="card-body p-0">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('candidates')}
              className={`px-6 py-3 font-medium transition-colors ${activeTab === 'candidates'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-secondary-light hover:text-primary-600'
                }`}
            >
              <Eye className="h-4 w-4 inline mr-2" />
              View Candidates ({candidates.length})
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-6 py-3 font-medium transition-colors ${activeTab === 'upload'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-secondary-light hover:text-primary-600'
                }`}
            >
              <Upload className="h-4 w-4 inline mr-2" />
              Screen Resume
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'candidates' ? renderCandidatesTab() : renderUploadTab()}
    </div>
  );
};

export default ResumeScreening;

