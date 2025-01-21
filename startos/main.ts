import { sdk } from './sdk'
import { T } from '@start9labs/start-sdk'
import { peerInterfaceId } from './interfaces'
import { GetBlockchainInfo, getRpcPort } from './utils'
import { bitcoinConfFile } from './file-models/bitcoin.conf'

export const main = sdk.setupMain(async ({ effects, started }) => {
  /**
   * ======================== Setup (optional) ========================
   */

  const conf = (await bitcoinConfFile.read.const(effects))!

  const rpcPort = getRpcPort(conf.testnet || 0)
  const containerIp = await effects.getContainerIp()
  // @TODO take into account possibilioty of multiple/no .onions and also clearnet domains
  const peerAddr = (
    await sdk.serviceInterface.getOwn(effects, peerInterfaceId).const()
  )?.addressInfo?.onionUrls[0]

  const bitcoinArgs: string[] = []

  bitcoinArgs.push(`-onion=${containerIp}:9050`)
  bitcoinArgs.push(`-externalip=${peerAddr}`)
  bitcoinArgs.push('-datadir=/root/.bitcoin"')
  bitcoinArgs.push('-conf=/root/.bitcoin/bitcoin.conf')

  for await (const reindexBlockchain of sdk.store
    .getOwn(effects, sdk.StorePath.reindexBlockchain)
    .watch()) {
    if (reindexBlockchain) {
      bitcoinArgs.push('-reindex')
      await sdk.store.setOwn(effects, sdk.StorePath.reindexBlockchain, false)
      await sdk.restart(effects)
    }
  }

  for await (const reindexChainstate of sdk.store
    .getOwn(effects, sdk.StorePath.reindexChainstate)
    .watch()) {
    if (reindexChainstate) {
      bitcoinArgs.push('-reindex-chainstate')
      await sdk.store.setOwn(effects, sdk.StorePath.reindexChainstate, false)
      await sdk.restart(effects)
    }
  }

  /**
   * ======================== Additional Health Checks (optional) ========================
   */

  const syncCheck = sdk.HealthCheck.of(effects, {
    name: 'Blockchain Sync Progress',
    fn: async () => {
      const res = await sdk.runCommand(
        effects,
        { id: 'bitcoind' },
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
      subcontainer: { id: 'bitcoind' },
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
      subcontainer: { id: 'proxy' },
      command: ['btc-rpc-proxy'],
      mounts: sdk.Mounts.of().addVolume('proxy', null, '/data', false), // @TODO add mount for toml file
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
