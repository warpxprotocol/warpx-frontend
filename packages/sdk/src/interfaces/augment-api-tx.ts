// Auto-generated via `yarn polkadot-types-from-chain`, do not edit

/* eslint-disable */
// import type lookup before we augment - in some environments
// this is required to allow for ambient/previous definitions
import type {
  ApiTypes,
  AugmentedSubmittable,
  SubmittableExtrinsic,
  SubmittableExtrinsicFunction,
} from '@polkadot/api-base/types';
import '@polkadot/api-base/types/submittable';
import type { Bytes, Compact, Vec, bool, u8, u32, u64 } from '@polkadot/types-codec';
import type { AnyNumber, IMethod, ITuple } from '@polkadot/types-codec/types';
import type {
  AccountId32,
  Call,
  H256,
  MultiAddress,
  Permill,
} from '@polkadot/types/interfaces/runtime';

export type __AugmentedSubmittable = AugmentedSubmittable<() => unknown>;
export type __SubmittableExtrinsic<ApiType extends ApiTypes> =
  SubmittableExtrinsic<ApiType>;
export type __SubmittableExtrinsicFunction<ApiType extends ApiTypes> =
  SubmittableExtrinsicFunction<ApiType>;

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
      approveTransfer: AugmentedSubmittable<
        (
          id: Compact<u32> | AnyNumber | Uint8Array,
          delegate:
            | MultiAddress
            | { Id: any }
            | { Index: any }
            | { Raw: any }
            | { Address32: any }
            | { Address20: any }
            | string
            | Uint8Array,
          amount: Compact<u64> | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Compact<u32>, MultiAddress, Compact<u64>]
      >;
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
      block: AugmentedSubmittable<
        (
          id: Compact<u32> | AnyNumber | Uint8Array,
          who:
            | MultiAddress
            | { Id: any }
            | { Index: any }
            | { Raw: any }
            | { Address32: any }
            | { Address20: any }
            | string
            | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Compact<u32>, MultiAddress]
      >;
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
      burn: AugmentedSubmittable<
        (
          id: Compact<u32> | AnyNumber | Uint8Array,
          who:
            | MultiAddress
            | { Id: any }
            | { Index: any }
            | { Raw: any }
            | { Address32: any }
            | { Address20: any }
            | string
            | Uint8Array,
          amount: Compact<u64> | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Compact<u32>, MultiAddress, Compact<u64>]
      >;
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
      cancelApproval: AugmentedSubmittable<
        (
          id: Compact<u32> | AnyNumber | Uint8Array,
          delegate:
            | MultiAddress
            | { Id: any }
            | { Index: any }
            | { Raw: any }
            | { Address32: any }
            | { Address20: any }
            | string
            | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Compact<u32>, MultiAddress]
      >;
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
      clearMetadata: AugmentedSubmittable<
        (id: Compact<u32> | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [Compact<u32>]
      >;
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
       * an existing asset.
       * - `admin`: The admin of this class of assets. The admin is the initial address of each
       * member of the asset class's admin team.
       * - `min_balance`: The minimum balance of this new asset that any single account must
       * have. If an account's balance is reduced below this, then it collapses to zero.
       *
       * Emits `Created` event when successful.
       *
       * Weight: `O(1)`
       **/
      create: AugmentedSubmittable<
        (
          id: Compact<u32> | AnyNumber | Uint8Array,
          admin:
            | MultiAddress
            | { Id: any }
            | { Index: any }
            | { Raw: any }
            | { Address32: any }
            | { Address20: any }
            | string
            | Uint8Array,
          minBalance: u64 | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Compact<u32>, MultiAddress, u64]
      >;
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
      destroyAccounts: AugmentedSubmittable<
        (id: Compact<u32> | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [Compact<u32>]
      >;
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
      destroyApprovals: AugmentedSubmittable<
        (id: Compact<u32> | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [Compact<u32>]
      >;
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
      finishDestroy: AugmentedSubmittable<
        (id: Compact<u32> | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [Compact<u32>]
      >;
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
      forceAssetStatus: AugmentedSubmittable<
        (
          id: Compact<u32> | AnyNumber | Uint8Array,
          owner:
            | MultiAddress
            | { Id: any }
            | { Index: any }
            | { Raw: any }
            | { Address32: any }
            | { Address20: any }
            | string
            | Uint8Array,
          issuer:
            | MultiAddress
            | { Id: any }
            | { Index: any }
            | { Raw: any }
            | { Address32: any }
            | { Address20: any }
            | string
            | Uint8Array,
          admin:
            | MultiAddress
            | { Id: any }
            | { Index: any }
            | { Raw: any }
            | { Address32: any }
            | { Address20: any }
            | string
            | Uint8Array,
          freezer:
            | MultiAddress
            | { Id: any }
            | { Index: any }
            | { Raw: any }
            | { Address32: any }
            | { Address20: any }
            | string
            | Uint8Array,
          minBalance: Compact<u64> | AnyNumber | Uint8Array,
          isSufficient: bool | boolean | Uint8Array,
          isFrozen: bool | boolean | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [
          Compact<u32>,
          MultiAddress,
          MultiAddress,
          MultiAddress,
          MultiAddress,
          Compact<u64>,
          bool,
          bool,
        ]
      >;
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
      forceCancelApproval: AugmentedSubmittable<
        (
          id: Compact<u32> | AnyNumber | Uint8Array,
          owner:
            | MultiAddress
            | { Id: any }
            | { Index: any }
            | { Raw: any }
            | { Address32: any }
            | { Address20: any }
            | string
            | Uint8Array,
          delegate:
            | MultiAddress
            | { Id: any }
            | { Index: any }
            | { Raw: any }
            | { Address32: any }
            | { Address20: any }
            | string
            | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Compact<u32>, MultiAddress, MultiAddress]
      >;
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
      forceClearMetadata: AugmentedSubmittable<
        (id: Compact<u32> | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [Compact<u32>]
      >;
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
       * an existing asset.
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
      forceCreate: AugmentedSubmittable<
        (
          id: Compact<u32> | AnyNumber | Uint8Array,
          owner:
            | MultiAddress
            | { Id: any }
            | { Index: any }
            | { Raw: any }
            | { Address32: any }
            | { Address20: any }
            | string
            | Uint8Array,
          isSufficient: bool | boolean | Uint8Array,
          minBalance: Compact<u64> | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Compact<u32>, MultiAddress, bool, Compact<u64>]
      >;
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
      forceSetMetadata: AugmentedSubmittable<
        (
          id: Compact<u32> | AnyNumber | Uint8Array,
          name: Bytes | string | Uint8Array,
          symbol: Bytes | string | Uint8Array,
          decimals: u8 | AnyNumber | Uint8Array,
          isFrozen: bool | boolean | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Compact<u32>, Bytes, Bytes, u8, bool]
      >;
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
      forceTransfer: AugmentedSubmittable<
        (
          id: Compact<u32> | AnyNumber | Uint8Array,
          source:
            | MultiAddress
            | { Id: any }
            | { Index: any }
            | { Raw: any }
            | { Address32: any }
            | { Address20: any }
            | string
            | Uint8Array,
          dest:
            | MultiAddress
            | { Id: any }
            | { Index: any }
            | { Raw: any }
            | { Address32: any }
            | { Address20: any }
            | string
            | Uint8Array,
          amount: Compact<u64> | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Compact<u32>, MultiAddress, MultiAddress, Compact<u64>]
      >;
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
      freeze: AugmentedSubmittable<
        (
          id: Compact<u32> | AnyNumber | Uint8Array,
          who:
            | MultiAddress
            | { Id: any }
            | { Index: any }
            | { Raw: any }
            | { Address32: any }
            | { Address20: any }
            | string
            | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Compact<u32>, MultiAddress]
      >;
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
      freezeAsset: AugmentedSubmittable<
        (id: Compact<u32> | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [Compact<u32>]
      >;
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
      mint: AugmentedSubmittable<
        (
          id: Compact<u32> | AnyNumber | Uint8Array,
          beneficiary:
            | MultiAddress
            | { Id: any }
            | { Index: any }
            | { Raw: any }
            | { Address32: any }
            | { Address20: any }
            | string
            | Uint8Array,
          amount: Compact<u64> | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Compact<u32>, MultiAddress, Compact<u64>]
      >;
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
       * Emits `Refunded` event when successful.
       **/
      refund: AugmentedSubmittable<
        (
          id: Compact<u32> | AnyNumber | Uint8Array,
          allowBurn: bool | boolean | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Compact<u32>, bool]
      >;
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
       * Emits `Refunded` event when successful.
       **/
      refundOther: AugmentedSubmittable<
        (
          id: Compact<u32> | AnyNumber | Uint8Array,
          who:
            | MultiAddress
            | { Id: any }
            | { Index: any }
            | { Raw: any }
            | { Address32: any }
            | { Address20: any }
            | string
            | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Compact<u32>, MultiAddress]
      >;
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
      setMetadata: AugmentedSubmittable<
        (
          id: Compact<u32> | AnyNumber | Uint8Array,
          name: Bytes | string | Uint8Array,
          symbol: Bytes | string | Uint8Array,
          decimals: u8 | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Compact<u32>, Bytes, Bytes, u8]
      >;
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
      setMinBalance: AugmentedSubmittable<
        (
          id: Compact<u32> | AnyNumber | Uint8Array,
          minBalance: u64 | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Compact<u32>, u64]
      >;
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
      setTeam: AugmentedSubmittable<
        (
          id: Compact<u32> | AnyNumber | Uint8Array,
          issuer:
            | MultiAddress
            | { Id: any }
            | { Index: any }
            | { Raw: any }
            | { Address32: any }
            | { Address20: any }
            | string
            | Uint8Array,
          admin:
            | MultiAddress
            | { Id: any }
            | { Index: any }
            | { Raw: any }
            | { Address32: any }
            | { Address20: any }
            | string
            | Uint8Array,
          freezer:
            | MultiAddress
            | { Id: any }
            | { Index: any }
            | { Raw: any }
            | { Address32: any }
            | { Address20: any }
            | string
            | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Compact<u32>, MultiAddress, MultiAddress, MultiAddress]
      >;
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
       * The asset class must be frozen before calling `start_destroy`.
       **/
      startDestroy: AugmentedSubmittable<
        (id: Compact<u32> | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [Compact<u32>]
      >;
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
      thaw: AugmentedSubmittable<
        (
          id: Compact<u32> | AnyNumber | Uint8Array,
          who:
            | MultiAddress
            | { Id: any }
            | { Index: any }
            | { Raw: any }
            | { Address32: any }
            | { Address20: any }
            | string
            | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Compact<u32>, MultiAddress]
      >;
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
      thawAsset: AugmentedSubmittable<
        (id: Compact<u32> | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [Compact<u32>]
      >;
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
      touch: AugmentedSubmittable<
        (id: Compact<u32> | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [Compact<u32>]
      >;
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
      touchOther: AugmentedSubmittable<
        (
          id: Compact<u32> | AnyNumber | Uint8Array,
          who:
            | MultiAddress
            | { Id: any }
            | { Index: any }
            | { Raw: any }
            | { Address32: any }
            | { Address20: any }
            | string
            | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Compact<u32>, MultiAddress]
      >;
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
      transfer: AugmentedSubmittable<
        (
          id: Compact<u32> | AnyNumber | Uint8Array,
          target:
            | MultiAddress
            | { Id: any }
            | { Index: any }
            | { Raw: any }
            | { Address32: any }
            | { Address20: any }
            | string
            | Uint8Array,
          amount: Compact<u64> | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Compact<u32>, MultiAddress, Compact<u64>]
      >;
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
      transferApproved: AugmentedSubmittable<
        (
          id: Compact<u32> | AnyNumber | Uint8Array,
          owner:
            | MultiAddress
            | { Id: any }
            | { Index: any }
            | { Raw: any }
            | { Address32: any }
            | { Address20: any }
            | string
            | Uint8Array,
          destination:
            | MultiAddress
            | { Id: any }
            | { Index: any }
            | { Raw: any }
            | { Address32: any }
            | { Address20: any }
            | string
            | Uint8Array,
          amount: Compact<u64> | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Compact<u32>, MultiAddress, MultiAddress, Compact<u64>]
      >;
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
      transferKeepAlive: AugmentedSubmittable<
        (
          id: Compact<u32> | AnyNumber | Uint8Array,
          target:
            | MultiAddress
            | { Id: any }
            | { Index: any }
            | { Raw: any }
            | { Address32: any }
            | { Address20: any }
            | string
            | Uint8Array,
          amount: Compact<u64> | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Compact<u32>, MultiAddress, Compact<u64>]
      >;
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
      transferOwnership: AugmentedSubmittable<
        (
          id: Compact<u32> | AnyNumber | Uint8Array,
          owner:
            | MultiAddress
            | { Id: any }
            | { Index: any }
            | { Raw: any }
            | { Address32: any }
            | { Address20: any }
            | string
            | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Compact<u32>, MultiAddress]
      >;
      /**
       * Generic tx
       **/
      [key: string]: SubmittableExtrinsicFunction<ApiType>;
    };
    balances: {
      /**
       * Adjust the total issuance in a saturating way.
       *
       * Can only be called by root and always needs a positive `delta`.
       *
       * # Example
       **/
      forceAdjustTotalIssuance: AugmentedSubmittable<
        (
          direction:
            | PalletBalancesAdjustmentDirection
            | 'Increase'
            | 'Decrease'
            | number
            | Uint8Array,
          delta: Compact<u64> | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [PalletBalancesAdjustmentDirection, Compact<u64>]
      >;
      /**
       * Set the regular balance of a given account.
       *
       * The dispatch origin for this call is `root`.
       **/
      forceSetBalance: AugmentedSubmittable<
        (
          who:
            | MultiAddress
            | { Id: any }
            | { Index: any }
            | { Raw: any }
            | { Address32: any }
            | { Address20: any }
            | string
            | Uint8Array,
          newFree: Compact<u64> | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [MultiAddress, Compact<u64>]
      >;
      /**
       * Exactly as `transfer_allow_death`, except the origin must be root and the source account
       * may be specified.
       **/
      forceTransfer: AugmentedSubmittable<
        (
          source:
            | MultiAddress
            | { Id: any }
            | { Index: any }
            | { Raw: any }
            | { Address32: any }
            | { Address20: any }
            | string
            | Uint8Array,
          dest:
            | MultiAddress
            | { Id: any }
            | { Index: any }
            | { Raw: any }
            | { Address32: any }
            | { Address20: any }
            | string
            | Uint8Array,
          value: Compact<u64> | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [MultiAddress, MultiAddress, Compact<u64>]
      >;
      /**
       * Unreserve some balance from a user by force.
       *
       * Can only be called by ROOT.
       **/
      forceUnreserve: AugmentedSubmittable<
        (
          who:
            | MultiAddress
            | { Id: any }
            | { Index: any }
            | { Raw: any }
            | { Address32: any }
            | { Address20: any }
            | string
            | Uint8Array,
          amount: u64 | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [MultiAddress, u64]
      >;
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
      transferAll: AugmentedSubmittable<
        (
          dest:
            | MultiAddress
            | { Id: any }
            | { Index: any }
            | { Raw: any }
            | { Address32: any }
            | { Address20: any }
            | string
            | Uint8Array,
          keepAlive: bool | boolean | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [MultiAddress, bool]
      >;
      /**
       * Transfer some liquid free balance to another account.
       *
       * `transfer_allow_death` will set the `FreeBalance` of the sender and receiver.
       * If the sender's account is below the existential deposit as a result
       * of the transfer, the account will be reaped.
       *
       * The dispatch origin for this call must be `Signed` by the transactor.
       **/
      transferAllowDeath: AugmentedSubmittable<
        (
          dest:
            | MultiAddress
            | { Id: any }
            | { Index: any }
            | { Raw: any }
            | { Address32: any }
            | { Address20: any }
            | string
            | Uint8Array,
          value: Compact<u64> | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [MultiAddress, Compact<u64>]
      >;
      /**
       * Same as the [`transfer_allow_death`] call, but with a check that the transfer will not
       * kill the origin account.
       *
       * 99% of the time you want [`transfer_allow_death`] instead.
       *
       * [`transfer_allow_death`]: struct.Pallet.html#method.transfer
       **/
      transferKeepAlive: AugmentedSubmittable<
        (
          dest:
            | MultiAddress
            | { Id: any }
            | { Index: any }
            | { Raw: any }
            | { Address32: any }
            | { Address20: any }
            | string
            | Uint8Array,
          value: Compact<u64> | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [MultiAddress, Compact<u64>]
      >;
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
      upgradeAccounts: AugmentedSubmittable<
        (
          who: Vec<AccountId32> | (AccountId32 | string | Uint8Array)[],
        ) => SubmittableExtrinsic<ApiType>,
        [Vec<AccountId32>]
      >;
      /**
       * Generic tx
       **/
      [key: string]: SubmittableExtrinsicFunction<ApiType>;
    };
    grandpa: {
      /**
       * Note that the current authority set of the GRANDPA finality gadget has stalled.
       *
       * This will trigger a forced authority set change at the beginning of the next session, to
       * be enacted `delay` blocks after that. The `delay` should be high enough to safely assume
       * that the block signalling the forced change will not be re-orged e.g. 1000 blocks.
       * The block production rate (which may be slowed down because of finality lagging) should
       * be taken into account when choosing the `delay`. The GRANDPA voters based on the new
       * authority will start voting on top of `best_finalized_block_number` for new finalized
       * blocks. `best_finalized_block_number` should be the highest of the latest finalized
       * block of all validators of the new authority set.
       *
       * Only callable by root.
       **/
      noteStalled: AugmentedSubmittable<
        (
          delay: u32 | AnyNumber | Uint8Array,
          bestFinalizedBlockNumber: u32 | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [u32, u32]
      >;
      /**
       * Report voter equivocation/misbehavior. This method will verify the
       * equivocation proof and validate the given key ownership proof
       * against the extracted offender. If both are valid, the offence
       * will be reported.
       **/
      reportEquivocation: AugmentedSubmittable<
        (
          equivocationProof:
            | SpConsensusGrandpaEquivocationProof
            | { setId?: any; equivocation?: any }
            | string
            | Uint8Array,
          keyOwnerProof: SpCoreVoid | null,
        ) => SubmittableExtrinsic<ApiType>,
        [SpConsensusGrandpaEquivocationProof, SpCoreVoid]
      >;
      /**
       * Report voter equivocation/misbehavior. This method will verify the
       * equivocation proof and validate the given key ownership proof
       * against the extracted offender. If both are valid, the offence
       * will be reported.
       *
       * This extrinsic must be called unsigned and it is expected that only
       * block authors will call it (validated in `ValidateUnsigned`), as such
       * if the block author is defined it will be defined as the equivocation
       * reporter.
       **/
      reportEquivocationUnsigned: AugmentedSubmittable<
        (
          equivocationProof:
            | SpConsensusGrandpaEquivocationProof
            | { setId?: any; equivocation?: any }
            | string
            | Uint8Array,
          keyOwnerProof: SpCoreVoid | null,
        ) => SubmittableExtrinsic<ApiType>,
        [SpConsensusGrandpaEquivocationProof, SpCoreVoid]
      >;
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
      addLiquidity: AugmentedSubmittable<
        (
          baseAsset:
            | FrameSupportTokensFungibleUnionOfNativeOrWithId
            | { Native: any }
            | { WithId: any }
            | string
            | Uint8Array,
          quoteAsset:
            | FrameSupportTokensFungibleUnionOfNativeOrWithId
            | { Native: any }
            | { WithId: any }
            | string
            | Uint8Array,
          baseAssetDesired: u64 | AnyNumber | Uint8Array,
          quoteAssetDesired: u64 | AnyNumber | Uint8Array,
          baseAssetMin: u64 | AnyNumber | Uint8Array,
          quoteAssetMin: u64 | AnyNumber | Uint8Array,
          mintTo: AccountId32 | string | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [
          FrameSupportTokensFungibleUnionOfNativeOrWithId,
          FrameSupportTokensFungibleUnionOfNativeOrWithId,
          u64,
          u64,
          u64,
          u64,
          AccountId32,
        ]
      >;
      cancelOrder: AugmentedSubmittable<
        (
          baseAsset:
            | FrameSupportTokensFungibleUnionOfNativeOrWithId
            | { Native: any }
            | { WithId: any }
            | string
            | Uint8Array,
          quoteAsset:
            | FrameSupportTokensFungibleUnionOfNativeOrWithId
            | { Native: any }
            | { WithId: any }
            | string
            | Uint8Array,
          price: u64 | AnyNumber | Uint8Array,
          orderId: u64 | AnyNumber | Uint8Array,
          quantity: u64 | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [
          FrameSupportTokensFungibleUnionOfNativeOrWithId,
          FrameSupportTokensFungibleUnionOfNativeOrWithId,
          u64,
          u64,
          u64,
        ]
      >;
      /**
       * Creates an empty liquidity pool and an associated new `lp_token` asset
       * (the id of which is returned in the `Event::PoolCreated` event).
       *
       * Once a pool is created, someone may [`Pallet::add_liquidity`] to it.
       **/
      createPool: AugmentedSubmittable<
        (
          baseAsset:
            | FrameSupportTokensFungibleUnionOfNativeOrWithId
            | { Native: any }
            | { WithId: any }
            | string
            | Uint8Array,
          quoteAsset:
            | FrameSupportTokensFungibleUnionOfNativeOrWithId
            | { Native: any }
            | { WithId: any }
            | string
            | Uint8Array,
          takerFeeRate: Permill | AnyNumber | Uint8Array,
          tickSize: u64 | AnyNumber | Uint8Array,
          lotSize: u64 | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [
          FrameSupportTokensFungibleUnionOfNativeOrWithId,
          FrameSupportTokensFungibleUnionOfNativeOrWithId,
          Permill,
          u64,
          u64,
        ]
      >;
      limitOrder: AugmentedSubmittable<
        (
          baseAsset:
            | FrameSupportTokensFungibleUnionOfNativeOrWithId
            | { Native: any }
            | { WithId: any }
            | string
            | Uint8Array,
          quoteAsset:
            | FrameSupportTokensFungibleUnionOfNativeOrWithId
            | { Native: any }
            | { WithId: any }
            | string
            | Uint8Array,
          isBid: bool | boolean | Uint8Array,
          price: u64 | AnyNumber | Uint8Array,
          quantity: u64 | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [
          FrameSupportTokensFungibleUnionOfNativeOrWithId,
          FrameSupportTokensFungibleUnionOfNativeOrWithId,
          bool,
          u64,
          u64,
        ]
      >;
      marketOrder: AugmentedSubmittable<
        (
          baseAsset:
            | FrameSupportTokensFungibleUnionOfNativeOrWithId
            | { Native: any }
            | { WithId: any }
            | string
            | Uint8Array,
          quoteAsset:
            | FrameSupportTokensFungibleUnionOfNativeOrWithId
            | { Native: any }
            | { WithId: any }
            | string
            | Uint8Array,
          quantity: u64 | AnyNumber | Uint8Array,
          isBid: bool | boolean | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [
          FrameSupportTokensFungibleUnionOfNativeOrWithId,
          FrameSupportTokensFungibleUnionOfNativeOrWithId,
          u64,
          bool,
        ]
      >;
      /**
       * Allows you to remove liquidity by providing the `lp_token_burn` tokens that will be
       * burned in the process. With the usage of `amount1_min_receive`/`amount2_min_receive`
       * it's possible to control the min amount of returned tokens you're happy with.
       **/
      removeLiquidity: AugmentedSubmittable<
        (
          baseAsset:
            | FrameSupportTokensFungibleUnionOfNativeOrWithId
            | { Native: any }
            | { WithId: any }
            | string
            | Uint8Array,
          quoteAsset:
            | FrameSupportTokensFungibleUnionOfNativeOrWithId
            | { Native: any }
            | { WithId: any }
            | string
            | Uint8Array,
          lpTokenBurn: u64 | AnyNumber | Uint8Array,
          baseAssetMinReceive: u64 | AnyNumber | Uint8Array,
          quoteAssetMinReceive: u64 | AnyNumber | Uint8Array,
          withdrawTo: AccountId32 | string | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [
          FrameSupportTokensFungibleUnionOfNativeOrWithId,
          FrameSupportTokensFungibleUnionOfNativeOrWithId,
          u64,
          u64,
          u64,
          AccountId32,
        ]
      >;
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
      touch: AugmentedSubmittable<
        (
          baseAsset:
            | FrameSupportTokensFungibleUnionOfNativeOrWithId
            | { Native: any }
            | { WithId: any }
            | string
            | Uint8Array,
          quoteAsset:
            | FrameSupportTokensFungibleUnionOfNativeOrWithId
            | { Native: any }
            | { WithId: any }
            | string
            | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [
          FrameSupportTokensFungibleUnionOfNativeOrWithId,
          FrameSupportTokensFungibleUnionOfNativeOrWithId,
        ]
      >;
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
      approveTransfer: AugmentedSubmittable<
        (
          id: Compact<u32> | AnyNumber | Uint8Array,
          delegate:
            | MultiAddress
            | { Id: any }
            | { Index: any }
            | { Raw: any }
            | { Address32: any }
            | { Address20: any }
            | string
            | Uint8Array,
          amount: Compact<u64> | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Compact<u32>, MultiAddress, Compact<u64>]
      >;
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
      block: AugmentedSubmittable<
        (
          id: Compact<u32> | AnyNumber | Uint8Array,
          who:
            | MultiAddress
            | { Id: any }
            | { Index: any }
            | { Raw: any }
            | { Address32: any }
            | { Address20: any }
            | string
            | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Compact<u32>, MultiAddress]
      >;
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
      burn: AugmentedSubmittable<
        (
          id: Compact<u32> | AnyNumber | Uint8Array,
          who:
            | MultiAddress
            | { Id: any }
            | { Index: any }
            | { Raw: any }
            | { Address32: any }
            | { Address20: any }
            | string
            | Uint8Array,
          amount: Compact<u64> | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Compact<u32>, MultiAddress, Compact<u64>]
      >;
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
      cancelApproval: AugmentedSubmittable<
        (
          id: Compact<u32> | AnyNumber | Uint8Array,
          delegate:
            | MultiAddress
            | { Id: any }
            | { Index: any }
            | { Raw: any }
            | { Address32: any }
            | { Address20: any }
            | string
            | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Compact<u32>, MultiAddress]
      >;
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
      clearMetadata: AugmentedSubmittable<
        (id: Compact<u32> | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [Compact<u32>]
      >;
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
       * an existing asset.
       * - `admin`: The admin of this class of assets. The admin is the initial address of each
       * member of the asset class's admin team.
       * - `min_balance`: The minimum balance of this new asset that any single account must
       * have. If an account's balance is reduced below this, then it collapses to zero.
       *
       * Emits `Created` event when successful.
       *
       * Weight: `O(1)`
       **/
      create: AugmentedSubmittable<
        (
          id: Compact<u32> | AnyNumber | Uint8Array,
          admin:
            | MultiAddress
            | { Id: any }
            | { Index: any }
            | { Raw: any }
            | { Address32: any }
            | { Address20: any }
            | string
            | Uint8Array,
          minBalance: u64 | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Compact<u32>, MultiAddress, u64]
      >;
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
      destroyAccounts: AugmentedSubmittable<
        (id: Compact<u32> | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [Compact<u32>]
      >;
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
      destroyApprovals: AugmentedSubmittable<
        (id: Compact<u32> | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [Compact<u32>]
      >;
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
      finishDestroy: AugmentedSubmittable<
        (id: Compact<u32> | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [Compact<u32>]
      >;
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
      forceAssetStatus: AugmentedSubmittable<
        (
          id: Compact<u32> | AnyNumber | Uint8Array,
          owner:
            | MultiAddress
            | { Id: any }
            | { Index: any }
            | { Raw: any }
            | { Address32: any }
            | { Address20: any }
            | string
            | Uint8Array,
          issuer:
            | MultiAddress
            | { Id: any }
            | { Index: any }
            | { Raw: any }
            | { Address32: any }
            | { Address20: any }
            | string
            | Uint8Array,
          admin:
            | MultiAddress
            | { Id: any }
            | { Index: any }
            | { Raw: any }
            | { Address32: any }
            | { Address20: any }
            | string
            | Uint8Array,
          freezer:
            | MultiAddress
            | { Id: any }
            | { Index: any }
            | { Raw: any }
            | { Address32: any }
            | { Address20: any }
            | string
            | Uint8Array,
          minBalance: Compact<u64> | AnyNumber | Uint8Array,
          isSufficient: bool | boolean | Uint8Array,
          isFrozen: bool | boolean | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [
          Compact<u32>,
          MultiAddress,
          MultiAddress,
          MultiAddress,
          MultiAddress,
          Compact<u64>,
          bool,
          bool,
        ]
      >;
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
      forceCancelApproval: AugmentedSubmittable<
        (
          id: Compact<u32> | AnyNumber | Uint8Array,
          owner:
            | MultiAddress
            | { Id: any }
            | { Index: any }
            | { Raw: any }
            | { Address32: any }
            | { Address20: any }
            | string
            | Uint8Array,
          delegate:
            | MultiAddress
            | { Id: any }
            | { Index: any }
            | { Raw: any }
            | { Address32: any }
            | { Address20: any }
            | string
            | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Compact<u32>, MultiAddress, MultiAddress]
      >;
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
      forceClearMetadata: AugmentedSubmittable<
        (id: Compact<u32> | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [Compact<u32>]
      >;
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
       * an existing asset.
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
      forceCreate: AugmentedSubmittable<
        (
          id: Compact<u32> | AnyNumber | Uint8Array,
          owner:
            | MultiAddress
            | { Id: any }
            | { Index: any }
            | { Raw: any }
            | { Address32: any }
            | { Address20: any }
            | string
            | Uint8Array,
          isSufficient: bool | boolean | Uint8Array,
          minBalance: Compact<u64> | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Compact<u32>, MultiAddress, bool, Compact<u64>]
      >;
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
      forceSetMetadata: AugmentedSubmittable<
        (
          id: Compact<u32> | AnyNumber | Uint8Array,
          name: Bytes | string | Uint8Array,
          symbol: Bytes | string | Uint8Array,
          decimals: u8 | AnyNumber | Uint8Array,
          isFrozen: bool | boolean | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Compact<u32>, Bytes, Bytes, u8, bool]
      >;
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
      forceTransfer: AugmentedSubmittable<
        (
          id: Compact<u32> | AnyNumber | Uint8Array,
          source:
            | MultiAddress
            | { Id: any }
            | { Index: any }
            | { Raw: any }
            | { Address32: any }
            | { Address20: any }
            | string
            | Uint8Array,
          dest:
            | MultiAddress
            | { Id: any }
            | { Index: any }
            | { Raw: any }
            | { Address32: any }
            | { Address20: any }
            | string
            | Uint8Array,
          amount: Compact<u64> | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Compact<u32>, MultiAddress, MultiAddress, Compact<u64>]
      >;
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
      freeze: AugmentedSubmittable<
        (
          id: Compact<u32> | AnyNumber | Uint8Array,
          who:
            | MultiAddress
            | { Id: any }
            | { Index: any }
            | { Raw: any }
            | { Address32: any }
            | { Address20: any }
            | string
            | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Compact<u32>, MultiAddress]
      >;
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
      freezeAsset: AugmentedSubmittable<
        (id: Compact<u32> | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [Compact<u32>]
      >;
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
      mint: AugmentedSubmittable<
        (
          id: Compact<u32> | AnyNumber | Uint8Array,
          beneficiary:
            | MultiAddress
            | { Id: any }
            | { Index: any }
            | { Raw: any }
            | { Address32: any }
            | { Address20: any }
            | string
            | Uint8Array,
          amount: Compact<u64> | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Compact<u32>, MultiAddress, Compact<u64>]
      >;
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
       * Emits `Refunded` event when successful.
       **/
      refund: AugmentedSubmittable<
        (
          id: Compact<u32> | AnyNumber | Uint8Array,
          allowBurn: bool | boolean | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Compact<u32>, bool]
      >;
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
       * Emits `Refunded` event when successful.
       **/
      refundOther: AugmentedSubmittable<
        (
          id: Compact<u32> | AnyNumber | Uint8Array,
          who:
            | MultiAddress
            | { Id: any }
            | { Index: any }
            | { Raw: any }
            | { Address32: any }
            | { Address20: any }
            | string
            | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Compact<u32>, MultiAddress]
      >;
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
      setMetadata: AugmentedSubmittable<
        (
          id: Compact<u32> | AnyNumber | Uint8Array,
          name: Bytes | string | Uint8Array,
          symbol: Bytes | string | Uint8Array,
          decimals: u8 | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Compact<u32>, Bytes, Bytes, u8]
      >;
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
      setMinBalance: AugmentedSubmittable<
        (
          id: Compact<u32> | AnyNumber | Uint8Array,
          minBalance: u64 | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Compact<u32>, u64]
      >;
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
      setTeam: AugmentedSubmittable<
        (
          id: Compact<u32> | AnyNumber | Uint8Array,
          issuer:
            | MultiAddress
            | { Id: any }
            | { Index: any }
            | { Raw: any }
            | { Address32: any }
            | { Address20: any }
            | string
            | Uint8Array,
          admin:
            | MultiAddress
            | { Id: any }
            | { Index: any }
            | { Raw: any }
            | { Address32: any }
            | { Address20: any }
            | string
            | Uint8Array,
          freezer:
            | MultiAddress
            | { Id: any }
            | { Index: any }
            | { Raw: any }
            | { Address32: any }
            | { Address20: any }
            | string
            | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Compact<u32>, MultiAddress, MultiAddress, MultiAddress]
      >;
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
       * The asset class must be frozen before calling `start_destroy`.
       **/
      startDestroy: AugmentedSubmittable<
        (id: Compact<u32> | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [Compact<u32>]
      >;
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
      thaw: AugmentedSubmittable<
        (
          id: Compact<u32> | AnyNumber | Uint8Array,
          who:
            | MultiAddress
            | { Id: any }
            | { Index: any }
            | { Raw: any }
            | { Address32: any }
            | { Address20: any }
            | string
            | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Compact<u32>, MultiAddress]
      >;
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
      thawAsset: AugmentedSubmittable<
        (id: Compact<u32> | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [Compact<u32>]
      >;
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
      touch: AugmentedSubmittable<
        (id: Compact<u32> | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [Compact<u32>]
      >;
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
      touchOther: AugmentedSubmittable<
        (
          id: Compact<u32> | AnyNumber | Uint8Array,
          who:
            | MultiAddress
            | { Id: any }
            | { Index: any }
            | { Raw: any }
            | { Address32: any }
            | { Address20: any }
            | string
            | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Compact<u32>, MultiAddress]
      >;
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
      transfer: AugmentedSubmittable<
        (
          id: Compact<u32> | AnyNumber | Uint8Array,
          target:
            | MultiAddress
            | { Id: any }
            | { Index: any }
            | { Raw: any }
            | { Address32: any }
            | { Address20: any }
            | string
            | Uint8Array,
          amount: Compact<u64> | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Compact<u32>, MultiAddress, Compact<u64>]
      >;
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
      transferApproved: AugmentedSubmittable<
        (
          id: Compact<u32> | AnyNumber | Uint8Array,
          owner:
            | MultiAddress
            | { Id: any }
            | { Index: any }
            | { Raw: any }
            | { Address32: any }
            | { Address20: any }
            | string
            | Uint8Array,
          destination:
            | MultiAddress
            | { Id: any }
            | { Index: any }
            | { Raw: any }
            | { Address32: any }
            | { Address20: any }
            | string
            | Uint8Array,
          amount: Compact<u64> | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Compact<u32>, MultiAddress, MultiAddress, Compact<u64>]
      >;
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
      transferKeepAlive: AugmentedSubmittable<
        (
          id: Compact<u32> | AnyNumber | Uint8Array,
          target:
            | MultiAddress
            | { Id: any }
            | { Index: any }
            | { Raw: any }
            | { Address32: any }
            | { Address20: any }
            | string
            | Uint8Array,
          amount: Compact<u64> | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Compact<u32>, MultiAddress, Compact<u64>]
      >;
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
      transferOwnership: AugmentedSubmittable<
        (
          id: Compact<u32> | AnyNumber | Uint8Array,
          owner:
            | MultiAddress
            | { Id: any }
            | { Index: any }
            | { Raw: any }
            | { Address32: any }
            | { Address20: any }
            | string
            | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Compact<u32>, MultiAddress]
      >;
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
      setKey: AugmentedSubmittable<
        (
          updated:
            | MultiAddress
            | { Id: any }
            | { Index: any }
            | { Raw: any }
            | { Address32: any }
            | { Address20: any }
            | string
            | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [MultiAddress]
      >;
      /**
       * Authenticates the sudo key and dispatches a function call with `Root` origin.
       **/
      sudo: AugmentedSubmittable<
        (call: Call | IMethod | string | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [Call]
      >;
      /**
       * Authenticates the sudo key and dispatches a function call with `Signed` origin from
       * a given account.
       *
       * The dispatch origin for this call must be _Signed_.
       **/
      sudoAs: AugmentedSubmittable<
        (
          who:
            | MultiAddress
            | { Id: any }
            | { Index: any }
            | { Raw: any }
            | { Address32: any }
            | { Address20: any }
            | string
            | Uint8Array,
          call: Call | IMethod | string | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [MultiAddress, Call]
      >;
      /**
       * Authenticates the sudo key and dispatches a function call with `Root` origin.
       * This function does not check the weight of the call, and instead allows the
       * Sudo user to specify the weight of the call.
       *
       * The dispatch origin for this call must be _Signed_.
       **/
      sudoUncheckedWeight: AugmentedSubmittable<
        (
          call: Call | IMethod | string | Uint8Array,
          weight:
            | SpWeightsWeightV2Weight
            | { refTime?: any; proofSize?: any }
            | string
            | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Call, SpWeightsWeightV2Weight]
      >;
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
      applyAuthorizedUpgrade: AugmentedSubmittable<
        (code: Bytes | string | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [Bytes]
      >;
      /**
       * Authorize an upgrade to a given `code_hash` for the runtime. The runtime can be supplied
       * later.
       *
       * This call requires Root origin.
       **/
      authorizeUpgrade: AugmentedSubmittable<
        (codeHash: H256 | string | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [H256]
      >;
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
      authorizeUpgradeWithoutChecks: AugmentedSubmittable<
        (codeHash: H256 | string | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [H256]
      >;
      /**
       * Kill all storage items with a key that starts with the given prefix.
       *
       * **NOTE:** We rely on the Root origin to provide us the number of subkeys under
       * the prefix we are removing to accurately calculate the weight of this function.
       **/
      killPrefix: AugmentedSubmittable<
        (
          prefix: Bytes | string | Uint8Array,
          subkeys: u32 | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Bytes, u32]
      >;
      /**
       * Kill some items from storage.
       **/
      killStorage: AugmentedSubmittable<
        (
          keys: Vec<Bytes> | (Bytes | string | Uint8Array)[],
        ) => SubmittableExtrinsic<ApiType>,
        [Vec<Bytes>]
      >;
      /**
       * Make some on-chain remark.
       *
       * Can be executed by every `origin`.
       **/
      remark: AugmentedSubmittable<
        (remark: Bytes | string | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [Bytes]
      >;
      /**
       * Make some on-chain remark and emit event.
       **/
      remarkWithEvent: AugmentedSubmittable<
        (remark: Bytes | string | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [Bytes]
      >;
      /**
       * Set the new runtime code.
       **/
      setCode: AugmentedSubmittable<
        (code: Bytes | string | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [Bytes]
      >;
      /**
       * Set the new runtime code without doing any checks of the given `code`.
       *
       * Note that runtime upgrades will not run if this is called with a not-increasing spec
       * version!
       **/
      setCodeWithoutChecks: AugmentedSubmittable<
        (code: Bytes | string | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [Bytes]
      >;
      /**
       * Set the number of pages in the WebAssembly environment's heap.
       **/
      setHeapPages: AugmentedSubmittable<
        (pages: u64 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [u64]
      >;
      /**
       * Set some items of storage.
       **/
      setStorage: AugmentedSubmittable<
        (
          items:
            | Vec<ITuple<[Bytes, Bytes]>>
            | [Bytes | string | Uint8Array, Bytes | string | Uint8Array][],
        ) => SubmittableExtrinsic<ApiType>,
        [Vec<ITuple<[Bytes, Bytes]>>]
      >;
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
      set: AugmentedSubmittable<
        (now: Compact<u64> | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [Compact<u64>]
      >;
      /**
       * Generic tx
       **/
      [key: string]: SubmittableExtrinsicFunction<ApiType>;
    };
  } // AugmentedSubmittables
} // declare module
