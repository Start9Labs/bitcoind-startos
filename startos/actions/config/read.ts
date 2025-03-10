import { bitcoinConfFile } from '../../file-models/bitcoin.conf'
import { PartialConfigSpec } from './spec'

export async function read(effects: any): Promise<PartialConfigSpec> {
  const bitcoinConf = await bitcoinConfFile.read.const(effects)
  if (!bitcoinConf) return {}

  return {
    zmqEnabled: Object.keys(bitcoinConf).includes('zmqpubrawblock'),
    txindex: bitcoinConf.txindex,
    coinstatsindex: bitcoinConf.coinstatsindex,
    wallet: {
      enable: !bitcoinConf.disablewallet,
      avoidpartialspends: bitcoinConf.avoidpartialspends,
      discardfee: bitcoinConf.discardfee,
    },
    prune: bitcoinConf.prune,
    dbcache: bitcoinConf.dbcache,
    blockfilters: {
      blockfilterindex: bitcoinConf.blockfilterindex === ('basic' as const),
      peerblockfilters: bitcoinConf.peerblockfilters,
    },
    peerbloomfilters: bitcoinConf.peerbloomfilters,
  }
}
