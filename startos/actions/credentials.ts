import { bitcoinConfFile } from '../file-models/bitcoin.conf'
import { rpcInterfaceId } from '../interfaces'
import { sdk } from '../sdk'

export const credentials = sdk.Action.withoutInput(
  // id
  'credentials',

  // metadata
  async ({ effects }) => ({
    name: 'Credentials',
    description: 'Access credentials for Bitcoin RPC, quick connect, auth, etc',
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  // TODO: Update for RPC Auth array
  // execution function
  async ({ effects }) => {
    const conf = (await bitcoinConfFile.read.const(effects))!

    const { rpcuser, rpcpassword } = conf

    const addressInfoRes = (
      await sdk.serviceInterface.getOwn(effects, rpcInterfaceId).const()
    )?.addressInfo

    return {
      version: '1',
      title: 'Credentials',
      message: null,
      result: {
        type: 'group',
        value: [
          {
            name: 'RPC Username',
            type: 'single',
            value: rpcuser,
            description: 'Bitcoin RPC Username',
            copyable: true,
            masked: false,
            qr: false,
          },
          {
            name: 'RPC Password',
            type: 'single',
            value: rpcpassword,
            description: 'Bitcoin RPC Password',
            copyable: true,
            masked: true,
            qr: false,
          },
          {
            name: 'Tor Quick Connect',
            type: 'single',
            value: `btcstandup://${rpcuser}:${rpcpassword}@${addressInfoRes?.onionHostnames[0]}:8332`,
            description: 'Bitcoin-Standup Tor Quick Connect URL',
            copyable: true,
            qr: true,
            masked: true,
          },
          {
            name: 'Lan Quick Connect',
            type: 'single',
            value: `btcstandup://${rpcuser}:${rpcpassword}@${addressInfoRes?.localHostnames[0]}:8332`,
            description: 'Bitcoin-Standup Lan Quick Connect URL',
            copyable: true,
            qr: true,
            masked: true,
          },
        ],
      },
    }
  },
)
