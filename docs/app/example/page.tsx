'use client'
import Link from 'next/link'
import { Suspense } from 'react'
import {
  useQueryState,
  useQueryStates,
  parseAsString,
  parseAsInteger,
  parseAsBoolean,
  parseAsArrayOf,
  withDefault,
} from 'next-query-sync'

// ─── UrlBar ────────────────────────────────────────────────────────────────
import { useEffect, useState } from 'react'

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
    <p className="text-xs text-gray-500 font-mono break-all">
      <span className="font-semibold text-gray-700">URL: </span>
      {`localhost:3000${search || '/'}`}
    </p>
  )
}

// ─── 1. Counter ────────────────────────────────────────────────────────────
function CounterDemo() {
  const [count, setCount] = useQueryState('count', withDefault(parseAsInteger, 0))
  return (
    <div>
      <p className="text-sm text-gray-500 mb-3">
        <code>useQueryState(&#39;count&#39;, withDefault(parseAsInteger, 0))</code>
      </p>
      <div className="flex items-center gap-4">
        <button
          className="px-5 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 active:scale-95 transition font-medium"
          onClick={() => setCount(c => c - 1)}
        >
          − Giảm
        </button>
        <span className="text-4xl font-black tabular-nums w-16 text-center">{count}</span>
        <button
          className="px-5 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 active:scale-95 transition font-medium"
          onClick={() => setCount(c => c + 1)}
        >
          + Tăng
        </button>
        <button
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm"
          onClick={() => setCount(0)}
        >
          Reset
        </button>
      </div>
      <p className="mt-3 text-xs text-gray-500">
        Thử nhấn F5 hoặc dùng Back/Forward của trình duyệt sau khi thay đổi giá trị.
      </p>
    </div>
  )
}

// ─── 2. Search ─────────────────────────────────────────────────────────────
function SearchDemo() {
  const [q, setQ] = useQueryState('q', parseAsString)
  return (
    <div>
      <p className="text-sm text-gray-500 mb-3">
        <code>useQueryState(&#39;q&#39;, parseAsString)</code>
        {' '}— khi xóa hết, key sẽ bị xóa khỏi URL.
      </p>
      <input
        type="text"
        placeholder="Nhập từ khóa tìm kiếm…"
        value={q ?? ''}
        onChange={(e) => setQ(e.target.value || null)}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
      />
      <p className="mt-2 text-xs text-gray-500">
        Giá trị JS: <code className="text-blue-600">{q === null ? 'null' : `"${q}"`}</code>
      </p>
    </div>
  )
}

// ─── 3. Pagination với history: 'push' ────────────────────────────────────
function PaginationDemo() {
  const [page, setPage] = useQueryState(
    'page',
    withDefault(parseAsInteger, 1),
    { history: 'push' }
  )
  return (
    <div>
      <p className="text-sm text-gray-500 mb-3">
        <code>useQueryState(&#39;page&#39;, withDefault(parseAsInteger, 1), &#123; history: &#39;push&#39; &#125;)</code>
        {' '}— nút Back hoạt động!
      </p>
      <div className="flex items-center gap-3">
        <button
          disabled={page <= 1}
          onClick={() => setPage(p => Math.max(1, p - 1))}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50 transition"
        >
          ← Prev
        </button>
        {Array.from({ length: 6 }, (_, i) => i + 1).map(n => (
          <button
            key={n}
            onClick={() => setPage(n)}
            className={`w-10 h-10 rounded-lg text-sm font-semibold transition ${
              n === page
                ? 'bg-blue-600 text-white shadow'
                : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {n}
          </button>
        ))}
        <button
          disabled={page >= 6}
          onClick={() => setPage(p => Math.min(6, p + 1))}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50 transition"
        >
          Next →
        </button>
      </div>
    </div>
  )
}

// ─── 4. Boolean toggles ────────────────────────────────────────────────────
function BooleanDemo() {
  const [dark, setDark] = useQueryState('dark', withDefault(parseAsBoolean, false))
  const [compact, setCompact] = useQueryState('compact', withDefault(parseAsBoolean, false))
  return (
    <div>
      <p className="text-sm text-gray-500 mb-3">
        <code>withDefault(parseAsBoolean, false)</code> — giá trị luôn là{' '}
        <code>boolean</code>, không bao giờ null.
      </p>
      <div className="space-y-3">
        {[
          { label: 'Dark mode', key: 'dark', value: dark, setter: setDark },
          { label: 'Compact view', key: 'compact', value: compact, setter: setCompact },
        ].map(({ label, key, value, setter }) => (
          <div key={key} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-800">{label}</p>
              <p className="text-xs text-gray-400">
                ?{key}=<code>{value.toString()}</code>
              </p>
            </div>
            <button
              onClick={() => setter(v => !v)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                value ? 'bg-blue-600' : 'bg-gray-300'
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
      </div>
    </div>
  )
}

// ─── 5. Array / multi-select ───────────────────────────────────────────────
const TAGS = ['react', 'typescript', 'nextjs', 'tailwind', 'nodejs']

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
    <div>
      <p className="text-sm text-gray-500 mb-3">
        <code>parseAsArrayOf(parseAsString)</code> — lưu dạng{' '}
        <code>?tags=react,typescript,nextjs</code>
      </p>
      <div className="flex flex-wrap gap-2 mb-3">
        {TAGS.map(tag => (
          <button
            key={tag}
            onClick={() => toggle(tag)}
            className={`px-3 py-1.5 rounded-full text-sm border transition ${
              selected.includes(tag)
                ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                : 'border-gray-300 text-gray-600 hover:border-gray-400'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-500">
        JS value:{' '}
        <code className="text-blue-600 break-all">
          {selected.length > 0 ? JSON.stringify(selected) : 'null'}
        </code>
      </p>
    </div>
  )
}

// ─── 6. useQueryStates — nhiều params cùng lúc ────────────────────────────
function MultiStateDemo() {
  const [filters, setFilters] = useQueryStates({
    sort: withDefault(parseAsString, 'latest'),
    pg: withDefault(parseAsInteger, 1),
    s: parseAsString,
  })
  const pg = filters.pg ?? 1
  const sort = filters.sort ?? 'latest'

  return (
    <div>
      <p className="text-sm text-gray-500 mb-3">
        <code>useQueryStates(&#123; sort, pg, s &#125;)</code> — tất cả thay đổi trong
        một <code>setFilters()</code> tạo ra đúng <strong>một</strong> history entry.
      </p>
      <div className="space-y-3">
        <div className="flex gap-2">
          {['latest', 'popular', 'oldest'].map(opt => (
            <button
              key={opt}
              onClick={() => setFilters({ sort: opt, pg: 1 })}
              className={`px-3 py-1.5 rounded-lg text-sm border transition ${
                sort === opt
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Tìm kiếm…"
          value={filters.s ?? ''}
          onChange={(e) => setFilters({ s: e.target.value || null, pg: 1 })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <div className="flex items-center gap-3">
          <button
            disabled={pg <= 1}
            onClick={() => setFilters({ pg: pg - 1 })}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50 transition"
          >←</button>
          <span className="text-sm font-bold w-8 text-center">{pg}</span>
          <button
            onClick={() => setFilters({ pg: pg + 1 })}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition"
          >→</button>
        </div>
        <div className="mt-2 p-3 bg-gray-50 rounded-lg text-xs font-mono text-gray-600 space-y-0.5">
          <p>sort: <span className="text-blue-600">{JSON.stringify(sort)}</span></p>
          <p>pg: <span className="text-orange-600">{pg}</span></p>
          <p>s: <span className="text-purple-600">{filters.s === null ? 'null' : JSON.stringify(filters.s)}</span></p>
        </div>
      </div>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────
const demos = [
  { id: 1, title: 'Counter (Integer + default)', component: <CounterDemo /> },
  { id: 2, title: 'Search (String, nullable)', component: <SearchDemo /> },
  { id: 3, title: 'Pagination (history: push)', component: <PaginationDemo /> },
  { id: 4, title: 'Boolean Toggles', component: <BooleanDemo /> },
  { id: 5, title: 'Multi-Select Array', component: <ArrayDemo /> },
  { id: 6, title: 'useQueryStates (multiple params)', component: <MultiStateDemo /> },
]

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500 animate-pulse">Đang load…</div>}>
      <div className="min-h-screen bg-gray-50 font-sans">
        {/* Header */}
        <header className="border-b bg-white px-6 py-5">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            ← Back to docs
          </Link>
          <h1 className="text-2xl font-black text-gray-900">
            next-query-sync{' '}
            <span className="ml-2 text-sm font-medium text-gray-400">example</span>
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Tất cả các demo dưới đây đều đồng bộ state với URL. Hãy thử thao tác,
            F5, và dùng Back/Forward của trình duyệt.
          </p>
        </header>

        {/* Live URL bar */}
        <div className="border-b bg-white px-6 py-3">
          <UrlBar />
        </div>

        {/* Demos */}
        <main className="max-w-3xl mx-auto py-8 px-6 space-y-6">
          {demos.map(({ id, title, component }) => (
            <div key={id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                  {id}
                </span>
                <h2 className="text-sm font-semibold text-gray-800">{title}</h2>
              </div>
              <div className="px-5 py-5">{component}</div>
            </div>
          ))}
        </main>

        <footer className="text-center py-8 text-xs text-gray-400">
          next-query-sync · MIT
        </footer>
      </div>
    </Suspense>
  )
}
