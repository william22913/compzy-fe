# compzy-fe

The React frontend for **compzy**, a small computer store's PC Builder: choose one
part per category, watch the total, and order the build. The API is the separate
`compzy-be` service; this app renders pages and calls that API on its own origin.

## Stack

- React 18.3 + Vite 5, JavaScript/JSX, React Router 6.
- Plain CSS in `src/styles/app.css`, ported from the approved design mock
  (design tokens, square corners, Didone display type, one vermilion accent).
- **No nexcomponent, no nexcommon, no Ant Design** — the feature's non-goals
  exclude house libraries, and the approved `UIMap.md` directs the design's own
  component classes to be ported instead.
- Native `fetch` in one client (`src/core/api/client.js`); no state library —
  three React contexts (auth, catalogue, build) are enough.
- Tests: Vitest + React Testing Library for units; Playwright for the journeys.

## Layout

```
src/app/        App root, providers, router
src/core/api/   one fetch client, adapters (wire shape in, domain shape out)
src/core/services/  catalogueService, authService, orderService
src/features/   builder, auth, checkout, errors
src/helpers/    money (rupiah), buildStorage, validation
src/locales/    en.json — every visible string
src/store/      AuthContext, CatalogueContext, BuildContext
src/styles/     app.css (design tokens + screen rules from the mock)
```

## Conventions

- API base path `/api/v1`; the app calls it on its own origin (`/api`), which
  nginx and the Vite dev server proxy to the Go service.
- Money is integer rupiah from the API; the frontend formats it once, as
  `Rp 12.500.000`.
- Ids are opaque strings; never parse or reorder them.
- Every user-visible string comes from `src/locales/en.json`.
- Server errors are shown by their translated `message`, keyed by their stable
  `code` (see the error contract in the feature docs).

## Commands

```sh
npm ci
npm run dev          # http://localhost:5173, proxies /api to the backend
npm run build
npm run lint
npm test             # Vitest
npm run test:e2e     # Playwright (desktop + mobile projects)
```

## Feature docs

- `pc-builder` — PC part picker and checkout:
  [spec](docs/pc-builder/spec.md) · [test cases](docs/pc-builder/testcase.md) ·
  [architecture](docs/pc-builder/architecture.md) · [UI map](docs/pc-builder/UIMap.md) ·
  [data design](docs/pc-builder/database.md)
