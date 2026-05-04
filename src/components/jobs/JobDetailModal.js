import { getLocalDateString } from '../../utils/dateUtils';
import { XIcon } from './JobPortalIcons';

/**
 * Modal for displaying full job details.
 */
function JobDetailModal({ job, onClose, onApply, getDeadlineStatus }) {
  if (!job) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" onClick={onClose}>
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75" onClick={onClose}></div>
        <div
          className="inline-block align-bottom bg-white rounded-2xl shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-6 pt-6 pb-4 sm:p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-gray-900 mb-3">{job.title}</h2>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
                    {(job.recruiter_name || 'U')[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium">Posted by {job.recruiter_name || 'Unknown'}</p>
                    {job.created_at && <p className="text-xs text-gray-500">{getLocalDateString(job.created_at)}</p>}
                  </div>
                </div>
                {job.apply_deadline && (
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    📅 Application Deadline: {getLocalDateString(job.apply_deadline)}
                    {(() => {
                      const deadlineStatus = getDeadlineStatus(job.apply_deadline);
                      return deadlineStatus?.urgent ? (
                        <span className={`ml-2 px-2 py-0.5 rounded text-xs font-bold ${
                          deadlineStatus.color === 'red' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                          {deadlineStatus.text}
                        </span>
                      ) : null;
                    })()}
                  </p>
                )}
                {job.status === 'closed' && (
                  <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-medium">
                    🔒 This position is closed and no longer accepting applications
                  </div>
                )}
              </div>
              <button onClick={onClose} className="ml-4 text-gray-400 hover:text-gray-600 transition">
                <XIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Job Description</h3>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{job.description}</p>
              </div>
            </div>

            {job.status !== 'closed' && !job.deadline_passed ? (
              <div className="flex gap-3">
                <button
                  onClick={() => onApply(job)}
                  className="flex-1 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition shadow-lg"
                >
                  Apply for this Job
                </button>
                <button onClick={onClose} className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold transition">
                  Close
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                <button onClick={onClose} className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold transition">
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default JobDetailModal;
