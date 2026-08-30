import Link from 'next/link'
import { DiscordIcon, GithubIcon, LicenseIcon } from '@/components/icons'
import Eyebrow from '@/components/Eyebrow'

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-[#0B0B0D]">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-[-0.04em] text-white">
              <span className="text-[#FF7A33]">0x</span>LLN
            </h2>
            <p className="mt-1 max-w-sm text-sm text-[#90939A]">
              Organized knowledge for mastering software development.
            </p>
          </div>

          <div className="flex flex-col items-start gap-1 text-sm text-[#90939A]">
            <p className="flex items-center gap-1.5">
              <DiscordIcon className="h-3.5 w-3.5 shrink-0 text-white/40" />
              <a
                href="https://discord.gg/emC3NKEP4a"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 underline underline-offset-2 transition-colors hover:text-white"
              >
                Join the Discord
              </a>
            </p>
            <p className="flex items-center gap-1.5">
              <LicenseIcon className="h-3.5 w-3.5 shrink-0 text-white/40" />
              <a
                href="https://github.com/GiuseppeAmendolara/lowlevelnotes/blob/main/LICENSE"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 underline underline-offset-2 transition-colors hover:text-white"
              >
                MIT license
              </a>
            </p>
            <p className="flex items-center gap-1.5">
              <GithubIcon className="h-3.5 w-3.5 shrink-0 text-white/40" />
              <a
                href="https://github.com/GiuseppeAmendolara/lowlevelnotes"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 underline underline-offset-2 transition-colors hover:text-white"
              >
                Repository
              </a>
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <Eyebrow>Free &amp; open source · Full privacy · Zero ads</Eyebrow>
          <div className="flex items-center gap-4 text-xs text-white/30">
            <Link href="/privacy" className="underline underline-offset-2 transition-colors hover:text-white/60">
              Privacy
            </Link>
            <p>&copy; {new Date().getFullYear()} lowlevelnotes. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
