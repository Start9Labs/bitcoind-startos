#!/bin/sh

set -e

touch /root/.bitcoin/requires.reindex
action_result_running="    {
    \"version\": \"0\",
    \"message\": \"Bitcoin Core restarting in reindex mode\",
    \"value\": null,
    \"copyable\": false,
    \"qr\": false
}"
action_result_stopped="    {
    \"version\": \"0\",
    \"message\": \"Bitcoin Core will reindex the next time the service is started\",
    \"value\": null,
    \"copyable\": false,
    \"qr\": false
}"
bitcoin-cli -rpcconnect=bitcoind.embassy stop 2>/dev/null && echo $action_result_running || echo $action_result_stopped
