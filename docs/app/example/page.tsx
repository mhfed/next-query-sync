'use client'
import Link from 'next/link'
import React, { Suspense, useEffect, useState } from 'react'
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

// ─── UrlBar ────────────────────────────────────────────────────────────────

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

// ─── 0. useState-like API (auto-inference) ────────────────────────────────
function AutoInferDemo() {
  const [count, setCount] = useQueryState('ai_count', 0)
  const [search, setSearch] = useQueryState('ai_q', '')
  const [active, setActive] = useQueryState('ai_active', false)
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Không cần import parser. Thư viện tự suy luận kiểu từ{' '}
        <code>defaultValue</code>. Khi giá trị bằng default, param bị xóa khỏi URL.
      </p>
      <div className="grid gap-3 text-xs font-mono text-gray-500 bg-gray-50 rounded-lg p-3 leading-relaxed">
        <p><span className="text-green-600">// Giống hệt useState!</span></p>
        <p><span className="text-blue-600">useQueryState</span>(<span className="text-orange-600">&#39;ai_count&#39;</span>, <span className="text-purple-600">0</span>){'  '}→ number</p>
        <p><span className="text-blue-600">useQueryState</span>(<span className="text-orange-600">&#39;ai_q&#39;</span>, <span className="text-purple-600">&#39;&#39;</span>){'     '}→ string</p>
        <p><span className="text-blue-600">useQueryState</span>(<span className="text-orange-600">&#39;ai_active&#39;</span>, <span className="text-purple-600">false</span>){'  '}→ boolean</p>
      </div>
      {/* Number */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-500 w-20">number:</span>
        <button
          className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition"
          onClick={() => setCount(c => c - 1)}
        >−</button>
        <span className="text-2xl font-black tabular-nums w-12 text-center">{count}</span>
        <button
          className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition"
          onClick={() => setCount(c => c + 1)}
        >+</button>
        <button
          className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300 transition"
          onClick={() => setCount(0)}
        >Reset</button>
      </div>
      {/* String */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-500 w-20">string:</span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm kiếm…"
          className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300 transition"
          onClick={() => setSearch('')}
        >Clear</button>
      </div>
      {/* Boolean */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-500 w-20">boolean:</span>
        <button
          onClick={() => setActive(v => !v)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            active ? 'bg-blue-600' : 'bg-gray-300'
          }`}
        >
          <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
            active ? 'translate-x-6' : 'translate-x-1'
          }`} />
        </button>
        <span className="text-xs text-gray-500">{active ? 'true' : 'false'}</span>
      </div>
    </div>
  )
}


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

// ─── 7. Parser method chaining ────────────────────────────────────────────
function ChainingDemo() {
  const [page, setPage] = useQueryState('cp_page', parseAsInteger.withDefault(1))
  const [date, setDate] = useQueryState('cp_date', parseAsIsoDateTime.withDefault(new Date('2026-01-01T00:00:00.000Z')))
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Dùng <code>.withDefault()</code> trực tiếp trên parser — giống nuqs nhưng ngắn hơn.
      </p>
      <div className="grid gap-2 text-xs font-mono bg-gray-50 rounded-lg p-3">
        <p><span className="text-blue-600">parseAsInteger</span>.withDefault(<span className="text-purple-600">1</span>)</p>
        <p><span className="text-blue-600">parseAsIsoDateTime</span>.withDefault(<span className="text-purple-600">new Date(…)</span>)</p>
      </div>
      {/* Page */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-500 w-16">page:</span>
        <button onClick={() => setPage(p => Math.max(1, p - 1))}
          className="px-3 py-1.5 border border-gray-300 rounded text-sm hover:bg-gray-50">←</button>
        <span className="text-lg font-bold w-8 text-center">{page}</span>
        <button onClick={() => setPage(p => p + 1)}
          className="px-3 py-1.5 border border-gray-300 rounded text-sm hover:bg-gray-50">→</button>
        <button onClick={() => setPage(1)}
          className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded text-sm hover:bg-gray-200">Reset</button>
      </div>
      {/* Date */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-500 w-16">date:</span>
        <input type="date" value={date.toISOString().slice(0, 10)}
          onChange={e => setDate(new Date(e.target.value + 'T00:00:00.000Z'))}
          className="px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
        <span className="text-xs text-gray-400">{date.toISOString()}</span>
      </div>
    </div>
  )
}

// ─── 8. Zod schema integration ────────────────────────────────────────────
const RoleFilterSchema = z.object({
  role: z.enum(['admin', 'user', 'guest']),
  status: z.enum(['active', 'banned']),
}).default({ role: 'user', status: 'active' })

function ZodDemo() {
  const [filter, setFilter] = useQueryState('zf', RoleFilterSchema)
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Truyền thẳng <strong>Zod schema</strong> — thư viện tự JSON.parse, validate và fallback về default khi URL bị lỗi.
      </p>
      <div className="text-xs font-mono bg-gray-50 rounded-lg p-3 space-y-1">
        <p><span className="text-green-600">// Chỉ cần một dòng, zero boilerplate!</span></p>
        <p><span className="text-blue-600">useQueryState</span>(<span className="text-orange-600">&#39;zf&#39;</span>, RoleFilterSchema)</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {/* role */}
        <div>
          <p className="text-xs font-medium text-gray-600 mb-1.5">role</p>
          <div className="flex gap-1.5 flex-wrap">
            {(['admin', 'user', 'guest'] as const).map(r => (
              <button key={r} onClick={() => setFilter(f => ({ ...f, role: r }))}
                className={`px-3 py-1.5 rounded-full text-xs border transition ${filter.role === r ? 'bg-blue-100 border-blue-400 text-blue-700 font-semibold' : 'border-gray-300 text-gray-600 hover:border-gray-400'}`}>
                {r}
              </button>
            ))}
          </div>
        </div>
        {/* status */}
        <div>
          <p className="text-xs font-medium text-gray-600 mb-1.5">status</p>
          <div className="flex gap-1.5">
            {(['active', 'banned'] as const).map(s => (
              <button key={s} onClick={() => setFilter(f => ({ ...f, status: s }))}
                className={`px-3 py-1.5 rounded-full text-xs border transition ${filter.status === s ? 'bg-green-100 border-green-400 text-green-700 font-semibold' : 'border-gray-300 text-gray-600 hover:border-gray-400'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="p-3 bg-gray-50 rounded-lg text-xs font-mono text-gray-600 space-y-0.5">
        <p>JS value: <span className="text-blue-600">{JSON.stringify(filter)}</span></p>
        <p className="text-gray-400 text-[10px]">URL: ?zf={encodeURIComponent(JSON.stringify(filter))}</p>
      </div>
    </div>
  )
}

// ─── 9. Debounce + startTransition ────────────────────────────────────────
function DebounceDemo() {
  const [q, setQ] = useQueryState('dq', '', { debounce: 400, startTransition: true })
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        <code>&#123; debounce: 400, startTransition: true &#125;</code> — UI cập nhật ngay lập tức,
        URL chỉ ghi sau 400ms ngừng gõ. Không cần hook useDebounce riêng!
      </p>
      <input
        type="text"
        value={q}
        onChange={e => setQ(e.target.value)}
        placeholder="Gõ liên tục, xem URL chỉ cập nhật khi ngừng…"
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
      />
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span>Giá trị hiện tại:</span>
        <code className="text-blue-600">{q === '' ? '(trống)' : `"${q}"`}</code>
        <span className="ml-auto text-gray-400">debounce: 400ms</span>
      </div>
    </div>
  )
}


const demos: { id: number; title: string; component: React.ReactNode }[] = [
  { id: 0, title: '✨ Auto-Inference — useState-like API', component: <AutoInferDemo /> },
  { id: 1, title: 'Counter (Integer + default)', component: <CounterDemo /> },
  { id: 2, title: 'Search (String, nullable)', component: <SearchDemo /> },
  { id: 3, title: 'Pagination (history: push)', component: <PaginationDemo /> },
  { id: 4, title: 'Boolean Toggles', component: <BooleanDemo /> },
  { id: 5, title: 'Multi-Select Array', component: <ArrayDemo /> },
  { id: 6, title: 'useQueryStates (multiple params)', component: <MultiStateDemo /> },
  { id: 7, title: '🔗 Parser Method Chaining (.withDefault())', component: <ChainingDemo /> },
  { id: 8, title: '🛡️ Zod Schema Integration', component: <ZodDemo /> },
  { id: 9, title: '⚡ Debounce + startTransition', component: <DebounceDemo /> },
]

function PageContent() {
  const [activeId, setActiveId] = useQueryState('tab', withDefault(parseAsInteger, 0))
  const active = demos.find(d => d.id === activeId) ?? demos[0]

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      {/* Header */}
      <header className="border-b bg-white px-6 py-4 shrink-0">
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
          Tất cả các demo đều đồng bộ state với URL. Thử thao tác, F5, và dùng Back/Forward.
        </p>
      </header>

      {/* Live URL bar */}
      <div className="border-b bg-white px-6 py-3 shrink-0">
        <UrlBar />
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden" style={{ minHeight: 0 }}>
        {/* Sidebar */}
        <aside className="w-64 border-r bg-white shrink-0 overflow-y-auto">
          <nav className="p-2 space-y-0.5">
            {demos.map(({ id, title }) => (
              <button
                key={id}
                onClick={() => setActiveId(id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-colors text-sm ${
                  id === activeId
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                }`}
              >
                <span className={`shrink-0 flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${
                  id === activeId ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {id}
                </span>
                <span className="leading-snug">{title}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                  {active.id}
                </span>
                <h2 className="text-sm font-semibold text-gray-800">{active.title}</h2>
              </div>
              <div className="px-5 py-5">{active.component}</div>
            </div>
          </div>
        </main>
      </div>

      <footer className="text-center py-4 text-xs text-gray-400 border-t bg-white shrink-0">
        next-query-sync · MIT
      </footer>
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500 animate-pulse">Đang load…</div>}>
      <PageContent />
    </Suspense>
  )
}
