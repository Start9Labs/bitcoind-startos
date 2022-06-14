import {
  Config,
  Effects,
  ExpectedExports,
  matches,
  SetResult,
  YAML,
} from "../deps.ts";
const { number } = matches;

export const setConfig: ExpectedExports.setConfig = async (
  effects: Effects,
  newConfig: Config,
) => {
  if (!(newConfig?.rpc?.enable || !(newConfig.advanced?.mode === "manual"))) {
    return {
      error: "RPC must be enabled for manual.",
    };
  }
  if (
    !(!newConfig.txindex || (newConfig.advanced?.pruning?.mode === "disabled"))
  ) {
    return {
      error: "Txindex not allowed on pruned nodes.",
    };
  }
  // true, false only fail case
  if (
    !(!newConfig.advanced.blockfilters.peerblockfilters ||
      (newConfig.advanced.blockfilters.blockfilterindex))
  ) {
    return {
      error:
        "'Compute Compact Block Filters' must be enabled if 'Serve Comopact Block Filters to Peers' is enabled.",
    };
  }

  // config-set.sh

  const oldConfig = await effects.readFile({
    path: "start9/config.yaml",
    volumeId: "main",
  }).catch(() => "");
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
        oldConfigParsed?.advanced?.pruning?.size,
      );
    }
    const newPruningTl = newConfig.advanced.pruning.mode;
    let newPruningSize = 0;
    if (newPruningTl !== "disabled") {
      newPruningSize = number.unsafeCast(newConfig?.advanced?.pruning?.size);
    }
    if (oldPruningTl == "disabled") effects.debug("No reindex required");
    else if (
      oldPruningTl === newPruningTl && oldPruningSize >= newPruningSize
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

    effects.debug("Reindex required");
    await effects.writeFile({
      path: "start9/requires.reindex",
      toWrite: "",
      volumeId: "main",
    });
  }

  await effects.createDir({
    path: "start9",
    volumeId: "main",
  });
  await effects.writeFile({
    path: "start9/config.yaml",
    toWrite: YAML.stringify(newConfig),
    volumeId: "main",
  });

  const result: SetResult = {
    signal: "SIGTERM",
    "depends-on": {},
  };
  return { result };
};
