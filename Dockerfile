FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json ./
RUN npm install --include=dev

FROM node:24-alpine AS builder
WORKDIR /app
ARG CAPROVER_GIT_COMMIT_SHA
ENV CAPROVER_GIT_COMMIT_SHA=${CAPROVER_GIT_COMMIT_SHA}
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

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
CMD ["sh", "-c", "node node_modules/next/dist/bin/next start -H 0.0.0.0 -p ${PORT}"]
