import React, { useState, useEffect } from 'react';
import {
  User,
  MessageSquare,
  Video,
  Award,
  TrendingUp,
  Eye,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Download,
  RefreshCw,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  FileText,
  Menu,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import { BASE_URL } from '../../config/api.config';

const ReviewAIInterview = () => {
  const [candidates, setCandidates] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMinScore, setFilterMinScore] = useState(0);
  const [showTranscript, setShowTranscript] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [recruiterNote, setRecruiterNote] = useState('');
  const [savedNotes, setSavedNotes] = useState([]);
  const [showCandidateModal, setShowCandidateModal] = useState(false);
  const [selectedCandidateForModal, setSelectedCandidateForModal] = useState(null);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerTemplates, setOfferTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [offerData, setOfferData] = useState({
    position: '',
    department: '',
    salary_offered: '',
    benefits: '',
    offer_content: '',
    expiry_days: 30,
    notes: ''
  });
  const [sendingOffer, setSendingOffer] = useState(false);

  // Fetch questions
  const fetchQuestions = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/interviews/get_questions`);
      if (response.ok) {
        const data = await response.json();
        setQuestions(data);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  // Fetch offer templates
  const fetchOfferTemplates = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('❌ No authentication token found for fetching offer templates');
        return;
      }

      console.log('📥 Fetching offer templates from:', `${BASE_URL}/api/offers/offer-templates/`);
      
      const response = await fetch(`${BASE_URL}/api/offers/offer-templates/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('📊 Offer templates response status:', response.status, response.statusText);
      
      if (response.ok) {
        const data = await response.json();
        setOfferTemplates(data);
        console.log('📋 Offer templates fetched:', data);
        console.log(`📊 Total offer templates received: ${data.length}`);
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to fetch offer templates. Status:', response.status);
        console.error('❌ Error response:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { detail: errorText || 'Failed to fetch offer templates' };
        }
        
        // Handle Pydantic validation errors (array of error objects)
        if (errorData.detail && Array.isArray(errorData.detail)) {
          const errorMessages = errorData.detail.map(err => {
            if (typeof err === 'object' && err.msg) {
              const field = err.loc ? err.loc.join('.') : 'field';
              return `${field}: ${err.msg}`;
            }
            return String(err);
          }).join(', ');
          console.error('❌ Validation errors:', errorMessages);
        } else {
          console.error('❌ Error details:', errorData);
        }
      }
    } catch (error) {
      console.error('❌ Error fetching offer templates:', error);
    }
  };


  // Fetch all interview results (real data from backend)
  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('❌ No authentication token found');
        setAnswers([]);
        setCandidates([]);
        setLoading(false);
        return;
      }

      console.log('📥 Fetching interview results from:', `${BASE_URL}/api/interviews/results`);
      
      // ✅ Fetch real interview results from backend
      const response = await fetch(`${BASE_URL}/api/interviews/results`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('📊 Response status:', response.status, response.statusText);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📊 Interview results:', data);
        console.log(`📊 Total interview results received: ${data.length}`);
        
        // Map the backend data to the format used by the UI
        const formattedAnswers = data.map(result => {
          // Match answers with questions
          const answersWithQuestions = result.answers.map(ans => {
            // Use question_text from answer if available, otherwise try to match with questions
            const questionText = ans.question_text || questions.find(q => q.id === ans.question_id)?.text || `Question ${ans.question_id}`;
            const answerData = {
              question_id: ans.question_id,
              question_text: questionText,
              question_type: questions.find(q => q.id === ans.question_id)?.type || 'video',
              answer_text: ans.answer_text,
              score: ans.score || 0,
              video_path: ans.video_path,
              audio_path: ans.audio_path,
              q: questionText,
              a: ans.answer_text
            };
            
            // Log video/audio paths for debugging
            if (ans.video_path || ans.audio_path) {
              console.log(`📹 Candidate ${result.candidate_name} - Question ${ans.question_id}:`, {
                video_path: ans.video_path,
                audio_path: ans.audio_path,
                question_text: questionText.substring(0, 50)
              });
            }
            
            return answerData;
          });
          
          return {
            candidate_id: result.candidate_id,
            name: result.candidate_name,
            candidate_name: result.candidate_name,
            candidate_email: result.candidate_email,
            email: result.candidate_email,
            role: 'Candidate', // Default role
            phone: 'N/A',
            location: 'N/A',
            experience: 'N/A',
            education: 'N/A',
            interviewDate: new Date().toLocaleDateString(),
            status: 'Interviewed',
            questions: answersWithQuestions,
            answers: answersWithQuestions,
            total_score: result.total_score,
            aiScore: result.avg_score,
            avg_score: result.avg_score,
            keywords: ['Experienced', 'Professional', 'Skilled'], // Mock data
            sentiment: {
              tone: 'Positive',
              confidence: 'High',
              engagement: 'Good'
            },
            scores: {
              technical: Math.round(result.avg_score),
              communication: Math.round(result.avg_score * 0.95),
              problemSolving: Math.round(result.avg_score * 1.05),
              overall: Math.round(result.avg_score)
            },
            verdict: result.avg_score >= 80 
              ? 'Highly recommended for next round. Strong technical skills and excellent communication.'
              : result.avg_score >= 60
              ? 'Recommended for consideration. Good overall performance with room for improvement.'
              : 'Not recommended. Needs significant improvement in technical and communication areas.',
            skills: ['Problem Solving', 'Technical Knowledge', 'Communication'],
            previousCompanies: ['Tech Corp', 'Innovation Labs']
          };
        });

        setAnswers(formattedAnswers);
        
        // Extract unique candidates
        const uniqueCandidates = formattedAnswers.map(a => ({
          id: a.candidate_id,
          candidate_name: a.candidate_name,
          candidate_email: a.candidate_email
        }));
        setCandidates(uniqueCandidates);
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to fetch interview results. Status:', response.status);
        console.error('❌ Error response:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { detail: errorText || 'Failed to fetch interview results' };
        }
        
        console.error('❌ Error details:', errorData);
        setAnswers([]);
        setCandidates([]);
      }
    } catch (error) {
      console.error('❌ Error fetching interview results:', error);
      setAnswers([]);
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchQuestions();
      await fetchCandidates();
    };
    init();
  }, []);

  // Get current candidate
  const candidate = selectedCandidate !== null ? answers[selectedCandidate] : null;

  // Handle candidate click for modal
  const handleCandidateClick = (c) => {
    setSelectedCandidateForModal(c);
    setShowCandidateModal(true);
  };

  const closeModal = () => {
    setShowCandidateModal(false);
    setSelectedCandidateForModal(null);
  };

  // Handle save note
  const handleSaveNote = () => {
    if (recruiterNote.trim() && candidate) {
      const newNote = {
        candidate: candidate.name,
        note: recruiterNote,
        date: new Date().toLocaleString(),
        recruiter: 'Current User'
      };
      setSavedNotes([...savedNotes, newNote]);
      setRecruiterNote('');
      alert('Note saved successfully!');
    }
  };

  // Handle action buttons
  const handleAction = async (action) => {
    if (!candidate) return;
    
    if (action === 'Shortlist') {
      // Fetch templates and initialize offer data with candidate info
      await fetchOfferTemplates();
      setOfferData({
        position: candidate.role || 'Software Developer',
        department: '',
        salary_offered: '',
        benefits: '',
        offer_content: `Dear ${candidate.name},\n\nWe are pleased to offer you the position of ${candidate.role || 'Software Developer'} at our company.\n\nWe were impressed with your performance during the interview process and believe you would be a valuable addition to our team.\n\nPlease let us know if you have any questions.\n\nBest regards,\nRecruitment Team`,
        expiry_days: 30,
        notes: ''
      });
      setSelectedTemplateId('');
      setShowOfferModal(true);
    } else if (action === 'Reject') {
      if (window.confirm(`Are you sure you want to reject ${candidate.name}?`)) {
        try {
          const token = localStorage.getItem('token');
          
          if (!token) {
            alert('❌ Authentication required. Please log in again.');
            return;
          }

          // Find candidate_record_id by email from candidate_records table
          // First, try to find the candidate record ID
          let candidateRecordId = candidate.candidate_id; // This might be from interview system
          
          // If we have email, try to find the candidate_record by email
          if (candidate.email) {
            try {
              const candidateRecordResponse = await fetch(`${BASE_URL}/api/resume/candidates?show_all=true`, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                }
              });
              
              if (candidateRecordResponse.ok) {
                const candidateRecords = await candidateRecordResponse.json();
                const matchingRecord = candidateRecords.find(
                  cr => cr.candidate_email && cr.candidate_email.toLowerCase() === candidate.email.toLowerCase()
                );
                if (matchingRecord) {
                  candidateRecordId = matchingRecord.id;
                  console.log(`✅ Found candidate_record ID: ${candidateRecordId} for email: ${candidate.email}`);
                }
              }
            } catch (e) {
              console.warn('Could not fetch candidate records, using provided ID:', e);
            }
          }

          console.log(`📤 Updating candidate stage to Rejected for ID: ${candidateRecordId}`);
          
          // Update candidate stage to Rejected
          const response = await fetch(`${BASE_URL}/api/resume/candidates/${candidateRecordId}/stage`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ stage: 'Rejected' })
          });
          
          console.log('📊 Reject response status:', response.status, response.statusText);
          
          if (response.ok) {
            const result = await response.json();
            console.log('✅ Candidate rejected:', result);
            alert(`✅ ${candidate.name} has been rejected.`);
            fetchCandidates(); // Refresh candidates list
          } else {
            const errorText = await response.text();
            console.error('❌ Failed to reject candidate. Status:', response.status);
            console.error('❌ Error response:', errorText);
            
            let errorData;
            try {
              errorData = JSON.parse(errorText);
            } catch {
              errorData = { detail: errorText || 'Failed to update candidate stage' };
            }
            
            alert(`❌ Failed to reject candidate: ${errorData.detail || 'Unknown error'}`);
          }
        } catch (error) {
          console.error('❌ Error rejecting candidate:', error);
          alert('Error rejecting candidate. Please try again.');
        }
      }
    } else {
      alert(`${action} action performed for ${candidate.name}`);
    }
  };


  // Handle template selection
  const handleTemplateSelect = (templateId) => {
    setSelectedTemplateId(templateId);
    if (templateId) {
      const template = offerTemplates.find(t => t.id === parseInt(templateId));
      if (template) {
        // Replace placeholders in template content with candidate info
        let offerContent = template.template_content || '';
        offerContent = offerContent.replace(/\[Candidate Name\]/g, candidate.name);
        offerContent = offerContent.replace(/\[Position\]/g, template.position || candidate.role || 'Software Developer');
        offerContent = offerContent.replace(/\[Department\]/g, template.department || '');
        
        setOfferData(prev => ({
          ...prev,
          position: template.position || prev.position,
          department: template.department || prev.department,
          salary_offered: template.salary_range_min ? String(template.salary_range_min) : prev.salary_offered,
          benefits: template.benefits ? template.benefits.join(', ') : prev.benefits,
          offer_content: offerContent,
          expiry_days: template.validity_days || prev.expiry_days
        }));
      }
    }
  };

  // Handle send offer
  const handleSendOffer = async () => {
    if (!candidate) return;
    
    if (!selectedTemplateId) {
      alert('Please select an offer template first.');
      return;
    }
    
    if (!offerData.position || !offerData.offer_content) {
      alert('Please fill in Position and Offer Content fields.');
      return;
    }
    
    setSendingOffer(true);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('❌ Authentication required. Please log in again.');
        setSendingOffer(false);
        return;
      }

      const benefitsList = offerData.benefits 
        ? offerData.benefits.split(',').map(b => b.trim()).filter(b => b)
        : [];
      
      // Find the correct candidate_id from main candidate table
      // The candidate_id from interview system might not exist in main candidate table
      // The backend will handle this by looking up by email, but we can pass the interview candidate_id
      // The backend will resolve it to the correct candidate_id from main table
      const requestBody = {
        candidate_id: candidate.candidate_id, // Backend will resolve this to main candidate table ID
        candidate_name: candidate.name,
        candidate_email: candidate.email,
        template_id: selectedTemplateId ? parseInt(selectedTemplateId) : null,
        position: offerData.position,
        department: offerData.department || null,
        salary_offered: offerData.salary_offered ? parseFloat(offerData.salary_offered) : null,
        benefits: benefitsList,
        offer_content: offerData.offer_content,
        expiry_days: parseInt(offerData.expiry_days) || 30,
        notes: offerData.notes || null
      };

      console.log('📤 Sending offer to:', `${BASE_URL}/api/offers/offer-tracking/send-offer`);
      console.log('📤 Offer data:', requestBody);
      
      const response = await fetch(`${BASE_URL}/api/offers/offer-tracking/send-offer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });
      
      console.log('📊 Send offer response status:', response.status, response.statusText);
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Offer sent successfully:', result);
        alert(`✅ Offer sent successfully to ${candidate.name}!`);
        setShowOfferModal(false);
        fetchCandidates(); // Refresh candidates list to show updated stage
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to send offer. Status:', response.status);
        console.error('❌ Error response:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { detail: errorText || 'Failed to send offer' };
        }
        
        // Handle Pydantic validation errors (array of error objects)
        let errorMessage = 'Failed to send offer';
        if (errorData.detail) {
          if (Array.isArray(errorData.detail)) {
            errorMessage = errorData.detail.map(err => {
              if (typeof err === 'object' && err.msg) {
                const field = err.loc ? err.loc.join('.') : 'field';
                return `${field}: ${err.msg}`;
              }
              return String(err);
            }).join(', ');
          } else {
            errorMessage = String(errorData.detail);
          }
        }
        
        alert(`❌ ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error sending offer:', error);
      alert('Error sending offer. Please try again.');
    } finally {
      setSendingOffer(false);
    }
  };

  // Get score badge color
  const getScoreBadgeColor = (score) => {
    if (score >= 80) return 'bg-success text-white';
    if (score >= 60) return 'bg-info text-white';
    if (score >= 40) return 'bg-warning text-dark';
    return 'bg-danger text-white';
  };

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="mb-4 d-flex justify-content-between align-items-center">
        <div>
          <h4 className="mb-2">AI Interview Review</h4>
          <p className="text-secondary-light mb-0">Review candidate interview responses with AI feedback, sentiment, and notes</p>
        </div>
        <div className="d-flex flex-wrap align-items-center gap-2">
          <button 
            className="btn btn-primary d-flex align-items-center"
            onClick={fetchCandidates}
            disabled={loading}
          >
            {loading ? (
              <RefreshCw size={16} className="me-2 spinner" />
            ) : (
              <>
                <RefreshCw size={16} className="me-2" />
                Refresh
              </>
            )}
          </button>
        </div>
      </div>

      <div className="row g-4">
        {/* Left Sidebar - Candidate List */}
        <div className="col-lg-4">
          <div className="card border shadow-none">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h5 className="mb-0">Candidates</h5>
                <button 
                  className="btn btn-sm btn-outline-secondary d-lg-none d-flex align-items-center" 
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                  <Menu size={16} />
                </button>
              </div>

              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : answers.length === 0 ? (
                <div className="text-center py-4">
                  <div className="d-flex align-items-center justify-content-center gap-2">
                    <MessageSquare size={32} className="text-muted" />
                    <p className="text-muted small mb-0">No interview results yet</p>
                  </div>
                </div>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {answers.map((c, idx) => (
                    <div
                      key={idx}
                      className={`card p-3 border-2 cursor-pointer ${
                        selectedCandidate === idx
                          ? 'border-primary bg-primary-subtle text-primary'
                          : 'border-secondary bg-light text-dark'
                      }`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => { setSelectedCandidate(idx); setCurrentQuestion(0); }}
                      onDoubleClick={() => handleCandidateClick(c)}
                    >
                      <div className="d-flex align-items-start justify-content-between mb-2">
                        <h6 className="mb-0 small">{c.name}</h6>
                        <span
                          className={`badge ${
                            c.aiScore >= 80
                              ? 'bg-success-subtle text-success'
                              : c.aiScore >= 70
                              ? 'bg-warning-subtle text-warning'
                              : 'bg-danger-subtle text-danger'
                          }`}
                        >
                          {c.aiScore}%
                        </span>
                      </div>
                      <p className="small text-muted mb-2">{c.role}</p>
                      <p className="small text-muted mb-0">Double-click for details</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Interview Details */}
        <div className="col-lg-8">
          {!candidate ? (
            <div className="card border shadow-none text-center py-5">
              <div className="card-body">
                <h5 className="text-muted">Select a candidate to review their interview</h5>
                <p className="text-muted small mb-0">
                  Click on a candidate card from the left panel to begin reviewing.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Video/Answer Player */}
              <div className="card border shadow-none mb-4">
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <h5 className="mb-0">
                      Question {currentQuestion + 1} of {candidate.questions.length}
                    </h5>
                    <button
                      className="btn btn-sm btn-outline-primary d-flex align-items-center"
                      onClick={() => setShowTranscript(!showTranscript)}
                    >
                      {showTranscript ? 'Hide' : 'Show'} Transcript
                    </button>
                  </div>

                  <div className="mb-3 p-3 bg-light rounded">
                    <p className="small fw-semibold text-muted mb-1">Question:</p>
                    <p className="mb-0">{candidate.questions[currentQuestion].q}</p>
                  </div>

                  {/* Video Player */}
                  {(() => {
                    const currentQ = candidate.questions[currentQuestion];
                    const videoPath = currentQ.video_path;
                    const audioPath = currentQ.audio_path;
                    
                    // Construct video URL - handle both relative and absolute paths
                    const getVideoUrl = (path) => {
                      if (!path) return null;
                      // If path already starts with http, return as is
                      if (path.startsWith('http://') || path.startsWith('https://')) {
                        return path;
                      }
                      // Remove leading slash if present
                      let cleanPath = path.startsWith('/') ? path.substring(1) : path;
                      // If path already includes uploads/, use it directly
                      if (cleanPath.startsWith('uploads/')) {
                        return `${BASE_URL}/${cleanPath}`;
                      }
                      // Otherwise, prepend uploads/
                      return `${BASE_URL}/uploads/${cleanPath}`;
                    };
                    
                    const videoUrl = getVideoUrl(videoPath);
                    const audioUrl = getVideoUrl(audioPath);
                    
                    if (videoUrl) {
                      return (
                        <div className="mb-3">
                          <video
                            key={videoUrl} // Force re-render when URL changes
                            controls
                            className="w-100 rounded"
                            style={{ maxHeight: '500px', backgroundColor: '#000' }}
                            onPlay={() => setIsPlaying(true)}
                            onPause={() => setIsPlaying(false)}
                            onEnded={() => setIsPlaying(false)}
                            onError={(e) => {
                              console.error('Video playback error:', e);
                              console.error('Video URL:', videoUrl);
                            }}
                          >
                            <source src={videoUrl} type="video/webm" />
                            <source src={videoUrl} type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                          <div className="mt-2 d-flex align-items-center gap-2">
                            <a 
                              href={videoUrl} 
                              download 
                              className="btn btn-sm btn-outline-primary d-flex align-items-center"
                            >
                              <Download size={16} className="me-1" />
                              Download Video
                            </a>
                            <span className="small text-muted">
                              {videoPath ? `File: ${videoPath.split('/').pop()}` : ''}
                            </span>
                          </div>
                        </div>
                      );
                    } else if (audioUrl) {
                      return (
                        <div className="mb-3 bg-dark rounded p-4 text-center">
                          <audio
                            key={audioUrl}
                            controls
                            className="w-100"
                            onPlay={() => setIsPlaying(true)}
                            onPause={() => setIsPlaying(false)}
                            onEnded={() => setIsPlaying(false)}
                            onError={(e) => {
                              console.error('Audio playback error:', e);
                              console.error('Audio URL:', audioUrl);
                            }}
                          >
                            <source src={audioUrl} type="audio/webm" />
                            <source src={audioUrl} type="audio/mpeg" />
                            Your browser does not support the audio element.
                          </audio>
                          <div className="mt-2">
                            <a 
                              href={audioUrl} 
                              download 
                              className="btn btn-sm btn-outline-primary d-flex align-items-center"
                            >
                              <Download size={16} className="me-1" />
                              Download Audio
                            </a>
                          </div>
                        </div>
                      );
                    } else {
                      return (
                        <div
                          className="position-relative bg-dark rounded mb-3 d-flex align-items-center justify-content-center"
                          style={{ aspectRatio: '16/9', minHeight: '300px' }}
                        >
                          <div className="text-center text-white">
                            <Video size={48} className="text-muted mb-3" />
                            <p className="text-muted mb-0">No video/audio recording available for this question</p>
                            {currentQ.answer_text && (
                              <p className="text-muted small mt-2">Text answer only: {currentQ.answer_text.substring(0, 100)}...</p>
                            )}
                          </div>
                        </div>
                      );
                    }
                  })()}

                  {showTranscript && (
                    <div className="p-3 bg-primary-subtle rounded border border-primary-subtle">
                      <p className="small fw-semibold text-muted mb-2">Candidate Response:</p>
                      <p className="mb-0">{candidate.questions[currentQuestion].a}</p>
                    </div>
                  )}

                  <div className="d-flex align-items-center justify-content-between mt-3">
                    <button
                      className="btn btn-outline-secondary d-flex align-items-center"
                      onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                      disabled={currentQuestion === 0}
                    >
                      <ChevronLeft size={16} className="me-1" />
                      Previous
                    </button>
                    <span className="small text-muted">
                      {currentQuestion + 1} / {candidate.questions.length}
                    </span>
                    <button
                      className="btn btn-outline-secondary d-flex align-items-center"
                      onClick={() =>
                        setCurrentQuestion(
                          Math.min(candidate.questions.length - 1, currentQuestion + 1)
                        )
                      }
                      disabled={currentQuestion === candidate.questions.length - 1}
                    >
                      Next
                      <ChevronRight size={16} className="ms-1" />
                    </button>
                  </div>
                </div>
              </div>

              {/* AI Feedback Panel */}
              <div className="card border shadow-none mb-4">
                <div className="card-body">
                  <h5 className="mb-3">AI Feedback</h5>

                  {/* Keyword Analysis */}
                  <div className="mb-4">
                    <h6 className="small fw-semibold text-muted mb-2">💬 Keyword Analysis</h6>
                    <div className="d-flex flex-wrap gap-2">
                      {candidate.keywords.map((keyword, idx) => (
                        <span key={idx} className="badge bg-primary-subtle text-primary">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Sentiment Analysis */}
                  <div className="mb-4">
                    <h6 className="small fw-semibold text-muted mb-2">😊 Sentiment Analysis</h6>
                    <div className="row g-3">
                      <div className="col-md-4">
                        <div className="p-3 bg-success-subtle rounded border border-success-subtle">
                          <p className="small text-muted mb-1">Tone</p>
                          <p className="fw-semibold text-success mb-0">
                            {candidate.sentiment.tone}
                          </p>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="p-3 bg-info-subtle rounded border border-info-subtle">
                          <p className="small text-muted mb-1">Confidence</p>
                          <p className="fw-semibold text-info mb-0">
                            {candidate.sentiment.confidence}
                          </p>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="p-3 bg-warning-subtle rounded border border-warning-subtle">
                          <p className="small text-muted mb-1">Engagement</p>
                          <p className="fw-semibold text-warning mb-0">
                            {candidate.sentiment.engagement}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AI Evaluation Score */}
                  <div className="mb-4">
                    <h6 className="small fw-semibold text-muted mb-2">📊 AI Evaluation Score</h6>
                    <div className="d-flex flex-column gap-3">
                      {Object.entries(candidate.scores).map(([category, score]) => (
                        <div key={category}>
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <span className="small text-muted text-capitalize">
                              {category === 'overall'
                                ? 'Overall Fit'
                                : category === 'technical'
                                ? 'Technical Knowledge'
                                : category}
                            </span>
                            <span className="small fw-semibold">{score}%</span>
                          </div>
                          <div className="progress" style={{ height: '8px' }}>
                            <div
                              className={`progress-bar ${
                                score >= 80
                                  ? 'bg-success'
                                  : score >= 70
                                  ? 'bg-warning'
                                  : 'bg-danger'
                              }`}
                              style={{ width: `${score}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI Verdict */}
                  <div className="p-3 bg-primary-subtle rounded border border-primary-subtle">
                    <p className="small fw-semibold text-muted mb-1">AI Verdict:</p>
                    <p className="mb-0">{candidate.verdict}</p>
                  </div>
                </div>
              </div>

              {/* Recruiter Notes */}
              <div className="card border shadow-none mb-4">
                <div className="card-body">
                  <h5 className="mb-3">🗒 Recruiter Notes</h5>
                  <textarea
                    className="form-control mb-3"
                    value={recruiterNote}
                    onChange={(e) => setRecruiterNote(e.target.value)}
                    placeholder="Add your notes about this candidate..."
                    rows="4"
                  />
                  <button className="btn btn-primary d-flex align-items-center" onClick={handleSaveNote}>
                    Save Notes
                  </button>

                  {/* Saved Notes */}
                  {savedNotes.length > 0 && (
                    <div className="mt-4">
                      <h6 className="small fw-semibold text-muted mb-2">Previous Notes</h6>
                      <div className="d-flex flex-column gap-2">
                        {savedNotes
                          .filter((n) => n.candidate === candidate.name)
                          .map((note, idx) => (
                            <div key={idx} className="p-3 bg-light rounded border">
                              <p className="small mb-2">{note.note}</p>
                              <p className="small text-muted mb-0">
                                {note.date} • {note.recruiter}
                              </p>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="d-flex flex-wrap gap-2">
                <button className="btn btn-success d-flex align-items-center" onClick={() => handleAction('Shortlist')}>
                  <CheckCircle size={16} className="me-2" />
                  Shortlist
                </button>
                <button className="btn btn-danger d-flex align-items-center" onClick={() => handleAction('Reject')}>
                  <XCircle size={16} className="me-2" />
                  Reject
                </button>
                <button className="btn btn-secondary d-flex align-items-center" onClick={() => handleAction('Export Report')}>
                  <Download size={16} className="me-2" />
                  Export Report
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Candidate Details Modal */}
      {showCandidateModal && selectedCandidateForModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div
            className="modal-dialog modal-xxl modal-dialog-centered modal-dialog-scrollable"
            style={{ maxWidth: '1350px', width: '98%' }}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title d-flex align-items-center gap-2">
                  <User size={24} />
                  {selectedCandidateForModal.name} - {selectedCandidateForModal.role}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row g-4">
                  {/* Left Column - Personal Info */}
                  <div className="col-md-4">
                    <div className="card border shadow-none">
                      <div className="card-body">
                        <h6 className="card-title">Personal Information</h6>
                        <div className="d-flex align-items-center gap-2 mb-3">
                          <Mail size={16} className="text-muted" />
                          <span className="small">{selectedCandidateForModal.email}</span>
                        </div>
                        <div className="d-flex align-items-center gap-2 mb-3">
                          <Phone size={16} className="text-muted" />
                          <span className="small">{selectedCandidateForModal.phone}</span>
                        </div>
                        <div className="d-flex align-items-center gap-2 mb-3">
                          <MapPin size={16} className="text-muted" />
                          <span className="small">{selectedCandidateForModal.location}</span>
                        </div>
                        <hr />
                        <div className="mb-3">
                          <h6 className="small fw-semibold text-muted mb-1">Experience</h6>
                          <p className="mb-0">{selectedCandidateForModal.experience}</p>
                        </div>
                        <div className="mb-3">
                          <h6 className="small fw-semibold text-muted mb-1">Education</h6>
                          <p className="mb-0">{selectedCandidateForModal.education}</p>
                        </div>
                        <div className="mb-3">
                          <h6 className="small fw-semibold text-muted mb-1">Interview Date</h6>
                          <p className="mb-0">{selectedCandidateForModal.interviewDate}</p>
                        </div>
                        <div className="mb-3">
                          <h6 className="small fw-semibold text-muted mb-1">Status</h6>
                          <span
                            className={`badge ${
                              selectedCandidateForModal.status === 'Interviewed'
                                ? 'bg-primary-subtle text-primary'
                                : 'bg-success-subtle text-success'
                            }`}
                          >
                            {selectedCandidateForModal.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="card border shadow-none mt-3">
                      <div className="card-body">
                        <h6 className="card-title">Skills</h6>
                        <div className="d-flex flex-wrap gap-2">
                          {selectedCandidateForModal.skills?.map((skill, idx) => (
                            <span key={idx} className="badge bg-secondary-subtle text-secondary">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Previous Companies */}
                    <div className="card border shadow-none mt-3">
                      <div className="card-body">
                        <h6 className="card-title">Previous Companies</h6>
                        <ul className="list-unstyled mb-0">
                          {selectedCandidateForModal.previousCompanies?.map((company, idx) => (
                            <li key={idx} className="small mb-1">
                              • {company}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Interview Details */}
                  <div className="col-md-8">
                    {/* AI Score */}
                    <div className="card border shadow-none mb-3">
                      <div className="card-body">
                        <div className="d-flex align-items-center justify-content-between mb-3">
                          <h6 className="mb-0">AI Assessment Score</h6>
                          <span
                            className={`badge fs-6 ${
                              selectedCandidateForModal.aiScore >= 80
                                ? 'bg-success-subtle text-success'
                                : selectedCandidateForModal.aiScore >= 70
                                ? 'bg-warning-subtle text-warning'
                                : 'bg-danger-subtle text-danger'
                            }`}
                          >
                            {selectedCandidateForModal.aiScore}%
                          </span>
                        </div>
                        <div className="progress mb-3" style={{ height: '10px' }}>
                          <div
                            className={`progress-bar ${
                              selectedCandidateForModal.aiScore >= 80
                                ? 'bg-success'
                                : selectedCandidateForModal.aiScore >= 70
                                ? 'bg-warning'
                                : 'bg-danger'
                            }`}
                            style={{ width: `${selectedCandidateForModal.aiScore}%` }}
                          />
                        </div>

                        {/* Detailed Scores */}
                        <div className="row g-3">
                          {Object.entries(selectedCandidateForModal.scores).map(
                            ([category, score]) => (
                              <div key={category} className="col-6">
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                  <span className="small text-muted text-capitalize">
                                    {category === 'overall'
                                      ? 'Overall Fit'
                                      : category === 'technical'
                                      ? 'Technical Knowledge'
                                      : category}
                                  </span>
                                  <span className="small fw-semibold">{score}%</span>
                                </div>
                                <div className="progress" style={{ height: '6px' }}>
                                  <div
                                    className={`progress-bar ${
                                      score >= 80
                                        ? 'bg-success'
                                        : score >= 70
                                        ? 'bg-warning'
                                        : 'bg-danger'
                                    }`}
                                    style={{ width: `${score}%` }}
                                  />
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Sentiment Analysis */}
                    <div className="card border shadow-none mb-3">
                      <div className="card-body">
                        <h6 className="card-title">Sentiment Analysis</h6>
                        <div className="row g-3">
                          <div className="col-4">
                            <div className="p-3 bg-success-subtle rounded border border-success-subtle">
                              <p className="small text-muted mb-1">Tone</p>
                              <p className="fw-semibold text-success mb-0">
                                {selectedCandidateForModal.sentiment.tone}
                              </p>
                            </div>
                          </div>
                          <div className="col-4">
                            <div className="p-3 bg-info-subtle rounded border border-info-subtle">
                              <p className="small text-muted mb-1">Confidence</p>
                              <p className="fw-semibold text-info mb-0">
                                {selectedCandidateForModal.sentiment.confidence}
                              </p>
                            </div>
                          </div>
                          <div className="col-4">
                            <div className="p-3 bg-warning-subtle rounded border border-warning-subtle">
                              <p className="small text-muted mb-1">Engagement</p>
                              <p className="fw-semibold text-warning mb-0">
                                {selectedCandidateForModal.sentiment.engagement}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Keywords */}
                    <div className="card border shadow-none mb-3">
                      <div className="card-body">
                        <h6 className="card-title">Key Terms Identified</h6>
                        <div className="d-flex flex-wrap gap-2">
                          {selectedCandidateForModal.keywords.map((keyword, idx) => (
                            <span key={idx} className="badge bg-primary-subtle text-primary">
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* AI Verdict */}
                    <div className="card border shadow-none">
                      <div className="card-body">
                        <h6 className="card-title">AI Verdict</h6>
                        <div className="p-3 bg-primary-subtle rounded border border-primary-subtle">
                          <p className="mb-0">{selectedCandidateForModal.verdict}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-primary d-flex align-items-center"
                  onClick={() => {
                    setSelectedCandidate(
                      answers.findIndex((c) => c.name === selectedCandidateForModal.name)
                    );
                    setCurrentQuestion(0);
                    closeModal();
                  }}
                >
                  <Eye size={16} className="me-2" />
                  View Full Interview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Offer Template Selection Modal */}
      {showOfferModal && candidate && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div
            className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable"
            style={{ maxWidth: '1200px', width: '95%' }}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Send Job Offer to {candidate.name}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowOfferModal(false)}
                  disabled={sendingOffer}
                ></button>
              </div>
              <div className="modal-body">
                {/* Template Selection */}
                <div className="mb-4">
                  <label className="form-label fw-semibold">Select Offer Template <span className="text-danger">*</span></label>
                  <select
                    className="form-select"
                    value={selectedTemplateId}
                    onChange={(e) => handleTemplateSelect(e.target.value)}
                    disabled={sendingOffer}
                    required
                  >
                    <option value="">-- Select a Template --</option>
                    {offerTemplates.map(template => (
                      <option key={template.id} value={template.id}>
                        {template.name} {template.position ? `- ${template.position}` : ''}
                      </option>
                    ))}
                  </select>
                  {offerTemplates.length === 0 && (
                    <small className="text-muted d-block mt-1">
                      No templates available. Please create templates in the Offer Templates page first.
                    </small>
                  )}
                  {selectedTemplateId && (
                    <small className="text-success d-block mt-1">
                      ✓ Template selected. Form fields have been auto-filled.
                    </small>
                  )}
                </div>

                {/* Position */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Position <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    value={offerData.position}
                    onChange={(e) => setOfferData({ ...offerData, position: e.target.value })}
                    disabled={sendingOffer}
                    required
                  />
                </div>

                {/* Department */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Department</label>
                  <input
                    type="text"
                    className="form-control"
                    value={offerData.department}
                    onChange={(e) => setOfferData({ ...offerData, department: e.target.value })}
                    disabled={sendingOffer}
                  />
                </div>

                {/* Salary */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Salary Offered</label>
                  <input
                    type="number"
                    className="form-control"
                    value={offerData.salary_offered}
                    onChange={(e) => setOfferData({ ...offerData, salary_offered: e.target.value })}
                    disabled={sendingOffer}
                    placeholder="e.g., 50000"
                  />
                </div>

                {/* Benefits */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Benefits (comma-separated)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={offerData.benefits}
                    onChange={(e) => setOfferData({ ...offerData, benefits: e.target.value })}
                    disabled={sendingOffer}
                    placeholder="e.g., Health Insurance, 401k, Paid Time Off"
                  />
                </div>

                {/* Offer Content */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Offer Content <span className="text-danger">*</span></label>
                  <textarea
                    className="form-control"
                    rows="8"
                    value={offerData.offer_content}
                    onChange={(e) => setOfferData({ ...offerData, offer_content: e.target.value })}
                    disabled={sendingOffer}
                    required
                    placeholder="Dear [Candidate Name],&#10;&#10;We are pleased to offer you the position of..."
                  />
                </div>

                {/* Expiry Days */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Offer Validity (Days)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={offerData.expiry_days}
                    onChange={(e) => setOfferData({ ...offerData, expiry_days: e.target.value })}
                    disabled={sendingOffer}
                    min="1"
                  />
                </div>

                {/* Notes */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Internal Notes (Optional)</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={offerData.notes}
                    onChange={(e) => setOfferData({ ...offerData, notes: e.target.value })}
                    disabled={sendingOffer}
                    placeholder="Internal notes (not sent to candidate)"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowOfferModal(false)}
                  disabled={sendingOffer}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-success d-flex align-items-center"
                  onClick={handleSendOffer}
                  disabled={sendingOffer || !selectedTemplateId || !offerData.position || !offerData.offer_content}
                >
                  {sendingOffer ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Sending...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={16} className="me-2" />
                      Send Offer
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .spinner {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default ReviewAIInterview;
