import React from 'react';

export default function OrderTableSection() {
  return (
    <section className="bg-[#23232A] border border-gray-900 flex flex-col overflow-hidden">
      {/* 탭 */}
      <div className="flex flex-wrap gap-2 border-b border-gray-800 px-4 pt-2 pb-0 text-xs h-8 items-end">
        <button className="text-white font-semibold border-b-2 border-blue-500 pb-0.5">
          Open Orders
        </button>
        <button className="text-gray-400">Balances</button>
        <button className="text-gray-400">Positions</button>
        <button className="text-gray-400">TWAP</button>
        <button className="text-gray-400">Trade History</button>
        <button className="text-gray-400">Funding History</button>
        <button className="text-gray-400">Order History</button>
      </div>
      {/* 테이블 */}
      <div className="flex-1 overflow-auto">
        <table className="min-w-full text-xs text-gray-400">
          <thead className="bg-[#202027]">
            <tr>
              <th className="px-2 py-1 font-semibold">Time</th>
              <th className="px-2 py-1 font-semibold">Type</th>
              <th className="px-2 py-1 font-semibold">Coin</th>
              <th className="px-2 py-1 font-semibold">Direction</th>
              <th className="px-2 py-1 font-semibold">Size</th>
              <th className="px-2 py-1 font-semibold">Original Size</th>
              <th className="px-2 py-1 font-semibold">Order Value</th>
              <th className="px-2 py-1 font-semibold">Price</th>
              <th className="px-2 py-1 font-semibold">Reduce Only</th>
              <th className="px-2 py-1 font-semibold">Trigger Conditions</th>
              <th className="px-2 py-1 font-semibold">TP/SL</th>
              <th className="px-2 py-1 font-semibold">Cancel All</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={12} className="text-center py-4 text-xs text-gray-500">
                No open orders yet
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
