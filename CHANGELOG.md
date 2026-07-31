# Changelog

All notable changes to IconNest are documented here. The project follows
[Semantic Versioning](https://semver.org/) after its first stable release.

## [0.2.0] - Unreleased preview

### Added

- IndexedDB workspace persistence with automatic localStorage migration and
  visible save status
- Multi-file and drag-and-drop SVG import, ZIP asset export and 512px PNG export
- Command menu, collapsible navigation and collection rename/delete management
- Acrylic pastel design system, responsive workspace and reduced-motion particle
  ambience
- Hardened single-container Compose profile, Caddy example and production
  operations guide

### Changed

- Replaced the template runtime with standard Next.js standalone output for a
  smaller, clearer production image
- Simplified the project tree by removing unused D1, Cloudflare Worker and Sites
  starter code
- Expanded CI with type checking, multi-architecture container builds, SBOM and
  provenance generation

### Security

- Production container runs as a non-root user with a read-only filesystem,
  dropped capabilities, resource limits and a dedicated health endpoint
- Production dependency audit currently reports no known vulnerabilities
