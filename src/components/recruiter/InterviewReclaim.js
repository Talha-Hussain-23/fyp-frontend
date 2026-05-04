import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from '../../axios';

function InterviewReclaim() {
  const [loading, setLoading] = useState(false);
  const [prefilling, setPrefilling] = useState(false);
  const [message, setMessage] = useState({ show: false, type: '', text: '' });
  const [submitted, setSubmitted] = useState(false);
  const [alreadyPending, setAlreadyPending] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const params = new URLSearchParams(location.search);
  const interviewId = params.get('interview_id');
  const token = params.get('token');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    reason: '',
    time_spent_minutes: ''
  });

  // Auto-fill candidate info from the backend when landing from the email link
  useEffect(() => {
    if (!interviewId || !token) return;
    setPrefilling(true);
    axios.get(`/reclaim-requests/interview-info?interview_id=${interviewId}&token=${token}`)
      .then(res => {
        if (res.data.success) {
          setFormData(prev => ({
            ...prev,
            name: res.data.candidate_name || prev.name,
            email: res.data.candidate_email || prev.email
          }));
        }
      })
      .catch(() => {
        // Non-fatal — candidate can fill in manually
      })
      .finally(() => setPrefilling(false));
  }, [interviewId, token]);

  const showMessage = (type, text) => {
    setMessage({ show: true, type, text });
    if (type !== 'error') {
      setTimeout(() => setMessage({ show: false, type: '', text: '' }), 5000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!interviewId) {
      showMessage('error', 'Invalid interview link. Please use the link from your email.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        interview_id: interviewId,
        candidate_email: formData.email,
        candidate_name: formData.name,
        reason: formData.reason,
        time_spent_minutes: formData.time_spent_minutes // capture this if backend supports it
      };
      
      if (token) payload.interview_token = token;

      const response = await axios.post('/reclaim-requests/', payload, {
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.data.success) {
        setSubmitted(true);
      } else {
        showMessage('error', response.data.message || 'Failed to submit request');
      }
    } catch (err) {
      console.error("Reclaim Error:", err);
      const status = err?.response?.status;
      let detail = err?.response?.data?.detail || '';
      if (typeof detail !== 'string') {
        if (Array.isArray(detail)) {
            detail = detail.map(e => e.msg || JSON.stringify(e)).join('; ');
        } else if (typeof detail === 'object' && detail !== null) {
            detail = detail.msg || JSON.stringify(detail);
        } else {
             detail = String(detail);
        }
      }
      
      let errorMsg = 'Failed to submit request. Please try again.';
      
      // Handle "Already Pending" case (400)
      if (status === 400 && (detail.includes('already have') || detail.includes('pending'))) {
        setAlreadyPending(true);
        return;
      }
      
      // Handle "Invalid ID" case (400)
      if (status === 400 && detail.includes('Invalid interview ID format')) {
        errorMsg = 'Invalid interview link format. Please check your email link.';
      }

      // Handle "Not Found" case (404) - Explicitly override any generic message
      if (status === 404 || detail === 'Not Found') {
        errorMsg = 'Interview not found. Please check that you are using the correct interview link from your email.';
      }
      // Use backend detail if available and not generic
      else if (detail && detail !== 'Not Found') {
        errorMsg = detail;
      }
      
      showMessage('error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const StatusCard = ({ icon, title, message, subMessage, buttonText, buttonAction, secondaryButton }) => (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-indigo-600 h-2"></div>
        <div className="p-8 text-center">
          <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-indigo-50 text-4xl">
            {icon}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">{title}</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">{message}</p>
          {subMessage && <p className="text-sm text-gray-500 mb-8 bg-gray-50 p-3 rounded-lg">{subMessage}</p>}
          
          <div className="space-y-3">
            <button
              onClick={buttonAction}
              className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              {buttonText}
            </button>
            {secondaryButton}
          </div>
        </div>
      </div>
    </div>
  );

  if (alreadyPending) {
    return (
      <StatusCard
        icon="⏳"
        title="Request Under Review"
        message="You already have a pending reclaim request for this interview. Our team is reviewing it."
        subMessage="Please check your email inbox. You will receive a notification with a new interview link once approved."
        buttonText="Return to Home"
        buttonAction={() => navigate('/')}
      />
    );
  }

  if (submitted) {
    return (
      <StatusCard
        icon="✅"
        title="Request Submitted"
        message="We've received your request. The recruiter has been notified and will review your case shortly."
        subMessage="If approved, a new secure interview link will be sent to your email address."
        buttonText="Return to Home"
        buttonAction={() => navigate('/')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-indigo-600 px-6 py-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>🔧</span> Interview Recovery
          </h2>
          <p className="text-indigo-100 text-sm mt-1">Report technical issues to request a restart</p>
        </div>

        <div className="p-8">
          {message.show && (
            <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 ${
              message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'
            }`}>
              <span className="text-xl">{message.type === 'error' ? '⚠️' : 'ℹ️'}</span>
              <p className="font-medium text-sm pt-0.5">{message.text}</p>
            </div>
          )}

          {/* Interview Info Display */}
          {interviewId && (
            <div className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-200">
              <h3 className="text-sm font-bold text-blue-900 mb-2 flex items-center gap-2">
                <span>📋</span> Interview Information
                {prefilling && (
                  <span className="ml-auto text-xs text-blue-500 flex items-center gap-1">
                    <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading your info...
                  </span>
                )}
                {!prefilling && formData.name && (
                  <span className="ml-auto text-xs text-green-600 font-semibold">✓ Pre-filled</span>
                )}
              </h3>
              <div className="text-xs text-blue-800 space-y-1">
                <p><strong>Interview ID:</strong> {interviewId.substring(0, 8)}...</p>
                <p className="text-blue-600">Your interview details will be automatically included in the request.</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Helpful Tips */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 border-l-4 border-yellow-500">
              <h4 className="text-sm font-bold text-yellow-900 mb-2">💡 Tips for Faster Approval</h4>
              <ul className="text-xs text-yellow-800 space-y-1">
                <li>✓ Be specific about the technical issue you faced</li>
                <li>✓ Mention approximately how long you were in the interview</li>
                <li>✓ Use the email you originally applied with</li>
              </ul>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition bg-gray-50 focus:bg-white"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition bg-gray-50 focus:bg-white"
                  placeholder="The email you applied with"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Time Spent (approx. minutes)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.time_spent_minutes}
                  onChange={(e) => setFormData({ ...formData, time_spent_minutes: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition bg-gray-50 focus:bg-white"
                  placeholder="e.g. 15"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Issue Description</label>
                <textarea
                  rows="4"
                  required
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition bg-gray-50 focus:bg-white resize-none"
                  placeholder="Please describe the technical issue you encountered (e.g. internet disconnection, browser crash)..."
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting Request...
                  </span>
                ) : (
                  'Submit Reclaim Request'
                )}
              </button>
              
              <button
                type="button"
                onClick={() => navigate('/')}
                className="w-full mt-3 px-6 py-3 bg-white text-gray-600 hover:bg-gray-50 rounded-xl font-semibold transition border border-gray-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default InterviewReclaim;

