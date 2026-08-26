
import Link from 'next/link'
import CodeBlock from '@/components/CodeBlock'

const disciplines = [
  {
    id: '01',
    title: 'Foundations',
    description: 'C, C++, C#, HTTP and the DOM and SQL.',
    written: true,
    stat: '20+ resources',
  },
  {
    id: '02',
    title: 'Networks',
    description: 'The OSI model, TCP-IP networking, subnetting, topology diagrams, and more.',
    written: true,
    stat: '4,700+ lines written',
  },
  {
    id: '03',
    title: 'Systems',
    description: 'Operating systems, internals, and how software meets hardware.',
    written: true,
    stat: '10+ resources',
  },
  {
    id: '04',
    title: 'Architecture',
    description: 'Processors, memory, instruction sets, and performance.',
    written: false,
    stat: 'Multiple unreleased drafts',
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
            <h1 className="max-w-3xl text-balance text-5xl font-bold leading-[0.96] tracking-[-0.07em] text-white sm:text-7xl lg:text-8xl">
              LowLevelNotes
            </h1>
            <p className="mt-8 max-w-lg text-pretty text-base leading-7 text-[#A1A1AA] sm:text-lg">
              Systems, networks and the languages underneath them. Written as I actually learn them.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-3 bg-[#FF8A3D] px-5 py-3.5 text-sm font-semibold text-[#0D0D0D] transition-colors hover:bg-[#FFA15C] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF8A3D]"
              >
                Login
              </Link>
              <Link
                href="#topics"
                className="inline-flex items-center justify-center gap-3 border border-white/15 px-5 py-3.5 text-sm font-medium text-white transition-colors hover:border-white/40 hover:bg-white/[0.04] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Explore the library
                <span aria-hidden="true">↓</span>
              </Link>
              <Link
                href="/changelog"
                className="inline-flex items-center justify-center gap-3 border border-white/15 px-5 py-3.5 text-sm font-medium text-white transition-colors hover:border-white/40 hover:bg-white/[0.04] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Read the changelog
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="topics" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-20 sm:py-28">
        <h2 className="sr-only">Follow the thread deeper</h2>
        <div className="flex justify-end border-b border-white/10 pb-10">
          <div className="max-w-md text-sm italic leading-6 text-[#A1A1AA]">
            <p><span className="not-italic text-white/50">Alice:</span> “Where should I go?”</p>
            <p className="mt-1"><span className="not-italic text-white/50">The Cheshire Cat:</span> “That depends on where you want to end up.”</p>
            <p className="mt-3 text-xs font-medium not-italic uppercase tracking-[0.18em] text-[#FF8A3D]">Lewis Carroll, Alice&apos;s Adventures in Wonderland</p>
          </div>
        </div>

        <div className="grid border-l border-t border-white/10 sm:grid-cols-2">
          {disciplines.map((discipline) => (
            <Link href="/library" key={discipline.id} className="block min-h-56 border-b border-r border-white/10 p-6 transition-colors hover:bg-white/[0.035] sm:p-8">
              <span className="text-xs text-[#FF8A3D]">[{discipline.id}]</span>
              <h3 className="mt-10 text-2xl font-semibold tracking-[-0.04em] text-white">{discipline.title}</h3>
              <p className="mt-3 max-w-sm text-sm leading-6 text-[#A1A1AA]">{discipline.description}</p>
              <div className="mt-7 flex items-center gap-2 text-sm">
                <span className={`h-2 w-2 ${discipline.written ? 'bg-[#3FB950]' : 'bg-white/20'}`} aria-hidden="true" />
                <span className={discipline.written ? 'text-white/70' : 'text-white/40'}>{discipline.stat}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#0D0D0D]">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 sm:py-20 lg:grid-cols-2 lg:items-center">
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
        </div>
      </section>
    </main>
  )
}
