import { bitcoinConfFile, shape } from '../../file-models/bitcoin.conf'
import { ConfigSpec } from './spec'
import { bitcoinConfDefaults } from '../../utils'
import { T } from '@start9labs/start-sdk'

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

export async function write(effects: T.Effects, input: ConfigSpec) {
  const otherConfig = {
    // RPC
    rpcbind: input.prune ? '127.0.0.1:18332' : '0.0.0.0:8332',
    rpcallowip: input.prune ? '127.0.0.1/32' : '0.0.0.0/0',

    // Wallet
    disablewallet: !input.wallet.enable ? 1 : 0,
    avoidpartialspends: input.wallet.avoidpartialspends ? 1 : 0,
    discardfee: input.wallet.discardfee || discardfee,

    // Other
    txindex: input.txindex ? 1 : 0,
    coinstatsindex: input.coinstatsindex ? 1 : 0,
    peerbloomfilters: input.peerbloomfilters ? 1 : 0,
    peerblockfilters: input.blockfilters.peerblockfilters ? 1 : 0,
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

  await bitcoinConfFile.merge(effects, otherConfig)
}
