import { Backups } from '@start9labs/start-sdk/cjs/lib/backup/Backups'
import { sdk } from './sdk'

export const { createBackup, restoreBackup } = sdk.setupBackups(
  sdk.Backups.volumes('main').setOptions({
    exclude: [
      'blocks/',
      'chainstate/',
      'indexes/',
      'testnet3/'
    ]
  })
)