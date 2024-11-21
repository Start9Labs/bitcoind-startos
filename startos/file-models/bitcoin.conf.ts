import { FileHelper, matches } from '@start9labs/start-sdk'

const { object, string, literal, number, arrayOf, anyOf } = matches

export const shape = object(
  {
    // RPC
    rpcbind: string,
    rpcallowip: string,
    rpcauth: arrayOf(string),
    rpcservertimeout: number,
    rpcthreads: number,
    rpcworkqueue: number,

    // Mempool
    mempoolfullrbf: anyOf(literal(0), literal(1)),
    persistmempool: anyOf(literal(0), literal(1)),
    maxmempool: number,
    mempoolexpiry: number,
    datacarrier: anyOf(literal(0), literal(1)),
    datacarriersize: number,
    permitbaremultisig: anyOf(literal(0), literal(1)),

    // Peers
    listen: anyOf(literal(0), literal(1)),
    bind: string,
    connect: arrayOf(string),
    addnode: arrayOf(string),
    onlynet: literal('onion'),
    v2transport: anyOf(literal(0), literal(1)),

    // Whitelist
    whitelist: string,

    // Pruning
    prune: number,

    // Performance Tuning
    dbcache: number,

    // Wallet
    disablewallet: anyOf(literal(0), literal(1)),
    deprecatedrpc: string,
    avoidpartialspends: anyOf(literal(0), literal(1)),
    discardfee: number,

    // Zero MQ
    zmqpubrawblock: string,
    zmqpubhashblock: string,
    zmqpubrawtx: string,
    zmqpubhashtx: string,
    zmqpubsequence: string,

    // TxIndex
    txindex: literal(1),

    // CoinstatsIndex
    coinstatsindex: literal(1),

    // BIP37
    peerbloomfilters: literal(1),

    // BIP157
    blockfilterindex: literal('basic'),
    peerblockfilters: literal(1),

    // Testnet
    testnet: anyOf(literal(0), literal(1)),
  },
  [
    'rpcbind',
    'rpcallowip',
    'rpcauth',
    'rpcservertimeout',
    'rpcthreads',
    'rpcworkqueue',
    'mempoolfullrbf',
    'persistmempool',
    'maxmempool',
    'mempoolexpiry',
    'datacarrier',
    'datacarriersize',
    'permitbaremultisig',
    'listen',
    'bind',
    'connect',
    'addnode',
    'onlynet',
    'v2transport',
    'whitelist',
    'prune',
    'dbcache',
    'disablewallet',
    'deprecatedrpc',
    'avoidpartialspends',
    'discardfee',
    'zmqpubrawblock',
    'zmqpubhashblock',
    'zmqpubrawtx',
    'zmqpubhashtx',
    'zmqpubsequence',
    'txindex',
    'coinstatsindex',
    'peerbloomfilters',
    'blockfilterindex',
    'peerblockfilters',
    'testnet',
  ],
)

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
      for (const subValue of value) {
        bitcoinConfStr += `${key}=${subValue}\n`
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
): typeof shape._TYPE {
  let typed: Record<string, string | string[] | number> = {}
  const knownArrays: string[] = []
  const knownNums: string[] = []
  const knownStrings: string[] = []

  shape.map((obj) => {
    for (const [key, val] of Object.entries(obj)) {
      if (Array.isArray(val)) {
        knownArrays.push(key)
      } else if (typeof val === 'number') {
        knownNums.push(key)
      } else if (typeof val === 'string') {
        knownStrings.push(key)
      }
    }
  })

  Object.keys(obj).forEach((key) => {
    let val: string | string[] | number
    if (knownArrays.includes(key)) {
      val = obj[key]
    } else if (knownNums.includes(key)) {
      val = Number(obj[key])
    } else {
      val = obj[key][0]
    }
    typed[key] = val
  })
  return typed as unknown as typeof shape._TYPE
}

export function fromTypedBitcoinConf(
  typed: Partial<typeof shape._TYPE>,
): Record<string, string[]> {
  return Object.entries(typed).reduce(
    (obj, [key, val]) => ({
      ...obj,
      [key]: [typeof val === 'number' ? String(val) : val].flat(),
    }),
    {},
  )
}
