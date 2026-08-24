'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/', label: 'resources' },
  { href: '/tools', label: 'tools' },
  { href: '/changelog', label: 'changelog' },
]

export default function Nav() {
  const pathname = usePathname()

  return (
    <nav className="border-b border-white/10 bg-black sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-6 flex items-center gap-8">
        <span className="font-mono font-bold text-white py-4 tracking-tight">0xLN</span>
        <div className="flex gap-6">
          {links.map((link) => {
            const active = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`font-mono text-sm py-4 border-b-2 transition-colors ${
                  active
                    ? 'text-white border-white'
                    : 'text-white/50 border-transparent hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}