'use client';

import { ReactNode } from 'react';
import { createContext, useContext } from 'react';
import { Toaster, toast } from 'sonner';

import { TxStatus, TxToastContextType, TxToastOptions } from './types';

export const TxToastContext = createContext<TxToastContextType | undefined>(undefined);

export const TxToastProvider = ({ children }: { children: ReactNode }) => {
  const showTxToast = (status: TxStatus, message: string, options?: TxToastOptions) => {
    const duration = options?.duration ?? Infinity;
    const toastOptions = {
      duration,
      dismissible: true,
    };

    switch (status) {
      case 'pending':
        return toast.loading(message, toastOptions);
      case 'success':
        if (options?.loadingToastId) {
          toast.dismiss(options.loadingToastId);
        }
        toast.success(message, {
          ...toastOptions,
          description: options?.txHash ? `Transaction Hash: ${options.txHash}` : undefined,
        });
        break;
      case 'error':
        if (options?.loadingToastId) {
          toast.dismiss(options.loadingToastId);
        }
        toast.error(message, toastOptions);
        break;
    }
  };

  return (
    <TxToastContext.Provider value={{ showTxToast }}>
      <Toaster position="top-right" closeButton richColors />
      {children}
    </TxToastContext.Provider>
  );
};
