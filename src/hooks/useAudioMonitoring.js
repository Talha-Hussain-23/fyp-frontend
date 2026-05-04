/**
 * Audio Monitoring Hook
 * Detects voice activity and background audio using Web Audio API
 * 
 * @param {boolean} enabled - Whether audio monitoring is active
 * @returns {Object} - { audioLevel, voiceDetected, isListening }
 */
import { useCallback, useEffect, useRef, useState } from 'react';

export const useAudioMonitoring = (enabled = false, socket = null, interviewId = null) => {
  const [audioLevel, setAudioLevel] = useState(0);
  const [voiceDetected, setVoiceDetected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);
  
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const animationFrameRef = useRef(null);
  const dataArrayRef = useRef(null);
  const lastAudioEmitRef = useRef(0);

  // Voice detection thresholds
  const VOICE_THRESHOLD = 50; // Increased to 50 (was 30) for better noise rejection

  const analyzeAudio = useCallback(() => {
    if (!analyserRef.current || !dataArrayRef.current) return;

    const analyser = analyserRef.current;
    const dataArray = dataArrayRef.current;

    // Get time domain data for RMS (intensity)
    analyser.getByteTimeDomainData(dataArray);

    // Calculate RMS (Root Mean Square) for intensity
    let sumSquares = 0;
    for (let i = 0; i < dataArray.length; i++) {
        const normalized = (dataArray[i] - 128) / 128;
        sumSquares += normalized * normalized;
    }
    const rms = Math.sqrt(sumSquares / dataArray.length);
    const intensity = Math.min(100, rms * 500); // Scale to 0-100
    setAudioLevel(intensity);

    // Detect sound intensity above threshold
    const hasSound = intensity > VOICE_THRESHOLD;
    setVoiceDetected(hasSound);

    if (socket && socket.connected && hasSound) {
       const now = Date.now();
       // Cooldown to avoid spamming backend
       if (now - lastAudioEmitRef.current > 2000) {
           socket.emit('audio_activity', {
             interview_id: interviewId,
             level: intensity,
             speaking: hasSound,
             timestamp: now
           });
           lastAudioEmitRef.current = now;
       }
    }

    // Continue monitoring
    animationFrameRef.current = requestAnimationFrame(analyzeAudio);
  }, [socket, interviewId]);

  const startMonitoring = useCallback(async () => {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false
        } 
      });
      streamRef.current = stream;

      // Create audio context
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;

      // Create analyser node
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048; // Higher resolution for better frequency analysis
      analyser.smoothingTimeConstant = 0.8; // Smooth out rapid changes
      analyserRef.current = analyser;

      // Create data array for frequency data
      const bufferLength = analyser.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);

      // Connect microphone to analyser
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      setIsListening(true);
      setError(null);

      // Start analyzing
      analyzeAudio();

      console.log('🎤 Audio monitoring started');
    } catch (err) {
      console.error('Audio monitoring failed:', err);
      setError(err.message);
      setIsListening(false);
    }
  }, [analyzeAudio]);

  const stopMonitoring = useCallback(() => {
    // Cancel animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // Stop all audio tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Reset state
    analyserRef.current = null;
    dataArrayRef.current = null;
    setAudioLevel(0);
    setVoiceDetected(false);
    setIsListening(false);

    console.log('🎤 Audio monitoring stopped');
  }, []);

  // Start/stop monitoring based on enabled prop
  useEffect(() => {
    if (enabled) {
      console.log('🎤 useAudioMonitoring: enabled = true, socket present =', !!socket);
      startMonitoring();
    } else {
      stopMonitoring();
    }

    // Cleanup on unmount
    return () => {
      stopMonitoring();
    };
  }, [enabled, socket, startMonitoring, stopMonitoring]);

  return { 
    audioLevel,        // 0-100 (current audio level)
    voiceDetected,     // boolean (voice activity detected)
    isListening,       // boolean (monitoring active)
    error              // string or null (error message)
  };
};

export default useAudioMonitoring;
