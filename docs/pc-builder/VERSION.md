---
feature_code: pc-builder
service: compzy
version: 2
spec_version: 2
testcase_version: 2
architecture_version: 2
database_version: 2
last_updated: 2026-11-16
---

# pc-builder — Version Lock

Version lock for this feature's helicopter-view overviews (`TRD.md`,
`BackendSchema.md`, `ImplementationPlan.md`), maintained by
`/code-preparation`. Not a source of truth for anything else — `spec.md`,
`testcase.md`, `architecture.md`, and `database.md` each carry their own
version/spec_version fields; this file only pins the three summaries
above to the design state they were last refreshed against.

- `spec_version: 2` — spec.md's merged version (PR 78), the manager's
  English/Indonesian language revision; the design and every test case are
  built against it.
- `testcase_version: 2` — testcase.md's merged version (PR 79), which
  pins `spec_version: 2` and adds TC-069 to TC-099 for REQ-042 to REQ-060.
- `architecture_version: 2` — architecture.md's version: the language
  revision (one new endpoint, one request field, one response field, no
  server-side translation) on top of the v1 design (PR 76).
- `database_version: 2` — database.md's version: adds
  `customers.preferred_language` (+ `customers.updated_at`) in one appended
  migration batch, `0005_customers_preferred_language.sql`; no table, no
  index, no change to `0001`–`0004`, and no DDL written here.
