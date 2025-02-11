import { sdk } from './sdk'

export const { createBackup, restoreBackup } = sdk.setupBackups(async () =>
  sdk.Backups.volumes('main').setOptions({
    exclude: ['blocks/', 'chainstate/', 'indexes/'],
  }),
)
