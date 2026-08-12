'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  ArrowRight,
  BookOpen,
  Check,
  Copy,
  Github,
  History,
  Layers3,
  Package,
  Play,
  Search,
  Server,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react'

const quickStart = `'use client'

import { useQueryState } from 'next-query-sync'

export function Catalog() {
  const [page, setPage] = useQueryState('page', 1, {
    history: 'push',
  })

  const [query, setQuery] = useQueryState('q', '', {
    debounce: 300,
  })

  return (
    <>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <button onClick={() => setPage(p => p + 1)}>Page {page}</button>
    </>
  )
}`

const multiState = `import {
  parseAsBoolean,
  parseAsInteger,
  parseAsString,
  useQueryStates,
  withDefault,
} from 'next-query-sync'

const [filters, setFilters] = useQueryStates({
  page: withDefault(parseAsInteger, 1),
  q: parseAsString,
  inStock: withDefault(parseAsBoolean, false),
})

setFilters({ page: 2, q: 'react' })
// one batched URL write for the update above`

const parserCode = `import { makeParser, useQueryState } from 'next-query-sync'

const parseAsDate = makeParser<Date>(
  value => {
    if (!value) return null
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? null : date
  },
  date => date.toISOString().slice(0, 10),
)

const [date, setDate] = useQueryState('date', parseAsDate)`

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
      className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-zinc-300 transition hover:border-white/20 hover:bg-white/10"
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

function CodeBlock({ code, label }: { code: string; label: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d14] shadow-2xl shadow-black/30">
      <div className="flex items-center justify-between border-b border-white/8 px-4 py-3">
        <span className="font-mono text-xs text-zinc-500">{label}</span>
        <CopyButton text={code} />
      </div>
      <pre className="overflow-x-auto p-5 text-xs leading-6 text-zinc-300 sm:text-sm">
        <code>{code}</code>
      </pre>
    </div>
  )
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-400">
      {children}
    </span>
  )
}

const verified = [
  'Node 20 / 22',
  'React 18.3 / 19.2',
  'Next.js App Router consumer',
  'Packed npm artifact',
  'Public type contracts',
]

const features = [
  {
    icon: <Sparkles size={20} />,
    title: 'Primitive defaults infer the type',
    body: "Use `useQueryState('page', 1)` for common primitive state. The setter is widened to `number`, not the literal `1`, and the default stays non-nullable.",
  },
  {
    icon: <Layers3 size={20} />,
    title: 'Batched URL writes',
    body: 'Synchronous param updates are coalesced before a single history write. If any update requests `push`, the batch uses a push entry.',
  },
  {
    icon: <Search size={20} />,
    title: 'Debounce with optimistic state',
    body: 'High-frequency values can update the hook immediately while the URL write waits for the debounce interval. Pending timers are cancelled on unmount.',
  },
  {
    icon: <History size={20} />,
    title: 'Back / Forward aware',
    body: '`popstate` is part of the subscription contract, with regression coverage for nullable and defaulted query state.',
  },
  {
    icon: <Server size={20} />,
    title: 'SSR-aware',
    body: 'Browser globals are guarded. CI builds a Next.js App Router project against the packed package instead of importing library source directly.',
  },
  {
    icon: <ShieldCheck size={20} />,
    title: 'Typed parser contracts',
    body: 'Built-in and custom parsers expose parse/serialize contracts, while `withDefault` narrows a nullable parser to a non-null value at the type level.',
  },
]

const examples = [
  {
    title: 'Debounced search',
    url: '?q=react',
    description: 'Use replace history for high-frequency input so intermediate keystrokes do not fill browser history.',
  },
  {
    title: 'Catalog filters + pagination',
    url: '?page=2&sort=price&inStock=true',
    description: 'Combine multiple query values and use push history for page changes users may want to traverse.',
  },
  {
    title: 'URL-backed tabs',
    url: '?tab=activity',
    description: 'Keep the selected view shareable and compatible with browser Back/Forward navigation.',
  },
  {
    title: 'Shareable detail state',
    url: '?item=sku-42',
    description: 'Represent nullable modal/detail state in the URL and clear it by setting the value to null.',
  },
]

export default function Page() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-48 -top-48 h-[520px] w-[520px] rounded-full bg-violet-600/12 blur-[120px]" />
        <div className="absolute -right-48 top-1/3 h-[480px] w-[480px] rounded-full bg-blue-600/10 blur-[120px]" />
      </div>

      <nav className="sticky top-0 z-30 border-b border-white/7 bg-[#0a0a0f]/85 px-6 py-4 backdrop-blur-xl sm:px-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="font-semibold tracking-tight text-white">
            next-query-sync
          </Link>
          <div className="flex items-center gap-4 text-sm text-zinc-400">
            <Link href="/example" className="hidden transition hover:text-white sm:inline">
              Playground
            </Link>
            <a href="#api" className="hidden transition hover:text-white sm:inline">
              API
            </a>
            <a
              href="https://github.com/mhfed/next-query-sync"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 transition hover:border-white/20 hover:text-white"
            >
              <Github size={15} /> GitHub
            </a>
          </div>
        </div>
      </nav>

      <section className="relative z-10 mx-auto grid max-w-6xl gap-12 px-6 pb-24 pt-20 sm:px-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:pt-28">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-500/25 bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-300">
            <ShieldCheck size={13} /> OSS library with CI-backed compatibility checks
          </div>
          <h1 className="max-w-xl text-5xl font-black tracking-[-0.05em] sm:text-6xl lg:text-7xl">
            URL state with a small, typed API.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-400">
            Sync search params with React state in Next.js. Start with a primitive default for common cases, or bring an explicit parser or optional Zod schema when the URL contract needs validation.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/example"
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold transition hover:bg-violet-500"
            >
              <Play size={15} /> Try the examples
            </Link>
            <a
              href="#api"
              className="inline-flex items-center gap-2 rounded-xl border border-white/12 bg-white/5 px-5 py-3 text-sm font-semibold text-zinc-200 transition hover:bg-white/10"
            >
              <BookOpen size={15} /> Read the API overview
            </a>
          </div>
          <div className="mt-8 flex flex-wrap gap-2">
            <Badge>MIT</Badge>
            <Badge>React 18+</Badge>
            <Badge>TypeScript</Badge>
            <Badge>ESM + CJS</Badge>
            <Badge>Zod optional</Badge>
          </div>
        </div>
        <CodeBlock code={quickStart} label="catalog.tsx" />
      </section>

      <section className="relative z-10 border-y border-white/7 bg-white/[0.018] px-6 py-10 sm:px-10">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Continuously verified in GitHub Actions</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {verified.map(item => (
              <div key={item} className="flex items-center gap-2 rounded-xl border border-white/8 bg-black/20 px-3 py-3 text-sm text-zinc-300">
                <Check size={14} className="text-emerald-400" /> {item}
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs leading-5 text-zinc-600">
            Compatibility claims on this page are intentionally limited to behavior covered by repository tests, package verification, or the packed Next.js consumer build.
          </p>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-6xl px-6 py-24 sm:px-10">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-400">Core behavior</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">A library contract, not a feature scorecard.</h2>
          <p className="mt-4 leading-7 text-zinc-500">
            The project focuses on predictable URL semantics, TypeScript contracts, browser navigation, and a package artifact that can be consumed by a real Next.js app.
          </p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map(feature => (
            <article key={feature.title} className="rounded-2xl border border-white/8 bg-white/[0.025] p-6">
              <div className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
                {feature.icon}
              </div>
              <h3 className="font-semibold text-white">{feature.title}</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-500">{feature.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="relative z-10 mx-auto grid max-w-6xl gap-6 px-6 pb-24 sm:px-10 lg:grid-cols-2">
        <CodeBlock code={multiState} label="filters.tsx" />
        <CodeBlock code={parserCode} label="custom-parser.ts" />
      </section>

      <section className="relative z-10 border-y border-white/7 bg-white/[0.018] px-6 py-24 sm:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-400">Real application patterns</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Copy-paste examples with explicit history semantics.</h2>
            </div>
            <Link href="/example" className="inline-flex items-center gap-2 text-sm font-medium text-violet-300 hover:text-violet-200">
              Open interactive playground <ArrowRight size={15} />
            </Link>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {examples.map(example => (
              <article key={example.title} className="rounded-2xl border border-white/8 bg-black/20 p-6">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-semibold">{example.title}</h3>
                  <code className="rounded-md bg-violet-500/10 px-2 py-1 text-xs text-violet-300">{example.url}</code>
                </div>
                <p className="mt-3 text-sm leading-6 text-zinc-500">{example.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="api" className="relative z-10 mx-auto max-w-6xl px-6 py-24 sm:px-10">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">API overview</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">Two hooks, composable parser contracts.</h2>
            <p className="mt-4 text-sm leading-7 text-zinc-500">
              Primitive defaults cover common state. Explicit parsers make nullability and serialization visible. `withDefault` converts a nullable parser contract into a non-null one.
            </p>
          </div>
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-6">
              <code className="text-sm text-violet-300">useQueryState(key, parserOrDefault, options?)</code>
              <p className="mt-3 text-sm leading-6 text-zinc-500">
                Single search-param state. Options include `history` and `debounce`. The legacy `startTransition` option remains accepted for source compatibility but is deprecated and does not provide a non-blocking external-store guarantee.
              </p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-6">
              <code className="text-sm text-violet-300">useQueryStates(schema, options?)</code>
              <p className="mt-3 text-sm leading-6 text-zinc-500">
                Multiple search params from one parser schema. Updates within one setter call share the same batched URL write.
              </p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-6">
              <code className="text-sm text-violet-300">makeParser(parse, serialize) / parser.withDefault(value)</code>
              <p className="mt-3 text-sm leading-6 text-zinc-500">
                Build custom typed URL contracts without hand-writing the `.withDefault()` plumbing required by the public `Parser` interface.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-24 sm:px-10">
        <div className="grid gap-5 rounded-3xl border border-white/10 bg-gradient-to-br from-violet-500/10 to-blue-500/5 p-8 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-violet-300">
              <Zap size={16} /> Maintainer workflow
            </div>
            <h2 className="mt-3 text-2xl font-bold sm:text-3xl">Changes go through deterministic CI before release.</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-400">
              The repository checks types, tests, React compatibility, package contents, a packed Next.js consumer, and now the docs production build. Release-candidate automation remains read-only until a maintainer explicitly publishes.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <a
              href="https://github.com/mhfed/next-query-sync"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200"
            >
              <Github size={15} /> Inspect the repo
            </a>
            <a
              href="https://www.npmjs.com/package/next-query-sync"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold transition hover:bg-white/10"
            >
              <Package size={15} /> npm package
            </a>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/7 px-6 py-10 sm:px-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 text-sm text-zinc-600 sm:flex-row sm:items-center sm:justify-between">
          <span>next-query-sync · MIT licensed</span>
          <div className="flex gap-5">
            <Link href="/example" className="hover:text-zinc-300">Examples</Link>
            <a href="#api" className="hover:text-zinc-300">API</a>
            <a href="https://github.com/mhfed/next-query-sync" target="_blank" rel="noreferrer" className="hover:text-zinc-300">GitHub</a>
          </div>
        </div>
      </footer>
    </main>
  )
}
