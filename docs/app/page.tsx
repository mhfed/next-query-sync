'use client'

import { useState } from 'react'
import {
  ShieldCheck,
  Zap,
  Server,
  Copy,
  Check,
  Github,
  Package,
  ArrowRight,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// CopyButton
// ---------------------------------------------------------------------------
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
      <div className={`mb-4 inline-flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} text-white`}>
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-white">{title}</h3>
      <p className="text-sm leading-relaxed text-zinc-400">{description}</p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// MockIDE
// ---------------------------------------------------------------------------
function MockIDE() {
  const code = `'use client'
import {
  useQueryState,
  parseAsInteger,
  withDefault,
} from 'next-query-sync'

export function ProductList() {
  const [page, setPage] = useQueryState(
    'page',
    withDefault(parseAsInteger, 1),
    { history: 'push' }
  )

  // page: number ← never null thanks to withDefault

  return (
    <div>
      <h1>Page {page}</h1>
      <button onClick={() => setPage(p => p + 1)}>
        Next →
      </button>
    </div>
  )
}`

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0d0d14] overflow-hidden shadow-2xl">
      {/* Window chrome */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/8 bg-white/3">
        <span className="w-3 h-3 rounded-full bg-red-500/80" />
        <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
        <span className="w-3 h-3 rounded-full bg-green-500/80" />
        <span className="ml-3 text-xs text-zinc-500 font-mono">product-list.tsx</span>
      </div>
      {/* Code */}
      <pre className="p-5 text-xs sm:text-sm font-mono leading-relaxed overflow-x-auto">
        <code>
          {code.split('\n').map((line, i) => (
            <div key={i} className="flex">
              <span className="select-none w-8 shrink-0 text-zinc-600 text-right mr-4">{i + 1}</span>
              <span dangerouslySetInnerHTML={{ __html: highlightLine(line) }} />
            </div>
          ))}
        </code>
      </pre>
    </div>
  )
}

/** Very minimal syntax highlighter for the snippet */
function highlightLine(line: string): string {
  return line
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/('use client'|'next-query-sync')/g, '<span style="color:#a78bfa">$1</span>')
    .replace(/\b(import|from|export|function|return|const|let)\b/g, '<span style="color:#60a5fa">$1</span>')
    .replace(/\b(useQueryState|parseAsInteger|withDefault)\b/g, '<span style="color:#34d399">$1</span>')
    .replace(/\b(page|setPage|history)\b/g, '<span style="color:#f9a8d4">$1</span>')
    .replace(/(\/\/.*$)/g, '<span style="color:#6b7280">$1</span>')
    .replace(/\b(number|null|true|false)\b/g, '<span style="color:#fb923c">$1</span>')
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function Page() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">

      {/* Ambient glow blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-violet-600/15 blur-[120px] animate-pulse-glow" />
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[120px] animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
        <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full bg-violet-500/8 blur-[100px] animate-pulse-glow" style={{ animationDelay: '3s' }} />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 sm:px-10 py-5 border-b border-white/6 backdrop-blur-sm">
        <span className="text-lg font-bold bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
          next-query-sync
        </span>
        <div className="flex items-center gap-4">
          <a href="#features" className="hidden sm:block text-sm text-zinc-400 hover:text-white transition-colors">Features</a>
          <a href="#quickstart" className="hidden sm:block text-sm text-zinc-400 hover:text-white transition-colors">Quick Start</a>
          <a
            href="https://github.com"
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
        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-xs text-violet-300">
          <Package size={12} />
          v1.0.0 · Now on npm
        </div>

        {/* Headline */}
        <h1 className="mb-6 text-6xl sm:text-8xl font-black tracking-tight leading-none">
          <span className="bg-gradient-to-r from-violet-400 via-blue-400 to-violet-300 bg-clip-text text-transparent drop-shadow-[0_0_60px_rgba(139,92,246,0.4)]">
            next-query-sync
          </span>
        </h1>

        {/* Sub-headline */}
        <p className="mb-4 max-w-xl text-xl sm:text-2xl text-zinc-400 leading-relaxed">
          Type-safe URL Search Params for Next.js.
        </p>
        <p className="mb-10 max-w-lg text-base text-zinc-500">
          Blazing fast.{' '}
          <span className="text-violet-400">Zero re-renders.</span>{' '}
          SSR-safe. Built on{' '}
          <code className="text-zinc-300 bg-white/5 px-1.5 py-0.5 rounded text-sm">useSyncExternalStore</code>.
        </p>

        {/* CTAs */}
        <div className="mb-10 flex flex-col sm:flex-row items-center gap-4">
          <a
            href="#quickstart"
            className="flex items-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white font-semibold text-sm hover:from-violet-500 hover:to-blue-500 transition-all duration-200 shadow-lg shadow-violet-500/25"
          >
            Get Started <ArrowRight size={16} />
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-7 py-3 rounded-xl border border-white/15 text-zinc-300 font-semibold text-sm hover:border-white/30 hover:text-white transition-all duration-200"
          >
            <Github size={16} /> GitHub
          </a>
        </div>

        {/* Install box */}
        <InstallBox />
      </section>

      {/* ── FEATURES ─────────────────────────────────────────── */}
      <section id="features" className="relative z-10 px-6 sm:px-10 pb-28 max-w-5xl mx-auto">
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
            title="Type-Safe Level God"
            description="TypeScript infers exact output types directly from your parser schema. withDefault narrows T | null down to plain T — no casting needed."
          />
          <FeatureCard
            icon={<Zap size={20} />}
            gradient="from-yellow-500 to-orange-600"
            title="Smart Batching"
            description="queueMicrotask under the hood coalesces multiple updates into a single history.replaceState call — zero redundant re-renders and no FPS drops."
          />
          <FeatureCard
            icon={<Server size={20} />}
            gradient="from-blue-500 to-cyan-600"
            title="SSR & App Router Ready"
            description="Works flawlessly with Next.js Server Components. Every window access is guarded. useSyncExternalStore prevents UI tearing in Concurrent Mode."
          />
        </div>
      </section>

      {/* ── QUICK START ──────────────────────────────────────── */}
      <section id="quickstart" className="relative z-10 px-6 sm:px-10 pb-32 max-w-5xl mx-auto">
        <div className="mb-12 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">Quick Start</h2>
          <p className="text-zinc-500 max-w-md mx-auto">
            Drop it in. Your URL is now your state.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2 items-center">
          {/* Left: Mock IDE */}
          <MockIDE />

          {/* Right: Explanation */}
          <div className="flex flex-col gap-6">
            {[
              {
                step: '01',
                title: 'Define your parser',
                desc: 'Choose a built-in parser (parseAsInteger, parseAsString, parseAsBoolean…) or implement the tiny Parser<T> interface yourself.',
                color: 'text-violet-400',
              },
              {
                step: '02',
                title: 'Add a default with withDefault',
                desc: 'Wrap any parser with withDefault(parser, fallback) and TypeScript automatically narrows the return type from T | null to T.',
                color: 'text-blue-400',
              },
              {
                step: '03',
                title: 'URL is your source of truth',
                desc: 'Updates are batched via queueMicrotask — multiple setters in one handler produce exactly one pushState call. Back/Forward navigation just works.',
                color: 'text-cyan-400',
              },
            ].map(({ step, title, desc, color }) => (
              <div key={step} className="flex gap-5">
                <span className={`shrink-0 text-2xl font-black tabular-nums ${color} opacity-60`}>{step}</span>
                <div>
                  <h4 className="font-semibold text-white mb-1">{title}</h4>
                  <p className="text-sm text-zinc-400 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}

            <div className="mt-2 p-4 rounded-xl border border-white/8 bg-white/3">
              <p className="text-xs text-zinc-500 leading-relaxed">
                <span className="text-zinc-300 font-medium">No Next.js router delay.</span>{' '}
                next-query-sync writes directly to{' '}
                <code className="text-violet-400 bg-white/5 px-1 rounded">window.history</code> and
                dispatches a custom event — components update without waiting for the Next.js router
                to re-render the whole page tree.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-white/6 px-6 sm:px-10 py-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-500">
          <span>
            © {new Date().getFullYear()}{' '}
            <span className="text-zinc-300 font-medium">next-query-sync</span>. MIT License.
          </span>
          <div className="flex items-center gap-6">
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
