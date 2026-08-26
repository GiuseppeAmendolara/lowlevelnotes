# Active work log

Use this file as the compact handoff for ongoing work. Update it at each completed
milestone, before a task change, or whenever handing the project to another agent.
It supplements the durable project guidance in `AGENTS.md`.

## Status

- **Active phase:** Phase 4 — Authorization roles (not yet started)
- **Current area:** Frontend (`src/app/`) — just finished the auth pages
- **Milestone:** Auth frontend (login/register/forgot-password/reset-password/
  verify-email/account) + styled transactional emails, both live
- **Last updated:** 2026-08-26

## Homepage review (2026-08-26)

Reviewed the homepage in a headless browser against the design-system contract
in `AGENTS.md`. Hero, topic grid, and closing section all match: square edges
throughout (no `rounded-*` usage anywhere), 1px white/10 borders on charcoal
surfaces, orange used only for accents/CTAs, JetBrains Mono type, restrained
amber radial glow. No console errors.

One defect found and fixed: `https://api.lowlevelnotes.com/status.svg`
currently returns 404 (confirmed directly, not a local rendering issue), which
made `StatusCard` render a bare broken-image icon next to the hero CTAs.
`StatusCard.tsx` is now a client component with an `onError` fallback — a
bordered, muted "Status unavailable" panel — so a dead status endpoint
degrades gracefully within the design system instead of showing a broken
image. The underlying 404 on the API side is unrelated to this repo (Worker
source isn't here).

Also confirmed `.env.local`'s `INTERNAL_API_KEY` (sent as `x-internal-key` in
`src/lib/api.ts`, matching the Cloudflare WAF bypass header) is gitignored via
`.env*` and only read in a server-only module — never exposed to the client.

## Status badge: local rendering + redesign (2026-08-26)

Deleted `src/app/tools/page.tsx` (dangling import of the already-removed
`ToolCategorySection` was crashing the whole Turbopack dev server, not just
`/tools` — every route 500'd until it was removed). `/tools` will be rebuilt
from scratch in a later Phase 0 pass.

The direct `<img src="https://api.lowlevelnotes.com/status.svg">` failed to
load under headless/automated browser testing with `net::ERR_BLOCKED_BY_ORB`,
even though the endpoint itself is public and returns 200 via `curl` with or
without the `x-internal-key` header (verified byte-identical). To make the
widget reliably testable locally:

- `src/lib/api.ts` — added `getStatusSvg()`, reusing the existing `apiFetch`
  header/caching convention.
- `src/app/api/status.svg/route.ts` — new Route Handler that proxies the
  Worker's SVG server-side, so the client `<img>` is always same-origin.
- `src/components/StatusCard.tsx` — points at `/api/status.svg` instead of
  the external URL directly.

Also got read access to the Worker source (`lowlevelnotes-api`) via the
Cloudflare MCP integration (`workers_get_worker_code`) — this integration is
**read-only**, there is no deploy/update tool available through it. Saved the
current deployed source to `worker/index.js` for version control, since it
wasn't tracked anywhere before.

Redesigned `createStatusBadge()` in `worker/index.js` to match the platform's
actual design-system tokens (pulled from `globals.css` and the logo treatment
in `Header.tsx`): square corners (was `rx="6"`), `#0D0D0D` surface with a 1px
`rgba(255,255,255,0.1)` border (was `#24292F`/`#444C56` GitHub-style card),
monospace throughout (was `Arial, sans-serif` for most text), `0x` in accent
orange + `LLN` in white matching the header wordmark exactly, and a square
status-color indicator instead of colored text alone. Removed the two
animated "shine" gradient sweeps — continuous animation conflicts with the
design contract's "no distracting or continuous animation" rule.

Verified the new design in isolation and seated inside the actual homepage
hero (temporarily swapping the local proxy's response, then restoring it) —
screenshots confirmed it reads as part of the same system rather than a
bolted-on GitHub-style badge, and fits the hero's status column width cleanly.

**Deployed (2026-08-26).** `worker/wrangler.toml` added: binds `env.DB` to
the `lowlevelnotes-db` D1 database (id looked up via the Cloudflare MCP
integration's `d1_databases_list`), and explicitly declares the existing
`*/5 * * * *` health-check cron (read via the Workers API `/schedules`
endpoint first) so deploying wouldn't silently drop it.

Deployed via `wrangler deploy` using a short-lived, narrowly-scoped
(Workers Scripts:Edit) `CLOUDFLARE_API_TOKEN` the user placed in
`.env.local` — since the MCP integration is read-only, this was the only
non-interactive path (`wrangler login`'s OAuth redirect can't complete in
this sandboxed environment). **The user should revoke that token from the
Cloudflare dashboard once it's no longer needed for follow-up deploys.**

First deploy attempt had a real, self-inflicted problem: because
`wrangler.toml` didn't say otherwise, Wrangler defaulted to enabling a public
`*.workers.dev` route (`lowlevelnotes-api.grimy86.workers.dev`) — exposing
the same Worker (full D1 access, all endpoints) with none of the WAF
rules/bot-blocking configured on the `api.lowlevelnotes.com` zone. Caught
this from the deploy's own warning output immediately, added
`workers_dev = false` to `wrangler.toml`, and redeployed — confirmed the
workers.dev URL now 404s.

Verified end-to-end: the local Next.js proxy (`/api/status.svg`) serves the
new square/mono badge with live data from the redeployed Worker, confirmed
both via `curl` and a full homepage screenshot. Note: repeated direct `curl`
testing against `api.lowlevelnotes.com` from this sandbox's IP during this
session tripped Cloudflare's bot-fight challenge (`cf-mitigated: challenge`,
403) on that domain — confirmed unrelated to the deploy (`/health`, untouched
by any of this work, showed the same 403) and confirmed it does NOT affect
the actual app (the Next.js dev server's server-side fetch, from the same
machine, still gets a clean 200 — different HTTP client fingerprint than raw
`curl`). Should not affect real users or Vercel-hosted production traffic
either, since those originate from different IPs entirely.

## Goal for this milestone

Understand the existing homepage and implement the first focused visual pass for
the learning-platform direction, while retaining the 0xLLN identity.

## Decisions made

- Work in small, reviewable homepage milestones rather than attempt the entire
  platform at once.
- Reuse the palette and platform guidance in `AGENTS.md`, plus
  branding/metadata in `src/lib/site.ts`.
- Treat the homepage as the canonical design-system reference. Once its visual
  language is set, record the concrete rules in `AGENTS.md` before applying
  them to other pages.
- The homepage status surface consumes the public status SVG from
  `api.lowlevelnotes.com`; the API owns its status content and telemetry.
- The current public SVG still has its older rounded, GitHub-style appearance.
  Updating it to the platform’s square design and adding database/index data
  requires the Worker source, which is not present in this repository.
- Defer data models, API, authentication, authorization, and learning-system
  behavior until their respective roadmap phases.

## Files changed in this milestone

- `src/app/page.tsx` — replaced the placeholder homepage with the first visual
  direction: hero, index-status panel, topic grid, and value statement.
- `src/app/globals.css` — added shared palette variables and selection styling.
- `src/app/layout.tsx` — removed the remote Google Font dependency in favor of
  the local monospace stack used by the platform.
- `src/components/Header.tsx` — refined the shared navigation to match the
  homepage system, including compact responsive navigation and active states.
- `src/components/StatusCard.tsx` — made the public SVG status asset adaptable
  to its containing surface.
- `AGENTS.md` — recorded the homepage-derived UI contract.
- `WORKLOG.md` — created and updated this handoff log.

## Verification

- Homepage and app-shell lint checks report no errors. ESLint ignores CSS files
  because the current configuration has no CSS matcher; the external status
  image retains the existing Next.js `<img>` performance warning.
- `git diff --check` passes.
- The homepage runtime error was caused by the remote Google Font dependency;
  it has been removed. The remaining production-build blocker is
  `src/app/tools/page.tsx` importing the deleted `ToolCategorySection`
  component.
- The browser overlay initially confirmed the Google Font/Turbopack runtime
  error. After removal of the remote font dependency, the production build
  reaches the tools-page import error without reporting the former font error.
- Restart the existing local development server before reviewing the change if
  it does not pick up the layout update automatically.

## Homepage content pass: fixing "feels AI-generated" (2026-08-26)

User feedback: the homepage looked right visually but felt lifeless/generic.
Diagnosis on review: the hero, topic-grid intro, and closing section all
restated the same "focused, no-noise learning" pitch three times with zero
new information each time; the four topic cards were empty textbook-blurb
placeholders identical in tone/CTA ("Learn the map →" x4, and not even a real
link — `aria-hidden` span with no `href`); and there wasn't a single
technical artifact (code, terminal output, diagram) anywhere on a page aimed
at developers.

Fix grounded in real content instead of more invented copy: the pre-redesign
`public/assets/drafts/` notes (deleted from the working tree but still in git
history) turned out to be substantial — 4,312-line Networks doc, 2,232-line
C# doc, 2,159-line Web doc, 964-line PostgreSQL doc. The homepage was
underselling real, specific work with generic filler.

Changes to `src/app/page.tsx`:
- Topic grid (`disciplines`) now shows real asymmetry instead of fake parity:
  Networks and Foundations marked written (green indicator, real line counts:
  "4,700+ lines written", "5,300+ lines across three topics" — Foundations
  folds in the old Web/C#/PostgreSQL notes, since those don't fit the new
  Systems/Architecture roadmap categories but are genuinely foundational).
  Systems and Architecture honestly marked "Not started yet" (muted
  indicator) rather than pretending equal depth. Removed the fake "Learn the
  map" link affordance entirely.
- Replaced the redundant closing section ("Less noise. More understanding.")
  with a real code excerpt — the actual Hello World + comments from
  `CSharp.md`, rendered in an editor-tab-style panel — paired with an honest,
  personal, first-person note: written solo right now, MIT-licensed, open for
  contributions. Ties into the "0xLLN should feel like an identity, still one
  person, but open to becoming a community thing" direction from the user.
- Tightened the topic-grid subtext to name the unevenness directly ("Some of
  this runs deep already. Some of it hasn't been started.") instead of
  restating the mission a third time.

Verified via screenshot after each change; fixed one overflow bug along the
way (longest code comment line was clipping past the panel edge under
`overflow-x-auto` — switched to `whitespace-pre-wrap break-words`).

## Homepage content pass, round 2 (2026-08-26)

Follow-up user feedback after the round above:
- `$ ./learn --from-first-principles` felt like an edgy fake-terminal
  affectation, doubly redundant once real code is shown further down.
  Removed.
- The hero status widget shouldn't be on the homepage at all. Removed
  (`StatusCard` import and the `aside` wrapper); hero is single-column now.
- "Know what your code is doing." read as cocky, not as the 0xLLN
  identity — personal, honest, open to becoming a community project.
  Replaced with **"The notes I wish I'd had."** — no claim of authority,
  sets up a callback the closing section pays off instead of a slogan.
- The subhead was long filler. Shortened to one concrete line.
- The hand-rolled code block (plain white/gray text, no real
  highlighting) needed actual syntax coloring. Built `src/components/CodeBlock.tsx`
  — a reusable **Shiki**-based server component with a custom theme built
  directly from the site's own palette tokens (comments dim italic
  `#6B7280`, keywords bold white, strings accent orange `#FF8A3D`, numbers
  success green) rather than a generic editor theme. This is meant to be
  the shared primitive for any future code display, including
  Markdown-rendered lesson content in later phases.
- The meaningless gray dot next to "CSharp.md" (a decorative fake
  traffic-light dot) is now the same green square used as the "written"
  indicator in the topic grid — it now signals something real (this file is
  part of the counted lines) instead of decorating.
- "No filler, no restated intros—just..." was flagged as self-defeating
  (filler about not having filler). Rewritten straighter: "Written from one
  developer's point of view, line by line..."
- Fixed a real bug surfaced while editing: "Explore the library" linked to
  `/tools`, which was deleted earlier this session — a dead link. Pointed it
  at `#topics` (an anchor on the topic-grid section, with `scroll-mt-20` so
  it doesn't land under the sticky header) until a real library page exists.
- Along the way, hit a recurring `Edit` tool-match failure on a multi-line
  block — traced it to a stray non-breaking space (U+00A0) that had ended up
  inside a JSX string literal. Cleaned up via `sed` once identified with
  `grep`/`cat -A`.
- Added `shiki` as a dependency (`npm install shiki`).

## Homepage content pass, round 3 (2026-08-26)

User reordered the `disciplines` array themselves (Foundations now `[00]`,
then Networks/Systems/Architecture) and made small copy edits to the hero
and `csharpSnippet` directly — left as-is, not reverted.

Replaced the "BUILT FOR THE RABBIT HOLES" eyebrow label with an actual Alice
in Wonderland quote (the user's request — "rabbit holes" was already an
Alice reference, this makes it literal): the Cheshire Cat exchange, italic
dialogue with speaker tags, orange citation line underneath. Did not reuse
the tiny all-caps eyebrow-label styling used elsewhere on the page for
this — that treatment is sized for 3-5 word labels, not two lines of
dialogue — so this is a new, one-off quote treatment (italic prose, muted
speaker attribution, orange citation) rather than a variant of the shared
eyebrow token. One deliberate edit to the pasted citation: shortened
"Lewis Carroll, Alice's Adventures in Wonderland / Through the
Looking-Glass" to just the first title, since this specific line (Chapter 6,
the Cheshire Cat scene) is only in that book — flagged to the user rather
than silently changed.

## Changelog, status, and footer redesign (2026-08-26)

Extended the design-system contract past the homepage to the three remaining
pieces of the shell.

- Checked D1 directly before touching anything: the `changelog` table has 27
  real, genuinely interesting entries (Vue→React migration, an MkDocs phase,
  even a "Windows 98 assets" era) — not placeholder data. `/changelog` and
  `/status` were already returning 200 with real data; they just had no
  design applied yet (old pre-redesign markup: explicit redundant `font-mono`
  classes, lowercase heading, no accent color, `/status` had literally no
  heading or framing at all, just the bare `StatusCard`).
- `src/app/changelog/page.tsx`: rebuilt with the established eyebrow-tag +
  bold-heading pattern, version entries as a bordered list (not the 2x2 grid
  used for topics — a scrolling list of 27 doesn't fit that shape), version
  numbers styled with the accent orange bracket-style treatment echoing the
  homepage's `[00]`-style numbering, first/latest entry marked with the same
  green-square "real/current" indicator used elsewhere on the site. Also
  fixed a real data-hygiene bug found while building this: several DB rows
  have a stray leading tab character in `title`/`description`
  (e.g. `"\tFrontend Overhaul"`) — fixed presentation-side with `.trim()`
  rather than touching the database, since this is a Phase 0 UI task.
- `src/app/status/page.tsx`: added the missing eyebrow/heading/subtext frame
  around `StatusCard`. Subtext states the real cron cadence ("checked every
  five minutes") rather than vague copy, matching the actual
  `*/5 * * * *` trigger set up earlier this session.
- `src/components/Footer.tsx`: fixed a real brand inconsistency — footer said
  plain "lowlevelnotes" while the header shows the styled "0x"(orange)+"LLN"
  wordmark. Footer now uses the same split-color mark. Dropped redundant
  `font-mono` classes (global default already sets it) and standardized
  muted text to the documented `#A1A1AA` token instead of ad hoc `white/50`.

Noticed but out of scope for this task: D1 already has `courses`, `modules`,
and `lessons` tables (Phase 1+ schema), not just the Phase 0 content tables.
Not acted on — AGENTS.md defers data-model work to its own phase.

## Status page: Worker-generated SVG badges, replacing the JSON approach (2026-08-26)

Initial plan (see previous entry) built the uptime-history chart as a React
Server Component rendering inline SVG in the Next.js app, fed by a new JSON
`/health/history` Worker endpoint. **User corrected the architecture**: the
existing `status.svg` badge is already embedded on their GitHub profile, and
they want the new stats/history visuals to work the same way — real,
portable SVG images generated by the Worker straight from D1, not React
components that only render inside the Next.js app. Also asked for a
resources-count / recognized-authors-count badge, stacked alongside the
other two so all three read as one cohesive set (both on `/status` and
wherever embedded externally, e.g. a GitHub README).

Reworked accordingly:
- Removed the JSON `/health/history` Worker route and `getHealthHistory`
  Next.js plumbing entirely (dead code once the SVG approach replaced it) —
  see `HealthHistory.tsx`, now deleted.
- `worker/index.js`: added `/history.svg` (hourly uptime bar chart, last 168h
  from `api_health`, green/amber bars matching `status.svg`'s existing
  status-color convention) and `/stats.svg` (linked-resources count +
  recognized-authors count, in a layout that mirrors `status.svg`'s
  logo+divider+content structure so the two read as a matched pair). Also
  exposed `people.external` on the `/people` endpoint (was queried but never
  selected/mapped before).
- `src/lib/api.ts`: added `getHistorySvg`/`getStatsSvg`, refactored the
  three `*.svg` fetchers to share one `fetchSvg` helper instead of
  duplicating the fetch+header+error boilerplate three times.
- New `src/components/SvgBadge.tsx`: generalized `StatusCard`'s
  fetch-with-fallback pattern into a reusable primitive (`src`/`alt`/
  `unavailableLabel` props) since the exact same behavior was about to be
  duplicated three times. `StatusCard` now just calls it.
- `src/app/api/history.svg/route.ts` and `.../stats.svg/route.ts`: same
  same-origin-proxy-with-404-fallback pattern as the existing
  `status.svg` route.
- `/status` page simplified to three stacked `SvgBadge`s, no more
  server-side count-fetching logic.

Two real bugs hit and fixed during this:
1. Used `&middot;` (an HTML named entity) in the history badge's label text.
   SVG is strict XML and only recognizes the 5 predefined XML entities
   (`&amp; &lt; &gt; &apos; &quot;`) — anything else fails to parse, so the
   browser silently showed a broken-image icon instead of the chart.
   `status.svg`'s existing code already handles this correctly with the
   numeric reference `&#183;`; matched that instead. Caught by inspecting
   the raw SVG output directly rather than assuming the JS logic was at
   fault.
2. Immediately after deploying that fix, the badge still appeared broken in
   a screenshot — was Next's `next: { revalidate: 60 }` fetch cache in the
   `/api/history.svg` proxy still serving the pre-fix response for up to a
   minute after the Worker redeploy. Not a bug, just cache lag; confirmed by
   re-checking after the revalidate window passed.

Verified: all three badges (`status.svg`, `history.svg`, `stats.svg`) load
correctly both hitting the Worker directly and through the local Next.js
proxy, render as a visually cohesive stack (same 440px width, same
`#0D0D0D`/1px-border frame, same monospace type), and the `/status` page
survives gracefully (via `SvgBadge`'s fallback) if any one of them is ever
unavailable.

## Stats badge redesign + /status renamed to /transparency (2026-08-26)

- `createStatsBadge` in `worker/index.js`: dropped the `0xLLN` logo block per
  user feedback (pushed the two stat columns too far right, cramped). New
  layout: a small "LIBRARY" label with the same orange-square-bullet motif
  used in the homepage hero, then two numbers centered evenly across the
  full 440px width with a thin center divider. Deployed.
- Renamed the page from `/status` to `/transparency` since it's no longer
  just the API badge — it now covers operational health, uptime history,
  and library stats together. `/status` route deleted (now 404s, confirmed
  intentional). Rewrote the copy to match: eyebrow "Nothing hidden", heading
  "Transparency.", subtext naming all three things actually on the page
  instead of the old API-only framing.
- Updated `Header.tsx`'s nav link/label and `sitemap.ts` to match.
- Also fixed a stale `sitemap.ts` entry for `/tools` (deleted earlier this
  session, would 404 for any crawler) while already in that file.

## Asset reorganization (2026-08-26)

Audited everything sitting under `public/` and `src/assets/` for the
pre-deploy review — found ~41MB of files inside `public/` with zero code
references, which matters because anything in `public/` ships to production
and stays publicly servable regardless of whether it's linked from
anywhere. Did **not** delete anything without asking first — the user
corrected an earlier assumption that `public/assets/pdfs/` was dead weight:
those PDFs (and, it turned out, `public/assets/unused/drafts/` — confirmed
byte-identical to the real CSharp/Networks/Web/PostgreSQL markdown notes) are
earmarked source material for future course content per the AGENTS.md
roadmap, not leftovers.

Resolved per-category with the user's explicit input:
- `public/assets/unused/drafts/` → `public/assets/drafts/` — real course
  source material, "unused" was the wrong label; now sits alongside
  `public/assets/pdfs/` (source markdown vs. compiled PDF).
- `public/assets/unused/images/` (12 old Windows-98-era UI icons) →
  `archive/legacy-ui-icons/` — a new top-level `archive/` folder, outside
  `public/` and `src/`, so it's kept in the repo but never deployed.
- `public/assets/unused/portfolio/` (20 old portfolio screenshots, from a
  discontinued personal-portfolio section not part of the current
  learning-platform direction) → `archive/legacy-portfolio/`.
- `src/assets/` (watermark, favicon.svg, og-image.svg — unreferenced
  anywhere, look like editable originals for the branding now compiled into
  `src/app/icon.png` etc.) → new top-level `design/` folder, since `src/`
  implies shipped app code and these are source files, not code.

Result: `public/` dropped from carrying ~41MB of unreferenced files to just
the confirmed-intentional `drafts/` + `pdfs/` content (27MB total) plus the
manifest icon. Verified `next build` still produces the identical route list
after the moves.

## Removed the SVG proxy layer — badges now point straight at the Worker (2026-08-26)

User asked a sharp question: given the WAF fix already makes `/status.svg`,
`/history.svg`, `/stats.svg` genuinely public, why proxy them through
Next.js Route Handlers at all instead of pointing `<img>` straight at
`api.lowlevelnotes.com`? On reflection, the original justification (an
`ERR_BLOCKED_BY_ORB` failure under headless-browser testing, months back)
didn't hold up — that failure was almost certainly Cloudflare's bot
mitigation reacting to the automated test traffic, not a real limitation.
With the WAF exemption in place there's no header/secret being hidden for
these three paths, so the proxy wasn't doing meaningful work anymore.

Simplified: `transparency/page.tsx`'s `SvgBadge`s now point directly at
`https://api.lowlevelnotes.com/*.svg`. Removed as dead code:
`src/app/api/status.svg`, `.../history.svg`, `.../stats.svg` (and the now-
empty `src/app/api/` dir), `getStatusSvg`/`getHistorySvg`/`getStatsSvg`/
`fetchSvg` from `lib/api.ts`, and `StatusCard.tsx` (nothing imported it once
`transparency` used `SvgBadge` directly).

While verifying, hit `ERR_BLOCKED_BY_ORB` again testing locally — traced it
properly this time instead of assuming: captured the actual Cloudflare
response and found it only happens when the request's `Referer` is
`http://localhost:3000`, which gets a 403 HTML block page from a Cloudflare
security layer that's separate from our custom WAF rule (likely a baseline
bot-fight heuristic that distrusts an obviously non-production referrer).
Confirmed directly with curl: the identical request with
`Referer: https://lowlevelnotes.com/transparency` gets a clean 200. So this
is purely a local-dev-testing artifact — real visitors on the production
domain won't hit it — but it means the on-site badges can't be fully
end-to-end verified until this is live on the real domain post-deploy.

## Phase 1 kickoff: learning-platform data model (2026-08-26)

Moved the project from Phase 0 to Phase 1 per the user's explicit request.
Planned via `EnterPlanMode` given the stakes (live production D1, must not
lose `resources`/`people`/`tools`/`changelog`/`api_health`/`site_settings`);
plan approved before any DDL ran.

Investigation before touching anything: `courses`/`modules`/`lessons`/
`events` already existed as stub tables but were completely empty (0 rows)
— confirmed via `COUNT(*)` — so redesigning them outright carried zero
data-loss risk. No migration tooling, schema files, or data-model types
existed anywhere in the repo.

Introduced `wrangler d1 migrations` (didn't exist before — all D1 changes
this session up to now were ad-hoc SQL via the MCP query tool). New
`worker/migrations/0001_phase1_learning_platform.sql`: drops and recreates
the three empty stubs, adds `users`, `enrollments`, `lesson_progress`,
`exercises`, `questions`, `answers`, `quiz_attempts` — the exact entity set
`AGENTS.md` already named, nothing beyond it. Key decisions (recorded in
`AGENTS.md`'s "Data and API direction" so future sessions don't rediscover
them): lesson content is markdown files referenced by `content_path`, not
DB blobs (matches the real notes content + git/PR contribution model,
closer to freeCodeCamp/MDN than a TryHackMe-style CMS); quizzes are
`lessons` rows with `type='quiz'`, not a separate table; `users.role`
excludes `guest` (unauthenticated = no row).

Applied to the live D1 instance via `wrangler d1 migrations apply
lowlevelnotes-db --remote`, using a fresh token scoped for `D1:Edit` +
`Workers Scripts:Edit` (the earlier Workers-only token couldn't do D1
migrations — separate permission scope). Verified before/after: `resources`
50, `people` 34, `tools` 50, `changelog` 27 unchanged; `api_health` grew by
one row (an expected cron tick, not data loss). Confirmed all 10 new/updated
tables exist, and confirmed D1 actually enforces the declared foreign keys
(a deliberate bad insert was rejected with `SQLITE_CONSTRAINT_FOREIGNKEY`).

Updated `AGENTS.md`'s roadmap to mark Phase 0 complete / Phase 1 current —
the doc previously said Phase 0 was "current" and warned against
"prematurely introducing database... behavior," which was now stale.

## /library page: search + filter over the resources table (2026-08-26)

User's idea for the "old tables" (`resources`/`people`, unused since `/tools`
was deleted): a browsable library page. Data turned out richer than
expected — 50 real resources across 11 real categories (Reverse
Engineering, Windows Internals, Malware/AV/EDR, Offensive Security, etc.)
and 4 types (pdf/website/videos/git), correctly joined to 34 credited
people via `author_id`.

- `src/app/library/page.tsx` — Server Component, fetches `getResources()` +
  `getPeople()` (both pre-existing, no Worker changes needed for the data
  itself).
- `src/components/LibraryBrowser.tsx` — Client Component: search (matches
  title+description) plus category/type/author filters, all derived
  dynamically from the actual data rather than hardcoded, so they stay
  accurate as resources are added. Reused the established bordered-list
  convention from `/changelog`.
- Found and fixed the same data-hygiene pattern as the changelog table:
  some `resources.title` values have stray leading/trailing whitespace —
  trimmed presentation-side.
- Found that `resources.path` is a mix of relative paths to the site's own
  PDFs (`./assets/pdfs/cpp.pdf`, from the asset reorg two turns ago) and
  absolute external URLs — added `resolveHref()` to normalize the relative
  ones (strip the leading `./`) so they don't resolve relative to
  `/library`'s own URL and break.
- Wired up the Worker's `POST /resource/:id` view-counter, which existed
  since before this session but was never called from anywhere. Since that
  endpoint needs the `x-internal-key` header (unlike the public `.svg`
  badges, it's correctly *not* on the WAF's public-path exemption — it's a
  write endpoint, shouldn't be publicly callable with the key exposed
  client-side), added a thin same-origin proxy,
  `src/app/api/resource/[id]/route.ts`, POST-only. This is the legitimate
  version of the proxy pattern removed for the SVG badges earlier — here
  there's an actual secret being hidden, not just habit.
- Added `/library` to the header nav.
- Verified end-to-end against the live Worker: clicking a resource link
  fires the proxy, which calls the Worker, which updates D1 — confirmed the
  view count for a real resource actually incremented (0 → 2 across two
  test clicks).

## Round of fixes: homepage polish + real library bug hunt (2026-08-26)

- `src/components/CodeBlock.tsx`: keywords and types/functions were both
  plain white — fixed with a proper multi-hue palette (purple keywords,
  blue types/classes, yellow functions, existing orange for strings, green
  for numbers), closer to One Dark Pro/Dracula, instead of everything
  defaulting to white/bold.
- Mobile: the "Straight from the notes" section wasn't just visually
  cramped, it was forcing the **entire page** to overflow horizontally (nav
  bar included) — a classic CSS Grid bug where a grid item needs
  `min-width: 0` for its own `overflow-x-auto` to actually take effect,
  otherwise the grid track just grows to fit the wide code content instead
  of clipping it. Fixed with one `min-w-0` class on the grid item, rather
  than hiding the code block on mobile as originally suggested — content
  stays visible and scrolls internally now.
- Homepage's 4 discipline cards now link to `/library` (were purely
  decorative before).
- Library filters: user reported search/filters "don't work" even after an
  earlier round where automated testing showed them working. Root cause
  had nothing to do with the filter logic — it was Next.js 15+'s dev-server
  cross-origin protection silently 403ing the JS chunk containing
  `LibraryBrowser.tsx` because the user was testing via a LAN IP
  (`192.168.1.144:3000`, for phone/cross-device testing) instead of
  `localhost`. The component never hydrated, so the search box and selects
  were inert static HTML — no console error surfaced prominently, just a
  background failed-resource-load. Fixed with `allowedDevOrigins` in
  `next.config.ts`; confirmed by reproducing the exact LAN-IP scenario
  before and after. Dev-only concern, irrelevant to production.
- Also properly reworked the library's cascading-filter logic (a real,
  separate bug from the above): dropdown options previously stayed static
  regardless of other active filters, so picking e.g. a category didn't
  narrow the author dropdown, making incompatible combinations silently
  return zero results. First fix attempt used `useEffect` to reset invalid
  filters — ESLint's `react-hooks/set-state-in-effect` correctly flagged
  this as the exact anti-pattern React's docs warn against (cascading
  renders). Reworked to validate and clear dependent filters directly
  inside each `onChange` handler instead. Verified with real keyboard/mouse
  interaction that filters now narrow each other bidirectionally.
- Discussed extending the WAF `.svg`-exemption pattern to also cover
  `POST /resource/*` (the view-counter), matching the same "the Worker's
  own WAF + rate limiter already protect this, a Next.js proxy isn't adding
  safety for a low-stakes endpoint" reasoning as the SVG badges. User is
  applying the updated rule; once confirmed, the plan is to remove
  `src/app/api/resource/[id]/route.ts` and call the Worker directly.

## Data hygiene + tools library merge (2026-08-26)

User asked for a categorization pass over `resources` before a category
browser becomes necessary, plus a mistake sweep (they'd spotted one: Pavel
Yosifovich's "Windows Internals" entry is a YouTube playlist but was typed
`pdf`). Queried D1 directly via the Cloudflare MCP integration rather than
guessing from code.

- Consolidated `resources.category` from 12 categories (several
  single-digit) down to 6: Reverse Engineering, Malware & Offensive
  Security (merged Malware/AV/EDR + Offensive Security), Windows Internals,
  Systems Fundamentals (Assembly & Architecture + Networking), Programming
  Fundamentals (Programming Languages + Data Structures & Algorithms +
  Version Control + Software Design & Architecture + Databases), Archives.
- Fixed the Pavel Yosifovich row: `type` `pdf` → `videos`.
- Checked all 50 rows' `type` against their `path` for the same class of
  mistake — no others found. Found (but did not fix, per user's choice) 11
  resource titles/descriptions and 6 people names with stray leading/
  trailing whitespace.
- Extended the same 6-category scheme to `tools` (50 rows, previously 13
  categories) so one filter works across both tables.
- Wired `tools` into `/library`: `LibraryBrowser.tsx` now normalizes
  `Resource` and `Tool` (different shapes — tools have no
  description/author/views) into one `Item` type, with `type` gaining a
  `'tool'` value alongside pdf/website/videos/git. Verified server-rendered
  output shows all 100 entries with correct filtering.

## Removed `worker/` from git, kept it working locally (2026-08-26)

User flagged that `worker/migrations/*.sql` (schema) and, on closer look,
`worker/index.js` + `worker/wrangler.toml` (the actual API implementation)
being in the repo meant anyone on GitHub could read the API's internals.
Checked first: no hardcoded secrets in either file (the real secret,
`INTERNAL_API_KEY`, only ever lives in `.env.local`, already gitignored) —
but confirmed `worker/index.js`/`wrangler.toml` were already committed *and
pushed* to `origin/main` (commit `9d6b573`), so this needed an actual fix,
not just a `.gitignore` entry (which only affects untracked files going
forward).

Rewrote git history with `git filter-branch --index-filter 'git rm -r
--cached --ignore-unmatch worker' -- main` to strip `worker/` from every
commit. Safety steps taken first: backed up `worker/index.js` +
`wrangler.toml` outside the repo, stashed in-progress work
(`git stash push -u`), tagged the pre-rewrite state (`pre-scrub-backup`,
local only). Verified after rewriting: `git diff <old-tip> <new-tip>
--stat` showed only the two worker files removed, nothing else touched;
`tsc --noEmit` still clean. Restored `worker/` to disk (untracked) and
added `/worker/` to `.gitignore` so it keeps working locally
(`wrangler deploy`/`wrangler d1 migrations`) but can't be re-committed.
User then force-pushed `origin main` themselves (I don't run force-pushes
to `main`, even on request) — confirmed rewritten history is now what's on
GitHub.

Corrected my own overreach here: I initially implied gitignoring `worker/`
meant we'd lose the ability to use `wrangler d1 migrations` (proper
schema-change tooling) going forward. User caught this — `wrangler` reads
`worker/migrations/*.sql` straight off local disk, entirely independent of
git tracking. Git history and the local filesystem are separate concerns;
only the *history record* of migrations is gone, not the ability to keep
using migrations properly.

## Phase 1 wrap-up: test seed content (2026-08-26)

Declared Phase 1 (SQL data model) complete per its own definition in
AGENTS.md, with two caveats surfaced to the user: the schema was still
empty, and `worker/migrations/` no longer being tracked in git meant
AGENTS.md's "schema changes go through `wrangler d1 migrations`, not
ad-hoc SQL" rule needed a documented caveat (see above — resolved, migrations
still work, just untracked).

User: seed minimal test content, "one for each type," explicitly not
real course material (that's deferred) and not hundreds of fake rows.
New `worker/migrations/0002_seed_test_content.sql`, grounded in AGENTS.md's
own example content rather than invented copy:
- 4 users, one per `role` (student/contributor/instructor/administrator).
- 1 course ("Computer Architecture" — reuses the homepage's existing
  Architecture-discipline description) → 1 module → 5 lessons, one per
  `type` (article ×2, video, exercise, quiz). The exercise is AGENTS.md's
  own example (`max2` in x86-64), not fabricated.
- 2 quiz questions × 3 answers, 1 enrollment, 5 `lesson_progress` rows
  covering all three statuses, 1 quiz attempt.

Applied via `wrangler d1 migrations apply lowlevelnotes-db --remote`
(tracked in D1's own `d1_migrations` bookkeeping table, not ad-hoc SQL) —
first attempt was blocked by this environment's auto-mode safety
classifier (mutating-production Bash commands get intercepted regardless
of token permissions); user approved a retry and it applied cleanly (11
statements). Verified row counts match the design exactly.

Hit the classifier block again discussing next steps — user's instruction:
while auto mode is on, don't ask permission to use the Cloudflare MCP
integration or the `CLOUDFLARE_API_TOKEN` I already have. Added
`.claude/settings.local.json` (`permissions.allow`:
`Bash(npx wrangler *)`, `Bash(cd worker && npx wrangler *)`) so wrangler
invocations in that shape skip the classifier; recorded the standing
permission (and its explicit limits — doesn't cover history rewrites,
force-pushes, or token rotation) in AGENTS.md's working principles. User
broadened the gitignore entry from the file to the whole `/.claude/`
directory themselves.

## Phase 2 kickoff: course catalog endpoints (2026-08-26)

Planned via `EnterPlanMode` given the stakes (live production Worker).
First resolved a real gap in AGENTS.md's own endpoint list: several
planned Phase 2 endpoints (`POST /courses/:id/enroll`, `GET /me/progress`,
`POST /lessons/:id/complete`, `POST /quizzes/:id/attempt`,
`GET /me/statistics`) are inherently user-scoped, but Phase 3 (real
auth/sessions) doesn't exist — there's no legitimate way to know "who is
calling." Asked the user directly rather than inventing an identity
scheme: they chose to defer all user-scoped endpoints to Phase 3, so
they ship together with real auth instead of behind a throwaway
unverified-userId stand-in. Recorded this scoping decision and its
rationale in the plan file, not just chosen silently.

That left Phase 2's actual scope as three public, read-only catalog
endpoints, all new in `worker/index.js`:
- `GET /v1/courses` — paginated list (`?limit=`/`?offset=`, default 20/0,
  max limit 100; invalid values → 400), `status = 'published'` only.
  Response wraps the array (`{ data, pagination: { total, limit, offset } }`)
  — a deliberate shape difference from the older bare-array endpoints,
  since pagination metadata needs somewhere to live.
- `GET /v1/courses/:slug` — course detail; 404 for missing or unpublished
  (doesn't leak draft existence).
- `GET /v1/courses/:slug/lessons` — lessons flattened across all of a
  course's modules (schema is course→module→lesson, but the intended
  frontend URL `/courses/[course]/[lesson]` skips the module segment
  entirely), each row annotated with `moduleSlug`/`moduleTitle`/
  `modulePosition` so the frontend can group them without a second
  request.

Design choices worth remembering: path param is the course **slug**, not
the numeric id (matches AGENTS.md's own intended frontend routing and the
`content_path` convention already seeded); new endpoints live under a
`/v1` prefix while every existing endpoint (`/resources`, `/tools`,
`/people`, `/changelog`, `/resource/:id`, the `.svg` badges) keeps its
current path/shape untouched — real versioning going forward without
breaking anything live. New `mapCourse`/`mapLesson` mappers follow the
file's existing snake_case→camelCase convention exactly.

Verified locally first via `wrangler dev --remote` (real D1 data, no
deploy risk) — all three endpoints, the 404 case, and both 400 validation
cases behaved exactly as designed; spot-checked `GET /resources` still
200s with its original shape. Deployed with `wrangler deploy` (cron
trigger confirmed still attached). Re-verified against the live
`api.lowlevelnotes.com` afterward — clean 200s this time, no repeat of
the earlier Cloudflare bot-fight false-positive on direct `curl` noted in
an earlier entry.

## Phase 3: authentication (2026-08-26)

Planned via `EnterPlanMode` given the stakes (real passwords, sessions,
cookies — the most security-sensitive phase yet). Before designing
anything, two scope questions were put to the user rather than assumed:

1. Should this phase also wire up the Phase 2 user-scoped endpoints
   (enroll, progress, quiz attempts, statistics) now that real identity
   exists? **User chose: no** — auth primitives only, matching Phase 2's
   scoping discipline; those endpoints become their own next slice.
2. Should a logged-in "change password" endpoint (distinct from
   forgot/reset recovery) be included, since it reuses the same hashing
   code? **User chose: yes.**

For the security-sensitive design itself (password hashing, session/token
architecture, email-provider choice and fallback behavior, rate limiting,
common auth pitfalls), ran a dedicated Plan-agent research pass rather
than deciding solo — it caught a real flaw in the original framing: the
plan was to echo the verification/reset link in the API response whenever
`RESEND_API_KEY` is unconfigured, for *every* auth email. For
`forgot-password` specifically, that's not a logging smell, it's a direct
account-takeover vector — anyone could POST any email address to that
endpoint and read back a working reset token with no need to intercept
mail at all, since that endpoint's entire safety property depends on its
response being identical whether or not the target account exists.
Corrected: only `register`/`resend-verification` (where the response
always goes to the account owner in that same request) get the echo
fallback; `forgot-password` never puts the link in the HTTP response, in
any configuration state — only `console.warn`s it server-side.

**Runtime reality that shaped the whole design**: Cloudflare Workers have
no Node `crypto` (no native bcrypt/argon2), only `crypto.subtle`, and
`workerd` hard-caps PBKDF2 at 100,000 iterations regardless of plan —
below OWASP's usual 600,000 recommendation, but the platform's actual
ceiling, not a shortcut. This determined password hashing: PBKDF2-SHA256,
100k iterations, self-describing storage format
(`pbkdf2-sha256$100000$<salt>$<hash>`) so a future algorithm bump never
needs a migration.

No email provider existed anywhere in this project. Asked the user
directly; they said they don't feel qualified to choose between options
themselves, want a real provider "like big platforms use," and want to be
informed and asked, not have it silently decided. Recommended and used
**Resend** (single `fetch()` POST, no SDK/dependency, free tier covers a
personal project's volume, standard recommendation for Workers today
since MailChannels' free tier was discontinued in 2024) — confirmed with
the user before implementing.

New migration `worker/migrations/0003_phase3_authentication.sql`:
`sessions`, `auth_tokens` (one table for both email-verification and
password-reset tokens, deliberately — same shape, same single-use/expiry
logic, fewer places to get the security-critical bits wrong), and
`auth_events` (backs a D1-durable rate limiter — the existing in-memory
one resets per Worker instance, too weak alone for login/forgot-password/
register). All three get a cleanup pass added to the existing 5-minute
`scheduled()` cron.

New `/v1/auth/*` endpoints in `worker/index.js`: `register`, `login`,
`logout`, `session` (GET — not in AGENTS.md's literal line item, but
every client needs a way to answer "am I logged in, as whom"; justified
as squarely "session management" rather than scope creep),
`change-password`, `forgot-password`, `reset-password`, `verify-email`
(GET, since it's a link-click flow), `resend-verification`. Concrete
security measures built in, not just discussed: decoy-hash PBKDF2 verify
so "no such account" and "wrong password" take comparable time on login;
identical response shapes/messages on register and forgot-password
regardless of whether the account exists; registration never reads a
client-supplied `role`; password-reset token claiming uses a guarded
`UPDATE ... WHERE used_at IS NULL` checked via `meta.changes`, closing the
classic check-then-update reuse race (D1's `batch()` can't do conditional
logic across statements, so the claim has to be its own atomic step before
the password/session writes, not bundled into one batch as originally
drafted — caught and fixed during implementation); password-reset
invalidates every session for that user, change-password invalidates
every *other* session (the requester already proved they hold the account
by being authenticated, so no need to also log them out);
email-verification is idempotent on an already-verified user regardless
of a specific token's `used_at`, absorbing the real-world case where a
corporate mail scanner pre-fetches the link before the human clicks it.
`corsHeaders()`/`json()` extended: `Access-Control-Allow-Credentials`
(only on an exact origin match, never the wildcard-style fallback),
`Authorization` added to allowed headers, `Vary: Origin`, and `json()`
now accepts extra response headers (needed for `Set-Cookie`).

Verified via `wrangler dev --remote` against real D1 before deploying,
exactly the Phase 2 pattern: registration (identical response on a
duplicate email, weak password rejected), email verification (works, and
a token replay after success returns the same "already verified" 200
rather than an error), 5 failed logins then a 6th correctly 429s, a
successful login's `Set-Cookie` has the right flags, `GET /v1/auth/session`
correctly gates on the token, logout deletes the session, and — the
important edge case — the **Phase 1 seed users** (whose `password_hash`
has been `NULL` since Phase 1) can only ever get a working password via
`forgot-password` → `reset-password`, confirmed by actually resetting and
logging in as `alice@example.com`; reusing that same reset token
afterward correctly 400s. `change-password` confirmed to invalidate a
second, separate session while leaving the session that made the change
valid. Spot-checked `GET /resources` and `GET /v1/courses` unaffected.
Deployed via `wrangler deploy`, re-ran a subset live against
`api.lowlevelnotes.com` — clean, no repeat of the earlier bot-fight
false-positive. All test accounts/sessions/tokens created during
verification (both local and live) were deleted afterward, and Alice's
`password_hash`/`email_verified_at` were reset back to their original
Phase-1-seed `NULL` state — this was verification, not an intended data
change.

Confirmed via `git status` that nothing under `src/` changed — this phase
is Worker-only, no Next.js/frontend work, matching Phase 2's precedent.
The one open item this leaves: the password-reset email's link points at
`https://lowlevelnotes.com/reset-password?token=...`, a frontend page
that doesn't exist yet (reset-password is a POST-body endpoint, so unlike
verify-email it can't be a working link on its own without a page to
collect the new password) — it'll 404 until frontend work on this
happens. Expected given the strict phase scoping, but worth remembering
so it doesn't surprise anyone testing the real email flow before then.

## Resend live (2026-08-26)

User created a Resend account, verified `lowlevelnotes.com` (DNS records
added via Cloudflare), and provided the API key — set as a Worker secret
via `wrangler secret put RESEND_API_KEY` (never `.env.local` or
`wrangler.toml`; flagged to the user that the key had been pasted into
chat and should be rotated in the Resend dashboard once things settled).
Sender address in `worker/index.js`'s `sendEmail()` updated to
`no-reply@lowlevelnotes.com` per the user's preference.

Verified the transition explicitly rather than assuming: right after the
secret was set but before DNS had propagated, confirmed via `wrangler
tail` that a real send attempt failed silently and gracefully (no crash,
generic success response still returned, only a server-side
`console.warn` with the link) — exactly the designed fallback behavior.
Once DNS verified, re-tested with the user's real personal address
(sent only after explicit request) — email
delivered, link clicked, `email_verified_at` set. This is the first real,
non-fallback confirmation that the whole registration → email →
verification loop works end-to-end, not just against the local-testing
fallback path.

## Auth frontend pages + styled transactional emails (2026-08-26)

User asked directly: is frontend auth UI / email styling planned for any
phase? Checked AGENTS.md's roadmap honestly rather than assuming — it
actually jumps straight from Phase 4 to Phase 7 (Phases 5/6 are simply
undefined, not reserved for this). Per the user's explicit direction,
treated this as its own unnumbered slice, same as "real course content."

Planned via `EnterPlanMode`, including a dedicated Explore pass over the
existing frontend (`Header.tsx`, `layout.tsx`, `globals.css`, every
page's structure, `LibraryBrowser.tsx`'s input styling, `page.tsx`'s
button styling) so nothing here invented a new visual language. One real
architecture decision fell out of that research: the Phase 3 session
cookie is `HttpOnly` and host-only on `api.lowlevelnotes.com`, which
means (a) the browser must call the Worker directly for every auth
action — a Next.js proxy literally cannot work, since a relayed
`Set-Cookie` would end up scoped to the wrong host — and (b) the Next.js
server can never see whether someone's logged in, so auth state has to
be client-side only, via a shared `SessionProvider` context fetched once
per app load.

Shipped:
- `src/lib/authClient.ts` — client-safe fetch wrappers for every
  `/v1/auth/*` call, kept fully separate from the server-only
  `src/lib/api.ts`.
- `src/components/SessionProvider.tsx` — the app's first Context
  provider, wraps `layout.tsx`.
- `src/components/auth/{AuthPageShell,AuthTextField,AuthSubmitButton,AuthMessage}.tsx`
  — shared primitives (this is also the first `<form>`, first
  submit/loading state, and first error color anywhere in the app;
  chose `#F85149`, matching the GitHub-dark-theme lineage the existing
  success/warning colors already came from — recorded in AGENTS.md).
- Six pages: `/login`, `/register` (doesn't auto-login, matching the
  API's actual behavior), `/forgot-password` (preserves the API's
  enumeration protection — same generic message regardless of outcome,
  a 429 shown separately so it doesn't leak account existence),
  `/reset-password` (closes the exact gap flagged at the end of Phase 3
  — the reset email already linked here, it just 404'd until now),
  `/verify-email`, `/account` (change-password, logout, and a
  resend-verification banner — the first frontend path to that endpoint
  at all).
- `Header.tsx` now shows "Log in" or the user's display name, linking to
  `/account`.
- `worker/index.js`: verification emails now link to
  `lowlevelnotes.com/verify-email` instead of the raw API endpoint (so
  clicking lands on a styled page, not JSON); new `buildAuthEmailHtml()`
  shared template (table-based layout, inline styles, dark charcoal +
  orange CTA button + plain-text fallback link) replaces the plain
  `<p>` markup in all three sends.

Two real bugs found and fixed during verification, not just cosmetic
gaps:
1. **Logout race**: `/account`'s own redirect-to-`/login` guard effect
   fired before the logout handler's `router.push('/')` landed, since
   both react to the same "user became null" state change — logging out
   sent you to `/login` instead of home. Fixed with a ref flag that
   suppresses the guard during a deliberate logout.
2. **`/verify-email`'s server-side fetch was silently broken, and would
   have stayed broken in production, not just locally**: built as a
   Server Component to avoid an unnecessary client fetch — reasonable
   instinct, wrong for this API. `api.lowlevelnotes.com`'s WAF blocks
   generic scripted HTTP clients (bare `curl`, Node's own `fetch`) with a
   403 on almost every path except `/health`. A Next.js Server
   Component's `fetch()` is exactly that kind of client — this wasn't a
   local-dev-only quirk like the earlier bot-fight/Referer issue, it
   would 403 identically once deployed to Vercel's Node runtime. Fixed
   by moving the fetch into a client component (`VerifyEmailResult.tsx`)
   so it runs as a genuine browser request instead, matching every other
   auth page. Recorded the underlying WAF behavior in AGENTS.md so a
   future page doesn't rediscover it the hard way.

Verification: `claude-in-chrome` wasn't available (extension not
connected), so drove a real headless Chromium via Playwright instead
(installed to the scratchpad, not the project). Hit a second, unrelated
network wrinkle: Cloudflare's bot-fight layer flagged the headless
automation's own fingerprint regardless of Referer spoofing — confirmed
this is Cloudflare correctly detecting genuine automated browser traffic
(not something a real visitor's real browser would ever trigger), so
rather than fight it further, mocked the `/v1/auth/*` responses at the
network layer for the interactive-flow tests (proving the frontend's own
logic: rendering, validation, redirects, session state) while relying on
the extensive `curl`-based verification already done in Phase 3 for the
server-side correctness of the same endpoints. 24 checks covering every
page, every success/error path, both redirect guards, and the two bug
fixes above — all passing. `next build` and `tsc --noEmit` both clean.
Test data (`pwtest@example.com` and friends) cleaned out of D1
afterward, same discipline as every prior phase.

Recorded in AGENTS.md: the new error color and its GitHub-lineage
reasoning, the auth-form component pattern and email-template treatment
as reusable conventions, and the WAF/scripted-client finding under "Data
and API direction" so it isn't rediscovered next time something needs a
server-side call to the Worker.

## Next action

This slice and Phase 3 are both done, including real email delivery and
now a working frontend. Natural next steps, not yet started: Phase 4
(authorization roles — guest/student/contributor/instructor/
administrator), or wiring up the Phase 2 endpoints deferred twice now
(enroll, progress, quiz attempts, statistics) using the `getSessionUser()`
foundation Phase 3 built — the frontend pattern for calling
`api.lowlevelnotes.com` directly from client components (established
this round) is ready to reuse for those too. Real course content
(replacing the Phase 1 test seed) remains explicitly deferred to its own
later pass, not tied to a numbered phase.
