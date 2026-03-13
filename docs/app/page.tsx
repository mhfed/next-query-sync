'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import {
  withDefault,
  parseAsInteger,
  parseAsString,
} from 'next-query-sync'
import {
  ShieldCheck,
  Zap,
  Server,
  Copy,
  Check,
  Github,
  Package,
  Play,
  BookOpen,
  ArrowRight,
  Sparkles,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Feature section — auto-inference code snippet HTML
// ---------------------------------------------------------------------------
const AUTO_INFERENCE_HTML = [
  '<span style="color:#6b7280">// \u274c nuqs \u2014 import every parser manually</span>',
  '<span style="color:#60a5fa">import</span> { parseAsInteger, parseAsString, parseAsBoolean } <span style="color:#60a5fa">from</span> <span style="color:#a78bfa">\'nuqs\'</span>',
  '<span style="color:#34d399">useQueryState</span>(<span style="color:#fbbf24">\'page\'</span>, parseAsInteger.<span style="color:#34d399">withDefault</span>(<span style="color:#fb923c">1</span>))',
  '',
  '<span style="color:#6b7280">// \u2705 next-query-sync \u2014 just like useState</span>',
  '<span style="color:#60a5fa">const</span> [page, setPage] = <span style="color:#34d399">useQueryState</span>(<span style="color:#fbbf24">\'page\'</span>, <span style="color:#fb923c">1</span>)',
  '<span style="color:#60a5fa">const</span> [q,    setQ   ] = <span style="color:#34d399">useQueryState</span>(<span style="color:#fbbf24">\'q\'</span>,    <span style="color:#fbbf24">\'\'</span>)',
  '<span style="color:#60a5fa">const</span> [open, setOpen] = <span style="color:#34d399">useQueryState</span>(<span style="color:#fbbf24">\'modal\'</span>, <span style="color:#fb923c">false</span>)',
].join('\n')

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
// Hero Code Comparison
// ---------------------------------------------------------------------------
const nuqsCode = `import { useQueryState } from 'nuqs'
import { parseAsInteger } from 'nuqs'
import { parseAsString  } from 'nuqs'
import { parseAsBoolean } from 'nuqs'

const [page, setPage] = useQueryState(
  'page',
  parseAsInteger.withDefault(1)
)
const [q, setQ] = useQueryState(
  'q',
  parseAsString.withDefault('')
)
const [open, setOpen] = useQueryState(
  'modal',
  parseAsBoolean.withDefault(false)
)`

const ourCode = `import { useQueryState } from 'next-query-sync'

// Type inferred from default value ✨
const [page, setPage] = useQueryState('page', 1)
const [q,    setQ   ] = useQueryState('q',    '')
const [open, setOpen] = useQueryState('modal', false)

// Also supports Zod, custom parsers & debounce:
const [filter, setFilter] = useQueryState('f', MyZodSchema)
const [search, setSearch] = useQueryState('q', '', { debounce: 300 })`

const URL_STATES = [
  '?page=1',
  '?page=5&q=react',
  '?page=2&modal=true',
  '?page=3&q=typescript',
  '?page=1&q=nextjs&modal=true',
]

function hlHero(line: string): string {
  return line
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/('nuqs'|'next-query-sync')/g, '<span style="color:#a78bfa">$1</span>')
    .replace(/"([^"]+)"/g, '<span style="color:#fbbf24">"$1"</span>')
    .replace(/\b(import|from|const)\b/g, '<span style="color:#60a5fa">$1</span>')
    .replace(/\b(useQueryState|parseAsInteger|parseAsString|parseAsBoolean)\b/g, '<span style="color:#34d399">$1</span>')
    .replace(/(\/\/.*$)/g, '<span style="color:#52525b">$1</span>')
    .replace(/✨/g, '<span>✨</span>')
}

function HeroCodeComparison() {
  const [tab, setTab] = useState<'nuqs' | 'ours'>('ours')
  const [urlIdx, setUrlIdx] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setUrlIdx(i => (i + 1) % URL_STATES.length)
    }, 2000)
    return () => clearInterval(id)
  }, [])

  const code = tab === 'nuqs' ? nuqsCode : ourCode
  const lines = code.split('\n')

  return (
    <div className="relative animate-fade-up" style={{ animationDelay: '0.2s' }}>
      {/* Glow ring behind the card */}
      <div className="absolute -inset-px rounded-2xl bg-linear-to-br from-violet-500/30 via-blue-500/20 to-transparent blur-sm pointer-events-none" />

      <div className="relative rounded-2xl border border-white/10 bg-[#0d0d14] overflow-hidden shadow-2xl shadow-black/60">
        {/* Title bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/8 bg-white/2">
          <span className="w-3 h-3 rounded-full bg-red-500/70" />
          <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
          <span className="w-3 h-3 rounded-full bg-green-500/70" />
          <span className="ml-2 text-xs text-zinc-600 font-mono">filters.tsx</span>

          {/* Tabs */}
          <div className="ml-auto flex items-center gap-1 bg-white/5 rounded-lg p-0.5">
            <button
              onClick={() => setTab('nuqs')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                tab === 'nuqs'
                  ? 'bg-white/10 text-zinc-200'
                  : 'text-zinc-600 hover:text-zinc-400'
              }`}
            >
              nuqs
            </button>
            <button
              onClick={() => setTab('ours')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                tab === 'ours'
                  ? 'bg-violet-500/20 text-violet-300'
                  : 'text-zinc-600 hover:text-zinc-400'
              }`}
            >
              next-query-sync ✨
            </button>
          </div>
        </div>

        {/* Code */}
        <pre className="px-5 pt-5 pb-4 text-sm font-mono leading-[1.7] overflow-x-auto min-h-[240px]">
          <code>
            {lines.map((line, i) => (
              <div key={`${tab}-${i}`} className="flex">
                <span className="select-none w-6 shrink-0 text-zinc-700 text-right mr-5 tabular-nums text-xs leading-[1.7]">{i + 1}</span>
                <span dangerouslySetInnerHTML={{ __html: hlHero(line) || '&nbsp;' }} />
              </div>
            ))}
          </code>
        </pre>

        {/* Line count badge */}
        {tab === 'ours' && (
          <div className="absolute top-12 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-500/15 border border-violet-500/25 text-xs text-violet-300 font-medium">
            <Sparkles size={10} />
            6× less code
          </div>
        )}

        {/* Live URL bar */}
        <div className="px-5 pb-5">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-black/40 border border-white/6 font-mono text-sm">
            <span className="text-zinc-600 shrink-0">localhost:3000</span>
            <span
              key={urlIdx}
              className="text-violet-400 animate-fade-up"
              style={{ animationDuration: '0.3s' }}
            >
              {URL_STATES[urlIdx]}
            </span>
            <span className="text-violet-500 animate-blink ml-0.5">|</span>
          </div>
          <p className="mt-2 text-xs text-zinc-600 text-center">URL updates in real-time · Back/Forward works · SSR-safe</p>
        </div>
      </div>

      {/* Floating badges */}
      <div className="absolute -top-3 -left-4 px-3 py-1.5 rounded-full bg-[#0d0d14] border border-green-500/30 text-xs text-green-400 font-medium shadow-lg animate-float" style={{ animationDelay: '0s' }}>
        ✓ TypeScript native
      </div>
      <div className="absolute -bottom-3 -right-4 px-3 py-1.5 rounded-full bg-[#0d0d14] border border-blue-500/30 text-xs text-blue-400 font-medium shadow-lg animate-float" style={{ animationDelay: '1.5s' }}>
        ✓ Zero dependencies
      </div>
    </div>
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
          <a href="/example" className="hidden sm:block text-sm text-zinc-400 hover:text-white transition-colors">Examples</a>
          <Link href="/example" className="hidden sm:block text-sm text-zinc-400 hover:text-white transition-colors">Playground</Link>
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
      <section className="relative z-10 px-6 sm:px-10 pt-16 sm:pt-24 pb-24 sm:pb-32 max-w-7xl mx-auto">

        {/* Dot grid */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.055) 1px, transparent 1px)', backgroundSize: '28px 28px' }}
        />
        {/* Gradient fade edges on grid */}
        <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-[#0a0a0f] via-transparent to-[#0a0a0f]" />
        <div className="pointer-events-none absolute inset-0 bg-linear-to-r from-[#0a0a0f] via-transparent to-[#0a0a0f]" />

        {/* Bottom separator line */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-linear-to-r from-transparent via-violet-500/30 to-transparent" />

        <div className="relative grid lg:grid-cols-[1fr_1.15fr] gap-12 lg:gap-20 items-center">

          {/* ── LEFT ──────────────────────────────────────────── */}
          <div className="animate-fade-up">

            {/* Badge */}
            <div className="mb-8 inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-sm text-violet-300">
              <span className="inline-block w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
              v1.0.0 · Now on npm
              <ArrowRight size={12} className="opacity-60" />
            </div>

            {/* Headline */}
            <h1 className="mb-7 font-black tracking-tight leading-[0.9]">
              <span className="block text-5xl sm:text-6xl lg:text-[72px] text-white">URL State,</span>
              <span className="block text-5xl sm:text-6xl lg:text-[72px] text-zinc-600 mt-1">as simple as</span>
              <span
                className="block text-5xl sm:text-6xl lg:text-[72px] mt-1 animate-shimmer"
                style={{ background: 'linear-gradient(90deg,#a78bfa,#60a5fa,#a78bfa,#60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
              >
                useState.
              </span>
            </h1>

            {/* Subtext */}
            <p className="mb-8 text-lg sm:text-xl text-zinc-400 leading-relaxed max-w-lg">
              Drop-in URL sync for React & Next.js. Type inferred from default value —
              no parsers to import, no boilerplate to write.
            </p>

            {/* CTAs */}
            <div className="mb-8 flex flex-col sm:flex-row items-start gap-3">
              <Link
                href="/example"
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-linear-to-r from-violet-600 to-blue-600 text-white font-semibold text-sm hover:from-violet-500 hover:to-blue-500 transition-all duration-200 shadow-lg shadow-violet-500/25"
              >
                <Play size={15} /> Live Examples
              </Link>
              <a
                href="#api"
                className="flex items-center gap-2 px-6 py-3 rounded-xl border border-white/15 text-zinc-300 font-semibold text-sm hover:border-white/30 hover:text-white transition-all duration-200"
              >
                <BookOpen size={15} /> API Reference
              </a>
            </div>

            {/* Install box */}
            <InstallBox />

            {/* Stats */}
            <div className="mt-6 flex flex-wrap items-center gap-2">
              {[
                '0 dependencies',
                '< 2KB gzip',
                'TypeScript native',
                'React 18+',
                'App Router ready',
              ].map(stat => (
                <span
                  key={stat}
                  className="px-3 py-1 rounded-full border border-white/8 bg-white/3 text-xs text-zinc-500 font-medium"
                >
                  {stat}
                </span>
              ))}
            </div>
          </div>

          {/* ── RIGHT: code comparison ────────────────────────── */}
          <HeroCodeComparison />

        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────── */}
      <section className="relative z-10 px-6 sm:px-10 pb-28 max-w-6xl mx-auto">

        {/* Section header */}
        <div className="mb-16 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/25 bg-violet-500/8 text-sm text-violet-400 font-medium mb-6">
            <Sparkles size={13} />
            Built different
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-4">
            Why switch to{' '}
            <span className="bg-linear-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
              next-query-sync?
            </span>
          </h2>
          <p className="text-zinc-500 text-lg max-w-xl mx-auto leading-relaxed">
            Every feature is designed to eliminate boilerplate and ship faster — without sacrificing type safety or performance.
          </p>
        </div>

        {/* Big 2-col feature: Auto-Inference */}
        <div className="mb-5 group relative rounded-3xl border border-white/8 bg-white/2 hover:border-violet-500/25 transition-all duration-500 overflow-hidden">
          {/* Glow */}
          <div className="pointer-events-none absolute -top-24 -left-24 w-72 h-72 rounded-full bg-violet-600/10 blur-3xl group-hover:bg-violet-600/15 transition-all duration-700" />
          <div className="grid lg:grid-cols-2 gap-0">
            {/* Text */}
            <div className="p-8 sm:p-10 flex flex-col justify-center">
              <div className="mb-5 inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-linear-to-br from-violet-500 to-purple-700 text-white shadow-lg shadow-violet-500/20">
                <Sparkles size={22} />
              </div>
              <div className="mb-2 text-xs font-semibold text-violet-400 uppercase tracking-widest">Killer feature #1</div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4 leading-tight">
                useState syntax.<br />
                <span className="text-zinc-400">No parser imports.</span>
              </h3>
              <p className="text-base text-zinc-400 leading-relaxed mb-6">
                Pass a primitive default and the library infers the type, picks the right parser, and serializes back automatically. 90% of real apps need nothing else.
              </p>
              <div className="flex flex-wrap gap-2">
                {['number → parseAsInteger', 'boolean → parseAsBoolean', 'string → parseAsString'].map(tag => (
                  <span key={tag} className="px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs text-violet-300 font-mono">{tag}</span>
                ))}
              </div>
            </div>
            {/* Code */}
            <div className="p-8 sm:p-10 lg:border-l border-white/6 flex items-center">
              <div className="w-full rounded-2xl border border-white/10 bg-[#080810] overflow-hidden">
                <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-white/6">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                  <span className="ml-2 text-xs text-zinc-600 font-mono">page.tsx</span>
                </div>
                <pre className="px-5 py-5 text-sm font-mono leading-[1.8] overflow-x-auto"><code dangerouslySetInnerHTML={{ __html: AUTO_INFERENCE_HTML }} /></pre>
              </div>
            </div>
          </div>
        </div>

        {/* 3 smaller cards row */}
        <div className="grid gap-5 sm:grid-cols-3 mb-5">

          {/* Type-Safe */}
          <div className="group relative rounded-2xl border border-white/8 bg-white/2 p-7 hover:border-violet-500/20 hover:bg-violet-500/3 transition-all duration-300 overflow-hidden">
            <div className="pointer-events-none absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-violet-600/8 blur-2xl group-hover:bg-violet-600/15 transition-all" />
            <div className="mb-5 inline-flex items-center justify-center w-11 h-11 rounded-xl bg-linear-to-br from-violet-500 to-purple-700 text-white">
              <ShieldCheck size={19} />
            </div>
            <div className="mb-1 text-xs font-semibold text-violet-400 uppercase tracking-widest">Type-Safe by default</div>
            <h3 className="text-lg font-bold text-white mb-3">Zero casts.<br />Zero surprises.</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">TypeScript infers the exact return type from your default. <code className="text-violet-300 text-xs bg-violet-500/10 px-1 py-0.5 rounded">withDefault</code> narrows <code className="text-zinc-300 text-xs bg-white/5 px-1 py-0.5 rounded">T | null</code> to <code className="text-zinc-300 text-xs bg-white/5 px-1 py-0.5 rounded">T</code> at the type level.</p>
          </div>

          {/* Smart Batching */}
          <div className="group relative rounded-2xl border border-white/8 bg-white/2 p-7 hover:border-yellow-500/20 hover:bg-yellow-500/3 transition-all duration-300 overflow-hidden">
            <div className="pointer-events-none absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-yellow-600/8 blur-2xl group-hover:bg-yellow-600/15 transition-all" />
            <div className="mb-5 inline-flex items-center justify-center w-11 h-11 rounded-xl bg-linear-to-br from-yellow-500 to-orange-600 text-white">
              <Zap size={19} />
            </div>
            <div className="mb-1 text-xs font-semibold text-yellow-500 uppercase tracking-widest">Performance</div>
            <h3 className="text-lg font-bold text-white mb-3">Smart batching.<br />0 wasted renders.</h3>
            <p className="text-sm text-zinc-400 leading-relaxed"><code className="text-yellow-300 text-xs bg-yellow-500/10 px-1 py-0.5 rounded">queueMicrotask</code> coalesces every param change in the same tick into one single <code className="text-zinc-300 text-xs bg-white/5 px-1 py-0.5 rounded">replaceState</code> call — no FPS drops.</p>
          </div>

          {/* SSR */}
          <div className="group relative rounded-2xl border border-white/8 bg-white/2 p-7 hover:border-blue-500/20 hover:bg-blue-500/3 transition-all duration-300 overflow-hidden">
            <div className="pointer-events-none absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-blue-600/8 blur-2xl group-hover:bg-blue-600/15 transition-all" />
            <div className="mb-5 inline-flex items-center justify-center w-11 h-11 rounded-xl bg-linear-to-br from-blue-500 to-cyan-600 text-white">
              <Server size={19} />
            </div>
            <div className="mb-1 text-xs font-semibold text-blue-400 uppercase tracking-widest">SSR & App Router</div>
            <h3 className="text-lg font-bold text-white mb-3">Works on the server.<br />No hydration mismatch.</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">Every <code className="text-zinc-300 text-xs bg-white/5 px-1 py-0.5 rounded">window</code> access is guarded. <code className="text-blue-300 text-xs bg-blue-500/10 px-1 py-0.5 rounded">useSyncExternalStore</code> prevents tearing in Concurrent Mode.</p>
          </div>
        </div>

        {/* 2-col: Zod + Debounce */}
        <div className="grid gap-5 sm:grid-cols-2">

          {/* Zod */}
          <div className="group relative rounded-2xl border border-white/8 bg-white/2 p-7 hover:border-emerald-500/20 hover:bg-emerald-500/3 transition-all duration-300 overflow-hidden">
            <div className="pointer-events-none absolute -top-10 -right-10 w-40 h-40 rounded-full bg-emerald-600/8 blur-3xl group-hover:bg-emerald-600/12 transition-all" />
            <div className="flex items-start gap-4">
              <div className="shrink-0 inline-flex items-center justify-center w-11 h-11 rounded-xl bg-linear-to-br from-emerald-500 to-teal-600 text-white">
                <ShieldCheck size={19} />
              </div>
              <div>
                <div className="mb-1 text-xs font-semibold text-emerald-400 uppercase tracking-widest">Killer feature #2</div>
                <h3 className="text-xl font-bold text-white mb-2">Native Zod integration</h3>
                <p className="text-sm text-zinc-400 leading-relaxed mb-4">
                  Pass a Zod schema directly — the library auto-parses JSON, validates, and falls back to default on error. Works with v3 &amp; v4.
                </p>
                <div className="rounded-xl bg-[#080810] border border-white/8 px-4 py-3 font-mono text-xs text-zinc-300 leading-[1.7]">
                  <div><span style={{color:'#60a5fa'}}>const</span> [filter, setFilter] = <span style={{color:'#34d399'}}>useQueryState</span>(</div>
                  <div className="ml-4"><span style={{color:'#fbbf24'}}>'filter'</span>, MyZodSchema</div>
                  <div>)</div>
                </div>
              </div>
            </div>
          </div>

          {/* Debounce */}
          <div className="group relative rounded-2xl border border-white/8 bg-white/2 p-7 hover:border-pink-500/20 hover:bg-pink-500/3 transition-all duration-300 overflow-hidden">
            <div className="pointer-events-none absolute -top-10 -right-10 w-40 h-40 rounded-full bg-pink-600/8 blur-3xl group-hover:bg-pink-600/12 transition-all" />
            <div className="flex items-start gap-4">
              <div className="shrink-0 inline-flex items-center justify-center w-11 h-11 rounded-xl bg-linear-to-br from-pink-500 to-rose-600 text-white">
                <Zap size={19} />
              </div>
              <div>
                <div className="mb-1 text-xs font-semibold text-pink-400 uppercase tracking-widest">Killer feature #3</div>
                <h3 className="text-xl font-bold text-white mb-2">Built-in debounce &amp; transitions</h3>
                <p className="text-sm text-zinc-400 leading-relaxed mb-4">
                  Stop writing <code className="text-zinc-300 text-xs bg-white/5 px-1 py-0.5 rounded">useDebounce</code> wrappers. Built-in <code className="text-pink-300 text-xs bg-pink-500/10 px-1 py-0.5 rounded">debounce</code> + React 18 <code className="text-pink-300 text-xs bg-pink-500/10 px-1 py-0.5 rounded">startTransition</code> keeps the UI snappy.
                </p>
                <div className="rounded-xl bg-[#080810] border border-white/8 px-4 py-3 font-mono text-xs text-zinc-300 leading-[1.7]">
                  <div><span style={{color:'#60a5fa'}}>const</span> [q, setQ] = <span style={{color:'#34d399'}}>useQueryState</span>(<span style={{color:'#fbbf24'}}>'q'</span>, <span style={{color:'#fbbf24'}}>''</span>, {'{'}</div>
                  <div className="ml-4"><span style={{color:'#fb923c'}}>debounce</span>: <span style={{color:'#fb923c'}}>300</span>, <span style={{color:'#fb923c'}}>startTransition</span>: <span style={{color:'#fb923c'}}>true</span></div>
                  <div>{'}'})</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* vs comparison table */}
        <div className="mt-10 rounded-2xl border border-white/8 bg-white/2 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/6 flex items-center gap-3">
            <span className="text-sm font-semibold text-white">Feature comparison</span>
            <span className="ml-auto text-xs text-zinc-600">vs the competition</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/6">
                  <th className="text-left px-6 py-3 text-zinc-500 font-medium w-1/2">Feature</th>
                  <th className="px-6 py-3 text-zinc-500 font-medium text-center">nuqs</th>
                  <th className="px-6 py-3 text-zinc-500 font-medium text-center">next-query-params</th>
                  <th className="px-6 py-3 font-semibold text-center">
                    <span className="text-violet-300">next-query-sync</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['useState-like syntax (auto-inference)', '❌', '❌', '✅'],
                  ['Zod schema support (1 line)', '❌', '❌', '✅'],
                  ['Built-in debounce + startTransition', '❌', '❌', '✅'],
                  ['React 18 useSyncExternalStore', '✅', '❌', '✅'],
                  ['SSR & App Router safe', '✅', '⚠️', '✅'],
                  ['Smart param batching', '✅', '❌', '✅'],
                  ['Bundle size (gzip)', '~7KB', '~5KB', '< 2KB'],
                ].map(([feature, nuqs, nqp, ours], i) => (
                  <tr key={i} className="border-b border-white/4 last:border-0 hover:bg-white/2 transition-colors">
                    <td className="px-6 py-3.5 text-zinc-300">{feature}</td>
                    <td className="px-6 py-3.5 text-center text-zinc-500">{nuqs}</td>
                    <td className="px-6 py-3.5 text-center text-zinc-500">{nqp}</td>
                    <td className="px-6 py-3.5 text-center font-medium text-violet-300">{ours}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </section>

      {/* ── EXAMPLES CTA ─────────────────────────────────────── */}
      <section id="examples" className="relative z-10 px-6 sm:px-10 pb-28 max-w-5xl mx-auto scroll-mt-20">
        <div className="rounded-3xl border border-violet-500/20 bg-linear-to-r from-violet-500/10 via-blue-500/6 to-transparent p-8 sm:p-12 shadow-[0_0_60px_rgba(139,92,246,0.08)]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-violet-500/25 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-300">
                <Play size={12} />
                9 interactive demos
              </span>
              <h2 className="mt-4 text-2xl sm:text-3xl font-bold text-white">Live Examples</h2>
              <p className="mt-3 text-sm sm:text-base leading-relaxed text-zinc-400">
                useState-like auto-inference, Zod schema validation, debounce + startTransition,
                parser chaining, arrays, booleans and more — all with live URL syncing and runnable code.
              </p>
            </div>
            <Link
              href="/example"
              className="shrink-0 inline-flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-violet-600 to-blue-600 px-6 py-3.5 text-sm font-semibold text-white hover:from-violet-500 hover:to-blue-500 transition-all duration-200 shadow-lg shadow-violet-500/20"
            >
              <Play size={16} />
              Open examples
            </Link>
          </div>
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
            <Link
              href="/example"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-linear-to-r from-violet-600 to-blue-600 text-white font-semibold text-sm hover:from-violet-500 hover:to-blue-500 transition shadow-lg shadow-violet-500/25"
            >
              <Play size={14} /> See Live Examples
            </Link>
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
            <Link href="/example" className="hover:text-white transition-colors">Examples</Link>
            <Link href="/example" className="hover:text-white transition-colors">Playground</Link>
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
