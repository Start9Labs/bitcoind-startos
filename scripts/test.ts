import { setConfigMatcher } from "./models/setConfig.ts";

let badInput = {
  "alias": null,
  "color": "c9cd11",
  "bitcoind": { "type": "internal-proxy", "user": null, "password": null },
  "rpc": {
    "enabled": true,
    "user": "lightning",
    "password": "m5TFL0oFIiEySbgx8ioWqx",
  },
  "advanced": {
    "tor-only": false,
    "fee-base": 1000,
    "fee-rate": 1,
    "min-capacity": 10000,
    "ignore-fee-limits": false,
    "funding-confirms": 3,
    "cltv-delta": 40,
    "wumbo-channels": false,
    "experimental": {
      "dual-fund": false,
      "onion-messages": false,
      "offers": false,
      "shutdown-wrong-funding": false,
    },
    "plugins": {
      "http": true,
      "rebalance": false,
      "summary": false,
      "rest": true,
    },
  },
  "peer-tor-address":
    "nvsmwoxem2eyxnr3adh7fepm2n53w6pq6dygjxlzxwcvxhd2oodgchid.onion",
  "rpc-tor-address":
    "owo7vbaveribz7setag36ezwy3xxg2asfdy3gjqddpttofhv7l7usyqd.onion",
};

setConfigMatcher.unsafeCast(badInput);
