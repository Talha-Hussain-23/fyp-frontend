import { useEffect } from 'react';
import { useConfirm } from '../../context/ConfirmContext';
import { useSectionConfig } from '../../hooks/useSectionConfig';
import { XIcon } from './DashboardIcons';
import InterviewSummaryPanel from './InterviewSummaryPanel';
import SectionConfigCard from './SectionConfigCard';

const JobModal = ({ job, form, onFormChange, onSave, onClose, submittingJob = false }) => {
  const { confirm } = useConfirm();
  const {
    sections,
    toggleSection,
    updateSection,
    updateWeight,
    getValidationErrors,
    isValid,
    toAPIFormat,
    fromAPIFormat
  } = useSectionConfig();

  // Load existing config when editing job
  useEffect(() => {
    if (job?.interview_config) {
      fromAPIFormat(job.interview_config);
    }
  }, [job, fromAPIFormat]);

  const handleSave = () => {
    const validationErrors = getValidationErrors();
    if (validationErrors.length > 0) {
      alert('Please fix validation errors:\n' + validationErrors.join('\n'));
      return;
    }

    const interviewConfig = toAPIFormat();
    
    // Merge form data with interview config
    const jobData = {
      ...form,
      interview_config: interviewConfig,
      // CRITICAL FIX: Sync question_types with enabled sections to prevent
      // Descriptive questions from being generated when only MCQs are selected
      question_types: interviewConfig.enabled_section_types
    };

    // Aggressive Smart Status: If job is closed and we are saving, 
    // AND there is a deadline set, assume the user wants to Reopen.
    // We let the backend validate if the deadline is past/future.
    if (job?.status === 'closed' && form.apply_deadline) {
         jobData.status = 'open'; 
    }

    onSave(jobData);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" onClick={onClose}>
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75" onClick={onClose}></div>
        <div
          className="inline-block align-bottom bg-white rounded-2xl shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-6 pt-6 pb-4 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {job ? 'Edit Job' : 'Create New Job'}
              </h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <XIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Job Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => onFormChange({ ...form, title: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g., Senior Software Engineer"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Job Description *</label>
                <textarea
                  value={form.description}
                  onChange={(e) => onFormChange({ ...form, description: e.target.value })}
                  rows="6"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  placeholder="Detailed job description..."
                />
                <p className="text-xs text-gray-500 mt-1">{form.description.length}/50 minimum characters</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Number of Vacancies</label>
                  <input
                    type="number"
                    min="1"
                    value={form.num_vacancies}
                    onChange={(e) => onFormChange({ ...form, num_vacancies: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Difficulty Level</label>
                  <select
                    value={form.difficulty_level || 'Moderate'}
                    onChange={(e) => onFormChange({ ...form, difficulty_level: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Hard">Strict (Hard)</option>
                  </select>
                </div>
              </div>

              {/* NEW: Interview Section Configuration */}
              <div className="interview-section-config">
                <h3 className="text-lg font-bold text-gray-900 mb-2">📝 Interview Configuration</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Configure question types, counts, and weights for the interview
                </p>

                {Object.values(sections).map(section => (
                  <SectionConfigCard
                    key={section.type}
                    section={section}
                    onToggle={toggleSection}
                    onUpdate={(type, field, value) => {
                      if (field === 'weight') {
                        updateWeight(type, value);
                      } else {
                        updateSection(type, field, value);
                      }
                    }}
                    disabled={submittingJob}
                  />
                ))}

                <InterviewSummaryPanel
                  sections={Object.values(sections)}
                  validationErrors={getValidationErrors()}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date (Optional)</label>
                  <input
                    type="datetime-local"
                    value={form.start_date || ''}
                    onChange={(e) => onFormChange({ ...form, start_date: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Leaves 'Open' if empty or past.</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Application Deadline</label>
                  <input
                    type="datetime-local"
                    value={form.apply_deadline}
                    onChange={(e) => onFormChange({ ...form, apply_deadline: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">AI Instructions (Optional)</label>
                <textarea
                  value={form.ai_instructions}
                  onChange={(e) => onFormChange({ ...form, ai_instructions: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g., Generate 5 technical coding questions with moderate difficulty..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Interview Invitation Rule *</label>
                <select
                  value={form.invite_rule}
                  onChange={(e) => onFormChange({ ...form, invite_rule: e.target.value, invite_rule_n: e.target.value === 'Top N' ? form.invite_rule_n : null })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Top 5">Top 5 Applicants</option>
                  <option value="Top 10">Top 10 Applicants</option>
                  <option value="Top N">Top N Applicants (Custom)</option>
                  <option value="All">All Applicants</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Automatically invite top candidates based on AI match scores</p>
              </div>

              {form.invite_rule === 'Top N' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Number of Applicants to Invite</label>
                  <input
                    type="number"
                    min="1"
                    value={form.invite_rule_n || ''}
                    onChange={(e) => onFormChange({ ...form, invite_rule_n: parseInt(e.target.value) || null })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g., 15"
                  />
                </div>
              )}

              <div className="flex gap-4 items-center p-4 bg-blue-50 rounded-xl border border-blue-100">
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-900">Job Status</h4>
                  <p className="text-sm text-blue-700">
                    {job?.status === 'closed' 
                      ? "This job is currently closed." 
                      : job ? "This job is active." : "New job will be active upon creation."}
                  </p>
                </div>
                {job && job.status === 'open' && (
                  <button
                    onClick={async () => {
                        const isConfirmed = await confirm('Are you sure you want to close this job early? No more applications will be accepted.');
                        if (isConfirmed) {
                            onFormChange({ ...form, status: 'closed' });
                        }
                    }}
                    className="px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-sm font-semibold transition"
                  >
                    Close Job Early
                  </button>
                )}
                {job && job.status === 'closed' && (
                  <div className="text-sm font-medium text-emerald-700">
                    To reopen, update the deadline to a future date.
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSave}
                disabled={submittingJob || !isValid()}
                className="flex-1 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submittingJob ? (job ? 'Updating...' : 'Creating...') : (job ? 'Update Job' : 'Create Job')}
              </button>
              <button
                onClick={onClose}
                disabled={submittingJob}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobModal;
