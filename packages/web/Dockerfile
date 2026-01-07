# Build stage
FROM oven/bun:1 AS builder

WORKDIR /app

# Copy package files
COPY package.json bun.lockb* ./
COPY packages/web/package.json ./packages/web/

# Install dependencies
RUN bun install

# Copy source
COPY packages/web ./packages/web

# Build
WORKDIR /app/packages/web
RUN bun run build

# Production stage
FROM oven/bun:1-slim AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy built files
COPY --from=builder /app/packages/web/.next/standalone ./
COPY --from=builder /app/packages/web/.next/static ./.next/static
COPY --from=builder /app/packages/web/public ./public

# Create data directory for SQLite
RUN mkdir -p /app/data

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["bun", "server.js"]
