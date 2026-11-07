# LUMIO Multi-Stage Production Dockerfile
FROM node:24-alpine AS builder

WORKDIR /app

# Copy root and workspace manifests
COPY package.json ./
COPY client/package.json ./client/
COPY client/package-lock.json ./client/
COPY server/package.json ./server/
COPY server/package-lock.json ./server/

# Install dependencies
RUN npm --prefix client ci
RUN npm --prefix server ci

# Copy source files
COPY client/ ./client/
COPY server/ ./server/

# Build client and server
RUN npm --prefix client run build
RUN npm --prefix server run build

# Runtime Stage
FROM node:24-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000
ENV DATA_DIR=/data

COPY package.json ./
COPY --from=builder /app/server/package.json ./server/
COPY --from=builder /app/server/node_modules ./server/node_modules
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/client/dist ./client/dist

RUN mkdir -p /data && chown -R node:node /app /data
USER node

EXPOSE 5000

CMD ["node", "server/dist/index.js"]
