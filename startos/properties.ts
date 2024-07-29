import { sdk } from './sdk'
import { bitcoinConfFile } from './file-models/bitcoin.conf'
import { rpcInterfaceId } from './interfaces'
import { GetBlockchainInfo } from './utils'

export const properties = sdk.setupProperties(async ({ effects }) => {
  const conf = await bitcoinConfFile.read(effects)

  // @TODO figure out why "as any" is needed
  if (!conf) return {} as any

  const rpcuser = conf.rpcuser
  const rpcpassword = conf.rpcpassword

  const addressInfo = (
    await sdk.serviceInterface.getOwn(effects, rpcInterfaceId).once()
  )?.addressInfo!

  type Property = {
    type: 'string' | 'object'
    value: any
    description: string
    copyable: boolean
    masked: boolean
    qr: boolean
  }

  const networkInfoRes = await sdk.runCommand(
    effects,
    { id: 'main' },
    ['bitcoin-cli', '-conf=/root/.bitcoin/bitcoin.conf', 'getnetworkinfo'],
    {},
  )

  const blockchainInfoRes = await sdk.runCommand(
    effects,
    { id: 'main' },
    ['bitcoin-cli', '-conf=/root/.bitcoin/bitcoin.conf', 'getblockchaininfo'],
    {},
  )

  const blockchainProperties: { [key: string]: Property } = {}
  const softforkProperties: { [key: string]: Property } = {}

  if (blockchainInfoRes.stdout) {
    const blockchainInfo: GetBlockchainInfo = JSON.parse(
      blockchainInfoRes.stdout as string,
    )
    blockchainProperties['Block Height'] = {
      type: 'string',
      value: blockchainInfo.headers,
      description: 'The current block height for the network',
      copyable: false,
      masked: false,
      qr: false,
    }
    blockchainProperties['Synced Block Height'] = {
      type: 'string',
      value: blockchainInfo.blocks,
      description: 'The number of blocks the node has verified',
      copyable: false,
      masked: false,
      qr: false,
    }
    blockchainProperties['Sync Progress'] = {
      type: 'string',
      value:
        blockchainInfo.blocks < blockchainInfo.headers
          ? `${(blockchainInfo.verificationprogress * 100).toFixed(2)}%`
          : '100%',
      description: 'The percentage of the blockchain that has been verified',
      copyable: false,
      masked: false,
      qr: false,
    }

    // @TODO finish SF properties object
    for (const [sfName, sfData] of Object.entries(blockchainInfo.softforks)) {
      
      softforkProperties[sfName] = {
        type: 'object',
        description: `${sfName} Details`
      }
    }
  }

  const networkProperties: { [key: string]: Property } = {}

  if (networkInfoRes.stdout) {
    const networkInfo = JSON.parse(networkInfoRes.stdout as string)
    const connections = networkInfo.connections
    const connectionsIn = networkInfo.connections_in
    const connectionsOut = networkInfo.connections_out

    networkProperties['Connections'] = {
      type: 'string',
      value: `${connections} (${connectionsIn} in / ${connectionsOut})`,
      description: 'The number of peers connected (inbound and outbound)',
      copyable: false,
      masked: false,
      qr: false,
    }
  }


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
      value: `btcstandup://${rpcuser}:${rpcpassword}@${addressInfo?.onionHostnames[0]}:8332`,
      description: 'Bitcoin-Standup Tor Quick Connect URL',
      copyable: true,
      qr: true,
      masked: true,
    },
    'Lan Quick Connect': {
      type: 'string',
      value: `btcstandup://${rpcuser}:${rpcpassword}@${addressInfo?.localHostnames[0]}:8332`,
      description: 'Bitcoin-Standup Lan Quick Connect URL',
      copyable: true,
      qr: true,
      masked: true,
    },
    'Blockchain Info': {
      type: 'object',
      value: blockchainProperties,
    },
    'Network Info': {
      type: 'object',
      value: networkProperties,
    },
    'Soft Forks': {
      type: 'object',
      value: softforkProperties,
    },
  }
})
