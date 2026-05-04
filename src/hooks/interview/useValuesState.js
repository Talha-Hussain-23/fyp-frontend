import { useEffect, useState } from 'react';
import useAutoSave from './useAutoSave';

/**
 * useValuesState Hook
 * Manages the user's input (Text/Code/MCQ) and handles local storage drafts + Server Auto-Save.
 * Encapsulates lines 194-212 (restore), 464-488 (save), and 174-184 (initial answers).
 */
export const useValuesState = (interviewId, interview, currentQuestionIndex) => {
    const [response, setResponse] = useState('');
    const [mcqAnswer, setMcqAnswer] = useState(null);
    const [answers, setAnswers] = useState({}); // {questionId: answer}

    // Identify current question ID clearly
    const currentQ = interview?.questions?.[currentQuestionIndex];
    const questionId = currentQ?.id !== undefined ? currentQ.id : currentQuestionIndex;

    // ----------------------------------------------------------------------
    // Initialize Answers from Server Data
    // ----------------------------------------------------------------------
    useEffect(() => {
        if (interview?.questions && interview.questions.length > 0) {
            const initialAnswers = {};
            interview.questions.forEach((q, idx) => {
                if (q.answered && interview.responses && interview.responses[idx]) {
                    const resp = interview.responses[idx];
                    initialAnswers[q.id || idx] = typeof resp === 'object' ? resp.answer : resp;
                }
            });
            setAnswers(initialAnswers);
        }
    }, [interview]);

    // ----------------------------------------------------------------------
    // Restore Draft from LocalStorage
    // ----------------------------------------------------------------------
    // ----------------------------------------------------------------------
    // Sync State with Current Question (Load Answer / Draft / Template)
    // ----------------------------------------------------------------------
    useEffect(() => {
        if (!interviewId || questionId === undefined) return;

        // 1. Check if we have a saved/submitted answer in memory
        if (answers[questionId] !== undefined) {
             const val = answers[questionId];
             // Determine if it's MCQ (number) or Text (string)
             // This assumes strictly typed answers.
             if (typeof val === 'number') {
                 setMcqAnswer(val);
                 setResponse('');
             } else {
                 setResponse(val || '');
                 setMcqAnswer(null);
             }
             return;
        }

        // 2. Try to Restore Draft from LocalStorage
        const draftKey = `interview_draft_${interviewId}_${questionId}`;
        const savedDraft = localStorage.getItem(draftKey);
        let draftLoaded = false;

        if (savedDraft) {
            try {
                const draft = JSON.parse(savedDraft);
                // Only restore if less than 24 hours old
                if (Date.now() - draft.timestamp < 24 * 60 * 60 * 1000) {
                    if (draft.type === 'mcq') {
                        setMcqAnswer(draft.value);
                        setResponse('');
                    } else {
                        setResponse(draft.value);
                        setMcqAnswer(null);
                    }
                    draftLoaded = true;
                }
            } catch (e) {
                console.error("Failed to restore draft", e);
            }
        }

        // 3. If no Answer and no Draft -> Reset Key State (Empty / Template)
        if (!draftLoaded) {
            setMcqAnswer(null);
            
            // Check for Code Template
            // Handle flat or nested structure
            const template = currentQ?.code_template || currentQ?.question?.code_template || '';
            setResponse(template);
        }

    }, [questionId, answers, interviewId, currentQ]); // Re-run when switching question 
    // ^ Note: Dependency on `answers` ensures we don't overwrite a loaded answer with a draft if logic changes,
    // though typically draft is for "unsubmitted" work.

    // ----------------------------------------------------------------------
    // Auto-Save Draft to LocalStorage
    // ----------------------------------------------------------------------
    useEffect(() => {
        if (!interviewId || !currentQ) return;

        const draftKey = `interview_draft_${interviewId}_${questionId}`;

        // Debounce save (0.5s)
        const timeoutId = setTimeout(() => {
            const payload = {
                timestamp: Date.now(),
                type: mcqAnswer !== null ? 'mcq' : 'response',
                value: mcqAnswer !== null ? mcqAnswer : response
            };
            // Only save if content exists
            if ((typeof payload.value === 'string' && payload.value.length > 0) || payload.value !== null) {
                localStorage.setItem(draftKey, JSON.stringify(payload));
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [response, mcqAnswer, interviewId, questionId, currentQ]);
    
    // ----------------------------------------------------------------------
    // Server Auto-Save Integration
    // ----------------------------------------------------------------------
    const activeAnswer = mcqAnswer !== null ? String(mcqAnswer) : response;
    // eslint-disable-next-line no-unused-vars
    const { saveStatus, lastSaved } = useAutoSave(interviewId, questionId, activeAnswer);
    // Note: useAutoSave automatically triggers on 'activeAnswer' change (debounced internally)

    // ----------------------------------------------------------------------
    // Clear Draft Helper
    // ----------------------------------------------------------------------
    const clearDraft = () => {
        if (interviewId && questionId !== undefined) {
             localStorage.removeItem(`interview_draft_${interviewId}_${questionId}`);
        }
    };

    return {
        response,
        setResponse,
        mcqAnswer,
        setMcqAnswer,
        answers,
        setAnswers,
        clearDraft
    };
};
