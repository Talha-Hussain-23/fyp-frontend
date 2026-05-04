import { useCallback, useRef, useState } from 'react';
import axios from '../../axios';

export const useCandidates = (fetchKPIs, showMessage) => {
    const [candidates, setCandidates] = useState([]);
    const [loadingCandidates, setLoadingCandidates] = useState(false);
    
    // Refs to prevent race conditions
    const fetchingCandidatesRef = useRef(false);
    const currentJobIdRef = useRef(null);

    const fetchCandidates = useCallback(async (jobId) => {
        if (fetchingCandidatesRef.current && currentJobIdRef.current === jobId) {
            return;
        }

        try {
            fetchingCandidatesRef.current = true;
            currentJobIdRef.current = jobId;
            setLoadingCandidates(true);

            const url = jobId ? `/jobs/${jobId}/candidates` : '/applications/';
            const res = await axios.get(url);

            if (currentJobIdRef.current === jobId) {
                setCandidates(res.data.candidates || []);
            }
        } catch (err) {
            console.error("Fetch candidates error:", err);
            if (currentJobIdRef.current === jobId) {
                let errorMsg = err?.response?.data?.detail || 'Failed to load candidates';
                if (typeof errorMsg !== 'string') {
                    if (Array.isArray(errorMsg)) {
                        errorMsg = errorMsg.map(e => e.msg || JSON.stringify(e)).join('; ');
                    } else if (typeof errorMsg === 'object' && errorMsg !== null) {
                        errorMsg = errorMsg.msg || JSON.stringify(errorMsg);
                    } else {
                        errorMsg = String(errorMsg);
                    }
                }
                if (showMessage) showMessage('error', errorMsg);
            }
        } finally {
            if (currentJobIdRef.current === jobId) {
                setLoadingCandidates(false);
            }
            fetchingCandidatesRef.current = false;
        }
    }, [showMessage]);

    const updateCandidateStatus = async (applicationId, newStatus, sendEmail = false, selectedJobId) => {
        // ✅ OPTIMISTIC UPDATE: Update local state immediately
        const originalCandidates = [...candidates];
        setCandidates(prev => prev.map(c => 
            (c.application_id === applicationId || c._id === applicationId || c.id === applicationId) 
            ? { ...c, status: newStatus } 
            : c
        ));

        try {
            const res = await axios.put(`/applications/${applicationId}/status`, {
                status: newStatus,
                send_email: sendEmail
            });
            
            const successMsg = res.data.message || `Candidate status updated to ${newStatus}${sendEmail ? ' and email sent' : ''}!`;
            showMessage('success', successMsg);
            
            // Sync KPIs in background
            if (fetchKPIs) fetchKPIs();
        } catch (err) {
            // ❌ ROLLBACK: Restore original state on failure
            setCandidates(originalCandidates);
            console.error("Status update error:", err);
            let errorMsg = err?.response?.data?.detail 
                || err?.response?.data?.error 
                || err?.message 
                || 'Failed to update status';

            if (typeof errorMsg !== 'string') {
                errorMsg = JSON.stringify(errorMsg);
            }
            showMessage('error', errorMsg);
        }
    };

    return {
        candidates,
        loadingCandidates,
        fetchCandidates,
        updateCandidateStatus
    };
};
