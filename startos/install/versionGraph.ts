import { VersionGraph } from '@start9labs/start-sdk'
import { coreCurrent, other } from './versions'
import { storeJson } from '../fileModels/store.json'
import { bitcoinConfFile } from '../fileModels/bitcoin.conf'
import { bitcoinConfDefaults } from '../utils'

export const versionGraph = VersionGraph.of({
  current: coreCurrent,
  other,
  preInstall: async (effects) => {
    await storeJson.write(effects, {
      reindexBlockchain: false,
      reindexChainstate: false,
      fullySynced: false,
      snapshotInUse: false,
    })
    await bitcoinConfFile.write(effects, {
      ...bitcoinConfDefaults,
      externalip: 'initial-setup',
    })
  },
})
