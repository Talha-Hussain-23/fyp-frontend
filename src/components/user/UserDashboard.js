import { useEffect, useState } from 'react';
import axios from '../../axios';
import { getLocalDateString } from '../../utils/dateUtils';

function UserDashboard() {
  const [jobs, setJobs] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState({ jobs: true, resumes: false, applications: false });
  const [error, setError] = useState('');
  const [applyingId, setApplyingId] = useState(null);
  const [selectedResumeId, setSelectedResumeId] = useState(null);
  const [activeTab, setActiveTab] = useState('jobs'); // 'jobs' or 'applications'

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await axios.get('/public/jobs');
        setJobs(res.data.jobs || []);
      } catch (e) {
        setError('Failed to load jobs');
      } finally {
        setLoading(prev => ({ ...prev, jobs: false }));
      }
    };
    
    const fetchResumes = async () => {
      try {
        const res = await axios.get('/resumes');
        const resumesData = res.data.resumes || [];
        setResumes(resumesData);
        // Auto-select latest resume
        if (resumesData.length > 0) {
          setSelectedResumeId(resumesData[0].id);
          
          // Fetch applications if we have email
          if (resumesData[0].email) {
            try {
              setLoading(prev => ({ ...prev, applications: true }));
              const appRes = await axios.get(`/my-applications?email=${encodeURIComponent(resumesData[0].email)}`);
              setApplications(appRes.data.applications || []);
            } catch (e) {
              console.error('Failed to load applications:', e);
            } finally {
              setLoading(prev => ({ ...prev, applications: false }));
            }
          }
        }
      } catch (e) {
        console.error('Failed to load resumes:', e);
      } finally {
        setLoading(prev => ({ ...prev, resumes: false }));
      }
    };
    
    fetchJobs();
    fetchResumes();
  }, []);

  const handleApply = async (jobId) => {
    setError('');
    setApplyingId(jobId);
    try {
      const payload = selectedResumeId ? { resume_id: selectedResumeId } : {};
      const res = await axios.post(`/public/jobs/${jobId}/apply`, payload);
      if (res.data.interview_token) {
        window.location.href = `/interview?interview_id=${res.data.interview_id}&token=${res.data.interview_token}`;
      } else {
        window.location.href = `/interview?interview_id=${res.data.interview_id}`;
      }
    } catch (e) {
      let errorMessage = e?.response?.data?.detail || 'Failed to apply';
      if (typeof errorMessage !== 'string') {
        if (Array.isArray(errorMessage)) {
          errorMessage = errorMessage.map(err => err.msg || JSON.stringify(err)).join('; ');
        } else if (typeof errorMessage === 'object' && errorMessage !== null) {
          errorMessage = errorMessage.msg || JSON.stringify(errorMessage);
        } else {
            errorMessage = String(errorMessage);
        }
      }
      setError(errorMessage);
    } finally {
      setApplyingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl lg:text-4xl font-bold text-gray-800 mb-2">🎯 Job Board</h1>
              <p className="text-sm lg:text-base text-gray-600">Find your dream job. No signup required!</p>
            </div>
            <div className="flex gap-3">
              <a href="/upload" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition shadow-md">
                📄 Upload Resume
              </a>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex gap-4 mt-4 border-b">
            <button
              onClick={() => setActiveTab('jobs')}
              className={`px-4 py-2 font-semibold transition ${
                activeTab === 'jobs'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              💼 Available Jobs
            </button>
            <button
              onClick={() => setActiveTab('applications')}
              className={`px-4 py-2 font-semibold transition ${
                activeTab === 'applications'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              📋 My Applications
            </button>
          </div>
        </div>

        {/* Resumes Section */}
        {resumes.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 mb-6">
            <h2 className="text-xl lg:text-2xl font-bold text-gray-800 mb-4">📚 Your Resumes ({resumes.length})</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {resumes.map((resume) => (
                <div 
                  key={resume.id} 
                  className={`border-2 rounded-lg p-4 cursor-pointer transition ${
                    selectedResumeId === resume.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => setSelectedResumeId(resume.id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg">{resume.candidate_name || 'Untitled Resume'}</h3>
                    {selectedResumeId === resume.id && (
                      <span className="text-blue-600 font-bold">✓ Selected</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{resume.email}</p>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {resume.skills.slice(0, 5).map((skill, idx) => (
                      <span key={idx} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                        {skill}
                      </span>
                    ))}
                    {resume.skills_count > 5 && (
                      <span className="text-gray-500 text-xs">+{resume.skills_count - 5}</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{getLocalDateString(resume.uploaded_at) || 'Unknown date'}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
            <p className="font-semibold">Error:</p>
            <p>{error}</p>
          </div>
        )}

        {/* Applications Section */}
        {activeTab === 'applications' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">📋 My Applications</h2>
            
            {loading.applications ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Loading applications...</p>
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-12 text-gray-600">
                <p className="text-xl">No applications yet.</p>
                <p className="mt-2">Apply to jobs to see your applications and interview scores here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => (
                  <div key={app.application_id} className="border border-gray-200 rounded-xl p-4 lg:p-6 hover:shadow-lg transition bg-white">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-3">
                      <div>
                        <h3 className="text-lg lg:text-xl font-bold text-gray-800">{app.job_title}</h3>
                        <p className="text-xs text-gray-500 mt-1">
                          Applied: {app.applied_at ? getLocalDateString(app.applied_at) : 'N/A'}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[10px] lg:text-xs font-semibold self-start sm:self-center ${
                        app.status === 'Hired' ? 'bg-green-100 text-green-800' :
                        app.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                        app.status === 'Interview' ? 'bg-purple-100 text-purple-800' :
                        app.status === 'Review' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {app.status}
                      </span>
                    </div>
                    
                    {/* Interview Score */}
                    {app.interview_score !== null && app.interview_score !== undefined && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-gray-700">Interview Score:</span>
                          <span className={`text-2xl font-bold ${
                            app.interview_score >= 70 ? 'text-green-600' :
                            app.interview_score >= 50 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {app.interview_score / 10}/10
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-sm text-gray-600">Status:</span>
                          <span className={`text-sm font-semibold ${
                            app.interview_status === 'Completed' ? 'text-green-600' :
                            app.interview_status === 'Terminated' ? 'text-red-600' :
                            'text-yellow-600'
                          }`}>
                            {app.interview_status || 'In Progress'}
                          </span>
                        </div>
                        {app.cheater && (
                          <p className="text-sm text-red-600 mt-2">⚠️ Interview was terminated due to violations</p>
                        )}
                      </div>
                    )}
                    
                    {/* AI Match Score */}
                    {app.ai_match_score !== null && app.ai_match_score !== undefined && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">AI Match Score:</span>
                          <span className="text-sm font-semibold text-gray-700">{app.ai_match_score}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className={`h-2 rounded-full ${
                              app.ai_match_score >= 80 ? 'bg-green-500' :
                              app.ai_match_score >= 60 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(100, app.ai_match_score)}%` }}
                          />
                        </div>
                      </div>
                    )}
                    
                    {app.interview_score === null && app.interview_status === 'InProgress' && (
                      <p className="text-sm text-gray-500 mt-3">Interview in progress...</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Jobs Section */}
        {activeTab === 'jobs' && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">💼 Available Jobs</h2>
          
          {loading.jobs ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading jobs...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-12 text-gray-600">
              <p className="text-xl">No jobs posted yet.</p>
              <p className="mt-2">Check back later for new opportunities!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <div key={job.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition bg-white">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-gray-800">{job.title || `Job #${job.id}`}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      job.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                      job.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {job.difficulty || 'Medium'}
                    </span>
                  </div>
                  
                  <p className="text-gray-700 mb-4 line-clamp-3">{job.snippet}</p>
                  
                  {job.apply_deadline && (
                    <p className="text-sm text-gray-500 mb-4">
                      ⏰ Deadline: {getLocalDateString(job.apply_deadline)}
                    </p>
                  )}
                  
                  <div className="flex flex-col gap-2 mt-4">
                    {resumes.length > 0 && (
                      <div className="text-sm text-gray-600 mb-2">
                        {selectedResumeId ? (
                          <span>Using: {resumes.find(r => r.id === selectedResumeId)?.candidate_name || 'Selected Resume'}</span>
                        ) : (
                          <span className="text-yellow-600">⚠️ Please select a resume first</span>
                        )}
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <a 
                        href="/upload" 
                        className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-center transition font-semibold"
                      >
                        📄 Upload Resume
                      </a>
                      <button
                        onClick={() => handleApply(job.id)}
                        disabled={applyingId === job.id || (resumes.length > 0 && !selectedResumeId)}
                        className={`flex-1 px-4 py-2 rounded font-semibold transition ${
                          applyingId === job.id || (resumes.length > 0 && !selectedResumeId)
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                      >
                        {applyingId === job.id ? 'Applying...' : '✅ Apply Now'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
}

export default UserDashboard;