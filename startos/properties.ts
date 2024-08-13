import { sdk } from './sdk'
import { bitcoinConfFile } from './file-models/bitcoin.conf'
import { rpcInterfaceId } from './interfaces'
import { GetBlockchainInfo } from './utils'
import { T } from '@start9labs/start-sdk'

export const properties = sdk.setupProperties(async ({ effects }) => {
  const conf = await bitcoinConfFile.read(effects)

  if (!conf) return {} as any

  /** Basic Info */

  const rpcuser = conf.rpcuser
  const rpcpassword = conf.rpcpassword

  const addressInfoRes = (
    await sdk.serviceInterface.getOwn(effects, rpcInterfaceId).once()
  )?.addressInfo

  const networkInfoRes = await sdk.runCommand(
    effects,
    { id: 'main' },
    ['bitcoin-cli', '-conf=/root/.bitcoin/bitcoin.conf', 'getnetworkinfo'],
    {},
  )

  const basicInfo: Record<string, T.SdkPropertiesValue> = {
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

  if (networkInfoRes.stdout && typeof networkInfoRes.stdout === 'string') {
    const networkInfo = JSON.parse(networkInfoRes.stdout)

    basicInfo['Connections'] = {
      type: 'string',
      value: `${networkInfo.connections} (${networkInfo.connectionsIn} in / ${networkInfo.connectionsOut} out)`,
      description: 'The number of peers connected (inbound and outbound)',
      copyable: false,
      masked: false,
      qr: false,
    }
  }

  /** Blockchain Info */

  const blockchainInfoRes = await sdk.runCommand(
    effects,
    { id: 'main' },
    ['bitcoin-cli', '-conf=/root/.bitcoin/bitcoin.conf', 'getblockchaininfo'],
    {},
  )

  const blockchainProperties: Record<string, T.SdkPropertiesValue> = {}
  const softforkProperties: Record<string, T.SdkPropertiesValue> = {}

  if (
    blockchainInfoRes.stdout &&
    typeof blockchainInfoRes.stdout === 'string'
  ) {
    const blockchainInfo: GetBlockchainInfo = JSON.parse(
      blockchainInfoRes.stdout,
    )
    blockchainProperties['Block Height'] = {
      type: 'string',
      value: String(blockchainInfo.headers),
      description: 'The current block height for the network',
      copyable: false,
      masked: false,
      qr: false,
    }
    blockchainProperties['Synced Block Height'] = {
      type: 'string',
      value: String(blockchainInfo.blocks),
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

    Object.entries(blockchainInfo.softforks).forEach(([key, val]) => {
      const softfork: Record<string, T.SdkPropertiesValue> = {
        Type: {
          type: 'string',
          value: val.type,
          description: 'Either "buried", "bip9"',
          copyable: false,
          masked: false,
          qr: false,
        },
        Height: {
          type: 'string',
          value: val.height ? String(val.height) : 'N/A',
          description:
            'height of the first block which the rules are or will be enforced (only for "buried" type, or "bip9" type with "active" status)',
          copyable: false,
          masked: false,
          qr: false,
        },
        Active: {
          type: 'string',
          value: String(val.active),
          description:
            'true if the rules are enforced for the mempool and the next block',
          copyable: false,
          masked: false,
          qr: false,
        },
      }

      if (val.bip9) {
        const { status, bit, start_time, timeout, since } = val.bip9
        const bip9: Record<string, T.SdkPropertiesValue> = {
          'BIP 9': {
            type: 'object',
            value: {
              Status: {
                type: 'string',
                value: status,
                description:
                  'One of "defined", "started", "locked_in", "active", "failed"',
                copyable: false,
                masked: false,
                qr: false,
              },
              Bit: {
                type: 'string',
                value: bit ? String(bit) : 'N/A',
                description:
                  'The bit (0-28) in the block version field used to signal this softfork (only for "started" status)',
                copyable: false,
                masked: false,
                qr: false,
              },
              'Start Time': {
                type: 'string',
                value: String(start_time),
                description:
                  'The minimum median time past of a block at which the bit gains its meaning',
                copyable: false,
                masked: false,
                qr: false,
              },
              Timeout: {
                type: 'string',
                value: String(timeout),
                description:
                  'The median time past of a block at which the deployment is considered failed if not yet locked in',
                copyable: false,
                masked: false,
                qr: false,
              },
              Since: {
                type: 'string',
                value: String(since),
                description:
                  'height of the first block to which the status applies',
                copyable: false,
                masked: false,
                qr: false,
              },
            },
          },
        }

        if (val.bip9.statistics) {
          const { period, threshold, elapsed, count, possible } =
            val.bip9.statistics
          const statistics: Record<string, T.SdkPropertiesValue> = {
            Statistics: {
              type: 'object',
              value: {
                Period: {
                  type: 'string',
                  value: String(period),
                  description:
                    'The length in blocks of the BIP9 signalling period',
                  copyable: false,
                  masked: false,
                  qr: false,
                },
                Threshold: {
                  type: 'string',
                  value: String(threshold),
                  description:
                    'The number of blocks with the version bit set required to activate the feature',
                  copyable: false,
                  masked: false,
                  qr: false,
                },
                Elapsed: {
                  type: 'string',
                  value: String(elapsed),
                  description:
                    'The number of blocks elapsed since the beginning of the current period',
                  copyable: false,
                  masked: false,
                  qr: false,
                },
                Count: {
                  type: 'string',
                  value: String(count),
                  description:
                    'The number of blocks with the version bit set in the current period',
                  copyable: false,
                  masked: false,
                  qr: false,
                },
                Possible: {
                  type: 'string',
                  value: String(possible),
                  description:
                    'returns false if there are not enough blocks left in this period to pass activation threshold',
                  copyable: false,
                  masked: false,
                  qr: false,
                },
              },
            },
          }
          Object.assign(bip9, statistics)
        }
        Object.assign(softfork, bip9)
      }

      softforkProperties[key] = {
        type: 'object',
        value: softfork,
      }
    })
  }

  /** Consolidate */

  return {
    ...basicInfo,
    'Blockchain Info': {
      type: 'object',
      value: blockchainProperties,
    },
    'Soft Forks': {
      type: 'object',
      value: softforkProperties,
    },
  }
})
