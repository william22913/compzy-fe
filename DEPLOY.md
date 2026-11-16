# Deploying compzy-fe

compzy-fe is a static build of the PC Builder, served by nginx. The same nginx
process proxies `/api/` to the compzy-be service, so the browser only ever
talks to this app's own origin: one port, one cookie, no CORS in the browser.

The image is self-contained. The only deployment input is the address of the
API.

## Run locally

Requirements: Node 20, and compzy-be running or reachable.

```sh
npm ci
npm run dev        # http://localhost:5173, /api proxied to http://localhost:8080
```

The dev server (and `npm run preview`) proxy `/api` to `VITE_API_PROXY`
(default `http://localhost:8080`) and drop the browser `Origin` header, so a
backend started with `go run ./cmd/api` serves it without any CORS setup.

Production build without Docker:

```sh
npm run build      # dist/
npm run preview    # http://localhost:4173, same /api proxy
```

## Configuration

| Setting | Default | Meaning |
| --- | --- | --- |
| `API_UPSTREAM` | `http://api:8080` | Base URL of compzy-be as seen from the container. nginx forwards `/api/...` here unchanged. |
| published port | `8081:80` in `docker-compose.yml` | Host port for the app. |
| `VITE_API_PROXY` | `http://localhost:8080` | Build-time only; dev and preview proxy target. Not used by the image. |

The upstream must know this app's origin: set the API's `APP_ORIGIN` to the
exact URL the browser uses (`http://localhost:8081` for the compose file
below). Any other `Origin` is refused with `403 ORIGIN_REJECTED`.

nginx answers with `Content-Security-Policy: default-src 'self'` (plus
`img-src 'self' data:`), `X-Content-Type-Options: nosniff`,
`X-Frame-Options: DENY`, and `Referrer-Policy: strict-origin-when-cross-origin`.
The app loads no third-party script, style or font, so the policy needs no
exceptions. Hashed files under `/assets/` are cached for a year; `index.html`
is not cached.

## Preview with the backend

Full stack — database, API and this app — from a folder holding both checkouts:

```sh
docker compose -f compzy-fe/deploy/preview.compose.yml \
               -f compzy-fe/docker-compose.verify.yml up -d --build
```

`deploy/preview.compose.yml` is a workspace convenience that builds both
repositories; `docker-compose.verify.yml` keeps it small (one replica, about
580 MB of limits, raised rate limits) and names the backend directory `be`.
Without that override the base file expects the sibling directory
`compzy-be`.

Then open <http://localhost:8081>.

This app alone, against an API you already run:

```sh
docker compose up -d --build          # API on this host at :8080
```

compose publishes `8081:80` and sets `API_UPSTREAM` to
`http://host.docker.internal:8080`. Point `API_UPSTREAM` at another address
when the API is elsewhere, e.g. a service on the same compose network.

## Smoke check

Seeded data: the API migrations seed the catalogue only — seven categories
(six required, Graphics Card optional) and twenty-one parts. **No customer
accounts are seeded**; create the demo one once:

```sh
curl -s -c cookies.txt -H 'Content-Type: application/json' \
  -d '{"full_name":"Buyer One","email":"buyer1@example.com","password":"Build1234"}' \
  http://localhost:8081/api/v1/auth/register
```

Demo account for the smoke check:

| Email | Password |
| --- | --- |
| `buyer1@example.com` | `Build1234` |

Then, in a browser at `http://localhost:8081`:

1. The home page lists all seven categories and 21 parts, with prices as
   `Rp 1.350.000`. No console errors.
2. Choose one part in each of the six required categories; the total in the
   hero and in the build panel match and update on every choice.
3. Checkout while a required category is empty says which categories are
   still empty.
4. Sign in as `buyer1@example.com` / `Build1234`, check the order review, place
   the order, and land on the confirmation page with an order reference and
   the same total.
5. Reload the confirmation page: the order still loads (it is read back from
   the API, not from memory).

Command-line checks:

```sh
curl -sI  http://localhost:8081/ | head -1                  # 200, security headers
curl -s   http://localhost:8081/api/v1/catalogue | head -c 200
curl -sI  http://localhost:8081/order-review | head -1      # 200 (SPA fallback)
```

The last one matters: any path that is not a file returns `index.html`, so a
bookmark or a reload on `/order-confirmation/<id>` works.
