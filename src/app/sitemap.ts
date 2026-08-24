import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://lowlevelnotes.com',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    // add one entry per page/route as you build them out
  ]
}