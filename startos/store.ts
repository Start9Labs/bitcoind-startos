import { setupExposeStore } from '@start9labs/start-sdk'

export type Store = {
  reindexBlockchain: number | null
  reindexChainstate: boolean
}

export const exposedStore = setupExposeStore<Store>((_pathBuilder) => [])
