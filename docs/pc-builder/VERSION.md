---
feature_code: pc-builder
service: compzy
version: 1
spec_version: 1
testcase_version: 1
architecture_version: 1
database_version: 1
last_updated: 2026-11-16
---

# pc-builder — Version Lock

Version lock for this feature's helicopter-view overviews (`TRD.md`,
`BackendSchema.md`, `ImplementationPlan.md`), maintained by
`/code-preparation`. Not a source of truth for anything else — `spec.md`,
`testcase.md`, `architecture.md`, and `database.md` each carry their own
version/spec_version fields; this file only pins the three summaries
above to the design state they were last refreshed against.

- `spec_version: 1` — spec.md's merged version (PR 74); the design and
  every test case are built against it.
- `testcase_version: 1` — testcase.md's merged version (PR 75), which
  pins `spec_version: 1`, matching the spec.
- `architecture_version: 1` — architecture.md's version, first design
  pass for this feature (PR 76).
- `database_version: 1` — database.md's version, first design pass; the
  schema is new, in four migration batches, and no DDL is written here.
