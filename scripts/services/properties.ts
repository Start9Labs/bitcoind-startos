import { Effects, ExpectedExports, YAML } from "../deps.ts";

export const properties: ExpectedExports.properties = async (
  effects: Effects,
) => {
  return {
    result: YAML.parse(
      await effects.readFile({
        path: "start9/stats.yaml",
        volumeId: "main",
      }),
    ) as any,
  };
};
