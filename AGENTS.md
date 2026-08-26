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
bundled in, and no Next.js/frontend work exists yet against any of this.
The current priority is **Phase 4: authorization roles**. The learning
system itself (Phase 7+) is still not implemented — the schema and API are
groundwork, not a green light to start building lesson UI ahead of its own
phase. Real course content (replacing the Phase 1 test seed) is deferred to
its own later pass, not tied to a numbered phase.

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
5. **Phase 4 (current):** Authorization roles: guest, student, contributor,
   instructor, administrator.
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

### Security and roles

- Understand and use established solutions for sessions, cookies, JWTs, refresh
  tokens, CSRF, XSS, OAuth, password hashing, and authorization; do not design
  bespoke authentication cryptography.
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

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
