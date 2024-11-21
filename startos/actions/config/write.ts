import {
  bitcoinConfFile,
  fromTypedBitcoinConf,
  shape,
} from '../../file-models/bitcoin.conf'
import { ConfigSpec } from './spec'

export async function write(input: ConfigSpec) {
  const {
    rpc,
    wallet,
    txindex,
    coinstatsindex,
    testnet,
    mempool,
    peers,
    advanced: { prune, dbcache, bloomfilters, blockfilters },
  } = input

  const shaped: typeof shape._TYPE = {
    // RPC
    rpcauth: rpc.auth,
    rpcservertimeout: rpc.servertimeout,
    rpcthreads: rpc.threads,
    rpcworkqueue: rpc.workqueue,
    rpcbind: prune ? '127.0.0.1:18332' : '0.0.0.0:8332',
    rpcallowip: prune ? '127.0.0.1/32' : '0.0.0.0/0',

    // Mempool
    mempoolfullrbf: mempool.mempoolfullrbf === true ? 1 : 0,
    persistmempool: mempool.persistmempool === true ? 1 : 0,
    maxmempool: mempool.maxmempool,
    mempoolexpiry: mempool.mempoolexpiry,
    datacarrier: mempool.datacarrier === true ? 1 : 0,
    datacarriersize: mempool.datacarriersize,
    permitbaremultisig: mempool.permitbaremultisig === true ? 1 : 0,

    // Peers
    listen: peers.listen ? 1 : 0,
    v2transport: peers.v2transport ? 1 : 0,
    whitelist: '172.18.0.0/16',

    // Wallet
    disablewallet: wallet.enable ? 0 : 1,
    avoidpartialspends: wallet.avoidpartialspends ? 1 : 0,
    discardfee: wallet.discardfee,

    testnet: testnet ? 1 : 0,

  }

  if (peers.listen) shaped.bind = '0.0.0.0:8333'

  if (peers.connectpeer.selection === 'addnode') {
    shaped.addnode = peers.connectpeer.value.peers
  } else {
    shaped.connect = peers.connectpeer.value.peers
  }

  if (peers.onlyonion) shaped.onlynet = 'onion'

  if (prune) shaped.prune = prune

  if (dbcache) shaped.dbcache = dbcache

  if (wallet.enable) shaped.deprecatedrpc = 'create_bdb'

  // Zero MQ
  if (input.zmqEnabled) {
    shaped.zmqpubrawblock = 'tcp://0.0.0.0:28332'
    shaped.zmqpubhashblock = 'tcp://0.0.0.0:28332'
    shaped.zmqpubrawtx = 'tcp://0.0.0.0:28333'
    shaped.zmqpubhashtx = 'tcp://0.0.0.0:28333'
    shaped.zmqpubsequence = 'tcp://0.0.0.0:28333'
  }

  // TxIndex
  if (txindex) shaped.txindex = 1

  // CoinStatsIndex
  if (coinstatsindex) shaped.coinstatsindex = 1

  // BIP37
  if (bloomfilters) shaped.peerbloomfilters = 1

  // BIP157
  if (blockfilters.blockfilterindex) shaped.blockfilterindex = 'basic'

  if (blockfilters.peerblockfilters) shaped.peerblockfilters = 1

  await bitcoinConfFile.merge(fromTypedBitcoinConf(shaped))
}
