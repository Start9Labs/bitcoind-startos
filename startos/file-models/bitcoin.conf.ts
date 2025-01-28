import { FileHelper, matches } from '@start9labs/start-sdk'

const { anyOf, literal } = matches
const object = matches.object
const stringArray = matches.array(matches.string)
const string = stringArray.map(([a]) => a).orParser(matches.string)
const number = stringArray.map(([a]) => Number(a)).orParser(matches.number)

export const shape = object({
  // RPC
  rpcbind: matches.string.optional().onMismatch(undefined),
  rpcallowip: matches.string.optional().onMismatch(undefined),
  rpcauth: stringArray.optional().onMismatch(undefined),
  rpcservertimeout: number.optional(),
  rpcthreads: number.optional().onMismatch(undefined),
  rpcworkqueue: number.optional().onMismatch(undefined),

  // Mempool
  mempoolfullrbf: anyOf(literal(0), literal(1)).optional().onMismatch(undefined),
  persistmempool: anyOf(literal(0), literal(1)).optional().onMismatch(undefined),
  maxmempool: number.optional().onMismatch(undefined),
  mempoolexpiry: number.optional().onMismatch(undefined),
  datacarrier: anyOf(literal(0), literal(1)).optional().onMismatch(undefined),
  datacarriersize: number.optional().onMismatch(undefined),
  permitbaremultisig: anyOf(literal(0), literal(1)).optional().onMismatch(undefined),

  // Peers
  listen: anyOf(literal(0), literal(1)).optional().onMismatch(undefined),
  bind: string.optional().onMismatch(undefined),
  connect: stringArray.optional().onMismatch(undefined),
  addnode: stringArray.optional().onMismatch(undefined),
  onlynet: literal('onion').optional().onMismatch(undefined),
  v2transport: anyOf(literal(0), literal(1)).optional().onMismatch(undefined),

  // Whitelist
  whitelist: string.optional().onMismatch(undefined),

  // Pruning
  prune: number.optional().onMismatch(undefined),

  // Performance Tuning
  dbcache: number.optional().onMismatch(undefined),

  // Wallet
  disablewallet: anyOf(literal(0), literal(1)).optional().onMismatch(undefined),
  deprecatedrpc: string.optional().onMismatch(undefined),
  avoidpartialspends: anyOf(literal(0), literal(1)).optional().onMismatch(undefined),
  discardfee: number.optional().onMismatch(undefined),

  // Zero MQ
  zmqpubrawblock: string.optional().onMismatch(undefined),
  zmqpubhashblock: string.optional().onMismatch(undefined),
  zmqpubrawtx: string.optional().onMismatch(undefined),
  zmqpubhashtx: string.optional().onMismatch(undefined),
  zmqpubsequence: string.optional().onMismatch(undefined),

  // TxIndex
  txindex: literal(1).optional().onMismatch(undefined),

  // CoinstatsIndex
  coinstatsindex: literal(1).optional().onMismatch(undefined),

  // BIP37
  peerbloomfilters: literal(1).optional().onMismatch(undefined),

  // BIP157
  blockfilterindex: literal('basic').optional().onMismatch(undefined),
  peerblockfilters: literal(1).optional().onMismatch(undefined),

  // Testnet
  testnet: anyOf(literal(0), literal(1)).optional().onMismatch(undefined),
})

export function fromBitcoinConf(text: string): Record<string, string[]> {
  const lines = text.split('\n')
  const dictionary = {} as Record<string, string[]>

  for (const line of lines) {
    const [key, value] = line.split('=', 2)
    if (key === "") return dictionary
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
  conf: typeof shape._TYPE,
): string {
  let bitcoinConfStr = ''

  Object.entries(conf).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      for (const subValue of value) {
        bitcoinConfStr += `${key}=${subValue}\n`
      }
    } else if (value !== undefined) {
      bitcoinConfStr += `${key}=${value}\n`
    }
  })
  return bitcoinConfStr
}

export const bitcoinConfFile = FileHelper.raw(
  '/media/startos/volumes/main/bitcoin.conf',
  (obj: typeof shape._TYPE) => toBitcoinConf(obj), // BitcoinConf.typeof
  (str) => fromBitcoinConf(str),
  (obj) => shape.unsafeCast(obj),
)
