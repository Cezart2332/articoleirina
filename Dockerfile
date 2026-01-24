FROM node:20-bookworm-slim AS build

WORKDIR /usr/src/app

COPY package*.json package-lock.json ./

RUN npm ci 

# Fix permissions for node_modules binaries
RUN chmod -R +x node_modules/.bin/

COPY ./ ./

RUN npm run build

FROM nginx:stable-alpine AS production

# Copy custom entrypoint script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

COPY --from=build /usr/src/app/nginx /etc/nginx/conf.d

COPY --from=build /usr/src/app/dist /usr/share/nginx/html

# Use custom entrypoint
ENTRYPOINT ["/docker-entrypoint.sh"]