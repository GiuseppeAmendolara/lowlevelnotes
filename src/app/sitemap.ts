import type { MetadataRoute } from 'next'
import { getChangelog } from '@/lib/api'

// Deliberately excludes every other route in src/app: /account, /login,
// /register, /forgot-password, /reset-password, and /verify-email have no
// SEO value (auth flows, some carrying single-use tokens in the query
// string), and /library requires a session — an anonymous crawler would
// only ever see a redirect to /login, not real content, so indexing it
// would be indexing an empty page.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // /changelog's lastModified reflects the actual latest release date
  // instead of always claiming "just changed" — falls back to now if the
  // API call fails, so a Worker hiccup can't take sitemap.xml down with it.
  let changelogLastModified = new Date()
  try {
    const entries = await getChangelog()
    if (entries[0]?.releaseDate) {
      changelogLastModified = new Date(entries[0].releaseDate)
    }
  } catch {
    // fall back to now
  }

  return [
    {
      url: 'https://lowlevelnotes.com',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: 'https://lowlevelnotes.com/changelog',
      lastModified: changelogLastModified,
      changeFrequency: 'weekly',
      priority: 0.5,
    },
    {
      url: 'https://lowlevelnotes.com/transparency',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.4,
    },
  ]
}