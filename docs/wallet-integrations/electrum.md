# Electrum

```admonish warning

Completing this guide will _add_ your StartOS Electrum Server (electrs) to the list of servers used by Electrum. If, instead, you _only_ want to connect to your own server, ignoring all others, you will need to run Electrum in <a href="https://electrum.readthedocs.io/en/latest/tor.html" target="_blank">Single Server Mode</a> from the CLI.

```

**Available For**

- Mac
- Linux
- Windows
- Android/Graphene

**Instructions**

```admonish note

You will need to be [running Tor in the background](https://docs.start9.com/user-manual/connecting-remotely/tor.html#running-tor-in-the-background-on-your-phonelaptop) on your device.

```

1. Open Electrum and go to `Tools > Network` or, if you are running for the first time, choose "Select server manually," and click "Next".

1. Uncheck "Select server automatically", and enter your electrs Quick Connect URL (found in `Services > electrs > Properties`). Then click "Next".

1. Select "Use Tor" and "Use Proxy" and enter "127.0.0.1" for the address and "9050" for the port. Click "Next"

1. That's it! You will be prompted to create a wallet if this is your first time. You can check your connection by clicking the orb in the bottom right, which should be blue in color. If your server settings persist, you are connected.
