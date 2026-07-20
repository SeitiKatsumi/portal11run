FROM node:24-alpine AS deps
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM node:24-alpine AS builder
WORKDIR /app
ARG CAPROVER_GIT_COMMIT_SHA
ENV CAPROVER_GIT_COMMIT_SHA=${CAPROVER_GIT_COMMIT_SHA}
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate && pnpm build

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=80
ENV HOSTNAME=0.0.0.0
ENV SQLITE_PATH=/data/portal11run.sqlite
ENV UPLOAD_DIR=/data/uploads
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=builder /app/public ./public
COPY --from=builder /app/data/schema.sql ./data/schema.sql
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/.next/static ./.next/static
RUN mkdir -p /data/uploads
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 CMD wget -qO- http://127.0.0.1:80/api/health || exit 1
CMD ["sh", "-c", "node node_modules/next/dist/bin/next start -H 0.0.0.0 -p ${PORT}"]
