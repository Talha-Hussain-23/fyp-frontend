/**
 * User Service
 * Handles user profile and settings API calls.
 */
import axios from '../axios';

/**
 * Fetch user profile.
 * @returns {Promise<Object>}
 */
export const fetchUserProfile = async () => {
  const response = await axios.get('/user/profile');
  return response.data;
};

/**
 * Update user profile.
 * @param {Object} formData
 * @returns {Promise<Object>}
 */
export const updateUserProfile = async (formData) => {
  const response = await axios.put('/user/profile', formData);
  return response.data;
};

/**
 * Upload user avatar.
 * @param {FormData} formData
 * @returns {Promise<Object>}
 */
export const uploadAvatar = async (formData) => {
  const response = await axios.post('/user/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

/**
 * Update user settings.
 * @param {Object} updateData
 * @returns {Promise<Object>}
 */
export const updateUserSettings = async (updateData) => {
  const response = await axios.put('/api/user/settings', updateData);
  return response.data;
};

/**
 * Change user password.
 * @param {Object} passwordData - { current_password, new_password }
 * @returns {Promise<Object>}
 */
export const changePassword = async (passwordData) => {
  const response = await axios.put('/api/user/password', passwordData);
  return response.data;
};

/**
 * Fetch user resumes.
 * @returns {Promise<Array>}
 */
export const fetchResumes = async () => {
  const response = await axios.get('/resumes');
  return response.data;
};

/**
 * Upload resume.
 * @param {FormData} formData
 * @returns {Promise<Object>}
 */
export const uploadResume = async (formData) => {
  const response = await axios.post('/upload_resume', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};
