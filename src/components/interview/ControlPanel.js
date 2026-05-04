import React from 'react';

export const ControlPanel = ({ 
    currentIndex, 
    totalQuestions, 
    onPrev, 
    onSubmit, 
    disabled, 
    questionType, 
    response, 
    mcqAnswer, 
    interviewClosed,
    isSubmitting
}) => {
    
    const isSubmitDisabled = () => {
        if (interviewClosed || isSubmitting) return true;
        if (disabled) return true;
        
        if (questionType === 'MCQ') return mcqAnswer === null;
        return (response || '').trim().length < 10;
    };

    const getButtonClass = () => {
        if (isSubmitDisabled()) return 'bg-gray-300 cursor-not-allowed shadow-none transform-none';
        return 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl';
    };

    const getButtonText = () => {
        if (interviewClosed) return 'Interview Closed';
        if (isSubmitting) return 'Submitting...';
        return currentIndex < totalQuestions - 1 ? 'Submit & Next Question →' : 'Match & Finish Interview ✨';
    };

    return (
        <div className="flex flex-col gap-3">
            <div className="flex gap-3">
                {currentIndex > 0 && (
                    <button
                        onClick={onPrev}
                        className="px-6 py-3 rounded-xl font-medium text-gray-600 bg-white border-2 border-gray-100 hover:border-gray-300 hover:bg-gray-50 transition shadow-sm"
                    >
                        ← Previous
                    </button>
                )}
                
                <button
                    onClick={onSubmit}
                    disabled={isSubmitDisabled()}
                    className={`flex-1 py-3 rounded-xl font-bold text-lg text-white transition-all shadow-md transform hover:-translate-y-0.5 ${getButtonClass()}`}
                >
                    {getButtonText()}
                </button>
            </div>
            
            {/* Validation Messages */}
            {questionType === 'MCQ' && mcqAnswer === null && !interviewClosed && (
                <p className="mt-1 text-sm text-gray-500 text-center">
                    Please select an answer
                </p>
            )}
            {questionType !== 'MCQ' && (response || '').trim().length < 10 && !interviewClosed && (
                <p className="mt-1 text-sm text-gray-500 text-center">
                    Please provide at least 10 characters in your response
                </p>
            )}
        </div>
    );
};
