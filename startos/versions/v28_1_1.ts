import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'
import { bitcoinConfFile, shape } from '../file-models/bitcoin.conf'
import { load } from 'js-yaml'
import { sdk } from '../sdk'
import { readFile } from 'fs/promises'
import { bitcoinConfDefaults } from '../utils'

export const v28_1_0_0 = VersionInfo.of({
  version: '28.1:0',
  releaseNotes: 'Revamped for StartOS 0.3.6',
  migrations: {
    up: async ({ effects }) => {
      await sdk.store.setOwn(effects, sdk.StorePath, {
        reindexBlockchain: false,
        reindexChainstate: false,
      })
      const {
        ['peer-tor-address']: peerTorAddress,
        rpc: {
          advanced: { auth, servertimeout, threads, workqueue },
        },
        ['zmq-enabled']: zmq,
        txindex,
        coinstatsindex,
        wallet: { enable, avoidpartialspends, discardfee },
        advanced: {
          mempool: {
            persistmempool,
            maxmempool,
            mempoolexpiry,
            mempoolfullrbf,
            permitbaremultisig,
            datacarrier,
            datacarriersize,
          },
          peers: { listen, onlyconnect, onlyonion, v2transport, addnode },
          pruning,
          dbcache,
          blockfilters: { blockfilterindex, peerblockfilters },
          bloomfilters: { peerbloomfilters },
        },
      } = load(
        await readFile(
          '/media/startos/volumes/main/start9/config.yaml',
          'utf8',
        ),
      ) as {
        ['peer-tor-address']: string
        rpc: {
          advanced: {
            auth: string[]
            servertimeout: number
            threads: number
            workqueue: number
          }
        }
        'zmq-enabled': boolean
        txindex: boolean
        coinstatsindex: boolean
        wallet: {
          enable: boolean
          avoidpartialspends: boolean
          discardfee: number
        }
        advanced: {
          mempool: {
            persistmempool: boolean
            maxmempool: number
            mempoolexpiry: number
            mempoolfullrbf: boolean
            permitbaremultisig: boolean
            datacarrier: boolean
            datacarriersize: number
          }
          peers: {
            listen: boolean
            onlyconnect: boolean
            onlyonion: boolean
            v2transport: boolean
            addnode: string[]
          }
          pruning: { mode: 'disabled' } | { mode: 'automatic'; size: number }
          dbcache: number | null
          blockfilters: {
            blockfilterindex: boolean
            peerblockfilters: boolean
          }
          bloomfilters: {
            peerbloomfilters: boolean
          }
        }
      }

      const pruned = pruning.mode === 'automatic'

      const structuredConf: typeof shape._TYPE = {
        // RPC
        rpcbind: pruned ? '127.0.0.1:18332' : '0.0.0.0:8332',
        rpcallowip: pruned ? '127.0.0.1/32' : '0.0.0.0/0',
        rpcauth: auth,
        rpcservertimeout: servertimeout,
        rpcthreads: threads,
        rpcworkqueue: workqueue,
        whitelist: '172.18.0.0/16',

        // Mempool
        persistmempool,
        maxmempool,
        mempoolexpiry,
        mempoolfullrbf,
        permitbaremultisig,
        datacarrier,
        datacarriersize,

        // Peers
        listen,
        onlynet: onlyonion ? 'onion' : undefined,
        v2transport,

        // Wallet
        disablewallet: !enable,
        avoidpartialspends,
        discardfee,

        // Other
        externalip: peerTorAddress,
        coinstatsindex,
        txindex,
        dbcache: dbcache || bitcoinConfDefaults.dbcache,
        peerbloomfilters,
        blockfilterindex: blockfilterindex ? 'basic' : undefined,
        peerblockfilters,
        prune: pruned ? pruning.size : bitcoinConfDefaults.prune,
        bind: listen ? '0.0.0.0:8333' : bitcoinConfDefaults.bind,
      }

      if (zmq) {
        Object.assign({
          structuredConf,
          zmqpubrawblock: 'tcp://0.0.0.0:28332',
          zmqpubhashblock: 'tcp://0.0.0.0:28332',
          zmqpubrawtx: 'tcp://0.0.0.0:28333',
          zmqpubhashtx: 'tcp://0.0.0.0:28333',
          zmqpubsequence: 'tcp://0.0.0.0:28333',
        })
      } else {
        Object.assign({
          structuredConf,
          zmqpubrawblock: bitcoinConfDefaults.zmqpubrawblock,
          zmqpubhashblock: bitcoinConfDefaults.zmqpubhashblock,
          zmqpubrawtx: bitcoinConfDefaults.zmqpubrawtx,
          zmqpubhashtx: bitcoinConfDefaults.zmqpubhashtx,
          zmqpubsequence: bitcoinConfDefaults.zmqpubsequence,
        })
      }

      if (onlyconnect) {
        Object.assign({ structuredConf, connect: addnode })
      } else {
        Object.assign({ structuredConf, addnode: addnode })
      }

      await bitcoinConfFile.merge(structuredConf)
    },
    down: IMPOSSIBLE,
  },
})
