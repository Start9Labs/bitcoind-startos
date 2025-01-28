import { bitcoinConfFile, shape } from '../../file-models/bitcoin.conf'
import { sdk } from '../../sdk'

const { Value } = sdk

const rpcSpec = sdk.InputSpec.of({
  servertimeout: Value.number({
    name: 'Rpc Server Timeout',
    description:
      'Number of seconds after which an uncompleted RPC call will time out.',
    required: false,
    default: null,
    min: 5,
    max: 300,
    integer: true,
    units: 'seconds',
    placeholder: '30',
  }),
  threads: Value.number({
    name: 'Threads',
    description:
      'Set the number of threads for handling RPC calls. You may wish to increase this if you are making lots of calls via an integration.',

    required: false,
    default: null,
    min: 4,
    max: 64,
    step: null,
    integer: true,
    units: null,
    placeholder: '16',
  }),
  workqueue: Value.number({
    name: 'Work Queue',
    description:
      'Set the depth of the work queue to service RPC calls. Determines how long the backlog of RPC requests can get before it just rejects new ones.',

    required: false,
    default: null,
    min: 8,
    max: 256,
    step: null,
    integer: true,
    units: 'requests',
    placeholder: '128',
  }),
})

export const rpcConfig = sdk.Action.withInput(
  // id
  'rpc-config',

  // metadata
  async ({ effects }) => ({
    name: 'RPC Settings',
    description: 'Edit the RPC settings in bitcoin.conf',
    warning: null,
    allowedStatuses: 'any',
    group: 'RPC',
    visibility: 'enabled',
  }),

  // form input specification
  rpcSpec,

  // optionally pre-fill the input form
  ({ effects }) => read(effects),

  // the execution function
  ({ effects, input }) => write(input),
)

async function read(effects: any): Promise<PartialRpcSpec> {
  const bitcoinConf = await bitcoinConfFile.read.const(effects)
  console.log('Read bitcoinConf:')
  console.log(bitcoinConf)
  if (!bitcoinConf) return {}

  return {
    servertimeout: bitcoinConf.rpcservertimeout,
    threads: bitcoinConf.rpcthreads,
    workqueue: bitcoinConf.rpcworkqueue,
  }
}

async function write(input: RpcSpec) {
  const { servertimeout, threads, workqueue } = input

  const rpcSettings: typeof shape._TYPE = {}
  if (servertimeout) rpcSettings.rpcservertimeout = servertimeout
  if (threads) rpcSettings.rpcthreads = threads
  if (workqueue) rpcSettings.rpcworkqueue = workqueue
  console.log(`write to bitcoin.conf`, rpcSettings)

  await bitcoinConfFile.merge(rpcSettings)
  console.log("RPC should be written to bitcoin.conf:", rpcSettings)
}

type RpcSpec = typeof rpcSpec._TYPE
type PartialRpcSpec = typeof rpcSpec._PARTIAL
