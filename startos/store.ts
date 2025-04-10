import { setupExposeStore } from '@start9labs/start-sdk'

export type Store = {
  reindexBlockchain: boolean
  reindexChainstate: boolean
}

export const initStore: Store = {
  reindexBlockchain: false,
  reindexChainstate: false,
}

export const exposedStore = setupExposeStore<Store>((_pathBuilder) => [])
