import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from '../../axios';

/**
 * useInterviewData Hook
 * Manages the core interview state, fetching, and termination logic.
 * Encapsulates lines 123-263 (fetch) and 41-79 (terminate) from original Interview.js
 */
export const useInterviewData = () => {
    const location = useLocation();
    const interviewId = new URLSearchParams(location.search).get('interview_id');
    const token = new URLSearchParams(location.search).get('token');

    const [interview, setInterview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [interviewClosed, setInterviewClosed] = useState(false);
    const [closeReason, setCloseReason] = useState('');
    const [missingId, setMissingId] = useState(false);
    
    // Derived states
    const currentQuestionIndex = interview?.current_question_index || 0;
    const currentQuestion = interview?.questions?.[currentQuestionIndex];
    const questionType = interview?.question_type || 'Descriptive';

    // ----------------------------------------------------------------------
    // Termination Logic
    // ----------------------------------------------------------------------
    const endInterview = useCallback(async (reason) => {
        if (interviewClosed) return; // Prevent multiple calls

        setInterviewClosed(true);
        // Note: timer stopping is handled by the timer hook observing this state

        try {
            // Call backend to terminate interview and save scores
            const terminateResponse = await axios.post(`/interviews/${interviewId}/terminate`, {
                reason: reason
            });

            // Get saved scores and summary
            const savedScores = terminateResponse.data.scores || [];
            const avgScore = terminateResponse.data.avg_score || 0;
            const totalQuestions = terminateResponse.data.total_questions || 0;
            const answeredQuestions = terminateResponse.data.answered_questions || 0;

            // Set termination data for display
            setCloseReason(reason);
            setInterview(prev => ({
                ...prev,
                scores: savedScores,
                avg_score: avgScore,
                is_completed: true,
                termination_data: {
                    reason: reason,
                    total_questions: totalQuestions,
                    answered_questions: answeredQuestions,
                    avg_score: avgScore
                }
            }));

        } catch (err) {
            console.error('Error terminating interview:', err);
            // Still close the interview even if backend call fails
            setCloseReason(reason || 'Interview terminated.');
        }
    }, [interviewId, interviewClosed]);

    // ----------------------------------------------------------------------
    // Data Fetching Logic (with Retry & Error Handling)
    // ----------------------------------------------------------------------
    const fetchInterview = useCallback(async () => {
        // Don't attempt to fetch if there's no interview ID
        if (!interviewId) {
            setMissingId(true);
            setError('No interview ID provided. Please use the interview link sent to your email.');
            setLoading(false);
            return;
        }

        try {
            const url = token
                ? `/interviews/${interviewId}?token=${token}`
                : `/interviews/${interviewId}`;
            const response = await axios.get(url);

            // Validate that interview data has a current question
            if (!response.data.current_question && !response.data.is_completed) {
                // If no question and interview not completed, show error
                setError('No question available. Questions are being generated based on the job description. Please refresh the page.');
                // Retry after 3 seconds
                setTimeout(() => {
                    fetchInterview();
                }, 3000);
                return;
            }

            setInterview(response.data);

            // Check if interview is already completed
            if (response.data.is_completed || response.data.status === 'completed') {
                setInterviewClosed(true);
                setCloseReason('You have already completed this interview. Please contact the recruiter if you believe this is a mistake.');
                setLoading(false);
                return;
            }

            // FIX #4: Do NOT use proctoring_warning_count >= 3 as a termination signal.
            // That field may be leftover from a previous session if the interview document was
            // reused. Only trust the authoritative 'status' field set by the backend.
            // (proctoring_warning_count is a UI hint, not a termination gate)
            if (response.data.status === 'terminated') {
                setInterviewClosed(true);
                setCloseReason(
                    response.data.termination_reason ||
                    'Interview terminated: Maximum proctoring violations exceeded.'
                );
                setLoading(false);
                return;
            }

            // Clear any previous errors if interview loaded successfully
            if (response.data.current_question) {
                setError('');
            }
        } catch (err) {
            let errorDetail = err?.response?.data?.detail || 'Failed to load interview';
            
            if (typeof errorDetail !== 'string') {
              if (Array.isArray(errorDetail)) {
                  errorDetail = errorDetail.map(e => e.msg || JSON.stringify(e)).join('; ');
              } else if (typeof errorDetail === 'object' && errorDetail !== null) {
                  errorDetail = errorDetail.msg || JSON.stringify(errorDetail);
              } else {
                  errorDetail = String(errorDetail);
              }
            }
            const statusCode = err?.response?.status;

            // Handle specific error cases
            if (statusCode === 400 && errorDetail.includes('already completed')) {
                setInterviewClosed(true);
                setCloseReason(errorDetail);
            } else if (statusCode === 410 || errorDetail.includes('invalidated')) {
                setInterviewClosed(true);
                setCloseReason(errorDetail || 'This interview link has been invalidated. A new interview link has been sent to your email. Please check your inbox.');
            } else if (statusCode === 400 && errorDetail.includes('terminated')) {
                setInterviewClosed(true);
                setCloseReason('Your interview has been terminated.');
            } else {
                setError(errorDetail);
            }
        } finally {
            setLoading(false);
        }
    }, [interviewId, token]);

    // Initial Fetch
    useEffect(() => {
        fetchInterview();
    }, [fetchInterview]);

    return useMemo(() => ({
        interview,
        setInterview,
        loading,
        error,
        setError,
        interviewId,
        interviewClosed,
        setInterviewClosed,
        closeReason,
        setCloseReason,
        endInterview,
        fetchInterview,
        missingId,
        currentQuestionIndex,
        currentQuestion,
        questionType
    }), [
        interview, 
        loading, 
        error, 
        interviewId, 
        interviewClosed, 
        closeReason, 
        endInterview, 
        fetchInterview, 
        missingId, 
        currentQuestionIndex, 
        currentQuestion, 
        questionType
    ]);
};
