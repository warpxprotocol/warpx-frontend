import { useState } from 'react';

export const LiquidityTab = () => {
  const [operation, setOperation] = useState<'add' | 'remove'>('add');
  const [amount1, setAmount1] = useState('');
  const [amount2, setAmount2] = useState('');
  const [selectedPair, setSelectedPair] = useState('');

  const handleLiquidityOperation = () => {
    // TODO: Implement liquidity operation logic
    console.log('Liquidity operation:', {
      operation,
      amount1,
      amount2,
      selectedPair,
    });
  };

  return (
    <div className="space-y-4">
      <h4 className="text-lg font-medium text-zinc-900">Liquidity Operations</h4>
      <div className="bg-zinc-100/80 rounded-lg p-4 border border-zinc-200">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Operation Type
            </label>
            <div className="flex space-x-4">
              <button
                onClick={() => setOperation('add')}
                className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                  operation === 'add'
                    ? 'bg-blue-600 text-white'
                    : 'bg-zinc-200 text-zinc-700 hover:bg-zinc-300'
                }`}
              >
                Add Liquidity
              </button>
              <button
                onClick={() => setOperation('remove')}
                className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                  operation === 'remove'
                    ? 'bg-blue-600 text-white'
                    : 'bg-zinc-200 text-zinc-700 hover:bg-zinc-300'
                }`}
              >
                Remove Liquidity
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Select Pair
            </label>
            <select
              value={selectedPair}
              onChange={(e) => setSelectedPair(e.target.value)}
              className="w-full p-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a trading pair</option>
              {/* TODO: Add trading pair options */}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-700">Amount 1</label>
            <input
              type="number"
              value={amount1}
              onChange={(e) => setAmount1(e.target.value)}
              placeholder="Enter amount"
              className="w-full p-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-700">Amount 2</label>
            <input
              type="number"
              value={amount2}
              onChange={(e) => setAmount2(e.target.value)}
              placeholder="Enter amount"
              className="w-full p-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <button
            onClick={handleLiquidityOperation}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {operation === 'add' ? 'Add Liquidity' : 'Remove Liquidity'}
          </button>
        </div>
      </div>
    </div>
  );
};
