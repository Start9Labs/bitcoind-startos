import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'
import { bitcoinConfFile, shape } from '../../fileModels/bitcoin.conf'
import { load } from 'js-yaml'
import { readFile } from 'fs/promises'
import { bitcoinConfDefaults } from '../../utils'
import { storeJson } from '../../fileModels/store.json'
import { nocow } from '../versionGraph'

export const v28_1_0_3 = VersionInfo.of({
  version: '28.1:3-alpha.6',
  releaseNotes: 'Revamped for StartOS 0.4.0',
  migrations: {
    up: async ({ effects }) => {
      await nocow('/media/startos/volumes/main/')
      await storeJson.write(effects, {
        reindexBlockchain: false,
        reindexChainstate: false,
        fullySynced: false,
        snapshotInUse: false,
      })
      try {
        const configYaml = load(
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
            bloomfilters: { peerbloomfilters: boolean }
          }
        }

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
        } = configYaml

        const pruned = pruning.mode === 'automatic'

        const structuredConf: typeof shape._TYPE = {
          // RPC
          rpcbind: pruned ? '127.0.0.1:18332' : '0.0.0.0:8332',
          rpcallowip: pruned ? '127.0.0.1/32' : '0.0.0.0/0',
          rpcauth: auth,
          rpcservertimeout: servertimeout,
          rpcthreads: threads,
          rpcworkqueue: workqueue,
          rpccookiefile: bitcoinConfDefaults.rpccookiefile,
          whitelist: ['172.18.0.0/16'],

          // Mempool
          persistmempool: persistmempool,
          maxmempool,
          mempoolexpiry,
          mempoolfullrbf: mempoolfullrbf,
          permitbaremultisig: permitbaremultisig,
          datacarrier: datacarrier,
          datacarriersize,

          // Peers
          listen: listen,
          onlynet: onlyonion ? ['onion'] : undefined,
          v2transport: v2transport,

          // Wallet
          disablewallet: !enable,
          avoidpartialspends: avoidpartialspends,
          discardfee,

          // Other
          externalip: peerTorAddress,
          coinstatsindex: coinstatsindex,
          txindex: txindex,
          dbcache: dbcache || bitcoinConfDefaults.dbcache,
          peerbloomfilters: peerbloomfilters,
          blockfilterindex: blockfilterindex ? 'basic' : undefined,
          peerblockfilters: peerblockfilters,
          prune: pruned ? pruning.size : bitcoinConfDefaults.prune,
          bind: listen ? '0.0.0.0:8333' : bitcoinConfDefaults.bind,

          // ZMQ
          zmqpubrawblock: zmq ? 'tcp://0.0.0.0:28332' : undefined,
          zmqpubhashblock: zmq ? 'tcp://0.0.0.0:28332' : undefined,
          zmqpubrawtx: zmq ? 'tcp://0.0.0.0:28333' : undefined,
          zmqpubhashtx: zmq ? 'tcp://0.0.0.0:28333' : undefined,
          zmqpubsequence: zmq ? 'tcp://0.0.0.0:28333' : undefined,
        }

        if (onlyconnect) {
          Object.assign({ structuredConf, connect: addnode })
        } else {
          Object.assign({ structuredConf, addnode: addnode })
        }

        await bitcoinConfFile.merge(effects, structuredConf)
      } catch {
        await bitcoinConfFile.write(effects, {
          ...bitcoinConfDefaults,
          externalip: 'initial-setup',
        })
      }
    },
    down: IMPOSSIBLE,
  },
})
