import { sdk } from './sdk'
import { exposedStore } from './store'
import { setDependencies } from './dependencies'
import { setInterfaces } from './interfaces'
import { versions } from './versions'
import { actions } from './actions'
import { initialConfig } from './actions/config/initialConfig'
import { bitcoinConfFile } from './file-models/bitcoin.conf'
import { bitcoinConfDefaults } from './utils'

const install = sdk.setupInstall(async ({ effects }) => {
  await sdk.store.setOwn(effects, sdk.StorePath.reindexBlockchain, false)
  await sdk.store.setOwn(effects, sdk.StorePath.reindexChainstate, false)
  await sdk.store.setOwn(effects, sdk.StorePath.initialized, false)
  await bitcoinConfFile.write(bitcoinConfDefaults)
  sdk.action.requestOwn(effects, initialConfig, 'critical', {
    reason:
      'Important bitcoin.conf values must be set before starting Bitcoin for the first time.',
  })
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
