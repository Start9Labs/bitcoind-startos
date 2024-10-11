#!/bin/bash

# set -e

gi_result=$(bitcoin-cli getrpcinfo 2>&1)
error_code=$?

if [ "$error_code" -eq 28 ]; then
    # Starting
    exit 60
else
    echo $gi_result >&2
    exit $error_code
fi
