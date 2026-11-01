# LUMIO Multi-Stage Production Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root and workspace manifests
COPY package.json ./
COPY client/package.json ./client/
COPY server/package.json ./server/

# Install dependencies
RUN npm --prefix client install
RUN npm --prefix server install

# Copy source files
COPY client/ ./client/
COPY server/ ./server/

# Build client and server
RUN npm --prefix client run build
RUN npm --prefix server run build

# Runtime Stage
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000

COPY package.json ./
COPY --from=builder /app/server/package.json ./server/
COPY --from=builder /app/server/node_modules ./server/node_modules
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/client/dist ./client/dist

EXPOSE 5000

CMD ["node", "server/dist/index.js"]
