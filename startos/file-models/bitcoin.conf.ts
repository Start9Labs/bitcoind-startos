import { FileHelper } from '@start9labs/start-sdk'

export type TypedBitcoinConf = {
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

function fromBitcoinConf(text: string): Record<string, string[]> {
  const lines = text.split('/n')
  const dictionary = {} as Record<string, string[]>

  for (const line of lines) {
    const [key, value] = line.split('=', 2)
    const trimmedKey = key.trim()
    const trimmedValue = value.trim()

    if (!dictionary[trimmedKey]) {
      dictionary[trimmedKey] = []
    }
    dictionary[trimmedKey].push(trimmedValue)
  }

  return dictionary
}

function toBitcoinConf(conf: Record<string, string[]>): string {
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
  (obj: Record<string, string[]>) => toBitcoinConf(obj), // BitcoinConf.typeof
  (str) => fromBitcoinConf(str),
)

export function toTypedBitcoinConf(
  obj: Record<string, string[]>,
): TypedBitcoinConf {
  const typed = {} as TypedBitcoinConf

  Object.keys(obj).forEach((key) => {
    if (TypedBitcoinConf.contains(key)) {
      const expectedType = TypedBitcoinConf.typeof(key)
      let val: string | string[] | number
      if (expectedType === 'array') {
        val = obj[key]
      } else if (expectedType === 'number') {
        val = Number(obj[key])
      } else {
        val = obj[key][0 || -1] // @TODO 0 or -1 depends on Bitcoin's behavior
      }
      typed[key] = val
    }
  })
  return typed
}

export function fromTypedBitcoinConf(
  typed: Partial<TypedBitcoinConf>,
): Record<string, string[]> {
  return Object.entries(typed).reduce(
    (obj, [key, val]) => ({
      ...obj,
      [key]: [typeof val === 'number' ? String(val) : val].flat(),
    }),
    {},
  )
}
