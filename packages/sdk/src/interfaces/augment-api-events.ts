// Auto-generated via `yarn polkadot-types-from-chain`, do not edit

/* eslint-disable */
// import type lookup before we augment - in some environments
// this is required to allow for ambient/previous definitions
import type { ApiTypes, AugmentedEvent } from '@polkadot/api-base/types';
import '@polkadot/api-base/types/events';
import type {
  Bytes,
  Null,
  Option,
  Result,
  Vec,
  bool,
  u8,
  u32,
  u64,
} from '@polkadot/types-codec';
import type { ITuple } from '@polkadot/types-codec/types';
import type { AccountId32, H256, Permill } from '@polkadot/types/interfaces/runtime';

export type __AugmentedEvent<ApiType extends ApiTypes> = AugmentedEvent<ApiType>;

declare module '@polkadot/api-base/types/events' {
  interface AugmentedEvents<ApiType extends ApiTypes> {
    assets: {
      /**
       * Accounts were destroyed for given asset.
       **/
      AccountsDestroyed: AugmentedEvent<
        ApiType,
        [assetId: u32, accountsDestroyed: u32, accountsRemaining: u32],
        { assetId: u32; accountsDestroyed: u32; accountsRemaining: u32 }
      >;
      /**
       * An approval for account `delegate` was cancelled by `owner`.
       **/
      ApprovalCancelled: AugmentedEvent<
        ApiType,
        [assetId: u32, owner: AccountId32, delegate: AccountId32],
        { assetId: u32; owner: AccountId32; delegate: AccountId32 }
      >;
      /**
       * Approvals were destroyed for given asset.
       **/
      ApprovalsDestroyed: AugmentedEvent<
        ApiType,
        [assetId: u32, approvalsDestroyed: u32, approvalsRemaining: u32],
        { assetId: u32; approvalsDestroyed: u32; approvalsRemaining: u32 }
      >;
      /**
       * (Additional) funds have been approved for transfer to a destination account.
       **/
      ApprovedTransfer: AugmentedEvent<
        ApiType,
        [assetId: u32, source: AccountId32, delegate: AccountId32, amount: u64],
        { assetId: u32; source: AccountId32; delegate: AccountId32; amount: u64 }
      >;
      /**
       * Some asset `asset_id` was frozen.
       **/
      AssetFrozen: AugmentedEvent<ApiType, [assetId: u32], { assetId: u32 }>;
      /**
       * The min_balance of an asset has been updated by the asset owner.
       **/
      AssetMinBalanceChanged: AugmentedEvent<
        ApiType,
        [assetId: u32, newMinBalance: u64],
        { assetId: u32; newMinBalance: u64 }
      >;
      /**
       * An asset has had its attributes changed by the `Force` origin.
       **/
      AssetStatusChanged: AugmentedEvent<ApiType, [assetId: u32], { assetId: u32 }>;
      /**
       * Some asset `asset_id` was thawed.
       **/
      AssetThawed: AugmentedEvent<ApiType, [assetId: u32], { assetId: u32 }>;
      /**
       * Some account `who` was blocked.
       **/
      Blocked: AugmentedEvent<
        ApiType,
        [assetId: u32, who: AccountId32],
        { assetId: u32; who: AccountId32 }
      >;
      /**
       * Some assets were destroyed.
       **/
      Burned: AugmentedEvent<
        ApiType,
        [assetId: u32, owner: AccountId32, balance: u64],
        { assetId: u32; owner: AccountId32; balance: u64 }
      >;
      /**
       * Some asset class was created.
       **/
      Created: AugmentedEvent<
        ApiType,
        [assetId: u32, creator: AccountId32, owner: AccountId32],
        { assetId: u32; creator: AccountId32; owner: AccountId32 }
      >;
      /**
       * An asset class was destroyed.
       **/
      Destroyed: AugmentedEvent<ApiType, [assetId: u32], { assetId: u32 }>;
      /**
       * An asset class is in the process of being destroyed.
       **/
      DestructionStarted: AugmentedEvent<ApiType, [assetId: u32], { assetId: u32 }>;
      /**
       * Some asset class was force-created.
       **/
      ForceCreated: AugmentedEvent<
        ApiType,
        [assetId: u32, owner: AccountId32],
        { assetId: u32; owner: AccountId32 }
      >;
      /**
       * Some account `who` was frozen.
       **/
      Frozen: AugmentedEvent<
        ApiType,
        [assetId: u32, who: AccountId32],
        { assetId: u32; who: AccountId32 }
      >;
      /**
       * Some assets were issued.
       **/
      Issued: AugmentedEvent<
        ApiType,
        [assetId: u32, owner: AccountId32, amount: u64],
        { assetId: u32; owner: AccountId32; amount: u64 }
      >;
      /**
       * Metadata has been cleared for an asset.
       **/
      MetadataCleared: AugmentedEvent<ApiType, [assetId: u32], { assetId: u32 }>;
      /**
       * New metadata has been set for an asset.
       **/
      MetadataSet: AugmentedEvent<
        ApiType,
        [assetId: u32, name: Bytes, symbol_: Bytes, decimals: u8, isFrozen: bool],
        { assetId: u32; name: Bytes; symbol: Bytes; decimals: u8; isFrozen: bool }
      >;
      /**
       * The owner changed.
       **/
      OwnerChanged: AugmentedEvent<
        ApiType,
        [assetId: u32, owner: AccountId32],
        { assetId: u32; owner: AccountId32 }
      >;
      /**
       * The management team changed.
       **/
      TeamChanged: AugmentedEvent<
        ApiType,
        [assetId: u32, issuer: AccountId32, admin: AccountId32, freezer: AccountId32],
        { assetId: u32; issuer: AccountId32; admin: AccountId32; freezer: AccountId32 }
      >;
      /**
       * Some account `who` was thawed.
       **/
      Thawed: AugmentedEvent<
        ApiType,
        [assetId: u32, who: AccountId32],
        { assetId: u32; who: AccountId32 }
      >;
      /**
       * Some account `who` was created with a deposit from `depositor`.
       **/
      Touched: AugmentedEvent<
        ApiType,
        [assetId: u32, who: AccountId32, depositor: AccountId32],
        { assetId: u32; who: AccountId32; depositor: AccountId32 }
      >;
      /**
       * Some assets were transferred.
       **/
      Transferred: AugmentedEvent<
        ApiType,
        [assetId: u32, from: AccountId32, to: AccountId32, amount: u64],
        { assetId: u32; from: AccountId32; to: AccountId32; amount: u64 }
      >;
      /**
       * An `amount` was transferred in its entirety from `owner` to `destination` by
       * the approved `delegate`.
       **/
      TransferredApproved: AugmentedEvent<
        ApiType,
        [
          assetId: u32,
          owner: AccountId32,
          delegate: AccountId32,
          destination: AccountId32,
          amount: u64,
        ],
        {
          assetId: u32;
          owner: AccountId32;
          delegate: AccountId32;
          destination: AccountId32;
          amount: u64;
        }
      >;
      /**
       * Generic event
       **/
      [key: string]: AugmentedEvent<ApiType>;
    };
    balances: {
      /**
       * A balance was set by root.
       **/
      BalanceSet: AugmentedEvent<
        ApiType,
        [who: AccountId32, free: u64],
        { who: AccountId32; free: u64 }
      >;
      /**
       * Some amount was burned from an account.
       **/
      Burned: AugmentedEvent<
        ApiType,
        [who: AccountId32, amount: u64],
        { who: AccountId32; amount: u64 }
      >;
      /**
       * Some amount was deposited (e.g. for transaction fees).
       **/
      Deposit: AugmentedEvent<
        ApiType,
        [who: AccountId32, amount: u64],
        { who: AccountId32; amount: u64 }
      >;
      /**
       * An account was removed whose balance was non-zero but below ExistentialDeposit,
       * resulting in an outright loss.
       **/
      DustLost: AugmentedEvent<
        ApiType,
        [account: AccountId32, amount: u64],
        { account: AccountId32; amount: u64 }
      >;
      /**
       * An account was created with some free balance.
       **/
      Endowed: AugmentedEvent<
        ApiType,
        [account: AccountId32, freeBalance: u64],
        { account: AccountId32; freeBalance: u64 }
      >;
      /**
       * Some balance was frozen.
       **/
      Frozen: AugmentedEvent<
        ApiType,
        [who: AccountId32, amount: u64],
        { who: AccountId32; amount: u64 }
      >;
      /**
       * Total issuance was increased by `amount`, creating a credit to be balanced.
       **/
      Issued: AugmentedEvent<ApiType, [amount: u64], { amount: u64 }>;
      /**
       * Some balance was locked.
       **/
      Locked: AugmentedEvent<
        ApiType,
        [who: AccountId32, amount: u64],
        { who: AccountId32; amount: u64 }
      >;
      /**
       * Some amount was minted into an account.
       **/
      Minted: AugmentedEvent<
        ApiType,
        [who: AccountId32, amount: u64],
        { who: AccountId32; amount: u64 }
      >;
      /**
       * Total issuance was decreased by `amount`, creating a debt to be balanced.
       **/
      Rescinded: AugmentedEvent<ApiType, [amount: u64], { amount: u64 }>;
      /**
       * Some balance was reserved (moved from free to reserved).
       **/
      Reserved: AugmentedEvent<
        ApiType,
        [who: AccountId32, amount: u64],
        { who: AccountId32; amount: u64 }
      >;
      /**
       * Some balance was moved from the reserve of the first account to the second account.
       * Final argument indicates the destination balance type.
       **/
      ReserveRepatriated: AugmentedEvent<
        ApiType,
        [
          from: AccountId32,
          to: AccountId32,
          amount: u64,
          destinationStatus: FrameSupportTokensMiscBalanceStatus,
        ],
        {
          from: AccountId32;
          to: AccountId32;
          amount: u64;
          destinationStatus: FrameSupportTokensMiscBalanceStatus;
        }
      >;
      /**
       * Some amount was restored into an account.
       **/
      Restored: AugmentedEvent<
        ApiType,
        [who: AccountId32, amount: u64],
        { who: AccountId32; amount: u64 }
      >;
      /**
       * Some amount was removed from the account (e.g. for misbehavior).
       **/
      Slashed: AugmentedEvent<
        ApiType,
        [who: AccountId32, amount: u64],
        { who: AccountId32; amount: u64 }
      >;
      /**
       * Some amount was suspended from an account (it can be restored later).
       **/
      Suspended: AugmentedEvent<
        ApiType,
        [who: AccountId32, amount: u64],
        { who: AccountId32; amount: u64 }
      >;
      /**
       * Some balance was thawed.
       **/
      Thawed: AugmentedEvent<
        ApiType,
        [who: AccountId32, amount: u64],
        { who: AccountId32; amount: u64 }
      >;
      /**
       * The `TotalIssuance` was forcefully changed.
       **/
      TotalIssuanceForced: AugmentedEvent<
        ApiType,
        [old: u64, new_: u64],
        { old: u64; new_: u64 }
      >;
      /**
       * Transfer succeeded.
       **/
      Transfer: AugmentedEvent<
        ApiType,
        [from: AccountId32, to: AccountId32, amount: u64],
        { from: AccountId32; to: AccountId32; amount: u64 }
      >;
      /**
       * Some balance was unlocked.
       **/
      Unlocked: AugmentedEvent<
        ApiType,
        [who: AccountId32, amount: u64],
        { who: AccountId32; amount: u64 }
      >;
      /**
       * Some balance was unreserved (moved from reserved to free).
       **/
      Unreserved: AugmentedEvent<
        ApiType,
        [who: AccountId32, amount: u64],
        { who: AccountId32; amount: u64 }
      >;
      /**
       * An account was upgraded.
       **/
      Upgraded: AugmentedEvent<ApiType, [who: AccountId32], { who: AccountId32 }>;
      /**
       * Some amount was withdrawn from the account (e.g. for transaction fees).
       **/
      Withdraw: AugmentedEvent<
        ApiType,
        [who: AccountId32, amount: u64],
        { who: AccountId32; amount: u64 }
      >;
      /**
       * Generic event
       **/
      [key: string]: AugmentedEvent<ApiType>;
    };
    grandpa: {
      /**
       * New authority set has been applied.
       **/
      NewAuthorities: AugmentedEvent<
        ApiType,
        [authoritySet: Vec<ITuple<[SpConsensusGrandpaAppPublic, u64]>>],
        { authoritySet: Vec<ITuple<[SpConsensusGrandpaAppPublic, u64]>> }
      >;
      /**
       * Current authority set has been paused.
       **/
      Paused: AugmentedEvent<ApiType, []>;
      /**
       * Current authority set has been resumed.
       **/
      Resumed: AugmentedEvent<ApiType, []>;
      /**
       * Generic event
       **/
      [key: string]: AugmentedEvent<ApiType>;
    };
    hybridOrderbook: {
      /**
       * A limit order has been placed.
       **/
      LimitOrder: AugmentedEvent<
        ApiType,
        [
          poolId: ITuple<
            [
              FrameSupportTokensFungibleUnionOfNativeOrWithId,
              FrameSupportTokensFungibleUnionOfNativeOrWithId,
            ]
          >,
          maker: AccountId32,
          orderPrice: u64,
          orderQuantity: u64,
          isBid: bool,
        ],
        {
          poolId: ITuple<
            [
              FrameSupportTokensFungibleUnionOfNativeOrWithId,
              FrameSupportTokensFungibleUnionOfNativeOrWithId,
            ]
          >;
          maker: AccountId32;
          orderPrice: u64;
          orderQuantity: u64;
          isBid: bool;
        }
      >;
      /**
       * A limit order has been placed.
       **/
      LimitOrderPlaced: AugmentedEvent<
        ApiType,
        [
          maker: AccountId32,
          orderPrice: u64,
          poolId: ITuple<
            [
              FrameSupportTokensFungibleUnionOfNativeOrWithId,
              FrameSupportTokensFungibleUnionOfNativeOrWithId,
            ]
          >,
          orderId: u64,
          orderQuantity: u64,
          isBid: bool,
        ],
        {
          maker: AccountId32;
          orderPrice: u64;
          poolId: ITuple<
            [
              FrameSupportTokensFungibleUnionOfNativeOrWithId,
              FrameSupportTokensFungibleUnionOfNativeOrWithId,
            ]
          >;
          orderId: u64;
          orderQuantity: u64;
          isBid: bool;
        }
      >;
      /**
       * A successful call of the `AddLiquidity` extrinsic will create this event.
       **/
      LiquidityAdded: AugmentedEvent<
        ApiType,
        [
          who: AccountId32,
          mintTo: AccountId32,
          poolId: ITuple<
            [
              FrameSupportTokensFungibleUnionOfNativeOrWithId,
              FrameSupportTokensFungibleUnionOfNativeOrWithId,
            ]
          >,
          baseAssetProvided: u64,
          quoteAssetProvided: u64,
          lpToken: u32,
          lpTokenMinted: u64,
        ],
        {
          who: AccountId32;
          mintTo: AccountId32;
          poolId: ITuple<
            [
              FrameSupportTokensFungibleUnionOfNativeOrWithId,
              FrameSupportTokensFungibleUnionOfNativeOrWithId,
            ]
          >;
          baseAssetProvided: u64;
          quoteAssetProvided: u64;
          lpToken: u32;
          lpTokenMinted: u64;
        }
      >;
      /**
       * A successful call of the `RemoveLiquidity` extrinsic will create this event.
       **/
      LiquidityRemoved: AugmentedEvent<
        ApiType,
        [
          who: AccountId32,
          withdrawTo: AccountId32,
          poolId: ITuple<
            [
              FrameSupportTokensFungibleUnionOfNativeOrWithId,
              FrameSupportTokensFungibleUnionOfNativeOrWithId,
            ]
          >,
          baseAssetAmount: u64,
          quoteAssetAmount: u64,
          lpToken: u32,
          lpTokenBurned: u64,
          withdrawalFee: Permill,
        ],
        {
          who: AccountId32;
          withdrawTo: AccountId32;
          poolId: ITuple<
            [
              FrameSupportTokensFungibleUnionOfNativeOrWithId,
              FrameSupportTokensFungibleUnionOfNativeOrWithId,
            ]
          >;
          baseAssetAmount: u64;
          quoteAssetAmount: u64;
          lpToken: u32;
          lpTokenBurned: u64;
          withdrawalFee: Permill;
        }
      >;
      /**
       * A market order has been placed.
       **/
      MarketOrder: AugmentedEvent<ApiType, [taker: AccountId32], { taker: AccountId32 }>;
      /**
       * An order has been cancelled.
       **/
      OrderCancelled: AugmentedEvent<
        ApiType,
        [
          poolId: ITuple<
            [
              FrameSupportTokensFungibleUnionOfNativeOrWithId,
              FrameSupportTokensFungibleUnionOfNativeOrWithId,
            ]
          >,
          owner: AccountId32,
          orderId: u64,
        ],
        {
          poolId: ITuple<
            [
              FrameSupportTokensFungibleUnionOfNativeOrWithId,
              FrameSupportTokensFungibleUnionOfNativeOrWithId,
            ]
          >;
          owner: AccountId32;
          orderId: u64;
        }
      >;
      OrderMatched: AugmentedEvent<
        ApiType,
        [orderer: AccountId32, filled: u64, isBid: bool],
        { orderer: AccountId32; filled: u64; isBid: bool }
      >;
      /**
       * A successful call of the `CreatePool` extrinsic will create this event.
       **/
      PoolCreated: AugmentedEvent<
        ApiType,
        [
          creator: AccountId32,
          poolId: ITuple<
            [
              FrameSupportTokensFungibleUnionOfNativeOrWithId,
              FrameSupportTokensFungibleUnionOfNativeOrWithId,
            ]
          >,
          poolAccount: AccountId32,
          lpToken: u32,
          takerFeeRate: Permill,
          tickSize: u64,
          lotSize: u64,
        ],
        {
          creator: AccountId32;
          poolId: ITuple<
            [
              FrameSupportTokensFungibleUnionOfNativeOrWithId,
              FrameSupportTokensFungibleUnionOfNativeOrWithId,
            ]
          >;
          poolAccount: AccountId32;
          lpToken: u32;
          takerFeeRate: Permill;
          tickSize: u64;
          lotSize: u64;
        }
      >;
      /**
       * Assets have been converted from one to another.
       **/
      SwapCreditExecuted: AugmentedEvent<
        ApiType,
        [
          amountIn: u64,
          amountOut: u64,
          path: Vec<ITuple<[FrameSupportTokensFungibleUnionOfNativeOrWithId, u64]>>,
        ],
        {
          amountIn: u64;
          amountOut: u64;
          path: Vec<ITuple<[FrameSupportTokensFungibleUnionOfNativeOrWithId, u64]>>;
        }
      >;
      /**
       * Assets have been converted from one to another. Both `SwapExactTokenForToken`
       * and `SwapTokenForExactToken` will generate this event.
       **/
      SwapExecuted: AugmentedEvent<
        ApiType,
        [
          who: AccountId32,
          sendTo: AccountId32,
          amountIn: u64,
          amountOut: u64,
          path: Vec<ITuple<[FrameSupportTokensFungibleUnionOfNativeOrWithId, u64]>>,
        ],
        {
          who: AccountId32;
          sendTo: AccountId32;
          amountIn: u64;
          amountOut: u64;
          path: Vec<ITuple<[FrameSupportTokensFungibleUnionOfNativeOrWithId, u64]>>;
        }
      >;
      /**
       * Pool has been touched in order to fulfill operational requirements.
       **/
      Touched: AugmentedEvent<
        ApiType,
        [
          poolId: ITuple<
            [
              FrameSupportTokensFungibleUnionOfNativeOrWithId,
              FrameSupportTokensFungibleUnionOfNativeOrWithId,
            ]
          >,
          who: AccountId32,
        ],
        {
          poolId: ITuple<
            [
              FrameSupportTokensFungibleUnionOfNativeOrWithId,
              FrameSupportTokensFungibleUnionOfNativeOrWithId,
            ]
          >;
          who: AccountId32;
        }
      >;
      /**
       * Generic event
       **/
      [key: string]: AugmentedEvent<ApiType>;
    };
    poolAssets: {
      /**
       * Accounts were destroyed for given asset.
       **/
      AccountsDestroyed: AugmentedEvent<
        ApiType,
        [assetId: u32, accountsDestroyed: u32, accountsRemaining: u32],
        { assetId: u32; accountsDestroyed: u32; accountsRemaining: u32 }
      >;
      /**
       * An approval for account `delegate` was cancelled by `owner`.
       **/
      ApprovalCancelled: AugmentedEvent<
        ApiType,
        [assetId: u32, owner: AccountId32, delegate: AccountId32],
        { assetId: u32; owner: AccountId32; delegate: AccountId32 }
      >;
      /**
       * Approvals were destroyed for given asset.
       **/
      ApprovalsDestroyed: AugmentedEvent<
        ApiType,
        [assetId: u32, approvalsDestroyed: u32, approvalsRemaining: u32],
        { assetId: u32; approvalsDestroyed: u32; approvalsRemaining: u32 }
      >;
      /**
       * (Additional) funds have been approved for transfer to a destination account.
       **/
      ApprovedTransfer: AugmentedEvent<
        ApiType,
        [assetId: u32, source: AccountId32, delegate: AccountId32, amount: u64],
        { assetId: u32; source: AccountId32; delegate: AccountId32; amount: u64 }
      >;
      /**
       * Some asset `asset_id` was frozen.
       **/
      AssetFrozen: AugmentedEvent<ApiType, [assetId: u32], { assetId: u32 }>;
      /**
       * The min_balance of an asset has been updated by the asset owner.
       **/
      AssetMinBalanceChanged: AugmentedEvent<
        ApiType,
        [assetId: u32, newMinBalance: u64],
        { assetId: u32; newMinBalance: u64 }
      >;
      /**
       * An asset has had its attributes changed by the `Force` origin.
       **/
      AssetStatusChanged: AugmentedEvent<ApiType, [assetId: u32], { assetId: u32 }>;
      /**
       * Some asset `asset_id` was thawed.
       **/
      AssetThawed: AugmentedEvent<ApiType, [assetId: u32], { assetId: u32 }>;
      /**
       * Some account `who` was blocked.
       **/
      Blocked: AugmentedEvent<
        ApiType,
        [assetId: u32, who: AccountId32],
        { assetId: u32; who: AccountId32 }
      >;
      /**
       * Some assets were destroyed.
       **/
      Burned: AugmentedEvent<
        ApiType,
        [assetId: u32, owner: AccountId32, balance: u64],
        { assetId: u32; owner: AccountId32; balance: u64 }
      >;
      /**
       * Some asset class was created.
       **/
      Created: AugmentedEvent<
        ApiType,
        [assetId: u32, creator: AccountId32, owner: AccountId32],
        { assetId: u32; creator: AccountId32; owner: AccountId32 }
      >;
      /**
       * An asset class was destroyed.
       **/
      Destroyed: AugmentedEvent<ApiType, [assetId: u32], { assetId: u32 }>;
      /**
       * An asset class is in the process of being destroyed.
       **/
      DestructionStarted: AugmentedEvent<ApiType, [assetId: u32], { assetId: u32 }>;
      /**
       * Some asset class was force-created.
       **/
      ForceCreated: AugmentedEvent<
        ApiType,
        [assetId: u32, owner: AccountId32],
        { assetId: u32; owner: AccountId32 }
      >;
      /**
       * Some account `who` was frozen.
       **/
      Frozen: AugmentedEvent<
        ApiType,
        [assetId: u32, who: AccountId32],
        { assetId: u32; who: AccountId32 }
      >;
      /**
       * Some assets were issued.
       **/
      Issued: AugmentedEvent<
        ApiType,
        [assetId: u32, owner: AccountId32, amount: u64],
        { assetId: u32; owner: AccountId32; amount: u64 }
      >;
      /**
       * Metadata has been cleared for an asset.
       **/
      MetadataCleared: AugmentedEvent<ApiType, [assetId: u32], { assetId: u32 }>;
      /**
       * New metadata has been set for an asset.
       **/
      MetadataSet: AugmentedEvent<
        ApiType,
        [assetId: u32, name: Bytes, symbol_: Bytes, decimals: u8, isFrozen: bool],
        { assetId: u32; name: Bytes; symbol: Bytes; decimals: u8; isFrozen: bool }
      >;
      /**
       * The owner changed.
       **/
      OwnerChanged: AugmentedEvent<
        ApiType,
        [assetId: u32, owner: AccountId32],
        { assetId: u32; owner: AccountId32 }
      >;
      /**
       * The management team changed.
       **/
      TeamChanged: AugmentedEvent<
        ApiType,
        [assetId: u32, issuer: AccountId32, admin: AccountId32, freezer: AccountId32],
        { assetId: u32; issuer: AccountId32; admin: AccountId32; freezer: AccountId32 }
      >;
      /**
       * Some account `who` was thawed.
       **/
      Thawed: AugmentedEvent<
        ApiType,
        [assetId: u32, who: AccountId32],
        { assetId: u32; who: AccountId32 }
      >;
      /**
       * Some account `who` was created with a deposit from `depositor`.
       **/
      Touched: AugmentedEvent<
        ApiType,
        [assetId: u32, who: AccountId32, depositor: AccountId32],
        { assetId: u32; who: AccountId32; depositor: AccountId32 }
      >;
      /**
       * Some assets were transferred.
       **/
      Transferred: AugmentedEvent<
        ApiType,
        [assetId: u32, from: AccountId32, to: AccountId32, amount: u64],
        { assetId: u32; from: AccountId32; to: AccountId32; amount: u64 }
      >;
      /**
       * An `amount` was transferred in its entirety from `owner` to `destination` by
       * the approved `delegate`.
       **/
      TransferredApproved: AugmentedEvent<
        ApiType,
        [
          assetId: u32,
          owner: AccountId32,
          delegate: AccountId32,
          destination: AccountId32,
          amount: u64,
        ],
        {
          assetId: u32;
          owner: AccountId32;
          delegate: AccountId32;
          destination: AccountId32;
          amount: u64;
        }
      >;
      /**
       * Generic event
       **/
      [key: string]: AugmentedEvent<ApiType>;
    };
    sudo: {
      /**
       * The sudo key has been updated.
       **/
      KeyChanged: AugmentedEvent<
        ApiType,
        [old: Option<AccountId32>, new_: AccountId32],
        { old: Option<AccountId32>; new_: AccountId32 }
      >;
      /**
       * The key was permanently removed.
       **/
      KeyRemoved: AugmentedEvent<ApiType, []>;
      /**
       * A sudo call just took place.
       **/
      Sudid: AugmentedEvent<
        ApiType,
        [sudoResult: Result<Null, SpRuntimeDispatchError>],
        { sudoResult: Result<Null, SpRuntimeDispatchError> }
      >;
      /**
       * A [sudo_as](Pallet::sudo_as) call just took place.
       **/
      SudoAsDone: AugmentedEvent<
        ApiType,
        [sudoResult: Result<Null, SpRuntimeDispatchError>],
        { sudoResult: Result<Null, SpRuntimeDispatchError> }
      >;
      /**
       * Generic event
       **/
      [key: string]: AugmentedEvent<ApiType>;
    };
    system: {
      /**
       * `:code` was updated.
       **/
      CodeUpdated: AugmentedEvent<ApiType, []>;
      /**
       * An extrinsic failed.
       **/
      ExtrinsicFailed: AugmentedEvent<
        ApiType,
        [
          dispatchError: SpRuntimeDispatchError,
          dispatchInfo: FrameSupportDispatchDispatchInfo,
        ],
        {
          dispatchError: SpRuntimeDispatchError;
          dispatchInfo: FrameSupportDispatchDispatchInfo;
        }
      >;
      /**
       * An extrinsic completed successfully.
       **/
      ExtrinsicSuccess: AugmentedEvent<
        ApiType,
        [dispatchInfo: FrameSupportDispatchDispatchInfo],
        { dispatchInfo: FrameSupportDispatchDispatchInfo }
      >;
      /**
       * An account was reaped.
       **/
      KilledAccount: AugmentedEvent<
        ApiType,
        [account: AccountId32],
        { account: AccountId32 }
      >;
      /**
       * A new account was created.
       **/
      NewAccount: AugmentedEvent<ApiType, [account: AccountId32], { account: AccountId32 }>;
      /**
       * On on-chain remark happened.
       **/
      Remarked: AugmentedEvent<
        ApiType,
        [sender: AccountId32, hash_: H256],
        { sender: AccountId32; hash_: H256 }
      >;
      /**
       * An upgrade was authorized.
       **/
      UpgradeAuthorized: AugmentedEvent<
        ApiType,
        [codeHash: H256, checkVersion: bool],
        { codeHash: H256; checkVersion: bool }
      >;
      /**
       * Generic event
       **/
      [key: string]: AugmentedEvent<ApiType>;
    };
    transactionPayment: {
      /**
       * A transaction fee `actual_fee`, of which `tip` was added to the minimum inclusion fee,
       * has been paid by `who`.
       **/
      TransactionFeePaid: AugmentedEvent<
        ApiType,
        [who: AccountId32, actualFee: u64, tip: u64],
        { who: AccountId32; actualFee: u64; tip: u64 }
      >;
      /**
       * Generic event
       **/
      [key: string]: AugmentedEvent<ApiType>;
    };
  } // AugmentedEvents
} // declare module
