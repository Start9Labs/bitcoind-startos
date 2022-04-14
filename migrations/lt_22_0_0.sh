#!/bin/bash

set -ea

if [ $1 = "from" ]; then 
    yq -i '.advanced.peers.addnode |= map(select(.hostname != ~ or . == "*"))' /root/.bitcoin/start9/config.yaml
    yq -i '.advanced.peers.addnode.[] |= {"hostname":., "port":~}' /root/.bitcoin/start9/config.yaml
    yq -i '(.advanced.blockfilters.blockfilterindex, .advanced.blockfilters.peerblockfilters) = false' /root/.bitcoin/start9/config.yaml
    echo '{"configured": true }'
    exit 0
elif [ $1 = "to" ]; then
    yq -i '.advanced.peers.addnode |= map_values(.hostname)' /root/.bitcoin/start9/config.yaml
    yq -i 'del(.advanced.blockfilters)' /root/.bitcoin/start9/config.yaml
    echo '{"configured": true }'
    exit 0
else
    echo "FATAL: Invalid argument: {from, to}. Migration failed." >&2
    exit 1
fi
