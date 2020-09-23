# Wrapper for Bitcoin Core

## Dependencies

- [docker](https://docs.docker.com/get-docker)
- [docker-buildx](https://docs.docker.com/buildx/working-with-buildx/)
- [rust-musl-cross](https://github.com/Start9Labs/rust-musl-cross)
- [yq](https://mikefarah.gitbook.io/yq)
- [rust](https://rustup.rs)
- [appmgr](https://github.com/Start9Labs/appmgr)

## Cloning
```
git clone git@github.com:Start9Labs/bitcoind-wrapper.git
cd bitcoind-wrapper
```

## Building

```
make
```
Note: some parts of the make process must be run on armv7

## Installing
```
appmgr install bitcoind.s9pk
```
