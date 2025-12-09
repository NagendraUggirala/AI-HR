import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Code, Play, Send, CheckCircle, AlertCircle, RefreshCw, Terminal } from 'lucide-react';
import { assessmentAPI } from '../../utils/api';

const CodingTest = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [step, setStep] = useState('otp'); // otp, coding, finalize
  const [candidateData, setCandidateData] = useState({
    name: searchParams.get('name') || '',
    email: searchParams.get('email') || ''
  });
  
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Coding state
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [output, setOutput] = useState('');
  const [submittedQuestions, setSubmittedQuestions] = useState([]);
  
  // Finalize state
  const [finalResult, setFinalResult] = useState(null);

  // Send OTP
  const handleSendOTP = async () => {
    if (!candidateData.name || !candidateData.email) {
      setError('Please provide name and email');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await assessmentAPI.coding.sendOTP(candidateData.name, candidateData.email);
      alert('OTP sent to your email!');
    } catch (err) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP and fetch questions
  const handleVerifyOTP = async () => {
    if (!otp) {
      setError('Please enter OTP');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await assessmentAPI.coding.verifyOTP(candidateData.email, otp);
      if (response.verified) {
        // Fetch coding questions
        const questionsData = await assessmentAPI.coding.getQuestions();
        setQuestions(questionsData.questions || []);
        setStep('coding');
        // Set initial code template
        setCode(getCodeTemplate(language));
      } else {
        setError('Invalid OTP');
      }
    } catch (err) {
      setError(err.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  // Get code template for language
  const getCodeTemplate = (lang) => {
    const currentQuestion = questions[currentQuestionIndex];
    switch (lang) {
      case 'python':
        return `# ${currentQuestion?.title || 'Solution'}\n\ndef solution():\n    # Write your code here\n    pass\n\nif __name__ == "__main__":\n    solution()`;
      case 'cpp':
        return `// ${currentQuestion?.title || 'Solution'}\n#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    return 0;\n}`;
      case 'java':
        return `// ${currentQuestion?.title || 'Solution'}\npublic class Main {\n    public static void main(String[] args) {\n        // Write your code here\n    }\n}`;
      default:
        return '';
    }
  };

  // Change language
  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    setCode(getCodeTemplate(newLang));
    setOutput('');
  };

  // Run code
  const handleRunCode = async () => {
    if (!code.trim()) {
      setError('Please write some code first');
      return;
    }
    
    setLoading(true);
    setError('');
    setOutput('');
    
    try {
      const currentQuestion = questions[currentQuestionIndex];
      const response = await assessmentAPI.coding.runCode(
        candidateData.name,
        candidateData.email,
        currentQuestion.title,
        language,
        code
      );
      
      setOutput(response.output || 'No output');
      if (!response.success) {
        setError('Code execution failed. Check the output below.');
      }
    } catch (err) {
      setError(err.message || 'Failed to run code');
      setOutput(err.message || 'Execution error');
    } finally {
      setLoading(false);
    }
  };

  // Submit code for current question
  const handleSubmitCode = async () => {
    if (!code.trim()) {
      setError('Please write some code first');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const currentQuestion = questions[currentQuestionIndex];
      const response = await assessmentAPI.coding.submitCode(
        candidateData.name,
        candidateData.email,
        currentQuestion.title,
        language,
        code
      );
      
      setSubmittedQuestions(prev => [...prev, currentQuestionIndex]);
      alert(`✅ Solution submitted for "${currentQuestion.title}"!`);
      setOutput(response.output || '');
      
      // Move to next question if available
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setCode(getCodeTemplate(language));
        setOutput('');
      }
    } catch (err) {
      setError(err.message || 'Failed to submit code');
    } finally {
      setLoading(false);
    }
  };

  // Finalize exam
  const handleFinalizeExam = async () => {
    if (submittedQuestions.length === 0) {
      if (!window.confirm('You haven\'t submitted any solutions. Finalize anyway?')) {
        return;
      }
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await assessmentAPI.coding.finalize(
        candidateData.name,
        candidateData.email
      );
      
      setFinalResult(response);
      setStep('finalize');
    } catch (err) {
      setError(err.message || 'Failed to finalize exam');
    } finally {
      setLoading(false);
    }
  };

  // Change question
  const handleQuestionChange = (index) => {
    setCurrentQuestionIndex(index);
    setCode(getCodeTemplate(language));
    setOutput('');
    setError('');
  };

  // OTP Step
  if (step === 'otp') {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="card shadow-lg" style={{ maxWidth: '500px', width: '100%' }}>
          <div className="card-body p-5">
            <div className="text-center mb-4">
              <div className="bg-primary-subtle p-3 rounded-circle d-inline-block mb-3">
                <Code size={48} className="text-primary" />
              </div>
              <h4 className="mb-2">Coding Test - OTP Verification</h4>
              <p className="text-secondary-light">
                Enter your details to receive an OTP
              </p>
            </div>

            {error && (
              <div className="alert alert-danger d-flex align-items-center">
                <AlertCircle size={20} className="me-2" />
                {error}
              </div>
            )}

            <div className="mb-3">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                className="form-control"
                value={candidateData.name}
                onChange={(e) => setCandidateData({ ...candidateData, name: e.target.value })}
                placeholder="Enter your full name"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                className="form-control"
                value={candidateData.email}
                onChange={(e) => setCandidateData({ ...candidateData, email: e.target.value })}
                placeholder="Enter your email"
              />
            </div>

            <button
              onClick={handleSendOTP}
              disabled={loading}
              className="btn btn-primary w-100 mb-3"
            >
              {loading ? (
                <>
                  <RefreshCw size={16} className="spin me-2" />
                  Sending OTP...
                </>
              ) : (
                'Send OTP'
              )}
            </button>

            <hr />

            <div className="mb-3">
              <label className="form-label">Enter OTP *</label>
              <input
                type="text"
                className="form-control"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
                maxLength={6}
              />
            </div>

            <button
              onClick={handleVerifyOTP}
              disabled={loading || !otp}
              className="btn btn-success w-100"
            >
              {loading ? (
                <>
                  <RefreshCw size={16} className="spin me-2" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle size={16} className="me-2" />
                  Verify & Start Coding
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Coding Step
  if (step === 'coding' && questions.length > 0) {
    const currentQuestion = questions[currentQuestionIndex];
    
    return (
      <div className="min-vh-100 bg-light">
        {/* Header */}
        <div className="bg-white border-bottom shadow-sm">
          <div className="container-fluid py-3">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-0">Coding Assessment</h5>
                <p className="text-secondary-light mb-0 small">
                  Submitted: {submittedQuestions.length} / {questions.length}
                </p>
              </div>
              <button
                onClick={handleFinalizeExam}
                className="btn btn-success"
                disabled={loading}
              >
                <Send size={16} className="me-2" />
                Finalize & Submit
              </button>
            </div>
          </div>
        </div>

        <div className="container-fluid py-4">
          <div className="row">
            {/* Questions Sidebar */}
            <div className="col-md-3">
              <div className="card shadow-sm sticky-top" style={{ top: '20px' }}>
                <div className="card-header">
                  <h6 className="mb-0">Questions</h6>
                </div>
                <div className="card-body p-0">
                  <div className="list-group list-group-flush">
                    {questions.map((q, index) => (
                      <button
                        key={index}
                        onClick={() => handleQuestionChange(index)}
                        className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${
                          currentQuestionIndex === index ? 'active' : ''
                        }`}
                      >
                        <span>{q.title}</span>
                        {submittedQuestions.includes(index) && (
                          <CheckCircle size={16} className="text-success" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Code Editor */}
            <div className="col-md-9">
              {/* Question Description */}
              <div className="card shadow-sm mb-3">
                <div className="card-body">
                  <h5 className="mb-3">{currentQuestion.title}</h5>
                  <p className="text-secondary-light mb-3">{currentQuestion.description}</p>
                  
                  {currentQuestion.test_cases && currentQuestion.test_cases.length > 0 && (
                    <div>
                      <h6 className="mb-2">Test Cases:</h6>
                      <div className="bg-light p-3 rounded">
                        {currentQuestion.test_cases.map((testCase, idx) => (
                          <div key={idx} className="mb-1">
                            <code className="text-dark">{testCase}</code>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Editor Controls */}
              <div className="card shadow-sm mb-3">
                <div className="card-body d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center gap-3">
                    <label className="mb-0">Language:</label>
                    <select
                      className="form-select w-auto"
                      value={language}
                      onChange={(e) => handleLanguageChange(e.target.value)}
                    >
                      <option value="python">Python</option>
                      <option value="cpp">C++</option>
                      <option value="java">Java</option>
                    </select>
                  </div>
                  <div className="d-flex gap-2">
                    <button
                      onClick={handleRunCode}
                      disabled={loading}
                      className="btn btn-outline-primary"
                    >
                      <Play size={16} className="me-2" />
                      Run Code
                    </button>
                    <button
                      onClick={handleSubmitCode}
                      disabled={loading}
                      className="btn btn-primary"
                    >
                      <Send size={16} className="me-2" />
                      Submit Solution
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <div className="alert alert-danger d-flex align-items-center mb-3">
                  <AlertCircle size={20} className="me-2" />
                  {error}
                </div>
              )}

              {/* Code Editor */}
              <div className="card shadow-sm mb-3">
                <div className="card-header d-flex align-items-center">
                  <Terminal size={16} className="me-2" />
                  <span>Code Editor</span>
                </div>
                <div className="card-body p-0">
                  <textarea
                    className="form-control border-0"
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '14px',
                      minHeight: '400px',
                      resize: 'vertical'
                    }}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Write your code here..."
                  />
                </div>
              </div>

              {/* Output Console */}
              {output && (
                <div className="card shadow-sm">
                  <div className="card-header d-flex align-items-center">
                    <Terminal size={16} className="me-2" />
                    <span>Output</span>
                  </div>
                  <div className="card-body">
                    <pre className="mb-0" style={{ fontFamily: 'monospace', fontSize: '14px' }}>
                      {output}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Finalize Step
  if (step === 'finalize' && finalResult) {
    const passed = finalResult.status === 'manager_round';
    
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="card shadow-lg" style={{ maxWidth: '600px', width: '100%' }}>
          <div className="card-body p-5 text-center">
            <div className={`${passed ? 'bg-success-subtle' : 'bg-warning-subtle'} p-4 rounded-circle d-inline-block mb-4`}>
              {passed ? (
                <CheckCircle size={64} className="text-success" />
              ) : (
                <AlertCircle size={64} className="text-warning" />
              )}
            </div>
            
            <h3 className="mb-3">
              {passed ? 'Congratulations!' : 'Test Complete'}
            </h3>
            
            <p className="text-secondary-light mb-4">
              {passed 
                ? 'You have qualified for the manager round! Check your email for the interview link.'
                : 'Thank you for taking the coding test. Unfortunately, you did not pass this time.'
              }
            </p>

            {passed && finalResult.link && (
              <div className="bg-light p-4 rounded mb-4">
                <p className="text-secondary-light mb-2">Manager Round Link:</p>
                <a href={finalResult.link} className="btn btn-primary" target="_blank" rel="noopener noreferrer">
                  Join Manager Round
                </a>
              </div>
            )}

            <button
              onClick={() => navigate('/candidate/dashboard')}
              className="btn btn-outline-primary"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <RefreshCw size={48} className="spin text-primary" />
    </div>
  );
};

export default CodingTest;

