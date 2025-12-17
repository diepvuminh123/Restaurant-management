import React, { createContext, useContext } from 'react';
import { useToast } from '../hooks/useToast';
import ToastContainer from '../component/Toast/ToastContainer';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const toast = useToast();
  
  return (
    <ToastContext.Provider value={toast}>
      <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />
      {children}
    </ToastContext.Provider>
  );
};

export const useToastContext = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext must be used within ToastProvider');
  }
  return context;
};
