# BitBoxApp

This guide is adapted from <a href="https://shiftcrypto.support/help/en-us/14-privacy/29-how-to-connect-the-bitboxapp-to-my-own-full-node" target="_blank">Shiftcrypto</a>.

**Available For**

- Android
- Linux
- macOS
- Windows

**Instructions**

```admonish note

You will need to be [running Tor in the background](https://docs.start9.com/user-manual/connecting-remotely/tor.html#running-tor-in-the-background-on-your-phonelaptop) on your device.

```

1. Ensure you are running Tor in the background on your device

1. In the BitBoxApp sidebar, select `Settings > Enable tor proxy`.

1. Enable the proxy and confirm the proxy address (127.0.0.1:9050).

1. Restart BitBoxApp in order for the new settings to take effect.

1. In the BitBoxApp sidebar, select `Settings > Advanced settings > Connect your own full node`.

1. In the field `Enter the endpoint`, paste your electrs Tor URL and Port (found in `Electrs > Properties`). For example: `gwdllz5g7vky2q4gr45zGuvopjzf33czreca3a3exosftx72ekppkuqd.onion:50001`

1. Click "Check", and you will be prompted with the message "Successfully established a connection".

1. Click "Add" to add your node to the node list at the top of the page.

1. Remove the other servers if you want to exclusively connect to your own node.
