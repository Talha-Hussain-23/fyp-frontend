/**
 * Auto-Save Hook
 * Automatically saves answers every 30s with localStorage backup
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import axios from '../../axios';

const AUTO_SAVE_INTERVAL = 30000; // 30 seconds
const MIN_ANSWER_LENGTH = 1; // Minimum chars to save (changed to 1 for MCQ/Short answers)
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds
const LOCALSTORAGE_RETENTION = 3600000; // 1 hour

/**
 * useAutoSave Hook
 * 
 * @param {string} interviewId - Interview ID
 * @param {number} questionIndex - Current question index
 * @param {string} answer - Current answer text
 * @returns {Object} Auto-save state and functions
 */
export function useAutoSave(interviewId, questionIndex, answer) {
  const [saveStatus, setSaveStatus] = useState('idle'); // idle, saving, saved, error
  const [lastSaved, setLastSaved] = useState(null);
  const [saveError, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  
  const saveTimerRef = useRef(null);
  const lastAnswerRef = useRef('');
  const isSavingRef = useRef(false);
  
  // Get localStorage key
  const getStorageKey = useCallback(() => {
    return `interview_${interviewId}_q${questionIndex}`;
  }, [interviewId, questionIndex]);
  
  // Save to localStorage
  const saveToLocalStorage = useCallback((answerText) => {
    try {
      const data = {
        answer: answerText,
        savedAt: new Date().toISOString(),
        synced: false
      };
      localStorage.setItem(getStorageKey(), JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }, [getStorageKey]);
  
  // Save to server
  const saveToServer = useCallback(async (answerText, retries = 0) => {
    if (isSavingRef.current) {
      console.log('Save already in progress, skipping...');
      return;
    }
    
    isSavingRef.current = true;
    setSaveStatus('saving');
    
    try {
      const response = await axios.post(
        `/interviews/${interviewId}/auto-save`,
        {
          question_index: questionIndex,
          answer: answerText,
          timestamp: new Date().toISOString()
        },
        {
          timeout: 5000 // 5 second timeout
        }
      );
      
      if (response.data.success) {
        setSaveStatus('saved');
        setLastSaved(new Date().toISOString());
        setRetryCount(0);
        setError(null);
        
        // Mark as synced in localStorage
        const data = {
          answer: answerText,
          savedAt: new Date().toISOString(),
          synced: true
        };
        localStorage.setItem(getStorageKey(), JSON.stringify(data));
        
        console.log(`Auto-saved answer for question ${questionIndex}`);
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
      
      // Retry logic
      if (retries < MAX_RETRIES) {
        console.log(`Retrying auto-save (${retries + 1}/${MAX_RETRIES})...`);
        setRetryCount(retries + 1);
        
        setTimeout(() => {
          saveToServer(answerText, retries + 1);
        }, RETRY_DELAY);
      } else {
        setSaveStatus('error');
        setError(error.message || 'Failed to save');
        
        // Save to localStorage as fallback
        saveToLocalStorage(answerText);
      }
    } finally {
      isSavingRef.current = false;
    }
  }, [interviewId, questionIndex, getStorageKey, saveToLocalStorage]);
  
  // Manual save function
  const saveAnswer = useCallback((answerText) => {
    if (!answerText || answerText.length < MIN_ANSWER_LENGTH) {
      console.log('Answer too short, skipping save');
      return;
    }
    
    if (answerText === lastAnswerRef.current) {
      console.log('Answer unchanged, skipping save');
      return;
    }
    
    lastAnswerRef.current = answerText;
    saveToServer(answerText);
  }, [saveToServer]);
  
  // Restore answer from localStorage
  const restoreAnswer = useCallback(() => {
    try {
      const stored = localStorage.getItem(getStorageKey());
      if (!stored) return null;
      
      const data = JSON.parse(stored);
      const savedAt = new Date(data.savedAt);
      const age = Date.now() - savedAt.getTime();
      
      // Only restore if < 1 hour old
      if (age > LOCALSTORAGE_RETENTION) {
        localStorage.removeItem(getStorageKey());
        return null;
      }
      
      console.log(`Restored answer from localStorage (${data.synced ? 'synced' : 'not synced'})`);
      return data;
    } catch (error) {
      console.error('Failed to restore from localStorage:', error);
      return null;
    }
  }, [getStorageKey]);
  
  // Conflict resolution: server vs local
  const resolveConflict = useCallback(async (localData, serverData) => {
    const localTime = new Date(localData.savedAt);
    const serverTime = new Date(serverData.saved_at);
    
    if (serverTime > localTime) {
      console.log('Server data is newer, using server version');
      return serverData.answer;
    } else {
      console.log('Local data is newer, syncing to server');
      await saveToServer(localData.answer);
      return localData.answer;
    }
  }, [saveToServer]);
  
  // Auto-save effect
  useEffect(() => {
    if (!answer || answer.length < MIN_ANSWER_LENGTH) {
      return;
    }
    
    // Clear existing timer
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    
    // Set new timer
    saveTimerRef.current = setTimeout(() => {
      saveAnswer(answer);
    }, AUTO_SAVE_INTERVAL);
    
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [answer, saveAnswer]);
  
  // Cleanup localStorage on unmount
  useEffect(() => {
    return () => {
      // Clean up old localStorage entries
      try {
        const keys = Object.keys(localStorage);
        const now = Date.now();
        
        keys.forEach(key => {
          if (key.startsWith('interview_')) {
            const data = JSON.parse(localStorage.getItem(key));
            const age = now - new Date(data.savedAt).getTime();
            
            if (age > LOCALSTORAGE_RETENTION) {
              localStorage.removeItem(key);
            }
          }
        });
      } catch (error) {
        console.error('Failed to cleanup localStorage:', error);
      }
    };
  }, []);
  
  return {
    saveStatus,
    lastSaved,
    saveError,
    retryCount,
    saveAnswer,
    restoreAnswer,
    resolveConflict,
    // Utilities
    isSaving: saveStatus === 'saving',
    isSaved: saveStatus === 'saved',
    hasError: saveStatus === 'error'
  };
}

export default useAutoSave;
