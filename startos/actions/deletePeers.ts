import { sdk } from '../sdk'
import * as fs from 'fs/promises'

export const deletePeers = sdk.Action.withoutInput(
  // id
  'delete-peers',

  // metadata
  async ({ effects }) => ({
    name: 'Delete Peer List',
    description: 'Deletes the Peer List (peers.dat) in case it gets corrupted.',
    warning: null,
    allowedStatuses: 'only-stopped',
    group: 'Delete Corrupted Files',
    visibility: 'enabled',
  }),

  // execution function
  async ({ effects }) => {
    await fs.rm('/root/.bitcoin/peers.dat')

    return {
      version: '1',
      title: 'Success',
      message: 'Successfully deleted peers.dat',
      result: null,
    }
  },
)
