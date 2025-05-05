'use client';

import { ReactNode } from 'react';
import { createContext, useContext } from 'react';
import { Toaster, toast } from 'sonner';

import { TxStatus, TxToastContextType, TxToastOptions } from './types';

export const TxToastContext = createContext<TxToastContextType | undefined>(undefined);

export const TxToastProvider = ({ children }: { children: ReactNode }) => {
  const showTxToast = (status: TxStatus, message: string, options?: TxToastOptions) => {
    const duration = options?.autoClose ?? options?.duration ?? Infinity;
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
          description: options?.txHash ? (
            <a
              href={`https://polkadot.js.org/apps/#/explorer/query/${options.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#6b7280', textDecoration: 'underline' }}
            >
              View on Polkadot.js Explorer
            </a>
          ) : undefined,
        });
        return undefined;
      case 'error':
        if (options?.loadingToastId) {
          toast.dismiss(options.loadingToastId);
        }
        toast.error(message, toastOptions);
        return undefined;
    }
  };

  return (
    <TxToastContext.Provider value={{ showTxToast }}>
      <Toaster position="top-right" closeButton richColors />
      {children}
    </TxToastContext.Provider>
  );
};
