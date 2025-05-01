import { FileHelper, matches } from '@start9labs/start-sdk'
import { bitcoinConfDefaults } from '../utils'

const { anyOf, arrayOf, object } = matches

const stringArray = matches.array(matches.string)
const string = stringArray.map(([a]) => a).orParser(matches.string)
const number = stringArray.map(([a]) => Number(a)).orParser(matches.number)
const numLiteral = (val: any) => {
  return stringArray.map(([val]) => Number(val)).orParser(matches.literal(val))
}
const boolean = anyOf(numLiteral(0), numLiteral(1))
  .map((a) => !!a)
  .orParser(matches.boolean)
const literal = (val: string | number) => {
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
  rpccookiefile,
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
  rpccookiefile: literal(rpccookiefile).onMismatch(rpccookiefile),

  // Mempool
  mempoolfullrbf: anyOf(literal(0), literal(1)).onMismatch(mempoolfullrbf),
  persistmempool: anyOf(literal(0), literal(1)).onMismatch(persistmempool),
  maxmempool: number.onMismatch(maxmempool),
  mempoolexpiry: number.onMismatch(mempoolexpiry),
  datacarrier: anyOf(literal(0), literal(1)).onMismatch(datacarrier),
  datacarriersize: number.onMismatch(datacarriersize),
  permitbaremultisig: anyOf(literal(0), literal(1)).onMismatch(permitbaremultisig),

  // Peers
  listen: anyOf(literal(0), literal(1)).onMismatch(listen),
  bind: string.optional().onMismatch(bind),
  connect: arrayOf(string).optional().onMismatch(connect),
  addnode: anyOf(stringArray).optional().onMismatch(addnode),
  onlynet: string.optional().onMismatch(onlynet),
  v2transport: anyOf(literal(0), literal(1)).onMismatch(v2transport),
  externalip: string.optional().onMismatch(externalip),

  // Whitelist
  whitelist: stringArray.onMismatch(whitelist),

  // Pruning
  prune: number.onMismatch(prune),

  // Performance Tuning
  dbcache: number.onMismatch(dbcache),

  // Wallet
  disablewallet: anyOf(literal(0), literal(1)).onMismatch(disablewallet),
  avoidpartialspends: anyOf(literal(0), literal(1)).onMismatch(avoidpartialspends),
  discardfee: number.onMismatch(discardfee),

  // Zero MQ
  zmqpubrawblock: string.optional().onMismatch(zmqpubrawblock),
  zmqpubhashblock: string.optional().onMismatch(zmqpubhashblock),
  zmqpubrawtx: string.optional().onMismatch(zmqpubrawtx),
  zmqpubhashtx: string.optional().onMismatch(zmqpubhashtx),
  zmqpubsequence: string.optional().onMismatch(zmqpubsequence),

  // TxIndex
  txindex: anyOf(literal(0), literal(1)).onMismatch(txindex),

  // CoinstatsIndex
  coinstatsindex: anyOf(literal(0), literal(1)).onMismatch(coinstatsindex),

  // BIP37
  peerbloomfilters: anyOf(literal(0), literal(1)).onMismatch(peerbloomfilters),

  // BIP157
  blockfilterindex: string.optional().onMismatch(blockfilterindex),
  peerblockfilters: anyOf(literal(0), literal(1)).onMismatch(peerblockfilters),
})

export const bitcoinConfFile = FileHelper.ini(
  '/media/startos/volumes/main/bitcoin.conf',
  shape,
  { bracketedArray: false }
)
