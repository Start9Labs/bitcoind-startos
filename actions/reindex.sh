#!/bin/sh

set -e

touch /root/.bitcoin/requires.reindex
bitcoin-cli stop 2>/dev/null && echo "Bitcoin Core restarting in reindex mode" || echo "Bitcoin Core will reindex the next time the service is started"
