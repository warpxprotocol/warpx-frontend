import { useContext } from 'react';

import { TxToastContext } from './TxToastProvider';

export const useTxToast = () => {
  const context = useContext(TxToastContext);

  if (context === undefined) {
    throw new Error('useTxToast must be used within a TxToastProvider');
  }

  return context;
};
