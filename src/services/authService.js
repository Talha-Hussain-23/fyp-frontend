/**
 * Auth Service
 * Handles all authentication-related API calls.
 */
import axios from '../axios';

/**
 * Login with email/password credentials.
 * @param {Object} formData - { email, password }
 * @returns {Promise<Object>} { access_token, refresh_token, user }
 */
export const login = async (formData) => {
  const response = await axios.post('/auth/login', formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  return response.data;
};

/**
 * Register a new user.
 * @param {Object} payload - { name, email, password, is_recruiter? }
 * @returns {Promise<Object>}
 */
export const signup = async (payload) => {
  const response = await axios.post('/auth/signup', payload);
  return response.data;
};

/**
 * Get current user profile from auth token.
 * @param {string} token
 * @returns {Promise<Object>}
 */
export const getAuthProfile = async (token) => {
  const response = await axios.get('/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

/**
 * Request password reset email.
 * @param {string} email
 * @returns {Promise<Object>}
 */
export const requestPasswordReset = async (email) => {
  const response = await axios.post('/auth/request-password-reset', { email });
  return response.data;
};

/**
 * Reset password using token.
 * @param {string} token - Reset token from email
 * @param {Object} payload - { new_password }
 * @returns {Promise<Object>}
 */
export const resetPassword = async (token, payload) => {
  const response = await axios.post(`/auth/reset-password/${token}`, payload);
  return response.data;
};

/**
 * Verify email using token.
 * @param {string} token
 * @returns {Promise<Object>}
 */
export const verifyEmail = async (token) => {
  const response = await axios.get(`/auth/verify/${token}`);
  return response.data;
};

/**
 * Resend verification email.
 * @param {string} email
 * @returns {Promise<Object>}
 */
export const sendVerificationEmail = async (email) => {
  const response = await axios.post('/auth/send-verification', { email });
  return response.data;
};
