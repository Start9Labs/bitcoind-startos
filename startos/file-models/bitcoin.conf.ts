import { FileHelper } from '@start9labs/start-sdk'

export type BitcoinConf = {
  // RPC
  rpcbind: string
  rpcallowip: string
  rpcuser: string
  rpcpassword: string
  rpcauth: string[]
  // list of objects 
  // null pw = noop
  // index = identifier for rpcauth entries
  rpcservertimeout: number
  rpcthreads: number
  rpcworkqueue: number

  // Mempool
  mempoolfullrbf: 0 | 1
  persistmempool: 0 | 1
  maxmempool: number
  mempoolexpiry: number
  datacarrier: 0 | 1
  datacarriersize: number
  permitbaremultisig: 0 | 1

  // Peers
  listen: 0 | 1
  bind?: string
  connect?: string[]
  addnode?: string[]
  onlynet?: 'onion'
  v2transport: 0 | 1

  // Whitelist
  whitelist: string

  // Pruning
  prune?: number

  // Performance Tuning
  dbcache?: number

  // Wallet
  disablewallet: 0 | 1
  deprecatedrpc?: string
  avoidpartialspends: 0 | 1
  discardfee: number

  // Zero MQ
  zmqpubrawblock?: string
  zmqpubhashblock?: string
  zmqpubrawtx?: string
  zmqpubhashtx?: string
  zmqpubsequence?: string

  // TxIndex
  txindex?: 1

  // CoinstatsIndex
  coinstatsindex?: 1

  // BIP37
  peerbloomfilters?: 1

  // BIP157
  blockfilterindex?: 'basic'
  peerblockfilters?: 1

  // Testnet
  testnet: 0 | 1
}

function parseStringToObj(text: string): BitcoinConf {
  const lines = text.split('/n')
  const bitcoinConf: { [key: string]: number | string | string[] } = {}

  for (const line of lines) {
    const [key, value] = line.split('=')
    const trimmedKey = key.trim()
    const trimmedValue = value.trim()

    if (!bitcoinConf[trimmedKey]) {
      bitcoinConf[trimmedKey] = []
    }
    ;(bitcoinConf[trimmedKey] as string[]).push(trimmedValue)
  }

  Object.keys(bitcoinConf).forEach((key) => {
    if (Array.isArray(bitcoinConf[key]) && bitcoinConf[key].length === 1) {
      if (key === 'rpcauth' || key === 'addnode' || key === 'connect') return
      const val = (bitcoinConf[key] as string[])[0]
      const maybeNum = Number(val)
      if (isNaN(maybeNum)) {
        bitcoinConf[key] = val
      } else {
        bitcoinConf[key] = maybeNum
      }
    }
  })
  return bitcoinConf as BitcoinConf
}

function parseBitcoinConfToString(conf: BitcoinConf): string {
  let bitcoinConfStr = ''

  Object.entries(conf).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      for (const v of value) {
        bitcoinConfStr += `${key}=${v}\n`
      }
    } else {
      bitcoinConfStr += `${key}=${value}\n`
    }
  })
  return bitcoinConfStr
}

export const bitcoinConfFile = FileHelper.raw(
  './bitcoin/bitcoin.conf',
  (obj: BitcoinConf) => parseBitcoinConfToString(obj), // BitcoinConf.typeof
  (str) => parseStringToObj(str),
)
