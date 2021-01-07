***********************
Specter Desktop - MacOS
***********************

Original Author: Community Member `@Chiefmonkey <https://twitter.com/HodlrDotRocks>`_

The Tor address provided by the Bitcoin service can be used in the configuration settings for `Specter Desktop <https://github.com/cryptoadvance/specter-desktop>`_.

This guide was written for MacOS on Catalina 10.15.7.

Step 1 - Install Homebrew
=========================

If you do not have Homebrew installed, go to https://brew.sh/ and install it by opening up the command line editor (Terminal) and cut’n’paste the line from Homebrew that looks like this:

``/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install.sh)"``

It will ask you for your system password before it installs:

.. figure:: /docs/integrations/specter/assets/install-homebrew.png
  :width: 90%
  :alt: Homebrew installation

It will tell you which directories it is going to create and hit ``return``:

.. figure:: /docs/integrations/specter/assets/install-homebrew1.png
  :width: 90%
  :alt: Homebrew directories

It creates the directories and downloads any other files it needs e.g. “Command Line Tool for Xcode” and “Homebrew”.
Wait 5 minutes whilst it downloads and installs what it needs.

Surprisingly, Homebrew uses Google Analytics to collect anonymous usage data. You can deselect the option to share usage data `by opting out <https://docs.brew.sh/Analytics#opting-out>`_.


Step 2 - Install Tor
====================

.. note:: If you have the Tor Browser is open, close it.

In the command line type: ``brew install tor``

See `the tor project <https://2019.www.torproject.org/docs/tor-doc-osx.html.en>`_ for more details.

Once it is finished you have the following options:

.. figure:: /docs/integrations/specter/assets/install_tor.png
  :width: 90%
  :alt: Install Tor

It is recommended to use `brew services start tor` so that Tor is always running, even after a restart of your computer.


Step 3 - Download and Configure Specter
=======================================

`Download <https://specter.solutions/>`_ specter at the latest release version (currently v0.10.1).

Drag and drop the Specter icon into Applications once downloaded.

Launch Specter.

**Notice the Tor icon in the top right corner. *Do not turn it on*. You already have Tor running on your computer, there is no reason to also enable it in Specter.**

Click ``Connect Specter to your Bitcoin node`` .

.. figure:: /docs/integrations/specter/assets/welcome.png
  :width: 75%
  :alt: Welcome

Disable "Auto-detect" and enter your Embassy Bitcoin node Tor address and RPC credentials as shown below. Your RPC credentials can be found in the `Config` section.

.. figure:: /docs/integrations/specter/assets/add-node.png
  :width: 75%
  :alt: Add node

Click “Test”. It can take a few minutes. If all is well several green checkboxes will appear and some config settings.

Click “Save”.

Have a beer and some tacos before journeying further into the rabbit hole.
