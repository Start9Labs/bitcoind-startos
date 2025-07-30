import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'

export const v28_1_0_3_alpha8 = VersionInfo.of({
  version: '28.1:3-alpha.8',
  releaseNotes: 'Revamped for StartOS 0.4.0',
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
