ARG NODE_VERSION=24.18.0

FROM node:${NODE_VERSION}-bookworm-slim AS build

ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .
RUN npm run build

FROM node:${NODE_VERSION}-bookworm-slim AS runtime

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
WORKDIR /app

LABEL org.opencontainers.image.source="https://github.com/Elainaicey/IconNest"
LABEL org.opencontainers.image.description="A fresh, local-first icon library and management workspace."
LABEL org.opencontainers.image.licenses="MIT"

COPY --from=build --chown=node:node /app/.next/standalone ./

EXPOSE 3000

USER node

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
