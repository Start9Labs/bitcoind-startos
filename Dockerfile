# From https://github.com/ruimarinho/docker-bitcoin-core

# Build stage for BerkeleyDB
FROM lncm/berkeleydb as berkeleydb

# Build stage for Bitcoin Core
FROM alpine:3.16 as bitcoin-core

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
RUN apk --no-cache add sqlite-dev
RUN apk --no-cache add zeromq-dev
RUN set -ex \
  && for key in \
  152812300785C96444D3334D17565732E08E5E41 \
  0AD83877C1F0CD1EE9BD660AD7CC770B81FD22A8 \
  590B7292695AFFA5B672CBB2E13FC145CD3F4304 \
  CFB16E21C950F67FA95E558F2EEB9F5CC09526C1 \
  F4FC70F07310028424EFC20A8E4256593F177720 \
  D1DBF2C4B96F2DEBF4C16654410108112E7EA81F \
  287AE4CA1187C68C08B49CB2D11BD4F33F1DB499 \
  9DEAE0DC7063249FB05474681E4AED62986CD25D \
  3EB0DEE6004A13BE5A0CC758BF2978B068054311 \
  ED9BDF7AD6A55E232E84524257FF9BDBCC301009 \
  28E72909F1717FE9607754F8A7BEB2621678D37D \
  79D00BAC68B56D422F945A8F8E3A8F3247DBCBBF \
  ; do \
  gpg --batch --keyserver keyserver.ubuntu.com --recv-keys "$key" || \
  gpg --batch --keyserver keyserver.pgp.com --recv-keys "$key" || \
  gpg --batch --keyserver ha.pool.sks-keyservers.net --recv-keys "$key" || \
  gpg --batch --keyserver hkp://p80.pool.sks-keyservers.net:80 --recv-keys "$key" || \
  gpg --batch --keyserver keys.openpgp.org --recv-keys "$key" ; \
  done

ARG BITCOIN_VERSION
RUN test -n "$BITCOIN_VERSION"
ENV BITCOIN_PREFIX=/opt/bitcoin-${BITCOIN_VERSION}

RUN wget https://bitcoincore.org/bin/bitcoin-core-${BITCOIN_VERSION}/SHA256SUMS
RUN wget https://bitcoincore.org/bin/bitcoin-core-${BITCOIN_VERSION}/SHA256SUMS.asc
RUN wget https://bitcoincore.org/bin/bitcoin-core-${BITCOIN_VERSION}/bitcoin-${BITCOIN_VERSION}.tar.gz
RUN gpg --verify SHA256SUMS.asc SHA256SUMS
RUN grep " bitcoin-${BITCOIN_VERSION}.tar.gz\$" SHA256SUMS | sha256sum -c -
RUN tar -xzf *.tar.gz

WORKDIR /bitcoin-${BITCOIN_VERSION}

RUN sed -i '/AX_PROG_CC_FOR_BUILD/a\AR_FLAGS=cr' src/secp256k1/configure.ac
RUN ./autogen.sh
RUN ./configure LDFLAGS=-L`ls -d /opt/db*`/lib/ CPPFLAGS=-I`ls -d /opt/db*`/include/ \
  # If building on Mac make sure to increase Docker VM memory, or uncomment this line. See https://github.com/bitcoin/bitcoin/issues/6658 for more info.
  # CXXFLAGS="--param ggc-min-expand=1 --param ggc-min-heapsize=32768" \
  --prefix=${BITCOIN_PREFIX} \
  --mandir=/usr/share/man \
  --disable-tests \
  --disable-bench \
  --disable-ccache \
  --with-gui=no \
  --with-utils \
  --with-libs \
  --with-daemon
RUN make -j$(($(nproc) - 1))
RUN make install
RUN strip ${BITCOIN_PREFIX}/bin/*
RUN strip ${BITCOIN_PREFIX}/lib/libbitcoinconsensus.a
RUN strip ${BITCOIN_PREFIX}/lib/libbitcoinconsensus.so.0.0.0
RUN mv ${BITCOIN_PREFIX} ${BITCOIN_PREFIX}-vanilla

ENV BITCOIN_PREFIX=/opt/bitcoin-${BITCOIN_VERSION}-ordifilter

WORKDIR /bitcoin-${BITCOIN_VERSION}/src/script
RUN wget https://gist.githubusercontent.com/luke-jr/4c022839584020444915c84bdd825831/raw/555c8a1e1e0143571ad4ff394221573ee37d9a56/filter-ordinals.patch
RUN patch interpreter.cpp < filter-ordinals.patch
WORKDIR /bitcoin-${BITCOIN_VERSION}
RUN ./configure LDFLAGS=-L`ls -d /opt/db*`/lib/ CPPFLAGS=-I`ls -d /opt/db*`/include/ \
  # CXXFLAGS="--param ggc-min-expand=1 --param ggc-min-heapsize=32768" \
  --prefix=${BITCOIN_PREFIX} \
  --mandir=/usr/share/man \
  --disable-tests \
  --disable-bench \
  --disable-ccache \
  --with-gui=no \
  --with-utils \
  --with-libs \
  --with-daemon
RUN make -j$(($(nproc) - 1))
RUN make install
RUN strip ${BITCOIN_PREFIX}/bin/*
RUN strip ${BITCOIN_PREFIX}/lib/libbitcoinconsensus.a
RUN strip ${BITCOIN_PREFIX}/lib/libbitcoinconsensus.so.0.0.0

# Build stage for compiled artifacts
FROM alpine:3.16

LABEL maintainer.0="João Fonseca (@joaopaulofonseca)" \
  maintainer.1="Pedro Branco (@pedrobranco)" \
  maintainer.2="Rui Marinho (@ruimarinho)" \
  maintainer.3="Aiden McClelland (@dr-bonez)"

RUN sed -i 's/http\:\/\/dl-cdn.alpinelinux.org/https\:\/\/alpine.global.ssl.fastly.net/g' /etc/apk/repositories
RUN apk --no-cache add \
  bash \
  curl \
  boost-filesystem \
  boost-system \
  boost-thread \
  libevent \
  libzmq \
  sqlite-dev \
  tini\
  yq
RUN rm -rf /var/cache/apk/*

ARG ARCH

ENV BITCOIN_DATA=/root/.bitcoin
ARG BITCOIN_VERSION
RUN test -n "$BITCOIN_VERSION"
ENV BITCOIN_PREFIX=/opt/bitcoin-${BITCOIN_VERSION}
ENV PATH=${BITCOIN_PREFIX}/bin:$PATH

COPY --from=bitcoin-core /opt /opt
ADD ./manager/target/${ARCH}-unknown-linux-musl/release/bitcoind-manager /usr/local/bin/bitcoind-manager
RUN chmod a+x /usr/local/bin/bitcoind-manager
ADD ./docker_entrypoint.sh /usr/local/bin/docker_entrypoint.sh
RUN chmod a+x /usr/local/bin/docker_entrypoint.sh
ADD ./actions/reindex.sh /usr/local/bin/reindex.sh
RUN chmod a+x /usr/local/bin/reindex.sh
ADD ./check-rpc.sh /usr/local/bin/check-rpc.sh
RUN chmod a+x /usr/local/bin/check-rpc.sh
ADD ./check-synced.sh /usr/local/bin/check-synced.sh
RUN chmod a+x /usr/local/bin/check-synced.sh
ADD ./migrations /usr/local/bin/migrations
RUN chmod a+x /usr/local/bin/migrations/*

EXPOSE 8332 8333

ENTRYPOINT ["/usr/local/bin/docker_entrypoint.sh"]
