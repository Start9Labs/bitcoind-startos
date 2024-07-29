import { bitcoinConfFile } from '../file-models/bitcoin.conf'
import { sdk } from '../sdk'
import * as fs from 'fs/promises'
const { Config } = sdk

const input = Config.of({})

export const reindexChainstate = sdk.createDynamicAction(
  'reindexChainstate',
  async ({ effects }) => {
    const pruned = (await bitcoinConfFile.read(effects))?.prune

    return {
      name: 'Reindex Chainstate',
      description:
        "Rebuilds the chainstate database using existing block index data; as the block index is not rebuilt, 'reindex_chainstate' should be strictly faster than 'reindex'. This action should only be used in the case of chainstate corruption; if the blocks stored on disk are corrupted, the 'reindex' action will need to be run instead.",
      warning:
        "While faster than 'Reindex', 'Reindex Chainstate' can still take several days or more to complete.",
      disabled: typeof pruned === 'undefined',
      allowedStatuses: 'any',
      group: 'Reindex',
    }
  },
  async ({ effects, input }) => {
    try {
      await fs.writeFile('/root/.bitcoin/requires.reindex-chainstate', '')
    } catch (err) {
      return {
        message: `Error creating requires.reindex-chainstate file: ${err}`,
        value: null,
      }
    }

    if (await effects.running({ packageId: 'bitcoind' })) {
      effects.restart
      return {
        message: 'Bitcoin restarting in reindex chainstate mode',
        value: null,
      }
    } else {
      return {
        message:
          'Bitcoin will reindex the chainstate the next time the service is started',
        value: null,
      }
    }
  },
  input,
)
