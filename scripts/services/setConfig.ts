import { ExpectedExports, Effects, Config, YAML, SetResult } from "../deps.ts";



export const setConfig: ExpectedExports.setConfig = async (effects: Effects, input: Config) => {
  await effects.createDir({
    path: "start9",
    volumeId: "main",
  });
  await effects.writeFile({
    path: "start9/config.yaml",
    toWrite: YAML.stringify(input),
    volumeId: "main",
  });

  const result: SetResult = {
    signal: "SIGTERM",
    "depends-on": {},
  }
  return { result };
}
