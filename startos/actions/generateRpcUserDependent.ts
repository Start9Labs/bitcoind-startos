import { bitcoinConfFile } from '../file-models/bitcoin.conf'
import { sdk } from '../sdk'
import { getRpcUsers } from '../utils'
const { InputSpec, Value } = sdk

export const inputSpec = InputSpec.of({
  username: Value.dynamicText(async ({ effects }) => {
    return {
      name: 'Username',
      description: 'RPC Auth Username',
      disabled: 'Cannot edit dependent specified username',
      required: true,
      default: null,
      patterns: [
        {
          regex: '^[a-zA-Z0-9_]+$',
          description: 'Must be alphanumeric (can contain underscore).',
        },
      ],
    }
  }),
  password: Value.dynamicText(async ({ effects }) => {
    return {
      name: 'Password',
      description: 'RPC Auth Password',
      disabled: 'Cannot edit dependent specified password',
      required: true,
      default: null,
      patterns: [
        {
          regex: '.*',
          description: 'Must be alphanumeric (can contain underscore).',
        },
      ],
    }
  }),
})

export const generateRpcUserDependent = sdk.Action.withInput(
  // id
  'generate-rpc-dependent',

  // metadata
  async ({ effects }) => ({
    name: 'Generate RPC Dependent Credentials',
    description:
      'Generate RPC Credentials using the provided username and password for a dependent service running locally',
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'hidden',
  }),

  // input spec
  inputSpec,

  // optionally pre-fill form
  async ({ effects }) => {},

  // execution function
  async ({ effects, input }) => {
    const existingUsernames = await getRpcUsers(effects)
    const { username, password } = input

    if (existingUsernames?.includes(username!)) {
      return {
        version: '1',
        title: 'Error creating RPC Auth User',
        message: 'RPCAuth entry with this username already exists.',
        result: null,
      }
    }

    const res = await sdk.SubContainer.with(
      effects,
      {
        imageId: 'python',
      },
      [
        {
          options: {
            type: 'assets',
            subpath: null,
            id: 'rpcauth',
          },
          path: '/assets',
        },
      ],
      'RPC Auth Generator',
      (subc) =>
        subc.exec([
          'python3',
          '/assets/rpcauth.py',
          `${username}`,
          `${password}`,
        ]),
    )

    if (typeof res.stdout === 'string') {
      const newRpcAuth = res.stdout.split('\n')[1].trim().split('=')[1].trim()

      bitcoinConfFile.merge({
        rpcauth: [newRpcAuth],
      })

      return {
        version: '1',
        title: 'Success',
        message: `RPC password created for ${username}`,
        result: null,
      }
    }
  },
)
