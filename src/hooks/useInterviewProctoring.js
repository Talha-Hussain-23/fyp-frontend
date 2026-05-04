import { useCallback, useEffect, useRef, useState } from 'react';
import axios from '../axios';

/**
 * Custom hook for interview proctoring
 * Monitors tab switching, copy/paste, internet connection, and violations
 */
export const useInterviewProctoring = (interviewId, onTerminate, initialWarningCount = 0, isMonitoring = false, currentQuestionIndex = -1) => {
  const [violations, setViolations] = useState([]);
  const [warningCount, setWarningCount] = useState(initialWarningCount);
  const [isTerminated, setIsTerminated] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [violationType, setViolationType] = useState(null); 
  const [connectionStatus, setConnectionStatus] = useState('stable');
  
  // FIX #3: Track warningCount in a ref to avoid stale closure in CustomEvent dispatch
  const warningCountRef = useRef(initialWarningCount);

  // FIX #2: Startup grace period — suppress violations fired during fullscreen/focus transition
  // When isMonitoring activates, the browser emits blur/fullscreenchange events as a side-effect
  // of entering fullscreen. These are NOT real violations. Suppress for 3s after monitoring starts.
  const startupGraceRef = useRef(false);

  useEffect(() => {
    if (isMonitoring) {
      console.log(`🛡️ Proctoring Hook Active: interviewId=${interviewId}, isMonitoring=${isMonitoring}, currentQuestionIndex=${currentQuestionIndex}`);
      startupGraceRef.current = true;
      const graceTimer = setTimeout(() => {
        startupGraceRef.current = false;
        console.log('🛡️ Startup grace period ended — violations now active');
      }, 3000);
      return () => clearTimeout(graceTimer);
    }
  }, [isMonitoring, interviewId, currentQuestionIndex]);
  
  // Tracking for escalation: type -> count
  const violationCountsRef = useRef({});
  
  const MAX_WARNINGS = 3;
  const violationTimeoutRef = useRef(null);
  const lastViolationTimeRef = useRef(0); 
  const DEBOUNCE_WINDOW_MS = 2000; 

  const terminateInterview = useCallback((reason) => {
    setIsTerminated(true);
    setWarningMessage(`Interview Terminated: ${reason}`);
    setShowWarning(true);
    
    if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
    }

    if (onTerminate) {
      onTerminate(reason);
    }
  }, [onTerminate]);

  const addViolation = useCallback(async (type, message, shouldLog = true) => {
    if (isTerminated || !isMonitoring || currentQuestionIndex < 0) {
        if (!isTerminated && isMonitoring) {
           console.warn(`Violation suppressed: currentQuestionIndex=${currentQuestionIndex}`);
        }
        return;
    }

    // FIX #2: Startup grace — suppress violations fired during fullscreen/focus browser side-effects
    // TAB_SWITCHED is excluded from grace since it's always intentional by the candidate
    if (startupGraceRef.current && type !== 'TAB_SWITCHED') {
      console.warn(`[STARTUP_GRACE] Suppressing ${type} — within 3s startup window`);
      return;
    }

    const now = Date.now();
    const timeSinceLastViolation = now - lastViolationTimeRef.current;
    
    if (timeSinceLastViolation < DEBOUNCE_WINDOW_MS) {
      console.warn(`Debounced duplicate violation: ${type}`);
      return;
    }
    
    lastViolationTimeRef.current = now;

    // Every detected violation = 1 strike (aligns with backend WarningManager)
    const severity = 'violation';

    const violation = {
      type,
      message,
      timestamp: new Date().toISOString(),
      severity: severity,
      question_number: currentQuestionIndex + 1
    };

    setViolations(prev => [...prev, violation]);
    
    setWarningCount(prev => {
      const newCount = prev + 1;
      // FIX #3: Keep ref in sync so CustomEvent always gets the real count (not stale closure)
      warningCountRef.current = newCount;
      return newCount;
    });

    setWarningMessage(`VIOLATION: ${message}`);
    setViolationType(type);
    setShowWarning(true);

    // Dispatch custom event for Interview.js listener
    // FIX #3: Use warningCountRef.current — warningCount in closure is always 1 render behind
    window.dispatchEvent(new CustomEvent('proctoring:violation_warning', {
      detail: {
        type,
        message,
        totalStrikes: warningCountRef.current,
        timestamp: violation.timestamp,
        violation
      }
    }));

    if (violationTimeoutRef.current) clearTimeout(violationTimeoutRef.current);
    violationTimeoutRef.current = setTimeout(() => {
      setShowWarning(false);
    }, 5000);

    if (shouldLog) {
      logViolationToBackend(interviewId, violation).then(result => {
          if (result && result.should_terminate) {
              terminateInterview(result.termination_reason || 'Security violation limit exceeded');
          }
      });
    }
  }, [isTerminated, interviewId, terminateInterview, isMonitoring, currentQuestionIndex]);

  // Termination Trigger
  useEffect(() => {
    if (warningCount >= MAX_WARNINGS && !isTerminated) {
        terminateInterview('Maximum security violations exceeded (3/3)');
    }
  }, [warningCount, isTerminated, terminateInterview]);

  // Fullscreen Management
  useEffect(() => {
    if (isMonitoring && currentQuestionIndex === 0) {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                // FIX #2: Do NOT call addViolation here.
                // Browser fullscreen permission failure is a browser/OS restriction, NOT a candidate
                // cheating action. Penalizing it caused false violations on interview start.
                console.warn('Fullscreen request failed (browser/OS restriction, not a violation):', err.message);
            });
        }
    }
  }, [isMonitoring, currentQuestionIndex]);

  // Tab switching detection - GUARDED
  useEffect(() => {
    if (!isMonitoring || currentQuestionIndex < 0) return;

    const handleVisibilityChange = () => {
      if (document.hidden && !isTerminated) {
        addViolation('TAB_SWITCHED', 'Tab switching detected! Keep the interview tab active.');
      }
    };

    const handleWindowBlur = () => {
      if (!isTerminated) {
        addViolation('WINDOW_FOCUS_LOST', 'Window focus lost! Stay on the interview page.');
      }
    };

    const handleFullscreenChange = () => {
        if (!document.fullscreenElement && !isTerminated && currentQuestionIndex >= 0) {
            addViolation('FULLSCREEN_EXIT', 'You exited fullscreen mode! Fullscreen is mandatory.');
        }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [addViolation, isTerminated, isMonitoring, currentQuestionIndex]);

  // Shortcut key blocking - GUARDED
  useEffect(() => {
    if (!isMonitoring || currentQuestionIndex < 0) return;

    const handleKeyDown = (e) => {
      let blocked = false;
      let keyCombo = '';

      if (e.ctrlKey || e.metaKey) {
        const key = e.key.toLowerCase();
        if (['c', 'v', 'x'].includes(key)) {
          keyCombo = `Ctrl+${key.toUpperCase()}`;
          blocked = true;
        }
        if (key === 't' || key === 'n' || key === 'r') {
            keyCombo = `Ctrl+${key.toUpperCase()}`;
            blocked = true;
        }
        if (e.shiftKey && (key === 'i' || key === 'j' || key === 'c')) {
            keyCombo = `Ctrl+Shift+${key.toUpperCase()}`;
            blocked = true;
        }
      }

      if (e.key === 'F12') {
        keyCombo = 'F12';
        blocked = true;
      }

      if (blocked) {
        e.preventDefault();
        addViolation('KEYBOARD_SHORTCUT_BLOCKED', `Interaction ${keyCombo} is blocked during the interview!`);
      }
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
      addViolation('RIGHT_CLICK_BLOCKED', 'Right-click is disabled during the interview!');
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [addViolation, isMonitoring, currentQuestionIndex]);

  // Internet connection monitoring
  useEffect(() => {
    const handleOnline = () => {
      setConnectionStatus('stable');
    };

    const handleOffline = () => {
      setConnectionStatus('disconnected');
      terminateInterview('Internet connection lost');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [terminateInterview]);

  // Beforeunload - warn before closing
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!isTerminated) {
        e.preventDefault();
        e.returnValue = 'Are you sure you want to leave? Your interview will be terminated.';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isTerminated]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (violationTimeoutRef.current) {
        clearTimeout(violationTimeoutRef.current);
      }
    };
  }, []);

  return {
    violations,
    warningCount,
    maxWarnings: MAX_WARNINGS,
    isTerminated,
    showWarning,
    warningMessage,
    violationType, // CRITICAL FIX #2: Export violation type
    connectionStatus,
    addViolation,
    terminateInterview,
    dismissWarning: () => setShowWarning(false)
  };
};

// Helper function to log violations to backend with retry
const logViolationToBackend = async (interviewId, violation, retryCount = 0) => {
  const MAX_RETRIES = 3;
  const RETRY_DELAY_MS = 1000; // 1 second base delay
  
  try {
    // Adapter for new backend API: /api/violations/record
    const payload = {
      interview_id: interviewId,
      violation_type: violation.type,
      question_number: violation.question_number,
      severity: violation.severity,
      metadata: {
        message: violation.message,
        timestamp: violation.timestamp,
      }
    };

    const response = await axios.post(`/violations/record`, payload);
    return response.data;
  } catch (error) {
    console.error("Failed to log violation:", error);
    
    // Return early if it's already a 403 or similar to prevent infinite loops/useless retries
    if (error.response?.status === 403 || error.response?.status === 401) return null;

    // Retry with exponential backoff
    if (retryCount < MAX_RETRIES) {
      const delay = RETRY_DELAY_MS * Math.pow(2, retryCount);
      console.warn(`Retrying violation log in ${delay}ms (attempt ${retryCount + 1}/${MAX_RETRIES})`);
      
      setTimeout(() => {
        logViolationToBackend(interviewId, violation, retryCount + 1);
      }, delay);
    } else {
      // After all retries failed, store in localStorage for manual sync
      try {
        const failedViolations = JSON.parse(localStorage.getItem('failed_violations') || '[]');
        failedViolations.push({ interviewId, violation, timestamp: Date.now() });
        localStorage.setItem('failed_violations', JSON.stringify(failedViolations));
        console.error('Violation stored locally after all retries failed');
      } catch (storageError) {
        console.error('Failed to store violation locally:', storageError);
      }
    }
  }
};

export default useInterviewProctoring;
