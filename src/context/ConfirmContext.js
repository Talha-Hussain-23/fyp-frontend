import { createContext, useCallback, useContext, useState } from 'react';
import ConfirmModal from '../components/common/ConfirmModal';

const ConfirmContext = createContext();

export const useConfirm = () => {
  return useContext(ConfirmContext);
};

export const ConfirmProvider = ({ children }) => {
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    message: '',
    title: 'Confirm Action',
    onConfirm: null,
    onCancel: null,
  });

  const confirm = useCallback((message, title = 'Confirm Action') => {
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        message,
        title,
        onConfirm: () => {
          setConfirmState(prev => ({ ...prev, isOpen: false }));
          resolve(true);
        },
        onCancel: () => {
          setConfirmState(prev => ({ ...prev, isOpen: false }));
          resolve(false);
        }
      });
    });
  }, []);

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <ConfirmModal
        isOpen={confirmState.isOpen}
        message={confirmState.message}
        title={confirmState.title}
        onConfirm={confirmState.onConfirm}
        onCancel={confirmState.onCancel}
      />
    </ConfirmContext.Provider>
  );
};
