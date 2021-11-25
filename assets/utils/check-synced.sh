#!/bin/sh

set -e

username=$(yq e '.rpc.username' /root/.bitcoin/start9/config.yaml)
password=$(yq e '.rpc.password' /root/.bitcoin/start9/config.yaml)
gbci_result=$(curl -s --user $username:$password --data-binary '{"jsonrpc": "1.0", "id": "curltest", "method": "getblockchaininfo", "params": []}' -H 'content-type: text/plain;' http://bitcoind.embassy:8332/ )
res=$(echo "$gbci_result" | yq e '.result' -)
err=$(echo "$gbci_result" | yq e '.error' -)

# echo $gbci_result
# echo $res
# echo $err
if [[ "$res" == "null" ]]; then
    # Starting
    exit 60
elif [ $(echo "$res" | yq e '.initialblockdownload' -) = "false" ]; then
    exit 0
else
    echo "Syncing blockchain. This may take several days..." >&2
    exit 61
fi
