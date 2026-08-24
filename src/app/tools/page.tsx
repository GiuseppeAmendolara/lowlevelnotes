import { getTools, Tool } from '@/lib/api'
import ToolCategorySection from '@/components/ToolCategorySection'

function groupByCategory(tools: Tool[]) {
  const map = new Map<string, Tool[]>()

  for (const tool of tools) {
    if (!map.has(tool.category)) {
      map.set(tool.category, [])
    }

    map.get(tool.category)!.push(tool)
  }

  return Array.from(map.entries())
}

export default async function ToolsPage() {
  const tools = await getTools()
  const grouped = groupByCategory(tools)

  return (
    <main className="min-h-screen bg-black">
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-10">
        <h1 className="font-mono text-4xl font-bold text-white tracking-tight">
          tools
        </h1>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-20 space-y-6">
        {grouped.map(([category, tools]) => (
          <ToolCategorySection
            key={category}
            category={category}
            tools={tools}
          />
        ))}
      </section>
    </main>
  )
}