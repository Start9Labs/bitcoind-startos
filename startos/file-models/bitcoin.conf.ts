import { FileHelper, matches } from '@start9labs/start-sdk'
import { bitcoinConfDefaults } from '../utils'

const { anyOf } = matches
const object = matches.object
const stringArray = matches.array(matches.string)
const string = stringArray.map(([a]) => a).orParser(matches.string)
const number = stringArray.map(([a]) => Number(a)).orParser(matches.number)
const numLiteral = (val: any) => {
  return stringArray.map(([val]) => Number(val)).orParser(matches.literal(val))
}
const boolean = anyOf(numLiteral(0), numLiteral(1))
  .map((a) => !!a)
  .orParser(matches.boolean)
const literal = (val: string) => {
  return stringArray
    .map(([val]) => matches.literal(val))
    .orParser(matches.literal(val))
}
const {
  rpcbind,
  rpcallowip,
  rpcauth,
  rpcservertimeout,
  rpcthreads,
  rpcworkqueue,
  whitelist,
  bind,
  persistmempool,
  maxmempool,
  mempoolexpiry,
  mempoolfullrbf,
  permitbaremultisig,
  datacarrier,
  datacarriersize,
  listen,
  onlynet,
  externalip,
  v2transport,
  connect,
  addnode,
  disablewallet,
  avoidpartialspends,
  discardfee,
  prune,
  zmqpubrawblock,
  zmqpubhashblock,
  zmqpubhashtx,
  zmqpubrawtx,
  zmqpubsequence,
  coinstatsindex,
  txindex,
  dbcache,
  peerbloomfilters,
  blockfilterindex,
  peerblockfilters,
} = bitcoinConfDefaults

export const shape = object({
  // RPC
  rpcbind: string.onMismatch(rpcbind),
  rpcallowip: string.onMismatch(rpcallowip),
  rpcauth: stringArray.optional().onMismatch(rpcauth),
  rpcservertimeout: number.onMismatch(rpcservertimeout),
  rpcthreads: number.onMismatch(rpcthreads),
  rpcworkqueue: number.onMismatch(rpcworkqueue),

  // Mempool
  mempoolfullrbf: boolean.onMismatch(mempoolfullrbf),
  persistmempool: boolean.onMismatch(persistmempool),
  maxmempool: number.onMismatch(maxmempool),
  mempoolexpiry: number.onMismatch(mempoolexpiry),
  datacarrier: boolean.onMismatch(datacarrier),
  datacarriersize: number.onMismatch(datacarriersize),
  permitbaremultisig: boolean.onMismatch(permitbaremultisig),

  // Peers
  listen: boolean.onMismatch(listen),
  bind: string.optional().onMismatch(bind),
  connect: anyOf(stringArray, numLiteral(0)).onMismatch(connect),
  addnode: anyOf(stringArray).optional().onMismatch(addnode),
  onlynet: string.optional().onMismatch(onlynet),
  v2transport: boolean.onMismatch(v2transport),
  externalip: string.optional().onMismatch(externalip),

  // Whitelist
  whitelist: string.onMismatch(whitelist),

  // Pruning
  prune: number.onMismatch(prune),

  // Performance Tuning
  dbcache: number.onMismatch(dbcache),

  // Wallet
  disablewallet: boolean.onMismatch(disablewallet),
  avoidpartialspends: boolean.onMismatch(avoidpartialspends),
  discardfee: number.onMismatch(discardfee),

  // Zero MQ
  zmqpubrawblock: string.optional().onMismatch(zmqpubrawblock),
  zmqpubhashblock: string.optional().onMismatch(zmqpubhashblock),
  zmqpubrawtx: string.optional().onMismatch(zmqpubrawtx),
  zmqpubhashtx: string.optional().onMismatch(zmqpubhashtx),
  zmqpubsequence: string.optional().onMismatch(zmqpubsequence),

  // TxIndex
  txindex: boolean.onMismatch(txindex),

  // CoinstatsIndex
  coinstatsindex: boolean.onMismatch(coinstatsindex),

  // BIP37
  peerbloomfilters: boolean.onMismatch(peerbloomfilters),

  // BIP157
  blockfilterindex: string.optional().onMismatch(blockfilterindex),
  peerblockfilters: boolean.onMismatch(peerblockfilters),
})

export function fromBitcoinConf(text: string): Record<string, string[]> {
  const lines = text.split('\n')
  const dictionary = {} as Record<string, string[]>

  for (const line of lines) {
    const [key, value] = line.split('=', 2)
    if (key === '') {
      return dictionary
    } else if (key.startsWith('#')) {
      continue
    }
    const trimmedKey = key.trim()
    const trimmedValue = value.trim()

    if (!dictionary[trimmedKey]) {
      dictionary[trimmedKey] = []
    }

    dictionary[trimmedKey].push(trimmedValue)
  }

  return dictionary
}

function toBitcoinConf(conf: typeof shape._TYPE): string {
  let bitcoinConfStr = ''
  const toString = (a: any) => {
    if (a === true) {
      return '1'
    } else if (a === false) {
      return '0'
    } else {
      return a.toString()
    }
  }

  Object.entries(conf).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      for (const subValue of value) {
        bitcoinConfStr += `${key}=${toString(subValue)}\n`
      }
    } else if (value !== undefined) {
      bitcoinConfStr += `${key}=${toString(value)}\n`
    }
  })

  return bitcoinConfStr
}

export const bitcoinConfFile = FileHelper.raw(
  '/media/startos/volumes/main/bitcoin.conf',
  (obj: typeof shape._TYPE) => toBitcoinConf(obj),
  (str) => fromBitcoinConf(str),
  (obj) => shape.unsafeCast(obj),
)
