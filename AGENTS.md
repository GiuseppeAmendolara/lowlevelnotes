# LowLevelNotes working brief

## Product

LowLevelNotes (also branded **0xLLN**) began as a personal collection of technical
notes, books, and learning resources. Its direction is to become a modern,
full-featured learning platform for mastering software development, especially
low-level and systems-oriented topics.

The current priority is **Phase 0: UI design and implementation**. Build a
cohesive, distinctive platform identity before adding product/backend features.
Prefer considered, incremental UI work over prematurely introducing database,
authentication, or learning-platform behavior.

## Current stack

- Frontend: React, Next.js, TypeScript, Tailwind CSS
- Backend/API (planned/current architecture): Cloudflare Workers API and
  Cloudflare D1 (SQLite)
- Delivery: GitHub push → GitHub Actions → Vercel build/deploy → Cloudflare domain

## Roadmap

1. **Phase 0 (current):** UI design and implementation.
2. **Phase 1:** SQL/data model for users, courses, modules, lessons, and related
   learning data.
3. **Phase 2:** REST API redesign with clear HTTP methods, status codes,
   validation, pagination, rate limiting, error handling, and API versioning.
   Expected resources include courses, lessons, quizzes, enrollment, progress,
   and user statistics.
4. **Phase 3:** Authentication: registration, login/logout, password recovery,
   email verification, and session management. Do not implement authentication
   cryptography or password handling from scratch.
5. **Phase 4:** Authorization roles: guest, student, contributor, instructor,
   administrator.
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

- Likely data entities: users, courses, modules, lessons, exercises, questions,
  answers, enrollments, lesson progress, and quiz attempts.
- Core relationships: users enroll in courses and track lesson progress; courses
  contain modules; modules contain lessons.
- The API should serve the web app now and remain suitable for future mobile and
  CLI clients.
- Planned endpoints include `GET /courses`, `GET /courses/:id`,
  `GET /courses/:id/lessons`, `POST /courses/:id/enroll`,
  `GET /me/progress`, `POST /lessons/:id/complete`,
  `POST /quizzes/:id/attempt`, and `GET /me/statistics`.

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
- Success: `#3FB950`

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

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
