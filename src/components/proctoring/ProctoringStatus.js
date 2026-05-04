
// ✅ PHASE 2: Enhanced Proctoring Status Component
function ProctoringStatus({ 
  warningCount, 
  maxWarnings, 
  connectionStatus, 
  isTerminated,
  violations = [],
  cameraPosition = 'centered',  
  audioLevel = 0,  
  onCalibrate,
  isCalibrating,
  performanceMetrics = {}, // { fps, latencyMs, processingTimeMs }
  faceDetectionStatus = 'idle', // 'idle' | 'loading' | 'active' | 'error'
  faceModelLoaded = false,
  faceModelLoading = false,
  faceCount = 0,
  isCameraActive = false,
  cameraError = null
}) {
  // Get last 3 violations
  const recentViolations = violations.slice(-3).reverse();
  
  
  // Audio level bars
  const getAudioBars = () => {
    const bars = ['▂', '▃', '▅', '▇'];
    const activeCount = Math.floor((audioLevel / 100) * bars.length);
    return bars.map((bar, i) => (
      <span key={i} className={i < activeCount ? 'text-blue-500' : 'text-gray-300'}>
        {bar}
      </span>
    ));
  };
  
  // Violation icon mapping
  const getViolationIcon = (type) => {
    const icons = {
      'TAB_SWITCHED': '🔄',
      'AUDIO_DETECTED': '🔊'
    };
    return icons[type] || '⚠️';
  };
  
  // Format time ago
  const timeAgo = (timestamp) => {
    if (!timestamp) return 'just now';
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'just now';
    if (minutes === 1) return '1 min ago';
    return `${minutes} min ago`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      {/* Top Row: Main Status Indicators */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-4">
          {/* Audio Level */}
          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-700 mr-2">🎤 Audio:</span>
            <span className="font-mono text-sm">{getAudioBars()}</span>
            <span className="text-xs text-gray-500 ml-1">
              {audioLevel > 0 ? 'Active' : 'Silent'}
            </span>
          </div>
        </div>

        {isTerminated && (
          <span className="text-sm font-bold text-red-600 animate-pulse">
            ⛔ TERMINATED
          </span>
        )}
      </div>

      {/* Bottom Row: Warnings & Connection */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Warning Counter */}
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${
              isTerminated ? 'bg-red-500' :
              warningCount >= maxWarnings - 1 ? 'bg-red-500 animate-pulse' :
              warningCount > 0 ? 'bg-yellow-500' : 'bg-green-500'
            }`} />
            <span className="text-sm font-medium text-gray-700">
              ⚠️ Warnings: {warningCount}/{maxWarnings}
            </span>
          </div>

          {/* Connection Status */}
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${
              isTerminated ? 'bg-gray-400' :
              connectionStatus === 'stable' ? 'bg-green-500' :
              connectionStatus === 'unstable' ? 'bg-yellow-500 animate-pulse' :
              'bg-red-500 animate-pulse'
            }`} />
            <span className="text-sm font-medium text-gray-700">
              🔌 Connection: {isTerminated ? 'Monitoring Terminated' : 
                (connectionStatus === 'disconnected' ? 'Lost - Reconnecting...' : 
                 connectionStatus === 'stable' ? 'Active' : connectionStatus)}
            </span>
          </div>

          {/* Proctoring Active with Platinum Badge */}
          <div className="flex items-center">
            <div className="relative flex items-center">
              <div className={`absolute -inset-1 blur-sm opacity-30 rounded-full transition-all ${isTerminated ? 'bg-transparent' : 'bg-blue-400 animate-pulse'}`}></div>
              <svg className={`relative w-4 h-4 mr-2 ${isTerminated ? 'text-gray-400' : 'text-blue-500'}`} fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
              </svg>
            </div>
            <span className={`text-sm font-medium ${isTerminated ? 'text-gray-500' : 'text-gray-700'}`}>
              {isTerminated ? 'Monitoring Stopped' : 'Proctoring Active'}
            </span>
            {!isTerminated && (
               <span className="ml-2 px-1.5 py-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-[8px] font-black text-white rounded shadow-sm tracking-tighter uppercase whitespace-nowrap">
                 Platinum Standalone
               </span>
            )}
          </div>

          {/* Camera Status */}
          <div className="flex items-center ml-4">
            <div className={`w-3 h-3 rounded-full mr-2 ${
              isTerminated ? 'bg-gray-400' :
              isCameraActive ? 'bg-green-500' : 'bg-red-500 animate-pulse'
            }`} />
            <span className="text-sm font-medium text-gray-700" title={cameraError || "Camera Active"}>
              📷 {isCameraActive ? 'Camera Active' : 'Camera Disabled'}
            </span>
          </div>

          {/* Face Detection Status */}
          <div className="flex items-center ml-4">
            <div className={`w-3 h-3 rounded-full mr-2 ${
              isTerminated ? 'bg-gray-400' :
              faceDetectionStatus === 'active' ? (faceCount === 1 ? 'bg-green-500' : 'bg-yellow-500') :
              faceModelLoading ? 'bg-blue-400 animate-pulse' :
              'bg-gray-400'
            }`} />
            <span className="text-sm font-medium text-gray-700">
              👤 Face ML: {
                isTerminated ? 'Stopped' :
                faceModelLoading ? 'Loading...' :
                faceDetectionStatus === 'active' ? `${faceCount} detected` :
                faceModelLoaded ? 'Ready' : 'Off'
              }
            </span>
          </div>
        </div>


        
        {/* ✅ PHASE 4: Metrics */}
        <div className="flex items-center space-x-3">
          {performanceMetrics.fps !== undefined && (
            <div className="flex items-center space-x-2 text-[10px] font-mono text-gray-400 bg-gray-50 px-2 py-1 rounded">
              <span title="Server Latency">LAT: {performanceMetrics.latencyMs}ms</span>
            </div>
          )}
        </div>
      </div>

      {/* Recent Violations Feed */}
      {recentViolations.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="text-xs font-semibold text-gray-600 mb-2">Recent Violations:</div>
          <div className="space-y-1">
            {recentViolations.map((violation, i) => (
              <div key={i} className="flex items-center text-xs text-gray-600">
                <span className="mr-2">{getViolationIcon(violation.type)}</span>
                <span className="flex-1">{violation.message || violation.type}</span>
                <span className="text-gray-400 ml-2">{timeAgo(violation.timestamp)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProctoringStatus;

