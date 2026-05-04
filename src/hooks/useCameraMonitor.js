/**
 * Camera Monitor Hook
 * Manages webcam stream lifecycle and health monitoring.
 * Provides the video stream ref for face detection to consume.
 * 
 * IMPORTANT: Camera permission MUST be granted before interview can start.
 * The hook exposes `isCameraReady` which gates the "Proceed" button.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

export const useCameraMonitor = (enabled = false) => {
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [permissionState, setPermissionState] = useState('prompt'); // 'prompt' | 'granted' | 'denied'

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const healthCheckRef = useRef(null);

  // Request camera permission and start stream
  const requestCamera = useCallback(async () => {
    try {
      setCameraError(null);
      console.log('📷 Requesting camera access...');

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 320 },
          height: { ideal: 240 },
          facingMode: 'user',
          frameRate: { ideal: 15, max: 20 }
        }
      });

      streamRef.current = stream;
      setPermissionState('granted');
      setIsCameraReady(true);
      setIsCameraActive(true);

      // Attach stream to video element if available
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Monitor track health
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.onended = () => {
          console.warn('📷 Camera track ended');
          setIsCameraActive(false);
        };
        videoTrack.onmute = () => {
          console.warn('📷 Camera track muted');
          setIsCameraActive(false);
        };
        videoTrack.onunmute = () => {
          console.log('📷 Camera track unmuted');
          setIsCameraActive(true);
        };
      }

      console.log('📷 Camera access granted and stream active');
      return true;
    } catch (err) {
      console.error('📷 Camera access failed:', err);
      setPermissionState('denied');
      setIsCameraReady(false);
      setIsCameraActive(false);

      if (err.name === 'NotAllowedError') {
        setCameraError('Camera permission denied. Please allow camera access to proceed with the interview.');
      } else if (err.name === 'NotFoundError') {
        setCameraError('No camera found. Please connect a webcam to proceed.');
      } else if (err.name === 'NotReadableError') {
        setCameraError('Camera is in use by another application. Please close other apps using the camera.');
      } else {
        setCameraError(`Camera error: ${err.message}`);
      }
      return false;
    }
  }, []);

  // Stop camera stream
  const stopCamera = useCallback(() => {
    if (healthCheckRef.current) {
      clearInterval(healthCheckRef.current);
      healthCheckRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.onended = null;
        track.onmute = null;
        track.onunmute = null;
        track.stop();
      });
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsCameraActive(false);
    console.log('📷 Camera stopped');
  }, []);

  // Health check: poll track status every 2 seconds
  useEffect(() => {
    if (!enabled || !streamRef.current) return;

    healthCheckRef.current = setInterval(() => {
      const stream = streamRef.current;
      if (!stream) {
        setIsCameraActive(false);
        return;
      }

      const tracks = stream.getVideoTracks();
      if (tracks.length === 0) {
        setIsCameraActive(false);
        return;
      }

      const track = tracks[0];
      const isLive = track.readyState === 'live' && track.enabled && !track.muted;
      setIsCameraActive(isLive);

      if (!isLive) {
        console.warn(`📷 Camera health check: readyState=${track.readyState}, enabled=${track.enabled}, muted=${track.muted}`);
      }
    }, 2000);

    return () => {
      if (healthCheckRef.current) {
        clearInterval(healthCheckRef.current);
        healthCheckRef.current = null;
      }
    };
  }, [enabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Attach stream to videoRef when ref is set after mount
  useEffect(() => {
    if (videoRef.current && streamRef.current && !videoRef.current.srcObject) {
      videoRef.current.srcObject = streamRef.current;
    }
  });

  return {
    videoRef,           // Attach to <video> element
    stream: streamRef.current,
    isCameraReady,      // Gate for interview start
    isCameraActive,     // Live health status
    cameraError,        // Error message string
    permissionState,    // 'prompt' | 'granted' | 'denied'
    requestCamera,      // Call to request camera access
    stopCamera          // Call to release camera
  };
};

export default useCameraMonitor;
