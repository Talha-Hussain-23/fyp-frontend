
export const TerminatedView = ({ reason, onRedirect }) => {
    return (
        <div className="text-center p-10 bg-white rounded shadow-xl">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Interview Terminated</h2>
            <p className="text-lg text-gray-700 mb-6">{reason}</p>
            <button 
                onClick={onRedirect} 
                className="mt-4 text-blue-600 underline hover:text-blue-800"
            >
                Back to Jobs
            </button>
        </div>
    );
};
