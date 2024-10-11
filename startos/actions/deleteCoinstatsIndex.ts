import { sdk } from '../sdk'
import * as fs from 'fs/promises'
const { Config } = sdk

const input = Config.of({})

export const deleteCoinstatsIndex = sdk.createDynamicAction(
  'deleteCoinstatsIndex',
  async ({ effects }) => {
    return {
      name: 'Delete Coinstats Index',
      description:
        'Deletes the Coinstats Index (coinstatsindex) in case it gets corrupted.',
      warning:
        "The Coinstats Index will be rebuilt once Bitcoin Core is started again, unless 'Transaction Index' is disabled in the config settings. Please don't do this unless you fully understand what you are doing.",
      disabled: false,
      allowedStatuses: 'onlyStopped',
      group: 'Delete Corrupted File(s)',
    }
  },
  async ({ effects, input }) => {
    try {
      await fs.rmdir('/root/.bitcoin/indexes/coinstats', {
        recursive: true,
      })
    } catch (err) {
      return {
        message: `Error deleting coinstats index: ${err}`,
        value: null,
      }
    }

    return {
      message: 'Successfully deleted coinstats index.',
      value: null,
    }
  },
  input,
)
