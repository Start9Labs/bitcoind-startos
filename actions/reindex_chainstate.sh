#!/bin/sh

set -e

action_result_running="    {
    \"version\": \"0\",
    \"message\": \"Bitcoin Core restarting in reindex chainstate mode\",
    \"value\": null,
    \"copyable\": false,
    \"qr\": false
}"
action_result_stopped="    {
    \"version\": \"0\",
    \"message\": \"Bitcoin Core will reindex the chainstate the next time the service is started\",
    \"value\": null,
    \"copyable\": false,
    \"qr\": false
}"
action_result_pruned="    {
    \"version\": \"0\",
    \"message\": \"Bitcoin Core does not allow reindex-chainstate for pruned nodes. If the Chainstate is corrupted on a pruned node, the entire blockchain will need to be re-downloaded from genesis with the 'Reindex Blockchain' action\",
    \"value\": null,
    \"copyable\": false,
    \"qr\": false
}"

pruned=$(yq e '.advanced.pruning.mode' /root/.bitcoin/start9/config.yaml)

if [ "$pruned" != "disabled" ]; then
  echo $action_result_pruned
  else
    touch /root/.bitcoin/requires.reindex_chainstate
    bitcoin-cli -rpcconnect=bitcoind.embassy stop >/dev/null 2>/dev/null && echo $action_result_running || echo $action_result_stopped
fi