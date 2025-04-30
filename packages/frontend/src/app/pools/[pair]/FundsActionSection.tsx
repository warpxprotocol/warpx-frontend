import React from 'react';

export default function FundsActionSection({
  baseAssetId,
  quoteAssetId,
}: {
  baseAssetId?: number;
  quoteAssetId?: number;
}) {
  return (
    <div className="flex flex-col gap-2 mt-1 w-full">
      <button className="w-full bg-[#18181B] text-xs text-white py-2 rounded font-semibold">
        Deposit
      </button>
      <button className="w-full bg-[#18181B] text-xs text-white py-2 rounded font-semibold">
        Perps ↔ Spot Transfer
      </button>
      <button className="w-full bg-[#18181B] text-xs text-white py-2 rounded font-semibold">
        Withdraw
      </button>
    </div>
  );
}
