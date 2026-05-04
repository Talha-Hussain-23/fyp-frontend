import './SectionConfigCard.css';

const SectionConfigCard = ({ 
  section, 
  onToggle, 
  onUpdate, 
  disabled = false 
}) => {
  const { type, enabled, num_questions, weight, time_per_question, language } = section;
  
  const icons = {
    'Descriptive': '📝',
    'MCQ': '✅',
    'Code': '💻'
  };
  
  const titles = {
    'Descriptive': 'Descriptive Questions',
    'MCQ': 'Multiple Choice Questions',
    'Code': 'Coding Questions'
  };
  
  const descriptions = {
    'Descriptive': 'Open-ended questions requiring detailed answers',
    'MCQ': 'Multiple choice questions with 4 options',
    'Code': 'Programming challenges with code editor'
  };

  return (
    <div className={`section-config-card ${enabled ? 'enabled' : 'disabled'}`}>
      <div className="section-header">
        <div className="section-title-area">
          <input
            type="checkbox"
            id={`section-${type}`}
            checked={enabled}
            onChange={(e) => onToggle(type, e.target.checked)}
            disabled={disabled}
          />
          <label htmlFor={`section-${type}`} className="section-title">
            <span className="section-icon">{icons[type]}</span>
            <div className="section-info">
              <h4>{titles[type]}</h4>
              <p className="section-description">{descriptions[type]}</p>
            </div>
          </label>
        </div>
      </div>

      {enabled && (
        <div className="section-config-body">
          <div className="config-row">
            <div className="config-field">
              <label htmlFor={`${type}-questions`}>Number of Questions</label>
              <input
                id={`${type}-questions`}
                type="number"
                min="1"
                max="20"
                value={num_questions}
                onChange={(e) => onUpdate(type, 'num_questions', parseInt(e.target.value) || 1)}
                disabled={disabled}
              />
            </div>

            <div className="config-field">
              <label htmlFor={`${type}-time`}>Time per Question</label>
              <select
                id={`${type}-time`}
                value={time_per_question}
                onChange={(e) => onUpdate(type, 'time_per_question', parseInt(e.target.value))}
                disabled={disabled}
              >
                {type === 'Descriptive' && (
                  <>
                    <option value="120">2 minutes</option>
                    <option value="180">3 minutes</option>
                    <option value="300">5 minutes</option>
                    <option value="600">10 minutes</option>
                  </>
                )}
                {type === 'MCQ' && (
                  <>
                    <option value="30">30 seconds</option>
                    <option value="60">1 minute</option>
                    <option value="90">1.5 minutes</option>
                    <option value="120">2 minutes</option>
                  </>
                )}
                {type === 'Code' && (
                  <>
                    <option value="300">5 minutes</option>
                    <option value="600">10 minutes</option>
                    <option value="900">15 minutes</option>
                    <option value="1200">20 minutes</option>
                    <option value="1800">30 minutes</option>
                  </>
                )}
              </select>
            </div>
          </div>

          <div className="config-row">
            <div className="config-field">
              <label htmlFor={`${type}-weight`}>Section Weight (%)</label>
              <input
                id={`${type}-weight`}
                type="number"
                min="0"
                max="100"
                value={weight}
                onChange={(e) => onUpdate(type, 'weight', parseInt(e.target.value) || 0)}
                disabled={disabled}
              />
              <span className="help-text">Contribution to final score</span>
            </div>

            {type === 'Code' && (
              <div className="config-field">
                <label htmlFor={`${type}-language`}>Programming Language</label>
                <select
                  id={`${type}-language`}
                  value={language || 'Python'}
                  onChange={(e) => onUpdate(type, 'language', e.target.value)}
                  disabled={disabled}
                >
                  <option value="Python">Python</option>
                  <option value="JavaScript">JavaScript</option>
                  <option value="Java">Java</option>
                  <option value="C++">C++</option>
                  <option value="C#">C#</option>
                </select>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SectionConfigCard;
