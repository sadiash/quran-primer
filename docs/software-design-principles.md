
  ## 1. Architecture

  ### Separation of Concerns
  - Each module has ONE job. If you can't
  describe it in one sentence, split it.
  - Routes handle HTTP. Services handle
  business logic. Repositories handle data.
    Never mix layers.
  - No god files. If a file exceeds 300
  lines, it's doing too much.

  ### Dependency Direction
  - Dependencies point inward: Routes →
  Services → Repositories → Database.
    Never the reverse.
  - Core business logic has ZERO framework
  imports. It should be testable
    with plain function calls.
  - Use dependency injection over hard
  imports for anything with side effects
    (DB, HTTP, filesystem, clock).

  ### API Design
  - Every endpoint returns a consistent
  envelope: { success, data, error, meta }.
  - Use proper HTTP status codes. Don't
  return 200 with { error: true }.
  - Version your API from day one (/api/v1/).
   It costs nothing now, saves
    everything later.
  - Pagination, filtering, and sorting are
  query params, not body fields.
  - Every list endpoint supports cursor-based
   pagination.

  ---

  ## 2. Non-Functional Requirements

  ### Reliability
  - Every external call (DB, API, cache) has
  a timeout. No infinite waits.
  - Circuit breakers on all external
  dependencies. Three states: closed,
    open, half-open.
  - Retry with exponential backoff + jitter
  on transient failures.
    Never retry non-idempotent operations.
  - Graceful shutdown: drain connections,
  finish in-flight requests,
    close pools, then exit.
  - Health checks: /health/live (process up)
  and /health/ready
    (dependencies reachable). Never combine
  them.

  ### Scalability
  - Stateless processes. Session state lives
  in an external store (Redis, DB),
    never in process memory.
  - Connection pooling on every database and
  external service client.
  - Horizontal scaling is the default
  assumption. No singleton patterns
    that break with multiple instances.
  - Background jobs are separate processes,
  not timers in the web server.

  ### Performance
  - Measure before optimizing. Add response
  time logging from day one.
  - Response compression (gzip/brotli) on all
   responses.
  - Cache-Control headers on every endpoint.
  Think about whether data is
    private or public, and what max-age makes
   sense.
  - Database queries: no SELECT *, no N+1,
  parameterized always.
    Explain any query that touches > 10K
  rows.
  - Pagination is mandatory. No endpoint
  returns unbounded result sets.

  ### Security
  - Authentication on every endpoint except
  health checks and login.
    Default-deny, not default-allow.
  - Authorization checks at the data layer,
  not just the route layer.
    A user should never see another user's
  data even if they guess the ID.
  - All user input validated at the boundary
  (Zod, Joi, JSON Schema).
    Never trust. Never sanitize when you can
  reject.
  - Parameterized queries only. Zero string
  interpolation in SQL.
  - Secrets: environment variables only.
  Fail-fast on startup if missing.
    Never log secrets. Never commit .env
  files.
  - CSRF protection on all state-changing
  operations (SameSite cookies + CORS
    origin validation at minimum).
  - Rate limiting: global baseline + stricter
   per-endpoint limits on
    auth endpoints (login, register, password
   reset).
  - Security headers: HSTS, CSP,
  X-Frame-Options, X-Content-Type-Options,
    Referrer-Policy, Permissions-Policy.
  - httpOnly + secure + sameSite cookies for
  auth tokens.
    Never store tokens in localStorage.

  ### Observability
  - Structured logging (JSON). Every log
  entry has: timestamp, level,
    requestId, message, context.
  - Request IDs generated at the edge,
  propagated through every layer,
    returned in response headers.
  - Three pillars: logs (what happened),
  metrics (how much/how fast),
    traces (the path through the system).
  - Error tracking with context: request URL,
   method, user ID, stack trace.
    Deduplicate by fingerprint.
  - Log levels mean something: ERROR = pages
  someone, WARN = investigate soon,
    INFO = normal operations, DEBUG =
  development only.

  ### Maintainability
  - TypeScript with strict mode. No `any`
  except at system boundaries
    with explicit type assertions.
  - Consistent code formatting enforced by
  tooling (Prettier), not humans.
  - Linting catches bugs, not style (ESLint
  with rules that matter,
    not 200 nitpick rules).
  - Every function has a single return type.
  No functions that return
    string | null | undefined | false.

  ### Testability
  - Unit tests for business logic (fast, no
  I/O, no mocks if possible).
  - Integration tests for API routes (real
  HTTP, mocked dependencies).
  - No test that depends on execution order
  or shared mutable state.
  - Test the behavior, not the
  implementation. Tests should survive
  refactors.
  - Coverage thresholds enforced in CI — not
  100%, but enough to catch
    regressions (70% lines, 60% branches as a
   baseline).

  ### Deployability
  - CI pipeline: lint → type-check → test →
  build → security audit.
    Runs on every push.
  - One command to build. One command to
  deploy. One command to rollback.
  - Feature flags over long-lived branches.
  Trunk-based development.
  - Database migrations are versioned,
  forward-only, and reversible.
    Every up migration has a corresponding
  down migration.
  - Docker builds produce the same image for
  staging and production.
    Environment differences come from env
  vars, not build args.

  ### Recoverability
  - Database backups automated and tested. A
  backup you've never
    restored is not a backup.
  - Every destructive operation (delete,
  cache clear) requires
    authentication and is logged with who did
   it and when.
  - Idempotent operations wherever possible.
  Safe to retry, safe to
    replay.

  ---

  ## 3. Design Principles

  ### Data Flow
  - Unidirectional data flow. Data enters at
  the boundary, transforms
    through layers, exits at the boundary. No
   circular dependencies.
  - Single source of truth for every piece of
   state. If two components
    need the same data, lift it up or use a
  shared store. Never duplicate.
  - Optimistic UI with rollback. Show the
  expected state immediately,
    reconcile with the server, rollback on
  failure.

  ### Error Handling
  - Errors are values, not surprises. Every
  function that can fail
    communicates how through its type
  signature.
  - Fail fast at boundaries, recover
  gracefully internally.
    Validate input at the edge. Handle errors
   close to where they occur.
  - User-facing errors are actionable
  ("Session expired, please log in again").
    Internal errors are detailed ("MySQL
  connection refused on 3306 after 10s").
    Never mix them.
  - Error responses include a
  machine-readable code (RATE_LIMIT_EXCEEDED)
    AND a human-readable message. Clients
  switch on codes, not messages.

  ### Frontend (if applicable)
  - Component hierarchy mirrors data
  hierarchy. If the data is nested,
    the components are nested. If it's flat,
  they're flat.
  - State lives at the lowest common ancestor
   that needs it. Not higher.
  - Loading, error, and empty states for
  every async operation.
    No component should ever show a blank
  screen.
  - Accessibility is not optional: semantic
  HTML, ARIA labels, keyboard
    navigation, color contrast, screen reader
   testing.
  - Responsive by default. Mobile-first CSS.
  No horizontal scrolling
    on any viewport.

  ### What NOT To Do
  - No premature abstraction. Three similar
  blocks of code is fine.
    Abstract on the fourth occurrence, not
  the second.
  - No "just in case" code. Don't handle
  cases that can't happen.
    Don't add config for things nobody asked
  for.
  - No backwards compatibility with nothing.
  V1 has no legacy to support.
    Delete dead code. Don't add migration
  paths for data formats
    that don't exist yet.
  - No comments explaining what. Only
  comments explaining why.
    If the code needs a comment to explain
  what it does, rewrite the code.
  - No TODO comments without a linked issue.
  A TODO without accountability
    is a lie.

  ---

  ## 4. Definition of Done

  A feature is done when:
  1. The code compiles with zero warnings
  2. All tests pass (existing + new for the
  feature)
  3. The CI pipeline is green
  4. The happy path, error path, and edge
  cases are handled
  5. The feature works without JavaScript
  (progressive enhancement) OR
     gracefully degrades with a clear message
  6. An engineer unfamiliar with the codebase
   can understand the change
     by reading the code alone (no tribal
  knowledge required)
