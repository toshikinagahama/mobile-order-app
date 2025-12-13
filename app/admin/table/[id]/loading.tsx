export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center h-64 w-full">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-gray-600 mb-3"></div>
      <p className="text-gray-500 text-sm">Loading data...</p>
    </div>
  )
}
