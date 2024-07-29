import { sdk } from '../sdk'
import * as fs from 'fs/promises'
const { Config } = sdk

const input = Config.of({})

export const deleteTxIndex = sdk.createDynamicAction(
  'deleteTxIndex',
  async ({ effects }) => {
    return {
      name: 'Delete Transaction Index',
      description:
        'Deletes the Transaction Index (txindex) in the event it gets corrupted.',
      warning:
        "The Transaction Index will be rebuilt once Bitcoin Core is started again, unless 'Coinstats Index' is disabled in the config settings. Please don't do this unless you fully understand what you are doing.",
      disabled: false,
      allowedStatuses: 'onlyStopped',
      group: 'Delete Corrupted File(s)',
    }
  },
  async ({ effects, input }) => {
    try {
      await fs.rmdir('/root/.bitcoin/indexes/txindex', { recursive: true })
    } catch (err) {
      return {
        message: `Error deleting txindex: ${err}`,
        value: null,
      }
    }

    return {
      message: 'Successfully deleted txindex.',
      value: null,
    }
  },
  input,
)
