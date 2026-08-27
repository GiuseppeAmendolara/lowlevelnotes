export default function Footer() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-[#171717]">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-[-0.04em] text-white">
              <span className="text-[#FF8A3D]">0x</span>LLN
            </h2>
            <p className="mt-1 max-w-sm text-sm text-[#A1A1AA]">
              Organized knowledge for mastering software development.
            </p>
          </div>

          <div className="space-y-1 text-sm text-[#A1A1AA]">
            <p>License: MIT License</p>
            <p>
              Repository:{' '}
              <a
                href="https://github.com/GiuseppeAmendolara/lowlevelnotes"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 underline underline-offset-2 transition-colors hover:text-white"
              >
                github.com/GiuseppeAmendolara/lowlevelnotes
              </a>
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#FF8A3D]">
            Free &amp; open source · Full privacy · Zero ads
          </p>
          <p className="text-xs text-white/30">
            &copy; {new Date().getFullYear()} lowlevelnotes. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
