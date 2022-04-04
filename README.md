# Wrapper for Bitcoin Core

This project wraps [Bitcoin](https://bitcoin.org) for EmbassyOS. Bitcoin uses peer-to-peer technology to operate with no central authority or banks - managing transactions and the issuing of bitcoins is carried out collectively by the network. 

## Contributing

We welcome contributions from all!

For non-technical contributors, please use the `Issues` section above to communicate your desired edits or additions.

For technical contributors, please fork this repository, make your changes according to the instructions below, and open a pull reuqest.

### Adding Config Options

To add config options, include the new config options in *both* `config_spec.yaml` and `assets/bitcoin.conf.template`, adhering to the syntax and conventions of those files. To view the full list of config options, complete with descriptions and specifications, check out this [site](https://jlopp.github.io/bitcoin-core-config-generator) from Jameson Lopp.

## Dependencies

Install the following system dependencies to build this project by following the instructions on the provided links:

- [docker](https://docs.docker.com/get-docker)
- [docker-buildx](https://docs.docker.com/buildx/working-with-buildx/)
- [rust-musl-cross](https://github.com/Start9Labs/rust-musl-cross)
- [yq](https://mikefarah.gitbook.io/yq)
- [rust](https://rustup.rs)
- [embassy-sdk](https://github.com/Start9Labs/embassy-os/blob/master/backend/install-sdk.sh)
- [make](https://www.gnu.org/software/make/)

## Cloning

Clone the project locally. Note the submodule link to the original project(s). 

```
git clone git@github.com:Start9Labs/bitcoind-wrapper.git
cd bitcoind-wrapper
git submodule update --init
```

## Building

```
make
```

## Installing (on Embassy)

```
scp bitcoind.s9pk root@embassy-<id>.local:/embassy-data/package-data/tmp # Copy S9PK to the external disk. Make sure to create the directory if it doesn't already exist
ssh root@embassy-<id>.local
embassy-cli auth login
embassy-cli package install /embassy-data/pacakge-data/tmp/bitcoind.s9pk # Install the sideloaded package
```
## Integrations

Documentation guides for integrating with external applications can be found under [docs/integrations](/docs/integrations).
