#!/bin/bash -e

ACTION=$1
DIR=$2

if [ "$ACTION" = "get" ]; then
    cat ${DIR}/start9/config.yaml
elif [ "$ACTION" = "set" ]; then
    if [ ! -f ${DIR}/start9/config.yaml ]
    then
        mkdir -p ${DIR}/start9
        touch ${DIR}/start9/config.yaml
        cat ${DIR}/start9/config.yaml
    else
        cat ${DIR}/start9/config.yaml
    fi
else
	echo 'action type of either "get" or "set" must exist'
	exit 1
fi
