import { setupExposeStore } from '@start9labs/start-sdk'

export type Store = {}

export const exposedStore = setupExposeStore<Store>(() => [])
