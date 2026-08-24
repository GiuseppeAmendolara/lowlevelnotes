import { Resource, Person } from '@/lib/api'
import ResourceCard from './ResourceCard'

export default function ResourceCategorySection({
  title,
  items,
  authorMap,
}: {
  title: string
  items: Resource[]
  authorMap: Map<number, Person>
}) {
  return (
    <div>
      <h2 className="font-mono font-semibold text-white text-lg mb-3">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((r) => (
          <ResourceCard key={r.id} resource={r} author={authorMap.get(r.authorId)} />
        ))}
      </div>
    </div>
  )
}