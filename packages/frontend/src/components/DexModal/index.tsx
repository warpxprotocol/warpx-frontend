import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

import { AdminTab } from './Tabs/AdminTab';
import { AssetsTab } from './Tabs/AssetsTab';
import { MintTab } from './Tabs/MintTab';

type TabType = 'assets' | 'mint' | 'admin';

interface DexModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DexModal = ({ isOpen, onClose }: DexModalProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('assets');

  const tabs = useMemo(
    () => [
      { id: 'assets', label: 'Assets', component: <AssetsTab /> },
      { id: 'mint', label: 'Mint', component: <MintTab /> },
      { id: 'admin', label: 'Admin', component: <AdminTab /> },
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
      className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[9999]"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
    >
      <div className="bg-[#09090B]/90 rounded-xl border border-gray-800 w-full max-w-2xl relative shadow-2xl">
        {/* Modal Header */}
        <div className="border-b border-gray-800 p-4 bg-[#09090B]/90">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">DEX Testing Interface</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white hover:bg-gray-800/50 p-2 rounded-lg transition-colors"
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
                    ? 'bg-blue-900/50 text-blue-400 border border-blue-800'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-4 max-h-[80vh] overflow-y-auto bg-[#09090B]/90">
          {activeComponent}
        </div>
      </div>
    </div>,
    document.body,
  );
};
