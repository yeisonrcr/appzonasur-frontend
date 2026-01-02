// ProductCard.jsx
import { memo, useState } from 'react'
import OptimizedImage from './OptimizedImage'

function ProductCard({ product, onAddToCart, onViewDetails, isOpen }) {
  const [isAdding, setIsAdding] = useState(false)

  const handleQuickAdd = async (e) => {
    e.stopPropagation()
    e.preventDefault()
    
    if (!isOpen || product.stock_quantity === 0) return
    
    setIsAdding(true)
    await onAddToCart(product, 1, [])
    setTimeout(() => setIsAdding(false), 500)
  }

  const isOutOfStock = !product.is_unlimited_stock && product.stock_quantity === 0
  const isLowStock = !product.is_unlimited_stock && product.stock_quantity < 10

  return (
    <div
      onClick={() => onViewDetails(product)}
      className="bg-white rounded-xl p-3 shadow-sm hover:shadow-md transition-all cursor-pointer border border-neutral-100 hover:border-primary-200 active:scale-[0.98]"
    >
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          {product.images && product.images.length > 0 ? (
            <OptimizedImage
              src={product.images[0]}
              alt={product.name}
              className="w-20 h-20 rounded-lg object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center shadow-sm">
              <span className="text-2xl">🍽️</span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 mb-1">
            <h3 className="font-bold text-neutral-900 text-sm flex-1 line-clamp-1">
              {product.name}
            </h3>
          </div>
          
          {product.description && (
            <p className="text-xs text-neutral-600 line-clamp-2 mb-2 leading-relaxed">
              {product.description}
            </p>
          )}
          
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-primary-600">
              ₡{product.price.toLocaleString()}
            </span>
            
            {isLowStock && !isOutOfStock && (
              <span className="text-[10px] px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded-full font-semibold">
                Solo {product.stock_quantity}
              </span>
            )}
            
            {isOutOfStock && (
              <span className="text-[10px] px-1.5 py-0.5 bg-red-100 text-red-700 rounded-full font-semibold">
                Agotado
              </span>
            )}
          </div>
        </div>

        <div className="flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onViewDetails(product)
            }}
            disabled={!isOpen || isOutOfStock}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-md active:scale-95 ${
              isOpen && !isOutOfStock
                ? 'bg-gradient-to-br from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700'
                : 'bg-neutral-300 cursor-not-allowed'
            }`}
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default memo(ProductCard, (prevProps, nextProps) => {
  return (
    prevProps.product.id === nextProps.product.id &&
    prevProps.product.stock_quantity === nextProps.product.stock_quantity &&
    prevProps.isOpen === nextProps.isOpen
  )
})