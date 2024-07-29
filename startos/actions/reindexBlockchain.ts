import { sdk } from '../sdk'
import * as fs from 'fs/promises'
const { Config } = sdk

const input = Config.of({})

export const reindexBlockchain = sdk.createDynamicAction(
  'reindexBlockchain',
  async ({ effects }) => {
    return {
      name: 'Reindex Blockchain',
      description:
        'Rebuilds the block and chainstate databases starting from genesis. If blocks already exist on disk, these are used rather than being redownloaded. For pruned nodes, this means downloading the entire blockchain over again.',
      warning:
        'Blocks not stored on disk will be redownloaded in order to rebuild the database. If your node is pruned, this action is equivalent to syncing the node from scratch, so this process could take weeks on low-end hardware.',
      disabled: false,
      allowedStatuses: 'any',
      group: 'Reindex',
    }
  },
  async ({ effects, input }) => {
    try {
      await fs.writeFile('/root/.bitcoin/requires.reindex', '')
    } catch (err) {
      return {
        message: `Error creating requires.reindex file: ${err}`,
        value: null,
      }
    }

    if (await effects.running({ packageId: 'bitcoind' })) {
      effects.restart
      return {
        message: 'Bitcoin restarting in reindex mode',
        value: null,
      }
    } else {
      return {
        message: 'Bitcoin will reindex the next time the service is started',
        value: null,
      }
    }
  },
  input,
)
