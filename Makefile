VERSION := $(shell yq e ".version" manifest.yaml)
VERSION_STRIPPED := $(shell echo $(VERSION) | sed -E 's/([0-9]+\.[0-9]+\.[0-9]+).*/\1/g')
MANAGER_SRC := $(shell find ./manager -name '*.rs') manager/Cargo.toml manager/Cargo.lock

.DELETE_ON_ERROR:

all: verify

clean:
	rm bitcoind.s9pk
	rm image.tar

bitcoind.s9pk: manifest.yaml assets/compat/config_spec.yaml assets/compat/config_rules.yaml image.tar instructions.md
	embassy-sdk pack

verify: bitcoind.s9pk
	embassy-sdk verify bitcoind.s9pk

install: bitcoind.s9pk
	embassy-cli package install bitcoind.s9pk

image.tar: Dockerfile docker_entrypoint.sh manager/target/aarch64-unknown-linux-musl/release/bitcoind-manager manifest.yaml check-rpc.sh
	DOCKER_CLI_EXPERIMENTAL=enabled docker buildx build --tag start9/bitcoind/main:$(VERSION) --build-arg BITCOIN_VERSION=$(VERSION_STRIPPED) --build-arg N_PROC=$(shell nproc) --platform=linux/arm64 -o type=docker,dest=image.tar .

manager/target/aarch64-unknown-linux-musl/release/bitcoind-manager: $(MANAGER_SRC)
	docker run --rm -it -v ~/.cargo/registry:/root/.cargo/registry -v "$(shell pwd)"/manager:/home/rust/src start9/rust-musl-cross:aarch64-musl cargo build --release
	docker run --rm -it -v ~/.cargo/registry:/root/.cargo/registry -v "$(shell pwd)"/manager:/home/rust/src start9/rust-musl-cross:aarch64-musl musl-strip target/aarch64-unknown-linux-musl/release/bitcoind-manager
