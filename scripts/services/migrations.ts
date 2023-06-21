import { compat, types as T } from "../dependencies.ts";

function asArray(input: unknown): unknown[] {
  if (Array.isArray(input)) {
    return input;
  } else {
    return [];
  }
}

function asObject(input: unknown): T.Config {
  if (typeof input === "object" && input) {
    return input as T.Config;
  } else {
    return {};
  }
}

function safeDeref(config: unknown, path: string[]): unknown {
  let cur = config;
  for (const seg of path) {
    cur = asObject(config)[seg];
  }
  return cur;
}

function safeAssign(
  config: unknown,
  path: [string, ...string[]],
  value: unknown
) {
  let cur = config;

  const last = path.pop()!;

  for (const seg of path) {
    cur = asObject(config)[seg];
  }

  asObject(cur)[last] = value;
}

function safeDelete(config: unknown, path: [string, ...string[]]) {
  let cur = config;

  const last = path.pop()!;

  for (const seg of path) {
    cur = asObject(config)[seg];
  }

  delete asObject(cur)[last];
}

export const migration: T.ExpectedExports.migration =
  compat.migrations.fromMapping(
    {
      "22.0.0": {
        up: compat.migrations.updateConfig(
          (config) => {
            safeAssign(
              config,
              ["advanced", "peers", "addnode"],
              asArray(safeDeref(config, ["advanced", "peers", "addnode"]))
                .map((node) => {
                  if (typeof node === "string") {
                    return { hostname: node, port: null };
                  }
                })
                .filter((a) => !!a)
            );

            safeAssign(
              config,
              ["advanced", "blockfilters", "blockfilterindex"],
              false
            );
            safeAssign(
              config,
              ["advanced", "blockfilters", "peerblockfilters"],
              false
            );

            return config;
          },
          false,
          { version: "22.0.0", type: "up" }
        ),
        down: compat.migrations.updateConfig(
          (config) => {
            safeAssign(
              config,
              ["advanced", "peers", "addnode"],
              asArray(safeDeref(config, ["advanced", "peers", "addnode"]))
                .map((node) => {
                  if (typeof node === "string") {
                    return { hostname: node, port: null };
                  }
                })
                .filter((a) => !!a)
            );
            safeDelete(config, ["advanced", "blockfilters"]);

            return config;
          },
          false,
          {
            version: "22.0.0",
            type: "down",
          }
        ),
      },
      "22.0.1": {
        up: compat.migrations.updateConfig(
          (config) => {
            safeAssign(
              config,
              ["advanced", "peers", "addnode"],
              asArray(safeDeref(config, ["advanced", "peers", "addnode"]))
                .map((node) => {
                  if (typeof node === "string") {
                    return { hostname: node, port: null };
                  } else if (
                    typeof node === "object" &&
                    node &&
                    "hostname" in node
                  ) {
                    return { hostname: node.hostname, port: null };
                  }
                })
                .filter((a) => !!a)
            );

            return config;
          },
          false,
          { version: "22.0.1", type: "up" }
        ),
        down: compat.migrations.updateConfig((config) => config, true, {
          version: "22.0.1",
          type: "down",
        }),
      },
      "23.0.0": {
        up: compat.migrations.updateConfig(
          (config) => {
            safeAssign(
              config,
              ["advanced", "bloomfilters", "peerbloomfilters"],
              false
            );

            return config;
          },
          false,
          { version: "23.0.0", type: "up" }
        ),
        down: compat.migrations.updateConfig(
          (config) => {
            safeDelete(config, [
              "advanced",
              "bloomfilters",
              "peerbloomfilters",
            ]);

            return config;
          },
          false,
          { version: "23.0.0", type: "down" }
        ),
      },
      "24.0.0": {
        up: compat.migrations.updateConfig(
          (config) => {
            safeAssign(config, ["advanced", "mempoolfullrbf"], false);

            return config;
          },
          false,
          { version: "24.0.0", type: "up" }
        ),
        down: compat.migrations.updateConfig(
          (config) => {
            safeDelete(config, ["advanced", "mempoolfullrbf"]);

            return config;
          },
          false,
          { version: "24.0.0", type: "down" }
        ),
      },
      "25.0.0": {
        up: compat.migrations.updateConfig(
          (config: any) => {
            delete config["zmq-enabled"];

            delete config.rpc.advanced?.serialversion;
            config.rpc = {
              ...config.rpc,
              ...config.rpc?.advanced,
            };
            delete config.rpc?.advanced;

            config.mempool = config.advanced?.mempool;
            delete config.advanced?.mempool;

            config.peers = config.advanced?.peers;
            delete config.advanced?.peers;

            if (config.advanced?.pruning?.mode === "manual") {
              config.advanced.pruning = { mode: "automatic", size: 550 };
            }

            return config;
          },
          true,
          { version: "25.0.0", type: "up" }
        ),
        down: compat.migrations.updateConfig(
          (config: any) => {
            config["zmq-enabled"] = true;

            config.rpc.advanced.serialversion = "segwit";
            config.rpc.advanced = {
              auth: config.rpc.auth,
              servertimeout: config.rpc.servertimeout,
              threads: config.rpc.threads,
              workqueue: config.rpc.workqueue,
            };
            delete config.rpc.auth;
            delete config.rpc.servertimeout;
            delete config.rpc.threads;
            delete config.rpc.workqueue;

            config.advanced.mempool = config.mempool;
            delete config.mempool;

            config.advanced.peers = config.peers;
            delete config.peers;

            return config;
          },
          true,
          { version: "25.0.0", type: "down" }
        ),
      },
    },
    "25.0.0"
  );
