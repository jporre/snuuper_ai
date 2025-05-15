FROM node:22 AS builder
WORKDIR /app
COPY package.json  ./
RUN npm install
COPY . .
RUN npm run build && npm prune --production

FROM node:22-alpine
USER node:node
WORKDIR /app
COPY --from=builder --chown=node:node /app/build ./build
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node package.json .
ENV PORT=5050
ENV BODY_SIZE_LIMIT=80M
EXPOSE 5050
CMD ["node","build"]