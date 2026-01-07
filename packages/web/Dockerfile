FROM oven/bun:1.3.5

WORKDIR /app

COPY packages/web/package.json packages/web/bun.lock* ./

RUN bun install --frozen-lockfile

COPY packages/web .

RUN bun run build

CMD ["bun", "run", "start"]
