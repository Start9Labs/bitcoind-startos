import { sdk } from '../sdk'
import { config } from './config/config'
import { deleteCoinstatsIndex } from './deleteCoinstatsIndex'
import { deletePeers } from './deletePeers'
import { deleteTxIndex } from './deleteTxIndex'
import { reindexBlockchain } from './reindexBlockchain'
import { reindexChainstate } from './reindexChainstate'
import { runtimeInfo } from './runtime-info'

export const actions = sdk.Actions.of()
  .addAction(runtimeInfo)
  .addAction(deleteCoinstatsIndex)
  .addAction(deletePeers)
  .addAction(deleteTxIndex)
  .addAction(reindexBlockchain)
  .addAction(reindexChainstate)
  .addAction(config)
