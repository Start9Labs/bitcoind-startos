import { Effects } from '@start9labs/start-sdk/base/lib/Effects'
import { bitcoinConfFile } from './file-models/bitcoin.conf'

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
