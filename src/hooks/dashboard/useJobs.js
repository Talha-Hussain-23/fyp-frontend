import { useCallback, useState } from 'react';
import axios from '../../axios';
import { useConfirm } from '../../context/ConfirmContext';
import { toUTCISOString } from '../../utils/dateUtils';

export const useJobs = (fetchKPIs, showMessage) => {
    const { confirm } = useConfirm();
    const [myJobs, setMyJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submittingJob, setSubmittingJob] = useState(false);

    const fetchMyJobs = useCallback(async () => {
        try {
            setLoading(true);
            const res = await axios.get('/jobs');
            setMyJobs(res.data.items || []);
        } catch (err) {
            if (showMessage) showMessage('error', 'Failed to load jobs');
        } finally {
            setLoading(false);
        }
    }, [showMessage]);

    const createJob = async (jobForm, onSuccess) => {
        if (submittingJob) return;
        setSubmittingJob(true);
        try {
            const payload = {
                title: jobForm.title || null,
                description: jobForm.description,
                difficulty_level: jobForm.difficulty_level || 'Moderate',
                num_questions: Number(jobForm.num_questions),
                apply_deadline: toUTCISOString(jobForm.apply_deadline),
                num_vacancies: Number(jobForm.num_vacancies),
                question_type: jobForm.question_type,
                // CRITICAL FIX: Derive question_types from interview_config when present
                // to ensure consistency and prevent Descriptive questions when only MCQs selected
                question_types: jobForm.interview_config 
                    ? jobForm.interview_config.enabled_section_types 
                    : (jobForm.question_types && jobForm.question_types.length > 0 
                        ? jobForm.question_types 
                        : [jobForm.question_type]),
                max_shortlist: Number(jobForm.max_shortlist),
                ai_instructions: jobForm.ai_instructions || null,
                invite_rule: jobForm.invite_rule || 'Top 10',
                invite_rule_n: jobForm.invite_rule === 'Top N' ? Number(jobForm.invite_rule_n) : null,
                start_date: toUTCISOString(jobForm.start_date),
                // Include interview_config if present
                ...(jobForm.interview_config && { interview_config: jobForm.interview_config })
            };

            if (payload.start_date && payload.apply_deadline && new Date(payload.start_date) >= new Date(payload.apply_deadline)) {
                showMessage('error', 'Start Date must be earlier than the Application Deadline');
                setSubmittingJob(false);
                return;
            }

            await axios.post('/jobs', payload);
            await fetchMyJobs();
            if (fetchKPIs) await fetchKPIs();
            
            showMessage('success', 'Job created successfully!');
            if (onSuccess) onSuccess();
        } catch (err) {
            let errorMsg = err?.response?.data?.detail || 'Failed to create job';
            if (typeof errorMsg !== 'string') {
                if (Array.isArray(errorMsg)) {
                    errorMsg = errorMsg.map(e => e.msg || JSON.stringify(e)).join('; ');
                } else if (typeof errorMsg === 'object' && errorMsg !== null) {
                    errorMsg = errorMsg.msg || JSON.stringify(errorMsg);
                } else {
                    errorMsg = String(errorMsg);
                }
            }
            showMessage('error', errorMsg);
        } finally {
            setSubmittingJob(false);
        }
    };

    const updateJob = async (jobId, jobForm, onSuccess) => {
        if (submittingJob) return;
        setSubmittingJob(true);
        try {
            const updatePayload = {
                title: jobForm.title || null,
                description: jobForm.description,
                difficulty_level: jobForm.difficulty_level || 'Moderate',
                num_questions: Number(jobForm.num_questions),
                apply_deadline: toUTCISOString(jobForm.apply_deadline),
                num_vacancies: Number(jobForm.num_vacancies),
                question_type: jobForm.question_type,
                // CRITICAL FIX: Derive question_types from interview_config when present
                // to ensure consistency and prevent Descriptive questions when only MCQs selected
                question_types: jobForm.interview_config 
                    ? jobForm.interview_config.enabled_section_types 
                    : (jobForm.question_types && jobForm.question_types.length > 0 
                        ? jobForm.question_types 
                        : [jobForm.question_type]),
                max_shortlist: Number(jobForm.max_shortlist),
                ai_instructions: jobForm.ai_instructions || null,
                invite_rule: jobForm.invite_rule || 'Top 10',
                invite_rule_n: jobForm.invite_rule === 'Top N' ? Number(jobForm.invite_rule_n) : null,
                status: jobForm.status,
                start_date: toUTCISOString(jobForm.start_date),
                // Include interview_config if present
                ...(jobForm.interview_config && { interview_config: jobForm.interview_config })
            };

            if (updatePayload.start_date && updatePayload.apply_deadline && new Date(updatePayload.start_date) >= new Date(updatePayload.apply_deadline)) {
                showMessage('error', 'Start Date must be earlier than the Application Deadline');
                setSubmittingJob(false);
                return;
            }

            await axios.put(`/jobs/${jobId}`, updatePayload);
            await fetchMyJobs();
            if (fetchKPIs) await fetchKPIs();
            
            showMessage('success', 'Job updated successfully!');
            if (onSuccess) onSuccess();
        } catch (err) {
            let errorMsg = err?.response?.data?.detail || 'Failed to update job';
            if (typeof errorMsg !== 'string') {
                if (Array.isArray(errorMsg)) {
                    errorMsg = errorMsg.map(e => e.msg || JSON.stringify(e)).join('; ');
                } else if (typeof errorMsg === 'object' && errorMsg !== null) {
                    errorMsg = errorMsg.msg || JSON.stringify(errorMsg);
                } else {
                    errorMsg = String(errorMsg);
                }
            }
            showMessage('error', errorMsg);
        } finally {
            setSubmittingJob(false);
        }
    };

    const deleteJob = async (jobId, onSuccess) => {
        const isConfirmed = await confirm('Are you sure you want to archive this job? You can reopen it later if needed.');
        if (!isConfirmed) return;
        try {
            await axios.delete(`/jobs/${jobId}`);
            showMessage('success', 'Job archived successfully!');
            fetchMyJobs();
            if (fetchKPIs) fetchKPIs();
            if (onSuccess) onSuccess();
        } catch (err) {
            let errorMsg = err?.response?.data?.detail || 'Failed to archive job';
            if (typeof errorMsg !== 'string') {
                if (Array.isArray(errorMsg)) {
                    errorMsg = errorMsg.map(e => e.msg || JSON.stringify(e)).join('; ');
                } else if (typeof errorMsg === 'object' && errorMsg !== null) {
                    errorMsg = errorMsg.msg || JSON.stringify(errorMsg);
                } else {
                    errorMsg = String(errorMsg);
                }
            }
            showMessage('error', errorMsg);
        }
    };

    return {
        myJobs,
        loading,
        submittingJob,
        fetchMyJobs,
        createJob,
        updateJob,
        deleteJob
    };
};
