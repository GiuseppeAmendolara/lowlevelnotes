# LowLevelNotes working brief

## Product

LowLevelNotes (also branded **0xLLN**) began as a personal collection of technical
notes, books, and learning resources. Its direction is to become a modern,
full-featured learning platform for mastering software development, especially
low-level and systems-oriented topics.

Phase 0 (UI design and identity) established the current visual system — see
the design-system contract below. Phase 1 (SQL data model) and Phase 2
(course-catalog REST API) are both complete and live. Phase 3
(authentication primitives — registration, login/logout, session
management, password recovery, email verification, change-password) is
also complete and live, but scoped to auth only: the user-scoped course
endpoints it unblocks (enroll, mark-lesson-complete, quiz-attempt,
`/me/progress`, `/me/statistics`) were deliberately deferred rather than
bundled in. Phase 4 (authorization roles — an admin panel, a
request-and-approve path from student to contributor/instructor, and a
reviewed resource-submission pipeline) is also complete and live. The
learning system itself (Phase 7+) is still not implemented — the schema
and API are groundwork, not a green light to start building lesson UI
ahead of its own phase. Real course content (replacing the Phase 1 test
seed) is deferred to its own later pass, not tied to a numbered phase.

## Current stack

- Frontend: React, Next.js, TypeScript, Tailwind CSS
- Backend/API (planned/current architecture): Cloudflare Workers API and
  Cloudflare D1 (SQLite)
- Delivery: GitHub push → GitHub Actions → Vercel build/deploy → Cloudflare domain

## Roadmap

1. **Phase 0 (complete):** UI design and implementation.
2. **Phase 1 (complete):** SQL/data model for users, courses, modules, lessons,
   and related learning data. Schema is live in D1 and seeded with test
   content (`worker/migrations/`) — see "Data and API direction" below for
   the concrete tables and decisions.
3. **Phase 2 (complete):** REST API redesign with clear HTTP methods, status
   codes, validation, pagination, rate limiting, error handling, and API
   versioning. Shipped: the course catalog (`GET /v1/courses`,
   `GET /v1/courses/:slug`, `GET /v1/courses/:slug/lessons`). The
   user-scoped resources (enrollment, progress, quizzes, statistics) were
   deferred — they need real identity, which didn't exist until Phase 3,
   and were deliberately not bundled into it either (see Phase 3 below).
4. **Phase 3 (complete):** Authentication: registration, login/logout,
   password recovery, email verification, and session management, plus
   change-password. Shipped as `/v1/auth/*` in `worker/index.js` —
   PBKDF2-SHA256 password hashing (the platform's actual ceiling on
   Cloudflare Workers, see "Data and API direction"), D1-backed sessions
   and single-use tokens, Resend for email delivery. Deliberately did
   **not** include the deferred Phase 2 course endpoints (enroll,
   progress, quiz attempts, statistics) — those remain unbuilt, now
   unblocked by the `getSessionUser()` helper this phase added, but
   correctly belong to whichever next slice picks them up rather than
   having been silently smuggled into "auth."
5. **Phase 4 (complete):** Authorization roles: guest, student, contributor,
   instructor, administrator. Shipped as `/v1/staff/*`, `/v1/role-requests*`,
   and `/v1/resource-requests*` in `worker/index.js`, plus `/admin` and
   `/contribute` in the frontend — see "Data and API direction" below and
   the API endpoint reference for the concrete design.
6. **Phase 7:** Learning system: explanations, code examples, diagrams,
   interactive “try it yourself” exercises, questions, quizzes, and lesson
   completion.
7. **Phase 8:** Exercises, including standard-library-free programming tasks and
   x86-64 assembly tasks.
8. **Phase 9:** Progress: course/lesson progress, quiz scores, exercise results,
   and achievements.
9. **Phase 10:** Gamification: goals, XP, badges, levels, streaks, certificates,
   and leaderboards.

## Future implementation reference

These are planning notes, not authorization to begin future phases early.

### Next.js and TypeScript learning targets

- Next.js App Router: layouts, nested and dynamic routes, route groups, loading
  states, error boundaries, `not-found.tsx`, Server/Client Components, Server
  Actions, Route Handlers, middleware/proxy, caching, revalidation, and static
  versus dynamic rendering.
- Intended course URLs: `/courses`, `/courses/[course]`, and
  `/courses/[course]/[lesson]`. An example path is
  `/courses/computer-architecture/cpu`.
- TypeScript: types, interfaces, unions/intersections, generics, utility types,
  narrowing, discriminated unions, type guards, mapped/conditional types,
  `typeof`, `keyof`, `satisfies`, and `as const`.
- Lessons will have a stable identifier, title, and a type such as article,
  video, exercise, or quiz.

### Data and API direction

- Schema is live in D1 (`lowlevelnotes-db`), defined in
  `worker/migrations/0001_phase1_learning_platform.sql`: `users`, `courses`,
  `modules`, `lessons`, `enrollments`, `lesson_progress`, `exercises`,
  `questions`, `answers`, `quiz_attempts`. Seeded with test/placeholder
  content via `worker/migrations/0002_seed_test_content.sql` (one row per
  enum value — one user per role, one lesson per type — not real course
  material).
- `worker/` (the Worker source and its migrations) is intentionally **not
  tracked in git** — it lives only on disk, gitignored, to avoid publishing
  the API implementation and schema. `wrangler d1 migrations apply` still
  works normally since it reads local files regardless of git tracking; a
  fresh clone of this repo will not have `worker/` and needs it recreated
  from the live Worker source before running migrations.
- Core relationships: users enroll in courses and track lesson progress; courses
  contain modules; modules contain lessons.
- Lesson content lives in markdown files (path referenced by
  `lessons.content_path`), not as DB blobs — matches the existing notes
  content and the site's git/PR contribution model, not a CMS.
- A quiz is a `lessons` row with `type = 'quiz'` (owning `questions` →
  `answers`), not a separate `quizzes` table.
- `users.role` does not include `guest` — a guest is an unauthenticated
  visitor with no row, not a stored role value.
- Schema changes go through `wrangler d1 migrations` (`worker/migrations/`),
  not ad-hoc SQL — apply with
  `wrangler d1 migrations apply lowlevelnotes-db --remote` from `worker/`.
- The API should serve the web app now and remain suitable for future mobile and
  CLI clients.
- New Phase 2+ endpoints are versioned under a `/v1` path prefix (e.g.
  `/v1/courses`), so a future breaking change can ship as `/v2` without
  disrupting existing clients. Pre-Phase-2 endpoints (`/resources`,
  `/tools`, `/people`, `/changelog`, `/resource/:id`, the `.svg` badges)
  are intentionally left unversioned at their current paths — they're
  already live and consumed by the site and external embeds, so adding a
  prefix now would itself be a breaking change.
- User-scoped endpoints (`enroll`, `/me/progress`, `lessons/:id/complete`,
  `quizzes/:id/attempt`, `/me/statistics`) were deferred during Phase 2
  rather than built behind an invented/unverified identity — see
  WORKLOG's "Phase 2 kickoff" entry for the reasoning. Real identity now
  exists (Phase 3's `getSessionUser()`), but these were deliberately kept
  out of Phase 3 too, on the same strict-scoping principle — they're an
  explicit next slice, not silently bundled into "auth."
- **Phase 3 (authentication), concrete decisions** — see WORKLOG's "Phase
  3" entry for the full security reasoning:
  - Password hashing: PBKDF2-HMAC-SHA256, 100,000 iterations, via
    `crypto.subtle` — not a tuning choice, `workerd` hard-caps PBKDF2 at
    100,000 iterations regardless of plan (below OWASP's usual
    600,000-iteration recommendation, but the actual platform ceiling;
    Workers has no Node `crypto`, so no native bcrypt/argon2 either).
    Stored as a self-describing string in `users.password_hash`
    (`pbkdf2-sha256$<iterations>$<salt>$<hash>`, all base64) so a future
    algorithm change never needs a migration.
  - Sessions and single-use tokens live in D1 (`sessions`, `auth_tokens`,
    `auth_events` — `worker/migrations/0003_phase3_authentication.sql`),
    not KV/Durable Objects, since no such binding exists and D1 already
    holds `users`. Every token (session, email-verification,
    password-reset) is SHA-256 hashed before storage, same principle as
    passwords — the raw value is shown to the client exactly once.
  - Auth works via **both** `Authorization: Bearer <token>` (mobile/CLI)
    and an `HttpOnly`/`Secure`/`SameSite=Strict` cookie scoped to
    `api.lowlevelnotes.com` (a future browser client) — no frontend
    consumes either yet. Sessions are a flat 30-day expiry, no "remember
    me," no refresh-token rotation (deliberately excluded — see WORKLOG).
  - Email delivery is via **Resend** (`RESEND_API_KEY`, set as a Worker
    secret via `wrangler secret put`, never in `wrangler.toml` or
    `.env.local`). When unset, registration/resend-verification echo the
    link in the API response (labeled, for local testing); forgot-password
    **never** does this in any configuration state — echoing a
    password-reset link would let anyone read a working account-takeover
    token by just POSTing a known email, which defeats that endpoint's
    entire enumeration-safety property. It only ever logs server-side.
  - Full endpoint list: `POST /v1/auth/register`, `POST .../login`,
    `POST .../logout`, `GET .../session`, `PUT .../change-password`,
    `POST .../forgot-password`, `POST .../reset-password`,
    `GET .../verify-email`, `POST .../resend-verification`.
- Planned endpoints include `GET /courses`, `GET /courses/:id`,
  `GET /courses/:id/lessons`, `POST /courses/:id/enroll`,
  `GET /me/progress`, `POST /lessons/:id/complete`,
  `POST /quizzes/:id/attempt`, and `GET /me/statistics`.
- **`api.lowlevelnotes.com`'s WAF blocks generic scripted HTTP clients**
  (bare `curl`, Node's own `fetch` — sends `User-Agent: node`) on almost
  every path except `/health`, regardless of the path being otherwise
  public. Discovered building the auth frontend: a Next.js Server
  Component's server-side `fetch()` to the Worker gets a 403 from
  Cloudflare, both locally and once deployed (Vercel's Node runtime hits
  the same block) — this is not a local-only artifact like the earlier
  bot-fight/Referer issue. Two ways through: a genuine browser's fetch
  (what every auth page now uses, client-side, exactly like
  `authClient.ts`), or the `x-internal-key` WAF-bypass header (what
  `src/lib/api.ts`'s server-only `apiFetch()` uses — appropriate only for
  genuinely internal, non-public calls, not for something like
  verify-email where the token itself is the public credential). Any
  future page that needs to call the Worker server-side must account for
  this rather than assuming a plain `fetch()` will work.
- **`GET /resources`, `/tools`, `/people` now require a session** — the
  library is gated to logged-in users (user's explicit request); these
  three return 401 without `getSessionUser()` succeeding. `/library`
  fetches them client-side only, after confirming a session, matching
  `/account`'s pattern — not server-rendered, since the Next.js server
  can't see the session cookie anyway (see the host-only cookie note
  above) and a server-rendered-then-hidden page wouldn't actually
  restrict the data. Any response carrying per-session data (these three,
  plus `GET /v1/auth/session`) sets `Cache-Control: private, no-store`
  explicitly (the `NO_STORE` constant near `json()`) — don't rely on
  Cloudflare's default cache-bypass for dynamic Worker responses; it was
  observed serving a stale pre-deploy response for about a minute after
  this gate first shipped.
- **Library asset files live in R2 (`lowlevelnotes-assets` bucket, `ASSETS`
  binding), not `public/`.** Gating the `/library` page and its JSON
  endpoints did nothing for the actual PDFs/notes as long as they sat in
  Next.js's `public/` folder — static files there are always served with
  no possible auth check, dirbustable regardless of what the app code
  does. `GET /v1/library/assets/*` (`getLibraryAssetV1` in
  `worker/index.js`) streams objects from R2 after the same
  `getSessionUser()` check, plus its own dedicated rate limit (60
  downloads/hour per user, `asset_download` in `auth_events` —
  `worker/migrations/0004_asset_download_rate_limit.sql` recreated that
  table to add the CHECK value, since SQLite has no `ALTER` for
  constraints). `resources.path` in D1 is unchanged (`./assets/pdfs/...`)
  — `LibraryBrowser.tsx`'s `resolveHref()` rewrites local paths to the
  gated endpoint URL at render time rather than the data being migrated.
  R2 object keys mirror the old `public/assets/` relative paths exactly
  (e.g. `pdfs/cpp.pdf`, `drafts/Networks/networks.md`).
- **Phase 4 (authorization roles), concrete decisions:**
  - Role upgrades (student → contributor/instructor) and resource
    submissions both go through an explicit request-and-approve pipeline
    (`role_requests`, `resource_requests` — `worker/migrations/0005`),
    not auto-grant/auto-publish — an admin reviews every one. One live
    `role_requests` row per user at a time, enforced by a partial unique
    index (`WHERE status = 'pending'`), not application logic alone.
  - A resource submission is either a link (`url`) or an uploaded file
    (`r2_key`), never both — enforced by a CHECK constraint
    (`(url IS NOT NULL) + (r2_key IS NOT NULL) = 1`), computed *before*
    the insert (the R2 key is a random token, not derived from the row's
    own id, avoiding a chicken-and-egg problem with an id that doesn't
    exist yet).
  - Uploaded files live under a `pending/<token>/<filename>` R2 prefix
    until reviewed. Approval copies the object to
    `contributed/<request_id>/<filename>` (R2 has no rename) and deletes
    the pending copy; rejection just deletes it. `resources.path` is set
    to that same key — no `./assets/` prefix needed, since
    `LibraryBrowser.tsx`'s `resolveHref()` only strips that prefix if
    present, and passes an unprefixed path through unchanged.
  - `resources.submitted_by_user_id` is a **separate** column from the
    older `author_id` (which points at `people.id`, a display-credit
    table for showcasing authors, external or not — unrelated to real
    accounts). The two can name different people: `author_id` is who
    should be *credited*, `submitted_by_user_id` is who *actually
    submitted it* through this pipeline. Both `submitted_by_user_id` and
    both request tables' `reviewed_by`/`resource_id` foreign keys use
    `ON DELETE SET NULL`, not the SQLite default — a resource or a
    request record should outlive the account that touched it, not block
    that account's deletion (`worker/migrations/0007`, `0008` — found by
    actually hitting the constraint while cleaning up test data, not
    anticipated in advance).
  - A ban (`users.banned_at`/`ban_reason`) kills the banned user's
    session **immediately** on the next `getSessionUser()` call (deletes
    the session row, not just refuses the one request) and blocks
    `loginV1` from issuing a new one — checked *after* the password
    check in login, so a ban never leaks to someone who doesn't already
    know the password. Deleting a user is a **separate**, harsher action
    (hard `DELETE`, cascades via the existing FKs) — both exist because
    they serve different needs: ban is the reversible day-to-day
    moderation tool, delete is for genuine cleanup. Both refuse to let an
    administrator act on their own account (no self-ban, no
    self-delete) — a safety guard against accidental lockout, not
    enforced by D1 in any way.
  - An admin-created account (`POST /v1/staff/users`) reuses the
    password-reset token/email machinery exactly as-is —
    `password_hash` starts `NULL` (the same state the Phase 1 seed users
    use), and a `password_reset` token is issued immediately so the
    "set your password" link is indistinguishable from a normal reset
    email. No separate flow was built for this.
  - IP blocking is a **real** Cloudflare edge block, not an in-app
    check: the admin panel's "block this IP" action calls Cloudflare's
    IP Access Rules API directly (`cloudflareApi()` in `worker/index.js`,
    scoped to the site's Cloudflare zone via `CLOUDFLARE_ZONE_ID` — that
    constant's actual value is deliberately not written out here or
    anywhere else in a tracked file), using a **new**,
    narrowly-scoped Worker secret, `CLOUDFLARE_WAF_TOKEN` (`Zone →
    Firewall Services: Edit` only on `lowlevelnotes.com` — deliberately
    separate from the developer's own `.env.local` token, which has
    broader D1/R2/WAF-*rule* edit and never leaves this machine). There's
    no D1 mirror of blocked IPs — the Cloudflare API is queried live, so
    it can never drift out of sync with what's actually enforced. When
    blocking an IP from a flagged user's IP list, the association is
    folded straight into that Cloudflare rule's own `notes` field
    (`"Blocked via admin panel — associated with user #42 (email)"`)
    rather than a separate table, so it's visible in the Cloudflare
    dashboard too, not just this admin panel.
  - `/v1/staff/*`, not `/v1/admin/*` — WAF Rule 2 blocks any path
    `contains "/admin"`, a real collision discovered while planning this
    (not hypothetical), avoided by renaming rather than carving an
    exemption into that rule.
  - `getUserIpsStaffV1` reads distinct IPs from **both** `sessions.ip`
    and `auth_events.ip` (`identifier = ` the user's numeric id as a
    string) — no new IP-tracking table, since Phase 3 already logs both
    on every login/session and every rate-limited action.
  - `CLOUDFLARE_WAF_TOKEN` is set and verified working (list/block/unblock
    all confirmed live). It must be created **without** a Client IP
    Address Filtering restriction — the Worker calls it from Cloudflare's
    distributed edge, not a fixed IP, so any IP restriction fails with an
    opaque "Authentication error" regardless of which IP is chosen (hit
    this exact issue once — see WORKLOG's "Two secrets, two real bugs").
    The permission scope alone (`Zone → Firewall Services: Edit`) is what
    keeps this token safe, not an IP filter.

#### API endpoint reference

The canonical list — kept in sync with the route dispatch table at the
top of `worker/index.js`'s `fetch()` handler (source of truth; this
table is a snapshot of it) whenever a route is added, removed, or its
auth requirement changes. Also what Rule 5's non-GET lockdown on the
main domain is scoped against — see below.

**`api.lowlevelnotes.com`** (Worker):

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/health` | none | also handles its own `OPTIONS` |
| GET | `/status.svg`, `/history.svg`, `/stats.svg` | none | SVG badges, embeddable |
| GET | `/resources`, `/tools`, `/people` | session | 401 without a valid session |
| GET | `/changelog` | none | WAF still requires a browser or `x-internal-key` (see below) |
| GET | `/v1/courses`, `/v1/courses/:slug`, `/v1/courses/:slug/lessons` | none | |
| POST | `/v1/auth/register`, `/login`, `/forgot-password` | none | |
| POST | `/v1/auth/reset-password` | none | authenticates via the single-use token in the body, not a session |
| POST | `/v1/auth/logout` | none¹ | ¹no-ops the DB delete if there's no session, but always clears the cookie |
| POST | `/v1/auth/resend-verification` | session | 401 without one |
| GET | `/v1/auth/session` | session | 401 without one |
| GET | `/v1/auth/verify-email` | none | authenticates via the query-string token |
| PUT | `/v1/auth/change-password` | session | |
| GET | `/v1/library/assets/*` | session | streams from R2, own 60/hour/user rate limit |
| GET | `/resource/:id` | none | current view count |
| POST | `/resource/:id` | none | directly callable — WAF Rule 2 explicitly exempts `POST /resource/*` from its suspicious-UA check, unlike most other paths |
| POST | `/v1/role-requests` | session | request `contributor`/`instructor`; 409 if a pending request already exists |
| GET | `/v1/role-requests/me` | session | own request history |
| POST | `/v1/resource-requests` | contributor/instructor/administrator | `multipart/form-data`; exactly one of `url` or `file` |
| GET | `/v1/resource-requests/me` | session | own submission history |
| GET | `/v1/resource-requests/:id/file` | owner or administrator | streams a pending file for review |
| GET, PUT | `/v1/staff/role-requests`, `/v1/staff/role-requests/:id` | administrator | list (filterable `?status=`) / approve or reject |
| GET, PUT | `/v1/staff/resource-requests`, `/v1/staff/resource-requests/:id` | administrator | list (joined with requester email + role) / approve or reject |
| GET, POST | `/v1/staff/users` | administrator | list / create (see below) |
| PUT | `/v1/staff/users/:id/role`, `/ban`, `/unban` | administrator | direct role change; ban kills active sessions; both ban and delete refuse the admin's own account |
| DELETE | `/v1/staff/users/:id` | administrator | hard delete, cascades |
| GET | `/v1/staff/users/:id/ips` | administrator | distinct IPs from `sessions`/`auth_events` |
| GET, POST, DELETE | `/v1/staff/blocked-ips` | administrator | proxies Cloudflare's IP Access Rules API directly — no D1 mirror |

**`lowlevelnotes.com`** (Next.js — the only server-side route handler in the app):

| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/api/resource/[id]` | none (server-to-server via `x-internal-key`) | proxies to the Worker's `POST /resource/:id`, called by `LibraryBrowser.tsx`; this is why Rule 5's non-GET exemption only names this one path — every other mutating call (auth, library data) goes straight from the browser to `api.lowlevelnotes.com`, bypassing the Next.js server entirely (see the host-only cookie note above) |

### Security and roles

- Understand and use established solutions for sessions, cookies, JWTs, refresh
  tokens, CSRF, XSS, OAuth, password hashing, and authorization; do not design
  bespoke authentication cryptography.
- Cloudflare Turnstile guards `/register`, `/login`, and `/forgot-password`
  (site key `0x4AAAAAAEdKEFa7n07s2OQ1` — public, safe to keep in client code;
  only the secret key needs protecting, held as the Worker secret
  `TURNSTILE_SECRET`, set via `wrangler secret put`, never in a tracked file).
  `TurnstileWidget.tsx` renders the challenge explicitly (not the implicit
  `cf-turnstile` div) so the token lands in form state; each form disables
  submit until a token exists and resets the widget after every attempt,
  since tokens are single-use regardless of outcome. `verifyTurnstile()` in
  `worker/index.js` checks the token against Cloudflare's `siteverify`
  endpoint, requiring the returned `action` to match the endpoint being hit
  (so a token solved on `/login` can't be replayed against `/register`) and
  the returned `hostname` to be ours — runs before any rate-limit bookkeeping
  or DB work in `registerV1`/`loginV1`/`forgotPasswordV1`.
- Students read courses, complete lessons, take quizzes, and track progress.
- Contributors create and edit lessons. Instructors create courses, manage
  exercises, and view student statistics. Administrators have full access.

### Learning and motivation model

- A lesson can combine explanation, code examples, diagrams, an interactive
  “try it yourself” area, questions, a quiz, and completion tracking.
- Example introductory course flow: What is a CPU? → Registers → Instruction
  cycle → ISA → ten-question quiz.
- Example exercises: reverse a string without the standard library; write an
  x86-64 function returning the maximum of two integers.
- Possible profile surface: a current level, XP total, course/lesson progress,
  quiz scores, exercise results, and unlocked achievements (for example, first
  lesson, first quiz, C fundamentals, or a seven-day streak).

## Visual identity

Keep the experience dark, technical, and legible. This file is the source of
truth for the current palette:

- Background: `#171717`; deep background: `#0D0D0D`
- Primary text: `#FFFFFF`; muted text: `#A1A1AA`
- Accent: `#FF8A3D`; hover: `#FFA15C`; deep: `#C95E1A`; dark: `#3A2113`
- Success: `#3FB950`; error: `#F85149`

`#3FB950` (success) and the status badge's "degraded" amber `#D29922` are
both taken from GitHub's dark theme; `#F85149` (error, introduced for the
auth forms) is that same theme's danger/error red — keep pulling from
that lineage rather than introducing unrelated hues for future status
colors.

`src/lib/site.ts` is the source of truth for site branding and metadata. Preserve
the existing positioning: “Organized knowledge for mastering software
development.”

## UI consistency protocol

The homepage is the canonical visual reference for the platform. Future pages
and components must extend its established design system rather than introduce
a competing visual language.

- Before building or substantially restyling a UI surface, inspect the homepage
  and shared styling/components. Reuse their spacing, typography, color,
  border, shadow, icon, interaction, and responsive conventions.
- Do not invent one-off values or component variants when an existing token or
  pattern can be reused. Promote genuinely repeated values to shared tokens or
  components instead.
- Keep the visual character slick, modern, dark, technical, and intentionally
  restrained. Prioritize hierarchy, contrast, readability, and purposeful
  motion over decorative effects.
- Maintain a single shape language. Corner radius, border weight, and surface
  treatment must be consistent across cards, buttons, inputs, navigation, and
  dialogs. Do not mix sharply squared and heavily rounded components unless a
  documented semantic reason requires it.
- Maintain a single interaction language: matching hover, focus, active,
  disabled, loading, and mobile behavior for equivalent components. Preserve
  visible keyboard focus and accessible contrast.
- When a homepage visual decision is made, record its concrete values below
  before using it elsewhere. Treat this section as the design-system contract.

### Design-system contract

Complete these values during the homepage visual pass, then use them consistently
throughout the product:

- **Corner radius / shape language:** Square/straight edges; use no decorative
  rounding. The interface should feel precise and technical.
- **Border and surface treatment:** One-pixel, low-contrast white borders on
  deep charcoal surfaces. Use orange sparingly as an active or primary signal.
- **Typography scale and weights:** JetBrains Mono throughout; bold, tight,
  display-style headings with muted, comfortable body copy.
- **Spacing rhythm:** Use generous section spacing and a compact 24–32 px rhythm
  within panels; align content to the `max-w-6xl` page grid.
- **Shadows, glows, and depth:** Prefer borders, subtle charcoal contrast, and
  restrained amber radial light. Avoid soft card shadows.
- **Motion and interaction timing:** Short, quiet color and position transitions;
  no distracting or continuous animation.
- **Form pattern:** `src/components/auth/{AuthPageShell,AuthTextField,AuthSubmitButton,AuthMessage}.tsx`
  are the canonical primitives for any single-form page (label + input,
  filled-orange submit with a loading/disabled state, inline
  success/error message with the small-square marker convention). Reuse
  these rather than hand-rolling form markup elsewhere.
- **Transactional email treatment:** `buildAuthEmailHtml()` in
  `worker/index.js` — table-based layout, inline styles only (mail
  clients strip `<style>` blocks and most webfonts), dark charcoal
  background, the `"0x"`/`"LLN"` split-color wordmark, filled-orange CTA
  button with a plain-text fallback link underneath. Reuse for any future
  transactional email rather than hand-writing new markup per message.

## Working principles

- The maintainer is new to web development: explain changes plainly and keep
  implementation steps approachable.
- Do not introduce later-phase functionality unless it is explicitly requested.
- Avoid duplication: reuse existing components, tokens, and data definitions
  where practical.
- Keep the `UI consistency protocol` and its design-system contract up to date
  whenever a homepage design decision becomes a reusable platform convention.
- Treat existing uncommitted changes as user work. Do not discard or overwrite
  unrelated edits.
- The user has granted standing permission to operate on the live Cloudflare
  Worker and D1 database (`lowlevelnotes-db`) via the Cloudflare MCP
  integration and the `CLOUDFLARE_API_TOKEN` in `.env.local`
  (`D1:Edit` + `Workers Scripts:Edit` scope) — no need to ask before running
  read or write operations through either path while auto mode is on. A
  `.claude/settings.local.json` permission rule allows `wrangler` CLI
  invocations (`npx wrangler ...`) without a prompt; the MCP D1 tool was
  never gated to begin with. This does not extend to git history rewrites,
  force-pushes, or revoking/rotating the token itself — those still get
  confirmed explicitly.
- `CLOUDFLARE_API_TOKEN` now also has **`Zone → WAF → Edit`** (scoped to
  the `lowlevelnotes.com` zone) and **`Workers R2 Storage: Edit`**
  (2026-08-26) — added specifically so custom WAF/Security Rules for the
  domain and R2 object management (used by the gated library-asset
  endpoint, see below) can be handled the same standing-permission way as
  D1/Worker changes already are. Note the WAF permission is `Zone WAF
  Write` — a *zone*-scoped grant, not the account-level `Rule Policies`
  permission that also appears in the token editor (that one is a
  separate, thinly-documented Account permission group, unrelated to this
  domain's Security Rules page; not added, not needed here).
- Zone security layers, outside-in: Cloudflare's **Managed Free
  Ruleset** (`http_request_firewall_managed` phase, 31 narrow CVE/exploit
  signatures — Log4Shell, Shellshock, WordPress plugin CVEs — enabled
  2026-08-26), then the 5 hand-written **custom rules**
  (`http_request_firewall_custom` phase: countries + AI-crawler UAs,
  suspicious-UA/path-probe blocklist, anchored referer checks on the API
  and on main-domain `/assets/`, non-GET lockdown on the main domain),
  then **IP Access Rules** (separate quota, single-IP blocks). The
  crawler UA list in rule 1 is meant to track this site's own
  `robots.txt` Content-Signal policy (`ai-train=no`, Cloudflare-managed
  block list) — if that policy ever changes, the WAF list needs a
  matching update, since robots.txt itself is advisory only and doesn't
  enforce anything on its own. Local point-in-time backups of the live
  config live in `/cloudflare-backups/` (gitignored, pulled via the API
  before/after a review pass — not automatically kept in sync).

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
