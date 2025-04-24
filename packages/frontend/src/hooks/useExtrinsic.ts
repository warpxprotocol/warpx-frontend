import { SubmittableExtrinsic } from '@polkadot/api/types';
import { Keyring } from '@polkadot/keyring';
import { ISubmittableResult } from '@polkadot/types/types';

import { useTxToast } from '@/components/toast/useTxToast';

interface ExtrinsicOptions {
  signer?: any;
  account?: string;
  useDev?: boolean;
}

interface ExtrinsicMessages {
  pending?: string;
  success?: string;
  error?: string;
}

export const useExtrinsic = () => {
  const { showTxToast } = useTxToast();

  const handleExtrinsic = async (
    extrinsic: SubmittableExtrinsic<'promise', ISubmittableResult>,
    options: ExtrinsicOptions = {},
    messages: ExtrinsicMessages = {},
  ) => {
    return new Promise((resolve, reject) => {
      const keyring = new Keyring({ type: 'sr25519' });
      let signer;

      if (options.useDev) {
        signer = keyring.addFromUri('//Alice');
      } else if (!options.signer || !options.account) {
        reject(new Error('No signer or account provided'));
        return;
      } else {
        signer = options.account;
      }

      const signOptions = options.useDev ? {} : { signer: options.signer };

      // 로딩 토스트 ID 저장
      const loadingToastId = showTxToast(
        'pending',
        messages.pending || 'Processing transaction...',
      );

      extrinsic
        .signAndSend(signer, signOptions, ({ status, events, dispatchError }) => {
          if (status.isInBlock || status.isFinalized) {
            if (dispatchError) {
              let errorMessage = messages.error || 'Transaction failed';
              if (dispatchError.isModule) {
                const decoded = extrinsic.registry.findMetaError(dispatchError.asModule);
                errorMessage = `${decoded.section}.${decoded.name}: ${decoded.docs}`;
              }
              showTxToast('error', errorMessage, { loadingToastId });
              reject(new Error(errorMessage));
              return;
            }

            const successEvent = events.find(
              ({ event }) =>
                (event.section === 'assets' && event.method === 'Created') ||
                (event.section === 'system' && event.method === 'ExtrinsicSuccess'),
            );

            if (successEvent) {
              showTxToast('success', messages.success || 'Transaction completed', {
                txHash: status.isFinalized
                  ? status.asFinalized.toString()
                  : status.asInBlock.toString(),
                loadingToastId,
              });
              resolve({ status, events });
            }
          }
        })
        .catch((error) => {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          showTxToast(
            'error',
            `${messages.error || 'Transaction failed'}: ${errorMessage}`,
            {
              loadingToastId,
            },
          );
          reject(error);
        });
    });
  };

  return { handleExtrinsic };
};
