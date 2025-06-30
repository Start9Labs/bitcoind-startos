import { Effects } from '@start9labs/start-sdk/base/lib/Effects'
import { bitcoinConfFile } from '../fileModels/bitcoin.conf'
import { sdk } from '../sdk'
const { InputSpec, Value } = sdk


export async function getRpcUsers(effects: Effects) {
  const rpcauth = await getRpcAuth(effects)
  if (!rpcauth) return
  return [rpcauth].flat().map((e) => e.split(':', 2)[0])
}

export async function getRpcAuth(effects: Effects) {
  return (await bitcoinConfFile.read().const(effects))?.rpcauth
}

export const inputSpec = InputSpec.of({
  deletedRpcUsers: Value.dynamicMultiselect(async ({ effects }) => {
    const existingUsernames = (await getRpcUsers(effects)) || []

    return {
      name: 'Existing RPC Users',
      default: [],
      values: existingUsernames.reduce(
        (obj, curr) => ({ ...obj, [curr]: curr }),
        {} as Record<string, string>,
      ),
    }
  }),
})

export const deleteRpcAuth = sdk.Action.withInput(
  // id
  'delete-rpcauth',

  // metadata
  async ({ effects }) => {
    const rpcUsers = await getRpcUsers(effects)
    return {
      name: 'Delete RPC Users',
      description:
        'Delete RPC users from Bitcoin.conf. You may want to run this action if the RPC Auth entry is no longer needed or if the password is lost.',
      warning: null,
      allowedStatuses: 'any',
      group: 'RPC Users',
      visibility:
        rpcUsers && rpcUsers.length > 0
          ? 'enabled'
          : { disabled: 'There are no RPC users' },
    }
  },

  // input spec
  inputSpec,

  // optionally pre-fill form
  async ({ effects }) => {},

  // execution function
  async ({ effects, input }) => {
    const rpcauth = (await getRpcAuth(effects))!
    const filtered = [rpcauth]
      .flat()
      .filter((auth) => !input.deletedRpcUsers.includes(auth.split(':', 2)[0]))
    await bitcoinConfFile.merge(effects, { rpcauth: filtered })
  },
)
