# Base images
# ------------------------------------
# BACKEND DOCKERFILE
# ------------------------------------
FROM node:20-alpine AS backend-builder
WORKDIR /app
COPY apps/backend/package*.json ./
RUN npm install
COPY apps/backend/prisma ./prisma/
RUN npx prisma generate
COPY apps/backend/ ./
RUN npm run build

FROM node:20-alpine AS backend-production
WORKDIR /app
COPY --from=backend-builder /app/package*.json ./
RUN npm install --omit=dev
COPY --from=backend-builder /app/prisma ./prisma
COPY --from=backend-builder /app/dist ./dist
# Generate prisma client for production
RUN npx prisma generate
EXPOSE 3001
# Start script handles migrations and starts the app
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
