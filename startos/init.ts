import { sdk } from './sdk'
import { exposedStore } from './store'
import { setDependencies } from './dependencies'
import { setInterfaces } from './interfaces'
import { versions } from './versions'
import { actions } from './actions'
import { initialConfig } from './actions/config/initialConfig'
import { bitcoinConfFile } from './file-models/bitcoin.conf'
import { bitcoinConfDefaults } from './utils'
import * as diskusage from 'diskusage'
import { utils } from '@start9labs/start-sdk'

const diskUsage = utils.once(() => diskusage.check('/'))
const archivalMin = 900_000_000_000

const install = sdk.setupInstall(async ({ effects }) => {
  await sdk.store.setOwn(effects, sdk.StorePath.reindexBlockchain, false)
  await sdk.store.setOwn(effects, sdk.StorePath.reindexChainstate, false)
  await sdk.store.setOwn(effects, sdk.StorePath.initialized, false)

  const disk = await diskUsage()
  const prune = disk.total < archivalMin ? 550 : 0
  const rpcbind = prune ? '127.0.0.1:18332' : '0.0.0.0:8332'
  const rpcallowip = prune ? '127.0.0.1/32' : '0.0.0.0/0'

  await bitcoinConfFile.write({
    ...bitcoinConfDefaults,
    prune,
    rpcbind,
    rpcallowip,
  })
  // sdk.action.requestOwn(effects, initialConfig, 'critical', {
  //   reason:
  //     'Important bitcoin.conf values must be set before starting Bitcoin for the first time.',
  // })
})

const uninstall = sdk.setupUninstall(async ({ effects }) => {})

/**
 * Plumbing. DO NOT EDIT.
 */
export const { packageInit, packageUninit, containerInit } = sdk.setupInit(
  versions,
  install,
  uninstall,
  setInterfaces,
  setDependencies,
  actions,
  exposedStore,
)
