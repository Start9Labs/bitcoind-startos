## Description

If you already have a synced Bitcoin blockchain on one StartOS server, and would like to skip IBD on another StartOS server, follow this guide.

```admonish warning
This is an advanced feature and should be used with caution. Start9 is not responsible for any damage you might cause through SSH access.
```

## Instructions

1.  In this guide, we will refer to your synced node as `synced.local` and your unsynced node as `unsynced.local`. Simply replace these URLs with your own.

1.  In `unsynced.local` UI, install Bitcoin. _Do not configure or start it_.

1.  In `synced.local` UI:

    1.  Ensure you have already have an [SSH key](https://docs.start9.com/user-manual/ssh.html).

    1.  _Stop Bitcoin_.

1.  SSH into `synced.local`:

        ssh start9@synced.local

1.  Once inside the shell, run the following commands:

    ```
    sudo -i
    ```

    ```
    mkdir -m 0700 -p .ssh
    ```

    ```
    ssh-keygen -t ed25519 -N '' -f .ssh/temp.key
    ```

    ```
    chmod 600 .ssh/temp.key*
    ```

    ```
    cat .ssh/temp.key.pub
    ```

1.  Copy the output of the final `cat` command to your clipboard.

1.  In `unsynced.local` UI, go to `System > SSH > Add New Key`, and paste the value from above. Click "Submit"

1.  In `synced.local` shell, run the following commands, _replacing `unsynced.local` in the second command with the correct URL_:

    ```
    cd /embassy-data/package-data/volumes/bitcoind/data/main/
    ```

    ```
    sudo rsync -e "ssh -i ~/.ssh/temp.key" -povgr --append-verify --rsync-path="sudo mkdir -p /embassy-data/package-data/volumes/bitcoind/data/main ; sudo rsync" ./{blocks,chainstate} start9@unsynced.local:/embassy-data/package-data/volumes/bitcoind/data/main/
    ```

1.  Wait some hours until the copy is complete. On a gigabit network, the limiting factor will be the write speed of your SSD on the unsynced server.

1.  When the copy is complete, in `synced.local` shell, run the following commands:

    ```
    rm .ssh/unsynced.key*
    ```

    ```
    exit
    ```

1.  In `synced.local` UI, restart Bitcoin.

1.  In `unsynced.local` UI:

    - configure and start Bitcoin for the first time. You should see it begin at 99%+ pre-synced!

    - Delete the `temp.key` SSH key we added above.
