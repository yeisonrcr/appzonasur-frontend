function OrderCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          {/* Logo skeleton */}
          <div className="w-12 h-12 bg-gray-200 rounded-xl flex-shrink-0"></div>
          
          <div className="flex-1">
            {/* Título skeleton */}
            <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
            {/* Fecha skeleton */}
            <div className="h-4 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
        
        {/* Badge skeleton */}
        <div className="w-24 h-8 bg-gray-200 rounded-full"></div>
      </div>

      {/* Body */}
      <div className="p-4 bg-gray-50">
        <div className="space-y-2 mb-3">
          {/* Item 1 */}
          <div className="flex gap-2">
            <div className="w-8 h-4 bg-gray-200 rounded"></div>
            <div className="flex-1 h-4 bg-gray-200 rounded"></div>
          </div>
          {/* Item 2 */}
          <div className="flex gap-2">
            <div className="w-8 h-4 bg-gray-200 rounded"></div>
            <div className="flex-1 h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          <div>
            <div className="h-3 bg-gray-200 rounded w-12 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-20"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    </div>
  )
}

export default OrderCardSkeleton