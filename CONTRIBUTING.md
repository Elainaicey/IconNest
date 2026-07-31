# Contributing to IconNest

Thanks for helping improve IconNest. Please keep changes focused, accessible and
consistent with the local-first privacy model.

## Development

```bash
npm ci
npm run dev
```

Before opening a pull request, run:

```bash
npm run lint
npm run typecheck
npm test
```

UI changes should preserve keyboard focus, readable contrast, responsive layouts
and reduced-motion behavior. Use semantic Radix color steps instead of arbitrary
decorative colors. New persistence code must include a migration path and must
not silently upload private icon content.
