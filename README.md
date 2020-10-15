# Wrapper for Bitcoin Core

This project wraps [Bitcoin](https://bitcoin.org) for EmbassyOS. Bitcoin uses peer-to-peer technology to operate with no central authority or banks - managing transactions and the issuing of bitcoins is carried out collectively by the network. 

## Dependencies

Install the following system dependencies to build this project by following the instructions on the provided links:

- [docker](https://docs.docker.com/get-docker)
- [docker-buildx](https://docs.docker.com/buildx/working-with-buildx/)
- [rust-musl-cross](https://github.com/Start9Labs/rust-musl-cross)
- [yq](https://mikefarah.gitbook.io/yq)
- [rust](https://rustup.rs)
- [appmgr](https://github.com/Start9Labs/appmgr)
- [make](https://www.gnu.org/software/make/)

## Cloning

Clone the project locally. Note the submodule link to the original project(s). 

```
git clone git@github.com:Start9Labs/bitcoind-wrapper.git
cd bitcoind-wrapper
git submodule update --init
```

## Building

To build the project, run the following commands:

```
make
```
Note: some parts of the make process must be run on armv7

## Installing

SSH into an Embassy device.
`scp` the `.s9pk` to any directory from your local machine.
Run the following command to determine successful install:

```
appmgr install bitcoind.s9pk
```