/**
 * Face Detection Hook (Browser-side ML)
 * Uses face-api.js SSD MobilenetV1 for person detection.
 * 
 * Detection Rules:
 * - 0 faces for 3+ consecutive seconds → NO_PERSON violation
 * - >1 faces for 3+ consecutive seconds → MULTIPLE_FACES violation
 * - 1 face → valid, resets all timers
 * 
 * Performance:
 * - Runs at randomized intervals (600–1200ms)
 * - Canvas resolution: 320×240
 * - Min confidence: 0.5
 * - All inference runs client-side, no backend ML
 */
import * as faceapi from 'face-api.js';
import { useCallback, useEffect, useRef, useState } from 'react';

// Time threshold in ms before firing violation
const VIOLATION_THRESHOLD_MS = 3000;
// Min confidence for face detection
const MIN_CONFIDENCE = 0.5;
// Frame capture resolution
const CAPTURE_WIDTH = 320;
const CAPTURE_HEIGHT = 240;

export const useFaceDetection = (enabled = false, videoRef = null, addViolation = null) => {
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [detectionStatus, setDetectionStatus] = useState('idle'); // 'idle' | 'loading' | 'active' | 'error'
  const [faceCount, setFaceCount] = useState(0);
  const [lastDetectionTime, setLastDetectionTime] = useState(null);

  // Refs for timer/state tracking
  const canvasRef = useRef(null);
  const timeoutRef = useRef(null);
  const noPersonStartRef = useRef(null);     // Timestamp when 0 faces first detected
  const multiFaceStartRef = useRef(null);    // Timestamp when >1 faces first detected
  const noPersonFiredRef = useRef(false);    // Prevent repeat violations within session
  const multiFaceFiredRef = useRef(false);   // Prevent repeat violations within session
  const isRunningRef = useRef(false);
  const enabledRef = useRef(enabled);

  // Keep enabledRef in sync
  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  // Load face-api.js model (once)
  const loadModel = useCallback(async () => {
    if (isModelLoaded || isModelLoading) return;

    try {
      setIsModelLoading(true);
      setDetectionStatus('loading');
      console.log('🧠 Loading face detection model...');

      await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');

      setIsModelLoaded(true);
      setDetectionStatus('idle');
      console.log('🧠 Face detection model loaded successfully');
    } catch (err) {
      console.error('🧠 Failed to load face detection model:', err);
      setDetectionStatus('error');
    } finally {
      setIsModelLoading(false);
    }
  }, [isModelLoaded, isModelLoading]);

  // Load model on mount
  useEffect(() => {
    loadModel();
  }, [loadModel]);

  // Create hidden canvas element
  useEffect(() => {
    if (!canvasRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = CAPTURE_WIDTH;
      canvas.height = CAPTURE_HEIGHT;
      canvasRef.current = canvas;
    }
  }, []);

  // Core detection loop
  const detectFaces = useCallback(async () => {
    if (!enabledRef.current || !isModelLoaded) return;

    const video = videoRef?.current;
    if (!video || video.readyState < 2) {
      // Video not ready, retry after delay
      scheduleNextDetection();
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      // Draw current video frame to canvas
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, CAPTURE_WIDTH, CAPTURE_HEIGHT);

      // Run face detection
      const detections = await faceapi.detectAllFaces(
        canvas,
        new faceapi.SsdMobilenetv1Options({ minConfidence: MIN_CONFIDENCE })
      );

      const count = detections.length;
      setFaceCount(count);
      setLastDetectionTime(Date.now());
      setDetectionStatus('active');

      const now = Date.now();

      if (count === 0) {
        // No person detected
        if (!noPersonStartRef.current) {
          noPersonStartRef.current = now;
          console.log('🔍 No person detected, starting 3s timer...');
        }

        const elapsed = now - noPersonStartRef.current;
        if (elapsed >= VIOLATION_THRESHOLD_MS && !noPersonFiredRef.current) {
          console.warn('🚨 NO_PERSON violation: Candidate absent for 3+ seconds');
          noPersonFiredRef.current = true;
          if (addViolation) {
            addViolation('NO_PERSON', 'You are not visible in the camera. Please ensure your face is clearly visible.');
          }
        }

        // Reset multi-face timer
        multiFaceStartRef.current = null;
        multiFaceFiredRef.current = false;

      } else if (count === 1) {
        // Valid: exactly 1 person
        // Reset all violation timers
        noPersonStartRef.current = null;
        noPersonFiredRef.current = false;
        multiFaceStartRef.current = null;
        multiFaceFiredRef.current = false;

      } else {
        // Multiple faces detected (count > 1)
        if (!multiFaceStartRef.current) {
          multiFaceStartRef.current = now;
          console.log(`🔍 ${count} faces detected, starting 3s timer...`);
        }

        const elapsed = now - multiFaceStartRef.current;
        if (elapsed >= VIOLATION_THRESHOLD_MS && !multiFaceFiredRef.current) {
          console.warn(`🚨 MULTIPLE_FACES violation: ${count} faces for 3+ seconds`);
          multiFaceFiredRef.current = true;
          if (addViolation) {
            addViolation('MULTIPLE_FACES', `Multiple persons detected (${count}). Only you should be visible during the interview.`);
          }
        }

        // Reset no-person timer
        noPersonStartRef.current = null;
        noPersonFiredRef.current = false;
      }

    } catch (err) {
      console.error('🧠 Face detection error:', err);
    }

    // Schedule next detection with randomized interval
    scheduleNextDetection();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModelLoaded, videoRef, addViolation]);

  // Randomized interval scheduling (600–1200ms)
  const scheduleNextDetection = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (!enabledRef.current) return;

    const delay = 600 + Math.random() * 600; // 600-1200ms
    timeoutRef.current = setTimeout(() => {
      if (enabledRef.current && isRunningRef.current) {
        detectFaces();
      }
    }, delay);
  }, [detectFaces]);

  // Start/stop detection based on enabled prop
  useEffect(() => {
    if (enabled && isModelLoaded) {
      isRunningRef.current = true;
      console.log('🧠 Face detection started');
      detectFaces();
    } else {
      isRunningRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setDetectionStatus(isModelLoaded ? 'idle' : detectionStatus);
    }

    return () => {
      isRunningRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, isModelLoaded]);

  // Reset violation trackers when detection is re-enabled (new question, etc.)
  useEffect(() => {
    if (enabled) {
      // Don't reset fired flags — violations should persist through the session
      // Only reset the start timers so the 3-second countdown restarts
      noPersonStartRef.current = null;
      multiFaceStartRef.current = null;
    }
  }, [enabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      canvasRef.current = null;
    };
  }, []);

  return {
    isModelLoaded,      // boolean: model ready to use
    isModelLoading,     // boolean: model currently loading
    detectionStatus,    // 'idle' | 'loading' | 'active' | 'error'
    faceCount,          // number: faces detected in last frame
    lastDetectionTime   // timestamp of last detection
  };
};

export default useFaceDetection;
