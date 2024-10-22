import { sdk } from './sdk'
import { T } from '@start9labs/start-sdk'
import { peerInterfaceId } from './interfaces'
import { GetBlockchainInfo, getRpcPort } from './utils'
import { bitcoinConfFile, toTypedBitcoinConf } from './file-models/bitcoin.conf'

export const main = sdk.setupMain(async ({ effects, started }) => {
  /**
   * ======================== Setup (optional) ========================
   */

  // TODO if pruned: create proxy container, util.subcontainer
  const conf = (await bitcoinConfFile.read.const(effects))!
  const config = toTypedBitcoinConf(conf)

  const rpcPort = getRpcPort(config.testnet)
  const containerIp = await effects.getContainerIp()
  const peerAddr = (
    await sdk.serviceInterface.getOwn(effects, peerInterfaceId).once()
  )?.addressInfo?.onionUrls[0]

  const bitcoinArgs: string[] = []

  bitcoinArgs.push(`-onion=${containerIp}:9050`)
  bitcoinArgs.push(`-externalip=${peerAddr}`)
  bitcoinArgs.push('-datadir=/root/.bitcoin"')
  bitcoinArgs.push('-conf=/root/.bitcoin/bitcoin.conf')

  // @TODO fix syntax for watch()
  const reindexBlockchainSub = await sdk.store
    .getOwn(effects, sdk.StorePath.reindexBlockchain)
    .watch()
    .return()
  if (reindexBlockchainSub.value) {
    bitcoinArgs.push(`-reindex ${reindexBlockchainSub.value}`) // @TODO confirm syntax for reindexing from specific block height
    await sdk.store.setOwn(effects, sdk.StorePath.reindexBlockchain, null)
  }

  // @TODO fix syntax for watch()
  const reindexChainstateSub = await sdk.store
    .getOwn(effects, sdk.StorePath.reindexChainstate)
    .watch()
    .return()
  if (reindexChainstateSub.value) {
    bitcoinArgs.push('-reindex-chainstate')
    await sdk.store.setOwn(effects, sdk.StorePath.reindexChainstate, false)
  }

  /**
   * ======================== Additional Health Checks (optional) ========================
   */

  const syncCheck = sdk.HealthCheck.of(effects, {
    name: 'Blockchain Sync Progress',
    fn: async () => {
      const res = await sdk.runCommand(
        effects,
        { id: 'main' },
        [
          'bitcoin-cli',
          '-conf=/root/.bitcoin/bitcoin.conf',
          'getblockchaininfo',
        ],
        {},
        'getblockchaininfo',
      )

      if (res.stdout && typeof res.stdout === 'string') {
        const info: GetBlockchainInfo = JSON.parse(res.stdout)

        if (info.initialblockdownload) {
          const percentage = (info.blocks / info.headers).toFixed(2)
          return {
            message: `Syncing blocks...${percentage}%`,
            result: 'loading',
          }
        }

        return {
          message: 'Bitcoin is fully synced',
          result: 'success',
        }
      }

      return {
        message: null,
        result:
          typeof res.stderr === 'string' && JSON.parse(res.stderr).code === 28
            ? 'starting'
            : 'failure',
      }
    },
  })

  const healthReceipts: T.HealthReceipt[] = [syncCheck]

  /**
   * ======================== Daemons ========================
   */

  const daemons = sdk.Daemons.of(effects, started, healthReceipts).addDaemon(
    'primary',
    {
      image: { id: 'main' },
      command: ['bitcoind', ...bitcoinArgs],
      mounts: sdk.Mounts.of().addVolume('main', null, '/data', false),
      ready: {
        display: 'RPC Interface',
        fn: () =>
          sdk.healthCheck.checkPortListening(effects, rpcPort, {
            successMessage: 'The Bitcoin RPC interface is ready',
            errorMessage: 'The Bitcoin RPC interface is not ready',
          }),
      },
      requires: [],
    },
  )

  if (config.prune) {
    return daemons.addDaemon('proxy', {
      image: { id: 'proxy' }, // subcontainer:
      command: ['btc-rpc-proxy'],
      mounts: sdk.Mounts.of().addVolume('proxy', null, '/data', false), // add mount for toml file
      ready: {
        display: 'RPC Proxy',
        fn: () =>
          sdk.healthCheck.checkPortListening(effects, 28332, {
            successMessage: 'The Bitcoin RPC Proxy is ready',
            errorMessage: 'The Bitcoin RPC Proxy is not ready',
          }),
      },
      requires: [],
    })
  }
  return daemons
})
