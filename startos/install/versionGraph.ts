import { VersionGraph } from '@start9labs/start-sdk'
import { coreCurrent, other } from './versions'
import { storeJson } from '../fileModels/store.json'
import { bitcoinConfFile } from '../fileModels/bitcoin.conf'
import { bitcoinConfDefaults } from '../utils'
import { execFile } from 'node:child_process'

export function nocow(path: string) {
  return new Promise<void>((resolve, reject) =>
    execFile('chattr', ['-R', '+C', path], (err, stdout, stderr) => {
      if (err && !stderr.includes('Operation not supported')) {
        err.message += `: ${stderr}`
        reject(err)
      } else {
        resolve()
      }
    }),
  )
}

export const versionGraph = VersionGraph.of({
  current: coreCurrent,
  other,
  preInstall: async (effects) => {
    await nocow('/media/startos/volumes/main/')
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
