import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const InstructionPage = () => {
  const navigate = useNavigate();
  const [micPermission, setMicPermission] = useState(false);
  const [cameraPermission, setCameraPermission] = useState(false);
  const [examTime, setExamTime] = useState(30 * 60); // 30 minutes in seconds
  const [isExamStarted, setIsExamStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30 * 60);

  useEffect(() => {
    let interval = null;
    if (isExamStarted && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Exam time expired
      alert('Exam time has expired! Your answers will be submitted automatically.');
    }
    return () => clearInterval(interval);
  }, [isExamStarted, timeLeft]);

  const requestMicPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicPermission(true);
      // Stop the stream as we just needed permission
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      console.error('Microphone permission denied:', error);
      alert('Microphone permission is required for the exam. Please allow access.');
    }
  };

  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraPermission(true);
      // Stop the stream as we just needed permission
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      console.error('Camera permission denied:', error);
      alert('Camera permission is required for the exam. Please allow access.');
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${minutes.toString().padStart(2, '0')}`;
  };

  const startExam = () => {
    if (micPermission && cameraPermission) {
      setIsExamStarted(true);
      // Redirect to exam page
      navigate('/exam');
    } else {
      alert('Please grant both microphone and camera permissions before starting the exam.');
    }
  };

  return (
    <div className="min-vh-100 bg-gradient-primary">
      {/* Header */}
      <header className="shadow-lg sticky-top">
        <div className="container-fluid">
          <div className="row align-items-center py-3">
            <div className="col-6">
              <h1 className="text-primary mb-0 fw-bold fs-3">Appitude Hire</h1>
            </div>
            <div className="col-6 text-end">
              {isExamStarted && (
                <div className="text-white">
                  <span className="badge bg-danger fs-6">Time Remaining: {formatTime(timeLeft)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container-fluid py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10">
            <div className="bg-white rounded-3 shadow-lg p-5">
              <div className="text-center mb-5">
                <h2 className="text-primary fw-bold mb-3">Exam Instructions</h2>
                <p className="text-muted fs-5">Please read all instructions carefully before starting your exam</p>
              </div>

              <div className="row g-4">
                {/* Left Column - Instructions */}
                <div className="col-lg-8">
                  {/* General Instructions */}
                  <div className="mb-4">
                    <h4 className="text-primary mb-3 fw-bold">
                      <span className="me-2">📋</span>
                      General Instructions
                    </h4>
                    <div className="bg-light p-4 rounded-3 border border-light">
                      <ul className="list-unstyled mb-0">
                        <li className="mb-3 d-flex align-items-start">
                          <span className="me-2 fw-bold text-primary">•</span>
                          <span><strong>Total Duration:</strong> 30 minutes for the entire exam</span>
                        </li>
                        <li className="mb-3 d-flex align-items-start">
                          <span className="me-2 fw-bold text-primary">•</span>
                          <span><strong>Question Types:</strong> Multiple Choice Questions (MCQs) and Reading Comprehension</span>
                        </li>
                        <li className="mb-3 d-flex align-items-start">
                          <span className="me-2 fw-bold text-primary">•</span>
                          <span><strong>Navigation:</strong> Use "Next" and "Previous" buttons to navigate between questions</span>
                        </li>
                        <li className="mb-3 d-flex align-items-start">
                          <span className="me-2 fw-bold text-primary">•</span>
                          <span><strong>Auto-Submit:</strong> Exam will automatically submit when time expires</span>
                        </li>
                        <li className="mb-3 d-flex align-items-start">
                          <span className="me-2 fw-bold text-primary">•</span>
                          <span><strong>No Back Navigation:</strong> Once you move to the next section, you cannot go back</span>
                        </li>
                        <li className="mb-3 d-flex align-items-start">
                          <span className="me-2 fw-bold text-primary">•</span>
                          <span><strong>Stable Internet:</strong> Ensure stable internet connection throughout the exam</span>
                        </li>
                        <li className="mb-0 d-flex align-items-start">
                          <span className="me-2 fw-bold text-primary">•</span>
                          <span>
                            <strong>Security Violations:</strong> If you trigger 5 warnings (e.g., pressing <strong>ESC</strong>, leaving the page, exiting fullscreen, using <strong>Alt+Tab</strong>, or pressing function keys), your exam will be <span className="text-danger fw-bold">automatically submitted</span>.
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Section Details */}
                  <div className="mb-4">
                    <h4 className="text-primary mb-3 fw-bold">
                      <span className="me-2">🎯</span>
                      Section Details
                    </h4>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <div className="bg-info bg-opacity-10 p-4 rounded-3 h-100 border border-info border-opacity-25">
                          <h6 className="text-info fw-bold mb-2">Reading Comprehension</h6>
                          <p className="mb-0 text-muted">5 questions, 10 minutes</p>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="bg-warning bg-opacity-10 p-4 rounded-3 h-100 border border-warning border-opacity-25">
                          <h6 className="text-warning fw-bold mb-2">Logical Reasoning</h6>
                          <p className="mb-0 text-muted">8 questions, 7 minutes</p>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="bg-success bg-opacity-10 p-4 rounded-3 h-100 border border-success border-opacity-25">
                          <h6 className="text-success fw-bold mb-2">Quantitative Aptitude</h6>
                          <p className="mb-0 text-muted">10 questions, 10 minutes</p>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="bg-danger bg-opacity-10 p-4 rounded-3 h-100 border border-danger border-opacity-25">
                          <h6 className="text-danger fw-bold mb-2">Verbal Ability</h6>
                          <p className="mb-0 text-muted">7 questions, 3 minutes</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Important Guidelines */}
                  <div className="mb-4">
                    <h4 className="text-primary mb-3 fw-bold">
                      <span className="me-2">⚠️</span>
                      Important Guidelines
                    </h4>
                    <div className="bg-warning bg-opacity-10 p-4 rounded-3 border border-warning border-opacity-25">
                      <ul className="list-unstyled mb-0">
                        <li className="mb-2">• Do not switch tabs or minimize the browser window</li>
                        <li className="mb-2">• Keep your face visible to the camera at all times</li>
                        <li className="mb-2">• Ensure good lighting and clear audio</li>
                        <li className="mb-2">• Do not use any external help or resources</li>
                        <li className="mb-0">• Your exam session is being monitored</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Right Column - Device Setup */}
                <div className="col-lg-4">
                  <div className="bg-light rounded-3 p-4 h-100 border border-light">
                    <h4 className="text-primary mb-4 fw-bold">
                      <span className="me-2">🔧</span>
                      Device Setup
                    </h4>
                    
                    {/* Microphone Setup */}
                    <div className="mb-4">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h6 className="mb-0 fw-semibold">Microphone</h6>
                        <span className={`badge ${micPermission ? 'bg-success' : 'bg-secondary'}`}>
                          {micPermission ? '✓ Connected' : 'Not Connected'}
                        </span>
                      </div>
                      {micPermission ? (
                        <input
                          type="text"
                          className="form-control"
                          value="Microphone Ready"
                          readOnly
                          style={{ backgroundColor: '#d4edda', borderColor: '#28a745' }}
                        />
                      ) : (
                        <button
                          onClick={requestMicPermission}
                          className="btn btn-outline-primary btn-sm w-100"
                        >
                          Test Microphone
                        </button>
                      )}
                    </div>

                    {/* Camera Setup */}
                    <div className="mb-4">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h6 className="mb-0 fw-semibold">Camera</h6>
                        <span className={`badge ${cameraPermission ? 'bg-success' : 'bg-secondary'}`}>
                          {cameraPermission ? '✓ Connected' : 'Not Connected'}
                        </span>
                      </div>
                      {cameraPermission ? (
                        <input
                          type="text"
                          className="form-control"
                          value="Camera Ready"
                          readOnly
                          style={{ backgroundColor: '#d4edda', borderColor: '#28a745' }}
                        />
                      ) : (
                        <button
                          onClick={requestCameraPermission}
                          className="btn btn-outline-primary btn-sm w-100"
                        >
                          Test Camera
                        </button>
                      )}
                    </div>

                    {/* System Requirements */}
                    <div className="mb-4">
                      <h6 className="text-primary mb-2 fw-semibold">System Requirements</h6>
                      <ul className="list-unstyled small text-muted mb-0">
                        <li className="mb-1">• Chrome, Firefox, or Edge browser</li>
                        <li className="mb-1">• Stable internet connection</li>
                        <li className="mb-1">• Working microphone and camera</li>
                        <li className="mb-0">• Minimum 2GB RAM</li>
                      </ul>
                    </div>

                    {/* Start Exam Button */}
                    <div className="text-center">
                      <button
                        onClick={startExam}
                        disabled={!micPermission || !cameraPermission || isExamStarted}
                        className="btn btn-success btn-lg w-100 fw-bold"
                        style={{ fontSize: '18px', padding: '12px' }}
                      >
                        {isExamStarted ? 'Exam in Progress...' : 'Start Exam'}
                      </button>
                      <p className="small text-muted mt-2 mb-0">
                        Exam Duration: 30 minutes
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Note */}
              <div className="mt-5 text-center">
                <div className="bg-primary bg-opacity-10 p-3 rounded-3 border border-primary border-opacity-25">
                  <p className="text-primary mb-0 fw-semibold">
                    <span className="me-2">🎓</span>
                    Good luck with your exam! Remember to stay focused and manage your time wisely.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructionPage;
