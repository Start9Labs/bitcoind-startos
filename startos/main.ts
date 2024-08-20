import { sdk } from './sdk'
import { T } from '@start9labs/start-sdk'
import * as fs from 'fs'
import { peerInterfaceId } from './interfaces'
import { GetBlockchainInfo, getRpcPort } from './utils'
import { bitcoinConfFile } from './file-models/bitcoin.conf'

export const main = sdk.setupMain(async ({ effects, started }) => {
  /**
   * ======================== Setup (optional) ========================
   */
  const config = (await bitcoinConfFile.read(effects))!
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

  if (fs.existsSync('/root/.bitcoin/requires.reindex')) {
    bitcoinArgs.push('-reindex')
    try {
      fs.unlinkSync('/root/.bitcoin/requires.reindex')
      console.log('Deleted requires.reindex')
    } catch (err) {
      console.error('Error deleting requires.reindex:', err)
    }
  } else if (fs.existsSync('/root/.bitcoin/requires.reindex-chainstate')) {
    bitcoinArgs.push('-reindex-chainstate')
    try {
      fs.unlinkSync('/root/.bitcoin/requires.reindex-chainstate')
      console.log('Deleted requires.reindex-chainstate')
    } catch (err) {
      console.error('Error deleting requires.reindex-chainstate:', err)
    }
  }

  // TODO Proxy if Pruned

  /**
   * ======================== Additional Health Checks (optional) ========================
   */
  const syncCheck = sdk.HealthCheck.of({
    effects,
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
      )

      if (res.stdout && typeof res.stdout === 'string') {
        const info: GetBlockchainInfo = JSON.parse(res.stdout)

        if (info.initialblockdownload) {
          const percentage = (info.blocks / info.headers).toFixed(2)
          return {
            status: 'loading',
            message: `Syncing blocks...${percentage}%`,
            result: 'loading'
          }
        }

        return {
          status: 'success',
          message: 'Bitcoin is fully synced',
          result: 'success',
        }
      }

      return {
        status:
          typeof res.stderr === 'string' && JSON.parse(res.stderr).code === 28
            ? 'starting'
            : 'failure',
        message: null,
        result: 'failure'
      }
    },
  })

  const healthReceipts: T.HealthReceipt[] = [syncCheck]

  /**
   * ======================== Daemons ========================
   */
  return sdk.Daemons.of({
    effects,
    started,
    healthReceipts,
  }).addDaemon('primary', {
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
  })
})
