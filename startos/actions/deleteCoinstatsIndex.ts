import { sdk } from '../sdk'
import * as fs from 'fs/promises'

export const deleteCoinstatsIndex = sdk.Action.withoutInput(
  // id
  'deleteCoinstatsIndex',

  // metadata
  async ({ effects }) => ({
    name: 'Delete Coinstats Index',
    description:
      'Deletes the Coinstats Index (coinstatsindex) in case it gets corrupted.',
    warning:
      "The Coinstats Index will be rebuilt once Bitcoin Core is started again, unless 'Transaction Index' is disabled in the config settings. Please don't do this unless you fully understand what you are doing.",
    allowedStatuses: 'only-stopped',
    group: 'Delete Corrupted Files',
    visibility: 'enabled',
  }),

  // execution function
  async ({ effects }) => {
    await fs.rmdir('/root/.bitcoin/indexes/coinstats', { recursive: true })

    return {
      version: '1',
      title: 'Success',
      message: 'Successfully deleted coinstats index',
      result: null,
    }
  },
)
