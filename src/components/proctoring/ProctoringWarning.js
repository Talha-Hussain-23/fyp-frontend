import { useEffect, useRef, useState } from 'react';

const CloseIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// PHASE 5.1: Countdown Timer Component
const CountdownTimer = ({ seconds, severity }) => {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const progress = (timeLeft / seconds) * 100;
  
  useEffect(() => {
    if (timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 0.1));
    }, 100);
    
    return () => clearInterval(timer);
  }, [timeLeft]);
  
  const getColor = () => {
    if (severity === 'CRITICAL') return '#ef4444'; // red
    if (severity === 'WARNING') return '#f59e0b'; // amber
    return '#3b82f6'; // blue
  };
  
  return (
    <div className="countdown-timer" style={{ marginTop: '12px' }}>
      <div style={{ 
        position: 'relative', 
        width: '60px', 
        height: '60px', 
        margin: '0 auto' 
      }}>
        <svg width="60" height="60" style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx="30"
            cy="30"
            r="26"
            fill="none"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="4"
          />
          <circle
            cx="30"
            cy="30"
            r="26"
            fill="none"
            stroke={getColor()}
            strokeWidth="4"
            strokeDasharray={`${2 * Math.PI * 26}`}
            strokeDashoffset={`${2 * Math.PI * 26 * (1 - progress / 100)}`}
            style={{ transition: 'stroke-dashoffset 0.1s linear' }}
          />
        </svg>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: 'white',
          fontSize: '18px',
          fontWeight: 'bold'
        }}>
          {Math.ceil(timeLeft)}
        </div>
      </div>
      <p style={{ 
        color: 'rgba(255,255,255,0.8)', 
        fontSize: '12px', 
        textAlign: 'center',
        marginTop: '8px'
      }}>
        Auto-dismiss in {Math.ceil(timeLeft)}s
      </p>
    </div>
  );
};

// PHASE 5.4: Technical Details Toggle
const TechnicalDetails = ({ metadata, show }) => {
  if (!show || !metadata) return null;
  
  return (
    <div style={{
      marginTop: '12px',
      padding: '12px',
      background: 'rgba(0,0,0,0.3)',
      borderRadius: '8px',
      fontSize: '12px',
      fontFamily: 'monospace',
      color: 'rgba(255,255,255,0.7)'
    }}>
      <div><strong>Confidence:</strong> {metadata.confidence ? `${(metadata.confidence * 100).toFixed(1)}%` : 'N/A'}</div>
      <div><strong>Frame:</strong> {metadata.frame_number || 'N/A'}</div>
      {metadata.bbox && (
        <div><strong>BBox:</strong> [{metadata.bbox.join(', ')}]</div>
      )}
      <div><strong>Timestamp:</strong> {metadata.timestamp || new Date().toISOString()}</div>
    </div>
  );
};

// CRITICAL FIX #2: Specific violation type display
const VIOLATION_TYPES = {
  'CELL_PHONE': {
    icon: '📱',
    title: 'Mobile Device Detected',
    message: 'A mobile phone was detected in your camera view. Please remove it immediately.',
    severity: 'CRITICAL'
  },
  'TAB_SWITCHED': {
    icon: '🔄',
    title: 'Tab Switching Detected',
    message: 'You switched to another browser tab. Please stay on this interview tab.',
    severity: 'WARNING'
  },
  'EXTRA_PERSON': {
    icon: '👥',
    title: 'Multiple Persons Detected',
    message: 'More than one person is visible in the camera. Only you should be present.',
    severity: 'TERMINAL'
  },
  'LAPTOP': {
    icon: '💻',
    title: 'Additional Device Detected',
    message: 'A secondary laptop or computer was detected. Please remove it.',
    severity: 'CRITICAL'
  },
  'BOOK': {
    icon: '📚',
    title: 'Reference Material Detected',
    message: 'Books or notes were detected. This is not allowed during the interview.',
    severity: 'WARNING'
  },
  'NO_PERSON': {
    icon: '👤',
    title: 'Candidate Not Visible',
    message: 'You are not visible in the camera. Please ensure your face is clearly visible.',
    severity: 'CRITICAL'
  },
  'HEAD_TURNED_LEFT': {
    icon: '⬅️',
    title: 'Head Turned Left',
    message: 'Your head is turned too far to the left. Please stay focused on the screen.',
    severity: 'WARNING'
  },
  'HEAD_TURNED_RIGHT': {
    icon: '➡️',
    title: 'Head Turned Right',
    message: 'Your head is turned too far to the right. Please stay focused on the screen.',
    severity: 'WARNING'
  },
  'FACE_NOT_VISIBLE': {
    icon: '😶',
    title: 'Face Not Visible',
    message: 'Your face is not clearly visible to the AI. Please adjust your position.',
    severity: 'WARNING'
  },
  'MULTIPLE_FACES': {
    icon: '👥',
    title: 'Multiple Faces Detected',
    message: 'Multiple faces detected in the frame. Only you should be visible.',
    severity: 'CRITICAL'
  },
  'AUDIO_DETECTED': {
    icon: '🎤',
    title: 'Audio Activity Detected',
    message: 'Repeated or continuous sound detected. Please maintain silence.',
    severity: 'WARNING'
  },
  'WINDOW_FOCUS_LOST': {
    icon: '🚪',
    title: 'Window Focus Lost',
    message: 'You lost focus on the interview window. Stay on the interview page.',
    severity: 'WARNING'
  },
  'WINDOW_BLUR': {
    icon: '🚪',
    title: 'Window Focus Lost',
    message: 'Window focus lost! Stay on the interview page.',
    severity: 'WARNING'
  },
  'KEYBOARD_SHORTCUT_BLOCKED': {
    icon: '⌨️',
    title: 'Interaction Blocked',
    message: 'Keyboard shortcut detected and blocked. Use of shortcuts is restricted.',
    severity: 'WARNING'
  },
  'FULLSCREEN_EXIT': {
    icon: '📺',
    title: 'Fullscreen Exit',
    message: 'You exited fullscreen mode. Fullscreen is mandatory during the interview.',
    severity: 'CRITICAL'
  },
  'RIGHT_CLICK_BLOCKED': {
    icon: '🖱️',
    title: 'Right-Click Blocked',
    message: 'Right-click is disabled during the interview.',
    severity: 'WARNING'
  }
};

const useAudioAlert = (severity, enabled = true) => {
  const audioRef = useRef(null);
  
  useEffect(() => {
    if (!enabled) return;
    
    // Short alert beep (Data URL / Base64) to bypass CSP restrictions and network issues
    // This is a simple Sinewave beep (~200ms)
    const alertBeep = "data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YVtvT19vT18vLy9vb29vb29vb29vb29vb29vb29vb29vb29vb29vb29vb29vb29vb29vb29vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8v";
    
    try {
        audioRef.current = new Audio(alertBeep);
        audioRef.current.volume = 0.5;
        
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
            playPromise
                .then(() => console.debug(`🔊 Alert beep sounded: ${severity}`))
                .catch(err => {
                    // Fail silently or log info
                    console.info('ℹ️ Audio autoplay blocked:', err.message);
                });
        }
    } catch (err) {
        console.error('Audio initialization failed:', err);
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [severity, enabled]);
};

function ProctoringWarning({ 
  show, 
  message, 
  violationType,
  severity = 'WARNING',
  warningCount, 
  maxWarnings, 
  isTerminated,
  metadata,
  onDismiss,
  onRedirect 
}) {
  // PHASE 5.4: Technical details toggle
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  
  // PHASE 5.2: Sound alert
  useAudioAlert(severity, show);
  
  // PHASE 5.1: Auto-dismiss for INFO violations
  useEffect(() => {
    if (show && severity === 'INFO' && !isTerminated) {
      const timer = setTimeout(() => {
        onDismiss && onDismiss();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [show, severity, isTerminated, onDismiss]);
  
  // PHASE 5.3: Keyboard navigation
  useEffect(() => {
    if (!show) return;
    
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isTerminated) {
        onDismiss && onDismiss();
      } else if (e.key === 'Enter' && !isTerminated) {
        onDismiss && onDismiss();
      } else if (e.key === 't' || e.key === 'T') {
        setShowTechnicalDetails(prev => !prev);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [show, isTerminated, onDismiss]);
  
  if (!show) return null;

  const remainingWarnings = maxWarnings - warningCount;
  
  // CRITICAL FIX #2: Get specific violation details
  const violationDetails = violationType && VIOLATION_TYPES[violationType] 
    ? VIOLATION_TYPES[violationType]
    : {
        icon: '⚠️',
        title: 'Proctoring Alert',
        message: message || 'A violation was detected during the interview.',
        severity: severity
      };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-90 p-4 transition-opacity duration-300"
      role="dialog"
      aria-modal="true"
      aria-labelledby="violation-title"
      aria-describedby="violation-message"
    >
      <div className={`max-w-md w-full rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 ${
        isTerminated ? 'scale-100 ring-4 ring-red-500 shadow-red-900/50' : 'scale-100 ring-1 ring-amber-500/30'
      }`}>
        <div className={`p-6 ${
          isTerminated 
            ? 'bg-gradient-to-br from-red-600 to-red-900' 
            : severity === 'CRITICAL'
            ? 'bg-gradient-to-br from-red-500 to-orange-600'
            : 'bg-gradient-to-br from-amber-500 to-orange-600'
        }`}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center">
              <div className={`p-2 rounded-full ${isTerminated ? 'bg-white/20' : 'bg-white/20'} mr-3 backlight`}>
                {/* CRITICAL FIX #2: Show specific icon */}
                <span className="text-3xl" role="img" aria-label={violationDetails.title}>
                  {isTerminated ? '⛔' : violationDetails.icon}
                </span>
              </div>
              <h3 id="violation-title" className="text-2xl font-bold text-white tracking-wide uppercase">
                {/* CRITICAL FIX #2: Show specific title */}
                {isTerminated ? 'Session Terminated' : violationDetails.title}
              </h3>
            </div>
            {!isTerminated && (
              <button
                onClick={onDismiss}
                className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
                aria-label="Dismiss warning"
              >
                <CloseIcon className="w-6 h-6" />
              </button>
            )}
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-lg">
            {/* CRITICAL FIX #2: Show specific message */}
            <p id="violation-message" className="text-white font-medium text-lg leading-relaxed drop-shadow-sm">
              {violationDetails.message}
            </p>
            
            {/* Show violation type for debugging */}
            {violationType && (
              <p className="text-white/60 text-xs mt-2 font-mono">
                Type: {violationType}
              </p>
            )}
            
            {/* PHASE 5.1: Countdown Timer for CRITICAL violations */}
            {!isTerminated && severity === 'CRITICAL' && (
              <CountdownTimer seconds={5} severity={severity} />
            )}
            
            {/* PHASE 5.4: Technical Details Toggle */}
            {!isTerminated && metadata && (
              <div style={{ marginTop: '12px' }}>
                <button
                  onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                  aria-expanded={showTechnicalDetails}
                >
                  {showTechnicalDetails ? '▼' : '▶'} Technical Details (Press T)
                </button>
                <TechnicalDetails metadata={metadata} show={showTechnicalDetails} />
              </div>
            )}
            
            {!isTerminated && (
              <div className="mt-5 pt-4 border-t border-white/20">
                <div className="flex items-center justify-between text-white text-xs mb-2 font-bold uppercase tracking-widest opacity-90">
                  <span>Violation Level</span>
                  <span>{warningCount} / {maxWarnings}</span>
                </div>
                <div className="w-full bg-black/30 rounded-full h-3 overflow-hidden box-border border border-white/10">
                  <div
                    className={`h-full transition-all duration-500 ease-out shadow-[0_0_15px_rgba(255,255,255,0.6)] ${
                        warningCount >= maxWarnings - 1 ? 'bg-red-400 animate-pulse' : 'bg-white'
                    }`}
                    style={{ width: `${(warningCount / maxWarnings) * 100}%` }}
                    role="progressbar"
                    aria-valuenow={warningCount}
                    aria-valuemin={0}
                    aria-valuemax={maxWarnings}
                  />
                </div>
                {remainingWarnings > 0 && (
                  <p className="text-white text-xs mt-3 flex items-center bg-black/20 rounded-lg p-2.5 border border-white/5">
                    <span className="mr-2 text-lg" role="img" aria-label="warning">👮</span>
                    <span>
                        <strong>{remainingWarnings} more violation{remainingWarnings !== 1 ? 's' : ''}</strong> will result in immediate disqualification.
                    </span>
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-5 border-t border-gray-100">
          {isTerminated ? (
             <div className="text-center">
                <p className="text-gray-600 text-sm mb-4 font-medium">
                  Compliance standards were breached. A detailed forensic report has been generated for the review board.
                </p>
                <button
                  onClick={onRedirect}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg transition-all tracking-wide uppercase text-sm"
                >
                  Exit Session
                </button>
             </div>
          ) : (
            <button
              onClick={onDismiss}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold py-3.5 px-4 rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-amber-500/30 transform hover:-translate-y-0.5 active:translate-y-0"
              aria-label="I understand and will comply"
            >
              I Understand & Comply
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProctoringWarning;
