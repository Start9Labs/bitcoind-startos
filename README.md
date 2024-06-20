<p align="center">
  <img src="icon.png" alt="Project Logo" width="21%">
</p>

# Bitcoin Core for StartOS

This project packages [Bitcoin](https://bitcoin.org) for StartOS. Bitcoin uses peer-to-peer technology to operate with no central authority or banks - managing transactions and the issuing of bitcoins is carried out collectively by the network. 

## Contributing

We welcome contributions from all!

For non-technical contributors, please use the `Issues` section above to communicate your desired edits or additions.

For technical contributors, please fork this repository, make your changes according to the instructions below, and open a pull reuqest.

### Adding Config Options

To add config options, include the new config options in *both* `scripts/services/getConfig.ts` and `assets/compat/bitcoin.conf.template`, adhering to the syntax and conventions of those files. To view the full list of config options, complete with descriptions and specifications, check out this [site](https://jlopp.github.io/bitcoin-core-config-generator) from Jameson Lopp.

## Dependencies

Install the following system dependencies to build this project by following the instructions on the provided links:

- [docker](https://docs.docker.com/get-docker)
- [docker-buildx](https://docs.docker.com/buildx/working-with-buildx/)
- [yq](https://mikefarah.gitbook.io/yq)
- [rust](https://rustup.rs)
- [start-sdk](https://github.com/Start9Labs/start-os/tree/sdk)
- [make](https://www.gnu.org/software/make/)

## Cloning

Clone the project locally. Note the submodule link to the original project(s). 

```
git clone git@github.com:Start9Labs/bitcoind-startos.git
cd bitcoind-startos
git submodule update --init
```

## Building

To build the project for all supported platforms, run the following command:

```
make
```

To build the project for a single platform, run:

```
# for amd64
make x86
```
or
```
# for arm64
make arm
```

## Installing (on Start9 server)

Run the following commands to determine successful install:
> :information_source: Change server-name.local to your Start9 server address

```
start-cli auth login
# Enter your StartOS password
start-cli --host https://server-name.local package install bitcoind.s9pk
```

If you already have your `start-cli` config file setup with a default `host`, you can install simply by running:

```
make install
```

> **Tip:** You can also install the `bitcoind.s9pk` using **Sideload Service** under the **System > Manage** section.

## Integrations

Our [documentation](https://docs.start9.com/latest/service-guides/bitcoin/bitcoin-integrations) includes guides for integrating Bitcoin with external applications.
