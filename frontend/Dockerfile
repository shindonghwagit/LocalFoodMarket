# Multi-stage build for user or admin bundle.
# Usage: docker build --build-arg APP_MODE=user|admin -t frontend-<mode> .

FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --no-audit --no-fund
COPY . .
RUN npm run build:user && npm run build:admin

FROM nginx:1.27-alpine AS runtime
ARG APP_MODE=user
ENV APP_MODE=${APP_MODE}
WORKDIR /usr/share/nginx/html
COPY --from=build /app/dist/ ./_user/
COPY --from=build /app/dist-admin/ ./_admin/
RUN set -eu; \
    if [ "$APP_MODE" = "admin" ]; then \
      cp -r _admin/. ./; \
      mv admin.html index.html; \
    else \
      cp -r _user/. ./; \
    fi; \
    rm -rf _user _admin
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
