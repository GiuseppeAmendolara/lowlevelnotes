import { getResources, getPeople, getTools } from '@/lib/api'
import LibraryBrowser from '@/components/LibraryBrowser'

export const dynamic = 'force-dynamic'

export default async function LibraryPage() {
  const [resources, people, tools] = await Promise.all([getResources(), getPeople(), getTools()])

  return (
    <main className="min-h-screen bg-[#171717]">
      <section className="mx-auto max-w-5xl px-6 pb-10 pt-20 sm:pt-28">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#FF8A3D]">Curated resources</p>
        <h1 className="mt-4 text-4xl font-bold tracking-[-0.05em] text-white sm:text-5xl">Library</h1>
        <p className="mt-4 max-w-lg leading-7 text-[#A1A1AA]">
          {resources.length + tools.length} links across the topics in the notes, credited to the people who actually wrote them.
        </p>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-24">
        <LibraryBrowser resources={resources} people={people} tools={tools} />
      </section>
    </main>
  )
}
