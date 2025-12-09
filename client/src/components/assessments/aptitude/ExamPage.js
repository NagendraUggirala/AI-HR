import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const ExamPage = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(3 * 60); // 1 minute for testing
  const [showWarning, setShowWarning] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isExamStarted, setIsExamStarted] = useState(true);
  const [skippedQuestions, setSkippedQuestions] = useState([]);
  const [showTimeUp, setShowTimeUp] = useState(false);
  const [showAnswerWarning, setShowAnswerWarning] = useState(false);
  const [securityViolations, setSecurityViolations] = useState(0);
  const [showSecurityWarning, setShowSecurityWarning] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const securityViolationSkipRef = useRef(0);
  const violationHistoryRef = useRef({ lastType: '', lastTime: 0 });
  const VIOLATION_DEBOUNCE_MS = 1500;

  const shouldSkipSecurityViolation = () => Date.now() < securityViolationSkipRef.current;
  const scheduleSecurityViolationSkip = (duration = 1500) => {
    securityViolationSkipRef.current = Date.now() + duration;
  };

  // Auto-submit function (defined early to avoid reference errors)
  const handleAutoSubmit = useCallback(() => {
    // Hide all warnings before showing success
    setShowWarning(false);
    setShowSecurityWarning(false);
    setShowSubmitConfirm(false);
    setShowTimeUp(false);
    
    setShowSuccess(true);
    setIsExamStarted(false);

    // Exit fullscreen before redirecting
    const exitFullscreen = () => {
      try {
        if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement) {
          if (document.exitFullscreen) {
            document.exitFullscreen();
          } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
          } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
          } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
          }
        }
      } catch (error) {
        console.log('Error exiting fullscreen:', error);
      }
    };

    exitFullscreen();

    // Hide success message after 3 seconds and redirect to home
    setTimeout(() => {
      setShowSuccess(false);
      navigate('/'); // Redirect to home page
    }, 3000);
  }, [navigate]);

  const registerSecurityViolation = useCallback(({ type = 'generic', autoHide = true, skipDuration = 0 } = {}) => {
    const now = Date.now();
    if (type && violationHistoryRef.current.lastType === type && now - violationHistoryRef.current.lastTime < VIOLATION_DEBOUNCE_MS) {
      return;
    }
    violationHistoryRef.current = { lastType: type, lastTime: now };
    if (skipDuration > 0) {
      scheduleSecurityViolationSkip(skipDuration);
    }
    setShowSecurityWarning(true);
    if (autoHide) {
      setTimeout(() => setShowSecurityWarning(false), 3000);
    }
    setSecurityViolations(prev => {
      const newCount = prev + 1;
      if (newCount >= 5) {
        setTimeout(() => {
          handleAutoSubmit();
        }, 2000);
      }
      return newCount;
    });
  }, [handleAutoSubmit]);


  // Sample aptitude questions (25 questions)
  const questions = [
    {
      id: 1,
      question: "HTML attributes provide additional information about the HTML element?",
      options: ["True", "False"],
      correct: 0,
      type: "Technical"
    },
    {
      id: 2,
      question: "If a train travels 120 km in 2 hours, what is its speed?",
      options: ["60 km/h", "40 km/h", "80 km/h", "100 km/h"],
      correct: 0,
      type: "Quantitative"
    },
    {
      id: 3,
      question: "Complete the series: 2, 4, 8, 16, ?",
      options: ["24", "32", "20", "28"],
      correct: 1,
      type: "Logical Reasoning"
    },
    {
      id: 4,
      question: "What is the synonym of 'Benevolent'?",
      options: ["Cruel", "Kind", "Strict", "Harsh"],
      correct: 1,
      type: "Verbal Ability"
    },
    {
      id: 5,
      question: "If 5x + 3 = 18, what is the value of x?",
      options: ["2", "3", "4", "5"],
      correct: 1,
      type: "Quantitative"
    },
    {
      id: 6,
      question: "Which number should come next in the pattern: 1, 4, 9, 16, 25, ?",
      options: ["30", "36", "35", "40"],
      correct: 1,
      type: "Logical Reasoning"
    },
    {
      id: 7,
      question: "What is the capital of France?",
      options: ["London", "Berlin", "Paris", "Madrid"],
      correct: 2,
      type: "General Knowledge"
    },
    {
      id: 8,
      question: "JavaScript is a programming language?",
      options: ["True", "False"],
      correct: 0,
      type: "Technical"
    },
    {
      id: 9,
      question: "What is 15% of 200?",
      options: ["25", "30", "35", "40"],
      correct: 1,
      type: "Quantitative"
    },
    {
      id: 10,
      question: "Which of the following is a prime number?",
      options: ["4", "6", "7", "8"],
      correct: 2,
      type: "Quantitative"
    },
    {
      id: 11,
      question: "What is the opposite of 'Generous'?",
      options: ["Kind", "Stingy", "Helpful", "Friendly"],
      correct: 1,
      type: "Verbal Ability"
    },
    {
      id: 12,
      question: "In a class of 30 students, 18 are girls. What percentage are boys?",
      options: ["40%", "50%", "60%", "70%"],
      correct: 0,
      type: "Quantitative"
    },
    {
      id: 13,
      question: "Which programming language is used for web development?",
      options: ["Python", "Java", "HTML", "C++"],
      correct: 2,
      type: "Technical"
    },
    {
      id: 14,
      question: "What comes next: A, C, E, G, ?",
      options: ["H", "I", "J", "K"],
      correct: 1,
      type: "Logical Reasoning"
    },
    {
      id: 15,
      question: "What is the square root of 144?",
      options: ["11", "12", "13", "14"],
      correct: 1,
      type: "Quantitative"
    },
    {
      id: 16,
      question: "Which is the largest planet in our solar system?",
      options: ["Earth", "Saturn", "Jupiter", "Neptune"],
      correct: 2,
      type: "General Knowledge"
    },
    {
      id: 17,
      question: "What is the result of 7 × 8?",
      options: ["54", "56", "58", "60"],
      correct: 1,
      type: "Quantitative"
    },
    {
      id: 18,
      question: "Which word means 'to make something better'?",
      options: ["Improve", "Destroy", "Ignore", "Avoid"],
      correct: 0,
      type: "Verbal Ability"
    },
    {
      id: 19,
      question: "What is the next number in the sequence: 3, 6, 12, 24, ?",
      options: ["36", "48", "30", "42"],
      correct: 1,
      type: "Logical Reasoning"
    },
    {
      id: 20,
      question: "CSS is used for styling web pages?",
      options: ["True", "False"],
      correct: 0,
      type: "Technical"
    },
    {
      id: 21,
      question: "What is 25% of 80?",
      options: ["15", "20", "25", "30"],
      correct: 1,
      type: "Quantitative"
    },
    {
      id: 22,
      question: "Which is the smallest country in the world?",
      options: ["Monaco", "Vatican City", "San Marino", "Liechtenstein"],
      correct: 1,
      type: "General Knowledge"
    },
    {
      id: 23,
      question: "What is the meaning of 'Ubiquitous'?",
      options: ["Rare", "Everywhere", "Expensive", "Difficult"],
      correct: 1,
      type: "Verbal Ability"
    },
    {
      id: 24,
      question: "If a rectangle has length 8 and width 6, what is its area?",
      options: ["42", "48", "52", "56"],
      correct: 1,
      type: "Quantitative"
    },
    {
      id: 25,
      question: "What is the missing number: 2, 5, 10, 17, 26, ?",
      options: ["35", "37", "39", "41"],
      correct: 1,
      type: "Logical Reasoning"
    }
  ];

  // Timer effect
  useEffect(() => {
    let interval = null;
    if (isExamStarted && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Time's up - show notification and auto submit
      setShowTimeUp(true);
      setTimeout(() => {
        setShowTimeUp(false);
        handleAutoSubmit();
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isExamStarted, timeLeft]);


  // Fullscreen and ESC key warning effect
  useEffect(() => {
    // Define requestFullscreen function first, before it's used
    const requestFullscreen = async () => {
      try {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        } else if (document.documentElement.webkitRequestFullscreen) {
          await document.documentElement.webkitRequestFullscreen();
        } else if (document.documentElement.mozRequestFullScreen) {
          await document.documentElement.mozRequestFullScreen();
        } else if (document.documentElement.msRequestFullscreen) {
          await document.documentElement.msRequestFullscreen();
        }
      } catch (error) {
        console.log('Fullscreen not supported or denied:', error);
      }
    };

    // Request fullscreen immediately when exam starts
    requestFullscreen();

    // Disable right-click
    const handleContextMenu = (e) => {
      e.preventDefault();
      registerSecurityViolation({ type: 'contextmenu' });
    };

    // Disable text selection
    const handleSelectStart = (e) => {
      e.preventDefault();
      return false;
    };

    // Disable common keyboard shortcuts and detect Alt+Tab
    const handleSecurityKeyDown = (e) => {
      // Detect Alt+Tab, Alt+Shift+Tab, Ctrl+Alt+Tab
      if (e.altKey && e.key === 'Tab') {
        e.preventDefault();
        registerSecurityViolation({ type: 'alttab', autoHide: false, skipDuration: 2200 });
        return;
      }

      // Detect Windows key combinations
      if (e.key === 'Meta' || (e.metaKey && ['Tab', 'L', 'R', 'D', 'E'].includes(e.key))) {
        e.preventDefault();
        registerSecurityViolation({ type: 'windowsKey' });
        return;
      }

      // Detect Alt+F4 (close window)
      if (e.altKey && e.key === 'F4') {
        e.preventDefault();
        registerSecurityViolation({ type: 'altF4' });
        return;
      }

      // Detect Ctrl+Alt combinations
      if (e.ctrlKey && e.altKey) {
        e.preventDefault();
        registerSecurityViolation({ type: 'ctrlAlt' });
        return;
      }

      if (e.ctrlKey || e.metaKey) {
        const blockedKeys = ['c', 'C', 'v', 'V', 'a', 'A', 'x', 'X', 's', 'S', 'p', 'P', 'i', 'I', 'u', 'U', 'h', 'H', 'f', 'F', 'g', 'G'];
        if (blockedKeys.includes(e.key)) {
          e.preventDefault();
          registerSecurityViolation({ type: 'keyboardShortcut' });
        }
      }

      // Block function keys
      if (['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'].includes(e.key)) {
        e.preventDefault();
        registerSecurityViolation({ type: 'functionKey' });
      }
    };

    // Add event listeners
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('selectstart', handleSelectStart);
    document.addEventListener('keydown', handleSecurityKeyDown);

    // Disable text selection globally
    document.body.style.userSelect = 'none';

    // Window focus and visibility detection
    const handleWindowBlur = () => {
      if (shouldSkipSecurityViolation()) {
        return;
      }
      registerSecurityViolation({ type: 'blur' });
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (shouldSkipSecurityViolation()) {
          return;
        }
        registerSecurityViolation({ type: 'visibility' });
      }
    };

    const handleWindowFocus = () => {
      // Re-request fullscreen when window regains focus
      requestFullscreen();
    };

    // Add focus/blur event listeners
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        
        // Immediately try to prevent fullscreen exit by re-entering
        const preventFullscreenExit = () => {
          try {
            if (document.documentElement.requestFullscreen) {
              document.documentElement.requestFullscreen().catch(() => {});
            } else if (document.documentElement.webkitRequestFullscreen) {
              document.documentElement.webkitRequestFullscreen();
            } else if (document.documentElement.mozRequestFullScreen) {
              document.documentElement.mozRequestFullScreen();
            } else if (document.documentElement.msRequestFullscreen) {
              document.documentElement.msRequestFullscreen();
            }
          } catch (error) {
            console.log('Error preventing fullscreen exit:', error);
          }
        };
        
        // Try to prevent exit immediately
        preventFullscreenExit();
        setTimeout(preventFullscreenExit, 50);
        setTimeout(preventFullscreenExit, 100);
        
        registerSecurityViolation({ type: 'esc' });
      }
    };

    // Listen for fullscreen changes
    const handleFullscreenChange = () => {
      if (shouldSkipSecurityViolation()) {
        return;
      }
      if (!document.fullscreenElement && !document.webkitFullscreenElement &&
        !document.mozFullScreenElement && !document.msFullscreenElement) {
        // Check if security warning modal is currently displayed
        const warningModal = document.querySelector('.modal.show');
        const isSecurityWarningShowing = warningModal && warningModal.querySelector('.modal-title')?.textContent?.includes('Security Warning');
        
        // Only show warning and re-enter if security warning is not already showing
        if (!isSecurityWarningShowing) {
          registerSecurityViolation({ type: 'fullscreen' });
          setTimeout(() => {
            requestFullscreen();
          }, 1000);
        } else {
          // If warning is already showing, just try to re-enter fullscreen silently
          // Don't increment violations again
          setTimeout(() => {
            requestFullscreen();
          }, 100);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('selectstart', handleSelectStart);
      document.removeEventListener('keydown', handleSecurityKeyDown);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, [registerSecurityViolation]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (questionId, answerIndex) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };


  const handlePreviousAnswer = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    } else {
      console.log("Already at the first question");
    }
  };


  const handleSubmitExam = () => {
    setShowSubmitConfirm(true);
  };

  const confirmSubmit = () => {
    // Hide all warnings before showing success
    setShowSubmitConfirm(false);
    setShowWarning(false);
    setShowSecurityWarning(false);
    setShowTimeUp(false);
    
    setShowSuccess(true);
    setIsExamStarted(false);

    // Exit fullscreen before redirecting
    const exitFullscreen = () => {
      try {
        if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement) {
          if (document.exitFullscreen) {
            document.exitFullscreen();
          } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
          } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
          } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
          }
        }
      } catch (error) {
        console.log('Error exiting fullscreen:', error);
      }
    };

    exitFullscreen();

    // Hide success message after 3 seconds and redirect to home
    setTimeout(() => {
      setShowSuccess(false);
      navigate('/');
    }, 3000);
  };

  const cancelSubmit = () => {
    setShowSubmitConfirm(false);
  };

  const handleWarningClose = () => {
    setShowWarning(false);

    // Re-enter fullscreen when warning is closed
    const requestFullscreen = async () => {
      try {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        } else if (document.documentElement.webkitRequestFullscreen) {
          await document.documentElement.webkitRequestFullscreen();
        } else if (document.documentElement.mozRequestFullScreen) {
          await document.documentElement.mozRequestFullScreen();
        } else if (document.documentElement.msRequestFullscreen) {
          await document.documentElement.msRequestFullscreen();
        }
      } catch (error) {
        console.log('Fullscreen not supported or denied:', error);
      }
    };

    setTimeout(() => {
      requestFullscreen();
    }, 200);
  };

  const handleSkipQuestion = () => {
    setSkippedQuestions(prev => [...prev, currentQ.id]);
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };



  const handleSubmitAnswer = () => {
    // Check if the user has selected an answer
    if (selectedAnswers[currentQ.id] !== undefined) {
      setShowAnswerWarning(false);

      // If not the last question, go to next
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        // If it's the last question, submit the exam
        console.log("Exam submitted successfully");
        setIsSubmitted(true);
      }

    } else {
      // Show warning for unanswered question
      setShowAnswerWarning(true);
      setTimeout(() => setShowAnswerWarning(false), 3000);
    }
  };

  const getQuestionStatus = (questionId) => {
    if (selectedAnswers[questionId] !== undefined) {
      return 'answered';
    } else if (skippedQuestions.includes(questionId)) {
      return 'skipped';
    } else if (questionId === currentQ.id) {
      return 'current';
    } else {
      return 'unanswered';
    }
  };

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleSecurityWarningClose = () => {
    setShowSecurityWarning(false);
    
    // Re-enter fullscreen when user clicks "Understood"
    const reEnterFullscreen = () => {
      const attemptFullscreen = () => {
        try {
          if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(() => {
              // Retry after a short delay
              setTimeout(attemptFullscreen, 200);
            });
          } else if (document.documentElement.webkitRequestFullscreen) {
            document.documentElement.webkitRequestFullscreen();
          } else if (document.documentElement.mozRequestFullScreen) {
            document.documentElement.mozRequestFullScreen();
          } else if (document.documentElement.msRequestFullscreen) {
            document.documentElement.msRequestFullscreen();
          }
        } catch (error) {
          console.log('Error re-entering fullscreen:', error);
        }
      };
      
      // First attempt immediately
      attemptFullscreen();
      // Second attempt after delay in case first fails
      setTimeout(attemptFullscreen, 300);
      // Third attempt as backup
      setTimeout(attemptFullscreen, 800);
    };

    reEnterFullscreen();
  };

  return (
    <div className="min-vh-100 bg-gradient-primary exam-fullscreen">

      {/* Header */}
      <header className="shadow-lg sticky-top">
        <div className="container-fluid">
          <div className="row align-items-center py-3">
            <div className="col-4">
              <h1 className="text-white mb-0 fw-bold fs-3" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.7)' }}>Appitude Hire</h1>
            </div>
            <div className="col-4 text-center">
              <div className="text-white">
                <div className="fs-4 fw-bold" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.7)' }}>{formatTime(timeLeft)}</div>
                <div className="small" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.7)' }}>TIME LEFT</div>
              </div>
            </div>
            <div className="col-4 text-end">
              <div className="text-white">
                <div className="small" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.7)' }}>QUESTIONS ATTEMPTED: {Object.keys(selectedAnswers).length}/{questions.length}</div>
                <button
                  className="btn btn-link text-white p-0 text-decoration-underline"
                  onClick={() => setShowSubmitConfirm(true)}
                  style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.7)' }}
                >
                  QUIT ASSESSMENT
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="container-fluid py-2">
        <div className="row">
          <div className="col-12">
            <div className="progress" style={{ height: '8px' }}>
              <div
                className="progress-bar bg-success"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-fluid py-4" style={{ minHeight: 'calc(100vh - 120px)' }}>
        <div className="row g-4 h-100">
          {/* Left Side - Question List */}
          <div className="col-lg-3 h-100">
            <div className="bg-primary rounded-3 shadow-lg p-3 h-100">
              <h5 className="text-primary mb-3 fw-bold">Questions</h5>
              <div className="row g-2" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {questions.map((question, index) => {
                  const status = getQuestionStatus(question.id);
                  return (
                    <div key={question.id} className="col-4 mb-2">
                      <button
                        className={`btn btn-sm w-100 ${status === 'current'
                            ? 'btn-primary'
                            : status === 'answered'
                              ? 'btn-success'
                              : status === 'skipped'
                                ? 'btn-warning'
                                : 'btn-outline-secondary'
                          }`}
                        onClick={() => setCurrentQuestion(index)}
                        style={{ minHeight: '35px' }}
                      >
                        {question.id}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-3">
                <h6 className="text-primary mb-2">Status:</h6>
                <div className="small text-muted">
                  <div className="d-flex align-items-center mb-1">
                    <div className="bg-primary rounded me-2" style={{ width: '12px', height: '12px' }}></div>
                    Current
                  </div>
                  <div className="d-flex align-items-center mb-1">
                    <div className="bg-success rounded me-2" style={{ width: '12px', height: '12px' }}></div>
                    Answered
                  </div>
                  <div className="d-flex align-items-center mb-1">
                    <div className="bg-danger rounded me-2" style={{ width: '12px', height: '12px' }}></div>
                    Skipped
                  </div>

                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Question Content */}
          <div className="col-lg-9 h-100">
            <div className="bg-white rounded-3 shadow-lg p-4 h-100">
              <div className="mb-4">
                <h4 className="text-dark mb-4 fw-bold">
                  {currentQ.question}
                </h4>
                <hr className="border-primary" style={{ borderWidth: '2px' }} />
              </div>

              {/* Answer Options */}
              <div className="mb-4">
                {currentQ.options.map((option, index) => (
                  <div key={index} className="mb-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name={`question-${currentQ.id}`}
                        id={`option-${index}`}
                        checked={selectedAnswers[currentQ.id] === index}
                        onChange={() => handleAnswerSelect(currentQ.id, index)}
                        style={{ transform: 'scale(1.2)' }}
                      />
                      <label
                        className="form-check-label text-dark fw-semibold ms-2"
                        htmlFor={`option-${index}`}
                        style={{ fontSize: '16px' }}
                      >
                        {option}
                      </label>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="text-center">

                <button
                  className="btn btn-outline-primary btn-lg me-3 px-5 py-2"
                  onClick={handlePreviousAnswer}
                  style={{ fontSize: '16px', fontWeight: 'bold' }}
                >
                  Previous
                </button>
                <button
                  className="btn btn-outline-primary btn-lg px-5 py-2"
                  onClick={handleSkipQuestion}
                  style={{ fontSize: '16px', fontWeight: 'bold' }}
                >
                  NEXT
                </button>
                
                <button
                  className={`btn ${isSubmitted ? 'btn-primary' : 'btn-outline-primary'} btn-lg me-3 px-5 py-2 m-3`}
                  onClick={handleSubmitExam}
                  style={{ fontSize: '16px', fontWeight: 'bold' }}
                >
                  SUBMIT
                </button>

              </div>

              {/* Answer Warning */}
              {showAnswerWarning && (
                <div className="mt-3 text-center">
                  <p className="text-danger fw-bold mb-0" style={{ fontSize: '14px' }}>
                    ⚠️ Please select an answer before submitting.
                  </p>
                </div>
              )}

              {/* Skip Instruction */}
              <div className="mt-4 text-center">
                <p className="text-muted small">
                  If you skip, you can attempt this question again after finishing all questions
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      

      {/* Security Warning Modal */}
      {showSecurityWarning && !showSuccess && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-danger">
                <h5 className="modal-title text-white fw-bold">🚨 Security Warning</h5>
              </div>
              <div className="modal-body">
                <p className="text-dark">
                  <strong>Security Violation Detected!</strong>
                </p>
                <div className="alert alert-danger">
                  <div className="d-flex align-items-center mb-2">
                    <strong className="me-2">Current Violations:</strong>
                    <span className="badge bg-danger fs-5">{securityViolations} / 5</span>
                  </div>
                  <div className="mt-2">
                    <strong>⚠️ Warning:</strong> You have violated exam security rules {securityViolations} time(s).
                  </div>
                </div>
                
                {securityViolations < 5 ? (
                  <div className="alert alert-warning">
                    <strong>Remaining Warnings:</strong> {5 - securityViolations} more violation(s) before automatic submission.
                    <br />
                    <strong className="text-danger mt-2 d-block">After 5 warnings, your exam will be automatically submitted!</strong>
                  </div>
                ) : (
                  <div className="alert alert-danger">
                    <strong className="fs-5">⚠️ Maximum Warnings Reached!</strong>
                    <br />
                    <strong>Your exam will be automatically submitted now.</strong>
                  </div>
                )}
                
                <div className="alert alert-info mt-3">
                  <strong>⚠️ Important:</strong> Please stay in fullscreen mode during the exam. Click "Understood" to re-enter fullscreen mode.
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-primary btn-lg w-100"
                  onClick={handleSecurityWarningClose}
                  disabled={securityViolations >= 5}
                >
                  Understood
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && !showSuccess && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-info">
                <h5 className="modal-title text-white fw-bold">📝 Submit Exam</h5>
              </div>
              <div className="modal-body">
                <p className="text-dark">
                  <strong>Are you sure you want to submit your exam?</strong>
                </p>
                <p className="text-muted">
                  Once submitted, you cannot make any changes to your answers.
                </p>
                <div className="alert alert-info">
                  <strong>Answered Questions:</strong> {Object.keys(selectedAnswers).length} of {questions.length}
                </div>
                <div className="alert alert-warning">
                  <strong>Note:</strong> Make sure you have reviewed all your answers before submitting.
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={cancelSubmit}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={confirmSubmit}
                >
                  Yes, Submit Exam
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Time Up Notification */}
      {showTimeUp && !showSuccess && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-warning">
                <h5 className="modal-title text-dark fw-bold">⏰ Time's Up!</h5>
              </div>
              <div className="modal-body text-center">
                <div className="mb-3">
                  <i className="fas fa-clock text-warning" style={{ fontSize: '3rem' }}></i>
                </div>
                <p className="text-dark fw-semibold">
                  Your exam time has expired. The assignment will be automatically submitted.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Success Notification */}
      {showSuccess && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10001 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title fw-bold">
                  <span className="me-2">✓</span>
                  Submitted Successfully
                </h5>
              </div>
              <div className="modal-body text-center">
                <div className="mb-3">
                  <div className="display-4 text-success mb-2">✓</div>
                  <p className="fw-bold fs-5 mb-2">Your assessment has been submitted successfully!</p>
                  <p className="text-muted mb-0">Thank you for completing the exam.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamPage;
