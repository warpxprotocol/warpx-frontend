export type TxStatus = 'pending' | 'success' | 'error';

export interface TxToastOptions {
  txHash?: string;
  duration?: number;
  loadingToastId?: string | number;
}

export interface TxToastContextType {
  showTxToast: (status: TxStatus, message: string, options?: TxToastOptions) => void;
}
