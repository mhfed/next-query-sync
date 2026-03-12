'use client'
import { Suspense } from 'react';
import { useQueryState, parseAsInteger, withDefault } from 'next-query-sync';

function CounterTest() {
  const [count, setCount] = useQueryState(
    'count',
    withDefault(parseAsInteger, 0)
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 p-8 font-sans">
      <h1 className="text-4xl font-bold text-blue-600">next-query-sync Demo 🐦</h1>
      <div className="p-8 border-2 border-dashed border-gray-300 rounded-xl text-center">
        <p className="text-xl mb-4">
          Giá trị hiện tại:{' '}
          <span className="font-bold text-3xl">{count}</span>
        </p>
        <div className="flex gap-4">
          <button
            className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 active:scale-95 transition"
            onClick={() => setCount(count - 1)}
          >
            - Giảm
          </button>
          <button
            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 active:scale-95 transition"
            onClick={() => setCount(0)}
          >
            Reset
          </button>
          <button
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 active:scale-95 transition"
            onClick={() => setCount(count + 1)}
          >
            + Tăng
          </button>
        </div>
      </div>
      <p className="text-gray-500 max-w-md text-center">
        Hãy thử ấn nút, sau đó F5 lại trang hoặc dùng nút Back/Forward của
        trình duyệt để xem độ &quot;mượt&quot; của thư viện nhé!
      </p>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Đang load next-query-sync...</div>}>
      <CounterTest />
    </Suspense>
  );
}
