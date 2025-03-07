import { bitcoinConfFile, shape } from '../../file-models/bitcoin.conf'
import { ConfigSpec } from './spec'
import { bitcoinConfDefaults } from '../../utils'

const {
  discardfee,
  prune,
  dbcache,
  zmqpubhashblock,
  zmqpubhashtx,
  zmqpubrawtx,
  zmqpubrawblock,
  zmqpubsequence,
} = bitcoinConfDefaults

export async function write(input: ConfigSpec) {
  const otherConfig = {
    // RPC
    rpcbind: input.prune ? '127.0.0.1:18332' : '0.0.0.0:8332',
    rpcallowip: input.prune ? '127.0.0.1/32' : '0.0.0.0/0',

    // Wallet
    disablewallet: !input.wallet.enable,
    avoidpartialspends: input.wallet.avoidpartialspends,
    discardfee: input.wallet.discardfee || discardfee,

    // Other
    txindex: input.txindex,
    coinstatsindex: input.coinstatsindex,
    peerbloomfilters: input.peerbloomfilters,
    peerblockfilters: input.blockfilters.peerblockfilters,
    blockfilterindex: input.blockfilters.blockfilterindex ? 'basic' : undefined,
    prune: input.prune ? input.prune : prune,
    dbcache: input.dbcache ? input.dbcache : dbcache,
  }

  // Zero MQ
  if (input.zmqEnabled) {
    Object.assign({
      otherConfig,
      zmqpubrawblock: 'tcp://0.0.0.0:28332',
      zmqpubhashblock: 'tcp://0.0.0.0:28332',
      zmqpubrawtx: 'tcp://0.0.0.0:28333',
      zmqpubhashtx: 'tcp://0.0.0.0:28333',
      zmqpubsequence: 'tcp://0.0.0.0:28333',
    })
  } else {
    Object.assign({
      otherConfig,
      zmqpubrawblock: zmqpubrawblock,
      zmqpubhashblock: zmqpubhashblock,
      zmqpubrawtx: zmqpubrawtx,
      zmqpubhashtx: zmqpubhashtx,
      zmqpubsequence: zmqpubsequence,
    })
  }

  await bitcoinConfFile.merge(otherConfig)
}
