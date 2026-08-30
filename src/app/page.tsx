import Link from 'next/link'
import CodeBlock from '@/components/CodeBlock'
import HeroBackground from '@/components/HeroBackground'
import HomeExplore from '@/components/HomeExplore'
import ScrollReveal from '@/components/ScrollReveal'
import { DiscordIcon, GithubIcon } from '@/components/icons'
import { getFeaturedCourses, getLibraryCategoryStats, getSiteStatsSummary, type FeaturedCourse, type LibraryCategoryStat, type SiteStatsSummary } from '@/lib/api'
import Eyebrow from '@/components/Eyebrow'

export const dynamic = 'force-dynamic'

// Editorial blurbs for real resource categories — the API only returns
// category name + count (see /v1/library/category-stats), never
// marketing copy, so the one-line pitch per category lives here. Falls
// back to a generic line for any category added later without a code
// change, rather than rendering nothing.
const CATEGORY_BLURBS: Record<string, string> = {
  'Reverse Engineering': 'Take compiled binaries apart and understand what they actually do.',
  'Malware & Offensive Security': 'How attackers think: exploitation, offensive tooling, and breaking software on purpose.',
  'Programming Fundamentals': 'Learn the fundamentals every language builds upon.',
  'Windows Internals': 'The kernel, processes, and mechanisms underneath the OS most desktops run.',
  'Systems Fundamentals': 'How the machine you’re actually running on works, from the ground up.',
  'Archives': 'Blogs and websites that collect a wide range of computer-science topics in one place.',
}

const csharpSnippet = `
// Import a namespace to use its classes and functions.
using System;

// A container that holds and organizes classes.
namespace HelloWorld
{
    // A container for data and methods, a key part of OOP.
    class Program
    {
        // Entry-point: the function the runtime calls first.
        static void Main(string[] args)
        {
            // A function, imported from the 'System' namespace.
            Console.WriteLine("Hello World!");
        }
    }
}`

export default async function Home() {
  // Both endpoints are public (no session) — see AGENTS.md for why that's
  // a deliberate, narrowly-scoped exception to the rest of the catalog
  // and library staying session-gated. Failures degrade to an empty
  // section rather than crashing the whole home page — this is the most
  // trafficked page on the site, unlike /changelog's equivalent fetch.
  let courses: FeaturedCourse[] = []
  let libraryStats: LibraryCategoryStat[] = []
  let siteStats: SiteStatsSummary | null = null
  try {
    ;[courses, libraryStats, siteStats] = await Promise.all([getFeaturedCourses(), getLibraryCategoryStats(), getSiteStatsSummary()])
  } catch {
    // leave everything empty — sections below render their fallback state
  }

  const disciplines = libraryStats.map((stat, i) => ({
    id: String(i + 1).padStart(2, '0'),
    title: stat.category,
    description: CATEGORY_BLURBS[stat.category] ?? 'Curated resources on this topic.',
    written: true,
    stat: `${stat.count} resource${stat.count === 1 ? '' : 's'}`,
  }))

  return (
    <main className="overflow-hidden bg-[#0B0B0D]">
      <section className="relative overflow-hidden border-b border-white/10">
        <HeroBackground />

        <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-20 sm:pb-28 sm:pt-28">
          <div className="mb-10 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.18em] text-[#90939A]">
            <span className="h-2 w-2 bg-[#FF7A33]" aria-hidden="true" />
            Open knowledge base · est. 2022
          </div>

          <div>
            <h1 className="max-w-3xl animate-fade-in-up text-balance text-5xl font-bold leading-[0.96] tracking-[-0.07em] text-white motion-reduce:animate-none sm:text-7xl lg:text-8xl">
              <span className="text-[#FF7A33]">0x</span>LowLevelNotes
            </h1>
            <p
              style={{ animationDelay: '80ms' }}
              className="mt-8 max-w-lg animate-fade-in-up text-pretty text-base leading-7 text-[#90939A] motion-reduce:animate-none sm:text-lg"
            >
              Organized knowledge for mastering software development.
            </p>

            <div style={{ animationDelay: '160ms' }} className="mt-10 flex animate-fade-in-up flex-col gap-3 motion-reduce:animate-none sm:flex-row">
              <Link
                href="#courses"
                className="inline-flex items-center justify-center gap-3 bg-[#FF7A33] px-5 py-3.5 text-sm font-semibold text-[#0D0D0D] transition-colors transition-transform duration-150 hover:bg-[#FF9459] active:scale-[0.98] motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF7A33]"
              >
                Explore
                <span aria-hidden="true">↓</span>
              </Link>
              <Link
                href="/changelog"
                className="inline-flex items-center justify-center gap-3 border border-white/15 bg-[#17181B] px-5 py-3.5 text-sm font-medium text-white transition-colors transition-transform duration-150 hover:border-white/40 hover:bg-[#0B0B0D] active:scale-[0.98] motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Read the changelog
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {siteStats && (
        <section className="mx-auto max-w-6xl px-6 py-10">
          <div className="grid grid-cols-2 gap-x-8 gap-y-8 sm:grid-cols-4">
            {[
              { label: 'Library resources', value: siteStats.resources },
              { label: 'Recognized authors', value: siteStats.authors },
              { label: 'Published courses', value: siteStats.courses },
              { label: 'Lessons', value: siteStats.lessons },
            ].map((stat, i) => (
              <div key={stat.label} className={i > 0 ? 'sm:border-l sm:border-white/10 sm:pl-8' : ''}>
                <p className="text-2xl font-bold tabular-nums tracking-[-0.03em] text-white sm:text-3xl">{stat.value}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.1em] text-[#90939A]">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <HomeExplore courses={courses} disciplines={disciplines} />

      <section className="border-y border-white/10 bg-[#17181B]">
        <ScrollReveal className="mx-auto grid max-w-6xl gap-12 px-6 py-16 sm:py-20 lg:grid-cols-2 lg:items-center">
          <div className="order-2 lg:order-1">
            <Eyebrow>Straight from the notes</Eyebrow>
            <h2 className="mt-4 max-w-lg text-3xl font-bold tracking-[-0.05em] text-white sm:text-4xl">Code samples</h2>
            <p className="mt-4 max-w-md leading-7 text-[#90939A]">Written from a developer&apos;s point of view, line by line. Open source and MIT-licensed, so if you want to fix a mistake or add a section, that&apos;s open too.</p>
          </div>

          <div className="order-1 min-w-0 lg:order-2">
            <CodeBlock code={csharpSnippet} lang="csharp" filename="Program.cs" />
          </div>
        </ScrollReveal>
      </section>

      <section className="bg-[#0B0B0D]">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
          <div className="max-w-md border-b border-white/10 pb-10">
            <Eyebrow>Get involved</Eyebrow>
            <h2 className="mt-4 text-3xl font-bold tracking-[-0.05em] text-white sm:text-4xl">Join the community</h2>
            <p className="mt-4 leading-7 text-[#90939A]">
              Ask questions, share what you&apos;re building, or help shape what gets written next.
            </p>
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <a
              href="https://discord.gg/emC3NKEP4a"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 bg-[#FF7A33] px-5 py-3.5 text-sm font-semibold text-[#0D0D0D] transition-colors transition-transform duration-150 hover:bg-[#FF9459] active:scale-[0.98] motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF7A33]"
            >
              <DiscordIcon className="h-4 w-4 shrink-0" />
              Join the Discord
            </a>
            <a
              href="https://github.com/GiuseppeAmendolara/lowlevelnotes"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 border border-white/15 bg-[#17181B] px-5 py-3.5 text-sm font-medium text-white transition-colors transition-transform duration-150 hover:border-white/40 hover:bg-[#0B0B0D] active:scale-[0.98] motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <GithubIcon className="h-4 w-4 shrink-0" />
              Contribute on GitHub
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}
