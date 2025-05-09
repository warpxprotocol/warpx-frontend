// Auto-generated via `yarn polkadot-types-from-defs`, do not edit
/* eslint-disable */

/* eslint-disable sort-keys */

export default {
  /**
   * Lookup3: frame_system::AccountInfo<Nonce, pallet_balances::types::AccountData<Balance>>
   **/
  FrameSystemAccountInfo: {
    nonce: 'u32',
    consumers: 'u32',
    providers: 'u32',
    sufficients: 'u32',
    data: 'PalletBalancesAccountData'
  },
  /**
   * Lookup5: pallet_balances::types::AccountData<Balance>
   **/
  PalletBalancesAccountData: {
    free: 'u128',
    reserved: 'u128',
    frozen: 'u128',
    flags: 'u128'
  },
  /**
   * Lookup9: frame_support::dispatch::PerDispatchClass<sp_weights::weight_v2::Weight>
   **/
  FrameSupportDispatchPerDispatchClassWeight: {
    normal: 'SpWeightsWeightV2Weight',
    operational: 'SpWeightsWeightV2Weight',
    mandatory: 'SpWeightsWeightV2Weight'
  },
  /**
   * Lookup10: sp_weights::weight_v2::Weight
   **/
  SpWeightsWeightV2Weight: {
    refTime: 'Compact<u64>',
    proofSize: 'Compact<u64>'
  },
  /**
   * Lookup15: sp_runtime::generic::digest::Digest
   **/
  SpRuntimeDigest: {
    logs: 'Vec<SpRuntimeDigestDigestItem>'
  },
  /**
   * Lookup17: sp_runtime::generic::digest::DigestItem
   **/
  SpRuntimeDigestDigestItem: {
    _enum: {
      Other: 'Bytes',
      __Unused1: 'Null',
      __Unused2: 'Null',
      __Unused3: 'Null',
      Consensus: '([u8;4],Bytes)',
      Seal: '([u8;4],Bytes)',
      PreRuntime: '([u8;4],Bytes)',
      __Unused7: 'Null',
      RuntimeEnvironmentUpdated: 'Null'
    }
  },
  /**
   * Lookup20: frame_system::EventRecord<warpx_runtime::RuntimeEvent, primitive_types::H256>
   **/
  FrameSystemEventRecord: {
    phase: 'FrameSystemPhase',
    event: 'Event',
    topics: 'Vec<H256>'
  },
  /**
   * Lookup22: frame_system::pallet::Event<T>
   **/
  FrameSystemEvent: {
    _enum: {
      ExtrinsicSuccess: {
        dispatchInfo: 'FrameSystemDispatchEventInfo',
      },
      ExtrinsicFailed: {
        dispatchError: 'SpRuntimeDispatchError',
        dispatchInfo: 'FrameSystemDispatchEventInfo',
      },
      CodeUpdated: 'Null',
      NewAccount: {
        account: 'AccountId32',
      },
      KilledAccount: {
        account: 'AccountId32',
      },
      Remarked: {
        _alias: {
          hash_: 'hash',
        },
        sender: 'AccountId32',
        hash_: 'H256',
      },
      UpgradeAuthorized: {
        codeHash: 'H256',
        checkVersion: 'bool',
      },
      RejectedInvalidAuthorizedUpgrade: {
        codeHash: 'H256',
        error: 'SpRuntimeDispatchError'
      }
    }
  },
  /**
   * Lookup23: frame_system::DispatchEventInfo
   **/
  FrameSystemDispatchEventInfo: {
    weight: 'SpWeightsWeightV2Weight',
    class: 'FrameSupportDispatchDispatchClass',
    paysFee: 'FrameSupportDispatchPays'
  },
  /**
   * Lookup24: frame_support::dispatch::DispatchClass
   **/
  FrameSupportDispatchDispatchClass: {
    _enum: ['Normal', 'Operational', 'Mandatory']
  },
  /**
   * Lookup25: frame_support::dispatch::Pays
   **/
  FrameSupportDispatchPays: {
    _enum: ['Yes', 'No']
  },
  /**
   * Lookup26: sp_runtime::DispatchError
   **/
  SpRuntimeDispatchError: {
    _enum: {
      Other: 'Null',
      CannotLookup: 'Null',
      BadOrigin: 'Null',
      Module: 'SpRuntimeModuleError',
      ConsumerRemaining: 'Null',
      NoProviders: 'Null',
      TooManyConsumers: 'Null',
      Token: 'SpRuntimeTokenError',
      Arithmetic: 'SpArithmeticArithmeticError',
      Transactional: 'SpRuntimeTransactionalError',
      Exhausted: 'Null',
      Corruption: 'Null',
      Unavailable: 'Null',
      RootNotAllowed: 'Null',
      Trie: 'SpRuntimeProvingTrieTrieError'
    }
  },
  /**
   * Lookup27: sp_runtime::ModuleError
   **/
  SpRuntimeModuleError: {
    index: 'u8',
    error: '[u8;4]'
  },
  /**
   * Lookup28: sp_runtime::TokenError
   **/
  SpRuntimeTokenError: {
    _enum: ['FundsUnavailable', 'OnlyProvider', 'BelowMinimum', 'CannotCreate', 'UnknownAsset', 'Frozen', 'Unsupported', 'CannotCreateHold', 'NotExpendable', 'Blocked']
  },
  /**
   * Lookup29: sp_arithmetic::ArithmeticError
   **/
  SpArithmeticArithmeticError: {
    _enum: ['Underflow', 'Overflow', 'DivisionByZero']
  },
  /**
   * Lookup30: sp_runtime::TransactionalError
   **/
  SpRuntimeTransactionalError: {
    _enum: ['LimitReached', 'NoLayer']
  },
  /**
   * Lookup31: sp_runtime::proving_trie::TrieError
   **/
  SpRuntimeProvingTrieTrieError: {
    _enum: ['InvalidStateRoot', 'IncompleteDatabase', 'ValueAtIncompleteKey', 'DecoderError', 'InvalidHash', 'DuplicateKey', 'ExtraneousNode', 'ExtraneousValue', 'ExtraneousHashReference', 'InvalidChildReference', 'ValueMismatch', 'IncompleteProof', 'RootMismatch', 'DecodeError']
  },
  /**
   * Lookup32: cumulus_pallet_parachain_system::pallet::Event<T>
   **/
  CumulusPalletParachainSystemEvent: {
    _enum: {
      ValidationFunctionStored: 'Null',
      ValidationFunctionApplied: {
        relayChainBlockNum: 'u32',
      },
      ValidationFunctionDiscarded: 'Null',
      DownwardMessagesReceived: {
        count: 'u32',
      },
      DownwardMessagesProcessed: {
        weightUsed: 'SpWeightsWeightV2Weight',
        dmqHead: 'H256',
      },
      UpwardMessageSent: {
        messageHash: 'Option<[u8;32]>'
      }
    }
  },
  /**
   * Lookup34: pallet_balances::pallet::Event<T, I>
   **/
  PalletBalancesEvent: {
    _enum: {
      Endowed: {
        account: 'AccountId32',
        freeBalance: 'u128',
      },
      DustLost: {
        account: 'AccountId32',
        amount: 'u128',
      },
      Transfer: {
        from: 'AccountId32',
        to: 'AccountId32',
        amount: 'u128',
      },
      BalanceSet: {
        who: 'AccountId32',
        free: 'u128',
      },
      Reserved: {
        who: 'AccountId32',
        amount: 'u128',
      },
      Unreserved: {
        who: 'AccountId32',
        amount: 'u128',
      },
      ReserveRepatriated: {
        from: 'AccountId32',
        to: 'AccountId32',
        amount: 'u128',
        destinationStatus: 'FrameSupportTokensMiscBalanceStatus',
      },
      Deposit: {
        who: 'AccountId32',
        amount: 'u128',
      },
      Withdraw: {
        who: 'AccountId32',
        amount: 'u128',
      },
      Slashed: {
        who: 'AccountId32',
        amount: 'u128',
      },
      Minted: {
        who: 'AccountId32',
        amount: 'u128',
      },
      Burned: {
        who: 'AccountId32',
        amount: 'u128',
      },
      Suspended: {
        who: 'AccountId32',
        amount: 'u128',
      },
      Restored: {
        who: 'AccountId32',
        amount: 'u128',
      },
      Upgraded: {
        who: 'AccountId32',
      },
      Issued: {
        amount: 'u128',
      },
      Rescinded: {
        amount: 'u128',
      },
      Locked: {
        who: 'AccountId32',
        amount: 'u128',
      },
      Unlocked: {
        who: 'AccountId32',
        amount: 'u128',
      },
      Frozen: {
        who: 'AccountId32',
        amount: 'u128',
      },
      Thawed: {
        who: 'AccountId32',
        amount: 'u128',
      },
      TotalIssuanceForced: {
        _alias: {
          new_: 'new',
        },
        old: 'u128',
        new_: 'u128'
      }
    }
  },
  /**
   * Lookup35: frame_support::traits::tokens::misc::BalanceStatus
   **/
  FrameSupportTokensMiscBalanceStatus: {
    _enum: ['Free', 'Reserved']
  },
  /**
   * Lookup36: pallet_transaction_payment::pallet::Event<T>
   **/
  PalletTransactionPaymentEvent: {
    _enum: {
      TransactionFeePaid: {
        who: 'AccountId32',
        actualFee: 'u128',
        tip: 'u128'
      }
    }
  },
  /**
   * Lookup37: pallet_collator_selection::pallet::Event<T>
   **/
  PalletCollatorSelectionEvent: {
    _enum: {
      NewInvulnerables: {
        invulnerables: 'Vec<AccountId32>',
      },
      InvulnerableAdded: {
        accountId: 'AccountId32',
      },
      InvulnerableRemoved: {
        accountId: 'AccountId32',
      },
      NewDesiredCandidates: {
        desiredCandidates: 'u32',
      },
      NewCandidacyBond: {
        bondAmount: 'u128',
      },
      CandidateAdded: {
        accountId: 'AccountId32',
        deposit: 'u128',
      },
      CandidateBondUpdated: {
        accountId: 'AccountId32',
        deposit: 'u128',
      },
      CandidateRemoved: {
        accountId: 'AccountId32',
      },
      CandidateReplaced: {
        _alias: {
          new_: 'new',
        },
        old: 'AccountId32',
        new_: 'AccountId32',
        deposit: 'u128',
      },
      InvalidInvulnerableSkipped: {
        accountId: 'AccountId32'
      }
    }
  },
  /**
   * Lookup39: pallet_session::pallet::Event<T>
   **/
  PalletSessionEvent: {
    _enum: {
      NewSession: {
        sessionIndex: 'u32',
      },
      ValidatorDisabled: {
        validator: 'AccountId32',
      },
      ValidatorReenabled: {
        validator: 'AccountId32'
      }
    }
  },
  /**
   * Lookup40: cumulus_pallet_xcmp_queue::pallet::Event<T>
   **/
  CumulusPalletXcmpQueueEvent: {
    _enum: {
      XcmpMessageSent: {
        messageHash: '[u8;32]'
      }
    }
  },
  /**
   * Lookup41: pallet_xcm::pallet::Event<T>
   **/
  PalletXcmEvent: {
    _enum: {
      Attempted: {
        outcome: 'StagingXcmV5TraitsOutcome',
      },
      Sent: {
        origin: 'StagingXcmV5Location',
        destination: 'StagingXcmV5Location',
        message: 'StagingXcmV5Xcm',
        messageId: '[u8;32]',
      },
      SendFailed: {
        origin: 'StagingXcmV5Location',
        destination: 'StagingXcmV5Location',
        error: 'XcmV3TraitsSendError',
        messageId: '[u8;32]',
      },
      ProcessXcmError: {
        origin: 'StagingXcmV5Location',
        error: 'XcmV5TraitsError',
        messageId: '[u8;32]',
      },
      UnexpectedResponse: {
        origin: 'StagingXcmV5Location',
        queryId: 'u64',
      },
      ResponseReady: {
        queryId: 'u64',
        response: 'StagingXcmV5Response',
      },
      Notified: {
        queryId: 'u64',
        palletIndex: 'u8',
        callIndex: 'u8',
      },
      NotifyOverweight: {
        queryId: 'u64',
        palletIndex: 'u8',
        callIndex: 'u8',
        actualWeight: 'SpWeightsWeightV2Weight',
        maxBudgetedWeight: 'SpWeightsWeightV2Weight',
      },
      NotifyDispatchError: {
        queryId: 'u64',
        palletIndex: 'u8',
        callIndex: 'u8',
      },
      NotifyDecodeFailed: {
        queryId: 'u64',
        palletIndex: 'u8',
        callIndex: 'u8',
      },
      InvalidResponder: {
        origin: 'StagingXcmV5Location',
        queryId: 'u64',
        expectedLocation: 'Option<StagingXcmV5Location>',
      },
      InvalidResponderVersion: {
        origin: 'StagingXcmV5Location',
        queryId: 'u64',
      },
      ResponseTaken: {
        queryId: 'u64',
      },
      AssetsTrapped: {
        _alias: {
          hash_: 'hash',
        },
        hash_: 'H256',
        origin: 'StagingXcmV5Location',
        assets: 'XcmVersionedAssets',
      },
      VersionChangeNotified: {
        destination: 'StagingXcmV5Location',
        result: 'u32',
        cost: 'StagingXcmV5AssetAssets',
        messageId: '[u8;32]',
      },
      SupportedVersionChanged: {
        location: 'StagingXcmV5Location',
        version: 'u32',
      },
      NotifyTargetSendFail: {
        location: 'StagingXcmV5Location',
        queryId: 'u64',
        error: 'XcmV5TraitsError',
      },
      NotifyTargetMigrationFail: {
        location: 'XcmVersionedLocation',
        queryId: 'u64',
      },
      InvalidQuerierVersion: {
        origin: 'StagingXcmV5Location',
        queryId: 'u64',
      },
      InvalidQuerier: {
        origin: 'StagingXcmV5Location',
        queryId: 'u64',
        expectedQuerier: 'StagingXcmV5Location',
        maybeActualQuerier: 'Option<StagingXcmV5Location>',
      },
      VersionNotifyStarted: {
        destination: 'StagingXcmV5Location',
        cost: 'StagingXcmV5AssetAssets',
        messageId: '[u8;32]',
      },
      VersionNotifyRequested: {
        destination: 'StagingXcmV5Location',
        cost: 'StagingXcmV5AssetAssets',
        messageId: '[u8;32]',
      },
      VersionNotifyUnrequested: {
        destination: 'StagingXcmV5Location',
        cost: 'StagingXcmV5AssetAssets',
        messageId: '[u8;32]',
      },
      FeesPaid: {
        paying: 'StagingXcmV5Location',
        fees: 'StagingXcmV5AssetAssets',
      },
      AssetsClaimed: {
        _alias: {
          hash_: 'hash',
        },
        hash_: 'H256',
        origin: 'StagingXcmV5Location',
        assets: 'XcmVersionedAssets',
      },
      VersionMigrationFinished: {
        version: 'u32',
      },
      AliasAuthorized: {
        aliaser: 'StagingXcmV5Location',
        target: 'StagingXcmV5Location',
        expiry: 'Option<u64>',
      },
      AliasAuthorizationRemoved: {
        aliaser: 'StagingXcmV5Location',
        target: 'StagingXcmV5Location',
      },
      AliasesAuthorizationsRemoved: {
        target: 'StagingXcmV5Location'
      }
    }
  },
  /**
   * Lookup42: staging_xcm::v5::traits::Outcome
   **/
  StagingXcmV5TraitsOutcome: {
    _enum: {
      Complete: {
        used: 'SpWeightsWeightV2Weight',
      },
      Incomplete: {
        used: 'SpWeightsWeightV2Weight',
        error: 'XcmV5TraitsError',
      },
      Error: {
        error: 'XcmV5TraitsError'
      }
    }
  },
  /**
   * Lookup43: xcm::v5::traits::Error
   **/
  XcmV5TraitsError: {
    _enum: {
      Overflow: 'Null',
      Unimplemented: 'Null',
      UntrustedReserveLocation: 'Null',
      UntrustedTeleportLocation: 'Null',
      LocationFull: 'Null',
      LocationNotInvertible: 'Null',
      BadOrigin: 'Null',
      InvalidLocation: 'Null',
      AssetNotFound: 'Null',
      FailedToTransactAsset: 'Null',
      NotWithdrawable: 'Null',
      LocationCannotHold: 'Null',
      ExceedsMaxMessageSize: 'Null',
      DestinationUnsupported: 'Null',
      Transport: 'Null',
      Unroutable: 'Null',
      UnknownClaim: 'Null',
      FailedToDecode: 'Null',
      MaxWeightInvalid: 'Null',
      NotHoldingFees: 'Null',
      TooExpensive: 'Null',
      Trap: 'u64',
      ExpectationFalse: 'Null',
      PalletNotFound: 'Null',
      NameMismatch: 'Null',
      VersionIncompatible: 'Null',
      HoldingWouldOverflow: 'Null',
      ExportError: 'Null',
      ReanchorFailed: 'Null',
      NoDeal: 'Null',
      FeesNotMet: 'Null',
      LockError: 'Null',
      NoPermission: 'Null',
      Unanchored: 'Null',
      NotDepositable: 'Null',
      TooManyAssets: 'Null',
      UnhandledXcmVersion: 'Null',
      WeightLimitReached: 'SpWeightsWeightV2Weight',
      Barrier: 'Null',
      WeightNotComputable: 'Null',
      ExceedsStackLimit: 'Null'
    }
  },
  /**
   * Lookup44: staging_xcm::v5::location::Location
   **/
  StagingXcmV5Location: {
    parents: 'u8',
    interior: 'StagingXcmV5Junctions'
  },
  /**
   * Lookup45: staging_xcm::v5::junctions::Junctions
   **/
  StagingXcmV5Junctions: {
    _enum: {
      Here: 'Null',
      X1: '[Lookup47;1]',
      X2: '[Lookup47;2]',
      X3: '[Lookup47;3]',
      X4: '[Lookup47;4]',
      X5: '[Lookup47;5]',
      X6: '[Lookup47;6]',
      X7: '[Lookup47;7]',
      X8: '[Lookup47;8]'
    }
  },
  /**
   * Lookup47: staging_xcm::v5::junction::Junction
   **/
  StagingXcmV5Junction: {
    _enum: {
      Parachain: 'Compact<u32>',
      AccountId32: {
        network: 'Option<StagingXcmV5JunctionNetworkId>',
        id: '[u8;32]',
      },
      AccountIndex64: {
        network: 'Option<StagingXcmV5JunctionNetworkId>',
        index: 'Compact<u64>',
      },
      AccountKey20: {
        network: 'Option<StagingXcmV5JunctionNetworkId>',
        key: '[u8;20]',
      },
      PalletInstance: 'u8',
      GeneralIndex: 'Compact<u128>',
      GeneralKey: {
        length: 'u8',
        data: '[u8;32]',
      },
      OnlyChild: 'Null',
      Plurality: {
        id: 'XcmV3JunctionBodyId',
        part: 'XcmV3JunctionBodyPart',
      },
      GlobalConsensus: 'StagingXcmV5JunctionNetworkId'
    }
  },
  /**
   * Lookup50: staging_xcm::v5::junction::NetworkId
   **/
  StagingXcmV5JunctionNetworkId: {
    _enum: {
      ByGenesis: '[u8;32]',
      ByFork: {
        blockNumber: 'u64',
        blockHash: '[u8;32]',
      },
      Polkadot: 'Null',
      Kusama: 'Null',
      __Unused4: 'Null',
      __Unused5: 'Null',
      __Unused6: 'Null',
      Ethereum: {
        chainId: 'Compact<u64>',
      },
      BitcoinCore: 'Null',
      BitcoinCash: 'Null',
      PolkadotBulletin: 'Null'
    }
  },
  /**
   * Lookup53: xcm::v3::junction::BodyId
   **/
  XcmV3JunctionBodyId: {
    _enum: {
      Unit: 'Null',
      Moniker: '[u8;4]',
      Index: 'Compact<u32>',
      Executive: 'Null',
      Technical: 'Null',
      Legislative: 'Null',
      Judicial: 'Null',
      Defense: 'Null',
      Administration: 'Null',
      Treasury: 'Null'
    }
  },
  /**
   * Lookup54: xcm::v3::junction::BodyPart
   **/
  XcmV3JunctionBodyPart: {
    _enum: {
      Voice: 'Null',
      Members: {
        count: 'Compact<u32>',
      },
      Fraction: {
        nom: 'Compact<u32>',
        denom: 'Compact<u32>',
      },
      AtLeastProportion: {
        nom: 'Compact<u32>',
        denom: 'Compact<u32>',
      },
      MoreThanProportion: {
        nom: 'Compact<u32>',
        denom: 'Compact<u32>'
      }
    }
  },
  /**
   * Lookup62: staging_xcm::v5::Xcm<Call>
   **/
  StagingXcmV5Xcm: 'Vec<StagingXcmV5Instruction>',
  /**
   * Lookup64: staging_xcm::v5::Instruction<Call>
   **/
  StagingXcmV5Instruction: {
    _enum: {
      WithdrawAsset: 'StagingXcmV5AssetAssets',
      ReserveAssetDeposited: 'StagingXcmV5AssetAssets',
      ReceiveTeleportedAsset: 'StagingXcmV5AssetAssets',
      QueryResponse: {
        queryId: 'Compact<u64>',
        response: 'StagingXcmV5Response',
        maxWeight: 'SpWeightsWeightV2Weight',
        querier: 'Option<StagingXcmV5Location>',
      },
      TransferAsset: {
        assets: 'StagingXcmV5AssetAssets',
        beneficiary: 'StagingXcmV5Location',
      },
      TransferReserveAsset: {
        assets: 'StagingXcmV5AssetAssets',
        dest: 'StagingXcmV5Location',
        xcm: 'StagingXcmV5Xcm',
      },
      Transact: {
        originKind: 'XcmV3OriginKind',
        fallbackMaxWeight: 'Option<SpWeightsWeightV2Weight>',
        call: 'XcmDoubleEncoded',
      },
      HrmpNewChannelOpenRequest: {
        sender: 'Compact<u32>',
        maxMessageSize: 'Compact<u32>',
        maxCapacity: 'Compact<u32>',
      },
      HrmpChannelAccepted: {
        recipient: 'Compact<u32>',
      },
      HrmpChannelClosing: {
        initiator: 'Compact<u32>',
        sender: 'Compact<u32>',
        recipient: 'Compact<u32>',
      },
      ClearOrigin: 'Null',
      DescendOrigin: 'StagingXcmV5Junctions',
      ReportError: 'StagingXcmV5QueryResponseInfo',
      DepositAsset: {
        assets: 'StagingXcmV5AssetAssetFilter',
        beneficiary: 'StagingXcmV5Location',
      },
      DepositReserveAsset: {
        assets: 'StagingXcmV5AssetAssetFilter',
        dest: 'StagingXcmV5Location',
        xcm: 'StagingXcmV5Xcm',
      },
      ExchangeAsset: {
        give: 'StagingXcmV5AssetAssetFilter',
        want: 'StagingXcmV5AssetAssets',
        maximal: 'bool',
      },
      InitiateReserveWithdraw: {
        assets: 'StagingXcmV5AssetAssetFilter',
        reserve: 'StagingXcmV5Location',
        xcm: 'StagingXcmV5Xcm',
      },
      InitiateTeleport: {
        assets: 'StagingXcmV5AssetAssetFilter',
        dest: 'StagingXcmV5Location',
        xcm: 'StagingXcmV5Xcm',
      },
      ReportHolding: {
        responseInfo: 'StagingXcmV5QueryResponseInfo',
        assets: 'StagingXcmV5AssetAssetFilter',
      },
      BuyExecution: {
        fees: 'StagingXcmV5Asset',
        weightLimit: 'XcmV3WeightLimit',
      },
      RefundSurplus: 'Null',
      SetErrorHandler: 'StagingXcmV5Xcm',
      SetAppendix: 'StagingXcmV5Xcm',
      ClearError: 'Null',
      ClaimAsset: {
        assets: 'StagingXcmV5AssetAssets',
        ticket: 'StagingXcmV5Location',
      },
      Trap: 'Compact<u64>',
      SubscribeVersion: {
        queryId: 'Compact<u64>',
        maxResponseWeight: 'SpWeightsWeightV2Weight',
      },
      UnsubscribeVersion: 'Null',
      BurnAsset: 'StagingXcmV5AssetAssets',
      ExpectAsset: 'StagingXcmV5AssetAssets',
      ExpectOrigin: 'Option<StagingXcmV5Location>',
      ExpectError: 'Option<(u32,XcmV5TraitsError)>',
      ExpectTransactStatus: 'XcmV3MaybeErrorCode',
      QueryPallet: {
        moduleName: 'Bytes',
        responseInfo: 'StagingXcmV5QueryResponseInfo',
      },
      ExpectPallet: {
        index: 'Compact<u32>',
        name: 'Bytes',
        moduleName: 'Bytes',
        crateMajor: 'Compact<u32>',
        minCrateMinor: 'Compact<u32>',
      },
      ReportTransactStatus: 'StagingXcmV5QueryResponseInfo',
      ClearTransactStatus: 'Null',
      UniversalOrigin: 'StagingXcmV5Junction',
      ExportMessage: {
        network: 'StagingXcmV5JunctionNetworkId',
        destination: 'StagingXcmV5Junctions',
        xcm: 'StagingXcmV5Xcm',
      },
      LockAsset: {
        asset: 'StagingXcmV5Asset',
        unlocker: 'StagingXcmV5Location',
      },
      UnlockAsset: {
        asset: 'StagingXcmV5Asset',
        target: 'StagingXcmV5Location',
      },
      NoteUnlockable: {
        asset: 'StagingXcmV5Asset',
        owner: 'StagingXcmV5Location',
      },
      RequestUnlock: {
        asset: 'StagingXcmV5Asset',
        locker: 'StagingXcmV5Location',
      },
      SetFeesMode: {
        jitWithdraw: 'bool',
      },
      SetTopic: '[u8;32]',
      ClearTopic: 'Null',
      AliasOrigin: 'StagingXcmV5Location',
      UnpaidExecution: {
        weightLimit: 'XcmV3WeightLimit',
        checkOrigin: 'Option<StagingXcmV5Location>',
      },
      PayFees: {
        asset: 'StagingXcmV5Asset',
      },
      InitiateTransfer: {
        destination: 'StagingXcmV5Location',
        remoteFees: 'Option<StagingXcmV5AssetAssetTransferFilter>',
        preserveOrigin: 'bool',
        assets: 'Vec<StagingXcmV5AssetAssetTransferFilter>',
        remoteXcm: 'StagingXcmV5Xcm',
      },
      ExecuteWithOrigin: {
        descendantOrigin: 'Option<StagingXcmV5Junctions>',
        xcm: 'StagingXcmV5Xcm',
      },
      SetHints: {
        hints: 'Vec<StagingXcmV5Hint>'
      }
    }
  },
  /**
   * Lookup65: staging_xcm::v5::asset::Assets
   **/
  StagingXcmV5AssetAssets: 'Vec<StagingXcmV5Asset>',
  /**
   * Lookup67: staging_xcm::v5::asset::Asset
   **/
  StagingXcmV5Asset: {
    id: 'StagingXcmV5AssetAssetId',
    fun: 'StagingXcmV5AssetFungibility'
  },
  /**
   * Lookup68: staging_xcm::v5::asset::AssetId
   **/
  StagingXcmV5AssetAssetId: 'StagingXcmV5Location',
  /**
   * Lookup69: staging_xcm::v5::asset::Fungibility
   **/
  StagingXcmV5AssetFungibility: {
    _enum: {
      Fungible: 'Compact<u128>',
      NonFungible: 'StagingXcmV5AssetAssetInstance'
    }
  },
  /**
   * Lookup70: staging_xcm::v5::asset::AssetInstance
   **/
  StagingXcmV5AssetAssetInstance: {
    _enum: {
      Undefined: 'Null',
      Index: 'Compact<u128>',
      Array4: '[u8;4]',
      Array8: '[u8;8]',
      Array16: '[u8;16]',
      Array32: '[u8;32]'
    }
  },
  /**
   * Lookup73: staging_xcm::v5::Response
   **/
  StagingXcmV5Response: {
    _enum: {
      Null: 'Null',
      Assets: 'StagingXcmV5AssetAssets',
      ExecutionResult: 'Option<(u32,XcmV5TraitsError)>',
      Version: 'u32',
      PalletsInfo: 'Vec<StagingXcmV5PalletInfo>',
      DispatchResult: 'XcmV3MaybeErrorCode'
    }
  },
  /**
   * Lookup77: staging_xcm::v5::PalletInfo
   **/
  StagingXcmV5PalletInfo: {
    index: 'Compact<u32>',
    name: 'Bytes',
    moduleName: 'Bytes',
    major: 'Compact<u32>',
    minor: 'Compact<u32>',
    patch: 'Compact<u32>'
  },
  /**
   * Lookup80: xcm::v3::MaybeErrorCode
   **/
  XcmV3MaybeErrorCode: {
    _enum: {
      Success: 'Null',
      Error: 'Bytes',
      TruncatedError: 'Bytes'
    }
  },
  /**
   * Lookup83: xcm::v3::OriginKind
   **/
  XcmV3OriginKind: {
    _enum: ['Native', 'SovereignAccount', 'Superuser', 'Xcm']
  },
  /**
   * Lookup85: xcm::double_encoded::DoubleEncoded<T>
   **/
  XcmDoubleEncoded: {
    encoded: 'Bytes'
  },
  /**
   * Lookup86: staging_xcm::v5::QueryResponseInfo
   **/
  StagingXcmV5QueryResponseInfo: {
    destination: 'StagingXcmV5Location',
    queryId: 'Compact<u64>',
    maxWeight: 'SpWeightsWeightV2Weight'
  },
  /**
   * Lookup87: staging_xcm::v5::asset::AssetFilter
   **/
  StagingXcmV5AssetAssetFilter: {
    _enum: {
      Definite: 'StagingXcmV5AssetAssets',
      Wild: 'StagingXcmV5AssetWildAsset'
    }
  },
  /**
   * Lookup88: staging_xcm::v5::asset::WildAsset
   **/
  StagingXcmV5AssetWildAsset: {
    _enum: {
      All: 'Null',
      AllOf: {
        id: 'StagingXcmV5AssetAssetId',
        fun: 'StagingXcmV5AssetWildFungibility',
      },
      AllCounted: 'Compact<u32>',
      AllOfCounted: {
        id: 'StagingXcmV5AssetAssetId',
        fun: 'StagingXcmV5AssetWildFungibility',
        count: 'Compact<u32>'
      }
    }
  },
  /**
   * Lookup89: staging_xcm::v5::asset::WildFungibility
   **/
  StagingXcmV5AssetWildFungibility: {
    _enum: ['Fungible', 'NonFungible']
  },
  /**
   * Lookup90: xcm::v3::WeightLimit
   **/
  XcmV3WeightLimit: {
    _enum: {
      Unlimited: 'Null',
      Limited: 'SpWeightsWeightV2Weight'
    }
  },
  /**
   * Lookup92: staging_xcm::v5::asset::AssetTransferFilter
   **/
  StagingXcmV5AssetAssetTransferFilter: {
    _enum: {
      Teleport: 'StagingXcmV5AssetAssetFilter',
      ReserveDeposit: 'StagingXcmV5AssetAssetFilter',
      ReserveWithdraw: 'StagingXcmV5AssetAssetFilter'
    }
  },
  /**
   * Lookup97: staging_xcm::v5::Hint
   **/
  StagingXcmV5Hint: {
    _enum: {
      AssetClaimer: {
        location: 'StagingXcmV5Location'
      }
    }
  },
  /**
   * Lookup99: xcm::v3::traits::SendError
   **/
  XcmV3TraitsSendError: {
    _enum: ['NotApplicable', 'Transport', 'Unroutable', 'DestinationUnsupported', 'ExceedsMaxMessageSize', 'MissingArgument', 'Fees']
  },
  /**
   * Lookup100: xcm::VersionedAssets
   **/
  XcmVersionedAssets: {
    _enum: {
      __Unused0: 'Null',
      __Unused1: 'Null',
      __Unused2: 'Null',
      V3: 'XcmV3MultiassetMultiAssets',
      V4: 'StagingXcmV4AssetAssets',
      V5: 'StagingXcmV5AssetAssets'
    }
  },
  /**
   * Lookup101: xcm::v3::multiasset::MultiAssets
   **/
  XcmV3MultiassetMultiAssets: 'Vec<XcmV3MultiAsset>',
  /**
   * Lookup103: xcm::v3::multiasset::MultiAsset
   **/
  XcmV3MultiAsset: {
    id: 'XcmV3MultiassetAssetId',
    fun: 'XcmV3MultiassetFungibility'
  },
  /**
   * Lookup104: xcm::v3::multiasset::AssetId
   **/
  XcmV3MultiassetAssetId: {
    _enum: {
      Concrete: 'StagingXcmV3MultiLocation',
      Abstract: '[u8;32]'
    }
  },
  /**
   * Lookup105: staging_xcm::v3::multilocation::MultiLocation
   **/
  StagingXcmV3MultiLocation: {
    parents: 'u8',
    interior: 'XcmV3Junctions'
  },
  /**
   * Lookup106: xcm::v3::junctions::Junctions
   **/
  XcmV3Junctions: {
    _enum: {
      Here: 'Null',
      X1: 'XcmV3Junction',
      X2: '(XcmV3Junction,XcmV3Junction)',
      X3: '(XcmV3Junction,XcmV3Junction,XcmV3Junction)',
      X4: '(XcmV3Junction,XcmV3Junction,XcmV3Junction,XcmV3Junction)',
      X5: '(XcmV3Junction,XcmV3Junction,XcmV3Junction,XcmV3Junction,XcmV3Junction)',
      X6: '(XcmV3Junction,XcmV3Junction,XcmV3Junction,XcmV3Junction,XcmV3Junction,XcmV3Junction)',
      X7: '(XcmV3Junction,XcmV3Junction,XcmV3Junction,XcmV3Junction,XcmV3Junction,XcmV3Junction,XcmV3Junction)',
      X8: '(XcmV3Junction,XcmV3Junction,XcmV3Junction,XcmV3Junction,XcmV3Junction,XcmV3Junction,XcmV3Junction,XcmV3Junction)'
    }
  },
  /**
   * Lookup107: xcm::v3::junction::Junction
   **/
  XcmV3Junction: {
    _enum: {
      Parachain: 'Compact<u32>',
      AccountId32: {
        network: 'Option<XcmV3JunctionNetworkId>',
        id: '[u8;32]',
      },
      AccountIndex64: {
        network: 'Option<XcmV3JunctionNetworkId>',
        index: 'Compact<u64>',
      },
      AccountKey20: {
        network: 'Option<XcmV3JunctionNetworkId>',
        key: '[u8;20]',
      },
      PalletInstance: 'u8',
      GeneralIndex: 'Compact<u128>',
      GeneralKey: {
        length: 'u8',
        data: '[u8;32]',
      },
      OnlyChild: 'Null',
      Plurality: {
        id: 'XcmV3JunctionBodyId',
        part: 'XcmV3JunctionBodyPart',
      },
      GlobalConsensus: 'XcmV3JunctionNetworkId'
    }
  },
  /**
   * Lookup109: xcm::v3::junction::NetworkId
   **/
  XcmV3JunctionNetworkId: {
    _enum: {
      ByGenesis: '[u8;32]',
      ByFork: {
        blockNumber: 'u64',
        blockHash: '[u8;32]',
      },
      Polkadot: 'Null',
      Kusama: 'Null',
      Westend: 'Null',
      Rococo: 'Null',
      Wococo: 'Null',
      Ethereum: {
        chainId: 'Compact<u64>',
      },
      BitcoinCore: 'Null',
      BitcoinCash: 'Null',
      PolkadotBulletin: 'Null'
    }
  },
  /**
   * Lookup110: xcm::v3::multiasset::Fungibility
   **/
  XcmV3MultiassetFungibility: {
    _enum: {
      Fungible: 'Compact<u128>',
      NonFungible: 'XcmV3MultiassetAssetInstance'
    }
  },
  /**
   * Lookup111: xcm::v3::multiasset::AssetInstance
   **/
  XcmV3MultiassetAssetInstance: {
    _enum: {
      Undefined: 'Null',
      Index: 'Compact<u128>',
      Array4: '[u8;4]',
      Array8: '[u8;8]',
      Array16: '[u8;16]',
      Array32: '[u8;32]'
    }
  },
  /**
   * Lookup112: staging_xcm::v4::asset::Assets
   **/
  StagingXcmV4AssetAssets: 'Vec<StagingXcmV4Asset>',
  /**
   * Lookup114: staging_xcm::v4::asset::Asset
   **/
  StagingXcmV4Asset: {
    id: 'StagingXcmV4AssetAssetId',
    fun: 'StagingXcmV4AssetFungibility'
  },
  /**
   * Lookup115: staging_xcm::v4::asset::AssetId
   **/
  StagingXcmV4AssetAssetId: 'StagingXcmV4Location',
  /**
   * Lookup116: staging_xcm::v4::location::Location
   **/
  StagingXcmV4Location: {
    parents: 'u8',
    interior: 'StagingXcmV4Junctions'
  },
  /**
   * Lookup117: staging_xcm::v4::junctions::Junctions
   **/
  StagingXcmV4Junctions: {
    _enum: {
      Here: 'Null',
      X1: '[Lookup119;1]',
      X2: '[Lookup119;2]',
      X3: '[Lookup119;3]',
      X4: '[Lookup119;4]',
      X5: '[Lookup119;5]',
      X6: '[Lookup119;6]',
      X7: '[Lookup119;7]',
      X8: '[Lookup119;8]'
    }
  },
  /**
   * Lookup119: staging_xcm::v4::junction::Junction
   **/
  StagingXcmV4Junction: {
    _enum: {
      Parachain: 'Compact<u32>',
      AccountId32: {
        network: 'Option<StagingXcmV4JunctionNetworkId>',
        id: '[u8;32]',
      },
      AccountIndex64: {
        network: 'Option<StagingXcmV4JunctionNetworkId>',
        index: 'Compact<u64>',
      },
      AccountKey20: {
        network: 'Option<StagingXcmV4JunctionNetworkId>',
        key: '[u8;20]',
      },
      PalletInstance: 'u8',
      GeneralIndex: 'Compact<u128>',
      GeneralKey: {
        length: 'u8',
        data: '[u8;32]',
      },
      OnlyChild: 'Null',
      Plurality: {
        id: 'XcmV3JunctionBodyId',
        part: 'XcmV3JunctionBodyPart',
      },
      GlobalConsensus: 'StagingXcmV4JunctionNetworkId'
    }
  },
  /**
   * Lookup121: staging_xcm::v4::junction::NetworkId
   **/
  StagingXcmV4JunctionNetworkId: {
    _enum: {
      ByGenesis: '[u8;32]',
      ByFork: {
        blockNumber: 'u64',
        blockHash: '[u8;32]',
      },
      Polkadot: 'Null',
      Kusama: 'Null',
      Westend: 'Null',
      Rococo: 'Null',
      Wococo: 'Null',
      Ethereum: {
        chainId: 'Compact<u64>',
      },
      BitcoinCore: 'Null',
      BitcoinCash: 'Null',
      PolkadotBulletin: 'Null'
    }
  },
  /**
   * Lookup129: staging_xcm::v4::asset::Fungibility
   **/
  StagingXcmV4AssetFungibility: {
    _enum: {
      Fungible: 'Compact<u128>',
      NonFungible: 'StagingXcmV4AssetAssetInstance'
    }
  },
  /**
   * Lookup130: staging_xcm::v4::asset::AssetInstance
   **/
  StagingXcmV4AssetAssetInstance: {
    _enum: {
      Undefined: 'Null',
      Index: 'Compact<u128>',
      Array4: '[u8;4]',
      Array8: '[u8;8]',
      Array16: '[u8;16]',
      Array32: '[u8;32]'
    }
  },
  /**
   * Lookup131: xcm::VersionedLocation
   **/
  XcmVersionedLocation: {
    _enum: {
      __Unused0: 'Null',
      __Unused1: 'Null',
      __Unused2: 'Null',
      V3: 'StagingXcmV3MultiLocation',
      V4: 'StagingXcmV4Location',
      V5: 'StagingXcmV5Location'
    }
  },
  /**
   * Lookup133: cumulus_pallet_xcm::pallet::Event<T>
   **/
  CumulusPalletXcmEvent: {
    _enum: {
      InvalidFormat: '[u8;32]',
      UnsupportedVersion: '[u8;32]',
      ExecutedDownward: '([u8;32],StagingXcmV5TraitsOutcome)'
    }
  },
  /**
   * Lookup134: pallet_message_queue::pallet::Event<T>
   **/
  PalletMessageQueueEvent: {
    _enum: {
      ProcessingFailed: {
        id: 'H256',
        origin: 'CumulusPrimitivesCoreAggregateMessageOrigin',
        error: 'FrameSupportMessagesProcessMessageError',
      },
      Processed: {
        id: 'H256',
        origin: 'CumulusPrimitivesCoreAggregateMessageOrigin',
        weightUsed: 'SpWeightsWeightV2Weight',
        success: 'bool',
      },
      OverweightEnqueued: {
        id: '[u8;32]',
        origin: 'CumulusPrimitivesCoreAggregateMessageOrigin',
        pageIndex: 'u32',
        messageIndex: 'u32',
      },
      PageReaped: {
        origin: 'CumulusPrimitivesCoreAggregateMessageOrigin',
        index: 'u32'
      }
    }
  },
  /**
   * Lookup135: cumulus_primitives_core::AggregateMessageOrigin
   **/
  CumulusPrimitivesCoreAggregateMessageOrigin: {
    _enum: {
      Here: 'Null',
      Parent: 'Null',
      Sibling: 'u32'
    }
  },
  /**
   * Lookup137: frame_support::traits::messages::ProcessMessageError
   **/
  FrameSupportMessagesProcessMessageError: {
    _enum: {
      BadFormat: 'Null',
      Corrupt: 'Null',
      Unsupported: 'Null',
      Overweight: 'SpWeightsWeightV2Weight',
      Yield: 'Null',
      StackLimitReached: 'Null'
    }
  },
  /**
   * Lookup138: pallet_assets::pallet::Event<T, I>
   **/
  PalletAssetsEvent: {
    _enum: {
      Created: {
        assetId: 'u32',
        creator: 'AccountId32',
        owner: 'AccountId32',
      },
      Issued: {
        assetId: 'u32',
        owner: 'AccountId32',
        amount: 'u128',
      },
      Transferred: {
        assetId: 'u32',
        from: 'AccountId32',
        to: 'AccountId32',
        amount: 'u128',
      },
      Burned: {
        assetId: 'u32',
        owner: 'AccountId32',
        balance: 'u128',
      },
      TeamChanged: {
        assetId: 'u32',
        issuer: 'AccountId32',
        admin: 'AccountId32',
        freezer: 'AccountId32',
      },
      OwnerChanged: {
        assetId: 'u32',
        owner: 'AccountId32',
      },
      Frozen: {
        assetId: 'u32',
        who: 'AccountId32',
      },
      Thawed: {
        assetId: 'u32',
        who: 'AccountId32',
      },
      AssetFrozen: {
        assetId: 'u32',
      },
      AssetThawed: {
        assetId: 'u32',
      },
      AccountsDestroyed: {
        assetId: 'u32',
        accountsDestroyed: 'u32',
        accountsRemaining: 'u32',
      },
      ApprovalsDestroyed: {
        assetId: 'u32',
        approvalsDestroyed: 'u32',
        approvalsRemaining: 'u32',
      },
      DestructionStarted: {
        assetId: 'u32',
      },
      Destroyed: {
        assetId: 'u32',
      },
      ForceCreated: {
        assetId: 'u32',
        owner: 'AccountId32',
      },
      MetadataSet: {
        assetId: 'u32',
        name: 'Bytes',
        symbol: 'Bytes',
        decimals: 'u8',
        isFrozen: 'bool',
      },
      MetadataCleared: {
        assetId: 'u32',
      },
      ApprovedTransfer: {
        assetId: 'u32',
        source: 'AccountId32',
        delegate: 'AccountId32',
        amount: 'u128',
      },
      ApprovalCancelled: {
        assetId: 'u32',
        owner: 'AccountId32',
        delegate: 'AccountId32',
      },
      TransferredApproved: {
        assetId: 'u32',
        owner: 'AccountId32',
        delegate: 'AccountId32',
        destination: 'AccountId32',
        amount: 'u128',
      },
      AssetStatusChanged: {
        assetId: 'u32',
      },
      AssetMinBalanceChanged: {
        assetId: 'u32',
        newMinBalance: 'u128',
      },
      Touched: {
        assetId: 'u32',
        who: 'AccountId32',
        depositor: 'AccountId32',
      },
      Blocked: {
        assetId: 'u32',
        who: 'AccountId32',
      },
      Deposited: {
        assetId: 'u32',
        who: 'AccountId32',
        amount: 'u128',
      },
      Withdrawn: {
        assetId: 'u32',
        who: 'AccountId32',
        amount: 'u128'
      }
    }
  },
  /**
   * Lookup140: pallet_assets_freezer::pallet::Event<T, I>
   **/
  PalletAssetsFreezerEvent: {
    _enum: {
      Frozen: {
        who: 'AccountId32',
        assetId: 'u32',
        amount: 'u128',
      },
      Thawed: {
        who: 'AccountId32',
        assetId: 'u32',
        amount: 'u128'
      }
    }
  },
  /**
   * Lookup141: pallet_hybrid_orderbook::pallet::Event<T>
   **/
  PalletHybridOrderbookEvent: {
    _enum: {
      PoolCreated: {
        creator: 'AccountId32',
        poolId: '(FrameSupportTokensFungibleUnionOfNativeOrWithId,FrameSupportTokensFungibleUnionOfNativeOrWithId)',
        poolAccount: 'AccountId32',
        lpToken: 'u32',
        takerFeeRate: 'Permill',
        tickSize: 'u128',
        lotSize: 'u128',
      },
      LiquidityAdded: {
        who: 'AccountId32',
        mintTo: 'AccountId32',
        poolId: '(FrameSupportTokensFungibleUnionOfNativeOrWithId,FrameSupportTokensFungibleUnionOfNativeOrWithId)',
        baseAssetProvided: 'u128',
        quoteAssetProvided: 'u128',
        lpToken: 'u32',
        lpTokenMinted: 'u128',
      },
      LiquidityRemoved: {
        who: 'AccountId32',
        withdrawTo: 'AccountId32',
        poolId: '(FrameSupportTokensFungibleUnionOfNativeOrWithId,FrameSupportTokensFungibleUnionOfNativeOrWithId)',
        baseAssetAmount: 'u128',
        quoteAssetAmount: 'u128',
        lpToken: 'u32',
        lpTokenBurned: 'u128',
        withdrawalFee: 'Permill',
      },
      SwapExecuted: {
        who: 'AccountId32',
        sendTo: 'AccountId32',
        amountIn: 'u128',
        amountOut: 'u128',
        path: 'Vec<(FrameSupportTokensFungibleUnionOfNativeOrWithId,u128)>',
      },
      SwapCreditExecuted: {
        amountIn: 'u128',
        amountOut: 'u128',
        path: 'Vec<(FrameSupportTokensFungibleUnionOfNativeOrWithId,u128)>',
      },
      Touched: {
        poolId: '(FrameSupportTokensFungibleUnionOfNativeOrWithId,FrameSupportTokensFungibleUnionOfNativeOrWithId)',
        who: 'AccountId32',
      },
      OrderMatched: {
        orderer: 'AccountId32',
        filled: 'u128',
        isBid: 'bool',
      },
      LimitOrder: {
        poolId: '(FrameSupportTokensFungibleUnionOfNativeOrWithId,FrameSupportTokensFungibleUnionOfNativeOrWithId)',
        maker: 'AccountId32',
        orderPrice: 'u128',
        orderQuantity: 'u128',
        isBid: 'bool',
      },
      MarketOrder: {
        taker: 'AccountId32',
      },
      LimitOrderPlaced: {
        maker: 'AccountId32',
        orderPrice: 'u128',
        poolId: '(FrameSupportTokensFungibleUnionOfNativeOrWithId,FrameSupportTokensFungibleUnionOfNativeOrWithId)',
        orderId: 'u64',
        orderQuantity: 'u128',
        isBid: 'bool',
      },
      OrderCancelled: {
        poolId: '(FrameSupportTokensFungibleUnionOfNativeOrWithId,FrameSupportTokensFungibleUnionOfNativeOrWithId)',
        owner: 'AccountId32',
        orderId: 'u64'
      }
    }
  },
  /**
   * Lookup143: frame_support::traits::tokens::fungible::union_of::NativeOrWithId<AssetId>
   **/
  FrameSupportTokensFungibleUnionOfNativeOrWithId: {
    _enum: {
      Native: 'Null',
      WithId: 'u32'
    }
  },
  /**
   * Lookup148: pallet_utility::pallet::Event
   **/
  PalletUtilityEvent: {
    _enum: {
      BatchInterrupted: {
        index: 'u32',
        error: 'SpRuntimeDispatchError',
      },
      BatchCompleted: 'Null',
      BatchCompletedWithErrors: 'Null',
      ItemCompleted: 'Null',
      ItemFailed: {
        error: 'SpRuntimeDispatchError',
      },
      DispatchedAs: {
        result: 'Result<Null, SpRuntimeDispatchError>',
      },
      IfElseMainSuccess: 'Null',
      IfElseFallbackCalled: {
        mainError: 'SpRuntimeDispatchError'
      }
    }
  },
  /**
   * Lookup151: pallet_sudo::pallet::Event<T>
   **/
  PalletSudoEvent: {
    _enum: {
      Sudid: {
        sudoResult: 'Result<Null, SpRuntimeDispatchError>',
      },
      KeyChanged: {
        _alias: {
          new_: 'new',
        },
        old: 'Option<AccountId32>',
        new_: 'AccountId32',
      },
      KeyRemoved: 'Null',
      SudoAsDone: {
        sudoResult: 'Result<Null, SpRuntimeDispatchError>'
      }
    }
  },
  /**
   * Lookup153: frame_system::Phase
   **/
  FrameSystemPhase: {
    _enum: {
      ApplyExtrinsic: 'u32',
      Finalization: 'Null',
      Initialization: 'Null'
    }
  },
  /**
   * Lookup157: frame_system::LastRuntimeUpgradeInfo
   **/
  FrameSystemLastRuntimeUpgradeInfo: {
    specVersion: 'Compact<u32>',
    specName: 'Text'
  },
  /**
   * Lookup160: frame_system::CodeUpgradeAuthorization<T>
   **/
  FrameSystemCodeUpgradeAuthorization: {
    codeHash: 'H256',
    checkVersion: 'bool'
  },
  /**
   * Lookup161: frame_system::pallet::Call<T>
   **/
  FrameSystemCall: {
    _enum: {
      remark: {
        remark: 'Bytes',
      },
      set_heap_pages: {
        pages: 'u64',
      },
      set_code: {
        code: 'Bytes',
      },
      set_code_without_checks: {
        code: 'Bytes',
      },
      set_storage: {
        items: 'Vec<(Bytes,Bytes)>',
      },
      kill_storage: {
        _alias: {
          keys_: 'keys',
        },
        keys_: 'Vec<Bytes>',
      },
      kill_prefix: {
        prefix: 'Bytes',
        subkeys: 'u32',
      },
      remark_with_event: {
        remark: 'Bytes',
      },
      __Unused8: 'Null',
      authorize_upgrade: {
        codeHash: 'H256',
      },
      authorize_upgrade_without_checks: {
        codeHash: 'H256',
      },
      apply_authorized_upgrade: {
        code: 'Bytes'
      }
    }
  },
  /**
   * Lookup165: frame_system::limits::BlockWeights
   **/
  FrameSystemLimitsBlockWeights: {
    baseBlock: 'SpWeightsWeightV2Weight',
    maxBlock: 'SpWeightsWeightV2Weight',
    perClass: 'FrameSupportDispatchPerDispatchClassWeightsPerClass'
  },
  /**
   * Lookup166: frame_support::dispatch::PerDispatchClass<frame_system::limits::WeightsPerClass>
   **/
  FrameSupportDispatchPerDispatchClassWeightsPerClass: {
    normal: 'FrameSystemLimitsWeightsPerClass',
    operational: 'FrameSystemLimitsWeightsPerClass',
    mandatory: 'FrameSystemLimitsWeightsPerClass'
  },
  /**
   * Lookup167: frame_system::limits::WeightsPerClass
   **/
  FrameSystemLimitsWeightsPerClass: {
    baseExtrinsic: 'SpWeightsWeightV2Weight',
    maxExtrinsic: 'Option<SpWeightsWeightV2Weight>',
    maxTotal: 'Option<SpWeightsWeightV2Weight>',
    reserved: 'Option<SpWeightsWeightV2Weight>'
  },
  /**
   * Lookup168: frame_system::limits::BlockLength
   **/
  FrameSystemLimitsBlockLength: {
    max: 'FrameSupportDispatchPerDispatchClassU32'
  },
  /**
   * Lookup169: frame_support::dispatch::PerDispatchClass<T>
   **/
  FrameSupportDispatchPerDispatchClassU32: {
    normal: 'u32',
    operational: 'u32',
    mandatory: 'u32'
  },
  /**
   * Lookup170: sp_weights::RuntimeDbWeight
   **/
  SpWeightsRuntimeDbWeight: {
    read: 'u64',
    write: 'u64'
  },
  /**
   * Lookup171: sp_version::RuntimeVersion
   **/
  SpVersionRuntimeVersion: {
    specName: 'Text',
    implName: 'Text',
    authoringVersion: 'u32',
    specVersion: 'u32',
    implVersion: 'u32',
    apis: 'Vec<([u8;8],u32)>',
    transactionVersion: 'u32',
    systemVersion: 'u8'
  },
  /**
   * Lookup176: frame_system::pallet::Error<T>
   **/
  FrameSystemError: {
    _enum: ['InvalidSpecName', 'SpecVersionNeedsToIncrease', 'FailedToExtractRuntimeVersion', 'NonDefaultComposite', 'NonZeroRefCount', 'CallFiltered', 'MultiBlockMigrationsOngoing', 'NothingAuthorized', 'Unauthorized']
  },
  /**
   * Lookup178: cumulus_pallet_parachain_system::unincluded_segment::Ancestor<primitive_types::H256>
   **/
  CumulusPalletParachainSystemUnincludedSegmentAncestor: {
    usedBandwidth: 'CumulusPalletParachainSystemUnincludedSegmentUsedBandwidth',
    paraHeadHash: 'Option<H256>',
    consumedGoAheadSignal: 'Option<PolkadotPrimitivesV8UpgradeGoAhead>'
  },
  /**
   * Lookup179: cumulus_pallet_parachain_system::unincluded_segment::UsedBandwidth
   **/
  CumulusPalletParachainSystemUnincludedSegmentUsedBandwidth: {
    umpMsgCount: 'u32',
    umpTotalBytes: 'u32',
    hrmpOutgoing: 'BTreeMap<u32, CumulusPalletParachainSystemUnincludedSegmentHrmpChannelUpdate>'
  },
  /**
   * Lookup181: cumulus_pallet_parachain_system::unincluded_segment::HrmpChannelUpdate
   **/
  CumulusPalletParachainSystemUnincludedSegmentHrmpChannelUpdate: {
    msgCount: 'u32',
    totalBytes: 'u32'
  },
  /**
   * Lookup186: polkadot_primitives::v8::UpgradeGoAhead
   **/
  PolkadotPrimitivesV8UpgradeGoAhead: {
    _enum: ['Abort', 'GoAhead']
  },
  /**
   * Lookup187: cumulus_pallet_parachain_system::unincluded_segment::SegmentTracker<primitive_types::H256>
   **/
  CumulusPalletParachainSystemUnincludedSegmentSegmentTracker: {
    usedBandwidth: 'CumulusPalletParachainSystemUnincludedSegmentUsedBandwidth',
    hrmpWatermark: 'Option<u32>',
    consumedGoAheadSignal: 'Option<PolkadotPrimitivesV8UpgradeGoAhead>'
  },
  /**
   * Lookup189: polkadot_primitives::v8::PersistedValidationData<primitive_types::H256, N>
   **/
  PolkadotPrimitivesV8PersistedValidationData: {
    parentHead: 'Bytes',
    relayParentNumber: 'u32',
    relayParentStorageRoot: 'H256',
    maxPovSize: 'u32'
  },
  /**
   * Lookup192: polkadot_primitives::v8::UpgradeRestriction
   **/
  PolkadotPrimitivesV8UpgradeRestriction: {
    _enum: ['Present']
  },
  /**
   * Lookup193: sp_trie::storage_proof::StorageProof
   **/
  SpTrieStorageProof: {
    trieNodes: 'BTreeSet<Bytes>'
  },
  /**
   * Lookup195: cumulus_pallet_parachain_system::relay_state_snapshot::MessagingStateSnapshot
   **/
  CumulusPalletParachainSystemRelayStateSnapshotMessagingStateSnapshot: {
    dmqMqcHead: 'H256',
    relayDispatchQueueRemainingCapacity: 'CumulusPalletParachainSystemRelayStateSnapshotRelayDispatchQueueRemainingCapacity',
    ingressChannels: 'Vec<(u32,PolkadotPrimitivesV8AbridgedHrmpChannel)>',
    egressChannels: 'Vec<(u32,PolkadotPrimitivesV8AbridgedHrmpChannel)>'
  },
  /**
   * Lookup196: cumulus_pallet_parachain_system::relay_state_snapshot::RelayDispatchQueueRemainingCapacity
   **/
  CumulusPalletParachainSystemRelayStateSnapshotRelayDispatchQueueRemainingCapacity: {
    remainingCount: 'u32',
    remainingSize: 'u32'
  },
  /**
   * Lookup199: polkadot_primitives::v8::AbridgedHrmpChannel
   **/
  PolkadotPrimitivesV8AbridgedHrmpChannel: {
    maxCapacity: 'u32',
    maxTotalSize: 'u32',
    maxMessageSize: 'u32',
    msgCount: 'u32',
    totalSize: 'u32',
    mqcHead: 'Option<H256>'
  },
  /**
   * Lookup200: polkadot_primitives::v8::AbridgedHostConfiguration
   **/
  PolkadotPrimitivesV8AbridgedHostConfiguration: {
    maxCodeSize: 'u32',
    maxHeadDataSize: 'u32',
    maxUpwardQueueCount: 'u32',
    maxUpwardQueueSize: 'u32',
    maxUpwardMessageSize: 'u32',
    maxUpwardMessageNumPerCandidate: 'u32',
    hrmpMaxMessageNumPerCandidate: 'u32',
    validationUpgradeCooldown: 'u32',
    validationUpgradeDelay: 'u32',
    asyncBackingParams: 'PolkadotPrimitivesV8AsyncBackingAsyncBackingParams'
  },
  /**
   * Lookup201: polkadot_primitives::v8::async_backing::AsyncBackingParams
   **/
  PolkadotPrimitivesV8AsyncBackingAsyncBackingParams: {
    maxCandidateDepth: 'u32',
    allowedAncestryLen: 'u32'
  },
  /**
   * Lookup207: polkadot_core_primitives::OutboundHrmpMessage<polkadot_parachain_primitives::primitives::Id>
   **/
  PolkadotCorePrimitivesOutboundHrmpMessage: {
    recipient: 'u32',
    data: 'Bytes'
  },
  /**
   * Lookup209: cumulus_pallet_parachain_system::pallet::Call<T>
   **/
  CumulusPalletParachainSystemCall: {
    _enum: {
      set_validation_data: {
        data: 'CumulusPrimitivesParachainInherentParachainInherentData',
      },
      sudo_send_upward_message: {
        message: 'Bytes'
      }
    }
  },
  /**
   * Lookup210: cumulus_primitives_parachain_inherent::ParachainInherentData
   **/
  CumulusPrimitivesParachainInherentParachainInherentData: {
    validationData: 'PolkadotPrimitivesV8PersistedValidationData',
    relayChainState: 'SpTrieStorageProof',
    downwardMessages: 'Vec<PolkadotCorePrimitivesInboundDownwardMessage>',
    horizontalMessages: 'BTreeMap<u32, Vec<PolkadotCorePrimitivesInboundHrmpMessage>>'
  },
  /**
   * Lookup212: polkadot_core_primitives::InboundDownwardMessage<BlockNumber>
   **/
  PolkadotCorePrimitivesInboundDownwardMessage: {
    sentAt: 'u32',
    msg: 'Bytes'
  },
  /**
   * Lookup215: polkadot_core_primitives::InboundHrmpMessage<BlockNumber>
   **/
  PolkadotCorePrimitivesInboundHrmpMessage: {
    sentAt: 'u32',
    data: 'Bytes'
  },
  /**
   * Lookup218: cumulus_pallet_parachain_system::pallet::Error<T>
   **/
  CumulusPalletParachainSystemError: {
    _enum: ['OverlappingUpgrades', 'ProhibitedByPolkadot', 'TooBig', 'ValidationDataNotAvailable', 'HostConfigurationNotAvailable', 'NotScheduled']
  },
  /**
   * Lookup219: pallet_timestamp::pallet::Call<T>
   **/
  PalletTimestampCall: {
    _enum: {
      set: {
        now: 'Compact<u64>'
      }
    }
  },
  /**
   * Lookup220: staging_parachain_info::pallet::Call<T>
   **/
  StagingParachainInfoCall: 'Null',
  /**
   * Lookup222: pallet_balances::types::BalanceLock<Balance>
   **/
  PalletBalancesBalanceLock: {
    id: '[u8;8]',
    amount: 'u128',
    reasons: 'PalletBalancesReasons'
  },
  /**
   * Lookup223: pallet_balances::types::Reasons
   **/
  PalletBalancesReasons: {
    _enum: ['Fee', 'Misc', 'All']
  },
  /**
   * Lookup226: pallet_balances::types::ReserveData<ReserveIdentifier, Balance>
   **/
  PalletBalancesReserveData: {
    id: '[u8;8]',
    amount: 'u128'
  },
  /**
   * Lookup229: frame_support::traits::tokens::misc::IdAmount<warpx_runtime::RuntimeHoldReason, Balance>
   **/
  FrameSupportTokensMiscIdAmountRuntimeHoldReason: {
    id: 'WarpxRuntimeRuntimeHoldReason',
    amount: 'u128'
  },
  /**
   * Lookup230: warpx_runtime::RuntimeHoldReason
   **/
  WarpxRuntimeRuntimeHoldReason: {
    _enum: {
      __Unused0: 'Null',
      __Unused1: 'Null',
      __Unused2: 'Null',
      __Unused3: 'Null',
      __Unused4: 'Null',
      __Unused5: 'Null',
      __Unused6: 'Null',
      __Unused7: 'Null',
      __Unused8: 'Null',
      __Unused9: 'Null',
      __Unused10: 'Null',
      __Unused11: 'Null',
      __Unused12: 'Null',
      __Unused13: 'Null',
      __Unused14: 'Null',
      __Unused15: 'Null',
      __Unused16: 'Null',
      __Unused17: 'Null',
      __Unused18: 'Null',
      __Unused19: 'Null',
      __Unused20: 'Null',
      __Unused21: 'Null',
      __Unused22: 'Null',
      __Unused23: 'Null',
      __Unused24: 'Null',
      __Unused25: 'Null',
      __Unused26: 'Null',
      __Unused27: 'Null',
      __Unused28: 'Null',
      __Unused29: 'Null',
      __Unused30: 'Null',
      PolkadotXcm: 'PalletXcmHoldReason'
    }
  },
  /**
   * Lookup231: pallet_xcm::pallet::HoldReason
   **/
  PalletXcmHoldReason: {
    _enum: ['AuthorizeAlias']
  },
  /**
   * Lookup234: frame_support::traits::tokens::misc::IdAmount<warpx_runtime::RuntimeFreezeReason, Balance>
   **/
  FrameSupportTokensMiscIdAmountRuntimeFreezeReason: {
    id: 'WarpxRuntimeRuntimeFreezeReason',
    amount: 'u128'
  },
  /**
   * Lookup235: warpx_runtime::RuntimeFreezeReason
   **/
  WarpxRuntimeRuntimeFreezeReason: {
    _enum: {
      __Unused0: 'Null',
      __Unused1: 'Null',
      __Unused2: 'Null',
      __Unused3: 'Null',
      __Unused4: 'Null',
      __Unused5: 'Null',
      __Unused6: 'Null',
      __Unused7: 'Null',
      __Unused8: 'Null',
      __Unused9: 'Null',
      __Unused10: 'Null',
      __Unused11: 'Null',
      __Unused12: 'Null',
      __Unused13: 'Null',
      __Unused14: 'Null',
      __Unused15: 'Null',
      __Unused16: 'Null',
      __Unused17: 'Null',
      __Unused18: 'Null',
      __Unused19: 'Null',
      __Unused20: 'Null',
      __Unused21: 'Null',
      __Unused22: 'Null',
      __Unused23: 'Null',
      __Unused24: 'Null',
      __Unused25: 'Null',
      __Unused26: 'Null',
      __Unused27: 'Null',
      __Unused28: 'Null',
      __Unused29: 'Null',
      __Unused30: 'Null',
      __Unused31: 'Null',
      __Unused32: 'Null',
      __Unused33: 'Null',
      __Unused34: 'Null',
      __Unused35: 'Null',
      __Unused36: 'Null',
      __Unused37: 'Null',
      __Unused38: 'Null',
      __Unused39: 'Null',
      __Unused40: 'Null',
      __Unused41: 'Null',
      __Unused42: 'Null',
      __Unused43: 'Null',
      __Unused44: 'Null',
      __Unused45: 'Null',
      __Unused46: 'Null',
      __Unused47: 'Null',
      __Unused48: 'Null',
      __Unused49: 'Null',
      __Unused50: 'Null',
      __Unused51: 'Null',
      __Unused52: 'Null',
      HybridOrderbook: 'PalletHybridOrderbookFreezeReason'
    }
  },
  /**
   * Lookup236: pallet_hybrid_orderbook::pallet::FreezeReason
   **/
  PalletHybridOrderbookFreezeReason: {
    _enum: ['LimitOrder']
  },
  /**
   * Lookup238: pallet_balances::pallet::Call<T, I>
   **/
  PalletBalancesCall: {
    _enum: {
      transfer_allow_death: {
        dest: 'MultiAddress',
        value: 'Compact<u128>',
      },
      __Unused1: 'Null',
      force_transfer: {
        source: 'MultiAddress',
        dest: 'MultiAddress',
        value: 'Compact<u128>',
      },
      transfer_keep_alive: {
        dest: 'MultiAddress',
        value: 'Compact<u128>',
      },
      transfer_all: {
        dest: 'MultiAddress',
        keepAlive: 'bool',
      },
      force_unreserve: {
        who: 'MultiAddress',
        amount: 'u128',
      },
      upgrade_accounts: {
        who: 'Vec<AccountId32>',
      },
      __Unused7: 'Null',
      force_set_balance: {
        who: 'MultiAddress',
        newFree: 'Compact<u128>',
      },
      force_adjust_total_issuance: {
        direction: 'PalletBalancesAdjustmentDirection',
        delta: 'Compact<u128>',
      },
      burn: {
        value: 'Compact<u128>',
        keepAlive: 'bool'
      }
    }
  },
  /**
   * Lookup241: pallet_balances::types::AdjustmentDirection
   **/
  PalletBalancesAdjustmentDirection: {
    _enum: ['Increase', 'Decrease']
  },
  /**
   * Lookup242: pallet_balances::pallet::Error<T, I>
   **/
  PalletBalancesError: {
    _enum: ['VestingBalance', 'LiquidityRestrictions', 'InsufficientBalance', 'ExistentialDeposit', 'Expendability', 'ExistingVestingSchedule', 'DeadAccount', 'TooManyReserves', 'TooManyHolds', 'TooManyFreezes', 'IssuanceDeactivated', 'DeltaZero']
  },
  /**
   * Lookup243: pallet_transaction_payment::Releases
   **/
  PalletTransactionPaymentReleases: {
    _enum: ['V1Ancient', 'V2']
  },
  /**
   * Lookup246: pallet_collator_selection::pallet::CandidateInfo<sp_core::crypto::AccountId32, Balance>
   **/
  PalletCollatorSelectionCandidateInfo: {
    who: 'AccountId32',
    deposit: 'u128'
  },
  /**
   * Lookup248: pallet_collator_selection::pallet::Call<T>
   **/
  PalletCollatorSelectionCall: {
    _enum: {
      set_invulnerables: {
        _alias: {
          new_: 'new',
        },
        new_: 'Vec<AccountId32>',
      },
      set_desired_candidates: {
        max: 'u32',
      },
      set_candidacy_bond: {
        bond: 'u128',
      },
      register_as_candidate: 'Null',
      leave_intent: 'Null',
      add_invulnerable: {
        who: 'AccountId32',
      },
      remove_invulnerable: {
        who: 'AccountId32',
      },
      update_bond: {
        newDeposit: 'u128',
      },
      take_candidate_slot: {
        deposit: 'u128',
        target: 'AccountId32'
      }
    }
  },
  /**
   * Lookup249: frame_support::PalletId
   **/
  FrameSupportPalletId: '[u8;8]',
  /**
   * Lookup250: pallet_collator_selection::pallet::Error<T>
   **/
  PalletCollatorSelectionError: {
    _enum: ['TooManyCandidates', 'TooFewEligibleCollators', 'AlreadyCandidate', 'NotCandidate', 'TooManyInvulnerables', 'AlreadyInvulnerable', 'NotInvulnerable', 'NoAssociatedValidatorId', 'ValidatorNotRegistered', 'InsertToCandidateListFailed', 'RemoveFromCandidateListFailed', 'DepositTooLow', 'UpdateCandidateListFailed', 'InsufficientBond', 'TargetIsNotCandidate', 'IdenticalDeposit', 'InvalidUnreserve']
  },
  /**
   * Lookup253: warpx_runtime::SessionKeys
   **/
  WarpxRuntimeSessionKeys: {
    aura: 'SpConsensusAuraSr25519AppSr25519Public'
  },
  /**
   * Lookup254: sp_consensus_aura::sr25519::app_sr25519::Public
   **/
  SpConsensusAuraSr25519AppSr25519Public: '[u8;32]',
  /**
   * Lookup260: sp_core::crypto::KeyTypeId
   **/
  SpCoreCryptoKeyTypeId: '[u8;4]',
  /**
   * Lookup261: pallet_session::pallet::Call<T>
   **/
  PalletSessionCall: {
    _enum: {
      set_keys: {
        _alias: {
          keys_: 'keys',
        },
        keys_: 'WarpxRuntimeSessionKeys',
        proof: 'Bytes',
      },
      purge_keys: 'Null'
    }
  },
  /**
   * Lookup262: pallet_session::pallet::Error<T>
   **/
  PalletSessionError: {
    _enum: ['InvalidProof', 'NoAssociatedValidatorId', 'DuplicatedKey', 'NoKeys', 'NoAccount']
  },
  /**
   * Lookup271: cumulus_pallet_xcmp_queue::OutboundChannelDetails
   **/
  CumulusPalletXcmpQueueOutboundChannelDetails: {
    recipient: 'u32',
    state: 'CumulusPalletXcmpQueueOutboundState',
    signalsExist: 'bool',
    firstIndex: 'u16',
    lastIndex: 'u16'
  },
  /**
   * Lookup272: cumulus_pallet_xcmp_queue::OutboundState
   **/
  CumulusPalletXcmpQueueOutboundState: {
    _enum: ['Ok', 'Suspended']
  },
  /**
   * Lookup276: cumulus_pallet_xcmp_queue::QueueConfigData
   **/
  CumulusPalletXcmpQueueQueueConfigData: {
    suspendThreshold: 'u32',
    dropThreshold: 'u32',
    resumeThreshold: 'u32'
  },
  /**
   * Lookup277: cumulus_pallet_xcmp_queue::pallet::Call<T>
   **/
  CumulusPalletXcmpQueueCall: {
    _enum: {
      __Unused0: 'Null',
      suspend_xcm_execution: 'Null',
      resume_xcm_execution: 'Null',
      update_suspend_threshold: {
        _alias: {
          new_: 'new',
        },
        new_: 'u32',
      },
      update_drop_threshold: {
        _alias: {
          new_: 'new',
        },
        new_: 'u32',
      },
      update_resume_threshold: {
        _alias: {
          new_: 'new',
        },
        new_: 'u32'
      }
    }
  },
  /**
   * Lookup278: cumulus_pallet_xcmp_queue::pallet::Error<T>
   **/
  CumulusPalletXcmpQueueError: {
    _enum: ['BadQueueConfig', 'AlreadySuspended', 'AlreadyResumed', 'TooManyActiveOutboundChannels', 'TooBig']
  },
  /**
   * Lookup279: pallet_xcm::pallet::QueryStatus<BlockNumber>
   **/
  PalletXcmQueryStatus: {
    _enum: {
      Pending: {
        responder: 'XcmVersionedLocation',
        maybeMatchQuerier: 'Option<XcmVersionedLocation>',
        maybeNotify: 'Option<(u8,u8)>',
        timeout: 'u32',
      },
      VersionNotifier: {
        origin: 'XcmVersionedLocation',
        isActive: 'bool',
      },
      Ready: {
        response: 'XcmVersionedResponse',
        at: 'u32'
      }
    }
  },
  /**
   * Lookup283: xcm::VersionedResponse
   **/
  XcmVersionedResponse: {
    _enum: {
      __Unused0: 'Null',
      __Unused1: 'Null',
      __Unused2: 'Null',
      V3: 'XcmV3Response',
      V4: 'StagingXcmV4Response',
      V5: 'StagingXcmV5Response'
    }
  },
  /**
   * Lookup284: xcm::v3::Response
   **/
  XcmV3Response: {
    _enum: {
      Null: 'Null',
      Assets: 'XcmV3MultiassetMultiAssets',
      ExecutionResult: 'Option<(u32,XcmV3TraitsError)>',
      Version: 'u32',
      PalletsInfo: 'Vec<XcmV3PalletInfo>',
      DispatchResult: 'XcmV3MaybeErrorCode'
    }
  },
  /**
   * Lookup287: xcm::v3::traits::Error
   **/
  XcmV3TraitsError: {
    _enum: {
      Overflow: 'Null',
      Unimplemented: 'Null',
      UntrustedReserveLocation: 'Null',
      UntrustedTeleportLocation: 'Null',
      LocationFull: 'Null',
      LocationNotInvertible: 'Null',
      BadOrigin: 'Null',
      InvalidLocation: 'Null',
      AssetNotFound: 'Null',
      FailedToTransactAsset: 'Null',
      NotWithdrawable: 'Null',
      LocationCannotHold: 'Null',
      ExceedsMaxMessageSize: 'Null',
      DestinationUnsupported: 'Null',
      Transport: 'Null',
      Unroutable: 'Null',
      UnknownClaim: 'Null',
      FailedToDecode: 'Null',
      MaxWeightInvalid: 'Null',
      NotHoldingFees: 'Null',
      TooExpensive: 'Null',
      Trap: 'u64',
      ExpectationFalse: 'Null',
      PalletNotFound: 'Null',
      NameMismatch: 'Null',
      VersionIncompatible: 'Null',
      HoldingWouldOverflow: 'Null',
      ExportError: 'Null',
      ReanchorFailed: 'Null',
      NoDeal: 'Null',
      FeesNotMet: 'Null',
      LockError: 'Null',
      NoPermission: 'Null',
      Unanchored: 'Null',
      NotDepositable: 'Null',
      UnhandledXcmVersion: 'Null',
      WeightLimitReached: 'SpWeightsWeightV2Weight',
      Barrier: 'Null',
      WeightNotComputable: 'Null',
      ExceedsStackLimit: 'Null'
    }
  },
  /**
   * Lookup289: xcm::v3::PalletInfo
   **/
  XcmV3PalletInfo: {
    index: 'Compact<u32>',
    name: 'Bytes',
    moduleName: 'Bytes',
    major: 'Compact<u32>',
    minor: 'Compact<u32>',
    patch: 'Compact<u32>'
  },
  /**
   * Lookup292: staging_xcm::v4::Response
   **/
  StagingXcmV4Response: {
    _enum: {
      Null: 'Null',
      Assets: 'StagingXcmV4AssetAssets',
      ExecutionResult: 'Option<(u32,XcmV3TraitsError)>',
      Version: 'u32',
      PalletsInfo: 'Vec<StagingXcmV4PalletInfo>',
      DispatchResult: 'XcmV3MaybeErrorCode'
    }
  },
  /**
   * Lookup294: staging_xcm::v4::PalletInfo
   **/
  StagingXcmV4PalletInfo: {
    index: 'Compact<u32>',
    name: 'Bytes',
    moduleName: 'Bytes',
    major: 'Compact<u32>',
    minor: 'Compact<u32>',
    patch: 'Compact<u32>'
  },
  /**
   * Lookup302: pallet_xcm::pallet::VersionMigrationStage
   **/
  PalletXcmVersionMigrationStage: {
    _enum: {
      MigrateSupportedVersion: 'Null',
      MigrateVersionNotifiers: 'Null',
      NotifyCurrentTargets: 'Option<Bytes>',
      MigrateAndNotifyOldTargets: 'Null'
    }
  },
  /**
   * Lookup305: xcm::VersionedAssetId
   **/
  XcmVersionedAssetId: {
    _enum: {
      __Unused0: 'Null',
      __Unused1: 'Null',
      __Unused2: 'Null',
      V3: 'XcmV3MultiassetAssetId',
      V4: 'StagingXcmV4AssetAssetId',
      V5: 'StagingXcmV5AssetAssetId'
    }
  },
  /**
   * Lookup306: pallet_xcm::pallet::RemoteLockedFungibleRecord<ConsumerIdentifier, MaxConsumers>
   **/
  PalletXcmRemoteLockedFungibleRecord: {
    amount: 'u128',
    owner: 'XcmVersionedLocation',
    locker: 'XcmVersionedLocation',
    consumers: 'Vec<(Null,u128)>'
  },
  /**
   * Lookup313: pallet_xcm::AuthorizedAliasesEntry<frame_support::traits::storage::Disabled, pallet_xcm::pallet::MaxAuthorizedAliases>
   **/
  PalletXcmAuthorizedAliasesEntry: {
    aliasers: 'Vec<XcmRuntimeApisAuthorizedAliasesOriginAliaser>',
    ticket: 'FrameSupportStorageDisabled'
  },
  /**
   * Lookup314: frame_support::traits::storage::Disabled
   **/
  FrameSupportStorageDisabled: 'Null',
  /**
   * Lookup315: pallet_xcm::pallet::MaxAuthorizedAliases
   **/
  PalletXcmMaxAuthorizedAliases: 'Null',
  /**
   * Lookup317: xcm_runtime_apis::authorized_aliases::OriginAliaser
   **/
  XcmRuntimeApisAuthorizedAliasesOriginAliaser: {
    location: 'XcmVersionedLocation',
    expiry: 'Option<u64>'
  },
  /**
   * Lookup319: pallet_xcm::pallet::Call<T>
   **/
  PalletXcmCall: {
    _enum: {
      send: {
        dest: 'XcmVersionedLocation',
        message: 'XcmVersionedXcm',
      },
      teleport_assets: {
        dest: 'XcmVersionedLocation',
        beneficiary: 'XcmVersionedLocation',
        assets: 'XcmVersionedAssets',
        feeAssetItem: 'u32',
      },
      reserve_transfer_assets: {
        dest: 'XcmVersionedLocation',
        beneficiary: 'XcmVersionedLocation',
        assets: 'XcmVersionedAssets',
        feeAssetItem: 'u32',
      },
      execute: {
        message: 'XcmVersionedXcm',
        maxWeight: 'SpWeightsWeightV2Weight',
      },
      force_xcm_version: {
        location: 'StagingXcmV5Location',
        version: 'u32',
      },
      force_default_xcm_version: {
        maybeXcmVersion: 'Option<u32>',
      },
      force_subscribe_version_notify: {
        location: 'XcmVersionedLocation',
      },
      force_unsubscribe_version_notify: {
        location: 'XcmVersionedLocation',
      },
      limited_reserve_transfer_assets: {
        dest: 'XcmVersionedLocation',
        beneficiary: 'XcmVersionedLocation',
        assets: 'XcmVersionedAssets',
        feeAssetItem: 'u32',
        weightLimit: 'XcmV3WeightLimit',
      },
      limited_teleport_assets: {
        dest: 'XcmVersionedLocation',
        beneficiary: 'XcmVersionedLocation',
        assets: 'XcmVersionedAssets',
        feeAssetItem: 'u32',
        weightLimit: 'XcmV3WeightLimit',
      },
      force_suspension: {
        suspended: 'bool',
      },
      transfer_assets: {
        dest: 'XcmVersionedLocation',
        beneficiary: 'XcmVersionedLocation',
        assets: 'XcmVersionedAssets',
        feeAssetItem: 'u32',
        weightLimit: 'XcmV3WeightLimit',
      },
      claim_assets: {
        assets: 'XcmVersionedAssets',
        beneficiary: 'XcmVersionedLocation',
      },
      transfer_assets_using_type_and_then: {
        dest: 'XcmVersionedLocation',
        assets: 'XcmVersionedAssets',
        assetsTransferType: 'StagingXcmExecutorAssetTransferTransferType',
        remoteFeesId: 'XcmVersionedAssetId',
        feesTransferType: 'StagingXcmExecutorAssetTransferTransferType',
        customXcmOnDest: 'XcmVersionedXcm',
        weightLimit: 'XcmV3WeightLimit',
      },
      add_authorized_alias: {
        aliaser: 'XcmVersionedLocation',
        expires: 'Option<u64>',
      },
      remove_authorized_alias: {
        aliaser: 'XcmVersionedLocation',
      },
      remove_all_authorized_aliases: 'Null'
    }
  },
  /**
   * Lookup320: xcm::VersionedXcm<RuntimeCall>
   **/
  XcmVersionedXcm: {
    _enum: {
      __Unused0: 'Null',
      __Unused1: 'Null',
      __Unused2: 'Null',
      V3: 'XcmV3Xcm',
      V4: 'StagingXcmV4Xcm',
      V5: 'StagingXcmV5Xcm'
    }
  },
  /**
   * Lookup321: xcm::v3::Xcm<Call>
   **/
  XcmV3Xcm: 'Vec<XcmV3Instruction>',
  /**
   * Lookup323: xcm::v3::Instruction<Call>
   **/
  XcmV3Instruction: {
    _enum: {
      WithdrawAsset: 'XcmV3MultiassetMultiAssets',
      ReserveAssetDeposited: 'XcmV3MultiassetMultiAssets',
      ReceiveTeleportedAsset: 'XcmV3MultiassetMultiAssets',
      QueryResponse: {
        queryId: 'Compact<u64>',
        response: 'XcmV3Response',
        maxWeight: 'SpWeightsWeightV2Weight',
        querier: 'Option<StagingXcmV3MultiLocation>',
      },
      TransferAsset: {
        assets: 'XcmV3MultiassetMultiAssets',
        beneficiary: 'StagingXcmV3MultiLocation',
      },
      TransferReserveAsset: {
        assets: 'XcmV3MultiassetMultiAssets',
        dest: 'StagingXcmV3MultiLocation',
        xcm: 'XcmV3Xcm',
      },
      Transact: {
        originKind: 'XcmV3OriginKind',
        requireWeightAtMost: 'SpWeightsWeightV2Weight',
        call: 'XcmDoubleEncoded',
      },
      HrmpNewChannelOpenRequest: {
        sender: 'Compact<u32>',
        maxMessageSize: 'Compact<u32>',
        maxCapacity: 'Compact<u32>',
      },
      HrmpChannelAccepted: {
        recipient: 'Compact<u32>',
      },
      HrmpChannelClosing: {
        initiator: 'Compact<u32>',
        sender: 'Compact<u32>',
        recipient: 'Compact<u32>',
      },
      ClearOrigin: 'Null',
      DescendOrigin: 'XcmV3Junctions',
      ReportError: 'XcmV3QueryResponseInfo',
      DepositAsset: {
        assets: 'XcmV3MultiassetMultiAssetFilter',
        beneficiary: 'StagingXcmV3MultiLocation',
      },
      DepositReserveAsset: {
        assets: 'XcmV3MultiassetMultiAssetFilter',
        dest: 'StagingXcmV3MultiLocation',
        xcm: 'XcmV3Xcm',
      },
      ExchangeAsset: {
        give: 'XcmV3MultiassetMultiAssetFilter',
        want: 'XcmV3MultiassetMultiAssets',
        maximal: 'bool',
      },
      InitiateReserveWithdraw: {
        assets: 'XcmV3MultiassetMultiAssetFilter',
        reserve: 'StagingXcmV3MultiLocation',
        xcm: 'XcmV3Xcm',
      },
      InitiateTeleport: {
        assets: 'XcmV3MultiassetMultiAssetFilter',
        dest: 'StagingXcmV3MultiLocation',
        xcm: 'XcmV3Xcm',
      },
      ReportHolding: {
        responseInfo: 'XcmV3QueryResponseInfo',
        assets: 'XcmV3MultiassetMultiAssetFilter',
      },
      BuyExecution: {
        fees: 'XcmV3MultiAsset',
        weightLimit: 'XcmV3WeightLimit',
      },
      RefundSurplus: 'Null',
      SetErrorHandler: 'XcmV3Xcm',
      SetAppendix: 'XcmV3Xcm',
      ClearError: 'Null',
      ClaimAsset: {
        assets: 'XcmV3MultiassetMultiAssets',
        ticket: 'StagingXcmV3MultiLocation',
      },
      Trap: 'Compact<u64>',
      SubscribeVersion: {
        queryId: 'Compact<u64>',
        maxResponseWeight: 'SpWeightsWeightV2Weight',
      },
      UnsubscribeVersion: 'Null',
      BurnAsset: 'XcmV3MultiassetMultiAssets',
      ExpectAsset: 'XcmV3MultiassetMultiAssets',
      ExpectOrigin: 'Option<StagingXcmV3MultiLocation>',
      ExpectError: 'Option<(u32,XcmV3TraitsError)>',
      ExpectTransactStatus: 'XcmV3MaybeErrorCode',
      QueryPallet: {
        moduleName: 'Bytes',
        responseInfo: 'XcmV3QueryResponseInfo',
      },
      ExpectPallet: {
        index: 'Compact<u32>',
        name: 'Bytes',
        moduleName: 'Bytes',
        crateMajor: 'Compact<u32>',
        minCrateMinor: 'Compact<u32>',
      },
      ReportTransactStatus: 'XcmV3QueryResponseInfo',
      ClearTransactStatus: 'Null',
      UniversalOrigin: 'XcmV3Junction',
      ExportMessage: {
        network: 'XcmV3JunctionNetworkId',
        destination: 'XcmV3Junctions',
        xcm: 'XcmV3Xcm',
      },
      LockAsset: {
        asset: 'XcmV3MultiAsset',
        unlocker: 'StagingXcmV3MultiLocation',
      },
      UnlockAsset: {
        asset: 'XcmV3MultiAsset',
        target: 'StagingXcmV3MultiLocation',
      },
      NoteUnlockable: {
        asset: 'XcmV3MultiAsset',
        owner: 'StagingXcmV3MultiLocation',
      },
      RequestUnlock: {
        asset: 'XcmV3MultiAsset',
        locker: 'StagingXcmV3MultiLocation',
      },
      SetFeesMode: {
        jitWithdraw: 'bool',
      },
      SetTopic: '[u8;32]',
      ClearTopic: 'Null',
      AliasOrigin: 'StagingXcmV3MultiLocation',
      UnpaidExecution: {
        weightLimit: 'XcmV3WeightLimit',
        checkOrigin: 'Option<StagingXcmV3MultiLocation>'
      }
    }
  },
  /**
   * Lookup325: xcm::v3::QueryResponseInfo
   **/
  XcmV3QueryResponseInfo: {
    destination: 'StagingXcmV3MultiLocation',
    queryId: 'Compact<u64>',
    maxWeight: 'SpWeightsWeightV2Weight'
  },
  /**
   * Lookup326: xcm::v3::multiasset::MultiAssetFilter
   **/
  XcmV3MultiassetMultiAssetFilter: {
    _enum: {
      Definite: 'XcmV3MultiassetMultiAssets',
      Wild: 'XcmV3MultiassetWildMultiAsset'
    }
  },
  /**
   * Lookup327: xcm::v3::multiasset::WildMultiAsset
   **/
  XcmV3MultiassetWildMultiAsset: {
    _enum: {
      All: 'Null',
      AllOf: {
        id: 'XcmV3MultiassetAssetId',
        fun: 'XcmV3MultiassetWildFungibility',
      },
      AllCounted: 'Compact<u32>',
      AllOfCounted: {
        id: 'XcmV3MultiassetAssetId',
        fun: 'XcmV3MultiassetWildFungibility',
        count: 'Compact<u32>'
      }
    }
  },
  /**
   * Lookup328: xcm::v3::multiasset::WildFungibility
   **/
  XcmV3MultiassetWildFungibility: {
    _enum: ['Fungible', 'NonFungible']
  },
  /**
   * Lookup329: staging_xcm::v4::Xcm<Call>
   **/
  StagingXcmV4Xcm: 'Vec<StagingXcmV4Instruction>',
  /**
   * Lookup331: staging_xcm::v4::Instruction<Call>
   **/
  StagingXcmV4Instruction: {
    _enum: {
      WithdrawAsset: 'StagingXcmV4AssetAssets',
      ReserveAssetDeposited: 'StagingXcmV4AssetAssets',
      ReceiveTeleportedAsset: 'StagingXcmV4AssetAssets',
      QueryResponse: {
        queryId: 'Compact<u64>',
        response: 'StagingXcmV4Response',
        maxWeight: 'SpWeightsWeightV2Weight',
        querier: 'Option<StagingXcmV4Location>',
      },
      TransferAsset: {
        assets: 'StagingXcmV4AssetAssets',
        beneficiary: 'StagingXcmV4Location',
      },
      TransferReserveAsset: {
        assets: 'StagingXcmV4AssetAssets',
        dest: 'StagingXcmV4Location',
        xcm: 'StagingXcmV4Xcm',
      },
      Transact: {
        originKind: 'XcmV3OriginKind',
        requireWeightAtMost: 'SpWeightsWeightV2Weight',
        call: 'XcmDoubleEncoded',
      },
      HrmpNewChannelOpenRequest: {
        sender: 'Compact<u32>',
        maxMessageSize: 'Compact<u32>',
        maxCapacity: 'Compact<u32>',
      },
      HrmpChannelAccepted: {
        recipient: 'Compact<u32>',
      },
      HrmpChannelClosing: {
        initiator: 'Compact<u32>',
        sender: 'Compact<u32>',
        recipient: 'Compact<u32>',
      },
      ClearOrigin: 'Null',
      DescendOrigin: 'StagingXcmV4Junctions',
      ReportError: 'StagingXcmV4QueryResponseInfo',
      DepositAsset: {
        assets: 'StagingXcmV4AssetAssetFilter',
        beneficiary: 'StagingXcmV4Location',
      },
      DepositReserveAsset: {
        assets: 'StagingXcmV4AssetAssetFilter',
        dest: 'StagingXcmV4Location',
        xcm: 'StagingXcmV4Xcm',
      },
      ExchangeAsset: {
        give: 'StagingXcmV4AssetAssetFilter',
        want: 'StagingXcmV4AssetAssets',
        maximal: 'bool',
      },
      InitiateReserveWithdraw: {
        assets: 'StagingXcmV4AssetAssetFilter',
        reserve: 'StagingXcmV4Location',
        xcm: 'StagingXcmV4Xcm',
      },
      InitiateTeleport: {
        assets: 'StagingXcmV4AssetAssetFilter',
        dest: 'StagingXcmV4Location',
        xcm: 'StagingXcmV4Xcm',
      },
      ReportHolding: {
        responseInfo: 'StagingXcmV4QueryResponseInfo',
        assets: 'StagingXcmV4AssetAssetFilter',
      },
      BuyExecution: {
        fees: 'StagingXcmV4Asset',
        weightLimit: 'XcmV3WeightLimit',
      },
      RefundSurplus: 'Null',
      SetErrorHandler: 'StagingXcmV4Xcm',
      SetAppendix: 'StagingXcmV4Xcm',
      ClearError: 'Null',
      ClaimAsset: {
        assets: 'StagingXcmV4AssetAssets',
        ticket: 'StagingXcmV4Location',
      },
      Trap: 'Compact<u64>',
      SubscribeVersion: {
        queryId: 'Compact<u64>',
        maxResponseWeight: 'SpWeightsWeightV2Weight',
      },
      UnsubscribeVersion: 'Null',
      BurnAsset: 'StagingXcmV4AssetAssets',
      ExpectAsset: 'StagingXcmV4AssetAssets',
      ExpectOrigin: 'Option<StagingXcmV4Location>',
      ExpectError: 'Option<(u32,XcmV3TraitsError)>',
      ExpectTransactStatus: 'XcmV3MaybeErrorCode',
      QueryPallet: {
        moduleName: 'Bytes',
        responseInfo: 'StagingXcmV4QueryResponseInfo',
      },
      ExpectPallet: {
        index: 'Compact<u32>',
        name: 'Bytes',
        moduleName: 'Bytes',
        crateMajor: 'Compact<u32>',
        minCrateMinor: 'Compact<u32>',
      },
      ReportTransactStatus: 'StagingXcmV4QueryResponseInfo',
      ClearTransactStatus: 'Null',
      UniversalOrigin: 'StagingXcmV4Junction',
      ExportMessage: {
        network: 'StagingXcmV4JunctionNetworkId',
        destination: 'StagingXcmV4Junctions',
        xcm: 'StagingXcmV4Xcm',
      },
      LockAsset: {
        asset: 'StagingXcmV4Asset',
        unlocker: 'StagingXcmV4Location',
      },
      UnlockAsset: {
        asset: 'StagingXcmV4Asset',
        target: 'StagingXcmV4Location',
      },
      NoteUnlockable: {
        asset: 'StagingXcmV4Asset',
        owner: 'StagingXcmV4Location',
      },
      RequestUnlock: {
        asset: 'StagingXcmV4Asset',
        locker: 'StagingXcmV4Location',
      },
      SetFeesMode: {
        jitWithdraw: 'bool',
      },
      SetTopic: '[u8;32]',
      ClearTopic: 'Null',
      AliasOrigin: 'StagingXcmV4Location',
      UnpaidExecution: {
        weightLimit: 'XcmV3WeightLimit',
        checkOrigin: 'Option<StagingXcmV4Location>'
      }
    }
  },
  /**
   * Lookup333: staging_xcm::v4::QueryResponseInfo
   **/
  StagingXcmV4QueryResponseInfo: {
    destination: 'StagingXcmV4Location',
    queryId: 'Compact<u64>',
    maxWeight: 'SpWeightsWeightV2Weight'
  },
  /**
   * Lookup334: staging_xcm::v4::asset::AssetFilter
   **/
  StagingXcmV4AssetAssetFilter: {
    _enum: {
      Definite: 'StagingXcmV4AssetAssets',
      Wild: 'StagingXcmV4AssetWildAsset'
    }
  },
  /**
   * Lookup335: staging_xcm::v4::asset::WildAsset
   **/
  StagingXcmV4AssetWildAsset: {
    _enum: {
      All: 'Null',
      AllOf: {
        id: 'StagingXcmV4AssetAssetId',
        fun: 'StagingXcmV4AssetWildFungibility',
      },
      AllCounted: 'Compact<u32>',
      AllOfCounted: {
        id: 'StagingXcmV4AssetAssetId',
        fun: 'StagingXcmV4AssetWildFungibility',
        count: 'Compact<u32>'
      }
    }
  },
  /**
   * Lookup336: staging_xcm::v4::asset::WildFungibility
   **/
  StagingXcmV4AssetWildFungibility: {
    _enum: ['Fungible', 'NonFungible']
  },
  /**
   * Lookup348: staging_xcm_executor::traits::asset_transfer::TransferType
   **/
  StagingXcmExecutorAssetTransferTransferType: {
    _enum: {
      Teleport: 'Null',
      LocalReserve: 'Null',
      DestinationReserve: 'Null',
      RemoteReserve: 'XcmVersionedLocation'
    }
  },
  /**
   * Lookup349: pallet_xcm::pallet::Error<T>
   **/
  PalletXcmError: {
    _enum: ['Unreachable', 'SendFailure', 'Filtered', 'UnweighableMessage', 'DestinationNotInvertible', 'Empty', 'CannotReanchor', 'TooManyAssets', 'InvalidOrigin', 'BadVersion', 'BadLocation', 'NoSubscription', 'AlreadySubscribed', 'CannotCheckOutTeleport', 'LowBalance', 'TooManyLocks', 'AccountNotSovereign', 'FeesNotMet', 'LockNotFound', 'InUse', '__Unused20', 'InvalidAssetUnknownReserve', 'InvalidAssetUnsupportedReserve', 'TooManyReserves', 'LocalExecutionIncomplete', 'TooManyAuthorizedAliases', 'ExpiresInPast', 'AliasNotFound']
  },
  /**
   * Lookup350: cumulus_pallet_xcm::pallet::Call<T>
   **/
  CumulusPalletXcmCall: 'Null',
  /**
   * Lookup351: pallet_message_queue::BookState<cumulus_primitives_core::AggregateMessageOrigin>
   **/
  PalletMessageQueueBookState: {
    _alias: {
      size_: 'size'
    },
    begin: 'u32',
    end: 'u32',
    count: 'u32',
    readyNeighbours: 'Option<PalletMessageQueueNeighbours>',
    messageCount: 'u64',
    size_: 'u64'
  },
  /**
   * Lookup353: pallet_message_queue::Neighbours<cumulus_primitives_core::AggregateMessageOrigin>
   **/
  PalletMessageQueueNeighbours: {
    prev: 'CumulusPrimitivesCoreAggregateMessageOrigin',
    next: 'CumulusPrimitivesCoreAggregateMessageOrigin'
  },
  /**
   * Lookup355: pallet_message_queue::Page<Size, HeapSize>
   **/
  PalletMessageQueuePage: {
    remaining: 'u32',
    remainingSize: 'u32',
    firstIndex: 'u32',
    first: 'u32',
    last: 'u32',
    heap: 'Bytes'
  },
  /**
   * Lookup357: pallet_message_queue::pallet::Call<T>
   **/
  PalletMessageQueueCall: {
    _enum: {
      reap_page: {
        messageOrigin: 'CumulusPrimitivesCoreAggregateMessageOrigin',
        pageIndex: 'u32',
      },
      execute_overweight: {
        messageOrigin: 'CumulusPrimitivesCoreAggregateMessageOrigin',
        page: 'u32',
        index: 'u32',
        weightLimit: 'SpWeightsWeightV2Weight'
      }
    }
  },
  /**
   * Lookup358: pallet_message_queue::pallet::Error<T>
   **/
  PalletMessageQueueError: {
    _enum: ['NotReapable', 'NoPage', 'NoMessage', 'AlreadyProcessed', 'Queued', 'InsufficientWeight', 'TemporarilyUnprocessable', 'QueuePaused', 'RecursiveDisallowed']
  },
  /**
   * Lookup359: pallet_assets::types::AssetDetails<Balance, sp_core::crypto::AccountId32, DepositBalance>
   **/
  PalletAssetsAssetDetails: {
    owner: 'AccountId32',
    issuer: 'AccountId32',
    admin: 'AccountId32',
    freezer: 'AccountId32',
    supply: 'u128',
    deposit: 'u128',
    minBalance: 'u128',
    isSufficient: 'bool',
    accounts: 'u32',
    sufficients: 'u32',
    approvals: 'u32',
    status: 'PalletAssetsAssetStatus'
  },
  /**
   * Lookup360: pallet_assets::types::AssetStatus
   **/
  PalletAssetsAssetStatus: {
    _enum: ['Live', 'Frozen', 'Destroying']
  },
  /**
   * Lookup362: pallet_assets::types::AssetAccount<Balance, DepositBalance, Extra, sp_core::crypto::AccountId32>
   **/
  PalletAssetsAssetAccount: {
    balance: 'u128',
    status: 'PalletAssetsAccountStatus',
    reason: 'PalletAssetsExistenceReason',
    extra: 'Null'
  },
  /**
   * Lookup363: pallet_assets::types::AccountStatus
   **/
  PalletAssetsAccountStatus: {
    _enum: ['Liquid', 'Frozen', 'Blocked']
  },
  /**
   * Lookup364: pallet_assets::types::ExistenceReason<Balance, sp_core::crypto::AccountId32>
   **/
  PalletAssetsExistenceReason: {
    _enum: {
      Consumer: 'Null',
      Sufficient: 'Null',
      DepositHeld: 'u128',
      DepositRefunded: 'Null',
      DepositFrom: '(AccountId32,u128)'
    }
  },
  /**
   * Lookup366: pallet_assets::types::Approval<Balance, DepositBalance>
   **/
  PalletAssetsApproval: {
    amount: 'u128',
    deposit: 'u128'
  },
  /**
   * Lookup367: pallet_assets::types::AssetMetadata<DepositBalance, bounded_collections::bounded_vec::BoundedVec<T, S>>
   **/
  PalletAssetsAssetMetadata: {
    deposit: 'u128',
    name: 'Bytes',
    symbol: 'Bytes',
    decimals: 'u8',
    isFrozen: 'bool'
  },
  /**
   * Lookup369: pallet_assets::pallet::Call<T, I>
   **/
  PalletAssetsCall: {
    _enum: {
      create: {
        id: 'Compact<u32>',
        admin: 'MultiAddress',
        minBalance: 'u128',
      },
      force_create: {
        id: 'Compact<u32>',
        owner: 'MultiAddress',
        isSufficient: 'bool',
        minBalance: 'Compact<u128>',
      },
      start_destroy: {
        id: 'Compact<u32>',
      },
      destroy_accounts: {
        id: 'Compact<u32>',
      },
      destroy_approvals: {
        id: 'Compact<u32>',
      },
      finish_destroy: {
        id: 'Compact<u32>',
      },
      mint: {
        id: 'Compact<u32>',
        beneficiary: 'MultiAddress',
        amount: 'Compact<u128>',
      },
      burn: {
        id: 'Compact<u32>',
        who: 'MultiAddress',
        amount: 'Compact<u128>',
      },
      transfer: {
        id: 'Compact<u32>',
        target: 'MultiAddress',
        amount: 'Compact<u128>',
      },
      transfer_keep_alive: {
        id: 'Compact<u32>',
        target: 'MultiAddress',
        amount: 'Compact<u128>',
      },
      force_transfer: {
        id: 'Compact<u32>',
        source: 'MultiAddress',
        dest: 'MultiAddress',
        amount: 'Compact<u128>',
      },
      freeze: {
        id: 'Compact<u32>',
        who: 'MultiAddress',
      },
      thaw: {
        id: 'Compact<u32>',
        who: 'MultiAddress',
      },
      freeze_asset: {
        id: 'Compact<u32>',
      },
      thaw_asset: {
        id: 'Compact<u32>',
      },
      transfer_ownership: {
        id: 'Compact<u32>',
        owner: 'MultiAddress',
      },
      set_team: {
        id: 'Compact<u32>',
        issuer: 'MultiAddress',
        admin: 'MultiAddress',
        freezer: 'MultiAddress',
      },
      set_metadata: {
        id: 'Compact<u32>',
        name: 'Bytes',
        symbol: 'Bytes',
        decimals: 'u8',
      },
      clear_metadata: {
        id: 'Compact<u32>',
      },
      force_set_metadata: {
        id: 'Compact<u32>',
        name: 'Bytes',
        symbol: 'Bytes',
        decimals: 'u8',
        isFrozen: 'bool',
      },
      force_clear_metadata: {
        id: 'Compact<u32>',
      },
      force_asset_status: {
        id: 'Compact<u32>',
        owner: 'MultiAddress',
        issuer: 'MultiAddress',
        admin: 'MultiAddress',
        freezer: 'MultiAddress',
        minBalance: 'Compact<u128>',
        isSufficient: 'bool',
        isFrozen: 'bool',
      },
      approve_transfer: {
        id: 'Compact<u32>',
        delegate: 'MultiAddress',
        amount: 'Compact<u128>',
      },
      cancel_approval: {
        id: 'Compact<u32>',
        delegate: 'MultiAddress',
      },
      force_cancel_approval: {
        id: 'Compact<u32>',
        owner: 'MultiAddress',
        delegate: 'MultiAddress',
      },
      transfer_approved: {
        id: 'Compact<u32>',
        owner: 'MultiAddress',
        destination: 'MultiAddress',
        amount: 'Compact<u128>',
      },
      touch: {
        id: 'Compact<u32>',
      },
      refund: {
        id: 'Compact<u32>',
        allowBurn: 'bool',
      },
      set_min_balance: {
        id: 'Compact<u32>',
        minBalance: 'u128',
      },
      touch_other: {
        id: 'Compact<u32>',
        who: 'MultiAddress',
      },
      refund_other: {
        id: 'Compact<u32>',
        who: 'MultiAddress',
      },
      block: {
        id: 'Compact<u32>',
        who: 'MultiAddress',
      },
      transfer_all: {
        id: 'Compact<u32>',
        dest: 'MultiAddress',
        keepAlive: 'bool'
      }
    }
  },
  /**
   * Lookup370: pallet_assets::pallet::Error<T, I>
   **/
  PalletAssetsError: {
    _enum: ['BalanceLow', 'NoAccount', 'NoPermission', 'Unknown', 'Frozen', 'InUse', 'BadWitness', 'MinBalanceZero', 'UnavailableConsumer', 'BadMetadata', 'Unapproved', 'WouldDie', 'AlreadyExists', 'NoDeposit', 'WouldBurn', 'LiveAsset', 'AssetNotLive', 'IncorrectStatus', 'NotFrozen', 'CallbackFailed', 'BadAssetId', 'ContainsFreezes', 'ContainsHolds']
  },
  /**
   * Lookup373: pallet_assets_freezer::pallet::Error<T, I>
   **/
  PalletAssetsFreezerError: {
    _enum: ['TooManyFreezes']
  },
  /**
   * Lookup374: pallet_hybrid_orderbook::types::Pool<T>
   **/
  PalletHybridOrderbookPool: {
    lpToken: 'u32',
    bids: 'PalletHybridOrderbookCritbitCritbitTree',
    asks: 'PalletHybridOrderbookCritbitCritbitTree',
    nextBidOrderId: 'u64',
    nextAskOrderId: 'u64',
    takerFeeRate: 'Permill',
    tickSize: 'u128',
    lotSize: 'u128',
    poolDecimals: 'u8',
    baseDecimals: 'u8',
    quoteDecimals: 'u8'
  },
  /**
   * Lookup375: pallet_hybrid_orderbook::critbit::CritbitTree<K, pallet_hybrid_orderbook::types::Tick<Quantity, sp_core::crypto::AccountId32, BlockNumber>>
   **/
  PalletHybridOrderbookCritbitCritbitTree: {
    root: 'u128',
    internalNodes: 'BTreeMap<u128, PalletHybridOrderbookCritbitInternalNode>',
    leaves: 'BTreeMap<u128, PalletHybridOrderbookCritbitLeafNode>',
    maxLeafIndex: 'u128',
    minLeafIndex: 'u128',
    nextInternalNodeIndex: 'u128',
    nextLeafNodeIndex: 'u128'
  },
  /**
   * Lookup376: pallet_hybrid_orderbook::types::Tick<Quantity, sp_core::crypto::AccountId32, BlockNumber>
   **/
  PalletHybridOrderbookTick: {
    openOrders: 'BTreeMap<u64, PalletHybridOrderbookOrder>'
  },
  /**
   * Lookup378: pallet_hybrid_orderbook::types::Order<Quantity, sp_core::crypto::AccountId32, BlockNumber>
   **/
  PalletHybridOrderbookOrder: {
    quantity: 'u128',
    owner: 'AccountId32',
    expiredAt: 'u32'
  },
  /**
   * Lookup382: pallet_hybrid_orderbook::critbit::InternalNode<K>
   **/
  PalletHybridOrderbookCritbitInternalNode: {
    mask: 'u128',
    parent: 'u128',
    left: 'u128',
    right: 'u128'
  },
  /**
   * Lookup386: pallet_hybrid_orderbook::critbit::LeafNode<K, pallet_hybrid_orderbook::types::Tick<Quantity, sp_core::crypto::AccountId32, BlockNumber>>
   **/
  PalletHybridOrderbookCritbitLeafNode: {
    parent: 'u128',
    key: 'u128',
    value: 'PalletHybridOrderbookTick'
  },
  /**
   * Lookup389: pallet_hybrid_orderbook::pallet::Call<T>
   **/
  PalletHybridOrderbookCall: {
    _enum: {
      create_pool: {
        baseAsset: 'FrameSupportTokensFungibleUnionOfNativeOrWithId',
        baseDecimals: 'u8',
        quoteAsset: 'FrameSupportTokensFungibleUnionOfNativeOrWithId',
        quoteDecimals: 'u8',
        takerFeeRate: 'Permill',
        tickSize: 'u128',
        lotSize: 'u128',
        poolDecimals: 'u8',
      },
      add_liquidity: {
        baseAsset: 'FrameSupportTokensFungibleUnionOfNativeOrWithId',
        quoteAsset: 'FrameSupportTokensFungibleUnionOfNativeOrWithId',
        baseAssetDesired: 'u128',
        quoteAssetDesired: 'u128',
        baseAssetMin: 'u128',
        quoteAssetMin: 'u128',
        mintTo: 'AccountId32',
      },
      remove_liquidity: {
        baseAsset: 'FrameSupportTokensFungibleUnionOfNativeOrWithId',
        quoteAsset: 'FrameSupportTokensFungibleUnionOfNativeOrWithId',
        lpTokenBurn: 'u128',
        baseAssetMinReceive: 'u128',
        quoteAssetMinReceive: 'u128',
        withdrawTo: 'AccountId32',
      },
      __Unused3: 'Null',
      __Unused4: 'Null',
      touch: {
        baseAsset: 'FrameSupportTokensFungibleUnionOfNativeOrWithId',
        quoteAsset: 'FrameSupportTokensFungibleUnionOfNativeOrWithId',
      },
      market_order: {
        baseAsset: 'FrameSupportTokensFungibleUnionOfNativeOrWithId',
        quoteAsset: 'FrameSupportTokensFungibleUnionOfNativeOrWithId',
        quantity: 'u128',
        isBid: 'bool',
      },
      limit_order: {
        baseAsset: 'FrameSupportTokensFungibleUnionOfNativeOrWithId',
        quoteAsset: 'FrameSupportTokensFungibleUnionOfNativeOrWithId',
        isBid: 'bool',
        price: 'u128',
        quantity: 'u128',
      },
      cancel_order: {
        baseAsset: 'FrameSupportTokensFungibleUnionOfNativeOrWithId',
        quoteAsset: 'FrameSupportTokensFungibleUnionOfNativeOrWithId',
        price: 'u128',
        orderId: 'u64',
        quantity: 'u128'
      }
    }
  },
  /**
   * Lookup390: pallet_hybrid_orderbook::pallet::Error<T>
   **/
  PalletHybridOrderbookError: {
    _enum: ['InvalidAssetPair', 'PoolExists', 'WrongDesiredAmount', 'AmountOneLessThanMinimal', 'AmountTwoLessThanMinimal', 'ReserveLeftLessThanMinimal', 'AmountOutTooHigh', 'PoolNotFound', 'Overflow', 'AssetOneDepositDidNotMeetMinimum', 'AssetTwoDepositDidNotMeetMinimum', 'AssetOneWithdrawalDidNotMeetMinimum', 'AssetTwoWithdrawalDidNotMeetMinimum', 'OptimalAmountLessThanDesired', 'InsufficientLiquidityMinted', 'ZeroLiquidity', 'ZeroAmount', 'ProvidedMinimumNotSufficientForSwap', 'ProvidedMaximumNotSufficientForSwap', 'InvalidPath', 'NonUniquePath', 'IncorrectPoolAssetId', 'BelowMinimum', 'InvalidOrderPrice', 'InvalidOrderQuantity', 'ErrorOnFillOrder', 'ErrorOnPlaceOrder', 'ErrorOnCancelOrder', 'OrderNotFound', 'NoPermission', 'OverOrderQuantity', 'ConversionError', 'NoOps', 'InvalidTickSize', 'InvalidLotSize']
  },
  /**
   * Lookup391: pallet_utility::pallet::Call<T>
   **/
  PalletUtilityCall: {
    _enum: {
      batch: {
        calls: 'Vec<Call>',
      },
      as_derivative: {
        index: 'u16',
        call: 'Call',
      },
      batch_all: {
        calls: 'Vec<Call>',
      },
      dispatch_as: {
        asOrigin: 'WarpxRuntimeOriginCaller',
        call: 'Call',
      },
      force_batch: {
        calls: 'Vec<Call>',
      },
      with_weight: {
        call: 'Call',
        weight: 'SpWeightsWeightV2Weight',
      },
      if_else: {
        main: 'Call',
        fallback: 'Call',
      },
      dispatch_as_fallible: {
        asOrigin: 'WarpxRuntimeOriginCaller',
        call: 'Call'
      }
    }
  },
  /**
   * Lookup394: pallet_sudo::pallet::Call<T>
   **/
  PalletSudoCall: {
    _enum: {
      sudo: {
        call: 'Call',
      },
      sudo_unchecked_weight: {
        call: 'Call',
        weight: 'SpWeightsWeightV2Weight',
      },
      set_key: {
        _alias: {
          new_: 'new',
        },
        new_: 'MultiAddress',
      },
      sudo_as: {
        who: 'MultiAddress',
        call: 'Call',
      },
      remove_key: 'Null'
    }
  },
  /**
   * Lookup395: warpx_runtime::OriginCaller
   **/
  WarpxRuntimeOriginCaller: {
    _enum: {
      system: 'FrameSupportDispatchRawOrigin',
      __Unused1: 'Null',
      __Unused2: 'Null',
      __Unused3: 'Null',
      __Unused4: 'Null',
      __Unused5: 'Null',
      __Unused6: 'Null',
      __Unused7: 'Null',
      __Unused8: 'Null',
      __Unused9: 'Null',
      __Unused10: 'Null',
      __Unused11: 'Null',
      __Unused12: 'Null',
      __Unused13: 'Null',
      __Unused14: 'Null',
      __Unused15: 'Null',
      __Unused16: 'Null',
      __Unused17: 'Null',
      __Unused18: 'Null',
      __Unused19: 'Null',
      __Unused20: 'Null',
      __Unused21: 'Null',
      __Unused22: 'Null',
      __Unused23: 'Null',
      __Unused24: 'Null',
      __Unused25: 'Null',
      __Unused26: 'Null',
      __Unused27: 'Null',
      __Unused28: 'Null',
      __Unused29: 'Null',
      __Unused30: 'Null',
      PolkadotXcm: 'PalletXcmOrigin',
      CumulusXcm: 'CumulusPalletXcmOrigin'
    }
  },
  /**
   * Lookup396: frame_support::dispatch::RawOrigin<sp_core::crypto::AccountId32>
   **/
  FrameSupportDispatchRawOrigin: {
    _enum: {
      Root: 'Null',
      Signed: 'AccountId32',
      None: 'Null'
    }
  },
  /**
   * Lookup397: pallet_xcm::pallet::Origin
   **/
  PalletXcmOrigin: {
    _enum: {
      Xcm: 'StagingXcmV5Location',
      Response: 'StagingXcmV5Location'
    }
  },
  /**
   * Lookup398: cumulus_pallet_xcm::pallet::Origin
   **/
  CumulusPalletXcmOrigin: {
    _enum: {
      Relay: 'Null',
      SiblingParachain: 'u32'
    }
  },
  /**
   * Lookup399: pallet_utility::pallet::Error<T>
   **/
  PalletUtilityError: {
    _enum: ['TooManyCalls']
  },
  /**
   * Lookup400: pallet_sudo::pallet::Error<T>
   **/
  PalletSudoError: {
    _enum: ['RequireSudo']
  },
  /**
   * Lookup402: sp_runtime::MultiSignature
   **/
  SpRuntimeMultiSignature: {
    _enum: {
      Ed25519: '[u8;64]',
      Sr25519: '[u8;64]',
      Ecdsa: '[u8;65]'
    }
  },
  /**
   * Lookup405: cumulus_pallet_weight_reclaim::StorageWeightReclaim<T, S>
   **/
  CumulusPalletWeightReclaimStorageWeightReclaim: '(FrameSystemExtensionsCheckNonZeroSender,FrameSystemExtensionsCheckSpecVersion,FrameSystemExtensionsCheckTxVersion,FrameSystemExtensionsCheckGenesis,Era,FrameSystemExtensionsCheckNonce,FrameSystemExtensionsCheckWeight,PalletTransactionPaymentChargeTransactionPayment,FrameMetadataHashExtensionCheckMetadataHash)',
  /**
   * Lookup407: frame_system::extensions::check_non_zero_sender::CheckNonZeroSender<T>
   **/
  FrameSystemExtensionsCheckNonZeroSender: 'Null',
  /**
   * Lookup408: frame_system::extensions::check_spec_version::CheckSpecVersion<T>
   **/
  FrameSystemExtensionsCheckSpecVersion: 'Null',
  /**
   * Lookup409: frame_system::extensions::check_tx_version::CheckTxVersion<T>
   **/
  FrameSystemExtensionsCheckTxVersion: 'Null',
  /**
   * Lookup410: frame_system::extensions::check_genesis::CheckGenesis<T>
   **/
  FrameSystemExtensionsCheckGenesis: 'Null',
  /**
   * Lookup413: frame_system::extensions::check_nonce::CheckNonce<T>
   **/
  FrameSystemExtensionsCheckNonce: 'Compact<u32>',
  /**
   * Lookup414: frame_system::extensions::check_weight::CheckWeight<T>
   **/
  FrameSystemExtensionsCheckWeight: 'Null',
  /**
   * Lookup415: pallet_transaction_payment::ChargeTransactionPayment<T>
   **/
  PalletTransactionPaymentChargeTransactionPayment: 'Compact<u128>',
  /**
   * Lookup416: frame_metadata_hash_extension::CheckMetadataHash<T>
   **/
  FrameMetadataHashExtensionCheckMetadataHash: {
    mode: 'FrameMetadataHashExtensionMode'
  },
  /**
   * Lookup417: frame_metadata_hash_extension::Mode
   **/
  FrameMetadataHashExtensionMode: {
    _enum: ['Disabled', 'Enabled']
  },
  /**
   * Lookup418: warpx_runtime::Runtime
   **/
  WarpxRuntimeRuntime: 'Null'
};
