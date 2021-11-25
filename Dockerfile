# From https://github.com/ruimarinho/docker-bitcoin-core

# Build stage for BerkeleyDB
FROM lncm/berkeleydb as berkeleydb

# Build stage for Bitcoin Core
FROM arm64v8/alpine:3.12 as bitcoin-core

COPY --from=berkeleydb /opt /opt

RUN sed -i 's/http\:\/\/dl-cdn.alpinelinux.org/https\:\/\/alpine.global.ssl.fastly.net/g' /etc/apk/repositories
RUN apk --no-cache add autoconf
RUN apk --no-cache add automake
RUN apk --no-cache add boost-dev
RUN apk --no-cache add build-base
RUN apk --no-cache add chrpath
RUN apk --no-cache add file
RUN apk --no-cache add gnupg
RUN apk --no-cache add libevent-dev
RUN apk --no-cache add libressl
RUN apk --no-cache add libtool
RUN apk --no-cache add linux-headers
# RUN apk --no-cache add sqlite-libs
RUN apk --no-cache add sqlite-dev
RUN apk --no-cache add zeromq-dev
RUN set -ex \
  && for key in \
  90C8019E36C2E964 \
  ; do \
  gpg --batch --keyserver keyserver.ubuntu.com --recv-keys "$key" || \
  gpg --batch --keyserver pgp.mit.edu --recv-keys "$key" || \
  gpg --batch --keyserver keyserver.pgp.com --recv-keys "$key" || \
  gpg --batch --keyserver ha.pool.sks-keyservers.net --recv-keys "$key" || \
  gpg --batch --keyserver hkp://p80.pool.sks-keyservers.net:80 --recv-keys "$key" ; \
  done

ARG BITCOIN_VERSION
ARG N_PROC
RUN test -n "$BITCOIN_VERSION"
RUN test -n "$N_PROC"
ENV BITCOIN_PREFIX=/opt/bitcoin-${BITCOIN_VERSION}

RUN wget https://bitcoincore.org/bin/bitcoin-core-${BITCOIN_VERSION}/SHA256SUMS.asc
RUN wget https://bitcoincore.org/bin/bitcoin-core-${BITCOIN_VERSION}/bitcoin-${BITCOIN_VERSION}.tar.gz
RUN gpg --verify SHA256SUMS.asc
RUN grep " bitcoin-${BITCOIN_VERSION}.tar.gz\$" SHA256SUMS.asc | sha256sum -c -
RUN tar -xzf *.tar.gz

WORKDIR /bitcoin-${BITCOIN_VERSION}

RUN sed -i '/AC_PREREQ/a\AR_FLAGS=cr' src/univalue/configure.ac
RUN sed -i '/AX_PROG_CC_FOR_BUILD/a\AR_FLAGS=cr' src/secp256k1/configure.ac
RUN sed -i s:sys/fcntl.h:fcntl.h: src/compat.h
RUN ./autogen.sh
RUN ./configure LDFLAGS=-L`ls -d /opt/db*`/lib/ CPPFLAGS=-I`ls -d /opt/db*`/include/ \
  --prefix=${BITCOIN_PREFIX} \
  --mandir=/usr/share/man \
  --disable-tests \
  --disable-bench \
  --disable-ccache \
  --with-gui=no \
  --with-utils \
  --with-libs \
  --with-daemon
RUN make -j${N_PROC}
RUN make install
RUN strip ${BITCOIN_PREFIX}/bin/bitcoin-cli
RUN strip ${BITCOIN_PREFIX}/bin/bitcoin-tx
RUN strip ${BITCOIN_PREFIX}/bin/bitcoind
RUN strip ${BITCOIN_PREFIX}/lib/libbitcoinconsensus.a
RUN strip ${BITCOIN_PREFIX}/lib/libbitcoinconsensus.so.0.0.0

# Build stage for compiled artifacts
FROM arm64v8/alpine:3.13

LABEL maintainer.0="João Fonseca (@joaopaulofonseca)" \
  maintainer.1="Pedro Branco (@pedrobranco)" \
  maintainer.2="Rui Marinho (@ruimarinho)" \
  maintainer.3="Aiden McClelland (@dr-bonez)"

RUN apk update
RUN apk --no-cache add \
  bash \
  boost-filesystem=1.72.0-r6 \
  boost-system=1.72.0-r6 \
  boost-thread=1.72.0-r6 \
  libevent \
  libzmq \
  sqlite-libs \
  su-exec
RUN wget https://github.com/mikefarah/yq/releases/download/v4.12.2/yq_linux_arm.tar.gz -O - |\
    tar xz && mv yq_linux_arm /usr/bin/yq

ENV BITCOIN_DATA=/root/.bitcoin
ARG BITCOIN_VERSION
RUN test -n "$BITCOIN_VERSION"
ENV BITCOIN_PREFIX=/opt/bitcoin-${BITCOIN_VERSION}
ENV PATH=${BITCOIN_PREFIX}/bin:$PATH

COPY --from=bitcoin-core /opt /opt
ADD ./manager/target/aarch64-unknown-linux-musl/release/bitcoind-manager /usr/local/bin/bitcoind-manager
RUN chmod a+x /usr/local/bin/bitcoind-manager
ADD ./docker_entrypoint.sh /usr/local/bin/docker_entrypoint.sh
RUN chmod a+x /usr/local/bin/docker_entrypoint.sh
ADD ./actions/reindex.sh /usr/local/bin/reindex.sh
RUN chmod a+x /usr/local/bin/reindex.sh
ADD ./check-rpc.sh /usr/local/bin/check-rpc.sh
RUN chmod a+x /usr/local/bin/check-rpc.sh

EXPOSE 8332 8333

ENTRYPOINT ["/usr/local/bin/docker_entrypoint.sh"]
