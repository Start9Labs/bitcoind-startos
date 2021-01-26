# Specter Desktop - Windows

Original Author: Community Member @julian

[Why Specter](https://github.com/cryptoadvance/specter-desktop/blob/master/README.md#why)

## Step 1 - Install Tor on Windows

:warning: **DO NOT PROCEED** before [installing Tor](https://docs.start9labs.com/misc-guides/tor-os/index.html) on your machine!

## Step 2 - Configure Specter RPC user in Bitcoin Proxy

- Connect to your Embassy via browser on your Windows computer. 

- Open the “Bitcoin Proxy” service

![Bitcoin Proxy Service](./assets/bitcoin_proxy_service.png "Select the Bitcoin Proxy Service")

- (optional) Copy Tor address (this will be needed in upcoming steps)

- In the Bitcoin Proxy service, under General, select “Config”

![Bitcoin Proxy Config submenu](./assets/bitcoin_proxy_config.png "Select Config on the Service Detail page")

- Click on “RPC Users”

![Bitcoin Proxy Config RPC User submenu](./assets/bitcoin_proxy_rpc.png "Bitcoin Proxy Config RPC User submenu")

- Click on the “+” symbol in the upper-right corner to add a new user

![Bitcoin Proxy Config RPC submenu](./assets/bitcoin_proxy_add_rpc_user.png "Bitcoin Proxy Config RPC submenu")

- Create a user for the Specter app
- Replace default user, bitcoin, with name of choice, ex: specter
- Save password (this will be needed in upcoming steps)
- Go back twice, then save
- Go back and check the current list of users to confirm your user has been created.

![RPC user confirmation](./assets/bitcoin_proxy_confirm_rpc_user.png "RPC user confirmation")

- Download Specter-Setup-v[*.*.*].exe [here](https://github.com/cryptoadvance/specter-desktop/releases)
- Install Specter
- If “Microsoft Defender SmartScreen” blocks the install, select “More info”

![Windows Defender SmartScreen](./assets/windows_smartscreen.png "Windows Defender SmartScreen")

- Then, select “Run Anyway”

![Windows Defender SmartScreen](./assets/windows_smart_screen_run.png "Windows Defender SmartScreen")

Connect Specter to Bitcoin Proxy
--------------------------------

- After installation, run Specter
- Click “Configure Node”

![Specter Configure Node](./assets/specter_configure_node.png "Specter Configure Node")

- Uncheck Auto-detect
- Insert the required information:
    - Username and password: created in previous steps (any user with bitcoin proxy access will work)
    - Host: Bitcoin proxy Tor address 
    - Port:8332
- Save
- Click Test 

![Specter RPC configuration](./assets/specter_rpc_configuration.png "Select 'Test' to ensure the credentials are working properly")  

- Ensure all tests pass

![Specter RPC configuration test results view](./assets/specter_test_results.png "Specter RPC configuration test results view")

**That's it!** Your Embassy's Bitcoin node is now connected to Specter. 

### Note:
If you notice this message:

![Bitcoin Core Node info](./assets/core_info_error.jpg "Bitcoin Core Node info")

Currently, ``blockfilterindex`` is disabled for pruned Bitcoin Core nodes, so you won't be able to enable it on your Embassy. Start9 is working on a workaround.