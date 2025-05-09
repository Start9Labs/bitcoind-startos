import { sdk } from './sdk'
import { setDependencies } from './dependencies'
import { setInterfaces } from './interfaces'
import { versions } from './versions'
import { actions } from './actions'
import { bitcoinConfFile } from './file-models/bitcoin.conf'
import { bitcoinConfDefaults } from './utils'
import { storeJson } from './file-models/store.json'

// **** Pre Install ****
const preInstall = sdk.setupPreInstall(async ({ effects }) => {
  await storeJson.write(effects, {
    reindexBlockchain: false,
    reindexChainstate: false,
  })
  await bitcoinConfFile.write(effects, {
    ...bitcoinConfDefaults,
    externalip: 'initial-setup',
  })
})

// **** Post Install ****
const postInstall = sdk.setupPostInstall(async ({ effects }) => {})

// **** Uninstall ****
const uninstall = sdk.setupUninstall(async ({ effects }) => {})

/**
 * Plumbing. DO NOT EDIT.
 */
export const { packageInit, packageUninit, containerInit } = sdk.setupInit(
  versions,
  preInstall,
  postInstall,
  uninstall,
  setInterfaces,
  setDependencies,
  actions,
)
