/**
 * Job Service (Public)
 * Handles public-facing job portal API calls.
 */
import axios from '../axios';

/**
 * Fetch all public jobs with optional filters.
 * @param {Object} [params] - Query params (search, category, location, etc.)
 * @returns {Promise<Array>}
 */
export const fetchPublicJobs = async (params = {}) => {
  const response = await axios.get('/public/jobs', { params });
  return response.data;
};

/**
 * Fetch a single public job by ID.
 * @param {string} jobId
 * @returns {Promise<Object>}
 */
export const fetchPublicJobById = async (jobId) => {
  const response = await axios.get(`/public/jobs/${jobId}`);
  return response.data;
};

/**
 * Check application status for a job.
 * @param {string} jobId
 * @param {string} email
 * @returns {Promise<Object>}
 */
export const checkApplicationStatus = async (jobId, email) => {
  const response = await axios.get(`/public/jobs/${jobId}/application-status`, {
    params: { email },
  });
  return response.data;
};

/**
 * Apply to a job (submit resume/application).
 * @param {string} jobId
 * @param {FormData} formData - Resume file and candidate info
 * @param {Object} [config] - Additional axios config (e.g. headers)
 * @returns {Promise<Object>}
 */
export const applyToJob = async (jobId, formData, config = {}) => {
  const response = await axios.post(`/public/jobs/${jobId}/apply`, formData, config);
  return response.data;
};

/**
 * Fetch user's applications.
 * @param {string} email
 * @returns {Promise<Array>}
 */
export const fetchMyApplications = async (email) => {
  const response = await axios.get(`/my-applications?email=${encodeURIComponent(email)}`);
  return response.data;
};
