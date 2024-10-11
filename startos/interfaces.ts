import { sdk } from './sdk'
import { BindOptions } from '@start9labs/start-sdk/cjs/lib/osBindings'
import { bitcoinConfFile, toTypedBitcoinConf } from './file-models/bitcoin.conf'
import { getPeerPort, getRpcPort } from './utils'

export const rpcInterfaceId = 'rpc'
export const peerInterfaceId = 'peer'
export const zmqPort = 28332
export const zmqInterfaceId = 'zmq'

const zmqProtocol = {
  preferredExternalPort: 28332,
} as BindOptions

export const setInterfaces = sdk.setupInterfaces(async ({ effects }) => {
  let conf = await bitcoinConfFile.read.const(effects)

  if (!conf) return []

  const config = toTypedBitcoinConf(conf)

  // RPC
  const rpcPort = getRpcPort(config.testnet)
  const rpcMulti = sdk.host.multi(effects, 'rpc')
  const rpcMultiOrigin = await rpcMulti.bindPort(rpcPort, {
    protocol: 'grpc',
  })
  const rpc = sdk.createInterface(effects, {
    name: 'RPC Interface',
    id: rpcInterfaceId,
    description: 'Listens for JSON-RPC commands',
    type: 'api',
    hasPrimary: false,
    masked: false,
    schemeOverride: null,
    username: null,
    path: '',
    search: {},
  })
  const rpcReceipt = await rpcMultiOrigin.export([rpc])

  const receipts = [rpcReceipt]

  // PEER
  const peerPort = getPeerPort(config.testnet)
  const peerMulti = sdk.host.multi(effects, 'peer')
  const peerMultiOrigin = await peerMulti.bindPort(peerPort, {
    protocol: 'bitcoin',
  })
  const peer = sdk.createInterface(effects, {
    name: 'Peer Interface',
    id: peerInterfaceId,
    description:
      'Listens for incoming connections from peers on the bitcoin network',
    type: 'p2p',
    hasPrimary: false,
    masked: false,
    schemeOverride: null,
    username: null,
    path: '',
    search: {},
  })
  const peerReceipt = await peerMultiOrigin.export([peer])

  receipts.push(peerReceipt)

  // ZMQ (conditional)
  if (config.zmqpubhashblock) {
    const zmqMulti = sdk.host.multi(effects, 'zmq')
    const zmqMultiOrigin = await zmqMulti.bindPort(zmqPort, zmqProtocol)
    const zmq = sdk.createInterface(effects, {
      name: 'ZeroMQ Interface',
      id: zmqInterfaceId,
      description:
        'Listens for incoming connections from peers on the bitcoin network',
      type: 'api',
      hasPrimary: false,
      masked: false,
      schemeOverride: null,
      username: null,
      path: '',
      search: {},
    })
    const zmqReceipt = await zmqMultiOrigin.export([zmq])

    receipts.push(zmqReceipt)
  }

  return receipts
})
