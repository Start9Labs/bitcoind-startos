# Fully Noded

**Available For**

- Mac
- iOS

**Instructions**

```admonish note

Fulled Noded does not currently support `https` and recommends [using Tor](../../../user-manual/connecting-remotely/tor.md). This means it is not possible to connect to Bitcoin Core/Knots over LAN or Router VPN. You can however connect to Bitcoin Core/Knots over its Tor interface.

```
1. Make sure you're [running Tor](../../../user-manual/connecting-remotely/tor.md).

1. If this is your first time using Fully Noded, you will be presented with a option to `Connect my node`. Otherwise, you can find the server setup in `Configuration (Cog icon) > Node Manage > +`.

1. Choose `Bitcoin Core`. Fully Noded will generate RPC credentials. But we will not use these. Click OK to begin editing the credentials.

1. Provide a label, then enter an address from `Services > Bitcoin Core/Knots` then the Interfaces section, including the port `8332` but excluding the protocol `http://`)

1. In StartOS, go to `Services > Bitcoin Core/Knots > Actions > Generate RPC Credentials` and enter a username such as "fullynoded" then click Submit. You will see a password was generated. Copy the password to clipboard by clicking on the copy icon.

1. Back in Fully Noded, type the RPC username you chose above into the `RPC username` field. Paste the generated password from Bitcoin into the `RPC authentication` field.

1. Click Save, Back out, and make sure the toggle is on for the node that you just created. Visit the first tab to confirm you are connected.
