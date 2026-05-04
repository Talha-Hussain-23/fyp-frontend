import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from '../../axios';
import logger from '../../utils/logger';

// New Architecture Hooks
import { useInterviewData } from '../../hooks/interview/useInterviewData';
import { useInterviewState } from '../../hooks/interview/useInterviewState';
import { useInterviewTimer } from '../../hooks/interview/useInterviewTimer';
import { useValuesState } from '../../hooks/interview/useValuesState';

// Existing Hooks
import { useAudioMonitoring } from '../../hooks/useAudioMonitoring'; // ✅ PHASE 4
import { useCameraMonitor } from '../../hooks/useCameraMonitor';
import { useFaceDetection } from '../../hooks/useFaceDetection';
import useInterviewProctoring from '../../hooks/useInterviewProctoring';

// UI Components
import ProctoringStatus from '../proctoring/ProctoringStatus';
import ProctoringWarning from '../proctoring/ProctoringWarning';
import { AnswerInput } from './AnswerInput';
import { CompletionModal } from './CompletionModal'; // ✅ New Import
import { ControlPanel } from './ControlPanel';
import { InterviewHeader } from './InterviewHeader';
import InterviewInstructions from './InterviewInstructions';
import { QuestionDisplay } from './QuestionDisplay'; // New
import { QuestionNavigator } from './QuestionNavigator';
import { TechnicalIssueModal } from './TechnicalIssueModal';
import { TerminatedView } from './TerminatedView'; // ✅ New Import
import { TimerDisplay } from './TimerDisplay';

// Sectioned Interview Helpers

function Interview() {
    const location = useLocation();
    const token = new URLSearchParams(location.search).get('token');

    // ----------------------------------------------------------------------
    // 1. Core State Machine & Data
    // ----------------------------------------------------------------------
    const { state: machineState, actions, isSubmitting } = useInterviewState();
    
    const {
        interview,
        setInterview,
        loading,
        error: dataError,
        setError: setDataError,
        interviewId,
        interviewClosed,
        setInterviewClosed,
        closeReason,
        endInterview: endInterviewData,
        fetchInterview,
        missingId,
        currentQuestionIndex: dataIndex,
    } = useInterviewData();

    // ----------------------------------------------------------------------
    // 2. UI State (declared early to avoid hoisting issues)
    // ----------------------------------------------------------------------
    const [showInstructions, setShowInstructions] = useState(true);
    const [showTechnicalIssueModal, setShowTechnicalIssueModal] = useState(false);
    const [completionModal, setCompletionModal] = useState({ visible: false, title: '', message: '', score: null });

    // Sync Machine State with Data Loading & Server State
    // Auto-start camera when connected removed as vision proctoring is disabled
    useEffect(() => {
        if (loading) {
            if (machineState.status !== 'LOADING') actions.startFetch();
        } else if (dataError) {
            if (machineState.status !== 'ERROR') actions.fetchError(dataError);
        } else if (interview) {
            // Only call fetchSuccess if we are in a state that transitions to READY/PROGRESS
            if (machineState.status === 'LOADING' || machineState.status === 'IDLE') {
                actions.fetchSuccess();
            }
            
            // Auto-Resume Logic based on Server State
            // Enhanced to include Question 1 (index 0)
            const wasStarted = interview.started_at && (interview.current_question_index >= 0 || interview.state === 'QUESTION_ACTIVE' || interview.state === 'started');
            
            if ((interview.state === 'QUESTION_ACTIVE' || interview.state === 'started') && 
                machineState.status !== 'IN_PROGRESS' && wasStarted) {
                if (showInstructions) {
                    logger.info(`🔄 Auto-resume: interviewId=${interviewId}, status=${interview.state}, index=${interview.current_question_index}`);
                    setShowInstructions(false);
                    actions.startInterview();
                }
            } else if (interview.state === 'COMPLETED' && machineState.status !== 'COMPLETED') {
                actions.complete();
                if (!interviewClosed) setInterviewClosed(true);
            }
        }
    }, [loading, dataError, interview, actions, machineState.status, interviewClosed, showInstructions, setInterviewClosed, setShowInstructions, interviewId]);

    // ----------------------------------------------------------------------
    // 3. Form Values
    // ----------------------------------------------------------------------
    const {
        response,
        setResponse,
        mcqAnswer,
        setMcqAnswer,
        answers,
        setAnswers,
        clearDraft
    } = useValuesState(interviewId, interview, dataIndex);

    // ----------------------------------------------------------------------
    // 4. Timer (Server Authoritative)
    // ----------------------------------------------------------------------
    const maxTime = interview?.question_duration || interview?.time_limit_question || 60;

    const handleTimeout = useCallback(async () => {
        logger.warn("Interview Timer Timeout Triggered");
        
        // To avoid complexity, we'll keep the auto-submit logic here for now but use machine state to lock UI
        actions.startSubmit();
        
        const currentQ = interview?.questions?.[dataIndex];
        const qId = currentQ?.id !== undefined ? currentQ.id : dataIndex;
        const qType = currentQ?.type || 'DESCRIPTIVE';
        
        const finalAnswer = qType === 'MCQ' ? mcqAnswer : response;
        
        try {
            // Advance locally manually
            clearDraft();
            await fetchInterview();
            setAnswers(prev => ({ ...prev, [qId]: finalAnswer }));
            actions.submitSuccess();
            
            if (dataIndex >= (interview?.questions?.length || 0) - 1) {
                await endInterviewData();
                setInterviewClosed(true);
            }
            
        } catch (err) {
            logger.error('Timeout auto-submit failed', err);
            actions.submitFailure('Auto-submission failed');
        }

    }, [interview, dataIndex, fetchInterview, setAnswers, actions, setInterviewClosed, mcqAnswer, response, clearDraft, endInterviewData]);

    const { secondsRemaining, isExpired } = useInterviewTimer(
        interview, 
        !interviewClosed && !loading && !missingId && machineState.status !== 'READY',
        handleTimeout
    );

    // UI State already declared above to avoid hoisting issues
    
    // ----------------------------------------------------------------------
    // 5. Submission Handler (User Initiated) — Optimistic UI
    // ----------------------------------------------------------------------
    const submitLockRef = useRef(false);
    
    const handleSubmit = async () => {
        // Debounce: prevent double-click within 1s
        if (submitLockRef.current || isSubmitting) return;
        submitLockRef.current = true;
        setTimeout(() => { submitLockRef.current = false; }, 1000);

        actions.startSubmit();
        const currentQ = interview?.questions?.[dataIndex];
        const qId = currentQ?.id !== undefined ? currentQ.id : dataIndex;
        const qType = currentQ?.type || interview?.question_type || 'Descriptive';
        
        let submissionData = { response: response };
        
        if (qType === 'MCQ') {
            const questionObj = currentQ.question || currentQ;
            if (questionObj.options) {
                submissionData.response = String(mcqAnswer);
                setAnswers(prev => ({ ...prev, [qId]: mcqAnswer }));
            }
        } else {
             setAnswers(prev => ({ ...prev, [qId]: response }));
        }

        clearDraft();

        // Check if this is the last question
        const isLastQuestion = dataIndex + 1 >= (interview?.questions?.length || 0);

        // OPTIMISTIC: Advance UI immediately
        if (!isLastQuestion) {
            const nextIndex = dataIndex + 1;
            setInterview(prev => ({ ...prev, current_question_index: nextIndex }));
            setMcqAnswer(null);
            setResponse('');
            actions.submitSuccess(nextIndex);
        }

        // ASYNC: Send to backend (non-blocking for mid-interview questions)
        try {
            // Fixing 422 Error: Match Backend `InterviewResponse` Schema
            const payload = {
                response: submissionData.response || "",
                timeout: false,
                duration_seconds: maxTime - secondsRemaining
            };
            const resp = await axios.post(`/interviews/${interviewId}/submit`, payload);
            
            if (resp.data.status === 'completed' || resp.data?.response?.status === 'completed') {
                // Instant completion (MCQ-only interview)
                setCompletionModal({
                    visible: true,
                    title: 'Interview Completed',
                    message: 'Thank you for completing the interview.',
                    score: resp.data.final_score
                });
                actions.complete();
                setInterviewClosed(true);
            } else if (resp.data.status === 'evaluating') {
                // Last question, AI evaluation running in background
                // Poll for completion
                const pollInterval = setInterval(async () => {
                    try {
                        const status = await axios.get(`/interviews/${interviewId}/evaluation-status`);
                        if (status.data.is_completed && !status.data.evaluation_pending) {
                            clearInterval(pollInterval);
                            setCompletionModal({
                                visible: true,
                                title: 'Interview Completed',
                                message: 'Thank you for completing the interview.',
                                score: status.data.final_score || status.data.avg_score
                            });
                            actions.complete();
                            setInterviewClosed(true);
                        }
                    } catch (pollErr) {
                        logger.warn('Evaluation polling error', pollErr);
                    }
                }, 2000); // Poll every 2 seconds
                
                // Safety timeout: stop polling after 60s
                setTimeout(() => {
                    clearInterval(pollInterval);
                    // Show completion even if polling timed out
                    setCompletionModal({
                        visible: true,
                        title: 'Interview Completed',
                        message: 'Your responses have been saved. Scores are being calculated.',
                        score: null
                    });
                    actions.complete();
                    setInterviewClosed(true);
                }, 60000);
            } else if (!isLastQuestion) {
                // Mid-interview: fetch fresh server state to realign timer
                fetchInterview();
            }
        } catch (err) {
            logger.error('Submission failed', err);
            if (isLastQuestion) {
                setDataError('Submission failed. Please try again.');
                actions.submitFailure('Submission failed');
            }
            // For mid-interview errors: UI already advanced, show subtle warning
            // The answer was likely saved; don't revert optimistic UI
        }
    };

    // ----------------------------------------------------------------------
    // 6. Navigation (History only, cannot skip forward)
    // ----------------------------------------------------------------------
    const handleNavigate = (idx, responsesLength) => {
         if (idx > responsesLength) {
            setDataError(`Please answer previous questions first.`);
            return;
        }
        // UI Navigation Update
        setInterview(prev => ({
            ...prev,
            current_question_index: idx
        }));
        
        // Load Answers (re-using logic)
        const q = interview.questions[idx];
        const qId = q.id !== undefined ? q.id : idx;
        if (answers[qId] !== undefined) {
             if (typeof answers[qId] === 'number') {
                 setMcqAnswer(answers[qId]);
                 setResponse('');
            } else {
                 setResponse(answers[qId]);
                 setMcqAnswer(null);
            }
        } else {
             setMcqAnswer(null);
             setResponse('');
        }
    };

    // ----------------------------------------------------------------------
    // 7. Proctoring Integration
    // ----------------------------------------------------------------------
    const handleProctoringTermination = useCallback(async (reason) => {
        actions.terminate(reason);
        endInterviewData(reason);
    }, [actions, endInterviewData]);

    const isStartingRef = useRef(false); // ✅ PHASE B: Re-entrancy guard


    const initialWarningCount = interview?.proctoring_warning_count || 0;
    const {
        warningCount,
        maxWarnings,
        isTerminated,
        showWarning,
        warningMessage,
        violationType, // ✅ PHASE 1: Extract violation type
        connectionStatus,
        dismissWarning,
        addViolation, 
        violations: proctoringViolations = []
    } = useInterviewProctoring(
        interviewId, 
        handleProctoringTermination, 
        initialWarningCount, 
        !showInstructions && (machineState.status === 'IN_PROGRESS' || machineState.status === 'READY'), 
        dataIndex // ✅ PASSING QUESTION INDEX
    );

    // ----------------------------------------------------------------------
    // 7b. Camera Monitor & Face Detection (Client-Side ML)
    // ----------------------------------------------------------------------
    const {
        videoRef: cameraVideoRef,
        isCameraActive,
        cameraError,
        requestCamera,
        stopCamera
    } = useCameraMonitor(
        !showInstructions && (machineState.status === 'IN_PROGRESS' || machineState.status === 'READY')
    );

    const isDetectionEnabled = !showInstructions 
        && (machineState.status === 'IN_PROGRESS' || machineState.status === 'READY') 
        && isCameraActive 
        && dataIndex >= 0;

    const {
        isModelLoaded: faceModelLoaded,
        isModelLoading: faceModelLoading,
        detectionStatus: faceDetectionStatus,
        faceCount
    } = useFaceDetection(isDetectionEnabled, cameraVideoRef, addViolation);

    // Start camera when interview begins (after instructions dismissed)
    useEffect(() => {
        if (!showInstructions && (machineState.status === 'IN_PROGRESS' || machineState.status === 'READY')) {
            requestCamera();
        }
        return () => {
            if (machineState.status === 'COMPLETED' || machineState.status === 'TERMINATED') {
                stopCamera();
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showInstructions, machineState.status]);

    const allViolations = [...(proctoringViolations || [])];

    // ✅ PHASE 4: Audio Monitoring
    // eslint-disable-next-line no-unused-vars
    const { audioLevel, voiceDetected, isListening } = useAudioMonitoring(
        !showInstructions && dataIndex >= 0 && (machineState.status === 'IN_PROGRESS' || machineState.status === 'READY'), 
        null, // Socket handled internally or passed if needed
        interviewId
    );

    // Lifecycle monitoring for developer tracing
    useEffect(() => {
        const isMonitorOn = !showInstructions && (machineState.status === 'IN_PROGRESS' || machineState.status === 'READY');
        
        console.log(`🔍 [TRACE] Interview.js Effect Update: isMonitoring=${isMonitorOn}, showInstructions=${showInstructions}, machineStatus=${machineState.status}, dataIndex=${dataIndex}`);

        if (isMonitorOn) {
            console.log('🛡️ Security activation threshold met.');
        }

        return () => {
             console.log('🧹 [TRACE] Interview.js Effect Cleanup');
        }
    }, [interviewId, interviewClosed, interview?.is_completed, machineState.status, showInstructions, dataIndex]);


    useEffect(() => {
        if (!showInstructions && dataIndex >= 0 && voiceDetected && audioLevel > 50) {
            // Sustained voice activity detected - escalating from warning to violation handled by addViolation escalation logic
            addViolation('AUDIO_DETECTED', 'Repeated or continuous sound detected. Please maintain silence.');
        }
    }, [voiceDetected, audioLevel, addViolation, showInstructions, dataIndex]);
    
    // ✅ Strike counter removed as we use warningCount from hook
    const [violationWarnings, setViolationWarnings] = useState([]);
    
    // ✅ PHASE 3: Listen for proctoring events
    useEffect(() => {
        const handleViolationWarning = (event) => {
            const { detail } = event;
            logger.warn('UI: Violation warning received', detail);
            
            // Add to violation warnings (show for 5 seconds)
            setViolationWarnings(prev => [...prev, detail]);
            
            // Auto-dismiss after 5 seconds
            setTimeout(() => {
                setViolationWarnings(prev => prev.filter(w => w.timestamp !== detail.timestamp));
            }, 5000);
        };
        
        const handleInterviewTerminated = (event) => {
            const { detail } = event;
            logger.error('UI: Force termination received', detail);
        };

        // Add event listeners
        window.addEventListener('proctoring:violation_warning', handleViolationWarning);
        window.addEventListener('proctoring:interview_terminated', handleInterviewTerminated);
        
        // Cleanup
        return () => {
            window.removeEventListener('proctoring:violation_warning', handleViolationWarning);
            window.removeEventListener('proctoring:interview_terminated', handleInterviewTerminated);
        };
    }, [clearDraft, fetchInterview, actions, setInterviewClosed, setInterview, setMcqAnswer, setResponse]);

    // ----------------------------------------------------------------------
    // RENDER
    // ----------------------------------------------------------------------
    if (missingId) return <div className="text-center mt-10 text-red-600">Invalid Interview Link</div>;
    if (loading && !interview) return <div className="text-center mt-10">Loading Interface...</div>;

    const currentQ = interview?.questions?.[dataIndex];
    // Prioritize specific question type (for mixed interviews), fallback to global type
    const qType = currentQ?.type || interview?.question_type || 'Descriptive';

    return (
        <div className="container mx-auto p-3 lg:p-4 max-w-4xl relative min-h-screen pb-10">
            <InterviewHeader 
                 showTechnicalButton={!interviewClosed}
                 onShowTechnicalIssue={() => setShowTechnicalIssueModal(true)}
            />

            <TechnicalIssueModal 
                show={showTechnicalIssueModal} 
                onClose={() => setShowTechnicalIssueModal(false)}
                interviewId={interviewId}
                token={token}
            />

            {/* Hidden video element for face detection — NOT visible to candidate */}
            <video
                ref={cameraVideoRef}
                autoPlay
                muted
                playsInline
                style={{ position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none', overflow: 'hidden' }}
            />

            {/* ✅ Conditional Content: Instructions OR Interview Flow */}
            {showInstructions && interviewId ? (
                <InterviewInstructions 
                    interviewId={interviewId} 
                    interviewDetails={interview}
                    onProceed={async () => {
                        if (isStartingRef.current) return; // ✅ PHASE B: Prevent duplicate handshakes
                        isStartingRef.current = true;
                        
                        try {
                            // ✅ AUDIO UNLOCK: Professional interaction-based unlock
                            // Resolves browser autoplay restrictions for proctoring alerts
                            const AudioContext = window.AudioContext || window.webkitAudioContext;
                            if (AudioContext) {
                                const tempCtx = new AudioContext();
                                tempCtx.resume().then(() => {
                                    console.log('🎵 AudioContext unlocked via user interaction');
                                    // Brief silent buffer to prime the engine
                                    const buffer = tempCtx.createBuffer(1, 1, 22050);
                                    const source = tempCtx.createBufferSource();
                                    source.buffer = buffer;
                                    source.connect(tempCtx.destination);
                                    source.start(0);
                                });
                            }

                            await axios.post(`/interviews/${interviewId}/start`);
                            console.log('✅ Proceeding to interview. State updated on server.');
                            
                            // Transition to IN_PROGRESS BEFORE fetchInterview to avoid
                            // the sync effect racing into ERROR and blocking startInterview.
                            setShowInstructions(false);
                            console.log('🚀 Phase B: Triggering Interview Action...');
                            actions.startInterview();
                            
                            // Fetch fresh data AFTER state transition (non-blocking)
                            fetchInterview();
                        } catch (err) {
                            console.error("Failed to start interview:", err);
                            isStartingRef.current = false; // Reset on error
                            setDataError("Failed to start assessment. Please check your connection and try again.");
                        }
                    }} 
                />
            ) : (
                <>
                    <ProctoringStatus
                        warningCount={warningCount}
                        maxWarnings={3}
                        connectionStatus={connectionStatus}
                        isTerminated={isTerminated}
                        performanceMetrics={{
                            fps: 0,
                            latencyMs: 0
                        }}
                        faceDetectionStatus={faceDetectionStatus}
                        faceModelLoaded={faceModelLoaded}
                        faceModelLoading={faceModelLoading}
                        faceCount={faceCount}
                        isCameraActive={isCameraActive}
                        cameraError={cameraError}
                    />
                    
                    {/* ✅ New: Proctoring Alerts & Warnings (from useInterviewProctoring) */}
                    {showWarning && (
                        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] animate-bounce-in">
                            <div className={`
                                flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border-2
                                ${warningMessage.includes('VIOLATION') ? 'bg-red-50 border-red-500 text-red-900' : 'bg-amber-50 border-amber-500 text-amber-900'}
                            `}>
                                <div className="text-2xl">⚠️</div>
                                <div>
                                    <p className="font-bold text-sm uppercase tracking-wide">
                                        {warningMessage.includes('VIOLATION') ? `Strike ${warningCount}/${maxWarnings}` : 'Security Alert'}
                                    </p>
                                    <p className="text-lg font-medium">{warningMessage.replace('VIOLATION:', '').replace('Warning:', '')}</p>
                                </div>
                                <button 
                                    onClick={dismissWarning}
                                    className="ml-4 p-1 hover:bg-black/5 rounded-full transition-colors"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                    )}
                    
                    {/* ✅ Legacy: Violation Trace (if needed for older events) */}
                    {violationWarnings.slice(-1).map((warning, idx) => (
                        <div key={warning.timestamp} className="fixed bottom-4 right-4 bg-gray-900/90 text-white px-4 py-2 rounded-lg text-xs z-50 animate-fade-in">
                             <span className="font-bold text-red-400">LOGGED:</span> {warning.violation?.message?.message || "Violation recorded"}
                        </div>
                    ))}

                    {/* ✅ Refactored: Completion Modal */}
                    <CompletionModal 
                        visible={completionModal.visible}
                        title={completionModal.title}
                        message={completionModal.message}
                        score={completionModal.score}
                        onRedirect={() => window.location.href = '/jobs'}
                    />

                    {/* ✅ Refactored: Terminated View */}
                    {(interviewClosed || isTerminated) ? (
                        <TerminatedView 
                            reason={closeReason || warningMessage}
                            onRedirect={() => window.location.href = '/jobs'}
                        />
                    ) : (
                        <>
                            <QuestionNavigator 
                                questions={interview?.questions || []}
                                currentIndex={dataIndex}
                                answers={answers}
                                responses={interview?.responses || []}
                                onNavigate={handleNavigate}
                            />

                             {dataError && <div className="bg-red-50 text-red-800 p-3 mb-4 rounded text-sm">{dataError}</div>}

                             <div className="bg-white rounded-xl lg:rounded-2xl shadow-lg p-4 lg:p-6 mb-4">
                                 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
                                     <h2 className="text-lg lg:text-xl font-bold text-gray-900">Current Question</h2>
                                     {/* Pass explicit seconds from server timer */}
                                     <TimerDisplay timer={secondsRemaining} maxTime={maxTime} isRunning={!isExpired} />
                                 </div>

                                {/* Use new QuestionDisplay Component */}
                                <QuestionDisplay 
                                    question={currentQ} 
                                    type={qType} 
                                />

                                {/* Kept AnswerInput for now, as Decomp task said QuestionDisplay was priority */}
                                <AnswerInput 
                                    questionType={qType}
                                    response={response}
                                    setResponse={setResponse}
                                    disabled={isSubmitting}
                                    
                                    // NEW: MCQ Props
                                    question={currentQ} 
                                    mcqAnswer={mcqAnswer}
                                    setMcqAnswer={setMcqAnswer}
                                />

                                <ControlPanel 
                                    currentIndex={dataIndex}
                                    totalQuestions={interview?.questions?.length || 0}
                                    onPrev={() => handleNavigate(dataIndex - 1, interview?.responses?.length || 0)}
                                    onSubmit={handleSubmit}
                                    disabled={isSubmitting}
                                    questionType={qType}
                                    response={response}
                                    mcqAnswer={mcqAnswer}
                                    interviewClosed={interviewClosed}
                                    isSubmitting={isSubmitting}
                                />
                            </div>
                        </>
                    )}
                </>
            )}

            <ProctoringWarning
                 show={showWarning}
                 message={warningMessage}
                 violationType={violationType} // ✅ PHASE 1: Pass violation type for specific icons/messages
                 metadata={allViolations[allViolations.length - 1]} // ✅ PHASE 1: Pass latest violation metadata
                 warningCount={warningCount}
                 maxWarnings={maxWarnings}
                 isTerminated={isTerminated}
                 onDismiss={dismissWarning}
                 onRedirect={() => window.location.href = '/jobs'}
            />
        </div>
    );
}

export default Interview;
