export interface TestAccount {
  address: string;
  name: string;
  balance: string;
  assets: Array<{
    id: string;
    balance: string;
  }>;
  mnemonic: string;
}

export const DEFAULT_ACCOUNTS: TestAccount[] = [
  {
    address: '5GNJqTPyNqANBkUVMN1LPPrxXnFouWXoe2wNSmmEoLctxiZY',
    name: 'Alice',
    balance: '0',
    assets: [],
    mnemonic: 'bottom drive obey lake curtain smoke basket hold race lonely fit walk',
  },
  {
    address: '5HpG9w8EBLe5XCrbczpwq5TSXvedjrBGCwqxK1iQ7qUsSWFc',
    name: 'Bob',
    balance: '0',
    assets: [],
    mnemonic: 'bottom drive obey lake curtain smoke basket hold race lonely fit walk',
  },
  {
    address: '5Ck5SLSHYac6WFt5UZRSsdJjwmpSZq85fd5TRNAdZQVzEAPT',
    name: 'Charlie',
    balance: '0',
    assets: [],
    mnemonic: 'bottom drive obey lake curtain smoke basket hold race lonely fit walk',
  },
];
