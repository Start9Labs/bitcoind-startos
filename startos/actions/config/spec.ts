import { utils } from '@start9labs/start-sdk'
import { sdk } from '../../sdk'
import * as diskusage from 'diskusage'

const { InputSpec, Value, List, Variants } = sdk
const diskUsage = utils.once(() => diskusage.check('/'))
const archivalMin = 900_000_000_000

export const configSpec = sdk.InputSpec.of({
  rpc: Value.object(
    {
      name: 'RPC Settings',
      description: 'RPC configuration options.',
    },
    InputSpec.of({
      auth: Value.list(
        List.text(
          {
            name: 'RPCAuth Usernames',
            description: 'Usernames for remote connections using RPCAuth',
            minLength: 0,
          },
          {
            masked: true,
            patterns: [
              {
                regex: '^[a-zA-Z0-9_]+$',
                description: 'Must be alphanumeric (can contain underscore).',
              },
            ],
          },
        ),
      ),
      servertimeout: Value.number({
        name: 'Rpc Server Timeout',
        description:
          'Number of seconds after which an uncompleted RPC call will time out.',
        required: false,
        default: null,
        min: 5,
        max: 300,
        integer: true,
        units: 'seconds',
        placeholder: '30',
      }),
      threads: Value.number({
        name: 'Threads',
        description:
          'Set the number of threads for handling RPC calls. You may wish to increase this if you are making lots of calls via an integration.',

        required: false,
        default: null,
        min: 4,
        max: 64,
        step: null,
        integer: true,
        units: null,
        placeholder: '16',
      }),
      workqueue: Value.number({
        name: 'Work Queue',
        description:
          'Set the depth of the work queue to service RPC calls. Determines how long the backlog of RPC requests can get before it just rejects new ones.',

        required: false,
        default: null,
        min: 8,
        max: 256,
        step: null,
        integer: true,
        units: 'requests',
        placeholder: '128',
      }),
    }),
  ),
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
  testnet: Value.toggle({
    name: 'Testnet',
    default: false,
    description:
      'Testnet is an alternative Bitcoin block chain to be used for testing. Testnet coins are separate and distinct from actual bitcoins, and are never supposed to have any value. This allows application developers or bitcoin testers to experiment, without having to use real bitcoins or worrying about breaking the main bitcoin chain.',
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
  mempool: Value.object(
    {
      name: 'Mempool',
      description: 'Mempool Settings',
    },
    InputSpec.of({
      persistmempool: Value.toggle({
        name: 'Persist Mempool',
        default: true,
        description: 'Save the mempool on shutdown and load on restart.',
      }),
      maxmempool: Value.number({
        name: 'Max Mempool Size',
        description: 'Keep the transaction memory pool below <n> megabytes.',
        required: false,
        default: null,
        min: 1,
        integer: true,
        units: 'MiB',
        placeholder: '300',
      }),
      mempoolexpiry: Value.number({
        name: 'Mempool Expiration',
        description:
          'Do not keep transactions in the mempool longer than <n> hours.',
        required: false,
        default: null,
        min: 1,
        integer: true,
        units: 'Hr',
        placeholder: '336',
      }),
      mempoolfullrbf: Value.toggle({
        name: 'Enable Full RBF',
        default: true,
        description:
          'Policy for your node to use for relaying and mining unconfirmed transactions.  For details, see https://github.com/bitcoin/bitcoin/blob/master/doc/release-notes/release-notes-24.0.1.md#notice-of-new-option-for-transaction-replacement-policies',
      }),
      permitbaremultisig: Value.toggle({
        name: 'Permit Bare Multisig',
        default: true,
        description: 'Relay non-P2SH multisig transactions',
      }),
      datacarrier: Value.toggle({
        name: 'Relay OP_RETURN Transactions',
        default: true,
        description: 'Relay transactions with OP_RETURN outputs',
      }),
      datacarriersize: Value.number({
        name: 'Max OP_RETURN Size',
        description: 'Maximum size of data in OP_RETURN outputs to relay',
        required: false,
        default: null,
        min: 0,
        max: 10_000,
        integer: true,
        units: 'bytes',
        placeholder: '83',
      }),
    }),
  ),
  peers: Value.object(
    {
      name: 'Peers',
      description: 'Peer Connection Settings',
    },
    InputSpec.of({
      listen: Value.toggle({
        name: 'Make Public',
        default: true,
        description: 'Allow other nodes to find your server on the network.',
      }),
      onlyonion: Value.toggle({
        name: 'Disable Clearnet',
        default: false,
        description: 'Only connect to peers over Tor.',
      }),
      v2transport: Value.toggle({
        name: 'Use V2 P2P Transport Protocol',
        default: true,
        description:
          'Enable or disable the use of BIP324 V2 P2P transport protocol.',
      }),
      connectpeer: Value.union(
        {
          name: 'Connect Peer',
          default: 'addnode',
        },
        Variants.of({
          connect: {
            name: 'Connect',
            spec: InputSpec.of({
              peers: Value.list(
                List.text(
                  {
                    name: 'Connect Nodes',
                    minLength: 1,
                    description:
                      'Add addresses of nodes for Bitcoin to EXCLUSIVELY connect to.',
                  },
                  {
                    patterns: [
                      {
                        regex:
                          '(^s*((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?).(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?).(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?).(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?:[0-9]{1,5}))s*$)|(^s*((?=.{1,255}$)[0-9A-Za-z](?:(?:[0-9A-Za-z]|\b-){0,61}[0-9A-Za-z])?(?:.[0-9A-Za-z](?:(?:[0-9A-Za-z]|\b-){0,61}[0-9A-Za-z])?)*.?:[0-9]{1,5})s*$)|(^s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:)))(%.+)?:[0-9]{1,5}s*$)',
                        description:
                          "Must be either a domain name, or an IPv4 or IPv6 address. Be sure to include the port number, but do not include protocol scheme (eg 'http://').",
                      },
                    ],
                  },
                ),
              ),
            }),
          },
          addnode: {
            name: 'Add Node',
            spec: InputSpec.of({
              peers: Value.list(
                List.text(
                  {
                    name: 'Add Nodes',
                    description:
                      'Add addresses of nodes for Bitcoin to connect with in addition to default nodes.',
                  },
                  {
                    inputmode: 'text',
                    patterns: [
                      {
                        regex:
                          '(^s*((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?).(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?).(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?).(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?:[0-9]{1,5}))s*$)|(^s*((?=.{1,255}$)[0-9A-Za-z](?:(?:[0-9A-Za-z]|\b-){0,61}[0-9A-Za-z])?(?:.[0-9A-Za-z](?:(?:[0-9A-Za-z]|\b-){0,61}[0-9A-Za-z])?)*.?:[0-9]{1,5})s*$)|(^s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:)))(%.+)?:[0-9]{1,5}s*$)',
                        description:
                          "Must be either a domain name, or an IPv4 or IPv6 address. Be sure to include the port number, but do not include protocol scheme (eg 'http://').",
                      },
                    ],
                  },
                ),
              ),
            }),
          },
        }),
      ),
    }),
  ),
  advanced: Value.object(
    {
      name: 'Advanced',
      description: 'Advanced Settings',
    },
    InputSpec.of({
      prune: Value.dynamicNumber(async ({ effects }) => {
        const disk = await diskUsage()

        return {
          name: 'Pruning',
          description:
            'Set the maximum size of the blockchain you wish to store on disk.',
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
      bloomfilters: Value.object(
        {
          name: 'Bloom Filters (BIP37)',
          description: 'Setting for serving Bloom Filters',
        },
        InputSpec.of({
          peerbloomfilters: Value.toggle({
            name: 'Serve Bloom Filters to Peers',
            default: false,
            description:
              'Peers have the option of setting filters on each connection they make after the version handshake has completed. Bloom filters are for clients implementing SPV (Simplified Payment Verification) that want to check that block headers  connect together correctly, without needing to verify the full blockchain.  The client must trust that the transactions in the chain are in fact valid.  It is highly recommended AGAINST using for anything except Bisq integration.',
            warning:
              'This is ONLY for use with Bisq integration, please use Block Filters for all other applications.',
          }),
        }),
      ),
    }),
  ),
})

export type ConfigSpec = typeof configSpec._TYPE
export type PartialConfigSpec = typeof configSpec._PARTIAL
