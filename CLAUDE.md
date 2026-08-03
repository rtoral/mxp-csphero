# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

CSP Hero: a Rails 8 + React app that collects browser [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP) violation reports (via `report-uri`/`report-to`) and lets users analyze them in a dashboard. Free/open-source; see README.md for product framing.

## Commands

Setup (idempotent):
```bash
bin/setup            # bundle install, db:prepare, clears logs/tmp, then execs bin/dev
bin/setup --skip-server
```

Run dev server (Rails on :3000 + Vite + TS watch, via foreman/Procfile.dev):
```bash
bin/dev
```

Tests (Minitest, no RSpec):
```bash
bin/rails test                              # full suite
bin/rails test test/models/report_test.rb   # single file
bin/rails test test/models/report_test.rb -n test_name_or_line
```

Type-check the frontend (no separate JS test runner is wired up):
```bash
npm run check-types         # one-shot
npm run check-types-watch   # watch mode (also runs as part of bin/dev)
```

Background jobs (Solid Queue, DB-backed — no Redis):
```bash
bin/jobs   # runs SolidQueue::Cli, used standalone in production (see docker-compose.yml `worker` service)
```

CI (`.github/workflows/test.yml`) runs, in order: `npm install` → `npm run check-types` → `bin/rails db:reset` → `bin/rails test`, against a real Postgres service container. There is no JS test suite currently enabled (commented out in the workflow).

## Architecture

**Ingest is decoupled from processing.** `POST /report/:token` (`ReportsController#create`, unauthenticated, CSRF-exempt) does the minimum: looks up the `Website` by its per-site `token`, stores the raw headers/body as-is, and enqueues `ProcessReportJob`. The job (queue `:ingest`) calls `Report#parse!`, which normalizes the two wire formats browsers actually send:
- legacy `report-uri`: `{"csp-report": {"document-uri": ..., hyphenated keys}}`
- modern `report-to`/Reporting API: an array of `{"type": "csp-violation", "body": {camelCase keys}}`

Both get normalized into the same hyphenated-key column set on `Report`. This split exists so the public beacon endpoint stays a cheap single insert regardless of load; keep new parsing logic in `Report#parse!`/`extract_violation`, not in the controller.

**Data model hierarchy:** `User` → (through `Membership`, which carries `role`: regular/admin/owner) → `Company` → `Website` → `Report`. Every `Website` has a unique random `token` (used in the public ingest URL) and a validated `domain`. `AggregatedReport` is not a persisted model — it's a query-only class over `Report` that group-counts violations for the dashboard's summary view. `Report.time_series`/`Report.base_scope` centralize the range/filter logic (`24h`/`7d`/`30d`/`90d`, disposition, blocked_uri, source_file, extension noise filtering) shared between the aggs, list, and time_series API endpoints — reuse `base_scope` rather than re-deriving filters.

**Auth is Devise, session/cookie-based**, scoped to the whole app (not just `/api`). `ApplicationController` has no shared logic yet (empty); each `Api::*` controller declares its own `before_action :authenticate_user!`. The frontend's `api.ts` relies on this being cookie-based: it sends `credentials: "include"` and manually attaches the `X-CSRF-Token` meta tag on every request. If auth or the frontend/backend split ever changes (e.g. token-based auth), both sides of that contract in `api.ts` need to move together.

**Frontend is a Vite-built React SPA mounted inside the Rails view** (`app/views/app/index.html.erb` via `app/javascript/entrypoints/index.ts` → `app/javascript/app/start.tsx`), using `vite_rails`/`vite-plugin-ruby` — not a standalone deployable app. Routing is client-side (`HashRouter` in `App.tsx`), and `App` boots by calling `Api.users.me()` to get the current user + their companies/websites tree before rendering anything (`app/javascript/app/api.ts`, `app/javascript/app/App.tsx`). All API calls go through the single `api()` helper in `api.ts`, prefixed with `/api`, matching `config/routes.rb`'s `namespace :api`.

**Every model exposes `go_json`** as its own hand-written JSON serialization method (no `ActiveModel::Serializer`/Jbuilder). When adding fields consumed by the frontend, update both the model's `go_json` and the corresponding TS type in `app/javascript/app/models.ts`.

TypeScript is configured maximally strict (`tsconfig.json`: all strict flags on, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, etc.) — respect that rather than loosening it for convenience.

## Deployment shape (relevant when reasoning about infra changes)

Single Docker image (multi-stage `Dockerfile`, builds JS + precompiles assets, runs via Thruster/Puma) shared by three services in `docker-compose.yml`: a one-shot `migrate` (`db:prepare`), `web`, and `worker` (`bin/jobs`) — `web`/`worker` both wait on `migrate` completing so multi-pod deploys never race migrations. Solid Queue means the worker requires the same relational Postgres database as the web tier, not a separate broker.
