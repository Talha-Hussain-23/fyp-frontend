
export const AnswerInput = ({ 
    questionType, 
    response, 
    setResponse, 
    disabled,
    // MCQ Props
    question,
    mcqAnswer,
    setMcqAnswer
}) => {
    // Normalize type (Handle 'Code', 'Coding', 'coding', 'MCQ', 'mcq')
    const type = (questionType || 'Descriptive').toUpperCase();
    
    if (type === 'MCQ') {
        const questionObj = question?.question || question;
        // Robust extraction of options from nested or flat structure
        let options = [];
        if (Array.isArray(question?.options)) {
            options = question.options;
        } else if (questionObj && Array.isArray(questionObj.options)) {
            options = questionObj.options;
        } else if (typeof questionObj === 'object' && Array.isArray(questionObj.options)) {
            options = questionObj.options;
        }
        
        return (
            <div className="space-y-3 mb-6">
                {options.map((option, idx) => (
                    <button
                        key={idx}
                        onClick={() => !disabled && setMcqAnswer(idx + 1)}
                        disabled={disabled}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center group
                            ${mcqAnswer === (idx + 1) 
                                ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-100 shadow-sm' 
                                : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-gray-50'
                            }
                            ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
                        `}
                    >
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 flex-shrink-0 transition-colors
                            ${mcqAnswer === (idx + 1) 
                                ? 'border-blue-600 bg-blue-600' 
                                : 'border-gray-300 group-hover:border-blue-400'
                            }
                        `}>
                            {mcqAnswer === (idx + 1) && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                        <span className={`font-medium ${mcqAnswer === (idx + 1) ? 'text-blue-900' : 'text-gray-700'}`}>
                            {option}
                        </span>
                    </button>
                ))}
            </div>
        );
    } 
    
    if (type === 'CODE' || type === 'CODING') {
        return (
            <div className="mb-6 group">
                <div className="bg-[#1e1e1e] text-gray-400 px-4 py-3 rounded-t-xl flex items-center justify-between border-b border-gray-800 border-x border-t">
                    <div className="flex items-center space-x-2">
                        <div className="flex space-x-1.5 mr-2">
                            <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                            <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                        </div>
                        <span className="text-sm font-mono flex items-center">
                            <svg className="w-4 h-4 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
                            solution.py
                        </span>
                    </div>
                    <div className="flex items-center space-x-3">
                        <span className="text-[10px] bg-gray-700 text-gray-300 px-2 py-0.5 rounded uppercase tracking-wider font-bold">Python 3</span>
                        <span className="text-xs text-gray-500">UTF-8</span>
                    </div>
                </div>
                <div className="relative">
                    {/* Fake Line Numbers */}
                    <div className="absolute left-0 top-0 bottom-0 w-12 bg-[#1e1e1e] border-r border-gray-800 flex flex-col items-center pt-4 text-[#858585] font-mono text-xs select-none leading-relaxed">
                        {[...Array(18)].map((_, i) => (
                            <div key={i} className="h-[22.4px] flex items-center justify-center w-full">
                                {i + 1}
                            </div>
                        ))}
                    </div>
                    <textarea
                        className="w-full pl-16 pr-4 py-4 bg-[#1e1e1e] text-[#d4d4d4] border-x border-b border-gray-800 rounded-b-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 font-mono text-sm leading-relaxed resize-none transition-all shadow-xl"
                        style={{
                            fontFamily: "'Fira Code', 'JetBrains Mono', 'Consolas', 'Monaco', monospace",
                            tabSize: 4,
                            lineHeight: '1.6',
                            minHeight: '400px'
                        }}
                        rows="18"
                        value={response}
                        onChange={(e) => setResponse(e.target.value)}
                        placeholder="# Write your code here...\n# Define your solution below\n\ndef solution(n):\n    # TODO: Implement your logic\n    pass"
                        disabled={disabled}
                        spellCheck={false}
                    />
                </div>
                <div className="mt-2 flex justify-between items-center px-1">
                    <span className="text-[10px] text-gray-400 font-mono italic">Characters: {response?.length || 0}</span>
                    <span className="text-[10px] text-blue-500/70 font-mono animate-pulse">Auto-saving...</span>
                </div>
            </div>
        );
    } 
    
    // Default: Descriptive
    return (
        <div className="relative">
             <div className="flex justify-between items-center mb-2 px-1">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Your Answer</span>
                <span className="text-xs text-blue-500 flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    Markdown Supported
                </span>
            </div>
            <textarea
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 text-lg leading-relaxed shadow-sm transition-all resize-y min-h-[200px]"
                rows="10"
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Type your detailed answer here..."
                disabled={disabled}
                spellCheck={false}
            />
        </div>
    );
};
