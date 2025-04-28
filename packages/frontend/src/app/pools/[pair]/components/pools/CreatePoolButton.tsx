'use client';

import { web3Enable } from '@polkadot/extension-dapp';
import { Plus, X } from 'lucide-react';
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

interface CreatePoolButtonProps {
  className?: string;
}

export function CreatePoolButton({ className }: CreatePoolButtonProps) {
  const { handleExtrinsic } = useExtrinsic();
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
  } | null>(null);
  const [selectedQuoteAsset, setSelectedQuoteAsset] = useState<{
    id: number;
    symbol: string;
    name?: string;
  } | null>(null);
  const [signer, setSigner] = useState<any>(null);

  useEffect(() => {
    const initSigner = async () => {
      const extensions = await web3Enable('polkadot-js');
      if (extensions.length > 0) {
        setSigner(extensions[0].signer);
      }
    };
    initSigner();
  }, []);

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

  const handleAssetSelect = (asset: { id: number; symbol: string; name?: string }) => {
    if (selectingBase) {
      setSelectedBaseAsset(asset);
      if (selectedQuoteAsset && selectedQuoteAsset.id === asset.id) {
        setSelectedQuoteAsset(null);
      }
    } else {
      setSelectedQuoteAsset(asset);
      if (selectedBaseAsset && selectedBaseAsset.id === asset.id) {
        setSelectedBaseAsset(null);
      }
    }
    setIsAssetSelectorOpen(false);
  };

  const createPool = async () => {
    if (!connected || !selectedAccount || !api || !signer) {
      console.error('Wallet not connected or API not ready');
      return;
    }

    if (selectedBaseAsset && selectedQuoteAsset) {
      try {
        const extrinsic = api.tx.hybridOrderbook.createPool(
          { WithId: selectedBaseAsset.id },
          { WithId: selectedQuoteAsset.id },
          0, // takerFeeRate (0%)
          1, // tickSize
          1, // lotSize
        );

        await handleExtrinsic(
          extrinsic,
          {
            account: selectedAccount,
            signer,
          },
          {
            pending: '풀 생성을 시작합니다...',
            success: '풀이 성공적으로 생성되었습니다!',
            error: '풀 생성 중 오류가 발생했습니다.',
          },
        );

        setOpen(false);
      } catch (error) {
        console.error('Failed to create pool:', error);
      }
    }
  };

  return (
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
              Select a token pair and fee tier, and set the price range and deposit amount.
            </DialogDescription>
          </DialogHeader>
          <div className="w-full max-w-xl mx-auto rounded-2xl p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">NEW POSITION</h2>
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-6">
                <span className="font-semibold text-white">1ST STEP STEP</span>
                <span>Select a token pair and fee tier</span>
                <span className="mx-2">|</span>
                <span>Set the price range and deposit amount</span>
              </div>
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
                  Select the token you want to provide liquidity. You can select tokens on
                  all supported networks.
                </div>
              </div>
              {/* Fee Tier */}
              <div className="mb-6">
                <div className="text-gray-400 text-sm mb-2">Fee Tier</div>
                <div className="bg-gray-800 rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <div className="text-white font-semibold">0.3% Fee Tier</div>
                    <div className="text-xs text-gray-400">
                      The ratio of fees you can earn (%)
                    </div>
                  </div>
                  <Button variant="ghost" className="text-xs px-3 py-1">
                    MORE
                  </Button>
                </div>
              </div>
              <Button
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                size="lg"
                disabled={!(selectedBaseAsset && selectedQuoteAsset)}
                onClick={createPool}
              >
                CONTINUE
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
  );
}
