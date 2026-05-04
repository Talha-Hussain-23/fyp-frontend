import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

const ConfirmModal = ({ isOpen, message, onConfirm, onCancel, title = "Confirm Action" }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onCancel}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="flex-1 mt-1 font-sans">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {title}
                    </h3>
                    <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                      {message}
                    </p>
                  </div>
                </div>
                
                <div className="mt-6 flex gap-3 justify-end">
                  <button
                    onClick={onCancel}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onConfirm}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors shadow-sm"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;
