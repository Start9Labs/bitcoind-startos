# Bitcoin Core

## Getting Started

### Config

Your node is highly configurable. Many settings are considered _advanced_ and should be used with caution. For the vast majority of users and use-cases, we recommend using the defaults. This is where you can change RPC credentials as well. Once configured, you may start your node!

### Syncing

Depending on your Internet bandwidth, your node should take approximately 5-7 days to sync from genesis to present.

### Using a Wallet

Enter your QuickConnect QR code **OR** your raw RPC credentials (both located in `Properties`) into any wallet that supports connecting to a remote node over Tor. For a full list of compatible wallets, see <a href="https://github.com/start9labs/bitcoind-wrapper/blob/master/docs/wallets.md" target="_blank">https://github.com/start9labs/bitcoind-wrapper/blob/master/docs/wallets.md</a>.

## Pruning

Pruning is a process by which your node discards old blocks and transactions after it verifies them. Pruned nodes and archival nodes are both "full nodes" in that they are fully validating - they validate every block and transaction. Archival nodes store the entire blockchain and are useful to people interested in doing general or historical analysis, or being a provider of blockchain data to others (eg. a blockexplorer). 

The target of pruning on your Embassy is configurable and set by default to the minimum of 550MB (0.55 GB!), meaning the resulting blockchain will occupy a negligible amount of storage space. The maximum amount of blockchain data you can retain depends on the storage capacity your device. The config menu will not permit you to select a target that exceeds a certain percentage of your device's available capacity.

For most use cases, we recommend sticking with a very low pruning setting.
