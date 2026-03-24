# ─── Stage 1: Builder ────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar manifiestos y lockfile antes del código fuente para aprovechar
# la caché de capas de Docker cuando no cambian las dependencias.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Variables de entorno públicas necesarias en tiempo de build
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

# ─── Stage 2: Runner ─────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Usuario no-root para reducir superficie de ataque
RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

# Archivos públicos estáticos
COPY --from=builder /app/public ./public

# Salida standalone de Next.js (incluye server.js y node_modules mínimos)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
