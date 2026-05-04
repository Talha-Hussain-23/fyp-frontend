/**
 * Server Timer Hook
 * Syncs with server-authoritative timer to prevent drift
 */

import { useState, useEffect, useRef, useCallback } from 'react';

const DRIFT_CHECK_INTERVAL = 10000; // Check drift every 10 seconds
const DRIFT_THRESHOLD = 2000; // Sync if drift > 2 seconds

/**
 * useServerTimer Hook
 * 
 * @param {Object} interview - Interview object with timer data
 * @param {Function} onTimeout - Callback when timer expires
 * @returns {Object} Timer state
 */
export function useServerTimer(interview, onTimeout) {
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [isExpired, setIsExpired] = useState(false);
  const [serverDrift, setServerDrift] = useState(0);
  const [lastSync, setLastSync] = useState(null);
  
  const timerRef = useRef(null);
  const driftCheckRef = useRef(null);
  const hasTriggeredTimeout = useRef(false);
  
  // Calculate remaining time from server timestamp
  const calculateRemaining = useCallback(() => {
    if (!interview?.current_phase_expires_at) {
      return 0;
    }
    
    const expiresAt = new Date(interview.current_phase_expires_at);
    const now = new Date();
    const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000));
    
    return remaining;
  }, [interview?.current_phase_expires_at]);
  
  // Check for drift and sync if needed
  const checkDrift = useCallback(() => {
    const serverRemaining = calculateRemaining();
    const drift = Math.abs(serverRemaining - secondsRemaining);
    
    setServerDrift(drift);
    
    if (drift > DRIFT_THRESHOLD / 1000) {
      console.warn(`Timer drift detected: ${drift}s. Syncing with server...`);
      setSecondsRemaining(serverRemaining);
      setLastSync(new Date().toISOString());
    }
  }, [calculateRemaining, secondsRemaining]);
  
  // Start timer
  useEffect(() => {
    if (!interview?.current_phase_expires_at) {
      return;
    }
    
    // Initial calculation
    const initial = calculateRemaining();
    setSecondsRemaining(initial);
    setIsExpired(initial === 0);
    setLastSync(new Date().toISOString());
    
    // Update every second
    timerRef.current = setInterval(() => {
      setSecondsRemaining(prev => {
        const newValue = Math.max(0, prev - 1);
        
        // Check if expired
        if (newValue === 0 && !hasTriggeredTimeout.current) {
          setIsExpired(true);
          hasTriggeredTimeout.current = true;
          
          if (onTimeout) {
            console.log('Timer expired, triggering timeout callback');
            onTimeout();
          }
        }
        
        return newValue;
      });
    }, 1000);
    
    // Check drift periodically
    driftCheckRef.current = setInterval(checkDrift, DRIFT_CHECK_INTERVAL);
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (driftCheckRef.current) {
        clearInterval(driftCheckRef.current);
      }
    };
  }, [interview?.current_phase_expires_at, calculateRemaining, checkDrift, onTimeout]);
  
  // Format time as MM:SS
  const formattedTime = useCallback(() => {
    const minutes = Math.floor(secondsRemaining / 60);
    const seconds = secondsRemaining % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [secondsRemaining]);
  
  // Get color based on remaining time
  const getTimerColor = useCallback(() => {
    if (secondsRemaining > 30) return 'green';
    if (secondsRemaining > 10) return 'yellow';
    return 'red';
  }, [secondsRemaining]);
  
  // Is timer critical? (< 10 seconds)
  const isCritical = secondsRemaining < 10 && secondsRemaining > 0;
  
  return {
    secondsRemaining,
    isExpired,
    serverDrift,
    lastSync,
    formattedTime: formattedTime(),
    timerColor: getTimerColor(),
    isCritical,
    // Utility
    hasTime: secondsRemaining > 0
  };
}

export default useServerTimer;
