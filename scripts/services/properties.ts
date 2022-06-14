import { matches, Effects, YAML, ExpectedExports, PackagePropertiesV2, Properties } from "../deps.ts";
import { lazy } from "../models/lazy.ts";
import { setConfigMatcher } from "../models/setConfig.ts";
import { getAlias } from "./getAlias.ts";
const { shape, string, boolean } = matches;

const nodeInfoMatcher = shape({
  id: string,
  alias: string,
}, ['alias']);

const propertiesConfigMatcher = shape({
  rpc: shape({
    enabled: boolean,
    user: string,
    password: string,
  }),
  advanced: shape({
    plugins: shape({
      rest: boolean,
    }),
  }),
});

export const properties: ExpectedExports.properties = async (effects: Effects) => {
  const nodeInfo = nodeInfoMatcher.unsafeCast(
    await effects.readJsonFile({
      volumeId: "main",
      path: "start9/lightningGetInfo",
    })
  );
  const peerTorAddress = await effects
    .readFile({
      volumeId: "main",
      path: "start9/peerTorAddress",
    })
    .then((x) => x.trim());
  const config = setConfigMatcher.unsafeCast(
    YAML.parse(
      await effects.readFile({
        path: "start9/config.yaml",
        volumeId: "main",
      })
    )
  );
  const macaroonBase64 = lazy(() =>
    effects.readFile({
      path: "start9/access.macaroon.base64",
      volumeId: "main",
    })
  );
  const hexMacaroon = lazy(() =>
    effects.readFile({
      path: "start9/access.macaroon.hex",
      volumeId: "main",
    })
  );

  const rpcProperties: PackagePropertiesV2 = !config.rpc.enabled
    ? {}
    : {
      "Quick Connect URL": {
        type: "string",
        value: `clightning-rpc://${config.rpc.user}:${config.rpc.password}@${peerTorAddress}:8080`,
        description: "A convenient way to connect a wallet to a remote node",
        copyable: true,
        qr: true,
        masked: true,
      },
      "RPC Username": {
        type: "string",
        value: config.rpc.user,
        description: "Username for RPC connections",
        copyable: true,
        qr: false,
        masked: true,
      },
      "RPC Password": {
        type: "string",
        value: config.rpc.password,
        description: "Password for RPC connections",
        copyable: true,
        qr: false,
        masked: true,
      },
    };

  const restProperties: PackagePropertiesV2 = !config.advanced.plugins.rest
    ? {}
    : {
      "Rest API Port": {
        type: "string",
        value: "3001",
        description: "The port your c-lightning-REST API is listening on",
        copyable: true,
        qr: false,
        masked: false,
      },
      "Rest API Macaroon": {
        type: "string",
        value: await macaroonBase64.val(),
        description: "The macaroon that grants access to your node's REST API plugin",
        copyable: true,
        qr: false,
        masked: true,
      },
      "Rest API Macaroon (Hex)": {
        type: "string",
        value: await hexMacaroon.val(),
        description: "The macaroon that grants access to your node's REST API plugin, in hexadecimal format",
        copyable: true,
        qr: false,
        masked: true,
      },
    };
  const alias = await getAlias(effects, config)
  const result: Properties = {
    version: 2 as 2,
    data: {
      "Node Id": {
        type: "string",
        value: nodeInfo.id,
        description: "The node identifier that can be used for connecting to other nodes",
        copyable: true,
        qr: false,
        masked: false,
      },
      "Node Uri": {
        type: "string",
        value: `${nodeInfo.id}@${peerTorAddress}`,
        description: "Enables connecting to another remote node",
        copyable: true,
        qr: true,
        masked: true,
      },
      "Node Alias": {
        type: "string",
        value: alias,
        description: "The friendly identifier for your node",
        copyable: true,
        qr: false,
        masked: false,
      },
      ...rpcProperties,
      ...restProperties,
    },
  };
  return { result }
}
