import { sdk } from '../sdk'
import * as fs from 'fs/promises'

export const deleteTxIndex = sdk.Action.withoutInput(
  // id
  'deleteTxIndex',

  // metadata
  async ({ effects }) => ({
    name: 'Delete Transaction Index',
    description:
      'Deletes the Transaction Index (txindex) in the event it gets corrupted.',
    warning:
      "The Transaction Index will be rebuilt once Bitcoin Core is started again, unless 'Coinstats Index' is disabled in the config settings. Please don't do this unless you fully understand what you are doing.",
    allowedStatuses: 'only-stopped',
    group: 'Delete Corrupted Files',
    visibility: 'enabled',
  }),

  // execution function
  async ({ effects }) => {
    await fs.rmdir('/root/.bitcoin/indexes/txindex', { recursive: true })

    return {
      version: '1',
      title: 'Success',
      message: 'Successfully deleted txindex',
      result: null,
    }
  },
)
