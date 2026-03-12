'use client'

import { useState, useEffect, Suspense } from 'react'
import {
  useQueryState,
  useQueryStates,
  parseAsString,
  parseAsInteger,
  parseAsBoolean,
  parseAsArrayOf,
  withDefault,
  type Parser,
} from 'next-query-sync'
import {
  ShieldCheck,
  Zap,
  Server,
  Copy,
  Check,
  Github,
  Package,
  ArrowRight,
  Search,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Play,
  Code2,
  BookOpen,
  Link2,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// CopyButton
// ---------------------------------------------------------------------------
function CopyButton({ text, small }: { text: string; small?: boolean }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (small) {
    return (
      <button
        onClick={handleCopy}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/5 border border-white/10 text-xs text-zinc-400 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
      >
        {copied ? <Check size={11} className="text-green-400" /> : <Copy size={11} />}
        {copied ? 'Copied' : 'Copy'}
      </button>
    )
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2 px-4 py-2 rounded-md bg-white/5 border border-white/10 text-sm text-zinc-400 hover:bg-white/10 hover:text-white transition-all duration-200 cursor-pointer"
    >
      {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
}

// ---------------------------------------------------------------------------
// InstallBox
// ---------------------------------------------------------------------------
function InstallBox() {
  return (
    <div className="inline-flex items-center gap-4 px-6 py-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
      <code className="text-sm sm:text-base font-mono text-zinc-200">
        npm i <span className="text-violet-400">next-query-sync</span>
      </code>
      <CopyButton text="npm i next-query-sync" />
    </div>
  )
}

// ---------------------------------------------------------------------------
// FeatureCard
// ---------------------------------------------------------------------------
interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
  gradient: string
}

function FeatureCard({ icon, title, description, gradient }: FeatureCardProps) {
  return (
    <div className="group relative rounded-2xl border border-white/8 bg-white/3 p-6 hover:border-white/15 hover:bg-white/6 transition-all duration-300">
      <div className={`mb-4 inline-flex items-center justify-center w-11 h-11 rounded-xl bg-linear-to-br ${gradient} text-white`}>
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-white">{title}</h3>
      <p className="text-sm leading-relaxed text-zinc-400">{description}</p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Syntax highlighter (minimal, covers TSX snippets)
// ---------------------------------------------------------------------------
function hl(line: string): string {
  return line
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/('use client'|'next-query-sync')/g, '<span style="color:#a78bfa">$1</span>')
    .replace(/"([^"]+)"/g, '<span style="color:#fbbf24">"$1"</span>')
    .replace(/\b(import|export|from|function|return|const|let|type|interface|null|true|false|if|else)\b/g, '<span style="color:#60a5fa">$1</span>')
    .replace(/\b(useQueryState|useQueryStates|withDefault|parseAsString|parseAsInteger|parseAsFloat|parseAsBoolean|parseAsArrayOf)\b/g, '<span style="color:#34d399">$1</span>')
    .replace(/(\/\/.*$)/g, '<span style="color:#6b7280">$1</span>')
    .replace(/\b(number|string|boolean|T)\b/g, '<span style="color:#fb923c">$1</span>')
}

// ---------------------------------------------------------------------------
// CodeBlock — syntax-highlighted, copyable
// ---------------------------------------------------------------------------
function CodeBlock({ code, filename }: { code: string; filename?: string }) {
  const lines = code.trim().split('\n')
  return (
    <div className="rounded-xl border border-white/10 bg-[#0d0d14] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/8 bg-white/3">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500/80" />
          <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <span className="w-3 h-3 rounded-full bg-green-500/80" />
          {filename && <span className="ml-3 text-xs text-zinc-500 font-mono">{filename}</span>}
        </div>
        <CopyButton text={code.trim()} small />
      </div>
      <pre className="p-4 text-xs font-mono leading-relaxed overflow-x-auto">
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

// ---------------------------------------------------------------------------
// UrlBar — shows live search string, updates in real-time
// ---------------------------------------------------------------------------
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
    <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/3 border border-white/8 text-xs font-mono overflow-hidden">
      <Link2 size={12} className="text-zinc-600 shrink-0" />
      <span className="text-zinc-600 shrink-0">localhost:3000</span>
      <span className="text-violet-400 truncate">{search || '/'}</span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// ExampleCard — tab-switches between Live Demo and Code
// ---------------------------------------------------------------------------
function ExampleCard({
  id,
  badge,
  title,
  description,
  demo,
  code,
  filename,
}: {
  id: string
  badge: string
  title: string
  description: string
  demo: React.ReactNode
  code: string
  filename?: string
}) {
  const [tab, setTab] = useState<'demo' | 'code'>('demo')

  return (
    <div id={id} className="rounded-2xl border border-white/10 bg-white/2 overflow-hidden scroll-mt-24">
      <div className="px-6 py-5 border-b border-white/8 flex flex-col gap-1">
        <span className="inline-flex w-fit items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-violet-500/15 text-violet-300 border border-violet-500/20">
          {badge}
        </span>
        <h3 className="text-xl font-bold text-white">{title}</h3>
        <p className="text-sm text-zinc-400 leading-relaxed">{description}</p>
      </div>

      <div className="flex border-b border-white/8">
        {(['demo', 'code'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-medium capitalize transition-colors ${
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
// Example 1 — Search input  (useQueryState + parseAsString)
// ---------------------------------------------------------------------------
function SearchDemo() {
  const [q, setQ] = useQueryState('q', parseAsString)
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
        <input
          type="text"
          placeholder="Type to search…"
          value={q ?? ''}
          onChange={(e) => setQ(e.target.value || null)}
          className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50 transition"
        />
      </div>
      <p className="text-xs text-zinc-500">
        Value:{' '}
        <code className="text-violet-400">{q === null ? 'null' : `"${q}"`}</code>
        {' '}—{' '}
        {q ? `searching for "${q}"` : 'no active search (key removed from URL)'}
      </p>
    </div>
  )
}

const searchCode = `'use client'
import { useQueryState, parseAsString } from 'next-query-sync'
import { Suspense } from 'react'

function SearchBox() {
  const [q, setQ] = useQueryState('q', parseAsString)
  // q: string | null
  // → null   when ?q is absent  (key removed from URL)
  // → "hello" when ?q=hello

  return (
    <input
      value={q ?? ''}
      onChange={(e) => setQ(e.target.value || null)}
      placeholder="Type to search…"
    />
  )
}

export default function Page() {
  return (
    <Suspense>
      <SearchBox />
    </Suspense>
  )
}`

// ---------------------------------------------------------------------------
// Example 2 — Pagination  (parseAsInteger + withDefault + history:'push')
// ---------------------------------------------------------------------------
function PaginationDemo() {
  const [page, setPage] = useQueryState(
    'page',
    withDefault(parseAsInteger, 1),
    { history: 'push' }
  )
  const TOTAL = 8

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-center gap-2 flex-wrap">
        <button
          disabled={page <= 1}
          onClick={() => setPage(p => Math.max(1, p - 1))}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-zinc-300 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          <ChevronLeft size={16} /> Prev
        </button>

        <div className="flex gap-1">
          {Array.from({ length: TOTAL }, (_, i) => i + 1).map(n => (
            <button
              key={n}
              onClick={() => setPage(n)}
              className={`w-9 h-9 rounded-lg text-xs font-semibold transition ${
                n === page
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/30'
                  : 'bg-white/5 border border-white/10 text-zinc-400 hover:bg-white/10'
              }`}
            >
              {n}
            </button>
          ))}
        </div>

        <button
          disabled={page >= TOTAL}
          onClick={() => setPage(p => Math.min(TOTAL, p + 1))}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-zinc-300 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          Next <ChevronRight size={16} />
        </button>
      </div>

      <div className="p-4 rounded-xl border border-white/8 bg-white/3 text-center">
        <p className="text-xs text-zinc-500 mb-1">Current page (TypeScript type: <code className="text-orange-400">number</code>, never null)</p>
        <p className="text-3xl font-black text-white tabular-nums">{page}</p>
      </div>

      <p className="text-xs text-zinc-500 text-center">
        Uses <code className="text-violet-400">history: &#39;push&#39;</code> — the Back / Forward button
        navigates between pages.
      </p>
    </div>
  )
}

const paginationCode = `'use client'
import {
  useQueryState,
  parseAsInteger,
  withDefault,
} from 'next-query-sync'

function Pagination() {
  const [page, setPage] = useQueryState(
    'page',
    withDefault(parseAsInteger, 1), // default → 1
    { history: 'push' }             // Back button works
  )
  // page: number  ← withDefault removes null from the type

  return (
    <div>
      <button onClick={() => setPage(p => p - 1)}>← Prev</button>
      <span>Page {page}</span>
      <button onClick={() => setPage(p => p + 1)}>Next →</button>
    </div>
  )
}`

// ---------------------------------------------------------------------------
// Example 3 — Boolean toggle  (parseAsBoolean + withDefault)
// ---------------------------------------------------------------------------
function BooleanDemo() {
  const [dark, setDark] = useQueryState('dark', withDefault(parseAsBoolean, false))
  const [grid, setGrid] = useQueryState('grid', withDefault(parseAsBoolean, true))

  return (
    <div className="space-y-4">
      {[
        { label: 'Dark mode', key: 'dark', value: dark, setter: setDark },
        { label: 'Grid view', key: 'grid', value: grid, setter: setGrid },
      ].map(({ label, key, value, setter }) => (
        <div key={key} className="flex items-center justify-between p-4 rounded-xl border border-white/8 bg-white/3">
          <div>
            <p className="text-sm font-medium text-white">{label}</p>
            <p className="text-xs text-zinc-500 mt-0.5">
              <code className="text-violet-400">?{key}=</code>
              <code className="text-orange-400">{value.toString()}</code>
            </p>
          </div>
          <button
            onClick={() => setter(v => !v)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              value ? 'bg-violet-600' : 'bg-zinc-700'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                value ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      ))}

      <p className="text-xs text-zinc-500">
        <code className="text-violet-400">withDefault(parseAsBoolean, false)</code> — value is always{' '}
        <code className="text-orange-400">boolean</code>, never null. Toggling off leaves{' '}
        <code className="text-yellow-400">?dark=false</code> in the URL.
      </p>
    </div>
  )
}

const booleanCode = `'use client'
import {
  useQueryState,
  parseAsBoolean,
  withDefault,
} from 'next-query-sync'

function Settings() {
  const [dark, setDark] = useQueryState(
    'dark',
    withDefault(parseAsBoolean, false)
  )
  // dark: boolean  ← never null thanks to withDefault
  // ?dark=true  → true
  // ?dark=false → false
  // (absent)    → false  (default)

  return (
    <button onClick={() => setDark(v => !v)}>
      {dark ? 'Light mode' : 'Dark mode'}
    </button>
  )
}`

// ---------------------------------------------------------------------------
// Example 4 — Array / multi-select  (parseAsArrayOf)
// ---------------------------------------------------------------------------
const ALL_TAGS = ['react', 'typescript', 'nextjs', 'tailwind', 'nodejs']

function ArrayDemo() {
  const [tags, setTags] = useQueryState('tags', parseAsArrayOf(parseAsString))
  const selected = tags ?? []

  const toggle = (tag: string) => {
    const next = selected.includes(tag)
      ? selected.filter(t => t !== tag)
      : [...selected, tag]
    setTags(next.length > 0 ? next : null)
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-zinc-500">Select topics (comma-separated in URL):</p>
      <div className="flex flex-wrap gap-2">
        {ALL_TAGS.map(tag => (
          <button
            key={tag}
            onClick={() => toggle(tag)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
              selected.includes(tag)
                ? 'border-violet-500 bg-violet-500/20 text-violet-300'
                : 'border-white/10 bg-white/3 text-zinc-400 hover:border-white/20 hover:text-white'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      <div className="p-4 rounded-xl border border-white/8 bg-white/3">
        <p className="text-xs text-zinc-500 mb-2">Parsed value (JS):</p>
        <code className="text-sm text-violet-400">
          {selected.length > 0 ? JSON.stringify(selected) : 'null'}
        </code>
      </div>

      <p className="text-xs text-zinc-500">
        Stored as <code className="text-yellow-400">?tags=react,typescript,nextjs</code> — a single comma-separated string.
      </p>
    </div>
  )
}

const arrayCode = `'use client'
import {
  useQueryState,
  parseAsArrayOf,
  parseAsString,
} from 'next-query-sync'

function TagFilter() {
  const [tags, setTags] = useQueryState(
    'tags',
    parseAsArrayOf(parseAsString)
  )
  // tags: string[] | null
  // ?tags=react,nextjs → ['react', 'nextjs']
  // (absent)           → null

  const toggle = (tag: string) => {
    const current = tags ?? []
    const next = current.includes(tag)
      ? current.filter(t => t !== tag)
      : [...current, tag]
    setTags(next.length > 0 ? next : null)
  }

  return (
    <div>
      {['react', 'typescript', 'nextjs'].map(tag => (
        <button key={tag} onClick={() => toggle(tag)}>
          {tag}
        </button>
      ))}
    </div>
  )
}`

// ---------------------------------------------------------------------------
// Example 5 — Multiple params  (useQueryStates)
// ---------------------------------------------------------------------------
const SORT_OPTIONS = [
  { value: 'latest', label: 'Latest' },
  { value: 'popular', label: 'Popular' },
  { value: 'oldest', label: 'Oldest' },
]

function MultiParamsDemo() {
  const [filters, setFilters] = useQueryStates(
    {
      sort: withDefault(parseAsString, 'latest'),
      pg: withDefault(parseAsInteger, 1),
      s: parseAsString,
    },
    { history: 'push' }
  )
  // useQueryStates always types values as T | null; resolve null with defaults
  const pg = filters.pg ?? 1
  const sort = filters.sort ?? 'latest'

  return (
    <div className="space-y-4">
      {/* Sort */}
      <div>
        <p className="text-xs text-zinc-500 mb-2">Sort by:</p>
        <div className="flex gap-2">
          {SORT_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setFilters({ sort: opt.value, pg: 1 })}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                sort === opt.value
                  ? 'border-violet-500 bg-violet-500/20 text-violet-300'
                  : 'border-white/10 bg-white/3 text-zinc-400 hover:border-white/20 hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div>
        <p className="text-xs text-zinc-500 mb-2">Search:</p>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Type to filter…"
            value={filters.s ?? ''}
            onChange={(e) => setFilters({ s: e.target.value || null, pg: 1 })}
            className="w-full pl-8 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50 transition text-xs"
          />
        </div>
      </div>

      {/* Page */}
      <div className="flex items-center gap-3">
        <p className="text-xs text-zinc-500">Page:</p>
        <button
          disabled={pg <= 1}
          onClick={() => setFilters({ pg: pg - 1 })}
          className="px-3 py-1 rounded bg-white/5 border border-white/10 text-xs text-zinc-300 hover:bg-white/10 disabled:opacity-30 transition"
        >
          ←
        </button>
        <span className="text-sm font-bold text-white tabular-nums w-6 text-center">{pg}</span>
        <button
          onClick={() => setFilters({ pg: pg + 1 })}
          className="px-3 py-1 rounded bg-white/5 border border-white/10 text-xs text-zinc-300 hover:bg-white/10 transition"
        >
          →
        </button>
      </div>

      <div className="p-4 rounded-xl border border-white/8 bg-white/3 text-xs font-mono space-y-1">
        <p className="text-zinc-500">// all values in one object:</p>
        <p><span className="text-pink-400">sort</span>: <span className="text-yellow-400">"{sort}"</span></p>
        <p><span className="text-pink-400">pg</span>: <span className="text-orange-400">{pg}</span></p>
        <p><span className="text-pink-400">s</span>: <span className="text-violet-400">{filters.s === null ? 'null' : `"${filters.s}"`}</span></p>
      </div>

      <p className="text-xs text-zinc-500">
        All three fields update in a <strong className="text-zinc-300">single</strong>{' '}
        <code className="text-violet-400">pushState</code> call — no double navigation entries.
      </p>
    </div>
  )
}

const multiParamsCode = `'use client'
import {
  useQueryStates,
  parseAsString,
  parseAsInteger,
  withDefault,
} from 'next-query-sync'

function ProductFilters() {
  const [filters, setFilters] = useQueryStates(
    {
      sort:   withDefault(parseAsString,  'latest'),
      page:   withDefault(parseAsInteger, 1),
      search: parseAsString,
    },
    { history: 'push' }
  )
  // filters.sort   → string       (never null)
  // filters.page   → number       (never null)
  // filters.search → string | null

  return (
    <div>
      {/* One call → one history entry */}
      <button onClick={() => setFilters({ sort: 'popular', page: 1 })}>
        Sort by Popular
      </button>
      <input
        value={filters.search ?? ''}
        onChange={(e) =>
          setFilters({ search: e.target.value || null, page: 1 })
        }
      />
    </div>
  )
}`

// ---------------------------------------------------------------------------
// Example 6 — Custom parser
// ---------------------------------------------------------------------------
const customParserCode = `import type { Parser } from 'next-query-sync'

// Custom parser for Date objects
// URL: ?date=2024-03-15  ↔  JS: Date("2024-03-15")
const parseAsDate: Parser<Date> = {
  parse: (v) => {
    if (!v) return null
    const d = new Date(v)
    return isNaN(d.getTime()) ? null : d
  },
  serialize: (d) => d.toISOString().split('T')[0]!,
}

// Usage:
const [date, setDate] = useQueryState('date', parseAsDate)
// date: Date | null`

// ---------------------------------------------------------------------------
// API Reference
// ---------------------------------------------------------------------------
function ApiSection() {
  const parsers = [
    { name: 'parseAsString', url: '"hello"', js: '"hello"', type: 'string | null' },
    { name: 'parseAsInteger', url: '"42"', js: '42', type: 'number | null' },
    { name: 'parseAsFloat', url: '"3.14"', js: '3.14', type: 'number | null' },
    { name: 'parseAsBoolean', url: '"true" / "false"', js: 'true / false', type: 'boolean | null' },
    { name: 'parseAsArrayOf(p)', url: '"a,b,c"', js: '["a","b","c"]', type: 'T[] | null' },
  ]

  return (
    <section id="api" className="relative z-10 px-6 sm:px-10 pb-28 max-w-5xl mx-auto scroll-mt-20">
      <div className="mb-12 text-center">
        <div className="mb-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-xs text-blue-300">
          <BookOpen size={12} />
          Reference
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">API Reference</h2>
        <p className="text-zinc-500 max-w-md mx-auto">
          Complete documentation for all exports.
        </p>
      </div>

      <div className="space-y-10">

        {/* --- Built-in Parsers --- */}
        <div>
          <h3 className="text-xl font-bold text-white mb-1">Built-in Parsers</h3>
          <p className="text-sm text-zinc-500 mb-4">
            Ready-to-use parsers for common types. Pass any of these as the second argument to{' '}
            <code className="text-green-400 bg-white/5 px-1 rounded">useQueryState</code>.
          </p>
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8 bg-white/3">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Parser</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">URL string</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">JS value</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Return type</th>
                </tr>
              </thead>
              <tbody>
                {parsers.map((p, i) => (
                  <tr key={p.name} className={`border-b border-white/5 ${i % 2 === 0 ? '' : 'bg-white/1'}`}>
                    <td className="px-4 py-3"><code className="text-green-400">{p.name}</code></td>
                    <td className="px-4 py-3"><code className="text-yellow-400 text-xs">{p.url}</code></td>
                    <td className="px-4 py-3"><code className="text-violet-400 text-xs">{p.js}</code></td>
                    <td className="px-4 py-3"><code className="text-orange-400 text-xs">{p.type}</code></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* --- withDefault --- */}
        <div>
          <h3 className="text-xl font-bold text-white mb-1">
            <code className="text-green-400">withDefault(parser, defaultValue)</code>
          </h3>
          <p className="text-sm text-zinc-400 mb-4 leading-relaxed">
            Wraps any parser so missing / unparseable values return{' '}
            <code className="text-orange-400 bg-white/5 px-1 rounded">defaultValue</code> instead of{' '}
            <code className="text-orange-400 bg-white/5 px-1 rounded">null</code>. TypeScript narrows
            the return type from <code className="text-orange-400">T | null</code> to{' '}
            <code className="text-orange-400">T</code>.
          </p>
          <CodeBlock filename="example.ts" code={`const pageParser = withDefault(parseAsInteger, 1)
// pageParser.parse(null) → 1  (key absent from URL)
// pageParser.parse('')   → 1  (empty string)
// pageParser.parse('5')  → 5

const [page, setPage] = useQueryState('page', pageParser)
// page: number   ← TypeScript knows this is never null`} />
        </div>

        {/* --- useQueryState --- */}
        <div>
          <h3 className="text-xl font-bold text-white mb-1">
            <code className="text-green-400">useQueryState(key, parser, options?)</code>
          </h3>
          <p className="text-sm text-zinc-400 mb-4">
            Syncs a single URL search param with React state. SSR-safe, tearing-free.
          </p>
          <div className="overflow-x-auto rounded-xl border border-white/10 mb-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8 bg-white/3">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Param</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Type</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Description</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { param: 'key', type: 'string', desc: 'URL search param name' },
                  { param: 'parser', type: 'Parser<T> | ParserWithDefault<T>', desc: 'Determines how to parse / serialize the value' },
                  { param: 'options.history', type: "'push' | 'replace'", desc: "Default: 'replace'. Use 'push' to create browser history entries" },
                ].map(row => (
                  <tr key={row.param} className="border-b border-white/5">
                    <td className="px-4 py-3"><code className="text-pink-400">{row.param}</code></td>
                    <td className="px-4 py-3"><code className="text-orange-400 text-xs">{row.type}</code></td>
                    <td className="px-4 py-3 text-xs text-zinc-400">{row.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <CodeBlock filename="usage.tsx" code={`// With plain parser → value may be null
const [search, setSearch] = useQueryState('q', parseAsString)
// search: string | null

// setSearch('hello')      → ?q=hello
// setSearch(null)         → removes ?q from URL
// setSearch(v => v + '!') → functional updater

// With withDefault → value is never null
const [page, setPage] = useQueryState(
  'page',
  withDefault(parseAsInteger, 1),
  { history: 'push' }
)
// page: number`} />
        </div>

        {/* --- useQueryStates --- */}
        <div>
          <h3 className="text-xl font-bold text-white mb-1">
            <code className="text-green-400">useQueryStates(schema, options?)</code>
          </h3>
          <p className="text-sm text-zinc-400 mb-4">
            Syncs multiple URL params at once. All updates in one{' '}
            <code className="text-green-400 bg-white/5 px-1 rounded">setValues</code> call are
            coalesced into a <strong className="text-zinc-300">single URL write</strong>.
          </p>
          <CodeBlock filename="usage.tsx" code={`const [params, setParams] = useQueryStates({
  page:   withDefault(parseAsInteger, 1),
  search: parseAsString,
  tags:   parseAsArrayOf(parseAsString),
})
// params.page   → number        (never null)
// params.search → string | null
// params.tags   → string[] | null

// Single history entry even with multiple keys:
setParams({ page: 2, search: 'react' })

// Functional updater per key:
setParams({ page: p => (p ?? 1) + 1 })`} />
        </div>

        {/* --- Custom Parser --- */}
        <div>
          <h3 className="text-xl font-bold text-white mb-1">Custom Parsers</h3>
          <p className="text-sm text-zinc-400 mb-4">
            Implement the{' '}
            <code className="text-orange-400 bg-white/5 px-1 rounded">Parser&lt;T&gt;</code> interface for
            any custom type. <code className="text-green-400 bg-white/5 px-1 rounded">parse</code> receives
            the raw string (or <code className="text-orange-400">null</code> when absent) and must return{' '}
            <code className="text-orange-400">T | null</code>.
          </p>
          <CodeBlock filename="parsers.ts" code={customParserCode} />
        </div>

      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// How It Works
// ---------------------------------------------------------------------------
function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative z-10 px-6 sm:px-10 pb-28 max-w-5xl mx-auto">
      <div className="mb-12 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">How It Works</h2>
        <p className="text-zinc-500 max-w-md mx-auto">
          Three key design decisions that make it fast and safe.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-3 mb-10">
        {[
          {
            icon: <Zap size={20} />,
            gradient: 'from-yellow-500 to-orange-600',
            title: 'Microtask Batching',
            body: (
              <>
                Every <code className="text-violet-400">setValue</code> call enqueues a microtask.
                Multiple synchronous calls collapse into one{' '}
                <code className="text-violet-400">history.replaceState</code> / pushState — zero
                redundant re-renders.
              </>
            ),
          },
          {
            icon: <Server size={20} />,
            gradient: 'from-blue-500 to-cyan-600',
            title: 'SSR Safety',
            body: (
              <>
                Every <code className="text-violet-400">window</code> access is guarded by{' '}
                <code className="text-violet-400">typeof window === &#39;undefined&#39;</code>.{' '}
                <code className="text-violet-400">getServerSnapshot</code> always returns{' '}
                <code className="text-orange-400">null</code> — no hydration mismatches.
              </>
            ),
          },
          {
            icon: <ShieldCheck size={20} />,
            gradient: 'from-violet-500 to-purple-700',
            title: 'useSyncExternalStore',
            body: (
              <>
                React 18 Concurrent Mode guarantee. All components reading the same param see an
                identical snapshot — no tearing when React interrupts and restarts a render.
              </>
            ),
          },
        ].map(({ icon, gradient, title, body }) => (
          <div key={title} className="rounded-2xl border border-white/8 bg-white/3 p-6">
            <div className={`mb-4 inline-flex items-center justify-center w-11 h-11 rounded-xl bg-linear-to-br ${gradient} text-white`}>
              {icon}
            </div>
            <h3 className="mb-2 text-base font-semibold text-white">{title}</h3>
            <p className="text-xs leading-relaxed text-zinc-400">{body}</p>
          </div>
        ))}
      </div>

      {/* Batching diagram */}
      <div className="rounded-2xl border border-white/10 bg-[#0d0d14] p-6">
        <p className="text-xs text-zinc-500 mb-4 font-medium uppercase tracking-wider">Batching flow</p>
        <pre className="text-xs font-mono leading-7 text-zinc-300 overflow-x-auto">
{`Event handler
  setPage(2)      → scheduleUrlUpdate('page', '2')   ─┐
  setSearch('q')  → scheduleUrlUpdate('search', 'q') ─┤  same microtask batch
  setTags(['a'])  → scheduleUrlUpdate('tags', 'a')   ─┘
                                                        ↓
                              history.replaceState(…?page=2&search=q&tags=a)`}
        </pre>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function Page() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">

      {/* Ambient glow blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-150 h-150 rounded-full bg-violet-600/15 blur-[120px] animate-pulse-glow" />
        <div className="absolute top-1/3 -right-40 w-125 h-125 rounded-full bg-blue-600/10 blur-[120px] animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
        <div className="absolute bottom-0 left-1/3 w-100 h-100 rounded-full bg-violet-500/8 blur-[100px] animate-pulse-glow" style={{ animationDelay: '3s' }} />
      </div>

      {/* ── NAV ──────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-20 flex items-center justify-between px-6 sm:px-10 py-4 border-b border-white/6 backdrop-blur-md bg-[#0a0a0f]/80">
        <span className="text-lg font-bold bg-linear-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
          next-query-sync
        </span>
        <div className="flex items-center gap-5">
          <a href="#examples" className="hidden sm:block text-sm text-zinc-400 hover:text-white transition-colors">Examples</a>
          <a href="#api" className="hidden sm:block text-sm text-zinc-400 hover:text-white transition-colors">API</a>
          <a href="#how-it-works" className="hidden sm:block text-sm text-zinc-400 hover:text-white transition-colors">How It Works</a>
          <a
            href="https://github.com/mhfed/next-query-sync"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-sm text-zinc-300 hover:border-white/25 hover:text-white transition-all duration-200"
          >
            <Github size={15} />
            GitHub
          </a>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-24 pb-28 sm:pt-32 sm:pb-36">
        <div className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-xs text-violet-300">
          <Package size={12} />
          v1.0.0 · Now on npm
        </div>

        <h1 className="mb-6 text-6xl sm:text-8xl font-black tracking-tight leading-none">
          <span className="bg-linear-to-r from-violet-400 via-blue-400 to-violet-300 bg-clip-text text-transparent drop-shadow-[0_0_60px_rgba(139,92,246,0.4)]">
            next-query-sync
          </span>
        </h1>

        <p className="mb-4 max-w-xl text-xl sm:text-2xl text-zinc-400 leading-relaxed">
          Type-safe URL Search Params for Next.js.
        </p>
        <p className="mb-10 max-w-lg text-base text-zinc-500">
          Blazing fast.{' '}
          <span className="text-violet-400">Zero redundant re-renders.</span>{' '}
          SSR-safe. Built on{' '}
          <code className="text-zinc-300 bg-white/5 px-1.5 py-0.5 rounded text-sm">useSyncExternalStore</code>.
        </p>

        <div className="mb-10 flex flex-col sm:flex-row items-center gap-4">
          <a
            href="#examples"
            className="flex items-center gap-2 px-7 py-3 rounded-xl bg-linear-to-r from-violet-600 to-blue-600 text-white font-semibold text-sm hover:from-violet-500 hover:to-blue-500 transition-all duration-200 shadow-lg shadow-violet-500/25"
          >
            Live Examples <ArrowRight size={16} />
          </a>
          <a
            href="#api"
            className="flex items-center gap-2 px-7 py-3 rounded-xl border border-white/15 text-zinc-300 font-semibold text-sm hover:border-white/30 hover:text-white transition-all duration-200"
          >
            <BookOpen size={16} /> API Reference
          </a>
        </div>

        <InstallBox />
      </section>

      {/* ── FEATURES ─────────────────────────────────────────── */}
      <section className="relative z-10 px-6 sm:px-10 pb-28 max-w-5xl mx-auto">
        <div className="mb-12 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">Why next-query-sync?</h2>
          <p className="text-zinc-500 max-w-md mx-auto">
            Everything you need for production-grade URL state management in one tiny package.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <FeatureCard
            icon={<ShieldCheck size={20} />}
            gradient="from-violet-500 to-purple-700"
            title="Type-Safe"
            description="TypeScript infers exact output types from your parser schema. withDefault narrows T | null to T — no casting, no runtime surprises."
          />
          <FeatureCard
            icon={<Zap size={20} />}
            gradient="from-yellow-500 to-orange-600"
            title="Smart Batching"
            description="queueMicrotask coalesces multiple param changes into one history.replaceState call — zero redundant re-renders and no FPS drops."
          />
          <FeatureCard
            icon={<Server size={20} />}
            gradient="from-blue-500 to-cyan-600"
            title="SSR & App Router Ready"
            description="Works flawlessly on the server. Every window access is guarded. useSyncExternalStore prevents UI tearing in Concurrent Mode."
          />
        </div>
      </section>

      {/* ── LIVE EXAMPLES ────────────────────────────────────── */}
      <section id="examples" className="relative z-10 px-6 sm:px-10 pb-28 max-w-5xl mx-auto scroll-mt-20">
        <div className="mb-12 text-center">
          <div className="mb-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-xs text-violet-300">
            <Play size={12} />
            Interactive
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">Live Examples</h2>
          <p className="text-zinc-500 max-w-lg mx-auto">
            Each demo below is a real component using <code className="text-violet-400">next-query-sync</code>.
            Interact and watch the URL bar update in real-time.
          </p>
        </div>

        {/* Nav pills for quick jump */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {[
            { href: '#ex-search', label: 'String' },
            { href: '#ex-pagination', label: 'Integer + push' },
            { href: '#ex-boolean', label: 'Boolean' },
            { href: '#ex-array', label: 'Array' },
            { href: '#ex-multi', label: 'useQueryStates' },
          ].map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="px-3 py-1.5 rounded-lg text-xs border border-white/10 text-zinc-400 hover:border-white/25 hover:text-white transition"
            >
              {label}
            </a>
          ))}
        </div>

        <div className="space-y-8">

          <ExampleCard
            id="ex-search"
            badge="useQueryState · parseAsString"
            title="Search Input"
            description="Sync a text input with a URL param. When the input is cleared the key is removed from the URL entirely (value becomes null). Typing immediately reflects in the address bar."
            demo={<SearchDemo />}
            code={searchCode}
            filename="search-box.tsx"
          />

          <ExampleCard
            id="ex-pagination"
            badge="useQueryState · parseAsInteger · withDefault · history:'push'"
            title="Pagination"
            description="Integer param with a default of 1 — the value is never null in TypeScript. history:'push' creates real browser history entries, so the Back button navigates between pages."
            demo={<PaginationDemo />}
            code={paginationCode}
            filename="pagination.tsx"
          />

          <ExampleCard
            id="ex-boolean"
            badge="useQueryState · parseAsBoolean · withDefault"
            title="Boolean Toggles"
            description="Two independent boolean params on the same page. withDefault(parseAsBoolean, false) means the value is always a boolean — TypeScript knows it can never be null."
            demo={<BooleanDemo />}
            code={booleanCode}
            filename="settings.tsx"
          />

          <ExampleCard
            id="ex-array"
            badge="useQueryState · parseAsArrayOf"
            title="Multi-Select Tags"
            description="Array values are serialized as comma-separated strings in the URL (?tags=react,typescript,nextjs). Deselecting all removes the key. Parses back to a typed array."
            demo={<ArrayDemo />}
            code={arrayCode}
            filename="tag-filter.tsx"
          />

          <ExampleCard
            id="ex-multi"
            badge="useQueryStates · multiple parsers"
            title="Combined Filters (useQueryStates)"
            description="Manage sort, page, and search in one hook. Every setFilters() call — even if it updates multiple keys — produces exactly one pushState entry. No racing state."
            demo={<MultiParamsDemo />}
            code={multiParamsCode}
            filename="product-filters.tsx"
          />

        </div>
      </section>

      {/* ── API REFERENCE ────────────────────────────────────── */}
      <ApiSection />

      {/* ── HOW IT WORKS ─────────────────────────────────────── */}
      <HowItWorksSection />

      {/* ── QUICK INSTALL ────────────────────────────────────── */}
      <section className="relative z-10 px-6 sm:px-10 pb-28 max-w-5xl mx-auto">
        <div className="rounded-2xl border border-white/10 bg-linear-to-br from-violet-900/20 to-blue-900/20 p-8 sm:p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-3">Start in 30 seconds</h2>
          <p className="text-zinc-400 mb-8 max-w-sm mx-auto text-sm">
            Install the package, pick a parser, wrap with{' '}
            <code className="text-violet-400">withDefault</code> if you need a non-nullable value, done.
          </p>

          <div className="flex flex-col gap-3 items-center mb-8">
            {[
              { cmd: 'npm i next-query-sync', label: '1. Install' },
              { cmd: "import { useQueryState, parseAsInteger, withDefault } from 'next-query-sync'", label: '2. Import' },
              { cmd: "const [page, setPage] = useQueryState('page', withDefault(parseAsInteger, 1))", label: '3. Use' },
            ].map(({ cmd, label }) => (
              <div key={label} className="w-full max-w-2xl text-left">
                <p className="text-xs text-zinc-600 mb-1">{label}</p>
                <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10">
                  <code className="text-xs sm:text-sm font-mono text-zinc-200 truncate">{cmd}</code>
                  <CopyButton text={cmd} small />
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="#examples"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-linear-to-r from-violet-600 to-blue-600 text-white font-semibold text-sm hover:from-violet-500 hover:to-blue-500 transition shadow-lg shadow-violet-500/25"
            >
              See Live Examples <ArrowRight size={14} />
            </a>
            <a
              href="https://github.com/mhfed/next-query-sync"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-white/15 text-zinc-300 font-semibold text-sm hover:border-white/30 hover:text-white transition"
            >
              <Github size={14} /> View on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-white/6 px-6 sm:px-10 py-10">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-500">
          <div>
            <span className="text-zinc-300 font-semibold">next-query-sync</span>
            <span className="mx-2">·</span>
            MIT License
            <span className="mx-2">·</span>
            © {new Date().getFullYear()}
          </div>
          <div className="flex items-center gap-6">
            <a href="#examples" className="hover:text-white transition-colors">Examples</a>
            <a href="#api" className="hover:text-white transition-colors">API</a>
            <a
              href="https://www.npmjs.com/package/next-query-sync"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <Package size={14} />
              npm
            </a>
            <a
              href="https://github.com/mhfed/next-query-sync"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <Github size={14} />
              GitHub
            </a>
          </div>
        </div>
      </footer>

    </div>
  )
}
