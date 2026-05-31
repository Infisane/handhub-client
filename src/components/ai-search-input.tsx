import { useState, useEffect, useRef, useId, useDeferredValue } from 'react'
import { Search, Loader2, X, Wrench, Zap, Hammer, Settings, Wind } from 'lucide-react'
import { cn } from '#/lib/utils'

type SearchState = 'idle' | 'focused' | 'computing'

const PILLS = [
  { id: 'plumber', label: 'Plumber near me', Icon: Wrench },
  { id: 'electrical', label: 'Electrical emergency', Icon: Zap },
  { id: 'carpentry', label: 'Carpentry', Icon: Hammer },
  { id: 'generator', label: 'Generator repair', Icon: Settings },
  { id: 'ac', label: 'AC technician', Icon: Wind },
] as const

const COMPUTING_PROMPTS = [
  'I need an electrician near me urgently to fix a smoking panel...',
  'Finding verified plumbers in your area right now...',
  'Matching artisans to your request by distance...',
  'Locating certified professionals nearby...',
]

interface AISearchInputProps {
  onSearch?: (query: string) => Promise<void> | void
  className?: string
}

export function AISearchInput({ onSearch, className }: AISearchInputProps) {
  const [query, setQuery] = useState('')
  const [state, setState] = useState<SearchState>('idle')
  const [promptIndex, setPromptIndex] = useState(0)
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const deferredQuery = useDeferredValue(query)

  const isComputing = state === 'computing'
  const isFocused = state === 'focused'
  const isStale = query !== deferredQuery

  // Cycle placeholder prompts during computing state
  useEffect(() => {
    if (!isComputing) return
    const id = setInterval(() => setPromptIndex(i => (i + 1) % COMPUTING_PROMPTS.length), 2200)
    return () => clearInterval(id)
  }, [isComputing])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim() || isComputing) return
    setState('computing')
    try {
      await onSearch?.(query)
    } finally {
      setState('focused')
    }
  }

  function handlePillClick(label: string) {
    setQuery(label)
    setState('focused')
    inputRef.current?.focus()
  }

  function handleClear() {
    setQuery('')
    setState('idle')
    inputRef.current?.focus()
  }

  const borderStyle = isFocused || isComputing ? 'var(--ai-border)' : 'var(--line)'
  const bgStyle = isFocused || isComputing ? 'var(--ai-gradient)' : 'var(--surface-strong)'
  const boxShadow =
    isFocused
      ? '0 0 0 3px rgba(216,180,254,0.25), 0 4px 16px rgba(107,33,168,0.1), 0 1px 0 var(--inset-glint) inset'
      : '0 1px 0 var(--inset-glint) inset, 0 4px 12px rgba(23,58,64,0.06)'

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <form onSubmit={handleSubmit} role="search" noValidate>
        <label htmlFor={inputId} className="sr-only">
          Search for artisans and services
        </label>

        {/* Input wrapper */}
        <div
          className="relative flex items-center gap-2 rounded-full border px-4 py-3 transition-all duration-200"
          style={{
            background: bgStyle,
            borderColor: borderStyle,
            boxShadow,
          }}
        >
          {/* Leading icon */}
          <span className="shrink-0" aria-hidden="true">
            {isComputing ? (
              <Loader2
                size={20}
                className="animate-spin"
                style={{ color: 'var(--ai-primary)' }}
              />
            ) : (
              <Search
                size={20}
                style={{ color: isFocused ? 'var(--ai-primary)' : 'var(--sea-ink-soft)' }}
              />
            )}
          </span>

          {/* Text input */}
          <input
            ref={inputRef}
            id={inputId}
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => !isComputing && setState('focused')}
            onBlur={() => !isComputing && !query && setState('idle')}
            disabled={isComputing}
            placeholder={
              isComputing
                ? COMPUTING_PROMPTS[promptIndex]
                : 'Try "Emergency plumber in Ikeja right now..."'
            }
            className={cn(
              'min-w-0 flex-1 bg-transparent text-sm outline-none',
              'placeholder:text-[var(--sea-ink-soft)] placeholder:transition-opacity placeholder:duration-500',
              isComputing && 'cursor-wait placeholder:animate-[prompt-blink_2.2s_ease-in-out_infinite]',
            )}
            style={{ color: 'var(--sea-ink)', caretColor: 'var(--ai-primary)' }}
            autoComplete="off"
            aria-busy={isComputing}
          />

          {/* Clear */}
          {query && !isComputing && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear search"
              className="shrink-0 cursor-pointer rounded-full p-1 transition-colors duration-150 hover:bg-black/8"
            >
              <X size={16} style={{ color: 'var(--sea-ink-soft)' }} aria-hidden="true" />
            </button>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isComputing || !query.trim()}
            className="shrink-0 cursor-pointer rounded-full px-4 py-1.5 text-sm font-semibold text-white transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50"
            style={{ background: isComputing ? 'var(--ai-primary)' : 'var(--lagoon-deep)' }}
          >
            {isComputing ? 'Searching…' : 'Search'}
          </button>
        </div>

        {/* Animated bottom gradient bar */}
        {(isFocused || isComputing) && (
          <div
            aria-hidden="true"
            className="mx-6 mt-0.5 h-[2px] rounded-full"
            style={{
              background: 'linear-gradient(90deg, var(--lagoon), var(--ai-border), #c084fc, var(--lagoon))',
              backgroundSize: '200% 100%',
              animation: isComputing
                ? 'gradient-slide 2s linear infinite'
                : undefined,
              opacity: isComputing ? 1 : 0.6,
            }}
          />
        )}
      </form>

      {/* Suggestion pills — hidden during computing */}
      {!isComputing && (
        <div
          className="flex gap-2 overflow-x-auto pb-1"
          style={{ scrollbarWidth: 'none' }}
          aria-label="Search suggestions"
          role="list"
        >
          {PILLS.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              role="listitem"
              onClick={() => handlePillClick(label)}
              className={cn(
                'flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium',
                'transition-colors duration-150 hover:brightness-95',
              )}
              style={{
                background: 'var(--ai-bubble)',
                borderColor: 'var(--ai-border)',
                color: 'var(--ai-primary)',
              }}
            >
              <Icon size={12} aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Stale indicator */}
      {isStale && !isComputing && (
        <p className="text-xs" style={{ color: 'var(--sea-ink-soft)' }} aria-live="polite">
          Updating results…
        </p>
      )}
    </div>
  )
}
