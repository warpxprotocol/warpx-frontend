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
              } else if (dispatchError.isToken) {
                errorMessage = `Token error: ${dispatchError.asToken.type}`;
              } else {
                errorMessage = `Error: ${dispatchError.toString()}`;
              }
              showTxToast('error', errorMessage, { loadingToastId });
              reject(new Error(errorMessage));
              return;
            }

            // 트랜잭션 이벤트 로깅
            console.log(
              'Transaction events:',
              events.map(({ event }) => ({
                section: event.section,
                method: event.method,
                data: event.data.toHuman(),
              })),
            );

            const successEvent = events.find(
              ({ event }) =>
                (event.section === 'assets' &&
                  (event.method === 'Created' ||
                    event.method === 'Minted' ||
                    event.method === 'Transferred')) ||
                (event.section === 'system' && event.method === 'ExtrinsicSuccess'),
            );

            if (successEvent) {
              const txHash = status.isFinalized
                ? status.asFinalized.toString()
                : status.asInBlock.toString();

              console.log('Transaction successful:', {
                hash: txHash,
                event: {
                  section: successEvent.event.section,
                  method: successEvent.event.method,
                },
              });

              showTxToast('success', messages.success || 'Transaction completed', {
                txHash,
                loadingToastId,
                autoClose: 5000, // 5초 후 자동으로 닫힘
              });
              resolve({ status, events });
            } else {
              const errorMessage = 'Transaction completed but no success event found';
              console.error(errorMessage, events);
              showTxToast('error', errorMessage, { loadingToastId, autoClose: 5000 });
              reject(new Error(errorMessage));
            }
          } else if (status.isInvalid || status.isDropped || status.isUsurped) {
            const errorMessage = `Transaction failed with status: ${status.type}`;
            console.error(errorMessage, status);
            showTxToast('error', errorMessage, { loadingToastId, autoClose: 5000 });
            reject(new Error(errorMessage));
          }
        })
        .catch((error) => {
          console.error('Transaction error:', error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          showTxToast(
            'error',
            `${messages.error || 'Transaction failed'}: ${errorMessage}`,
            { loadingToastId, autoClose: 5000 },
          );
          reject(error);
        });
    });
  };

  return { handleExtrinsic };
};
