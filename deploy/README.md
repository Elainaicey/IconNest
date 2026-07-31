# IconNest production deployment

This profile runs exactly one application container. Caddy stays on the host and
forwards HTTPS traffic to the loopback-only port `127.0.0.1:3001`.

## Files on the VPS

Clone the repository into `/opt/iconnest` instead of downloading only the Compose
file. The directory will then contain the Compose profiles, `.env`, deployment
examples, source, license and documentation, while Docker still pulls the
prebuilt GHCR image.

```bash
sudo git clone --depth 1 https://github.com/Elainaicey/IconNest.git /opt/iconnest
cd /opt/iconnest
sudo cp .env.example .env
sudo docker compose pull
sudo docker compose up -d
sudo docker compose ps
```

## Caddy

Merge `deploy/Caddyfile.example` into `/etc/caddy/Caddyfile`, validate, then
reload Caddy:

```bash
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

## Updates and rollback

```bash
cd /opt/iconnest
sudo git pull --ff-only
sudo docker compose pull
sudo docker compose up -d --remove-orphans
```

For a reproducible rollback, change the image tag in `docker-compose.yml` from
`latest` to a known `sha-...` tag, then run `docker compose pull && docker compose
up -d` again.

## Data model

IconNest is local-first: icons, collections, favorites and tags are saved in each
browser's IndexedDB. Therefore the server container is stateless and intentionally
has no volume. Restarting or replacing the container does not erase browser data;
clearing site data, switching browser profiles or changing the domain does. Use
the in-app JSON backup before those operations.

## Operations

```bash
sudo docker compose ps
sudo docker compose logs --tail=100 iconnest
curl -fsS http://127.0.0.1:3001/api/health
sudo docker stats iconnest
```
