# From https://github.com/ruimarinho/docker-bitcoin-core

# Build stage for BerkeleyDB
ARG ARCH
ARG PLATFORM=${ARCH/aarch64/arm64}
ARG PLATFORM=${PLATFORM/x86_64/amd64}

FROM lncm/berkeleydb:db-4.8.30.NC-${PLATFORM} AS berkeleydb

# Build stage for Bitcoin Core
FROM alpine:3.21 AS bitcoin-core

COPY --from=berkeleydb /opt /opt

RUN sed -i 's/http\:\/\/dl-cdn.alpinelinux.org/https\:\/\/alpine.global.ssl.fastly.net/g' /etc/apk/repositories
RUN apk --no-cache add \
  autoconf \
  automake \
  boost-dev \
  build-base \
  clang \
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

RUN ./autogen.sh
RUN ./configure LDFLAGS=-L`ls -d /opt/db*`/lib/ CPPFLAGS=-I`ls -d /opt/db*`/include/ \
  # If building on Mac make sure to increase Docker VM memory, or uncomment this line. See https://github.com/bitcoin/bitcoin/issues/6658 for more info.
  # CXXFLAGS="--param ggc-min-expand=1 --param ggc-min-heapsize=32768" \
  CXXFLAGS="-O1" \
  CXX=clang++ CC=clang \
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
RUN make -j$(nproc)
RUN make install
RUN strip ${BITCOIN_PREFIX}/bin/*

# Build stage for compiled artifacts
FROM alpine:3.21

LABEL maintainer.0="João Fonseca (@joaopaulofonseca)" \
  maintainer.1="Pedro Branco (@pedrobranco)" \
  maintainer.2="Rui Marinho (@ruimarinho)" \
  maintainer.3="Aiden McClelland (@dr-bonez)"

RUN sed -i 's/http\:\/\/dl-cdn.alpinelinux.org/https\:\/\/alpine.global.ssl.fastly.net/g' /etc/apk/repositories
RUN apk --no-cache add \
  bash \
  curl \
  libevent \
  libzmq \
  sqlite-dev \
  tini \
  yq \
  RUN rm -rf /var/cache/apk/*

ARG ARCH

ENV BITCOIN_DATA=/root/.bitcoin
ENV BITCOIN_PREFIX=/opt/bitcoin
ENV PATH=${BITCOIN_PREFIX}/bin:$PATH

COPY --from=bitcoin-core /opt /opt

EXPOSE 8332 8333