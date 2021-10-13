#!/bin/sh

set -e

username=$(yq e '.rpc.username' /root/.bitcoin/start9/config.yaml)
password=$(yq e '.rpc.password' /root/.bitcoin/start9/config.yaml)

if [ "$(curl -s --user $username:$password --data-binary '{"jsonrpc": "1.0", "id": "curltest", "method": "getblockchaininfo", "params": []}' -H 'content-type: text/plain;' http://bitcoind.embassy:8332/ | yq e '.result.initialblockdownload' -)" = "false" ]; then
    exit 0
else
    echo "Syncing blockchain. This may take several days..." >&2
    exit 61
fi
