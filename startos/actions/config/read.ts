import {
  bitcoinConfFile,
  toTypedBitcoinConf,
} from '../../file-models/bitcoin.conf'
import { ConfigSpec } from './spec'

export async function read(effects: any): Promise<ConfigSpec> {
  const bitcoinConf = await bitcoinConfFile.read
    .const(effects)
    .then((conf) => toTypedBitcoinConf(conf || {}))

  return {
    rpc: {
      enable: Object.keys(bitcoinConf).includes('rpcbind'),
      username: bitcoinConf.rpcuser,
      password: bitcoinConf.rpcpassword,
      advanced: {
        auth: bitcoinConf.rpcauth,
        servertimeout: bitcoinConf.rpcservertimeout,
        threads: bitcoinConf.rpcthreads,
        workqueue: bitcoinConf.rpcworkqueue,
      },
    },
    zmqEnabled: Object.keys(bitcoinConf).includes('zmqpubrawblock'),
    txindex: bitcoinConf.txindex === 1,
    coinstatsindex: bitcoinConf.coinstatsindex === 1,
    testnet: bitcoinConf.testnet === 1,
    wallet: {
      enable: bitcoinConf.disablewallet === 0,
      avoidpartialspends: bitcoinConf.avoidpartialspends === 1,
      discardfee: bitcoinConf.discardfee,
    },
    mempool: {
      persistmempool: bitcoinConf.persistmempool === 1,
      maxmempool: bitcoinConf.maxmempool,
      mempoolexpiry: bitcoinConf.mempoolexpiry,
      mempoolfullrbf: bitcoinConf.mempoolfullrbf === 1,
      permitbaremultisig: bitcoinConf.permitbaremultisig === 1,
      datacarrier: bitcoinConf.datacarrier === 1,
      datacarriersize: bitcoinConf.datacarriersize,
    },
    peers: {
      listen: bitcoinConf.listen === 1,
      onlyonion: bitcoinConf.onlynet === 'onion',
      v2transport: bitcoinConf.v2transport === 1,
      connectpeer: Object.keys(bitcoinConf).includes('connect')
        ? {
            selection: 'connect' as const,
            value: {
              peers: bitcoinConf['connect'] || [],
            },
          }
        : {
            selection: 'addnode' as const,
            value: {
              peers: bitcoinConf['addnode'] || [],
            },
          },
    },
    advanced: {
      prune: bitcoinConf.prune,
      dbcache: bitcoinConf.dbcache,
      blockfilters: {
        blockfilterindex: bitcoinConf.blockfilterindex === 'basic',
        peerblockfilters: bitcoinConf.peerblockfilters === 1,
      },
      bloomfilters: {
        peerbloomfilters: bitcoinConf.peerbloomfilters === 1,
      },
    },
  }
}
