import { bitcoinConfFile } from '../fileModels/bitcoin.conf'
import { storeJson } from '../fileModels/store.json'
import { sdk } from '../sdk'

export const reindexChainstate = sdk.Action.withoutInput(
  // id
  'reindex-chainstate',

  // metadata
  async ({ effects }) => ({
    name: 'Reindex Chainstate',
    description:
      "Rebuilds the chainstate database using existing block index data; as the block index is not rebuilt, 'reindex_chainstate' should be strictly faster than 'reindex'. This action should only be used in the case of chainstate corruption; if the blocks stored on disk are corrupted, the 'reindex' action will need to be run instead.",
    warning:
      "While faster than 'Reindex', 'Reindex Chainstate' can still take several days or more to complete.",
    allowedStatuses: 'any',
    group: 'Reindex',
    visibility: (await bitcoinConfFile.read().const(effects))?.prune
      ? 'hidden'
      : 'enabled',
  }),

  // execution function
  async ({ effects }) => {
    await storeJson.merge(effects, {
      reindexChainstate: true,
      fullySynced: false,
    })
    return {
      version: '1',
      title: 'Success',
      message:
        'Chainstate will be reindexed on next startup. If Bitcoin was already running, it will be automatically restarted now.',
      result: null,
    }
  },
)
