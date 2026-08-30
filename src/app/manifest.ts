import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'lowlevelnotes',
    short_name: '0xLLN',
    description: 'Organized knowledge for mastering software development.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0B0B0D',
    theme_color: '#0B0B0D',
    icons: [
      {
        src: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}