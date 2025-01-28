import { sdk } from '../sdk'
import { config } from './config/config'
import { rpcConfig } from './config/rpc'
import { deleteCoinstatsIndex } from './deleteCoinstatsIndex'
import { deletePeers } from './deletePeers'
import { deleteRpcAuth } from './deleteRpcAuth'
import { deleteTxIndex } from './deleteTxIndex'
import { generateRpcUser } from './generateRpcAuth'
import { reindexBlockchain } from './reindexBlockchain'
import { reindexChainstate } from './reindexChainstate'
import { runtimeInfo } from './runtimeInfo'

export const actions = sdk.Actions.of()
  .addAction(runtimeInfo)
  .addAction(deleteCoinstatsIndex)
  .addAction(deletePeers)
  .addAction(deleteTxIndex)
  .addAction(reindexBlockchain)
  .addAction(reindexChainstate)
  .addAction(config)
  .addAction(rpcConfig)
  .addAction(generateRpcUser)
  .addAction(deleteRpcAuth)
