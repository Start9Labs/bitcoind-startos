import { matches, types, YAML } from "../dependencies.ts";
const { number } = matches;

export const setConfig: types.ExpectedExports.setConfig = async (
  effects: types.Effects,
  // deno-lint-ignore no-explicit-any
  newConfig: any
) => {
  if (newConfig.advanced.pruning.mode === "manual" && !newConfig.rpc.enable) {
    return {
      error: "RPC must be enabled for manual pruning.",
    };
  }

  if (newConfig.txindex && newConfig.advanced.pruning.mode !== "disabled") {
    return {
      error: "Txindex not allowed on pruned nodes.",
    };
  }

  if (
    newConfig.coinstatsindex &&
    newConfig.advanced.pruning.mode !== "disabled"
  ) {
    return {
      error: "Coinstats index not allowed on pruned nodes.",
    };
  }

  if (
    newConfig.advanced.blockfilters.peerblockfilters &&
    !newConfig.advanced.blockfilters.blockfilterindex
  ) {
    return {
      error:
        '"Compute Compact Block Filters" must be enabled if "Serve Compact Block Filters to Peers" is enabled.',
    };
  }

  await effects.createDir({
    path: "start9",
    volumeId: "main",
  });

  // config-set.sh

  const oldConfig = await effects
    .readFile({
      path: "start9/config.yaml",
      volumeId: "main",
    })
    .catch(() => null);
  if (oldConfig) {
    await effects.writeFile({
      path: "start9/config-old.yaml",
      toWrite: oldConfig,
      volumeId: "main",
    });
    const oldConfigParsed = YAML.parse(oldConfig) as any;
    const oldPruningTl = oldConfigParsed?.advanced?.pruning?.mode;
    let oldPruningSize = 0;
    if (oldPruningTl !== "disabled") {
      oldPruningSize = number.unsafeCast(
        oldConfigParsed?.advanced?.pruning?.size
      );
    }
    const newPruningTl = newConfig.advanced.pruning.mode;
    let newPruningSize = 0;
    if (newPruningTl !== "disabled") {
      newPruningSize = number.unsafeCast(newConfig?.advanced?.pruning?.size);
    }
    if (oldPruningTl == "disabled" || !oldPruningTl) {
      effects.debug("No reindex required");
    } else if (
      oldPruningTl === newPruningTl &&
      oldPruningSize >= newPruningSize
    ) {
      effects.debug("No reindex required");
    } else {
      effects.debug("Reindex required");
      await effects.writeFile({
        path: "start9/requires.reindex",
        toWrite: "",
        volumeId: "main",
      });
    }
  } else {
    effects.debug("No reindex required");
  }

  await effects.writeFile({
    path: "start9/config.yaml",
    toWrite: YAML.stringify(newConfig),
    volumeId: "main",
  });

  const result: types.SetResult = {
    signal: "SIGTERM",
    "depends-on": {},
  };
  return { result };
};
