import { sdk } from './sdk'

export const { createBackup, restoreInit } = sdk.setupBackups(async () =>
  sdk.Backups.volumes('main').setOptions({
    exclude: ['blocks/', 'chainstate/', 'indexes/'],
  }),
)
