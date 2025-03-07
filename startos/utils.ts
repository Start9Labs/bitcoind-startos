import { Effects } from '@start9labs/start-sdk/base/lib/Effects'
import { bitcoinConfFile } from './file-models/bitcoin.conf'
import { sdk } from './sdk'
import { peerInterfaceId } from './interfaces'

export type GetNetworkInfo = {
  connections: number
  connections_in: number
  connections_out: number
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

export async function getRpcUsers(effects: Effects) {
  const rpcauth = await getRpcAuth(effects)
  return rpcauth?.map((e) => e.split(':', 2)[0])
}

export async function getRpcAuth(effects: Effects) {
  return (await bitcoinConfFile.read.const(effects))?.rpcauth
}

export const bitcoinConfDefaults = {
  // RPC
  rpcbind: '0.0.0.0:8332',
  rpcallowip: '0.0.0.0/0',
  rpcauth: undefined,
  rpcservertimeout: 30,
  rpcthreads: 4,
  rpcworkqueue: 16,
  whitelist: ['172.18.0.0/16'],
  bind: undefined,

  // Mempool
  persistmempool: true,
  maxmempool: 300,
  mempoolexpiry: 336,
  mempoolfullrbf: true,
  permitbaremultisig: true,
  datacarrier: true,
  datacarriersize: 83,

  // Peers
  listen: true,
  onlynet: undefined,
  externalip: undefined,
  v2transport: true,
  connect: undefined,
  addnode: undefined,

  // Wallet
  disablewallet: false,
  avoidpartialspends: false,
  discardfee: 0.0001,

  // Other
  prune: 0,
  zmqpubrawblock: undefined,
  zmqpubhashblock: undefined,
  zmqpubrawtx: undefined,
  zmqpubhashtx: undefined,
  zmqpubsequence: undefined,

  coinstatsindex: false,
  txindex: false,
  dbcache: 450,

  peerbloomfilters: false,
  blockfilterindex: 'basic',
  peerblockfilters: false,
}

export function getExteralAddresses() {
  return sdk.Value.dynamicSelect(async ({ effects }) => {
    const peerInterface = await sdk.serviceInterface
      .getOwn(effects, peerInterfaceId)
      .const()

    const urls = peerInterface?.addressInfo?.publicUrls || []

    if (urls.length === 0) {
      return {
        name: 'External Address',
        description:
          "Address at which your node can be reached by peers. Select 'none' if you do not want your node to be reached by peers.",
        values: { none: 'none' },
        default: 'none',
      }
    }

    const urlsWithNone = urls.reduce(
      (obj, url) => ({
        ...obj,
        [url]: url,
      }),
      {} as Record<string, string>,
    )

    urlsWithNone['none'] = 'none'

    return {
      name: 'External Address',
      description:
        "Address at which your node can be reached by peers. Select 'none' if you do not want your node to be reached by peers.",
      values: urlsWithNone,
      default: urls.find((u) => u.endsWith('.onion')) || '',
    }
  })
}
