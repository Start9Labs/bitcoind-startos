import { sdk } from '../sdk'
import { configSpec } from './spec'
import { read } from './read'
import { save } from './save'

/**
 * Plumbing. DO NOT EDIT.
 */
export const { getConfig, setConfig } = sdk.setupConfig(configSpec, save, read)
