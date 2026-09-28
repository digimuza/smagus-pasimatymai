# syntax=docker/dockerfile:1.7
FROM node:20-bookworm-slim AS dependencies
WORKDIR /app
RUN npm install --global pnpm@10.18.1
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

FROM dependencies AS builder
COPY . .
# These values are only needed while Next.js generates its build output.
# Real credentials belong to the container runtime.
ARG NEXT_PUBLIC_URL=http://localhost:7743
ENV DATABASE_URL=postgresql://payload:payload@localhost:5432/santykiuklausimai \
    PAYLOAD_SECRET=docker-build-placeholder-at-least-32-characters \
    NEXT_PUBLIC_URL=${NEXT_PUBLIC_URL}
RUN --mount=type=cache,id=next-build-cache,target=/app/.next/cache pnpm build

FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    PORT=7743 \
    HOSTNAME=0.0.0.0
RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 --gid nodejs nextjs
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
USER nextjs
EXPOSE 7743
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD node -e "fetch('http://127.0.0.1:7743/api/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"
CMD ["node", "server.js"]
