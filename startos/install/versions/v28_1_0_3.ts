import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'
import { bitcoinConfFile } from '../../fileModels/bitcoin.conf'
import { bitcoinConfDefaults } from '../../utils'
import { storeJson } from '../../fileModels/store.json'
import { nocow } from '../versionGraph'

export const v28_1_0_3 = VersionInfo.of({
  version: '28.1:3-alpha.6',
  releaseNotes: 'Revamped for StartOS 0.4.0',
  migrations: {
    up: async ({ effects }) => {
      await nocow('/media/startos/volumes/main/')
      await storeJson.write(effects, {
        reindexBlockchain: false,
        reindexChainstate: false,
        fullySynced: false,
        snapshotInUse: false,
      })
      const existingConf = await bitcoinConfFile.read().once()

      if (existingConf) return // Only write conf defaults if no existing bitcoin.conf found

      await bitcoinConfFile.write(effects, bitcoinConfDefaults)
    },
    down: IMPOSSIBLE,
  },
})
