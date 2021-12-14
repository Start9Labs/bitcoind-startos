#!/bin/bash

# set -e

gi_result=$(bitcoin-cli -getinfo 2>&1)
error_code=$?

if [[ "$error_code" == "28" ]]; then
    # Starting
    exit 60
else
    echo $gi_result >&2
    exit $error_code
fi
