FROM oven/bun:1-alpine

WORKDIR /app

COPY package.json bun.lock ./

RUN bun install --frozen-lockfile --production

COPY . .

EXPOSE 3000

CMD ["sh", "-c", "bun run src/db/migrate.ts && bun run src/index.ts"]
