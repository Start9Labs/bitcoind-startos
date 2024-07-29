import { sdk } from '../sdk'
import * as fs from 'fs/promises'
const { Config } = sdk

const input = Config.of({})

export const deletePeers = sdk.createDynamicAction(
  'deletePeers',
  async ({ effects }) => {
    return {
      name: 'Delete Peer List',
      description:
        'Deletes the Peer List (peers.dat) in case it gets corrupted.',
      warning: null,
      disabled: false,
      allowedStatuses: 'onlyStopped',
      group: 'Delete Corrupted File(s)',
    }
  },
  async ({ effects, input }) => {
    try {
      await fs.rm('/root/.bitcoin/peers.dat')
    } catch (err) {
      return {
        message: `Error deleting peers.dat file: ${err}`,
        value: null,
      }
    }

    return {
      message: 'Successfully deleted peers.dat.',
      value: null,
    }
  },
  input,
)
