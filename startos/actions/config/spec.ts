import { utils } from '@start9labs/start-sdk'
import { sdk } from '../../sdk'
import * as diskusage from 'diskusage'

const { InputSpec, Value, List, Variants } = sdk
const diskUsage = utils.once(() => diskusage.check('/'))
const archivalMin = 900_000_000_000

export const configSpec = sdk.InputSpec.of({
  zmqEnabled: Value.toggle({
    name: 'ZeroMQ Enabled',
    default: true,
    description:
      'The ZeroMQ interface is useful for some applications which might require data related to block and transaction events from Bitcoin Core. For example, LND requires ZeroMQ be enabled for LND to get the latest block data',
  }),
  txindex: Value.dynamicToggle(async ({ effects }) => {
    const disk = await diskUsage()
    return {
      name: 'Transaction Index',
      default: disk.total >= archivalMin,
      description:
        'By enabling Transaction Index (txindex) Bitcoin Core will build a complete transaction index. This allows Bitcoin Core to access any transaction with commands like `getrawtransaction`.',
      disabled: disk.total < archivalMin ? 'Not enough disk space' : false,
    }
  }),
  coinstatsindex: Value.toggle({
    name: 'Coinstats Index',
    default: false,
    description:
      'Enabling Coinstats Index reduces the time for the gettxoutsetinfo RPC to complete at the cost of using additional disk space',
  }),
  wallet: Value.object(
    {
      name: 'Wallet',
      description: 'Wallet Settings',
    },
    InputSpec.of({
      enable: Value.toggle({
        name: 'Enable Wallet',
        default: true,
        description: 'Load the wallet and enable wallet RPC calls.',
      }),
      avoidpartialspends: Value.toggle({
        name: 'Avoid Partial Spends',
        default: true,
        description:
          'Group outputs by address, selecting all or none, instead of selecting on a per-output basis. This improves privacy at the expense of higher transaction fees.',
      }),
      discardfee: Value.number({
        name: 'Discard Change Tolerance',
        description:
          'The fee rate (in BTC/kB) that indicates your tolerance for discarding change by adding it to the fee.',
        required: false,
        default: null,
        min: 0,
        max: 0.01,
        integer: false,
        units: 'BTC/kB',
        placeholder: '.0001',
      }),
    }),
  ),
  prune: Value.dynamicNumber(async ({ effects }) => {
    const disk = await diskUsage()

    return {
      name: 'Pruning',
      description:
        'Set the maximum size of the blockchain you wish to store on disk. If your disk is larger than .9TB this value can be left undefined to maintain a full archival node (prune=0).',
      warning: 'Increasing this value will require re-syncing your node.',
      placeholder: 'Enter max blockchain size',
      required: disk.total < archivalMin,
      default: disk.total < archivalMin ? 550 : null,
      integer: true,
      units: 'MiB',
      min: 550,
    }
  }),
  dbcache: Value.number({
    name: 'Database Cache',
    description:
      "How much RAM to allocate for caching the TXO set. Higher values improve syncing performance, but increase your chance of using up all your system's memory or corrupting your database in the event of an ungraceful shutdown. Set this high but comfortably below your system's total RAM during IBD, then turn down to 450 (or leave blank) once the sync completes.",
    warning:
      'WARNING: Increasing this value results in a higher chance of ungraceful shutdowns, which can leave your node unusable if it happens during the initial block download. Use this setting with caution. Be sure to set this back to the default (450 or leave blank) once your node is synced. DO NOT press the STOP button if your dbcache is large. Instead, set this number back to the default, hit save, and wait for bitcoind to restart on its own.',
    required: false,
    default: null,
    min: 0,
    integer: true,
    units: 'MiB',
    placeholder: '450',
  }),
  blockfilters: Value.object(
    {
      name: 'Block Filters',
      description: 'Settings for storing and serving compact block filters',
    },
    InputSpec.of({
      blockfilterindex: Value.toggle({
        name: 'Compute Compact Block Filters (BIP158)',
        default: true,
        description:
          "Generate Compact Block Filters during initial sync (IBD) to enable 'getblockfilter' RPC. This is useful if dependent services need block filters to efficiently scan for addresses/transactions etc.",
      }),
      peerblockfilters: Value.toggle({
        name: 'Serve Compact Block Filters to Peers (BIP157)',
        default: false,
        description:
          "Serve Compact Block Filters as a peer service to other nodes on the network. This is useful if you wish to connect an SPV client to your node to make it efficient to scan transactions without having to download all block data.  'Compute Compact Block Filters (BIP158)' is required.",
      }),
    }),
  ),
  peerbloomfilters: Value.toggle({
    name: 'Serve Bloom Filters to Peers',
    default: false,
    description:
      'Peers have the option of setting filters on each connection they make after the version handshake has completed. Bloom filters are for clients implementing SPV (Simplified Payment Verification) that want to check that block headers  connect together correctly, without needing to verify the full blockchain.  The client must trust that the transactions in the chain are in fact valid.  It is highly recommended AGAINST using for anything except Bisq integration.',
    warning:
      'This is ONLY for use with Bisq integration, please use Block Filters for all other applications.',
  }),
})

export type ConfigSpec = typeof configSpec._TYPE
export type PartialConfigSpec = typeof configSpec._PARTIAL
