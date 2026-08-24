import { getResources, getPeople, Resource } from '@/lib/api'
import ResourceCategorySection from '@/components/ResourceCategorySection'

function groupByCategory(items: Resource[]) {
  const map = new Map<string, Resource[]>()
  for (const item of items) {
    if (!map.has(item.category)) map.set(item.category, [])
    map.get(item.category)!.push(item)
  }
  return Array.from(map.entries())
}

export default async function Home() {
  const [resources, people] = await Promise.all([getResources(), getPeople()])
  const authorMap = new Map(people.map((p) => [p.id, p]))
  const grouped = groupByCategory(resources)

  return (
    <main className="min-h-screen bg-black">
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-10">
        <h1 className="font-mono text-4xl font-bold text-white tracking-tight">resources</h1>
        <p className="font-mono text-white/50 mt-2 text-sm">
          Organized knowledge for mastering software development.
        </p>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-20 space-y-12">
        {grouped.map(([category, items]) => (
          <ResourceCategorySection key={category} title={category} items={items} authorMap={authorMap} />
        ))}
      </section>
    </main>
  )
}