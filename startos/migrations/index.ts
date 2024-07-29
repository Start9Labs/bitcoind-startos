import { sdk } from '../sdk'
import { v22_0_0 } from './v22_0_0'

/**
 * Here we list every migration in sequential order.
 */
export const migrations = sdk.setupMigrations(v22_0_0)

// TODO migration to 0.3.6 - pruned object to number & addnode to single string