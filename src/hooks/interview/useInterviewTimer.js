import { useEffect, useMemo, useRef, useState } from 'react';
import logger from '../../utils/logger';

/**
 * useInterviewTimer (Server Authoritative)
 * 
 * Instead of counting down locally from an arbitrary number,
 * this hook calculates: TimeRemaining = (ServerStartTime + Duration) - ClientCurrentTime.
 * 
 * Features:
 * - Prevents clock drift.
 * - Prevents resets on page refresh (as long as backend sends started_at).
 * - Auto-triggers timeout ONLY when strictly <= 0.
 */
export const useInterviewTimer = (interview, isInterviewActive, onTimeout) => {
    const [secondsRemaining, setSecondsRemaining] = useState(60);
    const [isExpired, setIsExpired] = useState(false);
    
    // UseRef to hold the timeout callback to prevent effect re-runs
    const timeoutCallbackRef = useRef(onTimeout);
    useEffect(() => { timeoutCallbackRef.current = onTimeout; }, [onTimeout]);

    // Main Timer Loop
    useEffect(() => {
        if (!isInterviewActive || !interview || interview.is_completed) {
            return;
        }

        const calculateRemaining = () => {
            const maxTime = interview?.question_duration || interview?.time_limit_question || 60;
            
            // 1. Priority: Server-Side Absolute Expiration (New Orchestration Engine)
            if (interview.question_expires_at) {
                const expires = new Date(interview.question_expires_at).getTime();
                // Add a small buffer only for display? No, keep it strict to match server.
                // The server has a grace period, but client should show 0 when it hits the limit.
                const now = Date.now();
                const remaining = Math.max(0, Math.ceil((expires - now) / 1000));
                return remaining;
            }

            // 2. Fallback: Legacy Logic (Start Time + Fixed Duration)
            if (!interview.question_started_at) {
                return maxTime; // Default fallback
            }

            const startTime = new Date(interview.question_started_at).getTime();
            const now = Date.now();
            const durationMs = maxTime * 1000; // dynamic duration per question
            const elapsed = now - startTime;
            const remaining = Math.max(0, Math.ceil((durationMs - elapsed) / 1000));
            
            return remaining;
        };

        // Initial Sync
        const initialRemaining = calculateRemaining();
        setSecondsRemaining(initialRemaining);
        if (initialRemaining > 0) {
            setIsExpired(false);
        }

        // Interval
        const intervalId = setInterval(() => {
            const remaining = calculateRemaining();
            setSecondsRemaining(remaining);

            if (remaining <= 0) {
                if (!isExpired) {
                    setIsExpired(true);
                    logger.warn("Timer expired. Triggering timeout callback.");
                    if (timeoutCallbackRef.current) {
                        timeoutCallbackRef.current();
                    }
                }
                clearInterval(intervalId);
            }
        }, 1000);

        return () => clearInterval(intervalId);

    }, [
        interview?.question_expires_at, 
        interview?.question_started_at, 
        isInterviewActive, 
        interview?.is_completed, 
        isExpired,
        interview
    ]);

    const maxTime = interview?.question_duration || interview?.time_limit_question || 60;

    return useMemo(() => ({
        secondsRemaining,
        maxTime,
        isExpired
    }), [secondsRemaining, maxTime, isExpired]);
};
