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
      className="bg-white rounded-2xl p-4 shadow-soft hover:shadow-medium transition-all cursor-pointer border border-neutral-100 hover:border-primary-200 active:scale-[0.98]"
    >
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0">
          {product.images && product.images.length > 0 ? (
            <OptimizedImage
              src={product.images[0]}
              alt={product.name}
              className="w-24 h-24 rounded-xl object-cover"
            />
          ) : (
            <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center shadow-soft">
              <span className="text-3xl">🍽️</span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 mb-1">
            <h3 className="font-bold text-neutral-900 text-base flex-1 line-clamp-1">
              {product.name}
            </h3>
          </div>
          
          {product.description && (
            <p className="text-sm text-neutral-600 line-clamp-2 mb-3 leading-relaxed">
              {product.description}
            </p>
          )}
          
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-primary-600">
              ₡{product.price.toLocaleString()}
            </span>
            
            {isLowStock && !isOutOfStock && (
              <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded-full font-semibold">
                Solo {product.stock_quantity}
              </span>
            )}
            
            {isOutOfStock && (
              <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full font-semibold">
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
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all shadow-medium active:scale-95 ${
              isOpen && !isOutOfStock
                ? 'bg-gradient-to-br from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700'
                : 'bg-neutral-300 cursor-not-allowed'
            }`}
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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