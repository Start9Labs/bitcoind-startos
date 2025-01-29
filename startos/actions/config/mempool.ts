import { bitcoinConfFile, shape } from '../../file-models/bitcoin.conf'
import { sdk } from '../../sdk'

const { Value } = sdk

const mempoolSpec = sdk.InputSpec.of({
  persistmempool: Value.toggle({
    name: 'Persist Mempool',
    default: true,
    description: 'Save the mempool on shutdown and load on restart.',
  }),
  maxmempool: Value.number({
    name: 'Max Mempool Size',
    description: 'Keep the transaction memory pool below <n> megabytes.',
    required: false,
    default: null,
    min: 1,
    integer: true,
    units: 'MiB',
    placeholder: '300',
  }),
  mempoolexpiry: Value.number({
    name: 'Mempool Expiration',
    description:
      'Do not keep transactions in the mempool longer than <n> hours.',
    required: false,
    default: null,
    min: 1,
    integer: true,
    units: 'Hr',
    placeholder: '336',
  }),
  mempoolfullrbf: Value.toggle({
    name: 'Enable Full RBF',
    default: true,
    description:
      'Policy for your node to use for relaying and mining unconfirmed transactions.  For details, see https://github.com/bitcoin/bitcoin/blob/master/doc/release-notes/release-notes-24.0.1.md#notice-of-new-option-for-transaction-replacement-policies',
  }),
  permitbaremultisig: Value.toggle({
    name: 'Permit Bare Multisig',
    default: true,
    description: 'Relay non-P2SH multisig transactions',
  }),
  datacarrier: Value.toggle({
    name: 'Relay OP_RETURN Transactions',
    default: true,
    description: 'Relay transactions with OP_RETURN outputs',
  }),
  datacarriersize: Value.number({
    name: 'Max OP_RETURN Size',
    description: 'Maximum size of data in OP_RETURN outputs to relay',
    required: false,
    default: null,
    min: 0,
    max: 10_000,
    integer: true,
    units: 'bytes',
    placeholder: '83',
  }),
})

export const mempoolConfig = sdk.Action.withInput(
  // id
  'mempool-config',

  // metadata
  async ({ effects }) => ({
    name: 'Mempool Settings',
    description: 'Edit the Mempool settings in bitcoin.conf',
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  // form input specification
  mempoolSpec,

  // optionally pre-fill the input form
  ({ effects }) => read(effects),

  // the execution function
  ({ effects, input }) => write(input),
)

async function read(effects: any): Promise<PartialMempoolSpec> {
  const bitcoinConf = await bitcoinConfFile.read.const(effects)
  if (!bitcoinConf) return {}
  const {
    mempoolfullrbf,
    persistmempool,
    maxmempool,
    mempoolexpiry,
    datacarrier,
    datacarriersize,
    permitbaremultisig,
  } = bitcoinConf

  const mempoolSettings: PartialMempoolSpec = {
    maxmempool,
    mempoolexpiry,
    datacarriersize,
  }
  mempoolfullrbf == 1
    ? (mempoolSettings.mempoolfullrbf = true)
    : (mempoolSettings.mempoolfullrbf = false)
  persistmempool == 1
    ? (mempoolSettings.persistmempool = true)
    : (mempoolSettings.persistmempool = false)
  datacarrier == 1
    ? (mempoolSettings.datacarrier = true)
    : (mempoolSettings.datacarrier = false)
  permitbaremultisig == 1
    ? (mempoolSettings.permitbaremultisig = true)
    : (mempoolSettings.permitbaremultisig = false)

  return mempoolSettings
}

async function write(input: MempoolSpec) {
  const {
    mempoolfullrbf,
    persistmempool,
    maxmempool,
    mempoolexpiry,
    datacarrier,
    datacarriersize,
    permitbaremultisig,
  } = input

  const mempoolSettings: typeof shape._TYPE = {
    mempoolfullrbf: mempoolfullrbf == true ? 1 : 0,
    persistmempool: persistmempool == true ? 1 : 0,
    datacarrier: datacarrier == true ? 1 : 0,
    permitbaremultisig: permitbaremultisig == true ? 1 : 0,
  }
  if (maxmempool) mempoolSettings.maxmempool = maxmempool
  if (mempoolexpiry) mempoolSettings.mempoolexpiry = mempoolexpiry
  if (datacarriersize) mempoolSettings.datacarriersize = datacarriersize

  await bitcoinConfFile.merge(mempoolSettings)
}

type MempoolSpec = typeof mempoolSpec._TYPE
type PartialMempoolSpec = typeof mempoolSpec._PARTIAL
