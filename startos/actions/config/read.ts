import { bitcoinConfFile } from '../../file-models/bitcoin.conf'
import { PartialConfigSpec } from './spec'

export async function read(effects: any): Promise<PartialConfigSpec> {
  const bitcoinConf = await bitcoinConfFile.read.const(effects)
  if (!bitcoinConf) return {}

  return {
    zmqEnabled: Object.keys(bitcoinConf).includes('zmqpubrawblock'),
    txindex: bitcoinConf.txindex === 1,
    coinstatsindex: bitcoinConf.coinstatsindex === 1,
    wallet: {
      enable: bitcoinConf.disablewallet === 0,
      avoidpartialspends: bitcoinConf.avoidpartialspends === 1,
      discardfee: bitcoinConf.discardfee ? bitcoinConf.discardfee : null,
    },
    prune: bitcoinConf.prune,
    dbcache: bitcoinConf.dbcache,
    blockfilters: {
      blockfilterindex: bitcoinConf.blockfilterindex === 'basic',
      peerblockfilters: bitcoinConf.peerblockfilters === 1,
    },
    bloomfilters: {
      peerbloomfilters: bitcoinConf.peerbloomfilters === 1,
    },
  }
}
