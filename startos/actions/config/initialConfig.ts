import { sdk } from '../../sdk'
import { utils } from '@start9labs/start-sdk'
import * as diskusage from 'diskusage'
import { bitcoinConfFile, shape } from '../../file-models/bitcoin.conf'

const { Value } = sdk
const diskUsage = utils.once(() => diskusage.check('/'))
const archivalMin = 900_000_000_000
import { bitcoinConfDefaults } from '../../utils'

const initialConfigSpec = sdk.InputSpec.of({
  prune: Value.dynamicNumber(async ({ effects }) => {
    const disk = await diskUsage()

    return {
      name: 'Pruning',
      description:
        'Set the maximum size of the blockchain you wish to store on disk.',
      warning: 'Increasing this value will require re-syncing your node.',
      placeholder: 'Enter max blockchain size',
      required: disk.total < archivalMin,
      default: disk.total < archivalMin ? 550 : null,
      integer: true,
      units: 'MiB',
      min: 550,
    }
  }),
  testnet: Value.toggle({
    name: 'Testnet',
    default: false,
    description:
      'Testnet is an alternative Bitcoin block chain to be used for testing. Testnet coins are separate and distinct from actual bitcoins, and are never supposed to have any value. This allows application developers or bitcoin testers to experiment, without having to use real bitcoins or worrying about breaking the main bitcoin chain.',
  }),
})

export const initialConfig = sdk.Action.withInput(
  // id
  'initial-config',

  // metadata
  async ({ effects }) => ({
    name: 'Initial Bitcoin Configuration',
    description:
      'Important bitcoin.conf configuration options required upon install.',
    warning: null,
    allowedStatuses: 'any',
    group: null,
    // @TODO this should work, but it seems hidden actions are broken i.e. `visibility: 'hidden'` still shows the action
    visibility: (await sdk.store
      .getOwn(effects, sdk.StorePath.initialized)
      .const())
      ? 'hidden'
      : 'enabled',
  }),

  // form input specification
  initialConfigSpec,

  // optionally pre-fill the input form
  async ({ effects }) => {},

  // the execution function
  ({ effects, input }) => write(effects, input),
)

async function write(effects: any, input: InitialConfigSpec) {
  const { prune, testnet } = input
  const initialConfig: typeof shape._TYPE = {
    ...bitcoinConfDefaults,
    rpcbind: prune ? '127.0.0.1:18332' : '0.0.0.0:8332',
    rpcallowip: prune ? '127.0.0.1/32' : '0.0.0.0/0',
    testnet: testnet ? 1 : 0,
  }

  await bitcoinConfFile.write(initialConfig)
  await sdk.store.setOwn(effects, sdk.StorePath.initialized, true)
}

type InitialConfigSpec = typeof initialConfigSpec._TYPE
