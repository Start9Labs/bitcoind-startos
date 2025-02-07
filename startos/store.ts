import { setupExposeStore } from '@start9labs/start-sdk'

export type Store = {
  reindexBlockchain: boolean
  reindexChainstate: boolean
  initialized: boolean,
}

export const exposedStore = setupExposeStore<Store>((_pathBuilder) => [])
