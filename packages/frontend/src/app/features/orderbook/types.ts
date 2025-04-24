export type OrderEntry = {
  price: number;
  quantity: number;
};

export type OrderbookData = {
  asks: OrderEntry[];
  bids: OrderEntry[];
  lastPrice: number;
  poolPrice: number;
};
