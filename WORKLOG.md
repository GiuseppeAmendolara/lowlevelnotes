# Active work log

Use this file as the compact handoff for ongoing work. Update it at each completed
milestone, before a task change, or whenever handing the project to another agent.
It supplements the durable project guidance in `AGENTS.md`.

## Status

- **Active phase:** Phase 0 — UI design and implementation
- **Current area:** Homepage
- **Milestone:** Homepage status integration and navigation refinement
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

## Next action

Get user sign-off on this round. If it lands, apply the same principles
(real specifics over generic copy, `CodeBlock` for any code display, honest
progress indicators over uniform placeholders) when building out other pages
per the UI consistency protocol in AGENTS.md.
