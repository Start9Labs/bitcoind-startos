import { matches, Effects, YAML, ExpectedExports, PackagePropertiesV2, Properties } from "../deps.ts";
import { lazy } from "../models/lazy.ts";
import { getAlias } from "./getAlias.ts";
const { shape, string, boolean, dictionary, any } = matches;


const matchConfig = dictionary([string, any]);

export const properties: ExpectedExports.properties = async (effects: Effects) => {
  return YAML.parse(
    await effects.readFile({
      path: "start9/stats.yaml",
      volumeId: "main",
    })
  ) as any

  const config = matchConfig.unsafeCast(
    YAML.parse(
      await effects.readFile({
        path: "start9/config.yaml",
        volumeId: "main",
      })
    )
  );

  /// TODO Fill this file during startup with the environment variables
  const environmentVariables = matchConfig.unsafeCast(
    YAML.parse(
      await effects.readFile({
        path: "start9/environment.yaml",
        volumeId: "main",
      })
    )
  );
  const rpcAddress = environmentVariables['RPC_TOR_ADDRESS']
  const data: { [key: string]: any } = {};
  if (string.test(config?.rpc?.username) && string.test(config?.rpc?.password)) {
    data['Tor Quick Connect'] = {
      "value_type": "string",
      value: `btcstandup://${config.rpc.username}:${config.rpc.password}@${rpcAddress}:8332`
    }
  }
  const result: Properties = {
    version: 2 as 2,
    data
  };
  return { result }
}
