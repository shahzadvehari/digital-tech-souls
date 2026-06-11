# ------------------------------------
# FRONTEND DOCKERFILE
# ------------------------------------
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY apps/frontend/package*.json ./
RUN npm install
COPY apps/frontend/ ./
# Enable standalone output via env variable if not in next.config
ENV NEXT_TELEMETRY_DISABLED 1
# Ensure output is standalone
RUN npm run build

FROM node:20-alpine AS frontend-production
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

COPY --from=frontend-builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown node:node .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=frontend-builder --chown=node:node /app/.next/standalone ./
COPY --from=frontend-builder --chown=node:node /app/.next/static ./.next/static

USER node

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
