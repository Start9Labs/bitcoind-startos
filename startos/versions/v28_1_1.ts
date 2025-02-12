import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'
import { bitcoinConfFile } from '../file-models/bitcoin.conf'
import { sdk } from '../sdk'

export const v28_1_1 = VersionInfo.of({
  version: '28.1:1',
  releaseNotes: 'Revamped for StartOS 0.3.6',
  migrations: {
    up: async ({ effects }) => {
      await sdk.store.setOwn(effects, sdk.StorePath, {
        reindexBlockchain: false,
        reindexChainstate: false,
      })
    },
    down: IMPOSSIBLE,
  },
})
