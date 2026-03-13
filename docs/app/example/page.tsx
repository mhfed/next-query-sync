'use client'
import Link from 'next/link'
import { useState, useEffect, useRef, Suspense } from 'react'
import { z } from 'zod'
import {
  useQueryState,
  useQueryStates,
  parseAsString,
  parseAsInteger,
  parseAsIsoDateTime,
  parseAsBoolean,
  parseAsArrayOf,
  withDefault,
} from 'next-query-sync'
import {
  Play, Code2, Copy, Check, Link2, Search,
  ChevronLeft, ChevronRight, ArrowLeft, Zap, Shield,
  Menu, X,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Shared UI primitives
// ---------------------------------------------------------------------------
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }}
      className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/5 border border-white/10 text-sm text-zinc-400 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
    >
      {copied ? <Check size={11} className="text-green-400" /> : <Copy size={11} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

function hl(line: string): string {
  return line
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/('use client'|'next-query-sync'|'zod')/g, '<span style="color:#a78bfa">$1</span>')
    .replace(/"([^"]+)"/g, '<span style="color:#fbbf24">"$1"</span>')
    .replace(/\b(import|export|from|function|return|const|let|type|interface|null|true|false|if|else|async|await)\b/g, '<span style="color:#60a5fa">$1</span>')
    .replace(/\b(useQueryState|useQueryStates|withDefault|parseAsString|parseAsInteger|parseAsFloat|parseAsBoolean|parseAsArrayOf|parseAsIsoDateTime|makeParser)\b/g, '<span style="color:#34d399">$1</span>')
    .replace(/(\/\/.*$)/g, '<span style="color:#6b7280">$1</span>')
    .replace(/\b(number|string|boolean|Date|T)\b/g, '<span style="color:#fb923c">$1</span>')
}

function CodeBlock({ code, filename }: { code: string; filename?: string }) {
  const lines = code.trim().split('\n')
  return (
    <div className="rounded-xl border border-white/10 bg-[#0d0d14] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/8 bg-white/3">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500/80" />
          <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <span className="w-3 h-3 rounded-full bg-green-500/80" />
          {filename && <span className="ml-3 text-sm text-zinc-500 font-mono">{filename}</span>}
        </div>
        <CopyButton text={code.trim()} />
      </div>
      <pre className="p-4 text-sm font-mono leading-relaxed overflow-x-auto">
        <code>
          {lines.map((line, i) => (
            <div key={i} className="flex">
              <span className="select-none w-7 shrink-0 text-zinc-700 text-right mr-4 tabular-nums">{i + 1}</span>
              <span dangerouslySetInnerHTML={{ __html: hl(line) }} />
            </div>
          ))}
        </code>
      </pre>
    </div>
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
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/3 border border-white/8 text-sm font-mono overflow-hidden">
      <Link2 size={11} className="text-zinc-600 shrink-0" />
      <span className="text-zinc-600 shrink-0 truncate">localhost:3000/example</span>
      <span className="text-violet-400 truncate min-w-0">{search || ''}</span>
    </div>
  )
}

function ExampleCard({
  id, badge, title, description, demo, code, filename,
}: {
  id: string; badge: string; title: string; description: string
  demo: React.ReactNode; code: string; filename?: string
}) {
  const [tab, setTab] = useState<'demo' | 'code'>('demo')
  return (
    <div id={id} className="rounded-2xl border border-white/10 bg-white/2 overflow-hidden scroll-mt-6">
      <div className="px-6 py-5 border-b border-white/8 flex flex-col gap-1">
        <span className="inline-flex w-fit items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-violet-500/15 text-violet-300 border border-violet-500/20">
          {badge}
        </span>
        <h3 className="text-2xl font-bold text-white">{title}</h3>
        <p className="text-base text-zinc-400 leading-relaxed">{description}</p>
      </div>
      <div className="flex border-b border-white/8">
        {(['demo', 'code'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium capitalize transition-colors ${
              tab === t ? 'text-white border-b-2 border-violet-400' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {t === 'demo' ? <Play size={12} /> : <Code2 size={12} />}
            {t === 'demo' ? 'Live Demo' : 'Code'}
          </button>
        ))}
      </div>
      <div className="p-6">
        {tab === 'demo' ? (
          <div className="space-y-4">
            <Suspense fallback={<div className="text-zinc-500 text-sm animate-pulse">Loading…</div>}>
              {demo}
            </Suspense>
            <UrlBar />
          </div>
        ) : (
          <CodeBlock code={code} filename={filename} />
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Demo 1 — Auto-Inference
// ---------------------------------------------------------------------------
function AutoInferDemo() {
  const [count, setCount]   = useQueryState('count', 0)
  const [search, setSearch] = useQueryState('search', '')
  const [active, setActive] = useQueryState('active', false)
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <span className="text-sm text-zinc-500 w-16 shrink-0">number:</span>
        <button onClick={() => setCount(c => c - 1)} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-zinc-300 hover:bg-white/10 text-sm transition">−</button>
        <span className="text-2xl font-black tabular-nums w-10 text-center text-white">{count}</span>
        <button onClick={() => setCount(c => c + 1)} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-zinc-300 hover:bg-white/10 text-sm transition">+</button>
        <button onClick={() => setCount(0)} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-zinc-500 hover:text-zinc-300 text-sm transition">Reset</button>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-zinc-500 w-16 shrink-0">string:</span>
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Type something…"
          className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50 transition" />
        <button onClick={() => setSearch('')} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-zinc-500 hover:text-zinc-300 text-sm transition">Clear</button>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-zinc-500 w-16 shrink-0">boolean:</span>
        <button onClick={() => setActive(v => !v)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${active ? 'bg-violet-600' : 'bg-zinc-700'}`}>
          <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${active ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
        <code className="text-sm text-orange-400">{String(active)}</code>
      </div>
      <p className="text-sm text-zinc-600">Default <code className="text-violet-400">0</code> → number · <code className="text-violet-400">&#39;&#39;</code> → string · <code className="text-violet-400">false</code> → boolean. Default removes key from URL.</p>
    </div>
  )
}
const autoInferCode = `'use client'
import { useQueryState } from 'next-query-sync'

// No parsers needed — type is inferred from the default value
function Demo() {
  const [count,  setCount]  = useQueryState('count',  0)     // → number
  const [search, setSearch] = useQueryState('search', '')    // → string
  const [active, setActive] = useQueryState('active', false) // → boolean

  // setValue equals default → removes key from URL (clean URLs)
  // setCount(0)   → removes ?count from URL
  // setSearch('') → removes ?search from URL
}`

// ---------------------------------------------------------------------------
// Demo 2 — String (nullable)
// ---------------------------------------------------------------------------
function SearchDemo() {
  const [q, setQ] = useQueryState('q', parseAsString)
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
        <input type="text" placeholder="Type to search…" value={q ?? ''}
          onChange={(e) => setQ(e.target.value || null)}
          className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50 transition" />
      </div>
      <p className="text-sm text-zinc-500">
        Value: <code className="text-violet-400">{q === null ? 'null' : `"${q}"`}</code>
        {' '} — {q ? `searching for "${q}"` : 'key removed from URL when empty'}
      </p>
    </div>
  )
}
const searchCode = `'use client'
import { useQueryState, parseAsString } from 'next-query-sync'

function SearchBox() {
  const [q, setQ] = useQueryState('q', parseAsString)
  // q: string | null
  // null  → key absent from URL
  // "hi"  → ?q=hi

  return (
    <input
      value={q ?? ''}
      onChange={(e) => setQ(e.target.value || null)}
      placeholder="Type to search…"
    />
  )
}`

// ---------------------------------------------------------------------------
// Demo 3 — Pagination
// ---------------------------------------------------------------------------
function PaginationDemo() {
  const [page, setPage] = useQueryState('page', withDefault(parseAsInteger, 1), { history: 'push' })
  const TOTAL = 8
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-center gap-2 flex-wrap">
        <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-zinc-300 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition">
          <ChevronLeft size={16} /> Prev
        </button>
        <div className="flex gap-1">
          {Array.from({ length: TOTAL }, (_, i) => i + 1).map(n => (
            <button key={n} onClick={() => setPage(n)}
              className={`w-9 h-9 rounded-lg text-sm font-semibold transition ${n === page ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/30' : 'bg-white/5 border border-white/10 text-zinc-400 hover:bg-white/10'}`}>
              {n}
            </button>
          ))}
        </div>
        <button disabled={page >= TOTAL} onClick={() => setPage(p => Math.min(TOTAL, p + 1))}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-zinc-300 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition">
          Next <ChevronRight size={16} />
        </button>
      </div>
      <p className="text-sm text-zinc-500 text-center"><code className="text-violet-400">history: &#39;push&#39;</code> — Back/Forward button navigates between pages.</p>
    </div>
  )
}
const paginationCode = `'use client'
import { useQueryState, parseAsInteger, withDefault } from 'next-query-sync'

function Pagination() {
  const [page, setPage] = useQueryState(
    'page',
    withDefault(parseAsInteger, 1), // default → 1 (never null)
    { history: 'push' }             // Back button works!
  )
  // page: number  ← withDefault removes null from type

  return (
    <>
      <button onClick={() => setPage(p => p - 1)}>← Prev</button>
      <span>Page {page}</span>
      <button onClick={() => setPage(p => p + 1)}>Next →</button>
    </>
  )
}`

// ---------------------------------------------------------------------------
// Demo 4 — Boolean
// ---------------------------------------------------------------------------
function BooleanDemo() {
  const [dark, setDark]       = useQueryState('dark',    withDefault(parseAsBoolean, false))
  const [compact, setCompact] = useQueryState('compact', withDefault(parseAsBoolean, false))
  return (
    <div className="space-y-3">
      {[
        { label: 'Dark mode',    key: 'dark',    value: dark,    setter: setDark },
        { label: 'Compact view', key: 'compact', value: compact, setter: setCompact },
      ].map(({ label, key, value, setter }) => (
        <div key={key} className="flex items-center justify-between p-4 rounded-xl border border-white/8 bg-white/3">
          <div>
            <p className="text-sm font-medium text-white">{label}</p>
            <p className="text-sm text-zinc-500 mt-0.5">
              <code className="text-violet-400">?{key}=</code><code className="text-orange-400">{value.toString()}</code>
            </p>
          </div>
          <button onClick={() => setter(v => !v)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${value ? 'bg-violet-600' : 'bg-zinc-700'}`}>
            <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
      ))}
    </div>
  )
}
const booleanCode = `'use client'
import { useQueryState, parseAsBoolean, withDefault } from 'next-query-sync'

function Settings() {
  const [dark, setDark] = useQueryState(
    'dark',
    withDefault(parseAsBoolean, false)
  )
  // dark: boolean  ← never null

  return (
    <button onClick={() => setDark(v => !v)}>
      {dark ? 'Light mode' : 'Dark mode'}
    </button>
  )
}`

// ---------------------------------------------------------------------------
// Demo 5 — Array
// ---------------------------------------------------------------------------
const ALL_TAGS = ['react', 'typescript', 'nextjs', 'tailwind', 'nodejs']

function ArrayDemo() {
  const [tags, setTags] = useQueryState('tags', parseAsArrayOf(parseAsString))
  const selected = tags ?? []
  const toggle = (tag: string) => {
    const next = selected.includes(tag) ? selected.filter(t => t !== tag) : [...selected, tag]
    setTags(next.length > 0 ? next : null)
  }
  return (
    <div className="space-y-4">
      <p className="text-sm text-zinc-500">Select topics (comma-separated in URL):</p>
      <div className="flex flex-wrap gap-2">
        {ALL_TAGS.map(tag => (
          <button key={tag} onClick={() => toggle(tag)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition ${selected.includes(tag) ? 'border-violet-500 bg-violet-500/20 text-violet-300' : 'border-white/10 bg-white/3 text-zinc-400 hover:border-white/20 hover:text-white'}`}>
            {tag}
          </button>
        ))}
      </div>
      <div className="p-4 rounded-xl border border-white/8 bg-white/3">
        <p className="text-sm text-zinc-500 mb-1">JS value:</p>
        <code className="text-sm text-violet-400">{selected.length > 0 ? JSON.stringify(selected) : 'null'}</code>
      </div>
    </div>
  )
}
const arrayCode = `'use client'
import { useQueryState, parseAsArrayOf, parseAsString } from 'next-query-sync'

function TagFilter() {
  const [tags, setTags] = useQueryState(
    'tags',
    parseAsArrayOf(parseAsString)
  )
  // tags: string[] | null
  // ?tags=react,nextjs → ['react', 'nextjs']

  const toggle = (tag: string) => {
    const current = tags ?? []
    const next = current.includes(tag)
      ? current.filter(t => t !== tag)
      : [...current, tag]
    setTags(next.length > 0 ? next : null)
  }
}`

// ---------------------------------------------------------------------------
// Demo 6 — useQueryStates
// ---------------------------------------------------------------------------
const SORT_OPTIONS = ['latest', 'popular', 'oldest']

function MultiParamsDemo() {
  const [filters, setFilters] = useQueryStates(
    { sort: withDefault(parseAsString, 'latest'), pg: withDefault(parseAsInteger, 1), s: parseAsString },
    { history: 'push' }
  )
  const pg   = filters.pg   ?? 1
  const sort = filters.sort ?? 'latest'
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {SORT_OPTIONS.map(opt => (
          <button key={opt} onClick={() => setFilters({ sort: opt, pg: 1 })}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition ${sort === opt ? 'border-violet-500 bg-violet-500/20 text-violet-300' : 'border-white/10 bg-white/3 text-zinc-400 hover:border-white/20 hover:text-white'}`}>
            {opt}
          </button>
        ))}
      </div>
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
        <input type="text" placeholder="Search…" value={filters.s ?? ''}
          onChange={(e) => setFilters({ s: e.target.value || null, pg: 1 })}
          className="w-full pl-8 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50 text-sm transition" />
      </div>
      <div className="flex items-center gap-3">
        <p className="text-sm text-zinc-500">Page:</p>
        <button disabled={pg <= 1} onClick={() => setFilters({ pg: pg - 1 })}
          className="px-3 py-1 rounded bg-white/5 border border-white/10 text-sm text-zinc-300 hover:bg-white/10 disabled:opacity-30 transition">←</button>
        <span className="text-sm font-bold text-white tabular-nums w-6 text-center">{pg}</span>
        <button onClick={() => setFilters({ pg: pg + 1 })}
          className="px-3 py-1 rounded bg-white/5 border border-white/10 text-sm text-zinc-300 hover:bg-white/10 transition">→</button>
      </div>
      <div className="p-4 rounded-xl border border-white/8 bg-white/3 text-sm font-mono space-y-1">
        <p><span className="text-pink-400">sort</span>: <span className="text-yellow-400">{JSON.stringify(sort)}</span></p>
        <p><span className="text-pink-400">pg</span>:   <span className="text-orange-400">{pg}</span></p>
        <p><span className="text-pink-400">s</span>:    <span className="text-violet-400">{filters.s === null ? 'null' : JSON.stringify(filters.s)}</span></p>
      </div>
    </div>
  )
}
const multiParamsCode = `'use client'
import { useQueryStates, parseAsString, parseAsInteger, withDefault } from 'next-query-sync'

function ProductFilters() {
  const [filters, setFilters] = useQueryStates(
    {
      sort:   withDefault(parseAsString,  'latest'),
      page:   withDefault(parseAsInteger, 1),
      search: parseAsString,
    },
    { history: 'push' }
  )
  // One setFilters() call → one history entry (no racing state)
  const handleSort = (sort: string) =>
    setFilters({ sort, page: 1 })
}`

// ---------------------------------------------------------------------------
// Demo 7 — Parser chaining
// ---------------------------------------------------------------------------
function ChainingDemo() {
  const [page, setPage] = useQueryState('cp', parseAsInteger.withDefault(1))
  const [date, setDate] = useQueryState('dt', parseAsIsoDateTime.withDefault(new Date('2026-01-01T00:00:00.000Z')))
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <span className="text-sm text-zinc-500 w-12 shrink-0">integer:</span>
        <button onClick={() => setPage(p => Math.max(1, p - 1))} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-zinc-300 hover:bg-white/10 text-sm transition">←</button>
        <span className="text-lg font-black tabular-nums w-8 text-center text-white">{page}</span>
        <button onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-zinc-300 hover:bg-white/10 text-sm transition">→</button>
        <button onClick={() => setPage(1)} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-zinc-500 hover:text-zinc-300 text-sm transition">Reset</button>
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm text-zinc-500 w-12 shrink-0">Date:</span>
        <input type="date" value={date.toISOString().slice(0, 10)}
          onChange={e => setDate(new Date(e.target.value + 'T00:00:00.000Z'))}
          className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-violet-500/50 transition" />
        <code className="text-sm text-zinc-500">{date.toISOString()}</code>
      </div>
    </div>
  )
}
const chainingCode = `'use client'
import { useQueryState, parseAsInteger, parseAsIsoDateTime } from 'next-query-sync'

// nuqs-style chained API — no withDefault() wrapper needed
const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1))
const [date, setDate] = useQueryState('date', parseAsIsoDateTime.withDefault(new Date()))

// All built-in parsers support .withDefault():
// parseAsString.withDefault('')
// parseAsFloat.withDefault(0.0)
// parseAsBoolean.withDefault(false)
// parseAsArrayOf(parseAsString).withDefault([])
// parseAsIsoDateTime.withDefault(new Date())

// Re-chain to change the default:
// parseAsInteger.withDefault(1).withDefault(99) → default is 99`

// ---------------------------------------------------------------------------
// Demo 8 — Zod
// ---------------------------------------------------------------------------
const RoleFilterSchema = z.object({
  role:   z.enum(['admin', 'user', 'guest']),
  status: z.enum(['active', 'banned']),
}).default({ role: 'user', status: 'active' })

function ZodDemo() {
  const [filter, setFilter] = useQueryState('zf', RoleFilterSchema)
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-zinc-500 mb-2">role</p>
          <div className="flex gap-1.5 flex-wrap">
            {(['admin', 'user', 'guest'] as const).map(r => (
              <button key={r} onClick={() => setFilter(f => ({ ...f, role: r }))}
                className={`px-2.5 py-1 rounded-full text-sm border transition ${filter.role === r ? 'bg-violet-500/20 border-violet-500 text-violet-300 font-semibold' : 'border-white/10 text-zinc-400 hover:border-white/20 hover:text-white'}`}>
                {r}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm text-zinc-500 mb-2">status</p>
          <div className="flex gap-1.5">
            {(['active', 'banned'] as const).map(s => (
              <button key={s} onClick={() => setFilter(f => ({ ...f, status: s }))}
                className={`px-2.5 py-1 rounded-full text-sm border transition ${filter.status === s ? 'bg-green-500/20 border-green-500 text-green-300 font-semibold' : 'border-white/10 text-zinc-400 hover:border-white/20 hover:text-white'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="p-4 rounded-xl border border-white/8 bg-white/3 text-sm font-mono space-y-1">
        <p className="text-zinc-600">{'// JS value (type-safe, never null):'}</p>
        <p className="text-violet-400">{JSON.stringify(filter)}</p>
      </div>
      <div className="flex items-start gap-2 p-3 rounded-lg bg-emerald-500/8 border border-emerald-500/20">
        <Shield size={13} className="text-emerald-400 mt-0.5 shrink-0" />
        <p className="text-sm text-emerald-300">Invalid URL → safely falls back to Zod default. No crashes.</p>
      </div>
    </div>
  )
}
const zodCode = `'use client'
import { z } from 'zod'
import { useQueryState } from 'next-query-sync'

const FilterSchema = z.object({
  role:   z.enum(['admin', 'user', 'guest']),
  status: z.enum(['active', 'banned']),
}).default({ role: 'user', status: 'active' })

function Filters() {
  // Pass schema directly — no wrapper needed!
  const [filter, setFilter] = useQueryState('filter', FilterSchema)
  // filter: { role: 'admin' | 'user' | 'guest'; status: 'active' | 'banned' }
  //         → never null, always validated

  // URL: ?filter=%7B%22role%22%3A%22admin%22%2C%22status%22%3A%22active%22%7D
  // If URL is tampered with → silently falls back to .default({...})

  setFilter(f => ({ ...f, role: 'admin' }))
}`

// ---------------------------------------------------------------------------
// Demo 9 — Debounce
// ---------------------------------------------------------------------------
function DebounceDemo() {
  const [q, setQ] = useQueryState('dq', '', { debounce: 400, startTransition: true })
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
        <input type="text" value={q} onChange={e => setQ(e.target.value)}
          placeholder="Type quickly — URL updates 400ms after you stop…"
          className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50 transition" />
      </div>
      <div className="flex items-center justify-between text-xs text-zinc-500">
        <span>Value: <code className="text-violet-400">{q === '' ? '(empty)' : `"${q}"`}</code></span>
        <span className="text-zinc-600">debounce: 400ms · startTransition: true</span>
      </div>
      <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-500/8 border border-yellow-500/20">
        <Zap size={13} className="text-yellow-400 mt-0.5 shrink-0" />
        <p className="text-sm text-yellow-300">UI updates instantly (optimistic). URL writes only after user stops typing — prevents redundant Next.js server fetches.</p>
      </div>
    </div>
  )
}
const debounceCode = `'use client'
import { useQueryState } from 'next-query-sync'

function SearchInput() {
  const [q, setQ] = useQueryState('q', '', {
    debounce: 300,         // wait 300ms after last keystroke
    startTransition: true, // non-urgent React update (no UI freeze)
  })
  // Optimistic: UI shows pending value immediately
  // URL only updates after debounce fires → fewer server re-fetches

  return (
    <input
      value={q}
      onChange={e => setQ(e.target.value)} // call freely, lib handles throttling
      placeholder="Search…"
    />
  )
}`

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------
const EXAMPLES = [
  { id: 'ex-auto',     badge: 'useQueryState · auto-inference',                      icon: '✨', title: 'useState-like API',        description: 'Pass a primitive default — the library infers the parser automatically. No imports needed.',                                        demo: <AutoInferDemo />,    code: autoInferCode,    filename: 'auto-infer.tsx' },
  { id: 'ex-search',   badge: 'useQueryState · parseAsString',                       icon: '🔤', title: 'String (nullable)',         description: 'Sync a text input with a URL param. Clearing the input removes the key from the URL entirely.',                                    demo: <SearchDemo />,       code: searchCode,       filename: 'search.tsx' },
  { id: 'ex-page',     badge: 'parseAsInteger · withDefault · history:push',         icon: '📄', title: 'Pagination',                description: 'Integer with default 1 — never null. history:\'push\' creates real history entries so Back/Forward navigates pages.',            demo: <PaginationDemo />,   code: paginationCode,   filename: 'pagination.tsx' },
  { id: 'ex-bool',     badge: 'parseAsBoolean · withDefault',                        icon: '☑️', title: 'Boolean Toggles',           description: 'Two independent boolean params. withDefault ensures the value is always a boolean.',                                             demo: <BooleanDemo />,      code: booleanCode,      filename: 'booleans.tsx' },
  { id: 'ex-array',    badge: 'parseAsArrayOf',                                      icon: '📋', title: 'Multi-Select Array',        description: 'Array values serialized as comma-separated strings. Deselecting all removes the key.',                                           demo: <ArrayDemo />,        code: arrayCode,        filename: 'array.tsx' },
  { id: 'ex-multi',    badge: 'useQueryStates · multiple parsers',                   icon: '⊞',  title: 'Combined Filters',          description: 'Manage sort, page and search in one hook. One setFilters() call → one history entry.',                                           demo: <MultiParamsDemo />,  code: multiParamsCode,  filename: 'multi-params.tsx' },
  { id: 'ex-chain',    badge: 'parseAsInteger.withDefault() · parseAsIsoDateTime',   icon: '⛓️', title: 'Parser Chaining',           description: 'nuqs-style .withDefault() API on every built-in parser. Includes parseAsIsoDateTime.',                                          demo: <ChainingDemo />,     code: chainingCode,     filename: 'chaining.tsx' },
  { id: 'ex-zod',      badge: 'Zod schema · JSON · safe fallback',                   icon: '🛡️', title: 'Zod Integration',           description: 'Pass a Zod schema directly. Auto-parses JSON, validates, and falls back to .default() on error.',                               demo: <ZodDemo />,          code: zodCode,          filename: 'zod.tsx' },
  { id: 'ex-debounce', badge: 'debounce · startTransition · optimistic UI',          icon: '⚡', title: 'Debounce + Transition',     description: 'Built-in debounce with optimistic pending value — UI is instant, URL writes are throttled.',                                     demo: <DebounceDemo />,     code: debounceCode,     filename: 'debounce.tsx' },
]

// ---------------------------------------------------------------------------
// Sidebar
// ---------------------------------------------------------------------------
function Sidebar({ activeId }: { activeId: string }) {
  return (
    <aside className="w-60 shrink-0 sticky top-[57px] h-[calc(100vh-57px)] overflow-y-auto border-r border-white/8 bg-[#0a0a0f]/60 backdrop-blur-sm">
      <div className="px-4 pt-5 pb-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-600 mb-4">Examples</p>
        <nav className="space-y-0.5">
          {EXAMPLES.map((ex, i) => {
            const isActive = activeId === ex.id
            return (
              <a
                key={ex.id}
                href={`#${ex.id}`}
                className={`group flex items-start gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-violet-500/12 text-white'
                    : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/4'
                }`}
              >
                {/* Number badge */}
                <span className={`shrink-0 mt-0.5 w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold tabular-nums transition-colors ${
                  isActive ? 'bg-violet-500/30 text-violet-300' : 'bg-white/5 text-zinc-600 group-hover:text-zinc-400'
                }`}>
                  {i + 1}
                </span>
                <span className="leading-snug min-w-0">
                  <span className={`block font-medium transition-colors ${isActive ? 'text-white' : ''}`}>
                    {ex.icon} {ex.title}
                  </span>
                </span>
                {/* Active bar */}
                {isActive && (
                  <span className="ml-auto mt-1 shrink-0 w-1.5 h-1.5 rounded-full bg-violet-400" />
                )}
              </a>
            )
          })}
        </nav>
      </div>

      {/* Live URL at bottom of sidebar */}
      <div className="px-4 pb-5 mt-4 border-t border-white/6 pt-4">
        <p className="text-sm text-zinc-600 mb-2 font-medium uppercase tracking-widest">Live URL</p>
        <UrlBar />
      </div>
    </aside>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function Page() {
  const [activeId, setActiveId] = useState(EXAMPLES[0].id)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)

  // Track which example is in view via IntersectionObserver
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible.length > 0) {
          setActiveId(visible[0].target.id)
        }
      },
      { rootMargin: '-10% 0px -70% 0px', threshold: 0 }
    )

    EXAMPLES.forEach(ex => {
      const el = document.getElementById(ex.id)
      if (el) observerRef.current?.observe(el)
    })

    return () => observerRef.current?.disconnect()
  }, [])

  // Track scroll position for nav shadow
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">

      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-150 h-150 rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="absolute top-1/2 -right-40 w-125 h-125 rounded-full bg-blue-600/6 blur-[120px]" />
      </div>

      {/* Nav */}
      <nav className={`sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 py-3.5 border-b backdrop-blur-md bg-[#0a0a0f]/95 transition-shadow duration-200 ${
        scrolled ? 'border-white/10 shadow-lg shadow-black/40' : 'border-white/6'
      }`}>
        <div className="flex items-center gap-3">
          {/* Mobile sidebar toggle */}
          <button
            onClick={() => setSidebarOpen(v => !v)}
            className="lg:hidden p-1.5 rounded-lg border border-white/10 text-zinc-400 hover:text-white hover:bg-white/5 transition"
          >
            {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
          <Link href="/" className="flex items-center gap-2 text-base text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft size={15} /> Docs
          </Link>
        </div>
        <span className="text-base font-bold bg-linear-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
          next-query-sync · Live Examples
        </span>
        <div className="flex items-center gap-2">
          <span className="hidden sm:flex items-center gap-1.5 text-sm text-zinc-500">
            <Play size={11} className="text-violet-400" />
            {EXAMPLES.length} demos
          </span>
        </div>
      </nav>

      <div className="flex relative z-10">

        {/* Desktop sidebar */}
        <div className="hidden lg:block">
          <Sidebar activeId={activeId} />
        </div>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-20 flex">
            <div className="w-64 bg-[#0a0a0f] border-r border-white/10 h-full overflow-y-auto pt-[57px]">
              <Sidebar activeId={activeId} />
            </div>
            <div className="flex-1 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 min-w-0 px-4 sm:px-8 py-8 space-y-8 max-w-5xl mx-auto">
          {/* Mini header above first card */}
          <div className="flex items-center gap-3 pb-2 border-b border-white/6">
            <div className="flex items-center gap-2 text-sm text-zinc-500">
              <Play size={11} className="text-violet-400" />
              Interactive · All demos sync with the URL bar in the sidebar
            </div>
          </div>

          {EXAMPLES.map(e => (
            <ExampleCard key={e.id} {...e} />
          ))}

          <div className="pt-4 border-t border-white/6 text-center">
            <Link href="/" className="text-sm text-zinc-600 hover:text-zinc-400 transition-colors">
              ← Back to docs
            </Link>
          </div>
        </main>
      </div>
    </div>
  )
}
