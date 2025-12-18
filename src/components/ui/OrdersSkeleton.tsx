export function OrdersSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-3 border-2 border-gray-200">
            <div className="flex items-center">
              <div className="bg-gray-200 rounded-lg p-2 mr-2 animate-pulse">
                <div className="h-4 w-4 bg-gray-300 rounded"></div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="h-3 bg-gray-200 rounded animate-pulse mb-1"></div>
                <div className="h-5 bg-gray-300 rounded animate-pulse w-8"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {Array.from({ length: 7 }).map((_, i) => (
                  <th key={i} className="px-6 py-3">
                    <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Array.from({ length: 10 }).map((_, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j} className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {j === 5 ? (
                          // Status badge skeleton
                          <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse"></div>
                        ) : j === 6 ? (
                          // Items button skeleton  
                          <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
                        ) : (
                          // Regular text skeleton
                          <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Loading indicator */}
        <div className="flex items-center justify-center p-8 bg-gray-50 border-t">
          <div className="flex items-center space-x-2 text-gray-500">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span className="text-sm">Carregando pedidos...</span>
          </div>
        </div>
      </div>
    </div>
  )
}