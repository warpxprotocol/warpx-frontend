// Auto-generated via `yarn polkadot-types-from-chain`, do not edit
/* eslint-disable */

// import type lookup before we augment - in some environments
// this is required to allow for ambient/previous definitions
import '@polkadot/api-base/types/submittable';

import type { ApiTypes, AugmentedSubmittable, SubmittableExtrinsic, SubmittableExtrinsicFunction } from '@polkadot/api-base/types';
import type { Bytes, Compact, Option, Vec, bool, u128, u32, u64, u8 } from '@polkadot/types-codec';
import type { AnyNumber, IMethod, ITuple } from '@polkadot/types-codec/types';
import type { AccountId32, Call, H256, MultiAddress, Permill } from '@polkadot/types/interfaces/runtime';
import type { CumulusPrimitivesCoreAggregateMessageOrigin, CumulusPrimitivesParachainInherentParachainInherentData, FrameSupportTokensFungibleUnionOfNativeOrWithId, PalletBalancesAdjustmentDirection, SpWeightsWeightV2Weight, StagingXcmExecutorAssetTransferTransferType, StagingXcmV5Location, WarpxRuntimeSessionKeys, XcmV3WeightLimit, XcmVersionedAssetId, XcmVersionedAssets, XcmVersionedLocation, XcmVersionedXcm } from '@polkadot/types/lookup';

export type __AugmentedSubmittable = AugmentedSubmittable<() => unknown>;
export type __SubmittableExtrinsic<ApiType extends ApiTypes> = SubmittableExtrinsic<ApiType>;
export type __SubmittableExtrinsicFunction<ApiType extends ApiTypes> = SubmittableExtrinsicFunction<ApiType>;

declare module '@polkadot/api-base/types/submittable' {
  interface AugmentedSubmittables<ApiType extends ApiTypes> {
    assets: {
      /**
       * Approve an amount of asset for transfer by a delegated third-party account.
       * 
       * Origin must be Signed.
       * 
       * Ensures that `ApprovalDeposit` worth of `Currency` is reserved from signing account
       * for the purpose of holding the approval. If some non-zero amount of assets is already
       * approved from signing account to `delegate`, then it is topped up or unreserved to
       * meet the right value.
       * 
       * NOTE: The signing account does not need to own `amount` of assets at the point of
       * making this call.
       * 
       * - `id`: The identifier of the asset.
       * - `delegate`: The account to delegate permission to transfer asset.
       * - `amount`: The amount of asset that may be transferred by `delegate`. If there is
       * already an approval in place, then this acts additively.
       * 
       * Emits `ApprovedTransfer` on success.
       * 
       * Weight: `O(1)`
       **/
      approveTransfer: AugmentedSubmittable<(id: Compact<u32> | AnyNumber | Uint8Array, delegate: MultiAddress | { Id: any } | { Index: any } | { Raw: any } | { Address32: any } | { Address20: any } | string | Uint8Array, amount: Compact<u128> | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>, [Compact<u32>, MultiAddress, Compact<u128>]>;
      /**
       * Disallow further unprivileged transfers of an asset `id` to and from an account `who`.
       * 
       * Origin must be Signed and the sender should be the Freezer of the asset `id`.
       * 
       * - `id`: The identifier of the account's asset.
       * - `who`: The account to be unblocked.
       * 
       * Emits `Blocked`.
       * 
       * Weight: `O(1)`
       **/
      block: AugmentedSubmittable<(id: Compact<u32> | AnyNumber | Uint8Array, who: MultiAddress | { Id: any } | { Index: any } | { Raw: any } | { Address32: any } | { Address20: any } | string | Uint8Array) => SubmittableExtrinsic<ApiType>, [Compact<u32>, MultiAddress]>;
      /**
       * Reduce the balance of `who` by as much as possible up to `amount` assets of `id`.
       * 
       * Origin must be Signed and the sender should be the Manager of the asset `id`.
       * 
       * Bails with `NoAccount` if the `who` is already dead.
       * 
       * - `id`: The identifier of the asset to have some amount burned.
       * - `who`: The account to be debited from.
       * - `amount`: The maximum amount by which `who`'s balance should be reduced.
       * 
       * Emits `Burned` with the actual amount burned. If this takes the balance to below the
       * minimum for the asset, then the amount burned is increased to take it to zero.
       * 
       * Weight: `O(1)`
       * Modes: Post-existence of `who`; Pre & post Zombie-status of `who`.
       **/
      burn: AugmentedSubmittable<(id: Compact<u32> | AnyNumber | Uint8Array, who: MultiAddress | { Id: any } | { Index: any } | { Raw: any } | { Address32: any } | { Address20: any } | string | Uint8Array, amount: Compact<u128> | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>, [Compact<u32>, MultiAddress, Compact<u128>]>;
      /**
       * Cancel all of some asset approved for delegated transfer by a third-party account.
       * 
       * Origin must be Signed and there must be an approval in place between signer and
       * `delegate`.
       * 
       * Unreserves any deposit previously reserved by `approve_transfer` for the approval.
       * 
       * - `id`: The identifier of the asset.
       * - `delegate`: The account delegated permission to transfer asset.
       * 
       * Emits `ApprovalCancelled` on success.
       * 
       * Weight: `O(1)`
       **/
      cancelApproval: AugmentedSubmittable<(id: Compact<u32> | AnyNumber | Uint8Array, delegate: MultiAddress | { Id: any } | { Index: any } | { Raw: any } | { Address32: any } | { Address20: any } | string | Uint8Array) => SubmittableExtrinsic<ApiType>, [Compact<u32>, MultiAddress]>;
      /**
       * Clear the metadata for an asset.
       * 
       * Origin must be Signed and the sender should be the Owner of the asset `id`.
       * 
       * Any deposit is freed for the asset owner.
       * 
       * - `id`: The identifier of the asset to clear.
       * 
       * Emits `MetadataCleared`.
       * 
       * Weight: `O(1)`
       **/
      clearMetadata: AugmentedSubmittable<(id: Compact<u32> | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>, [Compact<u32>]>;
      /**
       * Issue a new class of fungible assets from a public origin.
       * 
       * This new asset class has no assets initially and its owner is the origin.
       * 
       * The origin must conform to the configured `CreateOrigin` and have sufficient funds free.
       * 
       * Funds of sender are reserved by `AssetDeposit`.
       * 
       * Parameters:
       * - `id`: The identifier of the new asset. This must not be currently in use to identify
       * an existing asset. If [`NextAssetId`] is set, then this must be equal to it.
       * - `admin`: The admin of this class of assets. The admin is the initial address of each
       * member of the asset class's admin team.
       * - `min_balance`: The minimum balance of this new asset that any single account must
       * have. If an account's balance is reduced below this, then it collapses to zero.
       * 
       * Emits `Created` event when successful.
       * 
       * Weight: `O(1)`
       **/
      create: AugmentedSubmittable<(id: Compact<u32> | AnyNumber | Uint8Array, admin: MultiAddress | { Id: any } | { Index: any } | { Raw: any } | { Address32: any } | { Address20: any } | string | Uint8Array, minBalance: u128 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>, [Compact<u32>, MultiAddress, u128]>;
      /**
       * Destroy all accounts associated with a given asset.
       * 
       * `destroy_accounts` should only be called after `start_destroy` has been called, and the
       * asset is in a `Destroying` state.
       * 
       * Due to weight restrictions, this function may need to be called multiple times to fully
       * destroy all accounts. It will destroy `RemoveItemsLimit` accounts at a time.
       * 
       * - `id`: The identifier of the asset to be destroyed. This must identify an existing
       * asset.
       * 
       * Each call emits the `Event::DestroyedAccounts` event.
       **/
      destroyAccounts: AugmentedSubmittable<(id: Compact<u32> | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>, [Compact<u32>]>;
      /**
       * Destroy all approvals associated with a given asset up to the max (T::RemoveItemsLimit).
       * 
       * `destroy_approvals` should only be called after `start_destroy` has been called, and the
       * asset is in a `Destroying` state.
       * 
       * Due to weight restrictions, this function may need to be called multiple times to fully
       * destroy all approvals. It will destroy `RemoveItemsLimit` approvals at a time.
       * 
       * - `id`: The identifier of the asset to be destroyed. This must identify an existing
       * asset.
       * 
       * Each call emits the `Event::DestroyedApprovals` event.
       **/
      destroyApprovals: AugmentedSubmittable<(id: Compact<u32> | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>, [Compact<u32>]>;
      /**
       * Complete destroying asset and unreserve currency.
       * 
       * `finish_destroy` should only be called after `start_destroy` has been called, and the
       * asset is in a `Destroying` state. All accounts or approvals should be destroyed before
       * hand.
       * 
       * - `id`: The identifier of the asset to be destroyed. This must identify an existing
       * asset.
       * 
       * Each successful call emits the `Event::Destroyed` event.
       **/
      finishDestroy: AugmentedSubmittable<(id: Compact<u32> | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>, [Compact<u32>]>;
      /**
       * Alter the attributes of a given asset.
       * 
       * Origin must be `ForceOrigin`.
       * 
       * - `id`: The identifier of the asset.
       * - `owner`: The new Owner of this asset.
       * - `issuer`: The new Issuer of this asset.
       * - `admin`: The new Admin of this asset.
       * - `freezer`: The new Freezer of this asset.
       * - `min_balance`: The minimum balance of this new asset that any single account must
       * have. If an account's balance is reduced below this, then it collapses to zero.
       * - `is_sufficient`: Whether a non-zero balance of this asset is deposit of sufficient
       * value to account for the state bloat associated with its balance storage. If set to
       * `true`, then non-zero balances may be stored without a `consumer` reference (and thus
       * an ED in the Balances pallet or whatever else is used to control user-account state
       * growth).
       * - `is_frozen`: Whether this asset class is frozen except for permissioned/admin
       * instructions.
       * 
       * Emits `AssetStatusChanged` with the identity of the asset.
       * 
       * Weight: `O(1)`
       **/
      forceAssetStatus: AugmentedSubmittable<(id: Compact<u32> | AnyNumber | Uint8Array, owner: MultiAddress | { Id: any } | { Index: any } | { Raw: any } | { Address32: any } | { Address20: any } | string | Uint8Array, issuer: MultiAddress | { Id: any } | { Index: any } | { Raw: any } | { Address32: any } | { Address20: any } | string | Uint8Array, admin: MultiAddress | { Id: any } | { Index: any } | { Raw: any } | { Address32: any } | { Address20: any } | string | Uint8Array, freezer: MultiAddress | { Id: any } | { Index: any } | { Raw: any } | { Address32: any } | { Address20: any } | string | Uint8Array, minBalance: Compact<u128> | AnyNumber | Uint8Array, isSufficient: bool | boolean | Uint8Array, isFrozen: bool | boolean | Uint8Array) => SubmittableExtrinsic<ApiType>, [Compact<u32>, MultiAddress, MultiAddress, MultiAddress, MultiAddress, Compact<u128>, bool, bool]>;
      /**
       * Cancel all of some asset approved for delegated transfer by a third-party account.
       * 
       * Origin must be either ForceOrigin or Signed origin with the signer being the Admin
       * account of the asset `id`.
       * 
       * Unreserves any deposit previously reserved by `approve_transfer` for the approval.
       * 
       * - `id`: The identifier of the asset.
       * - `delegate`: The account delegated permission to transfer asset.
       * 
       * Emits `ApprovalCancelled` on success.
       * 
       * Weight: `O(1)`
       **/
      forceCancelApproval: AugmentedSubmittable<(id: Compact<u32> | AnyNumber | Uint8Array, owner: MultiAddress | { Id: any } | { Index: any } | { Raw: any } | { Address32: any } | { Address20: any } | string | Uint8Array, delegate: MultiAddress | { Id: any } | { Index: any } | { Raw: any } | { Address32: any } | { Address20: any } | string | Uint8Array) => SubmittableExtrinsic<ApiType>, [Compact<u32>, MultiAddress, MultiAddress]>;
      /**
       * Clear the metadata for an asset.
       * 
       * Origin must be ForceOrigin.
       * 
       * Any deposit is returned.
       * 
       * - `id`: The identifier of the asset to clear.
       * 
       * Emits `MetadataCleared`.
       * 
       * Weight: `O(1)`
       **/
      forceClearMetadata: AugmentedSubmittable<(id: Compact<u32> | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>, [Compact<u32>]>;
      /**
       * Issue a new class of fungible assets from a privileged origin.
       * 
       * This new asset class has no assets initially.
       * 
       * The origin must conform to `ForceOrigin`.
       * 
       * Unlike `create`, no funds are reserved.
       * 
       * - `id`: The identifier of the new asset. This must not be currently in use to identify
       * an existing asset. If [`NextAssetId`] is set, then this must be equal to it.
       * - `owner`: The owner of this class of assets. The owner has full superuser permissions
       * over this asset, but may later change and configure the permissions using
       * `transfer_ownership` and `set_team`.
       * - `min_balance`: The minimum balance of this new asset that any single account must
       * have. If an account's balance is reduced below this, then it collapses to zero.
       * 
       * Emits `ForceCreated` event when successful.
       * 
       * Weight: `O(1)`
       **/
      forceCreate: AugmentedSubmittable<(id: Compact<u32> | AnyNumber | Uint8Array, owner: MultiAddress | { Id: any } | { Index: any } | { Raw: any } | { Address32: any } | { Address20: any } | string | Uint8Array, isSufficient: bool | boolean | Uint8Array, minBalance: Compact<u128> | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>, [Compact<u32>, MultiAddress, bool, Compact<u128>]>;
      /**
       * Force the metadata for an asset to some value.
       * 
       * Origin must be ForceOrigin.
       * 
       * Any deposit is left alone.
       * 
       * - `id`: The identifier of the asset to update.
       * - `name`: The user friendly name of this asset. Limited in length by `StringLimit`.
       * - `symbol`: The exchange symbol for this asset. Limited in length by `StringLimit`.
       * - `decimals`: The number of decimals this asset uses to represent one unit.
       * 
       * Emits `MetadataSet`.
       * 
       * Weight: `O(N + S)` where N and S are the length of the name and symbol respectively.
       **/
      forceSetMetadata: AugmentedSubmittable<(id: Compact<u32> | AnyNumber | Uint8Array, name: Bytes | string | Uint8Array, symbol: Bytes | string | Uint8Array, decimals: u8 | AnyNumber | Uint8Array, isFrozen: bool | boolean | Uint8Array) => SubmittableExtrinsic<ApiType>, [Compact<u32>, Bytes, Bytes, u8, bool]>;
      /**
       * Move some assets from one account to another.
       * 
       * Origin must be Signed and the sender should be the Admin of the asset `id`.
       * 
       * - `id`: The identifier of the asset to have some amount transferred.
       * - `source`: The account to be debited.
       * - `dest`: The account to be credited.
       * - `amount`: The amount by which the `source`'s balance of assets should be reduced and
       * `dest`'s balance increased. The amount actually transferred may be slightly greater in
       * the case that the transfer would otherwise take the `source` balance above zero but
       * below the minimum balance. Must be greater than zero.
       * 
       * Emits `Transferred` with the actual amount transferred. If this takes the source balance
       * to below the minimum for the asset, then the amount transferred is increased to take it
       * to zero.
       * 
       * Weight: `O(1)`
       * Modes: Pre-existence of `dest`; Post-existence of `source`; Account pre-existence of
       * `dest`.
       **/
      forceTransfer: AugmentedSubmittable<(id: Compact<u32> | AnyNumber | Uint8Array, source: MultiAddress | { Id: any } | { Index: any } | { Raw: any } | { Address32: any } | { Address20: any } | string | Uint8Array, dest: MultiAddress | { Id: any } | { Index: any } | { Raw: any } | { Address32: any } | { Address20: any } | string | Uint8Array, amount: Compact<u128> | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>, [Compact<u32>, MultiAddress, MultiAddress, Compact<u128>]>;
      /**
       * Disallow further unprivileged transfers of an asset `id` from an account `who`. `who`
       * must already exist as an entry in `Account`s of the asset. If you want to freeze an
       * account that does not have an entry, use `touch_other` first.
       * 
       * Origin must be Signed and the sender should be the Freezer of the asset `id`.
       * 
       * - `id`: The identifier of the asset to be frozen.
       * - `who`: The account to be frozen.
       * 
       * Emits `Frozen`.
       * 
       * Weight: `O(1)`
       **/
      freeze: AugmentedSubmittable<(id: Compact<u32> | AnyNumber | Uint8Array, who: MultiAddress | { Id: any } | { Index: any } | { Raw: any } | { Address32: any } | { Address20: any } | string | Uint8Array) => SubmittableExtrinsic<ApiType>, [Compact<u32>, MultiAddress]>;
      /**
       * Disallow further unprivileged transfers for the asset class.
       * 
       * Origin must be Signed and the sender should be the Freezer of the asset `id`.
       * 
       * - `id`: The identifier of the asset to be frozen.
       * 
       * Emits `Frozen`.
       * 
       * Weight: `O(1)`
       **/
      freezeAsset: AugmentedSubmittable<(id: Compact<u32> | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>, [Compact<u32>]>;
      /**
       * Mint assets of a particular class.
       * 
       * The origin must be Signed and the sender must be the Issuer of the asset `id`.
       * 
       * - `id`: The identifier of the asset to have some amount minted.
       * - `beneficiary`: The account to be credited with the minted assets.
       * - `amount`: The amount of the asset to be minted.
       * 
       * Emits `Issued` event when successful.
       * 
       * Weight: `O(1)`
       * Modes: Pre-existing balance of `beneficiary`; Account pre-existence of `beneficiary`.
       **/
      mint: AugmentedSubmittable<(id: Compact<u32> | AnyNumber | Uint8Array, beneficiary: MultiAddress | { Id: any } | { Index: any } | { Raw: any } | { Address32: any } | { Address20: any } | string | Uint8Array, amount: Compact<u128> | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>, [Compact<u32>, MultiAddress, Compact<u128>]>;
      /**
       * Return the deposit (if any) of an asset account or a consumer reference (if any) of an
       * account.
       * 
       * The origin must be Signed.
       * 
       * - `id`: The identifier of the asset for which the caller would like the deposit
       * refunded.
       * - `allow_burn`: If `true` then assets may be destroyed in order to complete the refund.
       * 
       * It will fail with either [`Error::ContainsHolds`] or [`Error::ContainsFreezes`] if
       * the asset account contains holds or freezes in place.
       * 
       * Emits `Refunded` event when successful.
       **/
      refund: AugmentedSubmittable<(id: Compact<u32> | AnyNumber | Uint8Array, allowBurn: bool | boolean | Uint8Array) => SubmittableExtrinsic<ApiType>, [Compact<u32>, bool]>;
      /**
       * Return the deposit (if any) of a target asset account. Useful if you are the depositor.
       * 
       * The origin must be Signed and either the account owner, depositor, or asset `Admin`. In
       * order to burn a non-zero balance of the asset, the caller must be the account and should
       * use `refund`.
       * 
       * - `id`: The identifier of the asset for the account holding a deposit.
       * - `who`: The account to refund.
       * 
       * It will fail with either [`Error::ContainsHolds`] or [`Error::ContainsFreezes`] if
       * the asset account contains holds or freezes in place.
       * 
       * Emits `Refunded` event when successful.
       **/
      refundOther: AugmentedSubmittable<(id: Compact<u32> | AnyNumber | Uint8Array, who: MultiAddress | { Id: any } | { Index: any } | { Raw: any } | { Address32: any } | { Address20: any } | string | Uint8Array) => SubmittableExtrinsic<ApiType>, [Compact<u32>, MultiAddress]>;
      /**
       * Set the metadata for an asset.
       * 
       * Origin must be Signed and the sender should be the Owner of the asset `id`.
       * 
       * Funds of sender are reserved according to the formula:
       * `MetadataDepositBase + MetadataDepositPerByte * (name.len + symbol.len)` taking into
       * account any already reserved funds.
       * 
       * - `id`: The identifier of the asset to update.
       * - `name`: The user friendly name of this asset. Limited in length by `StringLimit`.
       * - `symbol`: The exchange symbol for this asset. Limited in length by `StringLimit`.
       * - `decimals`: The number of decimals this asset uses to represent one unit.
       * 
       * Emits `MetadataSet`.
       * 
       * Weight: `O(1)`
       **/
      setMetadata: AugmentedSubmittable<(id: Compact<u32> | AnyNumber | Uint8Array, name: Bytes | string | Uint8Array, symbol: Bytes | string | Uint8Array, decimals: u8 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>, [Compact<u32>, Bytes, Bytes, u8]>;
      /**
       * Sets the minimum balance of an asset.
       * 
       * Only works if there aren't any accounts that are holding the asset or if
       * the new value of `min_balance` is less than the old one.
       * 
       * Origin must be Signed and the sender has to be the Owner of the
       * asset `id`.
       * 
       * - `id`: The identifier of the asset.
       * - `min_balance`: The new value of `min_balance`.
       * 
       * Emits `AssetMinBalanceChanged` event when successful.
       **/
      setMinBalance: AugmentedSubmittable<(id: Compact<u32> | AnyNumber | Uint8Array, minBalance: u128 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>, [Compact<u32>, u128]>;
      /**
       * Change the Issuer, Admin and Freezer of an asset.
       * 
       * Origin must be Signed and the sender should be the Owner of the asset `id`.
       * 
       * - `id`: The identifier of the asset to be frozen.
       * - `issuer`: The new Issuer of this asset.
       * - `admin`: The new Admin of this asset.
       * - `freezer`: The new Freezer of this asset.
       * 
       * Emits `TeamChanged`.
       * 
       * Weight: `O(1)`
       **/
      setTeam: AugmentedSubmittable<(id: Compact<u32> | AnyNumber | Uint8Array, issuer: MultiAddress | { Id: any } | { Index: any } | { Raw: any } | { Address32: any } | { Address20: any } | string | Uint8Array, admin: MultiAddress | { Id: any } | { Index: any } | { Raw: any } | { Address32: any } | { Address20: any } | string | Uint8Array, freezer: MultiAddress | { Id: any } | { Index: any } | { Raw: any } | { Address32: any } | { Address20: any } | string | Uint8Array) => SubmittableExtrinsic<ApiType>, [Compact<u32>, MultiAddress, MultiAddress, MultiAddress]>;
      /**
       * Start the process of destroying a fungible asset class.
       * 
       * `start_destroy` is the first in a series of extrinsics that should be called, to allow
       * destruction of an asset class.
       * 
       * The origin must conform to `ForceOrigin` or must be `Signed` by the asset's `owner`.
       * 
       * - `id`: The identifier of the asset to be destroyed. This must identify an existing
       * asset.
       * 
       * It will fail with either [`Error::ContainsHolds`] or [`Error::ContainsFreezes`] if
       * an account contains holds or freezes in place.
       **/
      startDestroy: AugmentedSubmittable<(id: Compact<u32> | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>, [Compact<u32>]>;
      /**
       * Allow unprivileged transfers to and from an account again.
       * 
       * Origin must be Signed and the sender should be the Admin of the asset `id`.
       * 
       * - `id`: The identifier of the asset to be frozen.
       * - `who`: The account to be unfrozen.
       * 
       * Emits `Thawed`.
       * 
       * Weight: `O(1)`
       **/
      thaw: AugmentedSubmittable<(id: Compact<u32> | AnyNumber | Uint8Array, who: MultiAddress | { Id: any } | { Index: any } | { Raw: any } | { Address32: any } | { Address20: any } | string | Uint8Array) => SubmittableExtrinsic<ApiType>, [Compact<u32>, MultiAddress]>;
      /**
       * Allow unprivileged transfers for the asset again.
       * 
       * Origin must be Signed and the sender should be the Admin of the asset `id`.
       * 
       * - `id`: The identifier of the asset to be thawed.
       * 
       * Emits `Thawed`.
       * 
       * Weight: `O(1)`
       **/
      thawAsset: AugmentedSubmittable<(id: Compact<u32> | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>, [Compact<u32>]>;
      /**
       * Create an asset account for non-provider assets.
       * 
       * A deposit will be taken from the signer account.
       * 
       * - `origin`: Must be Signed; the signer account must have sufficient funds for a deposit
       * to be taken.
       * - `id`: The identifier of the asset for the account to be created.
       * 
       * Emits `Touched` event when successful.
       **/
      touch: AugmentedSubmittable<(id: Compact<u32> | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>, [Compact<u32>]>;
      /**
       * Create an asset account for `who`.
       * 
       * A deposit will be taken from the signer account.
       * 
       * - `origin`: Must be Signed by `Freezer` or `Admin` of the asset `id`; the signer account
       * must have sufficient funds for a deposit to be taken.
       * - `id`: The identifier of the asset for the account to be created.
       * - `who`: The account to be created.
       * 
       * Emits `Touched` event when successful.
       **/
      touchOther: AugmentedSubmittable<(id: Compact<u32> | AnyNumber | Uint8Array, who: MultiAddress | { Id: any } | { Index: any } | { Raw: any } | { Address32: any } | { Address20: any } | string | Uint8Array) => SubmittableExtrinsic<ApiType>, [Compact<u32>, MultiAddress]>;
      /**
       * Move some assets from the sender account to another.
       * 
       * Origin must be Signed.
       * 
       * - `id`: The identifier of the asset to have some amount transferred.
       * - `target`: The account to be credited.
       * - `amount`: The amount by which the sender's balance of assets should be reduced and
       * `target`'s balance increased. The amount actually transferred may be slightly greater in
       * the case that the transfer would otherwise take the sender balance above zero but below
       * the minimum balance. Must be greater than zero.
       * 
       * Emits `Transferred` with the actual amount transferred. If this takes the source balance
       * to below the minimum for the asset, then the amount transferred is increased to take it
       * to zero.
       * 
       * Weight: `O(1)`
       * Modes: Pre-existence of `target`; Post-existence of sender; Account pre-existence of
       * `target`.
       **/
      transfer: AugmentedSubmittable<(id: Compact<u32> | AnyNumber | Uint8Array, target: MultiAddress | { Id: any } | { Index: any } | { Raw: any } | { Address32: any } | { Address20: any } | string | Uint8Array, amount: Compact<u128> | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>, [Compact<u32>, MultiAddress, Compact<u128>]>;
      /**
       * Transfer the entire transferable balance from the caller asset account.
       * 
       * NOTE: This function only attempts to transfer _transferable_ balances. This means that
       * any held, frozen, or minimum balance (when `keep_alive` is `true`), will not be
       * transferred by this function. To ensure that this function results in a killed account,
       * you might need to prepare the account by removing any reference counters, storage
       * deposits, etc...
       * 
       * The dispatch origin of this call must be Signed.
       * 
       * - `id`: The identifier of the asset for the account holding a deposit.
       * - `dest`: The recipient of the transfer.
       * - `keep_alive`: A boolean to determine if the `transfer_all` operation should send all
       * of the funds the asset account has, causing the sender asset account to be killed
       * (false), or transfer everything except at least the minimum balance, which will
       * guarantee to keep the sender asset account alive (true).
       **/
      transferAll: AugmentedSubmittable<(id: Compact<u32> | AnyNumber | Uint8Array, dest: MultiAddress | { Id: any } | { Index: any } | { Raw: any } | { Address32: any } | { Address20: any } | string | Uint8Array, keepAlive: bool | boolean | Uint8Array) => SubmittableExtrinsic<ApiType>, [Compact<u32>, MultiAddress, bool]>;
      /**
       * Transfer some asset balance from a previously delegated account to some third-party
       * account.
       * 
       * Origin must be Signed and there must be an approval in place by the `owner` to the
       * signer.
       * 
       * If the entire amount approved for transfer is transferred, then any deposit previously
       * reserved by `approve_transfer` is unreserved.
       * 
       * - `id`: The identifier of the asset.
       * - `owner`: The account which previously approved for a transfer of at least `amount` and
       * from which the asset balance will be withdrawn.
       * - `destination`: The account to which the asset balance of `amount` will be transferred.
       * - `amount`: The amount of assets to transfer.
       * 
       * Emits `TransferredApproved` on success.
       * 
       * Weight: `O(1)`
       **/
      transferApproved: AugmentedSubmittable<(id: Compact<u32> | AnyNumber | Uint8Array, owner: MultiAddress | { Id: any } | { Index: any } | { Raw: any } | { Address32: any } | { Address20: any } | string | Uint8Array, destination: MultiAddress | { Id: any } | { Index: any } | { Raw: any } | { Address32: any } | { Address20: any } | string | Uint8Array, amount: Compact<u128> | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>, [Compact<u32>, MultiAddress, MultiAddress, Compact<u128>]>;
      /**
       * Move some assets from the sender account to another, keeping the sender account alive.
       * 
       * Origin must be Signed.
       * 
       * - `id`: The identifier of the asset to have some amount transferred.
       * - `target`: The account to be credited.
       * - `amount`: The amount by which the sender's balance of assets should be reduced and
       * `target`'s balance increased. The amount actually transferred may be slightly greater in
       * the case that the transfer would otherwise take the sender balance above zero but below
       * the minimum balance. Must be greater than zero.
       * 
       * Emits `Transferred` with the actual amount transferred. If this takes the source balance
       * to below the minimum for the asset, then the amount transferred is increased to take it
       * to zero.
       * 
       * Weight: `O(1)`
       * Modes: Pre-existence of `target`; Post-existence of sender; Account pre-existence of
       * `target`.
       **/
      transferKeepAlive: AugmentedSubmittable<(id: Compact<u32> | AnyNumber | Uint8Array, target: MultiAddress | { Id: any } | { Index: any } | { Raw: any } | { Address32: any } | { Address20: any } | string | Uint8Array, amount: Compact<u128> | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>, [Compact<u32>, MultiAddress, Compact<u128>]>;
      /**
       * Change the Owner of an asset.
       * 
       * Origin must be Signed and the sender should be the Owner of the asset `id`.
       * 
       * - `id`: The identifier of the asset.
       * - `owner`: The new Owner of this asset.
       * 
       * Emits `OwnerChanged`.
       * 
       * Weight: `O(1)`
       **/
      transferOwnership: AugmentedSubmittable<(id: Compact<u32> | AnyNumber | Uint8Array, owner: MultiAddress | { Id: any } | { Index: any } | { Raw: any } | { Address32: any } | { Address20: any } | string | Uint8Array) => SubmittableExtrinsic<ApiType>, [Compact<u32>, MultiAddress]>;
      /**
       * Generic tx
       **/
      [key: string]: SubmittableExtrinsicFunction<ApiType>;
    };
    balances: {
      /**
       * Burn the specified liquid free balance from the origin account.
       * 
       * If the origin's account ends up below the existential deposit as a result
       * of the burn and `keep_alive` is false, the account will be reaped.
       * 
       * Unlike sending funds to a _burn_ address, which merely makes the funds inaccessible,
       * this `burn` operation will reduce total issuance by the amount _burned_.
       **/
      burn: AugmentedSubmittable<(value: Compact<u128> | AnyNumber | Uint8Array, keepAlive: bool | boolean | Uint8Array) => SubmittableExtrinsic<ApiType>, [Compact<u128>, bool]>;
      /**
       * Adjust the total issuance in a saturating way.
       * 
       * Can only be called by root and always needs a positive `delta`.
       * 
       * # Example
       **/
      forceAdjustTotalIssuance: AugmentedSubmittable<(direction: PalletBalancesAdjustmentDirection | 'Increase' | 'Decrease' | number | Uint8Array, delta: Compact<u128> | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>, [PalletBalancesAdjustmentDirection, Compact<u128>]>;
      /**
       * Set the regular balance of a given account.
       * 
       * The dispatch origin for this call is `root`.
       **/
      forceSetBalance: AugmentedSubmittable<(who: MultiAddress | { Id: any } | { Index: any } | { Raw: any } | { Address32: any } | { Address20: any } | string | Uint8Array, newFree: Compact<u128> | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>, [MultiAddress, Compact<u128>]>;
      /**
       * Exactly as `transfer_allow_death`, except the origin must be root and the source account
       * may be specified.
       **/
      forceTransfer: AugmentedSubmittable<(source: MultiAddress | { Id: any } | { Index: any } | { Raw: any } | { Address32: any } | { Address20: any } | string | Uint8Array, dest: MultiAddress | { Id: any } | { Index: any } | { Raw: any } | { Address32: any } | { Address20: any } | string | Uint8Array, value: Compact<u128> | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>, [MultiAddress, MultiAddress, Compact<u128>]>;
      /**
       * Unreserve some balance from a user by force.
       * 
       * Can only be called by ROOT.
       **/
      forceUnreserve: AugmentedSubmittable<(who: MultiAddress | { Id: any } | { Index: any } | { Raw: any } | { Address32: any } | { Address20: any } | string | Uint8Array, amount: u128 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>, [MultiAddress, u128]>;
      /**
       * Transfer the entire transferable balance from the caller account.
       * 
       * NOTE: This function only attempts to transfer _transferable_ balances. This means that
       * any locked, reserved, or existential deposits (when `keep_alive` is `true`), will not be
       * transferred by this function. To ensure that this function results in a killed account,
       * you might need to prepare the account by removing any reference counters, storage
       * deposits, etc...
       * 
       * The dispatch origin of this call must be Signed.
       * 
       * - `dest`: The recipient of the transfer.
       * - `keep_alive`: A boolean to determine if the `transfer_all` operation should send all
       * of the funds the account has, causing the sender account to be killed (false), or
       * transfer everything except at least the existential deposit, which will guarantee to
       * keep the sender account alive (true).
       **/
      transferAll: AugmentedSubmittable<(dest: MultiAddress | { Id: any } | { Index: any } | { Raw: any } | { Address32: any } | { Address20: any } | string | Uint8Array, keepAlive: bool | boolean | Uint8Array) => SubmittableExtrinsic<ApiType>, [MultiAddress, bool]>;
      /**
       * Transfer some liquid free balance to another account.
       * 
       * `transfer_allow_death` will set the `FreeBalance` of the sender and receiver.
       * If the sender's account is below the existential deposit as a result
       * of the transfer, the account will be reaped.
       * 
       * The dispatch origin for this call must be `Signed` by the transactor.
       **/
      transferAllowDeath: AugmentedSubmittable<(dest: MultiAddress | { Id: any } | { Index: any } | { Raw: any } | { Address32: any } | { Address20: any } | string | Uint8Array, value: Compact<u128> | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>, [MultiAddress, Compact<u128>]>;
      /**
       * Same as the [`transfer_allow_death`] call, but with a check that the transfer will not
       * kill the origin account.
       * 
       * 99% of the time you want [`transfer_allow_death`] instead.
       * 
       * [`transfer_allow_death`]: struct.Pallet.html#method.transfer
       **/
      transferKeepAlive: AugmentedSubmittable<(dest: MultiAddress | { Id: any } | { Index: any } | { Raw: any } | { Address32: any } | { Address20: any } | string | Uint8Array, value: Compact<u128> | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>, [MultiAddress, Compact<u128>]>;
      /**
       * Upgrade a specified account.
       * 
       * - `origin`: Must be `Signed`.
       * - `who`: The account to be upgraded.
       * 
       * This will waive the transaction fee if at least all but 10% of the accounts needed to
       * be upgraded. (We let some not have to be upgraded just in order to allow for the
       * possibility of churn).
       **/
      upgradeAccounts: AugmentedSubmittable<(who: Vec<AccountId32> | (AccountId32 | string | Uint8Array)[]) => SubmittableExtrinsic<ApiType>, [Vec<AccountId32>]>;
      /**
       * Generic tx
       **/
      [key: string]: SubmittableExtrinsicFunction<ApiType>;
    };
    collatorSelection: {
      /**
       * Add a new account `who` to the list of `Invulnerables` collators. `who` must have
       * registered session keys. If `who` is a candidate, they will be removed.
       * 
       * The origin for this call must be the `UpdateOrigin`.
       **/
      addInvulnerable: AugmentedSubmittable<(who: AccountId32 | string | Uint8Array) => SubmittableExtrinsic<ApiType>, [AccountId32]>;
      /**
       * Deregister `origin` as a collator candidate. Note that the collator can only leave on
       * session change. The `CandidacyBond` will be unreserved immediately.
       * 
       * This call will fail if the total number of candidates would drop below
       * `MinEligibleCollators`.
       **/
      leaveIntent: AugmentedSubmittable<() => SubmittableExtrinsic<ApiType>, []>;
      /**
       * Register this account as a collator candidate. The account must (a) already have
       * registered session keys and (b) be able to reserve the `CandidacyBond`.
       * 
       * This call is not available to `Invulnerable` collators.
       **/
      registerAsCandidate: AugmentedSubmittable<() => SubmittableExtrinsic<ApiType>, []>;
      /**
       * Remove an account `who` from the list of `Invulnerables` collators. `Invulnerables` must
       * be sorted.
       * 
       * The origin for this call must be the `UpdateOrigin`.
       **/
      removeInvulnerable: AugmentedSubmittable<(who: AccountId32 | string | Uint8Array) => SubmittableExtrinsic<ApiType>, [AccountId32]>;
      /**
       * Set the candidacy bond amount.
       * 
       * If the candidacy bond is increased by this call, all current candidates which have a
       * deposit lower than the new bond will be kicked from the list and get their deposits
       * back.
       * 
       * The origin for this call must be the `UpdateOrigin`.
       **/
      setCandidacyBond: AugmentedSubmittable<(bond: u128 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>, [u128]>;
      /**
       * Set the ideal number of non-invulnerable collators. If lowering this number, then the
       * number of running collators could be higher than this figure. Aside from that edge case,
       * there should be no other way to have more candidates than the desired number.
       * 
       * The origin for this call must be the `UpdateOrigin`.
       **/
      setDesiredCandidates: AugmentedSubmittable<(max: u32 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>, [u32]>;
      /**
       * Set the list of invulnerable (fixed) collators. These collators must do some
       * preparation, namely to have registered session keys.
       * 
       * The call will remove any accounts that have not registered keys from the set. That is,
       * it is non-atomic; the caller accepts all `AccountId`s passed in `new` _individually_ as
       * acceptable Invulnerables, and is not proposing a _set_ of new Invulnerables.
       * 
       * This call does not maintain mutual exclusivity of `Invulnerables` and `Candidates`. It
       * is recommended to use a batch of `add_invulnerable` and `remove_invulnerable` instead. A
       * `batch_all` can also be used to enforce atomicity. If any candidates are included in
       * `new`, they should be removed with `remove_invulnerable_candidate` after execution.
       * 
       * Must be called by the `UpdateOrigin`.
       **/
      setInvulnerables: AugmentedSubmittable<(updated: Vec<AccountId32> | (AccountId32 | string | Uint8Array)[]) => SubmittableExtrinsic<ApiType>, [Vec<AccountId32>]>;
      /**
       * The caller `origin` replaces a candidate `target` in the collator candidate list by
       * reserving `deposit`. The amount `deposit` reserved by the caller must be greater than
       * the existing bond of the target it is trying to replace.
       * 
       * This call will fail if the caller is already a collator candidate or invulnerable, the
       * caller does not have registered session keys, the target is not a collator candidate,
       * and/or the `deposit` amount cannot be reserved.
       **/
      takeCandidateSlot: AugmentedSubmittable<(deposit: u128 | AnyNumber | Uint8Array, target: AccountId32 | string | Uint8Array) => SubmittableExtrinsic<ApiType>, [u128, AccountId32]>;
      /**
       * Update the candidacy bond of collator candidate `origin` to a new amount `new_deposit`.
       * 
       * Setting a `new_deposit` that is lower than the current deposit while `origin` is
       * occupying a top-`DesiredCandidates` slot is not allowed.
       * 
       * This call will fail if `origin` is not a collator candidate, the updated bond is lower
       * than the minimum candidacy bond, and/or the amount cannot be reserved.
       **/
      updateBond: AugmentedSubmittable<(newDeposit: u128 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>, [u128]>;
      /**
       * Generic tx
       **/
      [key: string]: SubmittableExtrinsicFunction<ApiType>;
    };
    cumulusXcm: {
      /**
       * Generic tx
       **/
      [key: string]: SubmittableExtrinsicFunction<ApiType>;
    };
    hybridOrderbook: {
      /**
       * Provide liquidity into the pool of `asset1` and `asset2`.
       * NOTE: an optimal amount of asset1 and asset2 will be calculated and
       * might be different than the provided `amount1_desired`/`amount2_desired`
       * thus you should provide the min amount you're happy to provide.
       * Params `amount1_min`/`amount2_min` represent that.
       * `mint_to` will be sent the liquidity tokens that represent this share of the pool.
       * 
       * NOTE: when encountering an incorrect exchange rate and non-withdrawable pool liquidity,
       * batch an atomic call with [`Pallet::add_liquidity`] and
       * [`Pallet::swap_exact_tokens_for_tokens`] or [`Pallet::swap_tokens_for_exact_tokens`]
       * calls to render the liquidity withdrawable and rectify the exchange rate.
       * 
       * Once liquidity is added, someone may successfully call
       * [`Pallet::swap_exact_tokens_for_tokens`] successfully.
       **/
      addLiquidity: AugmentedSubmittable<(baseAsset: FrameSupportTokensFungibleUnionOfNativeOrWithId | { Native: any } | { WithId: any } | string | Uint8Array, quoteAsset: FrameSupportTokensFungibleUnionOfNativeOrWithId | { Native: any } | { WithId: any } | string | Uint8Array, baseAssetDesired: u128 | AnyNumber | Uint8Array, quoteAssetDesired: u128 | AnyNumber | Uint8Array, baseAssetMin: u128 | AnyNumber | Uint8Array, quoteAssetMin: u128 | AnyNumber | Uint8Array, mintTo: AccountId32 | string | Uint8Array) => SubmittableExtrinsic<ApiType>, [FrameSupportTokensFungibleUnionOfNativeOrWithId, FrameSupportTokensFungibleUnionOfNativeOrWithId, u128, u128, u128, u128, AccountId32]>;
      cancelOrder: AugmentedSubmittable<(baseAsset: FrameSupportTokensFungibleUnionOfNativeOrWithId | { Native: any } | { WithId: any } | string | Uint8Array, quoteAsset: FrameSupportTokensFungibleUnionOfNativeOrWithId | { Native: any } | { WithId: any } | string | Uint8Array, price: u128 | AnyNumber | Uint8Array, orderId: u64 | AnyNumber | Uint8Array, quantity: u128 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>, [FrameSupportTokensFungibleUnionOfNativeOrWithId, FrameSupportTokensFungibleUnionOfNativeOrWithId, u128, u64, u128]>;
      /**
       * Creates an empty liquidity pool and an associated new `lp_token` asset
       * (the id of which is returned in the `Event::PoolCreated` event).
       * 
       * Once a pool is created, someone may [`Pallet::add_liquidity`] to it.
       **/
      createPool: AugmentedSubmittable<(baseAsset: FrameSupportTokensFungibleUnionOfNativeOrWithId | { Native: any } | { WithId: any } | string | Uint8Array, quoteAsset: FrameSupportTokensFungibleUnionOfNativeOrWithId | { Native: any } | { WithId: any } | string | Uint8Array, takerFeeRate: Permill | AnyNumber | Uint8Array, tickSize: u128 | AnyNumber | Uint8Array, lotSize: u128 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>, [FrameSupportTokensFungibleUnionOfNativeOrWithId, FrameSupportTokensFungibleUnionOfNativeOrWithId, Permill, u128, u128]>;
      limitOrder: AugmentedSubmittable<(baseAsset: FrameSupportTokensFungibleUnionOfNativeOrWithId | { Native: any } | { WithId: any } | string | Uint8Array, quoteAsset: FrameSupportTokensFungibleUnionOfNativeOrWithId | { Native: any } | { WithId: any } | string | Uint8Array, isBid: bool | boolean | Uint8Array, price: u128 | AnyNumber | Uint8Array, quantity: u128 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>, [FrameSupportTokensFungibleUnionOfNativeOrWithId, FrameSupportTokensFungibleUnionOfNativeOrWithId, bool, u128, u128]>;
      marketOrder: AugmentedSubmittable<(baseAsset: FrameSupportTokensFungibleUnionOfNativeOrWithId | { Native: any } | { WithId: any } | string | Uint8Array, quoteAsset: FrameSupportTokensFungibleUnionOfNativeOrWithId | { Native: any } | { WithId: any } | string | Uint8Array, quantity: u128 | AnyNumber | Uint8Array, isBid: bool | boolean | Uint8Array) => SubmittableExtrinsic<ApiType>, [FrameSupportTokensFungibleUnionOfNativeOrWithId, FrameSupportTokensFungibleUnionOfNativeOrWithId, u128, bool]>;
      /**
       * Allows you to remove liquidity by providing the `lp_token_burn` tokens that will be
       * burned in the process. With the usage of `amount1_min_receive`/`amount2_min_receive`
       * it's possible to control the min amount of returned tokens you're happy with.
       **/
      removeLiquidity: AugmentedSubmittable<(baseAsset: FrameSupportTokensFungibleUnionOfNativeOrWithId | { Native: any } | { WithId: any } | string | Uint8Array, quoteAsset: FrameSupportTokensFungibleUnionOfNativeOrWithId | { Native: any } | { WithId: any } | string | Uint8Array, lpTokenBurn: u128 | AnyNumber | Uint8Array, baseAssetMinReceive: u128 | AnyNumber | Uint8Array, quoteAssetMinReceive: u128 | AnyNumber | Uint8Array, withdrawTo: AccountId32 | string | Uint8Array) => SubmittableExtrinsic<ApiType>, [FrameSupportTokensFungibleUnionOfNativeOrWithId, FrameSupportTokensFungibleUnionOfNativeOrWithId, u128, u128, u128, AccountId32]>;
      /**
       * Touch an existing pool to fulfill prerequisites before providing liquidity, such as
       * ensuring that the pool's accounts are in place. It is typically useful when a pool
       * creator removes the pool's accounts and does not provide a liquidity. This action may
       * involve holding assets from the caller as a deposit for creating the pool's accounts.
       * 
       * The origin must be Signed.
       * 
       * - `asset1`: The asset ID of an existing pool with a pair (asset1, asset2).
       * - `asset2`: The asset ID of an existing pool with a pair (asset1, asset2).
       * 
       * Emits `Touched` event when successful.
       **/
      touch: AugmentedSubmittable<(baseAsset: FrameSupportTokensFungibleUnionOfNativeOrWithId | { Native: any } | { WithId: any } | string | Uint8Array, quoteAsset: FrameSupportTokensFungibleUnionOfNativeOrWithId | { Native: any } | { WithId: any } | string | Uint8Array) => SubmittableExtrinsic<ApiType>, [FrameSupportTokensFungibleUnionOfNativeOrWithId, FrameSupportTokensFungibleUnionOfNativeOrWithId]>;
      /**
       * Generic tx
       **/
      [key: string]: SubmittableExtrinsicFunction<ApiType>;
    };
    messageQueue: {
      /**
       * Execute an overweight message.
       * 
       * Temporary processing errors will be propagated whereas permanent errors are treated
       * as success condition.
       * 
       * - `origin`: Must be `Signed`.
       * - `message_origin`: The origin from which the message to be executed arrived.
       * - `page`: The page in the queue in which the message to be executed is sitting.
       * - `index`: The index into the queue of the message to be executed.
       * - `weight_limit`: The maximum amount of weight allowed to be consumed in the execution
       * of the message.
       * 
       * Benchmark complexity considerations: O(index + weight_limit).
       **/
      executeOverweight: AugmentedSubmittable<(messageOrigin: CumulusPrimitivesCoreAggregateMessageOrigin | { Here: any } | { Parent: any } | { Sibling: any } | string | Uint8Array, page: u32 | AnyNumber | Uint8Array, index: u32 | AnyNumber | Uint8Array, weightLimit: SpWeightsWeightV2Weight | { refTime?: any; proofSize?: any } | string | Uint8Array) => SubmittableExtrinsic<ApiType>, [CumulusPrimitivesCoreAggregateMessageOrigin, u32, u32, SpWeightsWeightV2Weight]>;
      /**
       * Remove a page which has no more messages remaining to be processed or is stale.
       **/
      reapPage: AugmentedSubmittable<(messageOrigin: CumulusPrimitivesCoreAggregateMessageOrigin | { Here: any } | { Parent: any } | { Sibling: any } | string | Uint8Array, pageIndex: u32 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>, [CumulusPrimitivesCoreAggregateMessageOrigin, u32]>;
      /**
       * Generic tx
       **/
      [key: string]: SubmittableExtrinsicFunction<ApiType>;
    };
    parachainInfo: {
      /**
       * Generic tx
       **/
      [key: string]: SubmittableExtrinsicFunction<ApiType>;
    };
    parachainSystem: {
      /**
       * Set the current validation data.
       * 
       * This should be invoked exactly once per block. It will panic at the finalization
       * phase if the call was not invoked.
       * 
       * The dispatch origin for this call must be `Inherent`
       * 
       * As a side effect, this function upgrades the current validation function
       * if the appropriate time has come.
       **/
      setValidationData: AugmentedSubmittable<(data: CumulusPrimitivesParachainInherentParachainInherentData | { validationData?: any; relayChainState?: any; downwardMessages?: any; horizontalMessages?: any } | string | Uint8Array) => SubmittableExtrinsic<ApiType>, [CumulusPrimitivesParachainInherentParachainInherentData]>;
      sudoSendUpwardMessage: AugmentedSubmittable<(message: Bytes | string | Uint8Array) => SubmittableExtrinsic<ApiType>, [Bytes]>;
      /**
       * Generic tx
       **/
      [key: string]: SubmittableExtrinsicFunction<ApiType>;
    };
    polkadotXcm: {
      /**
       * Authorize another `aliaser` location to alias into the local `origin` making this call.
       * The `aliaser` is only authorized until the provided `expiry` block number.
       * The call can also be used for a previously authorized alias in order to update its
       * `expiry` block number.
       * 
       * Usually useful to allow your local account to be aliased into from a remote location
       * also under your control (like your account on another chain).
       * 
       * WARNING: make sure the caller `origin` (you) trusts the `aliaser` location to act in
       * their/your name. Once authorized using this call, the `aliaser` can freely impersonate
       * `origin` in XCM programs executed on the local chain.
       **/
      addAuthorizedAlias: AugmentedSubmittable<(aliaser: XcmVersionedLocation | { V3: any } | { V4: any } | { V5: any } | string | Uint8Array, expires: Option<u64> | null | Uint8Array | u64 | AnyNumber) => SubmittableExtrinsic<ApiType>, [XcmVersionedLocation, Option<u64>]>;
      /**
       * Claims assets trapped on this pallet because of leftover assets during XCM execution.
       * 
       * - `origin`: Anyone can call this extrinsic.
       * - `assets`: The exact assets that were trapped. Use the version to specify what version
       * was the latest when they were trapped.
       * - `beneficiary`: The location/account where the claimed assets will be deposited.
       **/
      claimAssets: AugmentedSubmittable<(assets: XcmVersionedAssets | { V3: any } | { V4: any } | { V5: any } | string | Uint8Array, beneficiary: XcmVersionedLocation | { V3: any } | { V4: any } | { V5: any } | string | Uint8Array) => SubmittableExtrinsic<ApiType>, [XcmVersionedAssets, XcmVersionedLocation]>;
      /**
       * Execute an XCM message from a local, signed, origin.
       * 
       * An event is deposited indicating whether `msg` could be executed completely or only
       * partially.
       * 
       * No more than `max_weight` will be used in its attempted execution. If this is less than
       * the maximum amount of weight that the message could take to be executed, then no
       * execution attempt will be made.
       **/
      execute: AugmentedSubmittable<(message: XcmVersionedXcm | { V3: any } | { V4: any } | { V5: any } | string | Uint8Array, maxWeight: SpWeightsWeightV2Weight | { refTime?: any; proofSize?: any } | string | Uint8Array) => SubmittableExtrinsic<ApiType>, [XcmVersionedXcm, SpWeightsWeightV2Weight]>;
      /**
       * Set a safe XCM version (the version that XCM should be encoded with if the most recent
       * version a destination can accept is unknown).
       * 
       * - `origin`: Must be an origin specified by AdminOrigin.
       * - `maybe_xcm_version`: The default XCM encoding version, or `None` to disable.
       **/
      forceDefaultXcmVersion: AugmentedSubmittable<(maybeXcmVersion: Option<u32> | null | Uint8Array | u32 | AnyNumber) => SubmittableExtrinsic<ApiType>, [Option<u32>]>;
      /**
       * Ask a location to notify us regarding their XCM version and any changes to it.
       * 
       * - `origin`: Must be an origin specified by AdminOrigin.
       * - `location`: The location to which we should subscribe for XCM version notifications.
       **/
      forceSubscribeVersionNotify: AugmentedSubmittable<(location: XcmVersionedLocation | { V3: any } | { V4: any } | { V5: any } | string | Uint8Array) => SubmittableExtrinsic<ApiType>, [XcmVersionedLocation]>;
      /**
       * Set or unset the global suspension state of the XCM executor.
       * 
       * - `origin`: Must be an origin specified by AdminOrigin.
       * - `suspended`: `true` to suspend, `false` to resume.
       **/
      forceSuspension: AugmentedSubmittable<(suspended: bool | boolean | Uint8Array) => SubmittableExtrinsic<ApiType>, [bool]>;
      /**
       * Require that a particular destination should no longer notify us regarding any XCM
       * version changes.
       * 
       * - `origin`: Must be an origin specified by AdminOrigin.
       * - `location`: The location to which we are currently subscribed for XCM version
       * notifications which we no longer desire.
       **/
      forceUnsubscribeVersionNotify: AugmentedSubmittable<(location: XcmVersionedLocation | { V3: any } | { V4: any } | { V5: any } | string | Uint8Array) => SubmittableExtrinsic<ApiType>, [XcmVersionedLocation]>;
      /**
       * Extoll that a particular destination can be communicated with through a particular
       * version of XCM.
       * 
       * - `origin`: Must be an origin specified by AdminOrigin.
       * - `location`: The destination that is being described.
       * - `xcm_version`: The latest version of XCM that `location` supports.
       **/
      forceXcmVersion: AugmentedSubmittable<(location: StagingXcmV5Location | { parents?: any; interior?: any } | string | Uint8Array, version: u32 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>, [StagingXcmV5Location, u32]>;
      /**
       * Transfer some assets from the local chain to the destination chain through their local,
       * destination or remote reserve.
       * 
       * `assets` must have same reserve location and may not be teleportable to `dest`.
       * - `assets` have local reserve: transfer assets to sovereign account of destination
       * chain and forward a notification XCM to `dest` to mint and deposit reserve-based
       * assets to `beneficiary`.
       * - `assets` have destination reserve: burn local assets and forward a notification to
       * `dest` chain to withdraw the reserve assets from this chain's sovereign account and
       * deposit them to `beneficiary`.
       * - `assets` have remote reserve: burn local assets, forward XCM to reserve chain to move
       * reserves from this chain's SA to `dest` chain's SA, and forward another XCM to `dest`
       * to mint and deposit reserve-based assets to `beneficiary`.
       * 
       * Fee payment on the destination side is made from the asset in the `assets` vector of
       * index `fee_asset_item`, up to enough to pay for `weight_limit` of weight. If more weight
       * is needed than `weight_limit`, then the operation will fail and the sent assets may be
       * at risk.
       * 
       * - `origin`: Must be capable of withdrawing the `assets` and executing XCM.
       * - `dest`: Destination context for the assets. Will typically be `[Parent,
       * Parachain(..)]` to send from parachain to parachain, or `[Parachain(..)]` to send from
       * relay to parachain.
       * - `beneficiary`: A beneficiary location for the assets in the context of `dest`. Will
       * generally be an `AccountId32` value.
       * - `assets`: The assets to be withdrawn. This should include the assets used to pay the
       * fee on the `dest` (and possibly reserve) chains.
       * - `fee_asset_item`: The index into `assets` of the item which should be used to pay
       * fees.
       * - `weight_limit`: The remote-side weight limit, if any, for the XCM fee purchase.
       **/
      limitedReserveTransferAssets: AugmentedSubmittable<(dest: XcmVersionedLocation | { V3: any } | { V4: any } | { V5: any } | string | Uint8Array, beneficiary: XcmVersionedLocation | { V3: any } | { V4: any } | { V5: any } | string | Uint8Array, assets: XcmVersionedAssets | { V3: any } | { V4: any } | { V5: any } | string | Uint8Array, feeAssetItem: u32 | AnyNumber | Uint8Array, weightLimit: XcmV3WeightLimit | { Unlimited: any } | { Limited: any } | string | Uint8Array) => SubmittableExtrinsic<ApiType>, [XcmVersionedLocation, XcmVersionedLocation, XcmVersionedAssets, u32, XcmV3WeightLimit]>;
      /**
       * Teleport some assets from the local chain to some destination chain.
       * 
       * Fee payment on the destination side is made from the asset in the `assets` vector of
       * index `fee_asset_item`, up to enough to pay for `weight_limit` of weight. If more weight
       * is needed than `weight_limit`, then the operation will fail and the sent assets may be
       * at risk.
       * 
       * - `origin`: Must be capable of withdrawing the `assets` and executing XCM.
       * - `dest`: Destination context for the assets. Will typically be `[Parent,
       * Parachain(..)]` to send from parachain to parachain, or `[Parachain(..)]` to send from
       * relay to parachain.
       * - `beneficiary`: A beneficiary location for the assets in the context of `dest`. Will
       * generally be an `AccountId32` value.
       * - `assets`: The assets to be withdrawn. This should include the assets used to pay the
       * fee on the `dest` chain.
       * - `fee_asset_item`: The index into `assets` of the item which should be used to pay
       * fees.
       * - `weight_limit`: The remote-side weight limit, if any, for the XCM fee purchase.
       **/
      limitedTeleportAssets: AugmentedSubmittable<(dest: XcmVersionedLocation | { V3: any } | { V4: any } | { V5: any } | string | Uint8Array, beneficiary: XcmVersionedLocation | { V3: any } | { V4: any } | { V5: any } | string | Uint8Array, assets: XcmVersionedAssets | { V3: any } | { V4: any } | { V5: any } | string | Uint8Array, feeAssetItem: u32 | AnyNumber | Uint8Array, weightLimit: XcmV3WeightLimit | { Unlimited: any } | { Limited: any } | string | Uint8Array) => SubmittableExtrinsic<ApiType>, [XcmVersionedLocation, XcmVersionedLocation, XcmVersionedAssets, u32, XcmV3WeightLimit]>;
      /**
       * Remove all previously authorized `aliaser`s that can alias into the local `origin`
       * making this call.
       **/
      removeAllAuthorizedAliases: AugmentedSubmittable<() => SubmittableExtrinsic<ApiType>, []>;
      /**
       * Remove a previously authorized `aliaser` from the list of locations that can alias into
       * the local `origin` making this call.
       **/
      removeAuthorizedAlias: AugmentedSubmittable<(aliaser: XcmVersionedLocation | { V3: any } | { V4: any } | { V5: any } | string | Uint8Array) => SubmittableExtrinsic<ApiType>, [XcmVersionedLocation]>;
      /**
       * Transfer some assets from the local chain to the destination chain through their local,
       * destination or remote reserve.
       * 
       * `assets` must have same reserve location and may not be teleportable to `dest`.
       * - `assets` have local reserve: transfer assets to sovereign account of destination
       * chain and forward a notification XCM to `dest` to mint and deposit reserve-based
       * assets to `beneficiary`.
       * - `assets` have destination reserve: burn local assets and forward a notification to
       * `dest` chain to withdraw the reserve assets from this chain's sovereign account and
       * deposit them to `beneficiary`.
       * - `assets` have remote reserve: burn local assets, forward XCM to reserve chain to move
       * reserves from this chain's SA to `dest` chain's SA, and forward another XCM to `dest`
       * to mint and deposit reserve-based assets to `beneficiary`.
       * 
       * **This function is deprecated: Use `limited_reserve_transfer_assets` instead.**
       * 
       * Fee payment on the destination side is made from the asset in the `assets` vector of
       * index `fee_asset_item`. The weight limit for fees is not provided and thus is unlimited,
       * with all fees taken as needed from the asset.
       * 
       * - `origin`: Must be capable of withdrawing the `assets` and executing XCM.
       * - `dest`: Destination context for the assets. Will typically be `[Parent,
       * Parachain(..)]` to send from parachain to parachain, or `[Parachain(..)]` to send from
       * relay to parachain.
       * - `beneficiary`: A beneficiary location for the assets in the context of `dest`. Will
       * generally be an `AccountId32` value.
       * - `assets`: The assets to be withdrawn. This should include the assets used to pay the
       * fee on the `dest` (and possibly reserve) chains.
       * - `fee_asset_item`: The index into `assets` of the item which should be used to pay
       * fees.
       **/
      reserveTransferAssets: AugmentedSubmittable<(dest: XcmVersionedLocation | { V3: any } | { V4: any } | { V5: any } | string | Uint8Array, beneficiary: XcmVersionedLocation | { V3: any } | { V4: any } | { V5: any } | string | Uint8Array, assets: XcmVersionedAssets | { V3: any } | { V4: any } | { V5: any } | string | Uint8Array, feeAssetItem: u32 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>, [XcmVersionedLocation, XcmVersionedLocation, XcmVersionedAssets, u32]>;
      send: AugmentedSubmittable<(dest: XcmVersionedLocation | { V3: any } | { V4: any } | { V5: any } | string | Uint8Array, message: XcmVersionedXcm | { V3: any } | { V4: any } | { V5: any } | string | Uint8Array) => SubmittableExtrinsic<ApiType>, [XcmVersionedLocation, XcmVersionedXcm]>;
      /**
       * Teleport some assets from the local chain to some destination chain.
       * 
       * **This function is deprecated: Use `limited_teleport_assets` instead.**
       * 
       * Fee payment on the destination side is made from the asset in the `assets` vector of
       * index `fee_asset_item`. The weight limit for fees is not provided and thus is unlimited,
       * with all fees taken as needed from the asset.
       * 
       * - `origin`: Must be capable of withdrawing the `assets` and executing XCM.
       * - `dest`: Destination context for the assets. Will typically be `[Parent,
       * Parachain(..)]` to send from parachain to parachain, or `[Parachain(..)]` to send from
       * relay to parachain.
       * - `beneficiary`: A beneficiary location for the assets in the context of `dest`. Will
       * generally be an `AccountId32` value.
       * - `assets`: The assets to be withdrawn. This should include the assets used to pay the
       * fee on the `dest` chain.
       * - `fee_asset_item`: The index into `assets` of the item which should be used to pay
       * fees.
       **/
      teleportAssets: AugmentedSubmittable<(dest: XcmVersionedLocation | { V3: any } | { V4: any } | { V5: any } | string | Uint8Array, beneficiary: XcmVersionedLocation | { V3: any } | { V4: any } | { V5: any } | string | Uint8Array, assets: XcmVersionedAssets | { V3: any } | { V4: any } | { V5: any } | string | Uint8Array, feeAssetItem: u32 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>, [XcmVersionedLocation, XcmVersionedLocation, XcmVersionedAssets, u32]>;
      /**
       * Transfer some assets from the local chain to the destination chain through their local,
       * destination or remote reserve, or through teleports.
       * 
       * Fee payment on the destination side is made from the asset in the `assets` vector of
       * index `fee_asset_item` (hence referred to as `fees`), up to enough to pay for
       * `weight_limit` of weight. If more weight is needed than `weight_limit`, then the
       * operation will fail and the sent assets may be at risk.
       * 
       * `assets` (excluding `fees`) must have same reserve location or otherwise be teleportable
       * to `dest`, no limitations imposed on `fees`.
       * - for local reserve: transfer assets to sovereign account of destination chain and
       * forward a notification XCM to `dest` to mint and deposit reserve-based assets to
       * `beneficiary`.
       * - for destination reserve: burn local assets and forward a notification to `dest` chain
       * to withdraw the reserve assets from this chain's sovereign account and deposit them
       * to `beneficiary`.
       * - for remote reserve: burn local assets, forward XCM to reserve chain to move reserves
       * from this chain's SA to `dest` chain's SA, and forward another XCM to `dest` to mint
       * and deposit reserve-based assets to `beneficiary`.
       * - for teleports: burn local assets and forward XCM to `dest` chain to mint/teleport
       * assets and deposit them to `beneficiary`.
       * 
       * - `origin`: Must be capable of withdrawing the `assets` and executing XCM.
       * - `dest`: Destination context for the assets. Will typically be `X2(Parent,
       * Parachain(..))` to send from parachain to parachain, or `X1(Parachain(..))` to send
       * from relay to parachain.
       * - `beneficiary`: A beneficiary location for the assets in the context of `dest`. Will
       * generally be an `AccountId32` value.
       * - `assets`: The assets to be withdrawn. This should include the assets used to pay the
       * fee on the `dest` (and possibly reserve) chains.
       * - `fee_asset_item`: The index into `assets` of the item which should be used to pay
       * fees.
       * - `weight_limit`: The remote-side weight limit, if any, for the XCM fee purchase.
       **/
      transferAssets: AugmentedSubmittable<(dest: XcmVersionedLocation | { V3: any } | { V4: any } | { V5: any } | string | Uint8Array, beneficiary: XcmVersionedLocation | { V3: any } | { V4: any } | { V5: any } | string | Uint8Array, assets: XcmVersionedAssets | { V3: any } | { V4: any } | { V5: any } | string | Uint8Array, feeAssetItem: u32 | AnyNumber | Uint8Array, weightLimit: XcmV3WeightLimit | { Unlimited: any } | { Limited: any } | string | Uint8Array) => SubmittableExtrinsic<ApiType>, [XcmVersionedLocation, XcmVersionedLocation, XcmVersionedAssets, u32, XcmV3WeightLimit]>;
      /**
       * Transfer assets from the local chain to the destination chain using explicit transfer
       * types for assets and fees.
       * 
       * `assets` must have same reserve location or may be teleportable to `dest`. Caller must
       * provide the `assets_transfer_type` to be used for `assets`:
       * - `TransferType::LocalReserve`: transfer assets to sovereign account of destination
       * chain and forward a notification XCM to `dest` to mint and deposit reserve-based
       * assets to `beneficiary`.
       * - `TransferType::DestinationReserve`: burn local assets and forward a notification to
       * `dest` chain to withdraw the reserve assets from this chain's sovereign account and
       * deposit them to `beneficiary`.
       * - `TransferType::RemoteReserve(reserve)`: burn local assets, forward XCM to `reserve`
       * chain to move reserves from this chain's SA to `dest` chain's SA, and forward another
       * XCM to `dest` to mint and deposit reserve-based assets to `beneficiary`. Typically
       * the remote `reserve` is Asset Hub.
       * - `TransferType::Teleport`: burn local assets and forward XCM to `dest` chain to
       * mint/teleport assets and deposit them to `beneficiary`.
       * 
       * On the destination chain, as well as any intermediary hops, `BuyExecution` is used to
       * buy execution using transferred `assets` identified by `remote_fees_id`.
       * Make sure enough of the specified `remote_fees_id` asset is included in the given list
       * of `assets`. `remote_fees_id` should be enough to pay for `weight_limit`. If more weight
       * is needed than `weight_limit`, then the operation will fail and the sent assets may be
       * at risk.
       * 
       * `remote_fees_id` may use different transfer type than rest of `assets` and can be
       * specified through `fees_transfer_type`.
       * 
       * The caller needs to specify what should happen to the transferred assets once they reach
       * the `dest` chain. This is done through the `custom_xcm_on_dest` parameter, which
       * contains the instructions to execute on `dest` as a final step.
       * This is usually as simple as:
       * `Xcm(vec![DepositAsset { assets: Wild(AllCounted(assets.len())), beneficiary }])`,
       * but could be something more exotic like sending the `assets` even further.
       * 
       * - `origin`: Must be capable of withdrawing the `assets` and executing XCM.
       * - `dest`: Destination context for the assets. Will typically be `[Parent,
       * Parachain(..)]` to send from parachain to parachain, or `[Parachain(..)]` to send from
       * relay to parachain, or `(parents: 2, (GlobalConsensus(..), ..))` to send from
       * parachain across a bridge to another ecosystem destination.
       * - `assets`: The assets to be withdrawn. This should include the assets used to pay the
       * fee on the `dest` (and possibly reserve) chains.
       * - `assets_transfer_type`: The XCM `TransferType` used to transfer the `assets`.
       * - `remote_fees_id`: One of the included `assets` to be used to pay fees.
       * - `fees_transfer_type`: The XCM `TransferType` used to transfer the `fees` assets.
       * - `custom_xcm_on_dest`: The XCM to be executed on `dest` chain as the last step of the
       * transfer, which also determines what happens to the assets on the destination chain.
       * - `weight_limit`: The remote-side weight limit, if any, for the XCM fee purchase.
       **/
      transferAssetsUsingTypeAndThen: AugmentedSubmittable<(dest: XcmVersionedLocation | { V3: any } | { V4: any } | { V5: any } | string | Uint8Array, assets: XcmVersionedAssets | { V3: any } | { V4: any } | { V5: any } | string | Uint8Array, assetsTransferType: StagingXcmExecutorAssetTransferTransferType | { Teleport: any } | { LocalReserve: any } | { DestinationReserve: any } | { RemoteReserve: any } | string | Uint8Array, remoteFeesId: XcmVersionedAssetId | { V3: any } | { V4: any } | { V5: any } | string | Uint8Array, feesTransferType: StagingXcmExecutorAssetTransferTransferType | { Teleport: any } | { LocalReserve: any } | { DestinationReserve: any } | { RemoteReserve: any } | string | Uint8Array, customXcmOnDest: XcmVersionedXcm | { V3: any } | { V4: any } | { V5: any } | string | Uint8Array, weightLimit: XcmV3WeightLimit | { Unlimited: any } | { Limited: any } | string | Uint8Array) => SubmittableExtrinsic<ApiType>, [XcmVersionedLocation, XcmVersionedAssets, StagingXcmExecutorAssetTransferTransferType, XcmVersionedAssetId, StagingXcmExecutorAssetTransferTransferType, XcmVersionedXcm, XcmV3WeightLimit]>;
      /**
       * Generic tx
       **/
      [key: string]: SubmittableExtrinsicFunction<ApiType>;
    };
    poolAssets: {
      /**
       * Approve an amount of asset for transfer by a delegated third-party account.
       * 
       * Origin must be Signed.
       * 
       * Ensures that `ApprovalDeposit` worth of `Currency` is reserved from signing account
       * for the purpose of holding the approval. If some non-zero amount of assets is already
       * approved from signing account to `delegate`, then it is topped up or unreserved to
       * meet the right value.
       * 
       * NOTE: The signing account does not need to own `amount` of assets at the point of
       * making this call.
       * 
       * - `id`: The identifier of the asset.
       * - `delegate`: The account to delegate permission to transfer asset.
       * - `amount`: The amount of asset that may be transferred by `delegate`. If there is
       * already an approval in place, then this acts additively.
       * 
       * Emits `ApprovedTransfer` on success.
       * 
       * Weight: `O(1)`
       **/
      approveTransfer: AugmentedSubmittable<(id: Compact<u32> | AnyNumber | Uint8Array, delegate: MultiAddress | { Id: any } | { Index: any } | { Raw: any } | { Address32: any } | { Address20: any } | string | Uint8Array, amount: Compact<u128> | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>, [Compact<u32>, MultiAddress, Compact<u128>]>;
      /**
       * Disallow further unprivileged transfers of an asset `id` to and from an account `who`.
       * 
       * Origin must be Signed and the sender should be the Freezer of the asset `id`.
       * 
       * - `id`: The identifier of the account's asset.
       * - `who`: The account to be unblocked.
       * 
       * Emits `Blocked`.
       * 
       * Weight: `O(1)`
       **/
      block: AugmentedSubmittable<(id: Compact<u32> | AnyNumber | Uint8Array, who: MultiAddress | { Id: any } | { Index: any } | { Raw: any } | { Address32: any } | { Address20: any } | string | Uint8Array) => SubmittableExtrinsic<ApiType>, [Compact<u32>, MultiAddress]>;
      /**
       * Reduce the balance of `who` by as much as possible up to `amount` assets of `id`.
       * 
       * Origin must be Signed and the sender should be the Manager of the asset `id`.
       * 
       * Bails with `NoAccount` if the `who` is already dead.
       * 
       * - `id`: The identifier of the asset to have some amount burned.
       * - `who`: The account to be debited from.
       * - `amount`: The maximum amount by which `who`'s balance should be reduced.
       * 
       * Emits `Burned` with the actual amount burned. If this takes the balance to below the
       * minimum for the asset, then the amount burned is increased to take it to zero.
       * 
       * Weight: `O(1)`
       * Modes: Post-existence of `who`; Pre & post Zombie-status of `who`.
       **/
      burn: AugmentedSubmittable<(id: Compact<u32> | AnyNumber | Uint8Array, who: MultiAddress | { Id: any } | { Index: any } | { Raw: any } | { Address32: any } | { Address20: any } | string | Uint8Array, amount: Compact<u128> | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>, [Compact<u32>, MultiAddress, Compact<u128>]>;
      /**
       * Cancel all of some asset approved for delegated transfer by a third-party account.
       * 
       * Origin must be Signed and there must be an approval in place between signer and
       * `delegate`.
       * 
       * Unreserves any deposit previously reserved by `approve_transfer` for the approval.
       * 
       * - `id`: The identifier of the asset.
       * - `delegate`: The account delegated permission to transfer asset.
       * 
       * Emits `ApprovalCancelled` on success.
       * 
       * Weight: `O(1)`
       **/
      cancelApproval: AugmentedSubmittable<(id: Compact<u32> | AnyNumber | Uint8Array, delegate: MultiAddress | { Id: any } | { Index: any } | { Raw: any } | { Address32: any } | { Address20: any } | string | Uint8Array) => SubmittableExtrinsic<ApiType>, [Compact<u32>, MultiAddress]>;
      /**
       * Clear the metadata for an asset.
       * 
       * Origin must be Signed and the sender should be the Owner of the asset `id`.
       * 
       * Any deposit is freed for the asset owner.
       * 
       * - `id`: The identifier of the asset to clear.
       * 
       * Emits `MetadataCleared`.
       * 
       * Weight: `O(1)`
       **/
      clearMetadata: AugmentedSubmittable<(id: Compact<u32> | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>, [Compact<u32>]>;
      /**
       * Issue a new class of fungible assets from a public origin.
       * 
       * This new asset class has no assets initially and its owner is the origin.
       * 
       * The origin must conform to the configured `CreateOrigin` and have sufficient funds free.
       * 
       * Funds of sender are reserved by `AssetDeposit`.
       * 
       * Parameters:
       * - `id`: The identifier of the new asset. This must not be currently in use to identify
       * an existing asset. If [`NextAssetId`] is set, then this must be equal to it.
       * - `admin`: The admin of this class of assets. The admin is the initial address of each
       * member of the asset class's admin team.
       * - `min_balance`: The minimum balance of this new asset that any single account must
       * have. If an account's balance is reduced below this, then it collapses to zero.
       * 
       * Emits `Created` event when successful.
       * 
       * Weight: `O(1)`
       **/
      create: AugmentedSubmittable<(id: Compact<u32> | AnyNumber | Uint8Array, admin: MultiAddress | { Id: any } | { Index: any } | { Raw: any } | { Address32: any } | { Address20: any } | string | Uint8Array, minBalance: u128 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>, [Compact<u32>, MultiAddress, u128]>;
      /**
       * Destroy all accounts associated with a given asset.
       * 
       * `destroy_accounts` should only be called after `start_destroy` has been called, and the
       * asset is in a `Destroying` state.
       * 
       * Due to weight restrictions, this function may need to be called multiple times to fully
       * destroy all accounts. It will destroy `RemoveItemsLimit` accounts at a time.
       * 
       * - `id`: The identifier of the asset to be destroyed. This must identify an existing
       * asset.
       * 
       * Each call emits the `Event::DestroyedAccounts` event.
       **/
      destroyAccounts: AugmentedSubmittable<(id: Compact<u32> | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>, [Compact<u32>]>;
      /**
       * Destroy all approvals associated with a given asset up to the max (T::RemoveItemsLimit).
       * 
       * `destroy_approvals` should only be called after `start_destroy` has been called, and the
       * asset is in a `Destroying` state.
       * 
       * Due to weight restrictions, this function may need to be called multiple times to fully
       * destroy all approvals. It will destroy `RemoveItemsLimit` approvals at a time.
       * 
       * - `id`: The identifier of the asset to be destroyed. This must identify an existing
       * asset.
       * 
       * Each call emits the `Event::DestroyedApprovals` event.
       **/
      destroyApprovals: AugmentedSubmittable<(id: Compact<u32> | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>, [Compact<u32>]>;
      /**
       * Complete destroying asset and unreserve currency.
       * 
       * `finish_destroy` should only be called after `start_destroy` has been called, and the
       * asset is in a `Destroying` state. All accounts or approvals should be destroyed before
       * hand.
       * 
       * - `id`: The identifier of the asset to be destroyed. This must identify an existing
       * asset.
       * 
       * Each successful call emits the `Event::Destroyed` event.
       **/
      finishDestroy: AugmentedSubmittable<(id: Compact<u32> | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>, [Compact<u32>]>;
      /**
       * Alter the attributes of a given asset.
       * 
       * Origin must be `ForceOrigin`.
       * 
       * - `id`: The identifier of the asset.
       * - `owner`: The new Owner of this asset.
       * - `issuer`: The new Issuer of this asset.
       * - `admin`: The new Admin of this asset.
       * - `freezer`: The new Freezer of this asset.
       * - `min_balance`: The minimum balance of this new asset that any single account must
       * have. If an account's balance is reduced below this, then it collapses to zero.
       * - `is_sufficient`: Whether a non-zero balance of this asset is deposit of sufficient
       * value to account for the state bloat associated with its balance storage. If set to
       * `true`, then non-zero balances may be stored without a `consumer` reference (and thus
       * an ED in the Balances pallet or whatever else is used to control user-account state
       * growth).
       * - `is_frozen`: Whether this asset class is frozen except for permissioned/admin
       * instructions.
       * 
       * Emits `AssetStatusChanged` with the identity of the asset.
       * 
       * Weight: `O(1)`
       **/
      forceAssetStatus: AugmentedSubmittable<(id: Compact<u32> | AnyNumber | Uint8Array, owner: MultiAddress | { Id: any } | { Index: any } | { Raw: any } | { Address32: any } | { Address20: any } | string | Uint8Array, issuer: MultiAddress | { Id: any } | { Index: any } | { Raw: any } | { Address32: any } | { Address20: any } | string | Uint8Array, admin: MultiAddress | { Id: any } | { Index: any } | { Raw: any } | { Address32: any } | { Address20: any } | string | Uint8Array, freezer: MultiAddress | { Id: any } | { Index: any } | { Raw: any } | { Address32: any } | { Address20: any } | string | Uint8Array, minBalance: Compact<u128> | AnyNumber | Uint8Array, isSufficient: bool | boolean | Uint8Array, isFrozen: bool | boolean | Uint8Array) => SubmittableExtrinsic<ApiType>, [Compact<u32>, MultiAddress, MultiAddress, MultiAddress, MultiAddress, Compact<u128>, bool, bool]>;
      /**
       * Cancel all of some asset approved for delegated transfer by a third-party account.
       * 
       * Origin must be either ForceOrigin or Signed origin with the signer being the Admin
       * account of the asset `id`.
       * 
       * Unreserves any deposit previously reserved by `approve_transfer` for the approval.
       * 
       * - `id`: The identifier of the asset.
       * - `delegate`: The account delegated permission to transfer asset.
       * 
       * Emits `ApprovalCancelled` on success.
       * 
       * Weight: `O(1)`
       **/
      forceCancelApproval: AugmentedSubmittable<(id: Compact<u32> | AnyNumber | Uint8Array, owner: MultiAddress | { Id: any } | { Index: any } | { Raw: any } | { Address32: any } | { Address20: any } | string | Uint8Array, delegate: MultiAddress | { Id: any } | { Index: any } | { Raw: any } | { Address32: any } | { Address20: any } | string | Uint8Array) => SubmittableExtrinsic<ApiType>, [Compact<u32>, MultiAddress, MultiAddress]>;
      /**
       * Clear the metadata for an asset.
       * 
       * Origin must be ForceOrigin.
       * 
       * Any deposit is returned.
       * 
       * - `id`: The identifier of the asset to clear.
       * 
       * Emits `MetadataCleared`.
       * 
       * Weight: `O(1)`
       **/
      forceClearMetadata: AugmentedSubmittable<(id: Compact<u32> | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>, [Compact<u32>]>;
      /**
       * Issue a new class of fungible assets from a privileged origin.
       * 
       * This new asset class has no assets initially.
       * 
       * The origin must conform to `ForceOrigin`.
       * 
       * Unlike `create`, no funds are reserved.
       * 
       * - `id`: The identifier of the new asset. This must not be currently in use to identify
       * an existing asset. If [`NextAssetId`] is set, then this must be equal to it.
       * - `owner`: The owner of this class of assets. The owner has full superuser permissions
       * over this asset, but may later change and configure the permissions using
       * `transfer_ownership` and `set_team`.
       * - `min_balance`: The minimum balance of this new asset that any single account must
       * have. If an account's balance is reduced below this, then it collapses to zero.
       * 
       * Emits `ForceCreated` event when successful.
       * 
       * Weight: `O(1)`
       **/
      forceCreate: AugmentedSubmittable<(id: Compact<u32> | AnyNumber | Uint8Array, owner: MultiAddress | { Id: any } | { Index: any } | { Raw: any } | { Address32: any } | { Address20: any } | string | Uint8Array, isSufficient: bool | boolean | Uint8Array, minBalance: Compact<u128> | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>, [Compact<u32>, MultiAddress, bool, Compact<u128>]>;
      /**
       * Force the metadata for an asset to some value.
       * 
       * Origin must be ForceOrigin.
       * 
       * Any deposit is left alone.
       * 
       * - `id`: The identifier of the asset to update.
       * - `name`: The user friendly name of this asset. Limited in length by `StringLimit`.
       * - `symbol`: The exchange symbol for this asset. Limited in length by `StringLimit`.
       * - `decimals`: The number of decimals this asset uses to represent one unit.
       * 
       * Emits `MetadataSet`.
       * 
       * Weight: `O(N + S)` where N and S are the length of the name and symbol respectively.
       **/
      forceSetMetadata: AugmentedSubmittable<(id: Compact<u32> | AnyNumber | Uint8Array, name: Bytes | string | Uint8Array, symbol: Bytes | string | Uint8Array, decimals: u8 | AnyNumber | Uint8Array, isFrozen: bool | boolean | Uint8Array) => SubmittableExtrinsic<ApiType>, [Compact<u32>, Bytes, Bytes, u8, bool]>;
      /**
       * Move some assets from one account to another.
       * 
       * Origin must be Signed and the sender should be the Admin of the asset `id`.
       * 
       * - `id`: The identifier of the asset to have some amount transferred.
       * - `source`: The account to be debited.
       * - `dest`: The account to be credited.
       * - `amount`: The amount by which the `source`'s balance of assets should be reduced and
       * `dest`'s balance increased. The amount actually transferred may be slightly greater in
       * the case that the transfer would otherwise take the `source` balance above zero but
       * below the minimum balance. Must be greater than zero.
       * 
       * Emits `Transferred` with the actual amount transferred. If this takes the source balance
       * to below the minimum for the asset, then the amount transferred is increased to take it
       * to zero.
       * 
       * Weight: `O(1)`
       * Modes: Pre-existence of `dest`; Post-existence of `source`; Account pre-existence of
       * `dest`.
       **/
      forceTransfer: AugmentedSubmittable<(id: Compact<u32> | AnyNumber | Uint8Array, source: MultiAddress | { Id: any } | { Index: any } | { Raw: any } | { Address32: any } | { Address20: any } | string | Uint8Array, dest: MultiAddress | { Id: any } | { Index: any } | { Raw: any } | { Address32: any } | { Address20: any } | string | Uint8Array, amount: Compact<u128> | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>, [Compact<u32>, MultiAddress, MultiAddress, Compact<u128>]>;
      /**
       * Disallow further unprivileged transfers of an asset `id` from an account `who`. `who`
       * must already exist as an entry in `Account`s of the asset. If you want to freeze an
       * account that does not have an entry, use `touch_other` first.
       * 
       * Origin must be Signed and the sender should be the Freezer of the asset `id`.
       * 
       * - `id`: The identifier of the asset to be frozen.
       * - `who`: The account to be frozen.
       * 
       * Emits `Frozen`.
       * 
       * Weight: `O(1)`
       **/
      freeze: AugmentedSubmittable<(id: Compact<u32> | AnyNumber | Uint8Array, who: MultiAddress | { Id: any } | { Index: any } | { Raw: any } | { Address32: any } | { Address20: any } | string | Uint8Array) => SubmittableExtrinsic<ApiType>, [Compact<u32>, MultiAddress]>;
      /**
       * Disallow further unprivileged transfers for the asset class.
       * 
       * Origin must be Signed and the sender should be the Freezer of the asset `id`.
       * 
       * - `id`: The identifier of the asset to be frozen.
       * 
       * Emits `Frozen`.
       * 
       * Weight: `O(1)`
       **/
      freezeAsset: AugmentedSubmittable<(id: Compact<u32> | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>, [Compact<u32>]>;
      /**
       * Mint assets of a particular class.
       * 
       * The origin must be Signed and the sender must be the Issuer of the asset `id`.
       * 
       * - `id`: The identifier of the asset to have some amount minted.
       * - `beneficiary`: The account to be credited with the minted assets.
       * - `amount`: The amount of the asset to be minted.
       * 
       * Emits `Issued` event when successful.
       * 
       * Weight: `O(1)`
       * Modes: Pre-existing balance of `beneficiary`; Account pre-existence of `beneficiary`.
       **/
      mint: AugmentedSubmittable<(id: Compact<u32> | AnyNumber | Uint8Array, beneficiary: MultiAddress | { Id: any } | { Index: any } | { Raw: any } | { Address32: any } | { Address20: any } | string | Uint8Array, amount: Compact<u128> | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>, [Compact<u32>, MultiAddress, Compact<u128>]>;
      /**
       * Return the deposit (if any) of an asset account or a consumer reference (if any) of an
       * account.
       * 
       * The origin must be Signed.
       * 
       * - `id`: The identifier of the asset for which the caller would like the deposit
       * refunded.
       * - `allow_burn`: If `true` then assets may be destroyed in order to complete the refund.
       * 
       * It will fail with either [`Error::ContainsHolds`] or [`Error::ContainsFreezes`] if
       * the asset account contains holds or freezes in place.
       * 
       * Emits `Refunded` event when successful.
       **/
      refund: AugmentedSubmittable<(id: Compact<u32> | AnyNumber | Uint8Array, allowBurn: bool | boolean | Uint8Array) => SubmittableExtrinsic<ApiType>, [Compact<u32>, bool]>;
      /**
       * Return the deposit (if any) of a target asset account. Useful if you are the depositor.
       * 
       * The origin must be Signed and either the account owner, depositor, or asset `Admin`. In
       * order to burn a non-zero balance of the asset, the caller must be the account and should
       * use `refund`.
       * 
       * - `id`: The identifier of the asset for the account holding a deposit.
       * - `who`: The account to refund.
       * 
       * It will fail with either [`Error::ContainsHolds`] or [`Error::ContainsFreezes`] if
       * the asset account contains holds or freezes in place.
       * 
       * Emits `Refunded` event when successful.
       **/
      refundOther: AugmentedSubmittable<(id: Compact<u32> | AnyNumber | Uint8Array, who: MultiAddress | { Id: any } | { Index: any } | { Raw: any } | { Address32: any } | { Address20: any } | string | Uint8Array) => SubmittableExtrinsic<ApiType>, [Compact<u32>, MultiAddress]>;
      /**
       * Set the metadata for an asset.
       * 
       * Origin must be Signed and the sender should be the Owner of the asset `id`.
       * 
       * Funds of sender are reserved according to the formula:
       * `MetadataDepositBase + MetadataDepositPerByte * (name.len + symbol.len)` taking into
       * account any already reserved funds.
       * 
       * - `id`: The identifier of the asset to update.
       * - `name`: The user friendly name of this asset. Limited in length by `StringLimit`.
       * - `symbol`: The exchange symbol for this asset. Limited in length by `StringLimit`.
       * - `decimals`: The number of decimals this asset uses to represent one unit.
       * 
       * Emits `MetadataSet`.
       * 
       * Weight: `O(1)`
       **/
      setMetadata: AugmentedSubmittable<(id: Compact<u32> | AnyNumber | Uint8Array, name: Bytes | string | Uint8Array, symbol: Bytes | string | Uint8Array, decimals: u8 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>, [Compact<u32>, Bytes, Bytes, u8]>;
      /**
       * Sets the minimum balance of an asset.
       * 
       * Only works if there aren't any accounts that are holding the asset or if
       * the new value of `min_balance` is less than the old one.
       * 
       * Origin must be Signed and the sender has to be the Owner of the
       * asset `id`.
       * 
       * - `id`: The identifier of the asset.
       * - `min_balance`: The new value of `min_balance`.
       * 
       * Emits `AssetMinBalanceChanged` event when successful.
       **/
      setMinBalance: AugmentedSubmittable<(id: Compact<u32> | AnyNumber | Uint8Array, minBalance: u128 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>, [Compact<u32>, u128]>;
      /**
       * Change the Issuer, Admin and Freezer of an asset.
       * 
       * Origin must be Signed and the sender should be the Owner of the asset `id`.
       * 
       * - `id`: The identifier of the asset to be frozen.
       * - `issuer`: The new Issuer of this asset.
       * - `admin`: The new Admin of this asset.
       * - `freezer`: The new Freezer of this asset.
       * 
       * Emits `TeamChanged`.
       * 
       * Weight: `O(1)`
       **/
      setTeam: AugmentedSubmittable<(id: Compact<u32> | AnyNumber | Uint8Array, issuer: MultiAddress | { Id: any } | { Index: any } | { Raw: any } | { Address32: any } | { Address20: any } | string | Uint8Array, admin: MultiAddress | { Id: any } | { Index: any } | { Raw: any } | { Address32: any } | { Address20: any } | string | Uint8Array, freezer: MultiAddress | { Id: any } | { Index: any } | { Raw: any } | { Address32: any } | { Address20: any } | string | Uint8Array) => SubmittableExtrinsic<ApiType>, [Compact<u32>, MultiAddress, MultiAddress, MultiAddress]>;
      /**
       * Start the process of destroying a fungible asset class.
       * 
       * `start_destroy` is the first in a series of extrinsics that should be called, to allow
       * destruction of an asset class.
       * 
       * The origin must conform to `ForceOrigin` or must be `Signed` by the asset's `owner`.
       * 
       * - `id`: The identifier of the asset to be destroyed. This must identify an existing
       * asset.
       * 
       * It will fail with either [`Error::ContainsHolds`] or [`Error::ContainsFreezes`] if
       * an account contains holds or freezes in place.
       **/
      startDestroy: AugmentedSubmittable<(id: Compact<u32> | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>, [Compact<u32>]>;
      /**
       * Allow unprivileged transfers to and from an account again.
       * 
       * Origin must be Signed and the sender should be the Admin of the asset `id`.
       * 
       * - `id`: The identifier of the asset to be frozen.
       * - `who`: The account to be unfrozen.
       * 
       * Emits `Thawed`.
       * 
       * Weight: `O(1)`
       **/
      thaw: AugmentedSubmittable<(id: Compact<u32> | AnyNumber | Uint8Array, who: MultiAddress | { Id: any } | { Index: any } | { Raw: any } | { Address32: any } | { Address20: any } | string | Uint8Array) => SubmittableExtrinsic<ApiType>, [Compact<u32>, MultiAddress]>;
      /**
       * Allow unprivileged transfers for the asset again.
       * 
       * Origin must be Signed and the sender should be the Admin of the asset `id`.
       * 
       * - `id`: The identifier of the asset to be thawed.
       * 
       * Emits `Thawed`.
       * 
       * Weight: `O(1)`
       **/
      thawAsset: AugmentedSubmittable<(id: Compact<u32> | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>, [Compact<u32>]>;
      /**
       * Create an asset account for non-provider assets.
       * 
       * A deposit will be taken from the signer account.
       * 
       * - `origin`: Must be Signed; the signer account must have sufficient funds for a deposit
       * to be taken.
       * - `id`: The identifier of the asset for the account to be created.
       * 
       * Emits `Touched` event when successful.
       **/
      touch: AugmentedSubmittable<(id: Compact<u32> | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>, [Compact<u32>]>;
      /**
       * Create an asset account for `who`.
       * 
       * A deposit will be taken from the signer account.
       * 
       * - `origin`: Must be Signed by `Freezer` or `Admin` of the asset `id`; the signer account
       * must have sufficient funds for a deposit to be taken.
       * - `id`: The identifier of the asset for the account to be created.
       * - `who`: The account to be created.
       * 
       * Emits `Touched` event when successful.
       **/
      touchOther: AugmentedSubmittable<(id: Compact<u32> | AnyNumber | Uint8Array, who: MultiAddress | { Id: any } | { Index: any } | { Raw: any } | { Address32: any } | { Address20: any } | string | Uint8Array) => SubmittableExtrinsic<ApiType>, [Compact<u32>, MultiAddress]>;
      /**
       * Move some assets from the sender account to another.
       * 
       * Origin must be Signed.
       * 
       * - `id`: The identifier of the asset to have some amount transferred.
       * - `target`: The account to be credited.
       * - `amount`: The amount by which the sender's balance of assets should be reduced and
       * `target`'s balance increased. The amount actually transferred may be slightly greater in
       * the case that the transfer would otherwise take the sender balance above zero but below
       * the minimum balance. Must be greater than zero.
       * 
       * Emits `Transferred` with the actual amount transferred. If this takes the source balance
       * to below the minimum for the asset, then the amount transferred is increased to take it
       * to zero.
       * 
       * Weight: `O(1)`
       * Modes: Pre-existence of `target`; Post-existence of sender; Account pre-existence of
       * `target`.
       **/
      transfer: AugmentedSubmittable<(id: Compact<u32> | AnyNumber | Uint8Array, target: MultiAddress | { Id: any } | { Index: any } | { Raw: any } | { Address32: any } | { Address20: any } | string | Uint8Array, amount: Compact<u128> | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>, [Compact<u32>, MultiAddress, Compact<u128>]>;
      /**
       * Transfer the entire transferable balance from the caller asset account.
       * 
       * NOTE: This function only attempts to transfer _transferable_ balances. This means that
       * any held, frozen, or minimum balance (when `keep_alive` is `true`), will not be
       * transferred by this function. To ensure that this function results in a killed account,
       * you might need to prepare the account by removing any reference counters, storage
       * deposits, etc...
       * 
       * The dispatch origin of this call must be Signed.
       * 
       * - `id`: The identifier of the asset for the account holding a deposit.
       * - `dest`: The recipient of the transfer.
       * - `keep_alive`: A boolean to determine if the `transfer_all` operation should send all
       * of the funds the asset account has, causing the sender asset account to be killed
       * (false), or transfer everything except at least the minimum balance, which will
       * guarantee to keep the sender asset account alive (true).
       **/
      transferAll: AugmentedSubmittable<(id: Compact<u32> | AnyNumber | Uint8Array, dest: MultiAddress | { Id: any } | { Index: any } | { Raw: any } | { Address32: any } | { Address20: any } | string | Uint8Array, keepAlive: bool | boolean | Uint8Array) => SubmittableExtrinsic<ApiType>, [Compact<u32>, MultiAddress, bool]>;
      /**
       * Transfer some asset balance from a previously delegated account to some third-party
       * account.
       * 
       * Origin must be Signed and there must be an approval in place by the `owner` to the
       * signer.
       * 
       * If the entire amount approved for transfer is transferred, then any deposit previously
       * reserved by `approve_transfer` is unreserved.
       * 
       * - `id`: The identifier of the asset.
       * - `owner`: The account which previously approved for a transfer of at least `amount` and
       * from which the asset balance will be withdrawn.
       * - `destination`: The account to which the asset balance of `amount` will be transferred.
       * - `amount`: The amount of assets to transfer.
       * 
       * Emits `TransferredApproved` on success.
       * 
       * Weight: `O(1)`
       **/
      transferApproved: AugmentedSubmittable<(id: Compact<u32> | AnyNumber | Uint8Array, owner: MultiAddress | { Id: any } | { Index: any } | { Raw: any } | { Address32: any } | { Address20: any } | string | Uint8Array, destination: MultiAddress | { Id: any } | { Index: any } | { Raw: any } | { Address32: any } | { Address20: any } | string | Uint8Array, amount: Compact<u128> | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>, [Compact<u32>, MultiAddress, MultiAddress, Compact<u128>]>;
      /**
       * Move some assets from the sender account to another, keeping the sender account alive.
       * 
       * Origin must be Signed.
       * 
       * - `id`: The identifier of the asset to have some amount transferred.
       * - `target`: The account to be credited.
       * - `amount`: The amount by which the sender's balance of assets should be reduced and
       * `target`'s balance increased. The amount actually transferred may be slightly greater in
       * the case that the transfer would otherwise take the sender balance above zero but below
       * the minimum balance. Must be greater than zero.
       * 
       * Emits `Transferred` with the actual amount transferred. If this takes the source balance
       * to below the minimum for the asset, then the amount transferred is increased to take it
       * to zero.
       * 
       * Weight: `O(1)`
       * Modes: Pre-existence of `target`; Post-existence of sender; Account pre-existence of
       * `target`.
       **/
      transferKeepAlive: AugmentedSubmittable<(id: Compact<u32> | AnyNumber | Uint8Array, target: MultiAddress | { Id: any } | { Index: any } | { Raw: any } | { Address32: any } | { Address20: any } | string | Uint8Array, amount: Compact<u128> | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>, [Compact<u32>, MultiAddress, Compact<u128>]>;
      /**
       * Change the Owner of an asset.
       * 
       * Origin must be Signed and the sender should be the Owner of the asset `id`.
       * 
       * - `id`: The identifier of the asset.
       * - `owner`: The new Owner of this asset.
       * 
       * Emits `OwnerChanged`.
       * 
       * Weight: `O(1)`
       **/
      transferOwnership: AugmentedSubmittable<(id: Compact<u32> | AnyNumber | Uint8Array, owner: MultiAddress | { Id: any } | { Index: any } | { Raw: any } | { Address32: any } | { Address20: any } | string | Uint8Array) => SubmittableExtrinsic<ApiType>, [Compact<u32>, MultiAddress]>;
      /**
       * Generic tx
       **/
      [key: string]: SubmittableExtrinsicFunction<ApiType>;
    };
    session: {
      /**
       * Removes any session key(s) of the function caller.
       * 
       * This doesn't take effect until the next session.
       * 
       * The dispatch origin of this function must be Signed and the account must be either be
       * convertible to a validator ID using the chain's typical addressing system (this usually
       * means being a controller account) or directly convertible into a validator ID (which
       * usually means being a stash account).
       * 
       * ## Complexity
       * - `O(1)` in number of key types. Actual cost depends on the number of length of
       * `T::Keys::key_ids()` which is fixed.
       **/
      purgeKeys: AugmentedSubmittable<() => SubmittableExtrinsic<ApiType>, []>;
      /**
       * Sets the session key(s) of the function caller to `keys`.
       * Allows an account to set its session key prior to becoming a validator.
       * This doesn't take effect until the next session.
       * 
       * The dispatch origin of this function must be signed.
       * 
       * ## Complexity
       * - `O(1)`. Actual cost depends on the number of length of `T::Keys::key_ids()` which is
       * fixed.
       **/
      setKeys: AugmentedSubmittable<(keys: WarpxRuntimeSessionKeys | { aura?: any } | string | Uint8Array, proof: Bytes | string | Uint8Array) => SubmittableExtrinsic<ApiType>, [WarpxRuntimeSessionKeys, Bytes]>;
      /**
       * Generic tx
       **/
      [key: string]: SubmittableExtrinsicFunction<ApiType>;
    };
    sudo: {
      /**
       * Permanently removes the sudo key.
       * 
       * **This cannot be un-done.**
       **/
      removeKey: AugmentedSubmittable<() => SubmittableExtrinsic<ApiType>, []>;
      /**
       * Authenticates the current sudo key and sets the given AccountId (`new`) as the new sudo
       * key.
       **/
      setKey: AugmentedSubmittable<(updated: MultiAddress | { Id: any } | { Index: any } | { Raw: any } | { Address32: any } | { Address20: any } | string | Uint8Array) => SubmittableExtrinsic<ApiType>, [MultiAddress]>;
      /**
       * Authenticates the sudo key and dispatches a function call with `Root` origin.
       **/
      sudo: AugmentedSubmittable<(call: Call | IMethod | string | Uint8Array) => SubmittableExtrinsic<ApiType>, [Call]>;
      /**
       * Authenticates the sudo key and dispatches a function call with `Signed` origin from
       * a given account.
       * 
       * The dispatch origin for this call must be _Signed_.
       **/
      sudoAs: AugmentedSubmittable<(who: MultiAddress | { Id: any } | { Index: any } | { Raw: any } | { Address32: any } | { Address20: any } | string | Uint8Array, call: Call | IMethod | string | Uint8Array) => SubmittableExtrinsic<ApiType>, [MultiAddress, Call]>;
      /**
       * Authenticates the sudo key and dispatches a function call with `Root` origin.
       * This function does not check the weight of the call, and instead allows the
       * Sudo user to specify the weight of the call.
       * 
       * The dispatch origin for this call must be _Signed_.
       **/
      sudoUncheckedWeight: AugmentedSubmittable<(call: Call | IMethod | string | Uint8Array, weight: SpWeightsWeightV2Weight | { refTime?: any; proofSize?: any } | string | Uint8Array) => SubmittableExtrinsic<ApiType>, [Call, SpWeightsWeightV2Weight]>;
      /**
       * Generic tx
       **/
      [key: string]: SubmittableExtrinsicFunction<ApiType>;
    };
    system: {
      /**
       * Provide the preimage (runtime binary) `code` for an upgrade that has been authorized.
       * 
       * If the authorization required a version check, this call will ensure the spec name
       * remains unchanged and that the spec version has increased.
       * 
       * Depending on the runtime's `OnSetCode` configuration, this function may directly apply
       * the new `code` in the same block or attempt to schedule the upgrade.
       * 
       * All origins are allowed.
       **/
      applyAuthorizedUpgrade: AugmentedSubmittable<(code: Bytes | string | Uint8Array) => SubmittableExtrinsic<ApiType>, [Bytes]>;
      /**
       * Authorize an upgrade to a given `code_hash` for the runtime. The runtime can be supplied
       * later.
       * 
       * This call requires Root origin.
       **/
      authorizeUpgrade: AugmentedSubmittable<(codeHash: H256 | string | Uint8Array) => SubmittableExtrinsic<ApiType>, [H256]>;
      /**
       * Authorize an upgrade to a given `code_hash` for the runtime. The runtime can be supplied
       * later.
       * 
       * WARNING: This authorizes an upgrade that will take place without any safety checks, for
       * example that the spec name remains the same and that the version number increases. Not
       * recommended for normal use. Use `authorize_upgrade` instead.
       * 
       * This call requires Root origin.
       **/
      authorizeUpgradeWithoutChecks: AugmentedSubmittable<(codeHash: H256 | string | Uint8Array) => SubmittableExtrinsic<ApiType>, [H256]>;
      /**
       * Kill all storage items with a key that starts with the given prefix.
       * 
       * **NOTE:** We rely on the Root origin to provide us the number of subkeys under
       * the prefix we are removing to accurately calculate the weight of this function.
       **/
      killPrefix: AugmentedSubmittable<(prefix: Bytes | string | Uint8Array, subkeys: u32 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>, [Bytes, u32]>;
      /**
       * Kill some items from storage.
       **/
      killStorage: AugmentedSubmittable<(keys: Vec<Bytes> | (Bytes | string | Uint8Array)[]) => SubmittableExtrinsic<ApiType>, [Vec<Bytes>]>;
      /**
       * Make some on-chain remark.
       * 
       * Can be executed by every `origin`.
       **/
      remark: AugmentedSubmittable<(remark: Bytes | string | Uint8Array) => SubmittableExtrinsic<ApiType>, [Bytes]>;
      /**
       * Make some on-chain remark and emit event.
       **/
      remarkWithEvent: AugmentedSubmittable<(remark: Bytes | string | Uint8Array) => SubmittableExtrinsic<ApiType>, [Bytes]>;
      /**
       * Set the new runtime code.
       **/
      setCode: AugmentedSubmittable<(code: Bytes | string | Uint8Array) => SubmittableExtrinsic<ApiType>, [Bytes]>;
      /**
       * Set the new runtime code without doing any checks of the given `code`.
       * 
       * Note that runtime upgrades will not run if this is called with a not-increasing spec
       * version!
       **/
      setCodeWithoutChecks: AugmentedSubmittable<(code: Bytes | string | Uint8Array) => SubmittableExtrinsic<ApiType>, [Bytes]>;
      /**
       * Set the number of pages in the WebAssembly environment's heap.
       **/
      setHeapPages: AugmentedSubmittable<(pages: u64 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>, [u64]>;
      /**
       * Set some items of storage.
       **/
      setStorage: AugmentedSubmittable<(items: Vec<ITuple<[Bytes, Bytes]>> | ([Bytes | string | Uint8Array, Bytes | string | Uint8Array])[]) => SubmittableExtrinsic<ApiType>, [Vec<ITuple<[Bytes, Bytes]>>]>;
      /**
       * Generic tx
       **/
      [key: string]: SubmittableExtrinsicFunction<ApiType>;
    };
    timestamp: {
      /**
       * Set the current time.
       * 
       * This call should be invoked exactly once per block. It will panic at the finalization
       * phase, if this call hasn't been invoked by that time.
       * 
       * The timestamp should be greater than the previous one by the amount specified by
       * [`Config::MinimumPeriod`].
       * 
       * The dispatch origin for this call must be _None_.
       * 
       * This dispatch class is _Mandatory_ to ensure it gets executed in the block. Be aware
       * that changing the complexity of this call could result exhausting the resources in a
       * block to execute any other calls.
       * 
       * ## Complexity
       * - `O(1)` (Note that implementations of `OnTimestampSet` must also be `O(1)`)
       * - 1 storage read and 1 storage mutation (codec `O(1)` because of `DidUpdate::take` in
       * `on_finalize`)
       * - 1 event handler `on_timestamp_set`. Must be `O(1)`.
       **/
      set: AugmentedSubmittable<(now: Compact<u64> | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>, [Compact<u64>]>;
      /**
       * Generic tx
       **/
      [key: string]: SubmittableExtrinsicFunction<ApiType>;
    };
    xcmpQueue: {
      /**
       * Resumes all XCM executions for the XCMP queue.
       * 
       * Note that this function doesn't change the status of the in/out bound channels.
       * 
       * - `origin`: Must pass `ControllerOrigin`.
       **/
      resumeXcmExecution: AugmentedSubmittable<() => SubmittableExtrinsic<ApiType>, []>;
      /**
       * Suspends all XCM executions for the XCMP queue, regardless of the sender's origin.
       * 
       * - `origin`: Must pass `ControllerOrigin`.
       **/
      suspendXcmExecution: AugmentedSubmittable<() => SubmittableExtrinsic<ApiType>, []>;
      /**
       * Overwrites the number of pages which must be in the queue after which we drop any
       * further messages from the channel.
       * 
       * - `origin`: Must pass `Root`.
       * - `new`: Desired value for `QueueConfigData.drop_threshold`
       **/
      updateDropThreshold: AugmentedSubmittable<(updated: u32 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>, [u32]>;
      /**
       * Overwrites the number of pages which the queue must be reduced to before it signals
       * that message sending may recommence after it has been suspended.
       * 
       * - `origin`: Must pass `Root`.
       * - `new`: Desired value for `QueueConfigData.resume_threshold`
       **/
      updateResumeThreshold: AugmentedSubmittable<(updated: u32 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>, [u32]>;
      /**
       * Overwrites the number of pages which must be in the queue for the other side to be
       * told to suspend their sending.
       * 
       * - `origin`: Must pass `Root`.
       * - `new`: Desired value for `QueueConfigData.suspend_value`
       **/
      updateSuspendThreshold: AugmentedSubmittable<(updated: u32 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>, [u32]>;
      /**
       * Generic tx
       **/
      [key: string]: SubmittableExtrinsicFunction<ApiType>;
    };
  } // AugmentedSubmittables
} // declare module
