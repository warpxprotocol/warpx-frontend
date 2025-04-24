import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

import { AccountsTab } from './Tabs/AccountsTab';
import { AssetsTab } from './Tabs/AssetsTab';
import { LiquidityTab } from './Tabs/LiquidityTab';
import { MintTab } from './Tabs/MintTab';

type TabType = 'accounts' | 'assets' | 'mint' | 'liquidity';

interface DexModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DexModal = ({ isOpen, onClose }: DexModalProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('accounts');

  const tabs = useMemo(
    () => [
      { id: 'accounts', label: 'Accounts', component: <AccountsTab /> },
      { id: 'assets', label: 'Assets', component: <AssetsTab /> },
      { id: 'mint', label: 'Mint', component: <MintTab /> },
      { id: 'liquidity', label: 'Liquidity', component: <LiquidityTab /> },
    ],
    [],
  );

  const activeComponent = useMemo(
    () => tabs.find((tab) => tab.id === activeTab)?.component,
    [tabs, activeTab],
  );

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] text-black"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
    >
      <div className="bg-zinc-50 rounded-xl border border-zinc-200 w-full max-w-2xl relative shadow-2xl">
        {/* Modal Header */}
        <div className="border-b border-zinc-200 p-4 bg-zinc-100/80">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-zinc-900">DEX Testing Interface</h3>
            <button
              onClick={onClose}
              className="text-zinc-500 hover:text-zinc-700 hover:bg-zinc-200/50 p-2 rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-4 mt-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-600 border border-blue-100'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-4 max-h-[80vh] overflow-y-auto bg-zinc-50">{activeComponent}</div>
      </div>
    </div>,
    document.body,
  );
};
