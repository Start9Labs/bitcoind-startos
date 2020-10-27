ASSETS := $(shell yq r manifest.yaml assets.*.src)
ASSET_PATHS := $(addprefix assets/,$(ASSETS))
VERSION := $(shell yq r manifest.yaml version)
VERSION_STRIPPED := $(firstword $(subst +, ,$(VERSION)))
MANAGER_SRC := $(shell find ./manager -name '*.rs') manager/Cargo.toml manager/Cargo.lock

.DELETE_ON_ERROR:

all: bitcoind.s9pk

install: bitcoind.s9pk
	appmgr install bitcoind.s9pk

bitcoind.s9pk: manifest.yaml config_spec.yaml config_rules.yaml image.tar instructions.md $(ASSET_PATHS)
	appmgr -vv pack $(shell pwd) -o bitcoind.s9pk
	appmgr -vv verify bitcoind.s9pk

image.tar: Dockerfile docker_entrypoint.sh manager/target/armv7-unknown-linux-musleabihf/release/bitcoind-manager manifest.yaml
	DOCKER_CLI_EXPERIMENTAL=enabled docker buildx build --tag start9/bitcoind --build-arg BITCOIN_VERSION=$(VERSION_STRIPPED) --platform=linux/arm/v7 -o type=docker,dest=image.tar .
	#test "$(shell uname -m)" = "aarch64"
	#docker build -t start9/bitcoind --build-arg BITCOIN_VERSION=$(VERSION) .
	#docker save start9/bitcoind > image.tar
	#docker rmi start9/bitcoind

manager/target/armv7-unknown-linux-musleabihf/release/bitcoind-manager: $(MANAGER_SRC)
	docker run --rm -it -v ~/.cargo/registry:/root/.cargo/registry -v "$(shell pwd)"/manager:/home/rust/src start9/rust-musl-cross:armv7-musleabihf cargo build --release
	docker run --rm -it -v ~/.cargo/registry:/root/.cargo/registry -v "$(shell pwd)"/manager:/home/rust/src start9/rust-musl-cross:armv7-musleabihf musl-strip target/armv7-unknown-linux-musleabihf/release/bitcoind-manager
