import { bitcoinConfFile, shape } from '../../file-models/bitcoin.conf'
import { sdk } from '../../sdk'

const { Value, Variants, List, InputSpec } = sdk

const peerSpec = sdk.InputSpec.of({
  listen: Value.toggle({
    name: 'Make Public',
    default: true,
    description: 'Allow other nodes to find your server on the network.',
  }),
  onlyonion: Value.toggle({
    name: 'Disable Clearnet',
    default: false,
    description: 'Only connect to peers over Tor.',
  }),
  v2transport: Value.toggle({
    name: 'Use V2 P2P Transport Protocol',
    default: true,
    description:
      'Enable or disable the use of BIP324 V2 P2P transport protocol.',
  }),
  connectpeer: Value.union(
    {
      name: 'Connect Peer',
      default: 'addnode',
    },
    Variants.of({
      connect: {
        name: 'Connect',
        spec: InputSpec.of({
          peers: Value.list(
            List.text(
              {
                name: 'Connect Nodes',
                minLength: 1,
                description:
                  'Add addresses of nodes for Bitcoin to EXCLUSIVELY connect to.',
              },
              {
                patterns: [
                  {
                    regex:
                      '(^s*((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?).(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?).(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?).(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?:[0-9]{1,5}))s*$)|(^s*((?=.{1,255}$)[0-9A-Za-z](?:(?:[0-9A-Za-z]|\b-){0,61}[0-9A-Za-z])?(?:.[0-9A-Za-z](?:(?:[0-9A-Za-z]|\b-){0,61}[0-9A-Za-z])?)*.?:[0-9]{1,5})s*$)|(^s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:)))(%.+)?:[0-9]{1,5}s*$)',
                    description:
                      "Must be either a domain name, or an IPv4 or IPv6 address. Be sure to include the port number, but do not include protocol scheme (eg 'http://').",
                  },
                ],
              },
            ),
          ),
        }),
      },
      addnode: {
        name: 'Add Node',
        spec: InputSpec.of({
          peers: Value.list(
            List.text(
              {
                name: 'Add Nodes',
                description:
                  'Add addresses of nodes for Bitcoin to connect with in addition to default nodes.',
              },
              {
                inputmode: 'text',
                patterns: [
                  {
                    regex:
                      '(^s*((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?).(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?).(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?).(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?:[0-9]{1,5}))s*$)|(^s*((?=.{1,255}$)[0-9A-Za-z](?:(?:[0-9A-Za-z]|\b-){0,61}[0-9A-Za-z])?(?:.[0-9A-Za-z](?:(?:[0-9A-Za-z]|\b-){0,61}[0-9A-Za-z])?)*.?:[0-9]{1,5})s*$)|(^s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:)))(%.+)?:[0-9]{1,5}s*$)',
                    description:
                      "Must be either a domain name, or an IPv4 or IPv6 address. Be sure to include the port number, but do not include protocol scheme (eg 'http://').",
                  },
                ],
              },
            ),
          ),
        }),
      },
    }),
  ),
})

export const peerConfig = sdk.Action.withInput(
  // id
  'peers-config',

  // metadata
  async ({ effects }) => ({
    name: 'Peer Settings',
    description: 'Edit the Peer settings in bitcoin.conf',
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  // form input specification
  peerSpec,

  // optionally pre-fill the input form
  ({ effects }) => read(effects),

  // the execution function
  ({ effects, input }) => write(input),
)

async function read(effects: any): Promise<PartialPeerSpec> {
  const bitcoinConf = await bitcoinConfFile.read.const(effects)
  if (!bitcoinConf) return {}
  const { listen, connect, addnode, onlynet, v2transport } = bitcoinConf

  const peerSettings: PartialPeerSpec = {
    listen: listen === undefined ? undefined : listen === 1 ? true : false,
    connectpeer: {
      selection: connect !== undefined ? 'connect' : 'addnode',
      value: {
        peers:
          connect !== undefined
            ? [connect].flat().filter((x): x is string => x !== undefined)
            : [addnode].flat().filter((x): x is string => x !== undefined),
      },
    },
    onlyonion: onlynet == ('onion' as const),
    v2transport: v2transport === 1,
  }

  return peerSettings
}

async function write(input: peerSpec) {
  const { connectpeer, listen, onlyonion, v2transport } = input

  const peerSettings: typeof shape._TYPE = {}
  peerSettings.whitelist = '172.18.0.0/16'
  if (listen) peerSettings.bind = '0.0.0.0:8333'

  if (listen) {
    peerSettings.listen = 1
  } else {
    peerSettings.listen = undefined
  }
  if (onlyonion) {
    peerSettings.onlynet = 'onion'
  } else {
    // @TODO onlynet, addnode, and connect cannot currently be overwritteen by `undefineed`.
    // Update for sdk solution once implemented
    peerSettings.onlynet = undefined
  }
  if (v2transport) peerSettings.v2transport = 1
  if (connectpeer.selection === 'connect') {
    peerSettings.connect = connectpeer.value.peers
    peerSettings.addnode = undefined
  } else if (connectpeer.selection === 'addnode') {
    peerSettings.addnode = connectpeer.value.peers
    peerSettings.connect = undefined
  }

  await bitcoinConfFile.merge(peerSettings)
}

type peerSpec = typeof peerSpec._TYPE
type PartialPeerSpec = typeof peerSpec._PARTIAL
