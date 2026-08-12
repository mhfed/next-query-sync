'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
  parseAsBoolean,
  parseAsInteger,
  parseAsString,
  useQueryState,
  useQueryStates,
  withDefault,
} from 'next-query-sync'
import {
  ArrowLeft,
  Check,
  Copy,
  ExternalLink,
  History,
  Layers3,
  Search,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react'

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-zinc-400 transition hover:bg-white/10 hover:text-white"
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

function UrlBar() {
  const [search, setSearch] = useState('')

  useEffect(() => {
    const update = () => setSearch(window.location.search)
    update()
    window.addEventListener('next-query-sync_update', update)
    window.addEventListener('popstate', update)
    return () => {
      window.removeEventListener('next-query-sync_update', update)
      window.removeEventListener('popstate', update)
    }
  }, [])

  return (
    <div className="overflow-hidden rounded-xl border border-white/8 bg-black/30 px-4 py-3 font-mono text-xs">
      <span className="text-zinc-600">/example</span>
      <span className="text-violet-300">{search}</span>
    </div>
  )
}

function Code({ children }: { children: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/8 bg-[#0c0c12]">
      <div className="flex justify-end border-b border-white/7 px-3 py-2">
        <CopyButton text={children} />
      </div>
      <pre className="overflow-x-auto p-4 text-xs leading-6 text-zinc-400">
        <code>{children}</code>
      </pre>
    </div>
  )
}

function Example({
  icon,
  title,
  description,
  demo,
  code,
}: {
  icon: React.ReactNode
  title: string
  description: string
  demo: React.ReactNode
  code: string
}) {
  return (
    <section className="rounded-3xl border border-white/8 bg-white/[0.025] p-6 sm:p-8">
      <div className="flex items-start gap-4">
        <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
          {icon}
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">{description}</p>
        </div>
      </div>
      <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4 rounded-2xl border border-white/8 bg-black/20 p-5">
          {demo}
          <UrlBar />
        </div>
        <Code>{code}</Code>
      </div>
    </section>
  )
}

function PrimitiveDemo() {
  const [count, setCount] = useQueryState('count', 0)
  const [active, setActive] = useQueryState('active', false)

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-wider text-zinc-600">number default</p>
        <div className="mt-2 flex items-center gap-3">
          <button onClick={() => setCount(value => value - 1)} className="rounded-lg border border-white/10 px-3 py-2 text-sm hover:bg-white/5">−</button>
          <strong className="min-w-10 text-center text-2xl tabular-nums">{count}</strong>
          <button onClick={() => setCount(value => value + 1)} className="rounded-lg border border-white/10 px-3 py-2 text-sm hover:bg-white/5">+</button>
          <button onClick={() => setCount(0)} className="ml-auto text-xs text-zinc-500 hover:text-zinc-300">reset</button>
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-white/7 pt-4">
        <div>
          <p className="text-sm font-medium">Boolean default</p>
          <p className="text-xs text-zinc-600">Default values are removed from the URL.</p>
        </div>
        <button
          onClick={() => setActive(value => !value)}
          className={`rounded-full px-4 py-2 text-xs font-semibold ${active ? 'bg-violet-600' : 'bg-zinc-800 text-zinc-400'}`}
        >
          {String(active)}
        </button>
      </div>
    </div>
  )
}

const primitiveCode = `const [count, setCount] = useQueryState('count', 0)
// count: number

const [active, setActive] = useQueryState('active', false)
// active: boolean

setCount(0)     // removes ?count because 0 is the default
setActive(true) // writes ?active=true`

function DebounceDemo() {
  const [query, setQuery] = useQueryState('q', '', { debounce: 400 })

  return (
    <div>
      <label className="text-xs uppercase tracking-wider text-zinc-600">optimistic search</label>
      <div className="relative mt-2">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
        <input
          value={query}
          onChange={event => setQuery(event.target.value)}
          placeholder="Type quickly…"
          className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-9 pr-3 text-sm outline-none transition focus:border-violet-500/50"
        />
      </div>
      <p className="mt-3 text-xs leading-5 text-zinc-600">
        The hook value changes immediately. The URL write waits 400ms after the latest input.
      </p>
    </div>
  )
}

const debounceCode = `const [query, setQuery] = useQueryState('q', '', {
  debounce: 400,
})

// query updates optimistically for the input.
// The URL write waits until the debounce interval expires.
// Returning to '' removes q because '' is the default.`

function PaginationDemo() {
  const [page, setPage] = useQueryState(
    'page',
    withDefault(parseAsInteger, 1),
    { history: 'push' },
  )

  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-zinc-600">push history</p>
      <div className="mt-3 flex items-center gap-3">
        <button
          onClick={() => setPage(value => Math.max(1, value - 1))}
          disabled={page <= 1}
          className="rounded-lg border border-white/10 px-4 py-2 text-sm disabled:opacity-30"
        >
          Previous
        </button>
        <strong className="min-w-20 text-center">Page {page}</strong>
        <button
          onClick={() => setPage(value => value + 1)}
          className="rounded-lg border border-white/10 px-4 py-2 text-sm hover:bg-white/5"
        >
          Next
        </button>
      </div>
      <p className="mt-3 text-xs leading-5 text-zinc-600">
        Page changes create intentional browser-history entries. Try Back and Forward after moving a few pages.
      </p>
    </div>
  )
}

const paginationCode = `const [page, setPage] = useQueryState(
  'page',
  withDefault(parseAsInteger, 1),
  { history: 'push' },
)

setPage(page => page + 1)
// creates a history entry such as ?page=2`

function FiltersDemo() {
  const [filters, setFilters] = useQueryStates({
    page: withDefault(parseAsInteger, 1),
    q: parseAsString,
    inStock: withDefault(parseAsBoolean, false),
  })

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs uppercase tracking-wider text-zinc-600">query</label>
        <input
          value={filters.q ?? ''}
          onChange={event => setFilters({ q: event.target.value || null, page: 1 })}
          placeholder="Filter products"
          className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm outline-none transition focus:border-violet-500/50"
        />
      </div>
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm text-zinc-400">
          <input
            type="checkbox"
            checked={filters.inStock}
            onChange={event => setFilters({ inStock: event.target.checked, page: 1 })}
          />
          In stock
        </label>
        <div className="flex items-center gap-2">
          <button onClick={() => setFilters({ page: value => Math.max(1, value - 1) })} className="rounded-lg border border-white/10 px-3 py-2 text-xs">−</button>
          <span className="text-sm tabular-nums">page {filters.page}</span>
          <button onClick={() => setFilters({ page: value => value + 1 })} className="rounded-lg border border-white/10 px-3 py-2 text-xs">+</button>
        </div>
      </div>
    </div>
  )
}

const filtersCode = `const [filters, setFilters] = useQueryStates({
  page: withDefault(parseAsInteger, 1),
  q: parseAsString,
  inStock: withDefault(parseAsBoolean, false),
})

setFilters({
  q: 'react',
  page: 1,
})
// keys in the same setter call are coalesced into one URL write`

export default function ExamplesPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-48 -top-48 h-[500px] w-[500px] rounded-full bg-violet-600/10 blur-[120px]" />
      </div>

      <header className="relative z-10 border-b border-white/7 px-6 py-5 sm:px-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white">
            <ArrowLeft size={15} /> Docs
          </Link>
          <a
            href="https://github.com/mhfed/next-query-sync/tree/main/examples"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-white"
          >
            Source examples <ExternalLink size={14} />
          </a>
        </div>
      </header>

      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-12 pt-16 sm:px-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1.5 text-xs text-violet-300">
          <Sparkles size={13} /> Interactive examples
        </div>
        <h1 className="mt-5 max-w-3xl text-4xl font-black tracking-tight sm:text-5xl">See the URL contract while you interact with it.</h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-500">
          These demos focus on behavior the repository tests: primitive inference, optimistic debounce, browser-history intent, and batched multi-param updates.
        </p>
      </section>

      <div className="relative z-10 mx-auto max-w-6xl space-y-6 px-6 pb-24 sm:px-10">
        <Example
          icon={<Sparkles size={19} />}
          title="Primitive default inference"
          description="A primitive default gives common URL state a useState-like call shape while preserving a non-null value type."
          demo={<PrimitiveDemo />}
          code={primitiveCode}
        />
        <Example
          icon={<Search size={19} />}
          title="Debounced search"
          description="Optimistic hook state updates immediately; the URL mutation is delayed and rapid calls collapse to the latest value."
          demo={<DebounceDemo />}
          code={debounceCode}
        />
        <Example
          icon={<History size={19} />}
          title="Pagination with push history"
          description="Use push for state changes users reasonably expect browser Back/Forward to traverse."
          demo={<PaginationDemo />}
          code={paginationCode}
        />
        <Example
          icon={<Layers3 size={19} />}
          title="Combined filters"
          description="`useQueryStates` keeps parser-specific nullability while coalescing keys changed in one setter call into the same URL batch."
          demo={<FiltersDemo />}
          code={filtersCode}
        />
      </div>

      <footer className="relative z-10 border-t border-white/7 px-6 py-10 sm:px-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between text-sm text-zinc-600">
          <span className="inline-flex items-center gap-2"><SlidersHorizontal size={14} /> next-query-sync examples</span>
          <Link href="/" className="hover:text-zinc-300">Back to docs</Link>
        </div>
      </footer>
    </main>
  )
}
