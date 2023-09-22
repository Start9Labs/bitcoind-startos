# From https://github.com/ruimarinho/docker-bitcoin-core

# Build stage for BerkeleyDB
FROM lncm/berkeleydb as berkeleydb

# Build stage for Bitcoin Core
FROM alpine:3.18 as bitcoin-core

COPY --from=berkeleydb /opt /opt

RUN sed -i 's/http\:\/\/dl-cdn.alpinelinux.org/https\:\/\/alpine.global.ssl.fastly.net/g' /etc/apk/repositories
RUN apk --no-cache add \
        autoconf \
        automake \
        boost-dev \
        build-base \
        chrpath \
        file \
        gnupg \
        libevent-dev \
        libressl \
        libtool \
        linux-headers \
        sqlite-dev \
        zeromq-dev

ADD ./bitcoin /bitcoin

ENV BITCOIN_PREFIX=/opt/bitcoin

WORKDIR /bitcoin

RUN sed -i '/AX_PROG_CC_FOR_BUILD/a\AR_FLAGS=cr' src/secp256k1/configure.ac
RUN ./autogen.sh
RUN ./configure LDFLAGS=-L`ls -d /opt/db*`/lib/ CPPFLAGS=-I`ls -d /opt/db*`/include/ \
  # If building on Mac make sure to increase Docker VM memory, or uncomment this line. See https://github.com/bitcoin/bitcoin/issues/6658 for more info.
  # CXXFLAGS="--param ggc-min-expand=1 --param ggc-min-heapsize=32768" \
  CXXFLAGS="-O2" \
  --prefix=${BITCOIN_PREFIX} \
  --disable-man \
  --disable-tests \
  --disable-bench \
  --disable-ccache \
  --with-gui=no \
  --with-utils \
  --with-libs \
  --with-sqlite=yes \
  --with-daemon
RUN make -j$(($(nproc) - 1))
RUN make install
RUN strip ${BITCOIN_PREFIX}/bin/*
RUN strip ${BITCOIN_PREFIX}/lib/libbitcoinconsensus.a
RUN strip ${BITCOIN_PREFIX}/lib/libbitcoinconsensus.so.0.0.0

# Build stage for compiled artifacts
FROM alpine:3.18

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
  tini \
  yq \
  patch \
  nginx \
  php82 php82-fpm php82-curl php82-session
RUN rm -rf /var/cache/apk/*

ARG ARCH

ENV BITCOIN_DATA=/root/.bitcoin
ENV BITCOIN_PREFIX=/opt/bitcoin
ENV PATH=${BITCOIN_PREFIX}/bin:$PATH

# Add the Bitcoin Node Manager web UI submodule
ENV FPM_CONF=/etc/php82/php-fpm.d/www.conf
ENV BNM_PATH=/var/www/bitcoin-node-manager
ADD ./bitcoin-node-manager ${BNM_PATH}
RUN sed -i 's/^user = nobody$/user = nginx/; s/^group = nobody$/group = nginx/' ${FPM_CONF} && \
    sed -i 's|^listen = .*$|listen = /run/nginx/php-fpm.sock|' ${FPM_CONF} && \
    sed -i 's|^;listen.owner = .*|listen.owner = nginx|; s|^;listen.group = .*|listen.group = nginx|; s|^;listen.mode = .*|listen.mode = 0660|' ${FPM_CONF} && \
    sed -i '/p=wallet/d' /var/www/bitcoin-node-manager/views/header.phtml

RUN chown -R nginx:nginx ${BNM_PATH} /run/nginx

RUN cd /var/www/bitcoin-node-manager && \
    wget -qO- https://github.com/Mirobit/bitcoin-node-manager/commit/ca4b3d1381b5f2462c6a5ee58ffa7fee86eeb8c5.patch | patch -p1 --verbose
WORKDIR /root/.bitcoin

COPY --from=bitcoin-core /opt /opt
COPY ./manager/target/${ARCH}-unknown-linux-musl/release/bitcoind-manager \
     ./docker_entrypoint.sh \
     ./actions/reindex.sh \
     ./check-rpc.sh \
     ./check-synced.sh \
     /usr/local/bin/

RUN chmod a+x /usr/local/bin/bitcoind-manager \
    /usr/local/bin/*.sh

EXPOSE 8332 8333

ENTRYPOINT ["/usr/local/bin/docker_entrypoint.sh"]
