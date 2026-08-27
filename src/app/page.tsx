
import Link from 'next/link'
import CodeBlock from '@/components/CodeBlock'
import HomeCourseCard from '@/components/HomeCourseCard'
import HomeDisciplineCard from '@/components/HomeDisciplineCard'
import ScrollReveal from '@/components/ScrollReveal'

// Static, not fetched — /v1/courses requires a session (the library
// data below is public), and this section renders for logged-out
// visitors. Same tradeoff already accepted for `disciplines` below:
// hand-written, needs a manual bump when real course content changes.
const courses = [
  {
    slug: 'computer-architecture',
    category: 'Architecture',
    title: 'Computer Architecture',
    description: 'Processors, memory, instruction sets, and performance.',
  },
  {
    slug: 'networks',
    category: 'Networking',
    title: 'Networks',
    description: 'Networking fundamentals: the OSI/TCP-IP stack, addressing, and hardware.',
  },
  {
    slug: 'postgresql',
    category: 'Data',
    title: 'PostgreSQL',
    description: 'Relational database fundamentals, from data types to indexing.',
  },
]

const disciplines = [
  {
    id: '01',
    title: 'Programming',
    description: 'Learn the fundamentals every language builds upon.',
    written: true,
    stat: '20+ resources',
  },
  {
    id: '02',
    title: 'Networks',
    description: 'Find out how your data actually finds its way across the internet.',
    written: true,
    stat: 'Compiled from curated resources',
  },
  {
    id: '03',
    title: 'Security',
    description: 'How attackers think: reverse engineering, exploitation, and breaking software on purpose.',
    written: true,
    stat: '10+ resources',
  },
  {
    id: '04',
    title: 'Architecture',
    description: 'Turning that magic box into an understandable machine.',
    written: true,
    stat: 'Professional-level content available',
  },
]

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

export default function Home() {

  return (
    <main className="overflow-hidden bg-[#171717]">
      <section className="relative border-b border-white/10">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:2.5rem_2.5rem] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(255,138,61,0.14),transparent_27rem)]" />

        <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-20 sm:pb-28 sm:pt-28">
          <div className="mb-10 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.18em] text-[#A1A1AA]">
            <span className="h-2 w-2 bg-[#FF8A3D]" aria-hidden="true" />
            Open knowledge base · est. 2022
          </div>

          <div>
            <h1 className="max-w-3xl animate-fade-in-up text-balance text-5xl font-bold leading-[0.96] tracking-[-0.07em] text-white motion-reduce:animate-none sm:text-7xl lg:text-8xl">
              LowLevelNotes
            </h1>
            <p
              style={{ animationDelay: '80ms' }}
              className="mt-8 max-w-lg animate-fade-in-up text-pretty text-base leading-7 text-[#A1A1AA] motion-reduce:animate-none sm:text-lg"
            >
              Organized knowledge for mastering software development. Browse the library freely, or enroll in structured courses.
            </p>

            <div style={{ animationDelay: '160ms' }} className="mt-10 flex animate-fade-in-up flex-col gap-3 motion-reduce:animate-none sm:flex-row">
              <Link
                href="#courses"
                className="inline-flex items-center justify-center gap-3 bg-[#FF8A3D] px-5 py-3.5 text-sm font-semibold text-[#0D0D0D] transition-colors transition-transform duration-150 hover:bg-[#FFA15C] active:scale-[0.98] motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF8A3D]"
              >
                Explore courses
                <span aria-hidden="true">↓</span>
              </Link>
              <Link
                href="#library"
                className="inline-flex items-center justify-center gap-3 border border-white/15 bg-[#0D0D0D] px-5 py-3.5 text-sm font-medium text-white transition-colors transition-transform duration-150 hover:border-white/40 hover:bg-[#171717] active:scale-[0.98] motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Browse the library
                <span aria-hidden="true">↓</span>
              </Link>
              <Link
                href="/changelog"
                className="inline-flex items-center justify-center gap-3 border border-white/15 bg-[#0D0D0D] px-5 py-3.5 text-sm font-medium text-white transition-colors transition-transform duration-150 hover:border-white/40 hover:bg-[#171717] active:scale-[0.98] motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Read the changelog
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="courses" className="scroll-mt-20 border-y border-white/10 bg-[#0D0D0D]">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
          <div className="flex justify-end border-b border-white/10 pb-10">
            <div className="max-w-md">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#FF8A3D]">Structured learning</p>
              <h2 className="mt-4 text-3xl font-bold tracking-[-0.05em] text-white sm:text-4xl">Courses</h2>
              <p className="mt-4 leading-7 text-[#A1A1AA]">
                Enroll in a structured course and track your progress as you go.
              </p>
            </div>
          </div>

          <div className="grid border-l border-t border-white/10 sm:grid-cols-3">
            {courses.map((course, i) => (
              <HomeCourseCard key={course.slug} course={course} index={i} />
            ))}
          </div>
        </div>
      </section>

      <section id="library" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-20 sm:py-28">
        <div className="border-b border-white/10 pb-10">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#FF8A3D]">Reference library</p>
          <h2 className="mt-4 text-3xl font-bold tracking-[-0.05em] text-white sm:text-4xl">Library</h2>
          <p className="mt-4 max-w-md leading-7 text-[#A1A1AA]">
            Browse the library freely, it&apos;s a collection of curated PDFs, links, tools, etc.
          </p>
        </div>

        <div className="grid border-l border-t border-white/10 sm:grid-cols-2">
          {disciplines.map((discipline, i) => (
            <HomeDisciplineCard key={discipline.id} discipline={discipline} index={i} />
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#0D0D0D]">
        <ScrollReveal className="mx-auto grid max-w-6xl gap-12 px-6 py-16 sm:py-20 lg:grid-cols-2 lg:items-center">
          <div className="order-2 lg:order-1">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#FF8A3D]">Straight from the notes</p>
            <h2 className="mt-4 max-w-lg text-3xl font-bold tracking-[-0.05em] text-white sm:text-4xl">Code explained, not just pasted.</h2>
            <p className="mt-4 max-w-md leading-7 text-[#A1A1AA]">Written from a developer&apos;s point of view, line by line. Open source and MIT-licensed, so if you want to fix a mistake or add a section, that&apos;s open too.</p>
            <a
              href="https://github.com/GiuseppeAmendolara/lowlevelnotes"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-white transition-colors hover:text-[#FF8A3D]"
            >
              Contribute on GitHub
              <span aria-hidden="true">↗</span>
            </a>
          </div>

          <div className="order-1 min-w-0 lg:order-2">
            <CodeBlock code={csharpSnippet} lang="csharp" filename="CSharp.md" />
          </div>
        </ScrollReveal>
      </section>
    </main>
  )
}
