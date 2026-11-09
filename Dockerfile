# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# 1. Compilation de l'application Vite
# ---------------------------------------------------------------------------
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Variables injectées au build (Vite les fige dans le bundle).
ARG VITE_API_BASE_URL=/api
ARG VITE_API_TIMEOUT=15000
ARG VITE_USE_MOCKS=false
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL} \
    VITE_API_TIMEOUT=${VITE_API_TIMEOUT} \
    VITE_USE_MOCKS=${VITE_USE_MOCKS} \
    NODE_ENV=production

RUN npm run build

# ---------------------------------------------------------------------------
# 2. Service statique Nginx
# ---------------------------------------------------------------------------
FROM nginx:1.27-alpine AS runtime

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/sentransport.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/healthz >/dev/null 2>&1 || exit 1

CMD ["nginx", "-g", "daemon off;"]
