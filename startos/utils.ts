import { Effects } from '@start9labs/start-sdk/base/lib/Effects'
import { bitcoinConfFile, shape } from './file-models/bitcoin.conf'

export type GetNetworkInfo = {
  connections: number
  connectionsIn: number
  connectionsOut: number
}

export type GetBlockchainInfo = {
  chain: string
  blocks: number
  headers: number
  bestblockhash: string
  difficulty: number
  mediantime: number
  verificationprogress: number
  initialblockdownload: boolean
  chainwork: string
  size_on_disk: number
  pruned: boolean
  pruneheight?: number
  automatic_pruning?: boolean
  prune_target_size?: number
  softforks: Record<
    string,
    {
      type: string
      bip9?: {
        status: string
        bit?: number
        start_time: number
        timeout: number
        since: number
        statistics?: {
          period: number
          threshold: number
          elapsed: number
          count: number
          possible: boolean
        }
      }
      height?: number
      active: boolean
    }
  >
  warnings: string
}

export function getRpcPort(testnet: 0 | 1) {
  return testnet ? 18332 : 8332
}

export function getPeerPort(testnet: 0 | 1) {
  return testnet ? 18333 : 8333
}

export async function getRpcUsers(effects: Effects) {
  const rpcauth = await getRpcAuth(effects)
  return rpcauth?.map((e) => e.split(':', 2)[0])
}

export async function getRpcAuth(effects: Effects) {
  return (await bitcoinConfFile.read.const(effects))?.rpcauth
}

export const bitcoinConfDefaults = {
  // RPC
  rpcservertimeout: 30,
  rpcthreads: 4,
  rpcworkqueue: 16,

  // Mempool
  persistmempool: 1,
  maxmempool: 300,
  mempoolexpiry: 336,
  mempoolfullrbf: 1,
  permitbaremultisig: 1,
  datacarrier: 1,
  datacarriersize: 83,

  // Peers
  listen: 1,
  v2transport: 1,

  // Wallet
  disablewallet: 0,
  avoidpartialspends: 0,
  discardfee: 0.0001,

  // Other
  zmqpubrawblock: 'tcp://0.0.0.0:28332',
  zmqpubhashblock: 'tcp://0.0.0.0:28332',
  zmqpubrawtx: 'tcp://0.0.0.0:28333',
  zmqpubhashtx: 'tcp://0.0.0.0:28333',
  zmqpubsequence: 'tcp://0.0.0.0:28333',

  coinstatsindex: 0,
  txindex: 0,
  dbcache: 450,

  peerbloomfilters: 0,
  blockfilterindex: 0,
  peerblockfilters: 0,
}
