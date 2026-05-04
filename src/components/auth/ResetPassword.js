import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from '../../axios';

const Eye = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EyeOff = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
);

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

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Invalid reset link. Please request a new password reset.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`/auth/reset-password/${token}`, {
        new_password: password
      });

      if (response.data.success) {
        setSuccess('Password reset successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err) {
      let errorMessage = err?.response?.data?.detail || err?.message || 'Failed to reset password. The link may have expired.';
      
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

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f7f9] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white rounded-xl shadow-2xl p-8">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <p className="text-red-700 text-sm">Invalid reset link. Please request a new password reset.</p>
          </div>
          <div className="text-center">
            <Link to="/forgot-password" className="font-medium text-emerald-600 hover:text-emerald-500 transition-colors">
              Request New Reset Link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f7f9] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white rounded-xl shadow-2xl p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Reset Your Password</h2>
          <p className="text-gray-600">Enter your new password below</p>
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
            <div className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none relative block w-full px-4 py-3 pr-12 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm"
                    placeholder="Enter new password (min. 6 characters)"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {password && password.length < 6 && (
                  <p className="mt-1 text-xs text-red-600">Password must be at least 6 characters</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="appearance-none relative block w-full px-4 py-3 pr-12 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="mt-1 text-xs text-red-600">Passwords do not match</p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || password.length < 6 || password !== confirmPassword}
                className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white ${
                  loading || password.length < 6 || password !== confirmPassword
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
                    Resetting...
                  </span>
                ) : (
                  'Reset Password'
                )}
              </button>
            </div>
          </form>
        )}

        <div className="text-center">
          <p className="text-sm text-gray-600">
            <Link to="/login" className="font-medium text-emerald-600 hover:text-emerald-500 transition-colors">
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;

