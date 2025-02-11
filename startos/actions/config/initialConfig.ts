import { sdk } from '../../sdk'
import { utils } from '@start9labs/start-sdk'
import * as diskusage from 'diskusage'
import { bitcoinConfFile } from '../../file-models/bitcoin.conf'

const { Value } = sdk
const diskUsage = utils.once(() => diskusage.check('/'))
const archivalMin = 900_000_000_000
import { bitcoinConfDefaults, getExteralAddresses } from '../../utils'

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
  externalip: getExteralAddresses(),
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
  const { prune, externalip } = input
  const initialConfig = {
    rpcbind: prune ? '127.0.0.1:18332' : '0.0.0.0:8332',
    rpcallowip: prune ? '127.0.0.1/32' : '0.0.0.0/0',
    externalip:
      externalip === 'unspecified'
        ? bitcoinConfDefaults.externalip
        : externalip,
  }

  await bitcoinConfFile.merge(initialConfig)
  await sdk.store.setOwn(effects, sdk.StorePath.initialized, true)
}

type InitialConfigSpec = typeof initialConfigSpec._TYPE
