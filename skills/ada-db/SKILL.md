---
name: ada-db
description: Use when designing database schemas, writing migrations, or tuning SQL queries.
---
# ada-db

- Database Schema & Migration Rules:
  - Design paradigm: Adhere to standard normalization rules (1NF-3NF) for transactional DBs, and dimensional/star schemas for analytical DBs.
  - Reversible migrations: Always write UP/DOWN migration scripts. Never mutate production databases ad-hoc.
  - Query optimization: Execute `EXPLAIN` or `EXPLAIN ANALYZE` on complex queries. Add indices only on high-cardinality/filtered columns.
  - Connection management: Ensure correct connection pooling, query timeouts, and retry policies are defined.
