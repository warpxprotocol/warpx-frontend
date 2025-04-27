import { Search } from 'lucide-react';
import { useState } from 'react';

import { useTokens } from '@/hooks/useTokens';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './dialog';
import { Input } from './input';
import { ScrollArea } from './scroll-area';

interface AssetSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (asset: { id: number; symbol: string; name?: string }) => void;
}

export function AssetSelector({ isOpen, onClose, onSelect }: AssetSelectorProps) {
  const { tokens, isLoading, error } = useTokens();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAssets = tokens.filter(
    (asset) =>
      asset.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] p-0 bg-gray-900">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-800">
          <DialogTitle className="text-xl font-semibold text-white">
            SELECT ASSET
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Select the token you want to create a pool.
          </DialogDescription>
        </DialogHeader>
        <div className="p-6">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search assets..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearchTerm(e.target.value)
              }
              className="pl-9 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-gray-600"
            />
          </div>
          <ScrollArea className="h-[300px]">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-400">Loading...</div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-red-400">Failed to load assets.</div>
              </div>
            ) : filteredAssets.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-400">No search results.</div>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredAssets.map((asset) => (
                  <button
                    key={asset.id}
                    className="w-full p-3 text-left rounded-lg transition-colors flex items-center gap-3 group hover:bg-gray-800/50 bg-gray-900 text-white border border-gray-800 focus:bg-gray-800"
                    onClick={() => {
                      onSelect(asset);
                      onClose();
                    }}
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm font-medium group-hover:bg-gray-600 transition-colors">
                      {asset.symbol[0]}
                    </div>
                    <div>
                      <div className="font-medium text-white">{asset.symbol}</div>
                      <div className="text-sm text-gray-400">{asset.name}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
