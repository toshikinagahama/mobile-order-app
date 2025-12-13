export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-200 border-t-orange-500 mb-4"></div>
      <p className="text-gray-500 font-medium animate-pulse">読み込み中...</p>
    </div>
  )
}
