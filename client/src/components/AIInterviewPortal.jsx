import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Video,
  Type,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader,
  Camera,
  Mic,
  Square
} from 'lucide-react';
import { BASE_URL } from '../config/api.config';
import { aiInterviewAPI } from '../utils/api';

// Add pulse animation style
const pulseStyle = `
  @keyframes pulse {
    0% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.2);
      opacity: 0.7;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }
`;

const AIInterviewPortal = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Extract URL parameters
  const candidateId = searchParams.get('candidate_id');
  const candidateName = searchParams.get('name');
  const candidateEmail = searchParams.get('email');
  const templateId = searchParams.get('template_id');
  
  // State management
  const [step, setStep] = useState('otp'); // otp, instructions, interview, completed
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [videoStream, setVideoStream] = useState(null);
  const videoPreviewRef = useRef(null);
  const [verifiedCandidateId, setVerifiedCandidateId] = useState(candidateId);
  const [otpSending, setOtpSending] = useState(false);

  // Send OTP when component mounts
  useEffect(() => {
    if (candidateEmail && candidateName && step === 'otp') {
      sendOTP();
    }
  }, [candidateEmail, candidateName]);

  // Timer countdown
  useEffect(() => {
    if (timeRemaining !== null && timeRemaining > 0 && step === 'interview') {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0) {
      handleAutoSubmit();
    }
  }, [timeRemaining, step]);

  // Send OTP to candidate's email via backend
  const sendOTP = async () => {
    setOtpSending(true);
    try {
      const data = await aiInterviewAPI.sendOTP(candidateEmail, candidateName);
      
      if (data.success) {
        // Store candidate_id for later use
        if (data.candidate_id) {
          setVerifiedCandidateId(data.candidate_id);
        }
        
        // For demo: show OTP if email sending failed
        if (data.otp) {
          alert(`OTP sent to your email!\n\nFor demo purposes, your OTP is: ${data.otp}\n\n(In production, check your email)`);
        } else {
          alert(`✅ OTP has been sent to ${candidateEmail}\n\nPlease check your email and enter the 6-digit code.`);
        }
      } else {
        throw new Error(data.detail || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      const errorMessage = error.detail || error.message || 'Failed to send OTP. Please try again or contact support.';
      alert(errorMessage);
    } finally {
      setOtpSending(false);
    }
  };

  // Verify OTP via backend
  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      setOtpError('Please enter a 6-digit OTP');
      return;
    }

    setLoading(true);
    setOtpError('');
    
    try {
      const data = await aiInterviewAPI.verifyOTP(candidateEmail, otp);

      if (data.success) {
        // Store verified candidate ID
        setVerifiedCandidateId(data.candidate_id);
        setOtpError('');
        setStep('instructions');
        fetchQuestions();
      } else {
        setOtpError(data.detail || 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      const errorMessage = error.detail || error.message || 'Failed to verify OTP. Please try again.';
      setOtpError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Fetch interview questions
  const fetchQuestions = async () => {
    setLoading(true);
    try {
      // Use template_id from URL params if available
      const templateIdParam = templateId ? parseInt(templateId) : null;
      const data = await aiInterviewAPI.getQuestions(templateIdParam);
      
      console.log('📝 Fetched questions:', data);
      
      if (!data || data.length === 0) {
        alert('No questions found in this template. Please contact support.');
        return;
      }
      
        setQuestions(data);
        // Initialize answers object
        const initialAnswers = {};
        data.forEach(q => {
          initialAnswers[q.id] = { text: '', video: null };
        });
        setAnswers(initialAnswers);
    } catch (error) {
      console.error('Error fetching questions:', error);
      const errorMessage = error.detail || error.message || 'Error loading interview questions. Please check your connection and try again.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Start interview
  const handleStartInterview = () => {
    if (!questions || questions.length === 0) {
      alert('No interview questions available. Please contact support.');
      return;
    }
    setStep('interview');
    // Set timer if needed (e.g., 45 minutes = 2700 seconds)
    setTimeRemaining(2700);
  };

  // Handle text answer change
  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: { ...prev[questionId], text: value }
    }));
  };

  // Start video and audio recording
  const startRecording = async (questionId) => {
    try {
      // Request both video and audio permissions
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        }, 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        }
      });
      
      // Store stream for preview and cleanup
      setVideoStream(stream);
      
      // Set up video preview
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
        videoPreviewRef.current.play();
      }
      
      // Create MediaRecorder with both video and audio
      const options = { mimeType: 'video/webm;codecs=vp9,opus' };
      let recorder;
      
      // Try to use preferred codec, fallback to default
      if (MediaRecorder.isTypeSupported(options.mimeType)) {
        recorder = new MediaRecorder(stream, options);
      } else if (MediaRecorder.isTypeSupported('video/webm')) {
        recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      } else {
        recorder = new MediaRecorder(stream); // Use default
      }
      
      const chunks = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };
      
      recorder.onstop = () => {
        // Create video blob (contains both video and audio)
        const mimeType = recorder.mimeType || 'video/webm';
        const blob = new Blob(chunks, { type: mimeType });
        
        console.log('🎬 Recording stopped, blob created:', {
          blobSize: blob.size,
          blobType: blob.type,
          chunksCount: chunks.length,
          totalChunksSize: chunks.reduce((sum, chunk) => sum + (chunk.size || 0), 0),
          questionId: questionId
        });
        
        if (blob.size === 0) {
          console.error('❌ Warning: Video blob is empty!');
          alert('Recording failed. The video file is empty. Please try recording again.');
          // Clean up even if blob is empty
          if (stream) {
            stream.getTracks().forEach(track => track.stop());
          }
          if (videoPreviewRef.current) {
            videoPreviewRef.current.srcObject = null;
          }
          setVideoStream(null);
          setMediaRecorder(null);
          return;
        }
        
        // Save blob to state
        setAnswers(prev => ({
          ...prev,
          [questionId]: { ...prev[questionId], video: blob }
        }));
        
        // Stop all tracks and clear preview after blob is saved
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        if (videoPreviewRef.current) {
          videoPreviewRef.current.srcObject = null;
        }
        setVideoStream(null);
        setMediaRecorder(null);
        
        console.log('✅ Video blob saved to answers state, size:', blob.size, 'bytes');
      };

      recorder.onerror = (e) => {
        console.error('MediaRecorder error:', e);
        alert('Error during recording. Please try again.');
        stopRecording();
      };

      // Start recording
      recorder.start(1000); // Collect data every second
      setMediaRecorder(recorder);
      setIsRecording(true);
      
      console.log('✅ Video and audio recording started');
    } catch (error) {
      console.error('Error accessing camera/microphone:', error);
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        alert('Camera and microphone access denied. Please allow permissions and try again.');
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        alert('No camera or microphone found. Please connect devices and try again.');
      } else {
        alert('Unable to access camera/microphone. Please check your device permissions.');
      }
    }
  };

  // Stop video and audio recording
  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      console.log('🛑 Stopping recording, state:', mediaRecorder.state);
      
      // Request final data before stopping
      if (mediaRecorder.state === 'recording') {
        mediaRecorder.requestData();
      }
      
      mediaRecorder.stop();
      setIsRecording(false);
      // Don't set mediaRecorder to null yet - wait for onstop to complete
    }
    
    // Stop video stream and clear preview (but keep stream reference until blob is created)
    // We'll stop tracks in the onstop handler after blob is created
  };
  
  // Cleanup on unmount or question change
  useEffect(() => {
    return () => {
      if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
      }
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
      }
    };
  }, [currentQuestionIndex]);

  // Submit current answer
  const handleSubmitAnswer = async (questionId) => {
    // Stop recording if still recording
    if (isRecording) {
      stopRecording();
      // Wait a bit for recording to stop and blob to be created
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Validate that answer exists - require video for all questions
    const answer = answers[questionId];
    if (!answer || !answer.video) {
      alert('Please record a video response before submitting.');
      return;
    }
    
    // Validate candidate_id
    if (!verifiedCandidateId && !candidateId) {
      alert('Candidate ID not found. Please verify OTP again.');
      return;
    }
    
    setLoading(true);
    try {
      const currentQuestion = questions.find(q => q.id === questionId);
      if (!currentQuestion) {
        throw new Error('Question not found');
      }
      
      // Create FormData as required by backend
      const formData = new FormData();
      formData.append('candidate_id', verifiedCandidateId || candidateId);
      formData.append('question_id', questionId.toString()); // Backend expects int, but FormData sends as string
      formData.append('question_text', currentQuestion.text || '');
      
      if (answer.text) {
        formData.append('answer_text', answer.text);
      }
      
      if (answer.video) {
        // Video file contains both video and audio
        const videoBlob = answer.video;
        const mimeType = videoBlob.type || 'video/webm';
        const extension = mimeType.includes('mp4') ? 'mp4' : 'webm';
        const filename = `video_${questionId}_${Date.now()}.${extension}`;
        
        // Ensure we have a valid blob
        if (videoBlob instanceof Blob && videoBlob.size > 0) {
          formData.append('video', videoBlob, filename);
          console.log('📹 Sending video file:', {
            filename: filename,
            size: videoBlob.size,
            type: mimeType,
            blobType: videoBlob.constructor.name
          });
        } else {
          console.error('❌ Invalid video blob:', {
            isBlob: videoBlob instanceof Blob,
            size: videoBlob?.size,
            type: typeof videoBlob
          });
          alert('Video file is invalid. Please record again.');
          return;
        }
      } else {
        console.warn('⚠️ No video file to send for question:', questionId);
        alert('Please record a video response before submitting.');
        return;
      }
      
      // Debug: Log FormData contents
      console.log('📤 FormData contents:');
      for (let [key, value] of formData.entries()) {
        if (value instanceof File || value instanceof Blob) {
          console.log(`   ${key}: [File/Blob] ${value.name || 'unnamed'}, size: ${value.size}, type: ${value.type}`);
        } else {
          console.log(`   ${key}: ${value}`);
        }
      }

      // Use API utility for submit answer
      const data = await aiInterviewAPI.submitAnswer(formData);
      
      console.log('✅ Answer submitted successfully. AI Score:', data.score);
      
      // Move to next question or complete
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        // Reset recording state for next question
        setIsRecording(false);
        setMediaRecorder(null);
      } else {
        setStep('completed');
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      const errorMessage = error.detail || error.message || 'Failed to submit answer. Please try again.';
      alert(`Failed to submit answer: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Auto-submit when time runs out
  const handleAutoSubmit = () => {
    alert('Time is up! Submitting your interview.');
    setStep('completed');
  };

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = questions[currentQuestionIndex];

  // OTP Verification Screen
  if (step === 'otp') {
    return (
      <>
        <style>{pulseStyle}</style>
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="card shadow-lg" style={{ maxWidth: '500px', width: '100%' }}>
          <div className="card-body p-5">
            <div className="text-center mb-4">
              <div className="bg-primary-subtle rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '80px', height: '80px' }}>
                <Video size={40} className="text-primary" />
              </div>
              <h3 className="mb-2">AI Interview Verification</h3>
              <p className="text-secondary-light">
                Hello, <strong>{candidateName}</strong>
              </p>
            </div>

            <div className="alert alert-info mb-4">
              <AlertCircle size={20} className="me-2" />
              An OTP has been sent to <strong>{candidateEmail}</strong>
            </div>

            <div className="mb-3">
              <label className="form-label">Enter OTP *</label>
              <input
                type="text"
                className={`form-control form-control-lg text-center ${otpError ? 'is-invalid' : ''}`}
                placeholder="000000"
                maxLength="6"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                onKeyPress={(e) => e.key === 'Enter' && handleVerifyOTP()}
              />
              {otpError && <div className="invalid-feedback">{otpError}</div>}
            </div>

            <button
              onClick={handleVerifyOTP}
              disabled={otp.length !== 6 || loading}
              className="btn btn-primary btn-lg w-100 mb-3"
            >
              {loading ? (
                <>
                  <Loader className="spin me-2" size={20} />
                  Verifying...
                </>
              ) : (
                'Verify & Continue'
              )}
            </button>

            <button
              onClick={sendOTP}
              disabled={otpSending}
              className="btn btn-outline-secondary w-100"
            >
              {otpSending ? (
                <>
                  <Loader className="spin me-2" size={16} />
                  Sending...
                </>
              ) : (
                'Resend OTP'
              )}
            </button>
          </div>
        </div>
      </div>
      </>
    );
  }

  // Instructions Screen
  if (step === 'instructions') {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="card shadow-lg" style={{ maxWidth: '700px', width: '100%' }}>
          <div className="card-body p-5">
            <div className="text-center mb-4">
              <CheckCircle size={60} className="text-success mb-3" />
              <h3 className="mb-2">Welcome to Your AI Interview</h3>
              <p className="text-secondary-light">Please read the instructions carefully</p>
            </div>

            {loading ? (
              <div className="text-center py-4">
                <Loader className="spin text-primary mb-3" size={40} />
                <p className="text-secondary-light">Loading interview questions...</p>
              </div>
            ) : questions.length === 0 ? (
              <div className="alert alert-warning text-center">
                <AlertCircle size={24} className="mb-2" />
                <p className="mb-0">No interview questions available. Please contact support.</p>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <h5 className="mb-3">📋 Instructions:</h5>
                  <ul className="list-unstyled">
                    <li className="mb-2">
                      <CheckCircle size={16} className="text-success me-2" />
                      You have {questions.length} questions to answer
                    </li>
                <li className="mb-2">
                  <CheckCircle size={16} className="text-success me-2" />
                  You will record a video response (with audio) for each question
                </li>
                <li className="mb-2">
                  <CheckCircle size={16} className="text-success me-2" />
                  Make sure you're in a quiet environment with good lighting
                </li>
                <li className="mb-2">
                  <CheckCircle size={16} className="text-success me-2" />
                  Ensure your camera and microphone are working properly
                </li>
                <li className="mb-2">
                  <CheckCircle size={16} className="text-success me-2" />
                  Take your time and answer thoughtfully
                </li>
              </ul>
            </div>

                <div className="alert alert-warning mb-4">
                  <Clock size={20} className="me-2" />
                  Time Limit: {formatTime(timeRemaining || 0)}
                </div>

                <button
                  onClick={handleStartInterview}
                  disabled={loading || questions.length === 0}
                  className="btn btn-primary btn-lg w-100"
                >
                  {loading ? (
                    <>
                      <Loader className="spin me-2" size={20} />
                      Loading Questions...
                    </>
                  ) : (
                    'Start Interview'
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Interview Screen
  if (step === 'interview' && currentQuestion) {
    return (
      <>
        <style>{pulseStyle}</style>
        <div className="min-vh-100 bg-light py-4">
        <div className="container">
          {/* Header */}
          <div className="card shadow-sm mb-3">
            <div className="card-body py-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="mb-0">AI Interview - {candidateName}</h5>
                  <p className="text-sm text-secondary-light mb-0">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </p>
                </div>
                <div className="d-flex align-items-center gap-3">
                  <div className="text-end">
                    <Clock size={20} className="text-warning" />
                    <span className="ms-2 fw-semibold">{formatTime(timeRemaining)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="progress mb-4" style={{ height: '8px' }}>
            <div
              className="progress-bar bg-primary"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            />
          </div>

          {/* Question Card */}
          <div className="card shadow-lg">
            <div className="card-body p-5">
              <div className="mb-4">
                <span className="badge bg-info-subtle text-info mb-3">
                  📹 Video Response (with Audio)
                </span>
                <h4 className="mb-0">{currentQuestion.text}</h4>
              </div>

              {/* Video Answer (with Audio) - Always show video recording for all questions */}
              {(currentQuestion.type === 'video' || currentQuestion.type === 'text') && (
                <div className="mb-4">
                  <label className="form-label">Video Response (with Audio):</label>
                  <div className="bg-dark rounded p-3">
                    {/* Video Preview */}
                    <div className="position-relative mb-3" style={{ minHeight: '300px', backgroundColor: '#000' }}>
                      <video
                        ref={videoPreviewRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-100 h-100"
                        style={{ 
                          maxHeight: '400px',
                          objectFit: 'contain',
                          display: isRecording || answers[currentQuestion.id]?.video ? 'block' : 'none'
                        }}
                      />
                      
                      {!isRecording && !answers[currentQuestion.id]?.video && (
                        <div className="position-absolute top-50 start-50 translate-middle text-center text-white">
                          <Camera size={48} className="mb-3" />
                          <p className="mb-0">Camera preview will appear here</p>
                        </div>
                      )}
                      
                      {isRecording && (
                        <div className="position-absolute top-0 start-0 m-3">
                          <div className="bg-danger rounded px-3 py-2 d-flex align-items-center gap-2">
                            <div 
                              className="bg-white rounded-circle" 
                              style={{ 
                                width: '12px', 
                                height: '12px', 
                                animation: 'pulse 1s ease-in-out infinite',
                                boxShadow: '0 0 0 0 rgba(255, 255, 255, 0.7)'
                              }}
                            ></div>
                            <span className="text-white fw-bold">REC</span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Recording Controls */}
                    <div className="text-center">
                      {!isRecording && !answers[currentQuestion.id]?.video && (
                        <button
                          onClick={() => startRecording(currentQuestion.id)}
                          className="btn btn-danger btn-lg"
                        >
                          <Video size={20} className="me-2" />
                          Start Recording Video & Audio
                        </button>
                      )}

                      {isRecording && (
                        <div>
                          <div className="mb-3">
                            <Mic size={32} className="text-danger mb-2" />
                            <p className="text-white mb-0">Recording video and audio...</p>
                            <p className="text-white-50 small mb-0">Speak clearly and look at the camera</p>
                          </div>
                          <button
                            onClick={stopRecording}
                            className="btn btn-danger btn-lg"
                          >
                            <Square size={20} className="me-2" />
                            Stop Recording
                          </button>
                        </div>
                      )}

                      {!isRecording && answers[currentQuestion.id]?.video && (
                        <div>
                          <CheckCircle size={32} className="text-success mb-2" />
                          <p className="text-white mb-3">Video and audio recorded successfully!</p>
                          
                          {/* Video Preview */}
                          <video
                            src={URL.createObjectURL(answers[currentQuestion.id].video)}
                            controls
                            className="w-100 mb-3"
                            style={{ maxHeight: '300px' }}
                          >
                            Your browser does not support the video element.
                          </video>
                          
                          <div className="d-flex gap-2 justify-content-center">
                            <button
                              onClick={() => {
                                setAnswers(prev => ({
                                  ...prev,
                                  [currentQuestion.id]: { ...prev[currentQuestion.id], video: null }
                                }));
                              }}
                              className="btn btn-outline-light"
                            >
                              Delete & Re-record
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="d-flex justify-content-between">
                <button
                  onClick={() => {
                    // Stop recording if active before going back
                    if (isRecording) {
                      stopRecording();
                    }
                    setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1));
                  }}
                  disabled={currentQuestionIndex === 0 || loading}
                  className="btn btn-outline-secondary"
                >
                  Previous
                </button>

                <button
                  onClick={() => handleSubmitAnswer(currentQuestion.id)}
                  disabled={
                    loading ||
                    isRecording ||
                    !answers[currentQuestion.id]?.video
                  }
                  className="btn btn-primary btn-lg"
                >
                  {loading ? (
                    <>
                      <Loader className="spin me-2" size={20} />
                      Submitting...
                    </>
                  ) : isRecording ? (
                    <>
                      <Square size={20} className="me-2" />
                      Stop Recording First
                    </>
                  ) : currentQuestionIndex === questions.length - 1 ? (
                    <>
                      <Send size={20} className="me-2" />
                      Submit Interview
                    </>
                  ) : (
                    <>
                      Submit & Next Question
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      </>
    );
  }

  // Fallback for interview step when no questions
  if (step === 'interview' && !currentQuestion) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="card shadow-lg" style={{ maxWidth: '600px', width: '100%' }}>
          <div className="card-body p-5 text-center">
            <AlertCircle size={60} className="text-warning mb-4" />
            <h3 className="mb-3">No Questions Available</h3>
            <p className="text-secondary-light mb-4">
              We're unable to load interview questions at this time.
            </p>
            <button
              onClick={() => {
                setStep('otp');
                setQuestions([]);
              }}
              className="btn btn-primary"
            >
              Return to Start
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Completion Screen
  if (step === 'completed') {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="card shadow-lg" style={{ maxWidth: '600px', width: '100%' }}>
          <div className="card-body p-5 text-center">
            <CheckCircle size={80} className="text-success mb-4" />
            <h2 className="mb-3">Interview Completed!</h2>
            <p className="text-secondary-light mb-4">
              Thank you, <strong>{candidateName}</strong>, for completing the AI interview.
              Your responses have been submitted successfully.
            </p>

            <div className="alert alert-info mb-4">
              <p className="mb-2"><strong>What happens next?</strong></p>
              <ul className="list-unstyled mb-0 text-start">
                <li className="mb-2">✓ Our AI will analyze your responses</li>
                <li className="mb-2">✓ Our recruitment team will review your interview</li>
                <li className="mb-2">✓ We'll contact you within 3-5 business days</li>
              </ul>
            </div>

            <button
              onClick={() => navigate('/')}
              className="btn btn-primary"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center">
      <Loader className="spin" size={48} />
    </div>
  );
};

export default AIInterviewPortal;

