import { bitcoinConfFile } from '../file-models/bitcoin.conf'
import { sdk } from '../sdk'
import { getRpcUsers } from '../utils'
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
  password: Value.text({
    name: 'Password',
    description: 'RPC Auth Password',
    required: true,
    default: null,
    patterns: [
      {
        regex: '.*',
        description: 'Must be alphanumeric (can contain underscore).',
      },
    ],
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
    visibility: 'enabled',
  }),

  // input spec
  inputSpec,

  // optionally pre-fill form
  async ({ effects }) => {},

  // execution function
  async ({ effects, input }) => {
    const existingUsernames = await getRpcUsers(effects)
    const { username, password } = input

    if (existingUsernames?.includes(username)) {
      return {
        version: '1',
        title: 'Error creating RPC Auth User',
        message: 'RPCAuth entry with this username already exists.',
        result: null,
      }
    }

    const res = await sdk.runCommand(
      effects,
      { id: 'bitcoind' },
      ['./bitcoin/share/rpcauth/rpcauthwithpass', `${username}`, `${password}`],
      {},
      'genDependentRpcAuth',
    )

    if (typeof res.stdout === 'string') {
      const password = res.stdout.split('\n')[3].trim()
      const newRpcAuth = res.stdout.split('\n')[1].trim().split('=')[1].trim()

      bitcoinConfFile.merge({
        rpcauth: [newRpcAuth],
      })

      return {
        version: '1',
        title: 'RPC user successfully created',
        message: `RPC password created for ${username}. Store this password in a secure place. If lost, a new RPC user will need to be created as Bitcoin.conf only stores a hash of the password`,
        result: {
          name: 'RPC Password',
          type: 'single',
          value: password,
          description: `${username} RPC Password`,
          copyable: true,
          masked: true,
          qr: false,
        },
      }
    }
  },
)
