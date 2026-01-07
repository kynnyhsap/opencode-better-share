FROM oven/bun:1.3.5

WORKDIR /app

COPY web/package.json web/bun.lock* ./
RUN bun install --frozen-lockfile

COPY web .

RUN bun run build

CMD ["bun", "run", "start"]
