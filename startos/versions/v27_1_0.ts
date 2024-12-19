import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'
import { bitcoinConfFile } from '../file-models/bitcoin.conf'

export const v27_1_0 = VersionInfo.of({
  version: '27.1.0:0',
  releaseNotes: 'Revamped for StartOS 0.3.6',
  migrations: {
    up: async ({ effects }) => {
      await bitcoinConfFile.merge(({ testnet: 0 }))
    },
    down: IMPOSSIBLE,
  },
})
