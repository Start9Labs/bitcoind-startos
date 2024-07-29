import { sdk } from '../sdk'
import { deleteCoinstatsIndex } from './deleteCoinstatsIndex'
import { deletePeers } from './deletePeers'
import { deleteTxIndex } from './deleteTxIndex'
import { reindexBlockchain } from './reindexBlockchain'
import { reindexChainstate } from './reindexChainstate'

export const { actions, actionsMetadata } = sdk.setupActions(
  deleteCoinstatsIndex,
  deletePeers,
  deleteTxIndex,
  reindexBlockchain,
  reindexChainstate,
)
