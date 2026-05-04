import ReactMarkdown from 'react-markdown';

/**
 * QuestionDisplay
 * Pure UI component to render the question content based on type.
 */
export const QuestionDisplay = ({ question, type }) => {
    if (!question) return <div className="text-gray-400 italic">Loading question...</div>;

    const renderContent = () => {
        // Handle nested question object structure if present
        let qText = question.question || question.text || question; 
        
        // Handle MCQ/Code structured objects
        if (typeof qText === 'object') {
            if (qText.question) {
                // If it's {"question": "...", "options": [...]}, showing just the question text is correct for display
                // The interactive options are handled by AnswerInput
                qText = qText.question;
            } else {
                // Fallback for unknown structure
                return (
                    <div className="prose max-w-none text-gray-800 font-mono text-sm bg-gray-100 p-2 rounded">
                        {JSON.stringify(qText, null, 2)}
                    </div>
                );
            }
        }
        
        return (
            <div className="prose max-w-none text-gray-800 text-lg leading-relaxed">
                <ReactMarkdown>{qText}</ReactMarkdown>
            </div>
        );
    };

    const getTypeConfig = () => {
        switch (type.toUpperCase()) {
            case 'MCQ': return { icon: '📝', label: 'Multiple Choice', color: 'bg-blue-100 text-blue-800' };
            case 'CODE':
            case 'CODING': return { icon: '💻', label: 'Coding Challenge', color: 'bg-indigo-100 text-indigo-800' };
            case 'DESCRIPTIVE': return { icon: '✍️', label: 'Descriptive Answer', color: 'bg-teal-100 text-teal-800' };
            default: return { icon: '❓', label: type, color: 'bg-gray-100 text-gray-800' };
        }
    };

    const config = getTypeConfig();

    return (
        <div className="mb-6">
            <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm ${config.color}`}>
                    <span className="mr-2 text-sm">{config.icon}</span>
                    {config.label}
                </span>
                
                {question.difficulty && (
                    <span className={`inline-flex items-center px-3 py-1.5 text-xs font-bold tracking-wider uppercase rounded-lg shadow-sm ${
                        question.difficulty === 'Hard' ? 'bg-red-100 text-red-800' :
                        question.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                    }`}>
                        {question.difficulty}
                    </span>
                )}

                {question.weight !== undefined && question.weight > 0 && (
                    <span className="inline-flex items-center px-3 py-1 text-xs font-semibold tracking-wider text-purple-800 uppercase bg-purple-100 rounded-full">
                        Weight: {question.weight}%
                    </span>
                )}
                
                {question.time_limit && (
                    <span className="inline-flex items-center px-3 py-1 text-xs font-semibold tracking-wider text-gray-600 uppercase bg-gray-100 rounded-full">
                        ⏱️ {Math.floor(question.time_limit / 60)}m {question.time_limit % 60}s
                    </span>
                )}
            </div>

            <div className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
                {renderContent()}
            </div>
        </div>
    );
};
