#!/bin/bash

set -e

username=$(yq e '.rpc.username' /root/.bitcoin/start9/config.yaml)
password=$(yq e '.rpc.password' /root/.bitcoin/start9/config.yaml)
gbci_result=$(curl -s --user $username:$password --data-binary '{"jsonrpc": "1.0", "id": "curltest", "method": "getblockchaininfo", "params": []}' -H 'content-type: text/plain;' http://bitcoind.embassy:8332/ )
error_code=$?
if [ $error_code -ne 0 ]; then
    echo $gbci_result >&2
    exit $error_code
fi

res=$(echo "$gbci_result" | yq e '.result' -)
err=$(echo "$gbci_result" | yq e '.error' -)
if [ "$res" = "null" ]; then
    # Starting
    exit 60
elif [ $(echo "$res" | yq e '.initialblockdownload' -) = "true" ]; then
    progress=$(echo "$res" | yq e '.verificationprogress' -)
    if [[ "$progress" = *"e"* ]]; then
        progress="0"
    fi
    progress_pct=$( bc -l <<<"100*$progress" )
    echo "Syncing blockchain. This may take several days. Progress: $(printf "%.2f" $progress_pct)%" >&2
    exit 61
fi
