import { bitcoinConfFile } from '../file-models/bitcoin.conf'
import { rpcInterfaceId } from '../interfaces'
import { sdk } from '../sdk'

export const credentials = sdk.Action.withoutInput(
  'credentials',
  async ({ effects }) => ({
    name: 'Credentials',
    description: 'Access credentials for Bitcoin RPC, quick connect, auth, etc',
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),
  async ({ effects }) => {
    const conf = await bitcoinConfFile.read.const(effects)

    if (!conf) return {} as any

    const { rpcuser, rpcpassword } = conf

    const addressInfoRes = (
      await sdk.serviceInterface.getOwn(effects, rpcInterfaceId).once()
    )?.addressInfo

    return {
      'RPC Username': {
        type: 'string',
        value: rpcuser,
        description: 'Bitcoin RPC Username',
        copyable: true,
        masked: false,
        qr: false,
      },
      'RPC Password': {
        type: 'string',
        value: rpcpassword,
        description: 'Bitcoin RPC Password',
        copyable: true,
        masked: true,
        qr: false,
      },
      'Tor Quick Connect': {
        type: 'string',
        value: `btcstandup://${rpcuser}:${rpcpassword}@${addressInfoRes?.onionHostnames[0]}:8332`,
        description: 'Bitcoin-Standup Tor Quick Connect URL',
        copyable: true,
        qr: true,
        masked: true,
      },
      'Lan Quick Connect': {
        type: 'string',
        value: `btcstandup://${rpcuser}:${rpcpassword}@${addressInfoRes?.localHostnames[0]}:8332`,
        description: 'Bitcoin-Standup Lan Quick Connect URL',
        copyable: true,
        qr: true,
        masked: true,
      },
    }
  },
)
