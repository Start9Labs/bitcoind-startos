import { bitcoinConfFile } from '../file-models/bitcoin.conf'
import { sdk } from '../sdk'
import { getRpcAuth, getRpcUsers } from '../utils'
const { InputSpec, Value } = sdk

export const inputSpec = InputSpec.of({
  username: Value.text({
    name: 'Username',
    description: 'RPC Auth Username',
    required: true,
    default: null,
    patterns: [
      {
        regex: '^[a-zA-Z0-9_]+$',
        description: 'Must be alphanumeric (can contain underscore).',
      },
    ],
  }),
})

export const generateRpcUser = sdk.Action.withInput(
  // id
  'generate-rpcuser',

  // metadata
  async ({ effects }) => ({
    name: 'Generate RPC User Credentials',
    description:
      'Generate RPC User Credentials for remote connections i.e. Sparrow. rpcauth.py will randomly generate a secure password. The username and hashed password will be persisted in Bitcoin.conf',
    warning: null,
    allowedStatuses: 'any',
    group: 'RPC Users',
    visibility: 'enabled',
  }),

  // input spec
  inputSpec,

  // optionally pre-fill form
  async ({ effects }) => {},

  // execution function
  async ({ effects, input }) => {
    const existingUsernames = await getRpcUsers(effects)

    if (existingUsernames?.includes(input.username)) {
      return {
        version: '1' as const,
        title: 'Error creating RPC Auth User',
        message: 'RPCAuth entry with this username already exists.',
        result: null,
      }
    }

    const mountpoint = '/scripts'

    const res = await sdk.SubContainer.withTemp(
      effects,
      {
        imageId: 'python',
      },
      sdk.Mounts.of().addAssets(null, mountpoint),
      'rpc-auth-generator',
      (subc) =>
        subc.exec(['python3', `${mountpoint}/rpcauth.py`, `${input.username}`]),
    )

    if (typeof res.stdout === 'string') {
      const password = res.stdout.split('\n')[3].trim()
      const newRpcAuth = res.stdout.split('\n')[1].trim().split('=')[1].trim()

      const rpcAuthEntries = (await getRpcAuth(effects)) || []
      rpcAuthEntries.push(newRpcAuth)

      bitcoinConfFile.merge(effects, {
        rpcauth: rpcAuthEntries,
      })

      return {
        version: '1',
        title: 'RPC user successfully created',
        message: `RPC password created for ${input.username}. Store this password in a secure place. If lost, a new RPC user will need to be created as Bitcoin.conf only stores a hash of the password`,
        result: {
          name: 'RPC Password',
          type: 'single',
          value: password,
          description: `${input.username} RPC Password`,
          copyable: true,
          masked: true,
          qr: false,
        },
      }
    }
  },
)
