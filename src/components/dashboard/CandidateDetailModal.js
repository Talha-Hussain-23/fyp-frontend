

import { useEffect, useState } from 'react';
import axios from '../../axios';
import EnhancedInterviewAnalytics from '../recruiter/EnhancedInterviewAnalytics';
import { XIcon } from './DashboardIcons';

const CandidateDetailModal = ({ candidate, onClose, onAction }) => {
  const [activeTab, setActiveTab] = useState('screening'); // 'screening' | 'analytics'
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [screeningDetail, setScreeningDetail] = useState(null);
  const [loadingScreening, setLoadingScreening] = useState(false);

  useEffect(() => {
    if (candidate) {
      // Fetch Screening Detail
      if (candidate.screening_id) {
        setLoadingScreening(true);
        axios.get(`/screening/${candidate.screening_id}/detail`)
          .then(res => setScreeningDetail(res.data))
          .catch(err => console.error("Screening fetch error", err))
          .finally(() => setLoadingScreening(false));
      }

      // Fetch Analytics (if interview exists/started)
      // We check if candidate status implies interview activity or just try fetching
      if (['Interview', 'Hired', 'Rejected', 'Review'].includes(candidate.status)) {
         setLoadingAnalytics(true);
         // candidate.application_id should be available as 'id' or 'application_id'
         const appId = candidate.application_id || candidate.id || candidate._id;
         axios.get(`/applications/${appId}/analytics`)
            .catch(err => console.error("Analytics fetch error (likely no interview yet)", err))
            .finally(() => setLoadingAnalytics(false));
      }
    }
  }, [candidate]);

  if (!candidate) return null;

  const screening = screeningDetail?.screening;
  const resume = screeningDetail?.resume;
  const matchBreakdown = screening?.matchScoreBreakdown || candidate?.match_score_breakdown || {};

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" onClick={onClose}>
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75" onClick={onClose}></div>
        <div
          className="inline-block align-bottom bg-white rounded-2xl shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full print:absolute print:min-h-screen print:h-auto print:max-h-none print:overflow-visible"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-6 pt-6 pb-4 sm:p-8 max-h-[90vh] overflow-y-auto print:max-h-none print:overflow-visible">
             
             {/* Header */}
             <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {candidate.name}
                </h2>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                  <XIcon className="h-6 w-6" />
                </button>
             </div>

             {/* Tabs */}
             <div className="flex border-b border-gray-200 mb-6">
                <button
                  className={`py-2 px-4 font-medium text-sm focus:outline-none ${activeTab === 'screening' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setActiveTab('screening')}
                >
                  Screening & Resume
                </button>
                <button
                  className={`py-2 px-4 font-medium text-sm focus:outline-none ${activeTab === 'analytics' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setActiveTab('analytics')}
                >
                  Interview Analytics
                </button>
             </div>

             {/* CONTENT: SCREENING */}
             {activeTab === 'screening' && (
               <>
                 {loadingScreening ? (
                    <div className="text-center py-8 text-gray-500">Loading screening data...</div>
                 ) : (
                    <>
                    {/* Match Score */}
                    <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">AI Match Score</h3>
                            <div className="text-3xl font-bold text-emerald-600">
                            {Math.round(screening?.matchScore || candidate.ai_match_score || 0)}%
                            </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
                            <div
                            className={`h-4 rounded-full ${
                                (screening?.matchScore || candidate.ai_match_score) >= 80 ? 'bg-green-500' :
                                (screening?.matchScore || candidate.ai_match_score) >= 60 ? 'bg-yellow-500' :
                                'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(100, screening?.matchScore || candidate.ai_match_score || 0)}%` }}
                            />
                        </div>
                        {/* Breakdown */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                            {Object.entries(matchBreakdown).map(([key, val]) => (
                                <div key={key} className="bg-white rounded-lg p-3 text-center capitalize">
                                    <div className="text-xs text-gray-600 mb-1">{key}</div>
                                    <div className="text-lg font-bold text-gray-800">{Math.round(val || 0)}%</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Resume Text */}
                    {resume && (
                        <div className="bg-gray-50 rounded-xl p-6 mb-6 text-left">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resume Preview</h3>
                            <div className="bg-white rounded-lg p-4 max-h-64 overflow-y-auto text-sm text-gray-700 whitespace-pre-wrap">
                            {resume.text || 'No resume text available'}
                            </div>
                        </div>
                    )}
                    </>
                 )}
               </>
             )}

             {/* CONTENT: ANALYTICS */}
             {activeTab === 'analytics' && (
                <>
                  {loadingAnalytics ? (
                      <div className="text-center py-8 text-gray-500">Loading detailed analytics...</div>
                  ) : !candidate.interview_id ? (
                      <div className="text-center py-8 text-gray-500 italic">No interview data available yet.</div>
                  ) : (
                      <EnhancedInterviewAnalytics interviewId={candidate.interview_id} />
                  )}
                </>
             )}


            {/* Footer Actions */}
            <div className="flex items-center justify-end gap-3 pt-6 mt-6 border-t">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition"
                  >
                    Close
                  </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDetailModal;
