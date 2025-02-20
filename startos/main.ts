import { sdk } from './sdk'
import { bitcoinConfFile } from './file-models/bitcoin.conf'
import { GetBlockchainInfo, getRpcPort } from './utils'
import * as diskusage from 'diskusage'
import { T, utils } from '@start9labs/start-sdk'

const diskUsage = utils.once(() => diskusage.check('/'))
const archivalMin = 900_000_000_000

export const main = sdk.setupMain(async ({ effects, started }) => {
  /**
   * ======================== Setup (optional) ========================
   */

  const conf = (await bitcoinConfFile.read.const(effects))!

  const disk = await diskUsage()
  if (disk.total < archivalMin && conf.prune === 0) {
    conf.prune = 550
    conf.rpcbind = '127.0.0.1:18332'
    conf.rpcallowip = '127.0.0.1/32'
    await bitcoinConfFile.merge(conf)
  }

  const rpcPort = await getRpcPort(conf.prune)
  const containerIp = await effects.getContainerIp()
  const bitcoinArgs: string[] = []

  bitcoinArgs.push(`-onion=${containerIp}:9050`)
  bitcoinArgs.push('-datadir=/data/')
  bitcoinArgs.push('-conf=/data/bitcoin.conf')

  const reindexBlockchain = await sdk.store
    .getOwn(effects, sdk.StorePath.reindexBlockchain)
    .once()

  if (reindexBlockchain) {
    bitcoinArgs.push('-reindex')
    await sdk.store.setOwn(effects, sdk.StorePath.reindexBlockchain, false)
  }

  sdk.store.getOwn(effects, sdk.StorePath.reindexBlockchain).const()

  const reindexChainstate = await sdk.store
    .getOwn(effects, sdk.StorePath.reindexChainstate)
    .once()

  if (reindexChainstate) {
    bitcoinArgs.push('-reindex')
    await sdk.store.setOwn(effects, sdk.StorePath.reindexChainstate, false)
  }

  sdk.store.getOwn(effects, sdk.StorePath.reindexChainstate).const()

  /**
   * ======================== Additional Health Checks (optional) ========================
   */

  const syncCheck = sdk.HealthCheck.of(effects, {
    id: 'sync-progress',
    name: 'Blockchain Sync Progress',
    fn: async () => {
      const res = await sdk.runCommand(
        effects,
        { imageId: 'bitcoind' },
        ['bitcoin-cli', '-conf=/data/bitcoin.conf', '-rpccookiefile=/data/.cookie', 'getblockchaininfo'],
        { mounts: mainMounts.build() },
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
      subcontainer: { imageId: 'bitcoind' },
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

  if (conf.prune == 1) {
    daemons.addDaemon('proxy', {
      subcontainer: { imageId: 'proxy' },
      command: ['btc-rpc-proxy'],
      mounts: sdk.Mounts.of().addVolume('proxy', null, '/data', false), // @TODO add mount for toml file
      ready: {
        display: 'RPC Proxy',
        fn: () =>
          sdk.healthCheck.checkPortListening(effects, 18332, {
            successMessage: 'The Bitcoin RPC Proxy is ready',
            errorMessage: 'The Bitcoin RPC Proxy is not ready',
          }),
      },
      requires: [],
    })
  }
  return daemons
})
