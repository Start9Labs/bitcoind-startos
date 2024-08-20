import { sdk } from '../sdk'
import { setDependencies } from '../dependencies/dependencies'
import { setInterfaces } from '../interfaces'
import { BitcoinConf, bitcoinConfFile } from '../file-models/bitcoin.conf'
import { configSpec } from './spec'

export const save = sdk.setupConfigSave(
  configSpec,
  async ({ effects, input }) => {
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

    const config: BitcoinConf = {
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

    if (peers.listen) config.bind = '0.0.0.0:8333'

    if (peers.connectpeer.selection === 'addnode') {
      config.addnode = peers.connectpeer.value.peers
    } else {
      config.connect = peers.connectpeer.value.peers
    }

    if (peers.onlyonion) config.onlynet = 'onion'

    if (prune) config.prune = prune

    if (dbcache) config.dbcache = dbcache

    if (wallet.enable) config.deprecatedrpc = 'create_bdb'

    // Zero MQ
    if (input.zmqEnabled) {
      config.zmqpubrawblock = 'tcp://0.0.0.0:28332'
      config.zmqpubhashblock = 'tcp://0.0.0.0:28332'
      config.zmqpubrawtx = 'tcp://0.0.0.0:28333'
      config.zmqpubhashtx = 'tcp://0.0.0.0:28333'
      config.zmqpubsequence = 'tcp://0.0.0.0:28333'
    }

    // TxIndex
    if (txindex) config.txindex = 1

    // CoinStatsIndex
    if (coinstatsindex) config.coinstatsindex = 1

    // BIP37
    if (bloomfilters) config.peerbloomfilters = 1

    // BIP157
    if (blockfilters.blockfilterindex) config.blockfilterindex = 'basic'

    if (blockfilters.peerblockfilters) config.peerblockfilters = 1

    await bitcoinConfFile.merge(config, effects)

    return {
      interfacesReceipt: await setInterfaces({ effects, input }), // Plumbing. DO NOT EDIT. This line causes setInterfaces() to run whenever config is saved.
      dependenciesReceipt: await setDependencies({ effects, input }), // Plumbing. DO NOT EDIT.
      restart: true,
    }
  },
)
