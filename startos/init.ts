import { sdk } from './sdk'
import { exposedStore } from './store'
import { setDependencies } from './dependencies'
import { setInterfaces } from './interfaces'
import { versions } from './versions'
import { actions } from './actions'
import { bitcoinConfFile } from './file-models/bitcoin.conf'
import { bitcoinConfDefaults } from './utils'

const install = sdk.setupInstall(async ({ effects }) => {
  await sdk.store.setOwn(effects, sdk.StorePath, {
    reindexBlockchain: false,
    reindexChainstate: false,
  })

  await bitcoinConfFile.write(effects, {
    ...bitcoinConfDefaults,
    externalip: 'initial-setup',
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
