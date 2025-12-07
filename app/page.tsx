import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export default async function Home() {
  const tables = await prisma.table.findMany()

  return (
    <div className="min-h-screen bg-orange-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            モバイルオーダー
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            テーブルを選択するか、管理画面へ移動してください
          </p>
        </div>
        <div className="rounded-xl shadow-lg -space-y-px bg-white overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900">管理者</h3>
            <Link href="/admin" className="text-orange-600 hover:text-orange-500 block mt-2 font-medium">
              管理画面へ移動 &rarr;
            </Link>
          </div>
          <div className="p-6 bg-white">
            <h3 className="text-lg font-bold text-gray-900">お客様 (QRスキャンシミュレーション)</h3>
            <ul className="mt-4 space-y-3">
              {tables.map(table => (
                <li key={table.id}>
                  <Link href={`/table/${table.id}`} className="block w-full text-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-orange-500 hover:bg-orange-600 shadow-sm transition-colors">
                    {table.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
