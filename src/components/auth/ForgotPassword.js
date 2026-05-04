import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../axios';

const AlertCircle = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CheckCircle = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const Mail = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await axios.post('/auth/request-password-reset', {
        email: email.trim()
      });

      if (response.data.success) {
        setSuccess('Password reset link has been sent to your email. Please check your inbox.');
        setEmail('');
      }
    } catch (err) {
      let errorMessage = err?.response?.data?.detail || err?.message || 'Failed to send password reset email. Please try again.';
      
      if (typeof errorMessage !== 'string') {
        if (Array.isArray(errorMessage)) {
          errorMessage = errorMessage.map(e => e.msg || JSON.stringify(e)).join('; ');
        } else if (typeof errorMessage === 'object' && errorMessage !== null) {
          errorMessage = errorMessage.msg || JSON.stringify(errorMessage);
        } else {
            errorMessage = String(errorMessage);
        }
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f7f9] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white rounded-xl shadow-2xl p-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-emerald-100 mb-4">
            <Mail className="h-6 w-6 text-emerald-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password?</h2>
          <p className="text-gray-600">Enter your email address and we'll send you a link to reset your password.</p>
        </div>

        {/* Success Alert */}
        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg flex items-start">
            <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
            <p className="text-green-700 text-sm">{success}</p>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500'
                } transition-colors duration-200`}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </span>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </div>
          </form>
        )}

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Remember your password?{' '}
            <Link to="/login" className="font-medium text-emerald-600 hover:text-emerald-500 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;

