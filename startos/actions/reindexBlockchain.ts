import { sdk } from '../sdk'
const { InputSpec, Value } = sdk

const inputSpec = InputSpec.of({
  blockheight: Value.number({
    name: 'Block Height (optional)',
    description:
      'Optionally provide a block height from which to reindex. If no value is provided, Bitcoin will be reindexed from the genesis block.',
    required: false,
    integer: true,
    min: 1,
  }),
})

export const reindexBlockchain = sdk.Action.withInput(
  // id
  'reindexBlockchain',

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

  // input
  inputSpec,

  // optionally pre-fill the input form
  async ({ effects }) => {},

  // execution function
  async ({ effects, input }) => {
    await sdk.store.setOwn(
      effects,
      sdk.StorePath.reindexBlockchain,
      input.blockheight || null,
    )
    return {
      version: '1',
      title: 'Success',
      message: `Blockchain will be reindexed from ${input.blockheight ? 'block ' + input.blockheight : 'genesis'} on next startup. If Bitcoin was already running, it will be automatically restarted now.`,
      result: null,
    }
  },
)
