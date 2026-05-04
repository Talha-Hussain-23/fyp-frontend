import { FileIcon, XIcon } from './JobPortalIcons';

/**
 * Modal for applying to a job — handles form, file upload, and submission.
 */
function ApplyModal({
  job,
  applicationData,
  setApplicationData,
  alert,
  submitting,
  onSubmit,
  onFileChange,
  onClose,
}) {
  if (!job) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" onClick={onClose}>
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75" onClick={onClose}></div>
        <div
          className="inline-block align-bottom bg-white rounded-2xl shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-6 pt-6 pb-4 sm:p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Apply for Position</h2>
                <p className="text-gray-600 text-sm">{job.title}</p>
              </div>
              <button onClick={onClose} className="ml-4 text-gray-400 hover:text-gray-600 transition">
                <XIcon className="h-6 w-6" />
              </button>
            </div>

            {alert.show && (
              <div className={`mb-4 p-4 rounded-lg border-l-4 ${
                alert.type === 'success' ? 'bg-green-50 border-green-500 text-green-800'
                : alert.type === 'error' ? 'bg-red-50 border-red-500 text-red-800'
                : 'bg-blue-50 border-blue-500 text-blue-800'
              }`}>
                <p className="text-sm font-medium">{alert.message}</p>
              </div>
            )}

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  value={applicationData.name}
                  onChange={(e) => setApplicationData({ ...applicationData, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                  required
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                <input
                  type="email"
                  value={applicationData.email}
                  onChange={(e) => setApplicationData({ ...applicationData, email: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                  required
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Upload Resume (PDF, DOC, DOCX) *</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-emerald-400 transition">
                  <div className="space-y-1 text-center">
                    <FileIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer bg-white rounded-md font-medium text-emerald-600 hover:text-emerald-500 focus-within:outline-none">
                        <span>Upload a file</span>
                        <input type="file" accept=".pdf,.doc,.docx" onChange={onFileChange} className="sr-only" />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PDF, DOC, DOCX up to 5MB</p>
                    {applicationData.fileName && (
                      <p className="text-sm text-emerald-600 font-medium mt-2">Selected: {applicationData.fileName}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className={`flex-1 px-6 py-3 rounded-xl font-semibold transition shadow-lg ${
                    submitting ? 'bg-gray-400 text-gray-600 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  {submitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </span>
                  ) : 'Submit Application'}
                </button>
                <button type="button" onClick={onClose} className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold transition">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ApplyModal;
