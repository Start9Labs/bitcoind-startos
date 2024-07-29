import { sdk } from '../sdk'
import { bitcoinConfFile } from '../file-models/bitcoin.conf'
import { configSpec } from './spec'

export const read = sdk.setupConfigRead(configSpec, async ({ effects }) => {
  const bitcoinConf = (await bitcoinConfFile.read(effects))!

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
    'zmq-enabled': Object.keys(bitcoinConf).includes('zmqpubrawblock'),
    txindex: bitcoinConf.txindex === 1,
    coinstatsindex: bitcoinConf.coinstatsindex === 1,
    wallet: {
      enable: bitcoinConf.disablewallet === 0,
      avoidpartialspends: bitcoinConf.avoidpartialspends === 1,
      discardfee: bitcoinConf.discardfee,
    },
    advanced: {
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
        // TODO: onlyconnect probably needs to be saved to Store. But maybe not if config spec is updated to require min length of 1 for addnode if enabling onlyconnect (which we should be doing anyway)
        onlyconnect: Object.keys(bitcoinConf).includes('connect'),
        onlyonion: bitcoinConf.onlynet === 'onion',
        v2transport: bitcoinConf.v2transport === 1,
        addnode:
          bitcoinConf.addnode.length !== 0
            ? bitcoinConf.addnode
            : bitcoinConf.connect,
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
    },
  }
})
