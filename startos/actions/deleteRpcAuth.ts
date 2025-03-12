import { bitcoinConfFile } from '../file-models/bitcoin.conf'
import { sdk } from '../sdk'
import { getRpcAuth, getRpcUsers } from '../utils'
const { InputSpec, Value } = sdk

export const inputSpec = InputSpec.of({
  deletedRpcUsers: Value.dynamicMultiselect(async ({ effects }) => {
    const existingUsernames = (await getRpcUsers(effects)) || []

    return {
      name: 'Existing RPC Users',
      default: [],
      values: existingUsernames.reduce(
        (obj, curr) => ({
          ...obj,
          [curr]: curr,
        }),
        {},
      ),
    }
  }),
})

export const deleteRpcAuth = sdk.Action.withInput(
  // id
  'delete-rpcauth',

  // metadata
  async ({ effects }) => ({
    name: 'Delete RPC Users',
    description:
      'Delete RPC users from Bitcoin.conf. You may want to run this action if the RPC Auth entry is no longer needed or if the password is lost.',
    warning: null,
    allowedStatuses: 'any',
    group: 'RPC',
    visibility: (await getRpcUsers(effects))
      ? 'enabled'
      : { disabled: 'There are no RPC users' },
  }),

  // input spec
  inputSpec,

  // optionally pre-fill form
  async ({ effects }) => {},

  // execution function
  async ({ effects, input }) => {
    const rpcauth = await getRpcAuth(effects)
    const filtered = rpcauth?.filter(
      (auth) => !input.deletedRpcUsers.includes(auth.split(':', 2)[0]),
    )
    await bitcoinConfFile.merge(effects, {
      rpcauth: filtered,
    })
  },
)
