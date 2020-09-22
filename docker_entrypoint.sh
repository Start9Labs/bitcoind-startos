#!/bin/bash

set -euo pipefail

export HOST_IP=$(ip -4 route list match 0/0 | awk '{print $3}')

# lighttpd -f /root/.bitcoin/httpd.conf
exec /usr/local/bin/bitcoind-manager
