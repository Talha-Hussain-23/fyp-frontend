import React from 'react';

export const TechnicalIssueModal = ({ show, onClose, interviewId, token }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-fade-in">
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-4">
          <h3 className="text-2xl font-bold text-white flex items-center gap-2">
            <span>🔧</span> Technical Issue?
          </h3>
        </div>
        
        <div className="p-6">
          <p className="text-gray-700 mb-4 leading-relaxed">
            If you're experiencing technical difficulties (internet issues, browser problems, etc.), 
            you can request an interview reclaim.
          </p>
          
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded">
            <h4 className="font-semibold text-blue-900 mb-2">📋 What happens next:</h4>
            <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
              <li>You'll be redirected to a reclaim request form</li>
              <li>Describe the technical issue you encountered</li>
              <li>The recruiter will review your request</li>
              <li>If approved, you'll receive a new interview link via email</li>
            </ol>
          </div>
          
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6 rounded">
            <p className="text-sm text-yellow-800">
              <strong>⚠️ Note:</strong> Your current progress will be saved. The reclaim request 
              will be reviewed by the recruiter, typically within 24 hours.
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => {
                window.location.href = `/interview-reclaim?interview_id=${interviewId}${token ? `&token=${token}` : ''}`;
              }}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-xl font-bold transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Request Reclaim
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition"
            >
              Continue Interview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
