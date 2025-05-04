'use client';

import { web3Enable } from '@polkadot/extension-dapp';
import { Info, Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { useWalletStore } from '@/app/features/wallet/hooks/useWalletStore';
import { useTxToast } from '@/components/toast/useTxToast';
import { AssetSelector } from '@/components/ui/asset-selector';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useApi } from '@/hooks/useApi';
import { useExtrinsic } from '@/hooks/useExtrinsic';

import { PoolParametersForm } from './PoolParametersForm';
import { usePoolCreation } from './poolCreation';
import { usePoolOperations } from './usePoolOperations';

interface CreatePoolButtonProps {
  className?: string;
}

export function CreatePoolButton({ className }: CreatePoolButtonProps) {
  const { handleExtrinsic } = useExtrinsic();
  const { createPool, addLiquidity } = usePoolOperations();
  const { showTxToast } = useTxToast();
  const { selectedAccount, connected } = useWalletStore();
  const { api } = useApi();
  const [open, setOpen] = useState(false);
  const [isAssetSelectorOpen, setIsAssetSelectorOpen] = useState(false);
  const [selectingBase, setSelectingBase] = useState(true);
  const [selectedBaseAsset, setSelectedBaseAsset] = useState<{
    id: number;
    symbol: string;
    name?: string;
    decimals?: number;
  } | null>(null);
  const [selectedQuoteAsset, setSelectedQuoteAsset] = useState<{
    id: number;
    symbol: string;
    name?: string;
    decimals?: number;
  } | null>(null);
  const [signer, setSigner] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Pool parameters state
  const [takerFeeRate, setTakerFeeRate] = useState<string>('0');
  const [tickSize, setTickSize] = useState<string>('1');
  const [lotSize, setLotSize] = useState<string>('1');
  const [poolDecimals, setPoolDecimals] = useState<string>('2');
  const [currentStep, setCurrentStep] = useState<'pair' | 'parameters'>('pair');

  // 컴포넌트가 마운트되었는지 확인하는 useEffect
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    // 컴포넌트가 마운트된 후에만 web3Enable 호출
    if (isMounted) {
      const initSigner = async () => {
        try {
          const extensions = await web3Enable('polkadot-js');
          if (extensions.length > 0) {
            setSigner(extensions[0].signer);
          }
        } catch (error) {
          console.error('Failed to initialize signer:', error);
        }
      };
      initSigner();
    }
  }, [isMounted]);

  useEffect(() => {
    if (selectedBaseAsset?.decimals && selectedQuoteAsset?.decimals) {
      // Set pool decimals to the minimum of the two assets' decimals
      setPoolDecimals(
        Math.min(selectedBaseAsset.decimals, selectedQuoteAsset.decimals).toString(),
      );
    }
  }, [selectedBaseAsset?.decimals, selectedQuoteAsset?.decimals]);

  const openBaseAssetSelector = () => {
    setSelectingBase(true);
    setIsAssetSelectorOpen(true);
  };
  const openQuoteAssetSelector = () => {
    setSelectingBase(false);
    setIsAssetSelectorOpen(true);
  };
  const removeBaseAsset = () => setSelectedBaseAsset(null);
  const removeQuoteAsset = () => setSelectedQuoteAsset(null);

  const handleAssetSelect = async (asset: {
    id: number;
    symbol: string;
    name?: string;
  }) => {
    setIsLoading(true);
    try {
      // Fetch asset metadata to get decimals
      let decimals = 2; // Default fallback
      if (api) {
        try {
          const assetMetadata = await api.query.assets.metadata(asset.id);
          if (assetMetadata) {
            // Use type assertion to handle the returned metadata structure
            const metadata = assetMetadata.toHuman() as { decimals?: string | number };
            if (metadata && metadata.decimals !== undefined) {
              // Convert to number since it might be returned as a string
              decimals =
                typeof metadata.decimals === 'string'
                  ? parseInt(metadata.decimals, 10)
                  : metadata.decimals;
              console.log(`Fetched decimals for asset ${asset.id}: ${decimals}`);
            }
          }
        } catch (error) {
          console.error(`Failed to fetch metadata for asset ${asset.id}:`, error);
        }
      }

      const assetWithDecimals = {
        ...asset,
        decimals,
      };

      if (selectingBase) {
        setSelectedBaseAsset(assetWithDecimals);
        if (selectedQuoteAsset && selectedQuoteAsset.id === asset.id) {
          setSelectedQuoteAsset(null);
        }
      } else {
        setSelectedQuoteAsset(assetWithDecimals);
        if (selectedBaseAsset && selectedBaseAsset.id === asset.id) {
          setSelectedBaseAsset(null);
        }
      }
    } catch (error) {
      console.error('Error selecting asset:', error);
    } finally {
      setIsLoading(false);
      setIsAssetSelectorOpen(false);
    }
  };

  // 임시: 초기 유동성 값 (실제 구현시 폼에서 입력받도록 개선)
  const INITIAL_BASE_AMOUNT = 1; // 예시: 1 base asset
  const INITIAL_QUOTE_AMOUNT = 1; // 예시: 1 quote asset

  const createPoolHandler = async () => {
    if (!connected || !selectedAccount || !api || !signer) {
      console.error('Wallet not connected or API not ready');
      return;
    }

    if (selectedBaseAsset && selectedQuoteAsset) {
      try {
        setIsLoading(true);

        // 1. 풀 생성
        const txHash = await createPool(
          selectedBaseAsset.id,
          selectedBaseAsset.decimals || 2,
          selectedQuoteAsset.id,
          selectedQuoteAsset.decimals || 2,
          takerFeeRate,
          tickSize,
          lotSize,
          poolDecimals,
          selectedAccount,
          { signer },
        );
        console.log('Pool created with txHash:', txHash);

        // 2. 풀 생성 성공 시, addLiquidity 실행
        // 실제로는 사용자가 입력한 값으로 대체해야 함
        const addLpTxHash = await addLiquidity(
          selectedBaseAsset.id,
          selectedQuoteAsset.id,
          INITIAL_BASE_AMOUNT,
          INITIAL_QUOTE_AMOUNT,
          selectedAccount,
          { signer },
        );
        console.log('Liquidity added with txHash:', addLpTxHash);

        showTxToast('success', 'Pool created and liquidity added successfully!');
        setOpen(false);
      } catch (error) {
        console.error('Failed to create pool or add liquidity:', error);
        showTxToast(
          'error',
          `Failed to create pool or add liquidity: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <>
      {isMounted ? (
        <>
          <Button onClick={() => setOpen(true)} className={className}>
            <Plus className="h-4 w-4" /> CREATE POOL
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-xl p-0 bg-[#18181B] border-none">
              <DialogHeader className="px-8 pt-8 pb-4">
                <DialogTitle className="text-2xl font-bold text-white">
                  NEW POSITION
                </DialogTitle>
                <DialogDescription className="text-gray-400">
                  Select a token pair and fee tier, and set the price range and deposit
                  amount.
                </DialogDescription>
              </DialogHeader>
              <div className="w-full max-w-xl mx-auto rounded-2xl p-8">
                <div className="space-y-4">
                  <div className="mb-6">
                    <div className="text-gray-400 text-sm mb-2">Select a pair</div>
                    <div className="flex gap-2 items-center">
                      {/* Base Token */}
                      {selectedBaseAsset ? (
                        <div className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-lg min-w-[100px]">
                          <span className="bg-gray-700 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white">
                            {selectedBaseAsset.symbol[0]}
                          </span>
                          <span className="text-white font-semibold">
                            {selectedBaseAsset.symbol}
                          </span>
                          <button
                            onClick={removeBaseAsset}
                            className="text-gray-400 hover:text-red-400 ml-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <Button
                          variant="secondary"
                          className="min-w-[100px]"
                          onClick={openBaseAssetSelector}
                        >
                          + ADD TOKEN
                        </Button>
                      )}
                      <span className="text-gray-500 font-bold">/</span>
                      {/* Quote Token */}
                      {selectedQuoteAsset ? (
                        <div className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-lg min-w-[100px]">
                          <span className="bg-gray-700 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white">
                            {selectedQuoteAsset.symbol[0]}
                          </span>
                          <span className="text-white font-semibold">
                            {selectedQuoteAsset.symbol}
                          </span>
                          <button
                            onClick={removeQuoteAsset}
                            className="text-gray-400 hover:text-red-400 ml-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <Button
                          variant="secondary"
                          className="min-w-[100px]"
                          onClick={openQuoteAssetSelector}
                        >
                          + ADD TOKEN
                        </Button>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      Select the token you want to provide liquidity. You can select tokens
                      on all supported networks.
                    </div>
                  </div>

                  <PoolParametersForm
                    takerFeeRate={takerFeeRate}
                    setTakerFeeRate={setTakerFeeRate}
                    tickSize={tickSize}
                    setTickSize={setTickSize}
                    lotSize={lotSize}
                    setLotSize={setLotSize}
                    poolDecimals={poolDecimals}
                    setPoolDecimals={setPoolDecimals}
                    baseAssetDecimals={selectedBaseAsset?.decimals}
                    quoteAssetDecimals={selectedQuoteAsset?.decimals}
                  />

                  <Button
                    className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                    size="lg"
                    disabled={!(selectedBaseAsset && selectedQuoteAsset) || isLoading}
                    onClick={createPoolHandler}
                  >
                    {isLoading ? 'CREATING POOL...' : 'CREATE POOL'}
                  </Button>
                </div>
                <AssetSelector
                  isOpen={isAssetSelectorOpen}
                  onClose={() => setIsAssetSelectorOpen(false)}
                  onSelect={handleAssetSelect}
                />
              </div>
            </DialogContent>
          </Dialog>
        </>
      ) : (
        <Button className={className} disabled>
          <Plus className="h-4 w-4" /> CREATE POOL
        </Button>
      )}
    </>
  );
}
