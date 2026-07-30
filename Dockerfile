ARG NODE_VERSION=24.18.0

FROM node:${NODE_VERSION}-bookworm-slim AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .
RUN npm run build

FROM node:${NODE_VERSION}-bookworm-slim AS runtime

ENV NODE_ENV=production
WORKDIR /app

LABEL org.opencontainers.image.source="https://github.com/Elainaicey/IconNest"
LABEL org.opencontainers.image.description="A fresh, local-first icon library and management workspace."
LABEL org.opencontainers.image.licenses="MIT"

COPY --from=build --chown=node:node /app/package.json /app/package-lock.json ./
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --from=build --chown=node:node /app/.openai ./.openai
COPY --from=build --chown=node:node /app/vite.config.ts /app/next.config.ts ./
COPY --from=build --chown=node:node /app/build ./build
COPY --from=build --chown=node:node /app/worker ./worker

EXPOSE 3000

USER node

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"

CMD ["npm", "run", "start", "--", "--host", "0.0.0.0", "--port", "3000"]
