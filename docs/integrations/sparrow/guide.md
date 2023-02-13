# Sparrow Wallet Setup Guide

You have two options for connecting Sparrow directly to Bitcoin's RPC: LAN (.local) and Tor (.onion).  LAN of course only works on the lan but is very fast, while Tor works remotely but is slow.  Switching between them is just a matter of changing .local to .onion (or vice versa) and switching the Tor proxy off or on, respectively.

If you use tor, you will need to have Tor running natively on your device in order to use Sparrow remotely.  You can find the relevant setup documentation in the Resources section at the bottom of this page.

# Configuring Sparrow to use the Bitcoin Core RPC

1. First install the Bitcoin Core service to your Embassy from the Start9 Marketplace.

2. Configure Bitcoin Core and allow it to begin the Initial Blockchain Download if you have not already.  You may continue even if this is still in progress, but you will need to let the sync complete before creating your first transaction.  Bitcoin Core MUST have the "Enable Wallet" feature turned on.  This is found in *Bitcoin Core > Config > Wallet*.

3. Next, [download](https://sparrowwallet.com/download/), install, and launch Sparrow.  If this is the first time you have run Sparrow, you will be guided to a screen where you will be asked to configure your Bitcoin server.  Otherwise, you can find the server setup in Preferences.  Select the option for "Bitcoin Core" as the **Server** Type:

    ![Sparrow Server Setup](./assets/sparrow-server-setup2.png "Setup Your Bitcoin Server")

5. From your Embassy's Bitcoin Core service page, click "Interfaces," and copy the `Tor Address` under **RPC Interface**.  Paste this into Sparrow's "URL" field, removing the `http://` prefix, as Sparrow will not accept it.  In the "Port" field, type `443`:

    ![Sparrow Server Setup](./assets/sparrow-server-setup3.png "Enter URL & Port")

    **Note**: Use port `8332` if you are using your Tor Address.

6. Select "User/Pass" as the Authentication method.  Return to the Bitcoin Core service page again, and click "Properties" -> "RPC Username".  Copy the username and insert it into the **User** field in Sparrow.  Do the same for the "RPC Password":

    ![Bitcoin RPC Credentials](./assets/sparrow-server-setup4-rpc-user-pass.png "Copy Bitcoin RPC Username and Password")
    ![Sparrow Server Setup](./assets/sparrow-server-setup4.png "Add RPC User & Password to Sparrow")

7. OPTIONAL - Only applies if you are using the .onion: Select "Use Proxy," and enter the default values of `localhost` and `9050` for the URL and Port, respectively:

    ![Sparrow Server Setup](./assets/sparrow-server-setup5.png "Use Tor Proxy")

    **Note**: If you are using the .local, leave "Use Proxy" **disabled**.

8. Finally, click "Test Connection" to verify that you are able to reach your Bitcoin node.  If your node is not yet synced, Sparrow will let you know it's not fully ready to be connected to.  Otherwise, you should just see a Satoshi message:

    ![Sparrow Server Setup](./assets/sparrow-server-setup6.png "Test Connection")

From here you can click **[Close]** complete your wallet setup and begin using Sparrow Wallet!


## Using an Electrum Server

Electrs on Embassy:

https://github.com/Start9Labs/electrs-wrapper/blob/master/docs/integrations/sparrow/guide.md

## Resources

[Run Tor on Your Device](https://start9.com/latest/user-manual/connecting/connecting-tor/tor-os/)

[Sparrow Wallet](https://sparrowwallet.com/)
