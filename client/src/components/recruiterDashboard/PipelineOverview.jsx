import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Eye,
  ChevronRight,
  Filter,
  Search,
  RefreshCw
} from 'lucide-react';
import { BASE_URL } from '../../config/api.config';

const PipelineOverview = () => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStage, setSelectedStage] = useState('all');

  // Fetch candidates data
  const fetchCandidates = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      setError('Please login to view pipeline');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/recruiter_dashboard/candidates`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCandidates(data);
        setError(null);
      } else {
        setError('Failed to fetch candidates');
      }
    } catch (err) {
      console.error('Pipeline fetch error:', err);
      setError('Network error. Please check if backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  // Group candidates by stage
  const groupCandidatesByStage = () => {
    const stages = {
      'Applied': [],
      'Screening': [],
      'Interview': [],
      'Offer': [],
      'Hired': [],
      'Rejected': []
    };

    candidates.forEach(candidate => {
      const stage = candidate.stage || 'Applied';
      if (stages[stage]) {
        stages[stage].push(candidate);
      }
    });

    return stages;
  };

  // Filter candidates based on search and stage
  const getFilteredCandidates = () => {
    let filtered = candidates;

    if (searchTerm) {
      filtered = filtered.filter(candidate =>
        candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedStage !== 'all') {
      filtered = filtered.filter(candidate => candidate.stage === selectedStage);
    }

    return filtered;
  };

  const stages = groupCandidatesByStage();
  const filteredCandidates = getFilteredCandidates();

  const StageCard = ({ stage, candidates, color, icon: Icon }) => (
    <div className="pipeline-stage">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className={`p-2 rounded-lg ${color}`}>
            <Icon className="h-4 w-4 text-white" />
          </div>
          <h3 className="font-semibold text-gray-900">{stage}</h3>
        </div>
        <span className="text-sm font-medium text-gray-600">{candidates.length}</span>
      </div>
      
      <div className="space-y-2">
        {candidates.slice(0, 3).map((candidate) => (
          <div key={candidate.id} className="p-2 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-900">{candidate.name}</p>
              <p className="text-xs text-gray-500">{candidate.role}</p>
            </div>
          </div>
        ))}
        
        {candidates.length > 3 && (
          <button
            onClick={() => {
              setSelectedStage(stage);
              navigate('/candidates');
            }}
            className="w-full text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            View {candidates.length - 3} more
          </button>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner h-8 w-8"></div>
        <span className="ml-2 text-gray-600">Loading pipeline...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
          <p className="text-red-800">{error}</p>
        </div>
        <button
          onClick={fetchCandidates}
          className="btn-primary mt-4"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="mb-4 d-flex justify-content-between align-items-center">
        <div>
          <h4 className="mb-2">Recruitment Pipeline</h4>
          <p className="text-secondary-light mb-0">Track candidates through each stage</p>
        </div>
        <button
          onClick={fetchCandidates}
          className="btn btn-primary d-flex align-items-center"
        >
          <RefreshCw className="h-4 w-4 me-2" />
          Refresh
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search candidates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={selectedStage}
          onChange={(e) => setSelectedStage(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Stages</option>
          <option value="Applied">Applied</option>
          <option value="Screening">Screening</option>
          <option value="Interview">Interview</option>
          <option value="Offer">Offer</option>
          <option value="Hired">Hired</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* Pipeline Stages */}
      <div className="dashboard-grid-3">
        <StageCard
          stage="Applied"
          candidates={stages.Applied}
          color="bg-blue-500"
          icon={Users}
        />
        <StageCard
          stage="Screening"
          candidates={stages.Screening}
          color="bg-yellow-500"
          icon={Clock}
        />
        <StageCard
          stage="Interview"
          candidates={stages.Interview}
          color="bg-orange-500"
          icon={Eye}
        />
        <StageCard
          stage="Offer"
          candidates={stages.Offer}
          color="bg-purple-500"
          icon={AlertCircle}
        />
        <StageCard
          stage="Hired"
          candidates={stages.Hired}
          color="bg-green-500"
          icon={CheckCircle}
        />
        <StageCard
          stage="Rejected"
          candidates={stages.Rejected}
          color="bg-red-500"
          icon={AlertCircle}
        />
      </div>

      {/* Pipeline Flow */}
      <div className="dashboard-card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Pipeline Flow</h2>
        <div className="flex items-center justify-between">
          {Object.entries(stages).map(([stage, stageCandidates], index) => (
            <React.Fragment key={stage}>
              <div className="text-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-2 ${
                  stage === 'Applied' ? 'bg-blue-500' :
                  stage === 'Screening' ? 'bg-yellow-500' :
                  stage === 'Interview' ? 'bg-orange-500' :
                  stage === 'Offer' ? 'bg-purple-500' :
                  stage === 'Hired' ? 'bg-green-500' : 'bg-red-500'
                }`}>
                  {stageCandidates.length}
                </div>
                <p className="text-sm font-medium text-gray-900">{stage}</p>
                <p className="text-xs text-gray-500">{stageCandidates.length} candidates</p>
              </div>
              {index < Object.keys(stages).length - 1 && (
                <ChevronRight className="h-5 w-5 text-gray-400 mx-2" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Candidate List */}
      {selectedStage !== 'all' && (
        <div className="dashboard-card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {selectedStage} Candidates ({filteredCandidates.length})
          </h2>
          <div className="space-y-3">
            {filteredCandidates.map((candidate) => (
              <div key={candidate.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">
                      {candidate.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{candidate.name}</p>
                    <p className="text-xs text-gray-500">{candidate.role}</p>
                    <p className="text-xs text-gray-400">{candidate.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    candidate.stage === 'Applied' ? 'bg-blue-100 text-blue-800' :
                    candidate.stage === 'Screening' ? 'bg-yellow-100 text-yellow-800' :
                    candidate.stage === 'Interview' ? 'bg-orange-100 text-orange-800' :
                    candidate.stage === 'Offer' ? 'bg-purple-100 text-purple-800' :
                    candidate.stage === 'Hired' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {candidate.stage}
                  </span>
                  <button
                    onClick={() => navigate(`/candidates/${candidate.id}`)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default PipelineOverview;
