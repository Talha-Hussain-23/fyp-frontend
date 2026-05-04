import React from 'react';

export const InterviewHeader = ({ title = "Interview Assessment", showTechnicalButton, onShowTechnicalIssue }) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <h1 className="text-3xl font-bold">{title}</h1>
      {showTechnicalButton && (
        <button
          onClick={onShowTechnicalIssue}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-50 hover:bg-yellow-100 text-yellow-800 border-2 border-yellow-300 rounded-lg font-semibold transition shadow-sm hover:shadow-md"
          title="Report technical issues and request interview reclaim"
        >
          <span className="text-lg">🔧</span>
          <span>Technical Issue?</span>
        </button>
      )}
    </div>
  );
};
