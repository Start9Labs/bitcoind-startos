#!/bin/sh

if [ "$#" -ne 2 ]; then
    echo "Usage: $0 <username> <password>"
    exit 1
fi

username="$1"
password="$2"

expect <<EOF
spawn python3 rpcauth.py "$username" -
expect "Password: "
send "$password\n"
expect eof
EOF