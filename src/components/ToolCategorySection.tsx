import { Tool } from '@/lib/api'
import ToolLinkRow from './ToolLink'

export default function ToolCategorySection({
  category,
  tools,
}: {
  category: string
  tools: Tool[]
}) {
  return (
    <div className="border border-white/10 bg-white/[0.02] p-5">
      <h2 className="font-mono font-semibold text-white text-lg mb-3">
        {category}
      </h2>

      <div className="flex flex-col">
        {tools.map((tool) => (
          <ToolLinkRow key={tool.id} tool={tool} />
        ))}
      </div>
    </div>
  )
}