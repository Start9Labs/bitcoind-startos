***********************
Specter Desktop - Windows
***********************

Original Author: Community Member @julian

`Why Specter <https://github.com/cryptoadvance/specter-desktop/blob/master/README.md#why>`_

Step 1 - Install Tor on Windows
===============================

To install Tor and additionally setup Firefox to handle ``.onion`` addresses, see the instructions `here <https://docs.start9labs.com/misc-guides/tor-firefox/index.html>`_.

Step 2 - Configure Specter RPC user in Bitcoin Proxy
====================================================

- Connect to your Embassy via browser on your Windows computer. 

- Open the “Bitcoin Proxy” service

.. figure:: /docs/integrations/specter/assets/bitcoin_proxy_service.png
  :width: 70%
  :alt: Bitcoin Proxy 

- (optional) Copy Tor address (this will be needed in upcoming steps)

- In the Bitcoin Proxy service, under General, select “Config”

.. figure:: /docs/integrations/specter/assets/bitcoin_proxy_config.png
  :width: 90%
  :alt: Bitcoin Proxy Config submenu

  Select Config on the Service Detail page

- Click on “RPC Users”

.. figure:: /docs/integrations/specter/assets/bitcoin_proxy_rpc.png
  :width: 90%
  :alt: Bitcoin Proxy Config RPC User submenu

- Click on the “+” symbol in the upper-right corner to add a new user

.. figure:: /docs/integrations/specter/assets/bitcoin_proxy_add_rpc_user.png
  :width: 90%
  :alt: Bitcoin Proxy Config RPC submenu

- Create a user for the Specter app
- Replace default user, bitcoin, with name of choice, ex: specter
- Save password (this will be needed in upcoming steps)
- Go back twice, then save
- NOTE: ** Usernames can be duplicated. Having a default username pre-filled could cause confusion and the potential for multiple “bitcoin (default)” usernames **

- Go back and check the current list of users to confirm your user has been created.

.. figure:: /docs/integrations/specter/assets/bitcoin_proxy_confirm_rpc_user.png
  :width: 90%
  :alt: RPC user confirmation

- Download Specter-Setup-v[*.*.*].exe `here <https://github.com/cryptoadvance/specter-desktop/releases>`_.
- Install Specter
- If “Microsoft Defender SmartScreen” blocks the install, select “More info”

.. figure:: /docs/integrations/specter/assets/windows_smartscreen.png
  :width: 70%
  :alt: Windows Defender SmartScreen

- Then, select “Run Anyway”

.. figure:: /docs/integrations/specter/assets/windows_smart_screen_run.png
  :width: 70%
  :alt: Windows Defender SmartScreen

Connect Specter to Bitcoin Proxy
--------------------------------

- After installation, run Specter
- Click “Configure Node”

.. figure:: /docs/integrations/specter/assets/specter_configure_node.png
  :width: 90%
  :alt: Specter Configure Node

- Uncheck Auto-detect
- Insert the required information:
    - Username and password: created in previous steps (any user with bitcoin proxy access will work)
    - Host: Bitcoin proxy Tor address 
    - Port:8332
- Save
- Click Test 

.. figure:: /docs/integrations/specter/assets/specter_rpc_configuration.png
  :width: 90%
  :alt: Specter RPC configuration

  Select "Test" to ensure the credentials are working properly

- Ensure all tests pass

.. figure:: /docs/integrations/specter/assets/specter_test_results.png
  :width: 60%
  :alt: Specter RPC configuration test results view

*That's it!* Your Embassy's Bitcoin node is now connected to Specter. 

If you notice this message:

.. figure:: /docs/integrations/specter/assets/core_info_error.jpg
  :width: 60%
  :alt: Bitcoin Core Node info


``blockfilterindex`` is disabled for pruned Bitcoin Core nodes for now, so you won't be able to enable it on your embassy. Start9 is working on a workaround.