import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from '../../axios';

const CheckCircle = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const AlertCircle = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const Mail = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('Verifying your email...');
  const [email, setEmail] = useState('');

  const verifyEmail = useCallback(async () => {
    try {
      const response = await axios.get(`/auth/verify/${token}`);
      if (response.data.success) {
        setStatus('success');
        setMessage(response.data.message || 'Email verified successfully!');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (err) {
      setStatus('error');
      let errorMessage = err?.response?.data?.detail || err?.message || 'Failed to verify email. The link may have expired.';
      
      if (typeof errorMessage !== 'string') {
        if (Array.isArray(errorMessage)) {
          errorMessage = errorMessage.map(e => e.msg || JSON.stringify(e)).join('; ');
        } else if (typeof errorMessage === 'object' && errorMessage !== null) {
          errorMessage = errorMessage.msg || JSON.stringify(errorMessage);
        } else {
            errorMessage = String(errorMessage);
        }
      }
      
      setMessage(errorMessage);
    }
  }, [token, navigate]);

  useEffect(() => {
    if (token) {
      verifyEmail();
    } else {
      setStatus('error');
      setMessage('Invalid verification link.');
    }
  }, [token, verifyEmail]);

  const resendVerification = async () => {
    if (!email) {
      setMessage('Please enter your email address');
      return;
    }

    try {
      const response = await axios.post('/auth/send-verification', { email });
      if (response.data.success) {
        setMessage('Verification email sent! Please check your inbox.');
      }
    } catch (err) {
      let errorMessage = err?.response?.data?.detail || err?.message || 'Failed to resend verification email.';
      
      if (typeof errorMessage !== 'string') {
        if (Array.isArray(errorMessage)) {
          errorMessage = errorMessage.map(e => e.msg || JSON.stringify(e)).join('; ');
        } else if (typeof errorMessage === 'object' && errorMessage !== null) {
          errorMessage = errorMessage.msg || JSON.stringify(errorMessage);
        } else {
            errorMessage = String(errorMessage);
        }
      }
      
      setMessage(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f7f9] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white rounded-xl shadow-2xl p-8">
        <div className="text-center">
          {status === 'verifying' && (
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
              <svg className="animate-spin h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          )}
          {status === 'success' && (
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          )}
          {status === 'error' && (
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          )}
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {status === 'verifying' && 'Verifying Email...'}
            {status === 'success' && 'Email Verified!'}
            {status === 'error' && 'Verification Failed'}
          </h2>
          <p className="text-gray-600">{message}</p>
        </div>

        {status === 'error' && (
          <div className="mt-6">
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                placeholder="Enter your email to resend verification"
              />
            </div>
            <button
              onClick={resendVerification}
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors duration-200"
            >
              <Mail className="h-5 w-5 mr-2" />
              Resend Verification Email
            </button>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center mt-6">
            <p className="text-sm text-gray-600 mb-4">Redirecting to login page...</p>
            <Link to="/login" className="font-medium text-emerald-600 hover:text-emerald-500 transition-colors">
              Go to Login
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center mt-6">
            <Link to="/login" className="font-medium text-emerald-600 hover:text-emerald-500 transition-colors">
              Back to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default VerifyEmail;

