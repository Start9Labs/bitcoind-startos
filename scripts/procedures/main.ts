import { types as T, util } from "../deps.ts";

export const main: T.ExpectedExports.main = async (effects) => {
  await effects.runDaemon(
    {
      command: "docker_entrypoint.sh",
      args: [],
    },
  ).wait();
  return util.ok;
};
