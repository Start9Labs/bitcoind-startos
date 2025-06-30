import { T } from '@start9labs/start-sdk'
import { bitcoinConfFile, shape } from '../../fileModels/bitcoin.conf'
import { sdk } from '../../sdk'
import { bitcoinConfDefaults, getExteralAddresses } from '../../utils'

const { listen, onlynet, v2transport, externalip, addnode, connect, bind } =
  bitcoinConfDefaults
const { Value, Variants, List, InputSpec } = sdk
const validNets = ['ipv4', 'ipv6', 'onion', 'i2p', 'cjdns'] as const
type ValidNets = (typeof validNets)[number]

const peerSpec = sdk.InputSpec.of({
  listen: Value.toggle({
    name: 'Make Public',
    default: listen,
    description: 'Allow other nodes to find your server on the network.',
  }),
  onlynet: Value.multiselect({
    name: 'Onlynet',
    description:
      'Make automatic outbound connections only to network <net> (ipv4, ipv6, onion, i2p, cjdns). Inbound and manual connections are not affected by this option',
    values: {
      ipv4: 'ipv4',
      ipv6: 'ipv6',
      onion: 'onion (Tor)',
      i2p: 'i2p',
      cjdns: 'cjdns',
    },
    default: [],
  }),
  v2transport: Value.toggle({
    name: 'Use V2 P2P Transport Protocol',
    default: v2transport,
    description:
      'Enable or disable the use of BIP324 V2 P2P transport protocol.',
  }),
  externalip: getExteralAddresses(),
  connectpeer: Value.union({
    name: 'Connect Peer',
    default: 'addnode',
    variants: Variants.of({
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
  }),
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
    group: 'Configuration',
    visibility: 'enabled',
  }),

  // form input specification
  peerSpec,

  // optionally pre-fill the input form
  ({ effects }) => read(effects),

  // the execution function
  ({ effects, input }) => write(effects, input),
)

async function read(effects: any): Promise<PartialPeerSpec> {
  const bitcoinConf = await bitcoinConfFile.read().const(effects)
  if (!bitcoinConf) return {}

  const peerSettings: PartialPeerSpec = {
    listen: bitcoinConf.listen,
    onlynet: bitcoinConf.onlynet
      ? [bitcoinConf.onlynet]
          .flat()
          .filter(
            (x): x is ValidNets =>
              x !== undefined && (validNets as readonly string[]).includes(x),
          )
      : onlynet,
    v2transport: bitcoinConf.v2transport,
    externalip:
      bitcoinConf.externalip === undefined ? 'none' : bitcoinConf.externalip,
    connectpeer: {
      selection: bitcoinConf.connect !== undefined ? 'connect' : 'addnode',
      value: {
        peers:
          bitcoinConf.connect !== undefined
            ? [bitcoinConf.connect]
                .flat()
                .filter((x): x is string => x !== undefined)
            : [bitcoinConf.addnode]
                .flat()
                .filter((x): x is string => x !== undefined),
      },
    },
  }

  return peerSettings
}

async function write(effects: T.Effects, input: peerSpec) {
  const peerSettings = {
    listen: input.listen,
    bind: input.listen ? '0.0.0.0:8333' : bind,
    v2transport: input.v2transport,
    onlynet: input.onlynet.length > 0 ? input.onlynet : onlynet,
    externalip: input.externalip !== 'none' ? input.externalip : externalip,
  }

  if (input.connectpeer.selection === 'connect') {
    Object.assign(peerSettings, { connect: input.connectpeer.value.peers })
    Object.assign(peerSettings, { addnode: addnode })
  } else if (input.connectpeer.selection === 'addnode') {
    Object.assign(peerSettings, { addnode: input.connectpeer.value.peers })
    Object.assign(peerSettings, { connect: connect })
  }

  await bitcoinConfFile.merge(effects, peerSettings)
}

type peerSpec = typeof peerSpec._TYPE
type PartialPeerSpec = typeof peerSpec._PARTIAL
