import { useState } from 'react';
import { useConfirm } from '../../context/ConfirmContext';
import CandidateDetailModal from './CandidateDetailModal';
import { UsersIcon } from './DashboardIcons';

const ScoreBadge = ({ score, label }) => {
  if (score === null || score === undefined) return <span className="text-xs text-gray-400">Not {label}</span>;
  
  const getScoreColor = (s) => {
    if (s >= 80) return 'text-green-600';
    if (s >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getBarColor = (s) => {
    if (s >= 80) return 'bg-green-500';
    if (s >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="flex items-center gap-2">
      <div className="w-20 bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${getBarColor(score)}`}
          style={{ width: `${Math.min(100, score || 0)}%` }}
        />
      </div>
      <span className={`text-xs font-semibold ${getScoreColor(score)}`}>
        {Math.round(score || 0)}%
      </span>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const statusStyles = {
    'Hired': 'bg-green-100 text-green-800',
    'Interview': 'bg-purple-100 text-purple-800',
    'Review': 'bg-yellow-100 text-yellow-800',
    'Rejected': 'bg-red-100 text-red-800',
    'New': 'bg-blue-100 text-blue-800'
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyles[status] || statusStyles['New']}`}>
      {status}
    </span>
  );
};

const CandidatesManagement = ({ jobs, selectedJob, candidates, loading, onJobSelect, onStatusUpdate, onRefresh, showMessage }) => {
  const { confirm } = useConfirm();
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // Handle manual refresh
  const handleRefreshClick = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      if (onRefresh) {
        await onRefresh();
      }
    } catch (error) {
      console.error("Refresh failed", error);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const handleCandidateClick = async (candidate) => {
    setSelectedCandidate(candidate);
    setShowDetailModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Candidate Management</h2>
        <div className="flex gap-2">
          {selectedJob && (
            <button
              onClick={handleRefreshClick}
              disabled={isRefreshing || loading}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition ${
                 isRefreshing || loading ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <svg 
                className={`h-4 w-4 ${isRefreshing || loading ? 'animate-spin' : ''}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>{isRefreshing || loading ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Job Selector */}
      {jobs.length > 0 && (
         <div className="bg-white rounded-2xl shadow-xl p-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Select Job</label>
          <select
            value={selectedJob?.id || ''}
            onChange={(e) => onJobSelect(e.target.value === "" ? null : jobs.find(j => j.id === e.target.value))}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="">All Jobs</option>
            {jobs.map(job => (
              <option key={job.id} value={job.id}>{job.title || 'Untitled Job'}</option>
            ))}
          </select>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden p-6 space-y-4">
             {[...Array(5)].map((_, i) => (
                <div key={i} className="flex space-x-4 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
             ))}
        </div>
      ) : candidates.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
          <UsersIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No candidates have applied for this job yet</p>
        </div>
      ) : (
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Mobile Card View */}
        <div className="lg:hidden divide-y divide-gray-100">
          {candidates.map((candidate) => (
            <div key={candidate.application_id} className="p-4 space-y-3 hover:bg-gray-50 transition">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-900">{candidate.name}</h3>
                  <p className="text-xs text-gray-500">{candidate.email}</p>
                </div>
                <StatusBadge status={candidate.status} />
              </div>
              
              {!selectedJob && (
                <div className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded inline-block">
                  {candidate.job_title}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <p className="text-[10px] uppercase text-gray-400 font-bold mb-1">Match Score</p>
                  <ScoreBadge score={candidate.ai_match_score} label="matched" />
                </div>
                <div>
                  <p className="text-[10px] uppercase text-gray-400 font-bold mb-1">Interview Score</p>
                  <ScoreBadge score={candidate.interview_score} label="interviewed" />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                <div className="flex items-center gap-1">
                  {candidate.proctoring_warning_count > 0 ? (
                    <span className="text-[10px] font-bold text-red-600">
                      ⚠️ {candidate.proctoring_warning_count} Warnings
                    </span>
                  ) : (candidate.interview_status === 'Completed' || candidate.interview_status === 'terminated' || (candidate.interview_score !== null && candidate.interview_score !== undefined)) ? (
                    <span className="text-[10px] font-bold text-green-600">
                      ✅ Clean
                    </span>
                  ) : null}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCandidateClick(candidate)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    title="View Details"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
                <tr>
                  {!selectedJob && (
                     <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Job Details</th>
                  )}
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Match Score</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Interview Score</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Warnings</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {candidates.map((candidate) => {
                  return (
                    <tr key={candidate.application_id} className="hover:bg-gray-50">
                      {!selectedJob && (
                        <td className="px-6 py-4">
                           <div className="text-sm font-medium text-gray-900">{candidate.job_title}</div>
                        </td>
                      )}
                      <td className="px-6 py-4 font-semibold text-gray-900">{candidate.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{candidate.email}</td>
                      <td className="px-6 py-4">
                        <ScoreBadge score={candidate.ai_match_score} label="matched" />
                      </td>
                      <td className="px-6 py-4">
                        <ScoreBadge score={candidate.interview_score} label="interviewed" />
                      </td>
                      <td className="px-6 py-4">
                        {candidate.proctoring_warning_count > 0 ? (
                             <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full border border-red-100">
                                ⚠️ {candidate.proctoring_warning_count} Warnings
                             </span>
                        ) : (candidate.interview_status === 'Completed' || candidate.interview_status === 'terminated' || (candidate.interview_score !== null && candidate.interview_score !== undefined)) ? (
                             <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100">
                                ✅ Clean
                             </span>
                        ) : (
                             <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={candidate.status} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => handleCandidateClick(candidate)}
                            className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-xs font-medium transition"
                          >
                            View Details
                          </button>
                          
                          {['Hired', 'Rejected'].includes(candidate.status) ? (
                             <span className={`text-sm font-bold ${
                                 candidate.status === 'Hired' ? 'text-green-600' : 'text-red-600'
                             }`}>
                                 {candidate.status === 'Hired' ? '🎉 Candidate Hired' : '⛔ Candidate Rejected'}
                             </span>
                          ) : (
                             <>
                              {candidate.interview_score !== null && candidate.interview_score !== undefined && (
                                <>
                                  <button
                                    onClick={async () => {
                                      const validId = candidate._id || candidate.id || candidate.application_id;
                                      if (!validId) {
                                          alert("Error: Missing Candidate ID."); 
                                          return;
                                      }
                                      const isConfirmed = await confirm(`Hire ${candidate.name} and send confirmation email?`);
                                      if (isConfirmed) {
                                        onStatusUpdate(validId, 'Hired', true);
                                      }
                                    }}
                                    className="px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg text-xs font-medium transition"
                                  >
                                    ✅ Hire
                                  </button>
                                  <button
                                    onClick={async () => {
                                      const validId = candidate._id || candidate.id || candidate.application_id;
                                      if (!validId) {
                                          alert("Error: Missing Candidate ID."); 
                                          return;
                                      }
                                      const isConfirmed = await confirm(`Reject ${candidate.name} and send rejection email?`);
                                      if (isConfirmed) {
                                        onStatusUpdate(validId, 'Rejected', true);
                                      }
                                    }}
                                    className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs font-medium transition"
                                  >
                                    ❌ Reject
                                  </button>
                                </>
                              )}
                              <select
                                value={candidate.status}
                                onChange={async (e) => {
                                  const newStatus = e.target.value;
                                  const shouldSendEmail = newStatus === 'Interview';
                                  const validId = candidate._id || candidate.id || candidate.application_id;
                                  
                                  if (!validId) {
                                      alert("Error: Cannot update status. Missing Candidate ID. Check console.");
                                      return;
                                  }

                                  const isConfirmed = await confirm(`Change status to ${newStatus}${shouldSendEmail ? ' and send email?' : '?'}`);
                                  if (isConfirmed) {
                                      onStatusUpdate(validId, newStatus, shouldSendEmail);
                                    }
                                }}

                                className="px-3 py-1 border-2 border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                              >
                                <option value="New">New</option>
                                <option value="Review">Review</option>
                                <option value="Interview">Interview</option>
                                <option value="Rejected">Rejected</option>
                                <option value="Hired">Hired</option>
                              </select>
                             </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Candidate Detail Modal */}
      {showDetailModal && (
        <CandidateDetailModal
          candidate={selectedCandidate}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedCandidate(null);
          }}
          onAction={async (action) => {
             // Pass-through or handle logic if updated
             if (onStatusUpdate && selectedCandidate) {
                  // If modal triggers status changes (like Shortlist/Reject), map them
                  const validId = selectedCandidate._id || selectedCandidate.id || selectedCandidate.application_id;
                  if (action === 'shortlisted') onStatusUpdate(validId, 'Reference Check', false); // Example mapping
                  if (action === 'rejected') onStatusUpdate(validId, 'Rejected', true);
             }
          }}
        />
      )}
    </div>
  );
};

export default CandidatesManagement;
