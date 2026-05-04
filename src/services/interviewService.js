/**
 * Interview Service
 * Handles interview session API calls (start, submit, auto-save, terminate, results).
 */
import axios from '../axios';

/**
 * Fetch interview data by ID with optional token.
 * @param {string} interviewId
 * @param {string} [token] - Interview access token
 * @returns {Promise<Object>}
 */
export const fetchInterview = async (interviewId, token) => {
  const url = token
    ? `/interviews/${interviewId}?token=${token}`
    : `/interviews/${interviewId}`;
  const response = await axios.get(url);
  return response.data;
};

/**
 * Start an interview session.
 * @param {string} interviewId
 * @returns {Promise<Object>}
 */
export const startInterview = async (interviewId) => {
  const response = await axios.post(`/interviews/${interviewId}/start`);
  return response.data;
};

/**
 * Submit an answer to a question.
 * @param {string} interviewId
 * @param {Object} data - { response, question_index, timeout? }
 * @returns {Promise<Object>}
 */
export const submitAnswer = async (interviewId, data) => {
  const response = await axios.post(`/interviews/${interviewId}/submit`, data);
  return response.data;
};

/**
 * Auto-save a draft answer.
 * @param {string} interviewId
 * @param {number} questionIndex
 * @param {string} answer
 * @returns {Promise<Object>}
 */
export const autoSaveAnswer = async (interviewId, questionIndex, answer) => {
  const response = await axios.post(`/interviews/${interviewId}/auto-save`, {
    question_index: questionIndex,
    answer,
  });
  return response.data;
};

/**
 * Terminate an interview.
 * @param {string} interviewId
 * @param {Object} body - { reason, ... }
 * @returns {Promise<Object>}
 */
export const terminateInterview = async (interviewId, body) => {
  const response = await axios.post(`/interviews/${interviewId}/terminate`, body);
  return response.data;
};

/**
 * Terminate interview due to proctoring violations.
 * @param {string} interviewId
 * @param {string} reason
 * @returns {Promise<Object>}
 */
export const terminateInterviewProctoring = async (interviewId, reason) => {
  const response = await axios.post(`/interviews/${interviewId}/terminate-proctoring`, { reason });
  return response.data;
};

/**
 * Get interview results/evaluation.
 * @param {string} interviewId
 * @returns {Promise<Object>}
 */
export const fetchInterviewResults = async (interviewId) => {
  const response = await axios.get(`/interviews/${interviewId}/results`);
  return response.data;
};

/**
 * Log a proctoring violation.
 * @param {string} interviewId
 * @param {Object} violation - { type, metadata, ... }
 * @returns {Promise<Object>}
 */
export const logProctoringViolation = async (interviewId, violation) => {
  const response = await axios.post(`/interviews/${interviewId}/violation`, violation);
  return response.data;
};

/**
 * Record a violation via the violations API.
 * @param {Object} payload - { interview_id, violation_type, metadata }
 * @returns {Promise<Object>}
 */
export const recordViolation = async (payload) => {
  const response = await axios.post('/violations/record', payload);
  return response.data;
};
