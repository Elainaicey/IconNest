# Changelog

IconNest uses [Semantic Versioning](https://semver.org/).

## [0.1.0] - 2026-07-31

Initial public version.

### Application

- Local-first icon library backed by IndexedDB
- Multi-file SVG import with sanitization and duplicate detection
- Iconify search across five curated open-source icon sets
- Collections, tags, favorites, recent items and trash
- Batch actions, JSON backup, SVG ZIP export and PNG export
- SVG, HTML, React and CSS Mask delivery formats
- Command menu, collapsible sidebar, light/dark themes and responsive layouts

### Operations

- Next.js standalone production runtime on Node.js 24
- Hardened single-container Docker Compose profile
- Caddy configuration for `iconnest.ushio.cc`
- Multi-architecture GHCR images with SBOM and provenance
- Automated type, lint, page, API, storage and deployment checks

### Security

- Non-root container with read-only filesystem and dropped Linux capabilities
- Validated same-origin Iconify proxy routes
- No known production dependency vulnerabilities at publication time
