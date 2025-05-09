import { storeJson } from '../file-models/store.json'
import { sdk } from '../sdk'

export const reindexBlockchain = sdk.Action.withoutInput(
  // id
  'reindex-blockchain',

  // metadata
  async ({ effects }) => ({
    name: 'Reindex Blockchain',
    description:
      'Rebuilds the block and chainstate databases starting from genesis. If blocks already exist on disk, these are used rather than being re-downloaded. For pruned nodes, this means downloading the entire blockchain over again.',
    warning:
      'Blocks not stored on disk will be re-downloaded in order to rebuild the database. If your node is pruned, this action is equivalent to syncing the node from scratch, so this process could take weeks on low-end hardware.',
    allowedStatuses: 'any',
    group: 'Reindex',
    visibility: 'enabled',
  }),

  // execution function
  async ({ effects }) => {
    await storeJson.merge(effects, { reindexBlockchain: true})
    return {
      version: '1',
      title: 'Success',
      message:
        'Blockchain will be reindexed on next startup. If Bitcoin is already running, it will be automatically restarted now.',
      result: null,
    }
  },
)
