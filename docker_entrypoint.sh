#!/bin/bash

set -euo pipefail

CONFIG_FILE="/root/.bitcoin/start9/config.yaml"
export EMBASSY_IP=$(ip -4 route list match 0/0 | awk '{print $3}')
export PEER_TOR_ADDRESS=$(yq e '.peer-tor-address' "$CONFIG_FILE")
export RPC_TOR_ADDRESS=$(yq e '.rpc-tor-address' "$CONFIG_FILE")

NGINX_CFG_FILE="/etc/nginx/http.d/default.conf"
NGINX_CFG='server {
    listen 8080;
    server_name _;
    root /var/www/bitcoin-node-manager/;

    location / {
        index index.php;
        try_files $uri $uri/ /index.php?$args;
    }

    location ~ \.php$ {
        fastcgi_pass 127.0.0.1:9000;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }
}
'
echo "$NGINX_CFG" > $NGINX_CFG_FILE

RPC_USER=$(yq e '.rpc.username' "$CONFIG_FILE")
RPC_PASSWORD=$(yq e '.rpc.password' "$CONFIG_FILE")
BNM_CFG_FILE="/var/www/bitcoin-node-manager/src/Config.php"
BNM_CFG='<?php
namespace App;

class Config {
    const PASSWORD = "'$RPC_PASSWORD'";
    const ACCESS_IP = "";

    const RPC_IP = "127.0.0.1";
    const RPC_PORT = "8332";
    const RPC_USER = "'$RPC_USER'";
    const RPC_PASSWORD = "'$RPC_PASSWORD'";

    const PEERS_GEO = true;
    const PEERS_GEO_TIMEOUT = 2;

    const DISPLAY_BLOCKS = 25;
    const DISPLAY_FORKS = 25;

    const PROXY_TYPE = "";
    const PROXY = "";
}
?>
'
echo "$BNM_CFG" > $BNM_CFG_FILE

cp /mnt/assets/hoster.json /var/www/bitcoin-node-manager/data
chown -R nginx:nginx /var/www/bitcoin-node-manager/data
 
php-fpm8
nginx

exec tini -p SIGTERM -- bitcoind-manager
