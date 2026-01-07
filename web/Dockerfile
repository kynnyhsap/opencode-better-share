FROM oven/bun:1.3.5

WORKDIR /app

COPY package.json bun.lock* ./
COPY web/package.json ./web/package.json
COPY plugin/package.json ./plugin/package.json

RUN bun install

COPY web ./web

# Build arguments
# ARG NEXT_PUBLIC_API_BASE_URL

WORKDIR /app/web

RUN bun run build

CMD ["bun", "run", "start"]
