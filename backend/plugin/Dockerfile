FROM node:20-alpine as builder

ENV NODE_ENV=production
ENV npm_config_loglevel=error
ENV npm_config_update-notifier=false
ENV NODE_NO_WARNINGS=1

WORKDIR /app
COPY . .
RUN npm ci

WORKDIR /app
EXPOSE 3200

ENTRYPOINT [ "node", "index.js" ]