#!/bin/bash

set -euo pipefail

CONFIG_FILE="/root/.bitcoin/start9/config.yaml"
export EMBASSY_IP=$(ip -4 route list match 0/0 | awk '{print $3}')
export PEER_TOR_ADDRESS=$(yq e '.peer-tor-address' "$CONFIG_FILE")
export RPC_TOR_ADDRESS=$(yq e '.rpc-tor-address' "$CONFIG_FILE")

if ! yq e '.advanced.ordifilter' "$CONFIG_FILE" > /dev/null 2>&1; then
  yq eval '.advanced.ordifilter = false' -i "$CONFIG_FILE"
fi

ORDIFILTER_ENABLED=$(yq e '.advanced.ordifilter' "$CONFIG_FILE")
VERSION="/opt/bitcoin-$(ls -dt /opt/bitcoin-* | head -n 1 | cut -d "-" -f 2)"

if [ "$ORDIFILTER_ENABLED" = "true" ]; then
  ln -sf $VERSION-ordifilter $VERSION
  echo -e "\n Ordinals spam filter enabled! \n"
else
  ln -sf $VERSION-vanilla $VERSION
fi

exec tini -p SIGTERM -- bitcoind-manager
