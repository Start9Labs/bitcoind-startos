import { FileHelper, matches } from '@start9labs/start-sdk'

const { anyOf, literal } = matches
const object = matches.object
const stringArray = matches.array(matches.string)
const string = stringArray.map(([a]) => a)
const number = stringArray.map(([a]) => Number(a))

export const shape = object({
  // RPC
  rpcbind: string,
  rpcallowip: string,
  rpcauth: stringArray.optional().onMismatch(undefined),
  rpcservertimeout: number.optional().onMismatch(undefined),
  rpcthreads: number.optional().onMismatch(undefined),
  rpcworkqueue: number.optional().onMismatch(undefined),

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
  connect: stringArray,
  addnode: stringArray,
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
})

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

function toBitcoinConf(
  conf: Record<string, readonly string[] | string[] | string | number>,
): string {
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
  (obj: typeof shape._TYPE) => toBitcoinConf(obj), // BitcoinConf.typeof
  (str) => fromBitcoinConf(str),
  (obj) => shape.unsafeCast(obj),
)
