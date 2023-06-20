#!/bin/bash

set -ea

if [ $1 = "from" ]; then 
    echo '{"configured": true }'
    exit 0
elif [ $1 = "to" ]; then
    echo '{"configured": true }'
    exit 0
else
    echo "FATAL: Invalid argument: {from, to}. Migration failed." >&2
    exit 1
fi
