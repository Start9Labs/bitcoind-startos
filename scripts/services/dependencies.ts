import { ExpectedExports, Config, matches } from "../deps.ts";

const { shape, arrayOf, string, boolean } = matches;

const matchProxyConfig = shape({
  users: arrayOf(
    shape(
      {
        name: string,
        "allowed-calls": arrayOf(string),
        password: string,
        "fetch-blocks": boolean,
      },
      ["fetch-blocks"]
    )
  ),
});

function times<T>(fn: (i: number) => T, amount: number): T[] {
  const answer = new Array(amount);
  for (let i = 0; i < amount; i++) {
    answer[i] = fn(i);
  }
  return answer;
}

function randomItemString(input: string) {
  return input[Math.floor(Math.random() * input.length)];
}

const serviceName = "c-lightning";
const fullChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
type Check = {
  currentError(config: Config): string | void;
  fix(config: Config): void;
};

const checks: Array<Check> = [
  {
    currentError(config) {
      if (!matchProxyConfig.test(config)) {
        return "Config is not the correct shape";
      }
      if (config.users.some((x) => x.name === serviceName)) {
        return;
      }
      return `Must have an RPC user named "${serviceName}"`;
    },
    fix(config) {
      config.users.push({
        name: serviceName,
        "allowed-calls": [],
        password: times(() => randomItemString(fullChars), 22).join(""),
      });
    },
  },
  ...[
    "echo",
    "gettxout",
    "getblockchaininfo",
    "sendrawtransaction",
    "getblockhash",
    "getblock",
    "getblockcount",
    "estimatesmartfee",
    "getnetworkinfo",
  ].map(
    (operator): Check => ({
      currentError(config) {
        if (!matchProxyConfig.test(config)) {
          return "Config is not the correct shape";
        }
        if (config.users.find((x) => x.name === serviceName)?.["allowed-calls"]?.some((x) => x === operator) ?? false) {
          return;
        }
        return `RPC user "c-lightning" must have "${operator}" enabled`;
      },
      fix(config) {
        if (!matchProxyConfig.test(config)) {
          throw new Error("Config is not the correct shape");
        }
        const found = config.users.find((x) => x.name === serviceName);
        if (!found) {
          throw new Error("Users for c-lightning should exist");
        }
        found["allowed-calls"] = [...(found["allowed-calls"] ?? []), operator];
      },
    })
  ),
  {
    currentError(config) {
      if (!matchProxyConfig.test(config)) {
        return "Config is not the correct shape";
      }
      if (config.users.find((x) => x.name === serviceName)?.["fetch-blocks"] ?? false) {
        return;
      }
      return `RPC user "c-lightning" must have "Fetch Blocks" enabled`;
    },
    fix(config) {
      if (!matchProxyConfig.test(config)) {
        throw new Error("Config is not the correct shape");
      }
      const found = config.users.find((x) => x.name === serviceName);
      if (!found) {
        throw new Error("Users for c-lightning should exist");
      }
      found["fetch-blocks"] = true;
    },
  },
];

const matchBitcoindConfig = shape({
  advanced: shape({
    pruning: shape({
      mode: string,
    }),
  }),
});

export const dependencies: ExpectedExports.dependencies = {
  "btc-rpc-proxy": {
    async check(effects, configInput) {
      effects.info("check btc-rpc-proxy");
      for (const checker of checks) {
        const error = checker.currentError(configInput);
        if (error) {
          effects.error(`throwing error: ${error}`);
          return { error };
        }
      }
      return { result: null };
    },
    async autoConfigure(effects, configInput) {
      effects.info("autoconfigure btc-rpc-proxy");
      for (const checker of checks) {
        const error = checker.currentError(configInput);
        if (error) {
          checker.fix(configInput);
        }
      }
      return { result: configInput };
    },
  },
  bitcoind: {
    async check(effects, configInput) {
      effects.info("check bitcoind");
      const config = matchBitcoindConfig.unsafeCast(configInput);
      if (config.advanced.pruning.mode !== "disabled") {
        return { error: 'Pruning must be disabled to use Bitcoin Core directly. To use with a pruned node, set Bitcoin Core to "Internal (Bitcoin Proxy)" instead.' };
      }
      return { result: null };
    },
    async autoConfigure(effects, configInput) {
      effects.info("autoconfigure bitcoind");
      const config = matchBitcoindConfig.unsafeCast(configInput);
      config.advanced.pruning.mode = "disabled";
      return { result: config };
    },
  },
};
