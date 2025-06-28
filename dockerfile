FROM --platform=linux/amd64 node:20-slim as builder
ENV NODE_ENV build

USER root

RUN apt-get update && apt-get install -y --no-install-recommends \
    bash \
    libaio1 \
    curl \
    unzip \
    ca-certificates && \
    rm -rf /var/lib/apt/lists/*

USER node
WORKDIR /home/node

COPY --chown=node:node package*.json ./

RUN npm install

COPY --chown=node:node . .
RUN npx prisma generate && \
    npm run build


FROM --platform=linux/amd64 node:20-slim

ENV NODE_ENV production

USER root

# Instalar dependências necessárias para o Oracle Instant Client
RUN apt-get update && apt-get install -y --no-install-recommends \
    bash \
    libaio1 \
    curl \
    unzip \
    ca-certificates \
    libnsl2 && \
    rm -rf /var/lib/apt/lists/*


USER node
WORKDIR /home/node

COPY --from=builder --chown=node:node /home/node/package*.json ./
COPY --from=builder --chown=node:node /home/node/node_modules/ ./node_modules/
COPY --from=builder --chown=node:node /home/node/dist/ ./dist/

CMD ["node", "dist/main.js"]