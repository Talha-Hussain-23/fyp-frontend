import { useCallback, useMemo, useReducer } from "react";

// Finite State Machine Definitions
const INTERVIEW_STATES = {
  IDLE: "IDLE", // Initial state
  LOADING: "LOADING", // Fetching data
  READY: "READY", // Data loaded, waiting for user (e.g. Instructions)
  IN_PROGRESS: "IN_PROGRESS", // Question active, timer running
  SUBMITTING: "SUBMITTING", // API call in progress
  ERROR: "ERROR", // Something went wrong
  COMPLETED: "COMPLETED", // Interview finished
  TERMINATED: "TERMINATED", // Forced termination (Proctoring/Manual)
};

// Actions
export const ACTIONS = {
  FETCH_START: "FETCH_START",
  FETCH_SUCCESS: "FETCH_SUCCESS",
  FETCH_ERROR: "FETCH_ERROR",
  START_INTERVIEW: "START_INTERVIEW",
  NEXT_QUESTION: "NEXT_QUESTION",
  PREV_QUESTION: "PREV_QUESTION",
  SUBMIT_START: "SUBMIT_START",
  SUBMIT_SUCCESS: "SUBMIT_SUCCESS",
  SUBMIT_FAILURE: "SUBMIT_FAILURE",
  TERMINATE: "TERMINATE",
  COMPLETE: "COMPLETE",
};

const initialState = {
  status: INTERVIEW_STATES.IDLE,
  error: null,
  currentQuestionIndex: 0,
  isSubmitting: false,
};

function interviewReducer(state, action) {
  switch (action.type) {
    case ACTIONS.FETCH_START:
      if (state.status === INTERVIEW_STATES.LOADING) return state;
      // Don't regress to LOADING if interview is already active
      if (state.status === INTERVIEW_STATES.IN_PROGRESS || state.status === INTERVIEW_STATES.SUBMITTING || state.status === INTERVIEW_STATES.COMPLETED || state.status === INTERVIEW_STATES.TERMINATED) return state;
      return { ...state, status: INTERVIEW_STATES.LOADING, error: null };

    case ACTIONS.FETCH_SUCCESS:
      const newStatus =
        state.status === INTERVIEW_STATES.IDLE
          ? INTERVIEW_STATES.READY
          : state.status;
      if (state.status === newStatus && state.error === null) return state;
      return {
        ...state,
        status: newStatus,
        error: null,
      };

    case ACTIONS.FETCH_ERROR:
      if (
        state.status === INTERVIEW_STATES.ERROR &&
        state.error === action.payload
      )
        return state;
      // Don't regress to ERROR if interview is already active
      if (state.status === INTERVIEW_STATES.IN_PROGRESS || state.status === INTERVIEW_STATES.SUBMITTING || state.status === INTERVIEW_STATES.COMPLETED || state.status === INTERVIEW_STATES.TERMINATED) return state;
      return {
        ...state,
        status: INTERVIEW_STATES.ERROR,
        error: action.payload,
      };

    case ACTIONS.START_INTERVIEW:
      // Allow transition from ERROR/LOADING too — user explicitly clicked "Proceed",
      // so transient fetch/WebSocket errors should not block interview activation.
      if (
        state.status === INTERVIEW_STATES.READY ||
        state.status === INTERVIEW_STATES.IDLE ||
        state.status === INTERVIEW_STATES.ERROR ||
        state.status === INTERVIEW_STATES.LOADING
      ) {
        return { ...state, status: INTERVIEW_STATES.IN_PROGRESS, error: null };
      }
      return state;

    case ACTIONS.SUBMIT_START:
      if (state.status === INTERVIEW_STATES.IN_PROGRESS) {
        return {
          ...state,
          status: INTERVIEW_STATES.SUBMITTING,
          isSubmitting: true,
        };
      }
      return state;

    case ACTIONS.SUBMIT_SUCCESS:
      const nextIdx = action.payload?.nextIndex ?? state.currentQuestionIndex;
      if (
        state.status === INTERVIEW_STATES.IN_PROGRESS &&
        state.isSubmitting === false &&
        state.currentQuestionIndex === nextIdx
      )
        return state;
      return {
        ...state,
        status: INTERVIEW_STATES.IN_PROGRESS,
        isSubmitting: false,
        currentQuestionIndex: nextIdx,
      };

    case ACTIONS.SUBMIT_FAILURE:
      if (
        state.status === INTERVIEW_STATES.IN_PROGRESS &&
        state.isSubmitting === false &&
        state.error === action.payload
      )
        return state;
      return {
        ...state,
        status: INTERVIEW_STATES.IN_PROGRESS,
        isSubmitting: false,
        error: action.payload,
      };

    case ACTIONS.TERMINATE:
      if (
        state.status === INTERVIEW_STATES.TERMINATED &&
        state.error === action.payload
      )
        return state;
      return {
        ...state,
        status: INTERVIEW_STATES.TERMINATED,
        error: action.payload,
      };

    case ACTIONS.COMPLETE:
      if (state.status === INTERVIEW_STATES.COMPLETED) return state;
      return { ...state, status: INTERVIEW_STATES.COMPLETED };

    default:
      return state;
  }
}

export const useInterviewState = () => {
  const [state, dispatch] = useReducer(interviewReducer, initialState);

  // Helper Actions
  const startFetch = useCallback(
    () => dispatch({ type: ACTIONS.FETCH_START }),
    [],
  );
  const fetchSuccess = useCallback(
    () => dispatch({ type: ACTIONS.FETCH_SUCCESS }),
    [],
  );
  const fetchError = useCallback(
    (msg) => dispatch({ type: ACTIONS.FETCH_ERROR, payload: msg }),
    [],
  );

  const startInterview = useCallback(
    () => dispatch({ type: ACTIONS.START_INTERVIEW }),
    [],
  );

  const startSubmit = useCallback(
    () => dispatch({ type: ACTIONS.SUBMIT_START }),
    [],
  );

  const submitSuccess = useCallback(
    (nextIndex) =>
      dispatch({
        type: ACTIONS.SUBMIT_SUCCESS,
        payload: { nextIndex },
      }),
    [],
  );

  const submitFailure = useCallback(
    (msg) => dispatch({ type: ACTIONS.SUBMIT_FAILURE, payload: msg }),
    [],
  );

  const terminate = useCallback(
    (reason) => dispatch({ type: ACTIONS.TERMINATE, payload: reason }),
    [],
  );
  const complete = useCallback(() => dispatch({ type: ACTIONS.COMPLETE }), []);

  return useMemo(
    () => ({
      state,
      dispatch,
      actions: {
        startFetch,
        fetchSuccess,
        fetchError,
        startInterview,
        startSubmit,
        submitSuccess,
        submitFailure,
        terminate,
        complete,
      },
      // Computed flags for UI convenience
      isLoading: state.status === INTERVIEW_STATES.LOADING,
      isSubmitting: state.status === INTERVIEW_STATES.SUBMITTING,
      isError: state.status === INTERVIEW_STATES.ERROR,
      isTerminated: state.status === INTERVIEW_STATES.TERMINATED,
      isCompleted: state.status === INTERVIEW_STATES.COMPLETED,
    }),
    [
      state,
      dispatch,
      startFetch,
      fetchSuccess,
      fetchError,
      startInterview,
      startSubmit,
      submitSuccess,
      submitFailure,
      terminate,
      complete,
    ],
  );
};
