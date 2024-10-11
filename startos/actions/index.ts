import { sdk } from '../sdk'
import { credentials } from './credentials'
import { deleteCoinstatsIndex } from './deleteCoinstatsIndex'
import { deletePeers } from './deletePeers'
import { deleteTxIndex } from './deleteTxIndex'
import { reindexBlockchain } from './reindexBlockchain'
import { reindexChainstate } from './reindexChainstate'
import { runtimeInfo } from './runtime-info'

export const { actions, actionsMetadata } = sdk.setupActions(
  credentials,
  runtimeInfo,
  deleteCoinstatsIndex,
  deletePeers,
  deleteTxIndex,
  reindexBlockchain,
  reindexChainstate,
)
