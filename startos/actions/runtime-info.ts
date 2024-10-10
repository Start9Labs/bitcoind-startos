import { T } from '@start9labs/start-sdk'
import { sdk } from '../sdk'
import { GetBlockchainInfo } from '../utils'

export const runtimeInfo = sdk.Action.withoutInput(
  'runtime-info',
  async ({ effects }) => ({
    name: 'Runtime Information',
    description:
      'Network and other runtime information about this Bitcoin node',
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),
  async ({ effects }) => {
    /** Connections */

    const networkInfoRes = await sdk.runCommand(
      effects,
      { id: 'main' },
      ['bitcoin-cli', '-conf=/root/.bitcoin/bitcoin.conf', 'getnetworkinfo'],
      {},
      'getnetworkinfo',
    )

    const networkInfo = JSON.parse(networkInfoRes.stdout as string)

    const connections: T.ActionResultV1 = {
      type: 'string',
      name: 'Connections',
      description: 'The number of peers connected (inbound and outbound)',
      value: `${networkInfo.connections} (${networkInfo.connectionsIn} in / ${networkInfo.connectionsOut} out)`,
      copyable: false,
      masked: false,
      qr: false,
    }

    /** getblockchaininfo */

    const blockchainInfoRes = await sdk.runCommand(
      effects,
      { id: 'main' },
      ['bitcoin-cli', '-conf=/root/.bitcoin/bitcoin.conf', 'getblockchaininfo'],
      {},
      'getblockchaininfo',
    )

    const blockchainInfoRaw: GetBlockchainInfo = JSON.parse(
      blockchainInfoRes.stdout as string,
    )

    /** Blockchain Info */

    const blockchainInfo: T.ActionResultV1 = {
      type: 'object',
      name: 'Blockchain Info',
      value: [
        {
          type: 'string',
          name: 'Block Height',
          value: String(blockchainInfoRaw.headers),
          description: 'The current block height for the network',
          copyable: false,
          masked: false,
          qr: false,
        },
        {
          type: 'string',
          name: 'Synced Block Height',
          value: String(blockchainInfoRaw.blocks),
          description: 'The number of blocks the node has verified',
          copyable: false,
          masked: false,
          qr: false,
        },
        {
          type: 'string',
          name: 'Sync Progress',
          value:
            blockchainInfoRaw.blocks < blockchainInfoRaw.headers
              ? `${(blockchainInfoRaw.verificationprogress * 100).toFixed(2)}%`
              : '100%',
          description:
            'The percentage of the blockchain that has been verified',
          copyable: false,
          masked: false,
          qr: false,
        },
      ],
    }

    /** Softfork Info */

    const softforkInfo: T.ActionResultV1 = {
      type: 'object',
      name: 'Softfork Info',
      value: [
        {
          type: 'object',
          name: 'Softforks',
          value: [],
        },
      ],
    }

    const softforkProperties: T.ActionResultV1[] = Object.entries(
      blockchainInfoRaw.softforks,
    ).map(([key, val]) => {
      const value: T.ActionResultV1[] = [
        {
          type: 'string',
          name: 'Type',
          value: val.type,
          description: 'Either "buried", "bip9"',
          copyable: false,
          masked: false,
          qr: false,
        },
        {
          type: 'string',
          name: 'Height',
          value: val.height ? String(val.height) : 'N/A',
          description:
            'height of the first block which the rules are or will be enforced (only for "buried" type, or "bip9" type with "active" status)',
          copyable: false,
          masked: false,
          qr: false,
        },
        {
          type: 'string',
          name: 'Active',
          value: String(val.active),
          description:
            'true if the rules are enforced for the mempool and the next block',
          copyable: false,
          masked: false,
          qr: false,
        },
      ]

      if (val.bip9) {
        const { status, bit, start_time, timeout, since } = val.bip9
        value.push({
          type: 'object',
          name: 'Bip9',
          value: [
            {
              type: 'string',
              name: 'Status',
              value: status,
              description:
                'One of "defined", "started", "locked_in", "active", "failed"',
              copyable: false,
              masked: false,
              qr: false,
            },
            {
              type: 'string',
              name: 'Bit',
              value: bit ? String(bit) : 'N/A',
              description:
                'The bit (0-28) in the block version field used to signal this softfork (only for "started" status)',
              copyable: false,
              masked: false,
              qr: false,
            },
            {
              type: 'string',
              name: 'Start Time',
              value: String(start_time),
              description:
                'The minimum median time past of a block at which the bit gains its meaning',
              copyable: false,
              masked: false,
              qr: false,
            },
            {
              type: 'string',
              name: 'Timeout',
              value: String(timeout),
              description:
                'The median time past of a block at which the deployment is considered failed if not yet locked in',
              copyable: false,
              masked: false,
              qr: false,
            },
            {
              type: 'string',
              name: 'Since',
              value: String(since),
              description:
                'height of the first block to which the status applies',
              copyable: false,
              masked: false,
              qr: false,
            },
          ],
        })

        if (val.bip9.statistics) {
          const { period, threshold, elapsed, count, possible } =
            val.bip9.statistics

          value.push({
            type: 'object',
            name: 'Statistics',
            value: [
              {
                type: 'string',
                name: 'Period',
                value: String(period),
                description:
                  'The length in blocks of the BIP9 signalling period',
                copyable: false,
                masked: false,
                qr: false,
              },
              {
                type: 'string',
                name: 'Threshold',
                value: String(threshold),
                description:
                  'The number of blocks with the version bit set required to activate the feature',
                copyable: false,
                masked: false,
                qr: false,
              },
              {
                type: 'string',
                name: 'Elapsed',
                value: String(elapsed),
                description:
                  'The number of blocks elapsed since the beginning of the current period',
                copyable: false,
                masked: false,
                qr: false,
              },
              {
                type: 'string',
                name: 'Count',
                value: String(count),
                description:
                  'The number of blocks with the version bit set in the current period',
                copyable: false,
                masked: false,
                qr: false,
              },
              {
                type: 'string',
                name: 'Possible',
                value: String(possible),
                description:
                  'returns false if there are not enough blocks left in this period to pass activation threshold',
                copyable: false,
                masked: false,
                qr: false,
              },
            ],
          })
        }
      }

      return {
        type: 'object',
        name: key,
        value,
      }
    })

    /** Consolidate */

    return {
      version: '1',
      type: 'object',
      name: 'Runtime Info',
      value: [connections, blockchainInfo, softforkInfo],
    }
  },
)
