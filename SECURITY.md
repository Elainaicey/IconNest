# Security policy

## Reporting a vulnerability

Please do not disclose exploitable security issues in a public issue. Use
GitHub's private vulnerability reporting for this repository and include the
affected version, reproduction steps and expected impact.

## Security model

- Uploaded SVG is parsed and stripped of scripts, event handlers, embedded pages
  and external references before it enters the library.
- The production image runs as a non-root user. The Compose profile adds a
  read-only filesystem, drops Linux capabilities and exposes only a loopback port.
- Private workspace content is stored in the user's browser and is not uploaded
  to the IconNest server.
- Third-party icons are requested from Iconify through validated same-origin API
  routes. Individual icon-set licenses still apply.

Security fixes are provided for the current `0.1.x` line on the `main` branch.
