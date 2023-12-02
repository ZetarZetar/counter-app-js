FROM node:20-alpine as builder

ENV NODE_ENV=production
ENV npm_config_loglevel=error
ENV npm_config_update-notifier=false
ENV NODE_NO_WARNINGS=1

WORKDIR /app
COPY . .
RUN npm ci
RUN npm run build


FROM nginx:alpine-slim
ARG ENVIRONMENT=production
COPY ./configs/${ENVIRONMENT}/nginx/nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/dist /app

WORKDIR /app
EXPOSE 80