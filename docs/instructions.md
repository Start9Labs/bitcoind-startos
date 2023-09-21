# Bitcoin Core

## Getting Started

### Config

Your node is highly configurable. Many settings are considered _advanced_ and should be used with caution. For the vast majority of users and use-cases, we recommend using the defaults. This is where you can change RPC credentials as well. Once configured, you may start your node!

### Syncing

Depending on your Internet bandwidth, how many other services are running, and what peers your node happens to connect to, your node should take anywhere from 2-7 days to sync from genesis to present.

### Using a Wallet

Enter your QuickConnect QR code **OR** your raw RPC credentials (both located in `Properties`) into any wallet that supports connecting to a remote node over Tor. For a full list of compatible wallets, as well as guides for setup, please see <a href="https://github.com/start9labs/bitcoind-wrapper/blob/master/docs/wallets.md" target="_blank">https://github.com/start9labs/bitcoind-wrapper/blob/master/docs/wallets.md</a>.

## Pruning

Beginning in EOS v0.3.0, Bitcoin is now set to be an "archival" node by default.  This means that it will download and verify the entire blockchain, and will not "prune."  Be aware that this takes approximately 400GB as of early 2022.  If you enable the `txindex,` this will require an additional ~40GB.

Pruning is a process by which your node discards old blocks and transactions after it verifies them. Pruned nodes and archival nodes are both "full nodes" in that they are fully validating - they validate every block and transaction. Archival nodes store the entire blockchain and are useful to people interested in doing general or historical analysis, or being a provider of blockchain data to others (eg. a blockexplorer). They are also required for the best experience with many popular wallets and other Bitcoin tools.

**If you choose to prune**, the target on your Start9 server is configurable and set by default to the minimum of 550MB (0.55 GB!), meaning the resulting blockchain will occupy a negligible amount of storage space. The maximum amount of blockchain data you can retain depends on the storage capacity your device. The config menu will not permit you to select a target that exceeds a certain percentage of your device's available capacity.  For most use cases, we recommend sticking with a very low pruning setting.
