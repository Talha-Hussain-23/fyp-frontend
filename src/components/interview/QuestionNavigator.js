
export const QuestionNavigator = ({ 
    questions = [], 
    currentIndex, 
    answers = {}, 
    responses = [], 
    onNavigate 
}) => {
    
  if (!questions || questions.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Questions Progress</h2>
        <div className="text-sm text-gray-600">
          {questions.filter(q => q.answered || answers[q.id] !== undefined).length} / {questions.length} answered
        </div>
      </div>
      <div className="grid grid-cols-5 gap-2 mb-4">
        {questions.map((q, idx) => {
          const isAnswered = q.answered || answers[q.id] !== undefined || idx < responses.length;
          const isCurrent = idx === currentIndex;
          const questionId = q.id !== undefined ? q.id : idx;
          const canNavigate = idx <= responses.length;  // Can only navigate to answered or current question
          
            const getTypeIcon = (type = '') => {
              const t = type.toUpperCase();
              if (t === 'MCQ') return '📝';
              if (t === 'CODE' || t === 'CODING') return '💻';
              return '✍️';
            };
            
            return (
              <button
                key={questionId}
                onClick={() => onNavigate(idx, responses.length)}
                disabled={!canNavigate && !isCurrent}
                className={`p-3 rounded-xl border-2 transition-all relative ${
                  isCurrent
                    ? 'border-blue-500 bg-blue-50 shadow-md transform scale-105 z-10'
                    : isAnswered
                    ? 'border-green-500 bg-green-50'
                    : canNavigate
                    ? 'border-gray-200 bg-white hover:border-blue-300'
                    : 'border-gray-100 bg-gray-50 opacity-40 cursor-not-allowed'
                }`}
              >
                <div className="text-[10px] text-gray-400 mb-1 font-bold">Q{idx + 1}</div>
                <div className="text-lg flex justify-center mb-1">
                  {isAnswered ? '✅' : getTypeIcon(q.type)}
                </div>
                <div className="text-[9px] uppercase font-bold text-gray-500 truncate">{q.type || 'Q'}</div>
              </button>
            );
        })}
      </div>
    </div>
  );
};
