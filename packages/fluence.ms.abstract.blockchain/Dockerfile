FROM node:8.9-stretch
MAINTAINER Andrew Zubko

RUN groupadd -r blockpool && useradd -r -g blockpool blockpool

RUN mkdir /var/log/blockpool
RUN chown -R blockpool:blockpool /var/log/blockpool

RUN mkdir /project

WORKDIR /project

COPY ./ ./

RUN chown -R blockpool:blockpool /project/

VOLUME /project/log

USER blockpool

EXPOSE 3000
EXPOSE 9095

ENV DEBUG=test*,blockpool* DEBUG_COLORS=1

ENTRYPOINT node dist/index.js
