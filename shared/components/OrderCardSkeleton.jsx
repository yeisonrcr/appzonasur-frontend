// OrderCardSkeleton.jsx
function OrderCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
      <div className="p-3 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5 flex-1">
          <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0"></div>
          
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-28 mb-1.5"></div>
            <div className="h-3 bg-gray-200 rounded w-20"></div>
          </div>
        </div>
        
        <div className="w-20 h-6 bg-gray-200 rounded-full"></div>
      </div>

      <div className="p-3 bg-gray-50">
        <div className="space-y-1.5 mb-2.5">
          <div className="flex gap-1.5">
            <div className="w-6 h-3 bg-gray-200 rounded"></div>
            <div className="flex-1 h-3 bg-gray-200 rounded"></div>
          </div>
          <div className="flex gap-1.5">
            <div className="w-6 h-3 bg-gray-200 rounded"></div>
            <div className="flex-1 h-3 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2.5 border-t border-gray-200">
          <div>
            <div className="h-2.5 bg-gray-200 rounded w-10 mb-1.5"></div>
            <div className="h-5 bg-gray-200 rounded w-16"></div>
          </div>
          <div className="h-8 bg-gray-200 rounded w-28"></div>
        </div>
      </div>
    </div>
  )
}

export default OrderCardSkeleton