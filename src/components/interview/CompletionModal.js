
export const CompletionModal = ({ visible, title, message, score, onRedirect }) => {
    if (!visible) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-11/12 max-w-lg text-center">
                <h3 className="text-2xl font-semibold mb-2">{title}</h3>
                <p>{message}</p>
                {score !== null && <p className="font-bold">Score: {score}/10</p>}
                <button 
                    onClick={onRedirect} 
                    className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                    Go to Jobs
                </button>
            </div>
        </div>
    );
};
