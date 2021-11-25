#!/bin/bash

# set -e

gi_result=$(bitcoin-cli -getinfo 2>&1)
error_code=$?

if [[ "$error_code" == "28" ]]; then
    # Starting
    exit 60
fi

exit $error_code
