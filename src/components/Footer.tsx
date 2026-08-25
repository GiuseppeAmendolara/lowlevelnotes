export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#171717] mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
          <div>
            <h2 className="font-mono font-bold text-white text-lg">lowlevelnotes</h2>
            <p className="font-mono text-sm text-white/50 mt-1 max-w-sm">
              Organized knowledge for mastering software development.
            </p>
          </div>

          <div className="font-mono text-sm text-white/50 space-y-1">
            <p>License: MIT License</p>
            <p>
              Repository:{' '}
              
                <a href="https://github.com/GiuseppeAmendolara/lowlevelnotes"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:text-white underline underline-offset-2 transition-colors">
                github.com/GiuseppeAmendolara/lowlevelnotes
              </a>
            </p>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="font-mono text-xs text-white/30 tracking-wide">
            Free & open source · Full privacy · Zero ads
          </p>
          <p className="font-mono text-xs text-white/30">
            &copy; {new Date().getFullYear()} lowlevelnotes. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}