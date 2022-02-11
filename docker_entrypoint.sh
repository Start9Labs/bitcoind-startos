#!/bin/bash

set -euo pipefail

export EMBASSY_IP=$(ip -4 route list match 0/0 | awk '{print $3}')
export PEER_TOR_ADDRESS=$(yq e '.peer-tor-address' /root/.bitcoin/start9/config.yaml)
export RPC_TOR_ADDRESS=$(yq e '.rpc-tor-address' /root/.bitcoin/start9/config.yaml)

# lighttpd -f /root/.bitcoin/httpd.conf
# exec /usr/local/bin/bitcoind-manager
exec tini -p SIGTERM -- bitcoind-manager
