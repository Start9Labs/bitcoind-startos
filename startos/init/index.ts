import { sdk } from '../sdk'
import { setDependencies } from '../dependencies'
import { setInterfaces } from '../interfaces'
import { versionGraph } from '../install/versionGraph'
import { actions } from '../actions'
import { restoreInit } from '../backups'
import { taskSetExternal } from './taskSelectExternal'
import { setDefaults } from './setDefaults'
import { watchPrune } from './watchPrune'

export const init = sdk.setupInit(
  restoreInit,
  versionGraph,
  setInterfaces,
  setDependencies,
  actions,
  setDefaults,
  taskSetExternal,
  watchPrune,
)

export const uninit = sdk.setupUninit(versionGraph)
