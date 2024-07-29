import { sdk } from './sdk'
import { Overlay, T } from '@start9labs/start-sdk'
import * as fs from 'fs'
import { rpcPort, peerInterfaceId } from './interfaces'
import { GetBlockchainInfo } from './utils'
import { CheckResult } from '@start9labs/start-sdk/cjs/lib/health/checkFns'

export const main = sdk.setupMain(async ({ effects, started }) => {
  /**
   * ======================== Setup (optional) ========================
   *
   * In this section, we fetch any resources or run any desired preliminary commands.
   */
  const containerIp = await effects.getContainerIp()
  const peerAddr = (
    await sdk.serviceInterface.getOwn(effects, peerInterfaceId).once()
  )?.addressInfo?.onionUrls[0]

  const bitcoinArgs: string[] = []

  bitcoinArgs.push(`-onion=${containerIp}:9050`)
  bitcoinArgs.push(`-externalip=${peerAddr}`)

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

  /**
   * ======================== Additional Health Checks (optional) ========================
   */

  // @TODO add trigger to reduce polling after initialblockchaindownloaded is true
  const syncCheck = sdk.HealthCheck.of({
    effects,
    name: 'Blockchain Sync Progress',
    image: { id: 'main' },
    fn: async (overlay) => {
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

      const result: CheckResult = {
        status: 'success',
        message: null,
      }

      // @TODO why does res have both stdout and stderr?
      if (res.stdout) {
        const info: GetBlockchainInfo = JSON.parse(res.stdout as string)

        if (info.initialblockdownload) {
          const percentage = (info.blocks / info.headers).toFixed(2)
          result.status = 'loading'
          result.message = `Syncing blocks...${percentage}%`
        } else {
          result.status = 'success'
          result.message = 'Bitcoin is fully synced'
        }
      } else {
        // @TODO what type is stderr
        const error = JSON.parse(res.stderr as string)

        result.status = error.code === 28 ? 'starting' : 'failure'
      }

      return result
    },
    // @TODO add trigger to reduce polling rate after IBD completion
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
