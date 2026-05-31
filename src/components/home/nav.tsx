import { O } from '#/components/hh/primitives'
import { HHButton } from '#/components/hh/button'

interface NavProps { showLinks?: boolean }

export function Nav({ showLinks = true }: NavProps) {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 flex items-center h-16 px-[5%] border-b"
      style={{ background: 'rgba(14,12,10,0.85)', backdropFilter: 'blur(20px)', borderColor: 'var(--hh-border)' }}
    >
      <div
        className="text-[22px] font-extrabold tracking-[-0.5px]"
        style={{ fontFamily: 'var(--font-syne)', color: 'var(--hh-txt)' }}
      >
        Hand<O>hub</O>
      </div>

      {showLinks && (
        <nav className="hidden md:flex gap-7 ml-12" aria-label="Main navigation">
          {['How it works', 'For artisans', 'Pricing', 'Cities'].map(l => (
            <a
              key={l}
              href="#"
              className="text-[13.5px] transition-colors duration-150 hover:text-(--hh-txt)"
              style={{ color: 'var(--hh-txt2)' }}
            >
              {l}
            </a>
          ))}
        </nav>
      )}

      <div className="ml-auto flex items-center gap-3">
        <HHButton variant="ghost" size="sm" pill>Sign in</HHButton>
        <HHButton size="sm" pill>Get started free</HHButton>
      </div>
    </header>
  )
}
