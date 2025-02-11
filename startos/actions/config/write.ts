import { bitcoinConfFile, shape } from '../../file-models/bitcoin.conf'
import { ConfigSpec } from './spec'

export async function write(input: ConfigSpec) {
  const {
    wallet,
    txindex,
    coinstatsindex,
    prune,
    dbcache,
    bloomfilters,
    blockfilters,
  } = input

  const shaped: typeof shape._TYPE = {
    // RPC
    rpcbind: prune ? '127.0.0.1:18332' : '0.0.0.0:8332',
    rpcallowip: prune ? '127.0.0.1/32' : '0.0.0.0/0',

    // Wallet
    disablewallet: wallet.enable ? 0 : 1,
    avoidpartialspends: wallet.avoidpartialspends ? 1 : 0,
    discardfee: wallet.discardfee || undefined,

  }

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

  await bitcoinConfFile.merge(shaped)
}
