import { bitcoinConfFile } from './file-models/bitcoin.conf'
import { sdk } from './sdk'
import { getRpcPort } from './utils'

export const rpcInterfaceId = 'rpc'
export const peerInterfaceId = 'peer'
export const zmqInterfaceId = 'zmq'
export const zmqPort = 28332
export const peerPort = 8333

export const setInterfaces = sdk.setupInterfaces(async ({ effects }) => {
  let config = await bitcoinConfFile.read.const(effects)

  if (!config) return []

  // RPC
  const rpcPort = await getRpcPort(config.prune)
  const rpcMulti = sdk.MultiHost.of(effects, 'rpc')
  const rpcMultiOrigin = await rpcMulti.bindPort(rpcPort, {
    protocol: 'http',
    preferredExternalPort: rpcPort,
  })
  const rpc = sdk.createInterface(effects, {
    name: 'RPC Interface',
    id: rpcInterfaceId,
    description: 'Listens for JSON-RPC commands',
    type: 'api',
    masked: false,
    schemeOverride: null,
    username: null,
    path: '',
    search: {},
  })
  const rpcReceipt = await rpcMultiOrigin.export([rpc])

  const receipts = [rpcReceipt]

  // PEER
  const peerMulti = sdk.MultiHost.of(effects, 'peer')
  const peerMultiOrigin = await peerMulti.bindPort(peerPort, {
    protocol: 'bitcoin',
    preferredExternalPort: peerPort,
  })
  const peer = sdk.createInterface(effects, {
    name: 'Peer Interface',
    id: peerInterfaceId,
    description:
      'Listens for incoming connections from peers on the bitcoin network',
    type: 'p2p',
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
    const zmqMulti = sdk.MultiHost.of(effects, 'zmq')
    const zmqMultiOrigin = await zmqMulti.bindPort(zmqPort, {
      preferredExternalPort: zmqPort,
      addSsl: null,
      secure: null,
      protocol: null,
    })
    const zmq = sdk.createInterface(effects, {
      name: 'ZeroMQ Interface',
      id: zmqInterfaceId,
      description:
        'Listens for incoming connections from peers on the bitcoin network',
      type: 'api',
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
