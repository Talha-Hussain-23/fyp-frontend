
export const TimerDisplay = ({ timer, maxTime = 60, isRunning }) => {
  if (!isRunning) {
    return (
      <div className="flex items-center gap-2 p-3 bg-gray-100 rounded-lg">
         <span className="text-2xl">📝</span>
         <div>
           <div className="text-sm font-bold text-gray-700">Submitted</div>
           <div className="text-xs text-gray-500">Review Mode</div>
         </div>
      </div>
    );
  }

  // Calculate strict timer colors and text
  const isRed = timer <= 10;
  const isOrange = timer <= 30 && timer > 10;


  const colorClass = isRed ? 'text-red-500' : isOrange ? 'text-orange-500' : 'text-green-500';
  const textClass = isRed ? 'text-red-600' : isOrange ? 'text-orange-600' : 'text-green-600';
  const statusText = isRed ? '⚠️ Hurry!' : isOrange ? '⏰ Running Low' : '✓ Good Time';

  return (
      <div className="flex items-center gap-3">
        <div className="relative w-20 h-20">
          <svg className="transform -rotate-90 w-20 h-20">
            <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-gray-200" />
            <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="6" fill="transparent" strokeDasharray={226.19}
              strokeDashoffset={226.19 * (1 - timer / maxTime)}
              className={`transition-all duration-1000 ${colorClass}`}
              strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className={`text-lg font-bold ${textClass}`}>
                {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
              </div>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500">Time Remaining</div>
          <div className={`text-sm font-medium ${textClass}`}>
            {statusText}
          </div>
        </div>
      </div>
  );
};
