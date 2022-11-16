# From https://github.com/ruimarinho/docker-bitcoin-core

# Build stage for BerkeleyDB
FROM lncm/berkeleydb as berkeleydb

# Build stage for Bitcoin Core
FROM alpine:3.12 as bitcoin-core

COPY --from=berkeleydb /opt /opt

COPY ./SHA256SUMS.asc.patch SHA256SUMS.asc.patch

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
9D3CC86A72F8494342EA5FD10A41BDC3F4FAFF1C \
617C90010B3BD370B0AC7D424BB42E31C79111B8 \
E944AE667CF960B1004BC32FCA662BE18B877A60 \
152812300785C96444D3334D17565732E08E5E41 \
590B7292695AFFA5B672CBB2E13FC145CD3F4304 \
0AD83877C1F0CD1EE9BD660AD7CC770B81FD22A8 \
912FD3228387123DC97E0E57D5566241A0295FA9 \
04017A2A6D9A0CCDC81D8EC296AB007F1A7ED999 \
C519EBCF3B926298946783EFF6430754120EC2F4 \
18AE2F798E0D239755DA4FD24B79F986CBDF8736 \
101598DC823C1B5F9A6624ABA5E0907A0380E6C3 \
F20F56EF6A067F70E8A5C99FFF95FAA971697405 \
C060A6635913D98A3587D7DB1C2491FFEB0EF770 \
BF6273FAEF7CC0BA1F562E50989F6B3048A116B5 \
6D3170C1DC2C6FD0AEEBCA6743811D1A26623924 \
948444FCE03B05BA5AB0591EC37B1C1D44C786EE \
1C6621605EC50319C463D56C7F81D87985D61612 \
9A1689B60D1B3CCE9262307A2F40A9BF167FBA47 \
D35176BE9264832E4ACA8986BF0792FBE95DC863 \
6F993B250557E7B016ADE5713BDCDA2D87A881D9 \
01CDF4627A3B88AAE4A571C87588242FBE38D3A8 \
D1DBF2C4B96F2DEBF4C16654410108112E7EA81F \
2688F5A9A4BE0F295E921E8A25F27A38A47AD566 \
D3F22A3A4C366C2DCB66D3722DA9C5A7FA81EA35 \
7480909378D544EA6B6DCEB7535B12980BB8A4D3 \
D3CC177286005BB8FF673294C5242A1AB3936517 \
82921A4B88FD454B7EB8CE3C796C4109063D4EAF \
32EE5C4C3FA15CCADB46ABE529D4BCB6416F53EC \
4B4E840451149DD7FB0D633477DFAB5C3108B9A8 \
C42AFF7C61B3E44A1454CD3557AF762DB3353322 \
70A1D47DD44F59DF8B22244333E472FE870C7E5D \
30DE693AE0DE9E37B3E7EB6BBFF0F67810C1EED1 \
E463A93F5F3117EEDE6C7316BD02942421F4889F \
B8B3F1C0E58C15DB6A81D30C3648A882F4316B9B \
07DF3E57A548CCFB7530709189BBB8663E2E65CE \
CA03882CB1FC067B5D3ACFE4D300116E1C875A3D \
E777299FC265DD04793070EB944D35F9AC3DB76A \
AD5764F4ADCE1B99BDFD179E12335A271D4D62EC \
9692B91BBF0E8D34DFD33B1882C5C009628ECF0C \
C57E4B42223FDE851D4F69DD28DF2724F241D8EE \
F4FC70F07310028424EFC20A8E4256593F177720 \
D62A803E27E7F43486035ADBBCD04D8E9CCCAC2A \
37EC7D7B0A217CDB4B4E007E7FAB114267E4FA04 \
D762373D24904A3E42F33B08B9A408E71DAAC974 \
133EAC179436F14A5CF1B794860FEB804E669320 \
6A8F9C266528E25AEB1D7731C2371D91CB716EA7 \
A8FC55F3B04BA3146F3492E79303B33A305224CB \
ED9BDF7AD6A55E232E84524257FF9BDBCC301009 \
867345026B6763E8B07EE73AB6737117397F5C4F \
9EDAFF80E080659604F4A76B2EBB056FD847F8A7 \
6DEEF79B050C4072509B743F8C275BC595448867 \
AEC1884398647C47413C1C3FB1179EB7347DC10D \
74E2DEF5D77260B98BC19438099BAD163C70FBFA \
79D00BAC68B56D422F945A8F8E3A8F3247DBCBBF \
71A3B16735405025D447E8F274810B012346C9A6 \
287AE4CA1187C68C08B49CB2D11BD4F33F1DB499 \
F9A8737BF4FF5C89C903DF31DD78544CF91B1514 \
# C388F6961FB972A95678E327F62711DBDCA8AE56 \
4DAF18FE948E7A965B30F9457E296D555E7F63A7 \
28E72909F1717FE9607754F8A7BEB2621678D37D \
  ; do \
  gpg --batch --keyserver hkps://keyserver.ubuntu.com --recv-keys "$key" || \
  gpg --batch --keyserver hkps://pgp.mit.edu --recv-keys "$key" || \
  gpg --batch --keyserver keyserver.pgp.com --recv-keys "$key" || \
  gpg --batch --keyserver hkps://ipv4.pool.sks-keyservers.net --recv-keys "$key" || \
  gpg --batch --keyserver hkp://p80.pool.sks-keyservers.net:80 --recv-keys "$key" || \
  gpg --batch --keyserver keys.openpgp.org --recv-keys "$key" ; \
  done

ARG BITCOIN_VERSION
RUN test -n "$BITCOIN_VERSION"
ENV BITCOIN_PREFIX=/opt/bitcoin-${BITCOIN_VERSION}

RUN wget https://bitcoincore.org/bin/bitcoin-core-${BITCOIN_VERSION}/SHA256SUMS
RUN wget https://bitcoincore.org/bin/bitcoin-core-${BITCOIN_VERSION}/SHA256SUMS.asc
RUN wget https://bitcoincore.org/bin/bitcoin-core-${BITCOIN_VERSION}/bitcoin-${BITCOIN_VERSION}.tar.gz
RUN patch -u SHA256SUMS.asc -i SHA256SUMS.asc.patch
RUN gpg --verify SHA256SUMS.asc
RUN grep " bitcoin-${BITCOIN_VERSION}.tar.gz\$" SHA256SUMS | sha256sum -c -
RUN tar -xzf *.tar.gz

WORKDIR /bitcoin-${BITCOIN_VERSION}

RUN sed -i '/AC_PREREQ/a\AR_FLAGS=cr' src/univalue/configure.ac
RUN sed -i '/AX_PROG_CC_FOR_BUILD/a\AR_FLAGS=cr' src/secp256k1/configure.ac
RUN sed -i s:sys/fcntl.h:fcntl.h: src/compat.h
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
RUN make -j7
RUN make install
RUN strip ${BITCOIN_PREFIX}/bin/bitcoin-cli
RUN strip ${BITCOIN_PREFIX}/bin/bitcoin-tx
RUN strip ${BITCOIN_PREFIX}/bin/bitcoind
RUN strip ${BITCOIN_PREFIX}/lib/libbitcoinconsensus.a
RUN strip ${BITCOIN_PREFIX}/lib/libbitcoinconsensus.so.0.0.0

# Build stage for compiled artifacts
FROM alpine:3.13

LABEL maintainer.0="João Fonseca (@joaopaulofonseca)" \
  maintainer.1="Pedro Branco (@pedrobranco)" \
  maintainer.2="Rui Marinho (@ruimarinho)" \
  maintainer.3="Aiden McClelland (@dr-bonez)"

RUN apk update
RUN apk --no-cache add \
  bash \
  curl \
  boost-filesystem=1.72.0-r6 \
  boost-system=1.72.0-r6 \
  boost-thread=1.72.0-r6 \
  libevent \
  libzmq \
  sqlite-libs \
  su-exec \
  tini
RUN wget https://github.com/mikefarah/yq/releases/latest/download/yq_linux_amd64.tar.gz -O - |\
    tar xz && mv yq_linux_amd64 /usr/bin/yq

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
ADD ./check-synced.sh /usr/local/bin/check-synced.sh
RUN chmod a+x /usr/local/bin/check-synced.sh
ADD ./migrations /usr/local/bin/migrations
RUN chmod a+x /usr/local/bin/migrations/*

EXPOSE 8332 8333

ENTRYPOINT ["/usr/local/bin/docker_entrypoint.sh"]
