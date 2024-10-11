import { T } from '@start9labs/start-sdk'
import { sdk } from '../sdk'
import { GetBlockchainInfo, GetNetworkInfo } from '../utils'

export const runtimeInfo = sdk.Action.withoutInput(
  // id
  'runtime-info',

  // metadata
  async ({ effects }) => ({
    name: 'Runtime Information',
    description:
      'Network and other runtime information about this Bitcoin node',
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  // execution function
  async ({ effects }) => {
    // getnetowrkinfo

    const networkInfoRes = await sdk.runCommand(
      effects,
      { id: 'main' },
      ['bitcoin-cli', '-conf=/root/.bitcoin/bitcoin.conf', 'getnetworkinfo'],
      {},
      'getnetworkinfo',
    )

    const networkInfoRaw: GetNetworkInfo = JSON.parse(
      networkInfoRes.stdout as string,
    )

    // getblockchaininfo

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

    // return

    return {
      version: '1',
      type: 'object',
      name: 'Runtime Info',
      value: [
        getConnections(networkInfoRaw),
        getBlockchainInfo(blockchainInfoRaw),
        getSoftforkInfo(blockchainInfoRaw),
      ],
    }
  },
)

function getConnections(networkInfoRaw: GetNetworkInfo): T.ActionResultV1 {
  return {
    type: 'string',
    name: 'Connections',
    description: 'The number of peers connected (inbound and outbound)',
    value: `${networkInfoRaw.connections} (${networkInfoRaw.connectionsIn} in / ${networkInfoRaw.connectionsOut} out)`,
    copyable: false,
    masked: false,
    qr: false,
  }
}

function getBlockchainInfo(
  blockchainInfoRaw: GetBlockchainInfo,
): T.ActionResultV1 {
  return {
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
        description: 'The percentage of the blockchain that has been verified',
        copyable: false,
        masked: false,
        qr: false,
      },
    ],
  }
}

function getSoftforkInfo(
  blockchainInfoRaw: GetBlockchainInfo,
): T.ActionResultV1 {
  return {
    type: 'object',
    name: 'Softfork Info',
    value: [
      {
        type: 'object',
        name: 'Softforks',
        value: getSoftforks(blockchainInfoRaw),
      },
    ],
  }
}

function getSoftforks(
  blockchainInfoRaw: GetBlockchainInfo,
): T.ActionResultV1[] {
  return Object.entries(blockchainInfoRaw.softforks).map(([key, val]) => {
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
      value.push(getBip9Info(val.bip9))

      if (val.bip9.statistics) {
        value.push(getBip9Statistics(val.bip9.statistics))
      }
    }

    return {
      type: 'object',
      name: key,
      value,
    }
  })
}

function getBip9Info(bip9: Bip9): T.ActionResultV1 {
  const { status, bit, start_time, timeout, since } = bip9

  return {
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
        description: 'height of the first block to which the status applies',
        copyable: false,
        masked: false,
        qr: false,
      },
    ],
  }
}

function getBip9Statistics(statistics: Bip9Stats): T.ActionResultV1 {
  const { period, threshold, elapsed, count, possible } = statistics

  return {
    type: 'object',
    name: 'Statistics',
    value: [
      {
        type: 'string',
        name: 'Period',
        value: String(period),
        description: 'The length in blocks of the BIP9 signalling period',
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
  }
}

type Bip9 = NonNullable<GetBlockchainInfo['softforks']['']['bip9']>
type Bip9Stats = NonNullable<Bip9['statistics']>
