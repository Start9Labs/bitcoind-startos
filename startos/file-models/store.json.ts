import { FileHelper, matches } from '@start9labs/start-sdk'

const { object, boolean } = matches

export const shape = object({
  reindexBlockchain: boolean,
  reindexChainstate: boolean,
})

export const storeJson = FileHelper.json(
  '/media/startos/volumes/main/store.json',
  shape,
)
