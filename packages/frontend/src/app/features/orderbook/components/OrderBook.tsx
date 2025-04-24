import { mockOrderbookData } from '@/app/features/orderbook/mocks/orerbook';

export default function OrderbookView() {
  const { asks, bids, poolPrice } = mockOrderbookData;

  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      <div>
        <h2>🟥 Sell Orders (ASK)</h2>
        {asks.map((order, idx) => (
          <div key={idx} className="text-red-500 flex justify-between">
            <span>{order.price}</span>
            <span>{order.quantity}</span>
          </div>
        ))}
      </div>
      <div>
        <h2>🟩 Buy Orders (BID)</h2>
        {bids.map((order, idx) => (
          <div key={idx} className="text-green-500 flex justify-between">
            <span>{order.price}</span>
            <span>{order.quantity}</span>
          </div>
        ))}
      </div>
      <div className="col-span-2 text-center font-bold mt-4">
        🌀 Pool Price: {poolPrice}
      </div>
    </div>
  );
}
