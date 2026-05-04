/**
 * Interview State Machine Hook
 * Manages 11-state interview lifecycle with validated transitions
 */

import { useReducer, useCallback, useMemo } from 'react';

// 11 Interview States
const STATES = {
  INITIALIZING: 'INITIALIZING',
  LOADING_DATA: 'LOADING_DATA',
  INSTRUCTIONS: 'INSTRUCTIONS',
  CAMERA_CHECK: 'CAMERA_CHECK',
  READY: 'READY',
  IN_PROGRESS: 'IN_PROGRESS',
  PAUSED: 'PAUSED',
  SUBMITTING: 'SUBMITTING',
  COMPLETED: 'COMPLETED',
  TERMINATED: 'TERMINATED',
  ERROR: 'ERROR'
};

// Actions
const ACTIONS = {
  INIT: 'INIT',
  LOAD_DATA: 'LOAD_DATA',
  DATA_LOADED: 'DATA_LOADED',
  SHOW_INSTRUCTIONS: 'SHOW_INSTRUCTIONS',
  CHECK_CAMERA: 'CHECK_CAMERA',
  CAMERA_READY: 'CAMERA_READY',
  START: 'START',
  PAUSE: 'PAUSE',
  RESUME: 'RESUME',
  SUBMIT: 'SUBMIT',
  COMPLETE: 'COMPLETE',
  TERMINATE: 'TERMINATE',
  ERROR: 'ERROR'
};

// Valid state transitions
const VALID_TRANSITIONS = {
  [STATES.INITIALIZING]: [STATES.LOADING_DATA, STATES.ERROR],
  [STATES.LOADING_DATA]: [STATES.INSTRUCTIONS, STATES.ERROR],
  [STATES.INSTRUCTIONS]: [STATES.CAMERA_CHECK, STATES.ERROR],
  [STATES.CAMERA_CHECK]: [STATES.READY, STATES.ERROR],
  [STATES.READY]: [STATES.IN_PROGRESS, STATES.ERROR],
  [STATES.IN_PROGRESS]: [STATES.PAUSED, STATES.SUBMITTING, STATES.TERMINATED, STATES.ERROR],
  [STATES.PAUSED]: [STATES.IN_PROGRESS, STATES.TERMINATED, STATES.ERROR],
  [STATES.SUBMITTING]: [STATES.COMPLETED, STATES.ERROR],
  [STATES.COMPLETED]: [],
  [STATES.TERMINATED]: [],
  [STATES.ERROR]: [STATES.LOADING_DATA] // Can retry from error
};

// Initial state
const initialState = {
  current: STATES.INITIALIZING,
  previous: null,
  history: [],
  error: null,
  metadata: {}
};

// Reducer
function stateMachineReducer(state, action) {
  const { type, payload } = action;
  
  switch (type) {
    case ACTIONS.INIT:
      return {
        ...state,
        current: STATES.INITIALIZING,
        history: addToHistory(state.history, STATES.INITIALIZING)
      };
    
    case ACTIONS.LOAD_DATA:
      return transition(state, STATES.LOADING_DATA);
    
    case ACTIONS.DATA_LOADED:
      return transition(state, STATES.INSTRUCTIONS, payload);
    
    case ACTIONS.SHOW_INSTRUCTIONS:
      return transition(state, STATES.INSTRUCTIONS);
    
    case ACTIONS.CHECK_CAMERA:
      return transition(state, STATES.CAMERA_CHECK);
    
    case ACTIONS.CAMERA_READY:
      return transition(state, STATES.READY);
    
    case ACTIONS.START:
      return transition(state, STATES.IN_PROGRESS);
    
    case ACTIONS.PAUSE:
      return transition(state, STATES.PAUSED, payload);
    
    case ACTIONS.RESUME:
      return transition(state, STATES.IN_PROGRESS);
    
    case ACTIONS.SUBMIT:
      return transition(state, STATES.SUBMITTING);
    
    case ACTIONS.COMPLETE:
      return transition(state, STATES.COMPLETED, payload);
    
    case ACTIONS.TERMINATE:
      return transition(state, STATES.TERMINATED, payload);
    
    case ACTIONS.ERROR:
      return {
        ...state,
        current: STATES.ERROR,
        previous: state.current,
        error: payload?.error || 'Unknown error',
        history: addToHistory(state.history, STATES.ERROR),
        metadata: { ...state.metadata, errorDetails: payload }
      };
    
    default:
      console.warn(`Unknown action: ${type}`);
      return state;
  }
}

// Helper: Validate and perform state transition
function transition(state, newState, metadata = {}) {
  const validTransitions = VALID_TRANSITIONS[state.current] || [];
  
  if (!validTransitions.includes(newState)) {
    console.error(
      `Invalid state transition: ${state.current} → ${newState}. ` +
      `Valid transitions: ${validTransitions.join(', ')}`
    );
    return state; // Reject invalid transition
  }
  
  return {
    ...state,
    current: newState,
    previous: state.current,
    history: addToHistory(state.history, newState),
    metadata: { ...state.metadata, ...metadata },
    error: null // Clear error on successful transition
  };
}

// Helper: Add to history (keep last 10)
function addToHistory(history, state) {
  const newHistory = [...history, { state, timestamp: new Date().toISOString() }];
  return newHistory.slice(-10); // Keep last 10 transitions
}

/**
 * useInterviewStateMachine Hook
 * 
 * @returns {Object} State machine interface
 */
export function useInterviewStateMachine() {
  const [state, dispatch] = useReducer(stateMachineReducer, initialState);
  
  // Actions
  const actions = useMemo(() => ({
    init: () => dispatch({ type: ACTIONS.INIT }),
    loadData: () => dispatch({ type: ACTIONS.LOAD_DATA }),
    dataLoaded: (data) => dispatch({ type: ACTIONS.DATA_LOADED, payload: data }),
    showInstructions: () => dispatch({ type: ACTIONS.SHOW_INSTRUCTIONS }),
    checkCamera: () => dispatch({ type: ACTIONS.CHECK_CAMERA }),
    cameraReady: () => dispatch({ type: ACTIONS.CAMERA_READY }),
    start: () => dispatch({ type: ACTIONS.START }),
    pause: (reason) => dispatch({ type: ACTIONS.PAUSE, payload: { reason } }),
    resume: () => dispatch({ type: ACTIONS.RESUME }),
    submit: () => dispatch({ type: ACTIONS.SUBMIT }),
    complete: (results) => dispatch({ type: ACTIONS.COMPLETE, payload: results }),
    terminate: (reason) => dispatch({ type: ACTIONS.TERMINATE, payload: { reason } }),
    error: (error) => dispatch({ type: ACTIONS.ERROR, payload: { error } })
  }), []);
  
  // Computed properties
  const computed = useMemo(() => ({
    isInitializing: state.current === STATES.INITIALIZING,
    isLoadingData: state.current === STATES.LOADING_DATA,
    isShowingInstructions: state.current === STATES.INSTRUCTIONS,
    isCheckingCamera: state.current === STATES.CAMERA_CHECK,
    isReady: state.current === STATES.READY,
    isInProgress: state.current === STATES.IN_PROGRESS,
    isPaused: state.current === STATES.PAUSED,
    isSubmitting: state.current === STATES.SUBMITTING,
    isCompleted: state.current === STATES.COMPLETED,
    isTerminated: state.current === STATES.TERMINATED,
    isError: state.current === STATES.ERROR,
    
    // Can perform actions?
    canStart: state.current === STATES.READY,
    canPause: state.current === STATES.IN_PROGRESS,
    canResume: state.current === STATES.PAUSED,
    canSubmit: state.current === STATES.IN_PROGRESS,
    
    // Is interview active?
    isActive: [STATES.IN_PROGRESS, STATES.PAUSED].includes(state.current),
    
    // Is interview finished?
    isFinished: [STATES.COMPLETED, STATES.TERMINATED].includes(state.current)
  }), [state.current]);
  
  return {
    state: state.current,
    previous: state.previous,
    history: state.history,
    error: state.error,
    metadata: state.metadata,
    actions,
    computed,
    STATES,
    ACTIONS
  };
}

export default useInterviewStateMachine;
