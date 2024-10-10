import {
  bitcoinConfFile,
  fromTypedBitcoinConf,
  TypedBitcoinConf,
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

  const typed: TypedBitcoinConf = {
    // RPC
    rpcuser: rpc.username,
    rpcpassword: rpc.password,
    rpcauth: rpc.advanced.auth,
    rpcservertimeout: rpc.advanced.servertimeout,
    rpcthreads: rpc.advanced.threads,
    rpcworkqueue: rpc.advanced.workqueue,
    rpcbind: rpc.enable && prune ? '127.0.0.1:18332' : '0.0.0.0:8332',
    rpcallowip: rpc.enable && prune ? '127.0.0.1/32' : '0.0.0.0/0',

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

  if (peers.listen) typed.bind = '0.0.0.0:8333'

  if (peers.connectpeer.selection === 'addnode') {
    typed.addnode = peers.connectpeer.value.peers
  } else {
    typed.connect = peers.connectpeer.value.peers
  }

  if (peers.onlyonion) typed.onlynet = 'onion'

  if (prune) typed.prune = prune

  if (dbcache) typed.dbcache = dbcache

  if (wallet.enable) typed.deprecatedrpc = 'create_bdb'

  // Zero MQ
  if (input.zmqEnabled) {
    typed.zmqpubrawblock = 'tcp://0.0.0.0:28332'
    typed.zmqpubhashblock = 'tcp://0.0.0.0:28332'
    typed.zmqpubrawtx = 'tcp://0.0.0.0:28333'
    typed.zmqpubhashtx = 'tcp://0.0.0.0:28333'
    typed.zmqpubsequence = 'tcp://0.0.0.0:28333'
  }

  // TxIndex
  if (txindex) typed.txindex = 1

  // CoinStatsIndex
  if (coinstatsindex) typed.coinstatsindex = 1

  // BIP37
  if (bloomfilters) typed.peerbloomfilters = 1

  // BIP157
  if (blockfilters.blockfilterindex) typed.blockfilterindex = 'basic'

  if (blockfilters.peerblockfilters) typed.peerblockfilters = 1

  await bitcoinConfFile.merge(fromTypedBitcoinConf(typed))
}
