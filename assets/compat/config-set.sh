#!/bin/sh
# The general approach here is to diff the old and new configs and if there is a "relevant" change to pruning, defined
# as an extension of retained data, we should start with the reindex process
DATA_DIR=/root/.bitcoin

# gather old info
cp $DATA_DIR/start9/config.yaml $DATA_DIR/start9/config-old.yaml
OLD_PRUNING_TL=$(cat $DATA_DIR/start9/config-old.yaml | grep -A2 "pruning" | tail -n 2 | head -n 1 | cut -d ':' -f 2 | tr -d ' ')
if [ "$OLD_PRUNING_TL" != "disabled" ]
then
    OLD_PRUNING_SIZE=$(cat $DATA_DIR/start9/config-old.yaml | grep -A2 pruning | tail -n 1 | cut -d ':' -f 2 | tr -d ' ')
fi

# set new config
COMPAT_RES=$(compat config set bitcoind /root/.bitcoin /mnt/assets/config_rules.yaml)

# gather new info
NEW_PRUNING_TL=$(cat $DATA_DIR/start9/config.yaml | grep -A2 "pruning" | tail -n 2 | head -n 1 | cut -d ':' -f 2 | tr -d ' ')
if [ "$NEW_PRUNING_TL" != "disabled" ]
then
    NEW_PRUNING_SIZE=$(cat $DATA_DIR/start9/config.yaml | grep -A2 pruning | tail -n 1 | cut -d ':' -f 2 | tr -d ' ')
fi

# if the old prune config was disabled, no action required
if [ "$OLD_PRUNING_TL" = "disabled" ]
then
    >&2 echo No reindex required
# if they are the same, and the new prune cache size is reduced, no action required
elif [ "$OLD_PRUNING_TL" = "$NEW_PRUNING_TL" ] && [ "$OLD_PRUNING_SIZE" -ge "$NEW_PRUNING_SIZE" ]
then
    >&2 echo No reindex required
else
    >&2 echo Reindex required
    touch $DATA_DIR/requires.reindex
fi
echo "$COMPAT_RES"