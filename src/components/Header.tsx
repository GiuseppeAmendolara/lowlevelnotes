'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from './SessionProvider'

const links = [
  { href: '/', label: 'home' },
  { href: '/library', label: 'library' },
  { href: '/changelog', label: 'changelog' },
  { href: '/transparency', label: 'transparency' },
]

export default function Header() {
  const pathname = usePathname()
  const { user, loading } = useSession()

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#171717]/90 backdrop-blur-md">
      <nav aria-label="Primary navigation">
        <div className="mx-auto flex max-w-6xl items-center px-6">
          <Link href="/" className="mr-6 flex shrink-0 items-baseline py-4 text-sm font-bold tracking-[-0.06em] text-white transition-colors hover:text-[#FF8A3D] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF8A3D]" aria-label="0xLLN home">
            <span className="text-[#FF8A3D]">0x</span>LLN
          </Link>

          <div className="-mx-2 flex min-w-0 flex-1 items-center gap-1 overflow-x-auto px-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {links.map((link) => {
              const active = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative shrink-0 px-3 py-4 text-xs font-medium uppercase tracking-[0.12em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#FF8A3D] ${
                    active
                      ? 'text-white'
                      : 'text-[#A1A1AA] hover:text-white'
                  }`}
                >
                  {link.label}
                  <span className={`absolute inset-x-3 bottom-0 h-px transition-colors ${active ? 'bg-[#FF8A3D]' : 'bg-transparent'}`} aria-hidden="true" />
                </Link>
              )
            })}
          </div>

          <a
            href="https://github.com/GiuseppeAmendolara/lowlevelnotes"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-5 hidden shrink-0 border-l border-white/10 pl-5 text-xs font-medium uppercase tracking-[0.12em] text-[#A1A1AA] transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF8A3D] sm:block"
          >
            GitHub ↗
          </a>

          {!loading && (
            <Link
              href={user ? '/account' : '/login'}
              className="ml-5 shrink-0 border-l border-white/10 pl-5 text-xs font-medium uppercase tracking-[0.12em] text-[#A1A1AA] transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF8A3D]"
            >
              {user ? user.displayName : 'Log in'}
            </Link>
          )}
        </div>
      </nav>
    </header>
  )
}
