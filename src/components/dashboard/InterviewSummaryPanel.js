import './InterviewSummaryPanel.css';

const InterviewSummaryPanel = ({ sections, validationErrors = [] }) => {
  const enabledSections = sections.filter(s => s.enabled);
  
  const totalQuestions = enabledSections.reduce((sum, s) => sum + s.num_questions, 0);
  const totalTime = enabledSections.reduce((sum, s) => sum + (s.num_questions * s.time_per_question), 0);
  const totalWeight = enabledSections.reduce((sum, s) => sum + s.weight, 0);
  
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };
  
  const isValid = enabledSections.length > 0 && totalWeight === 100;

  return (
    <div className="interview-summary-panel">
      <h4>📊 Interview Summary</h4>
      
      <div className="summary-stats">
        <div className="stat-item">
          <label>Total Questions</label>
          <value>{totalQuestions}</value>
        </div>
        
        <div className="stat-item">
          <label>Total Time</label>
          <value>{formatTime(totalTime)}</value>
        </div>
        
        <div className="stat-item">
          <label>Total Weight</label>
          <value className={totalWeight !== 100 ? 'error' : 'success'}>
            {totalWeight}%
          </value>
        </div>
        
        <div className="stat-item">
          <label>Sections</label>
          <value>{enabledSections.length}</value>
        </div>
      </div>
      
      {enabledSections.length > 0 && (
        <div className="section-breakdown">
          <h5>Section Breakdown</h5>
          {enabledSections.map(section => (
            <div key={section.type} className="breakdown-item">
              <span className="section-name">{section.type}</span>
              <span className="section-details">
                {section.num_questions} questions × {section.time_per_question / 60}min = {section.weight}%
              </span>
            </div>
          ))}
        </div>
      )}
      
      {validationErrors.length > 0 && (
        <div className="validation-errors">
          {validationErrors.map((error, idx) => (
            <div key={idx} className="error-message">
              ⚠️ {error}
            </div>
          ))}
        </div>
      )}
      
      {!isValid && validationErrors.length === 0 && (
        <div className="validation-errors">
          {enabledSections.length === 0 && (
            <div className="error-message">
              ⚠️ Please enable at least one interview section
            </div>
          )}
          {totalWeight !== 100 && enabledSections.length > 0 && (
            <div className="error-message">
              ⚠️ Total weight must equal 100% (currently {totalWeight}%)
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InterviewSummaryPanel;
