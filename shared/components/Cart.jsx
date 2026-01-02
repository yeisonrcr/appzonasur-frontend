import { useMemo, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useCartData, useCartActions } from '@shared/context/CartContext'
import { useTenant } from '@shared/context/TenantContext'
import Button from './Button'

function Cart() {
  const { items, isOpen, getSubtotal, getTotalItems, tenantSlug: cartTenantSlug } = useCartData()
  const { setIsOpen, updateQuantity, removeItem, clearCart } = useCartActions()
  const { slug: currentSlug } = useTenant()
  const navigate = useNavigate()
  const location = useLocation()
  
  const isCheckoutPage = location.pathname.endsWith('/checkout')
  
  // ✅ VALIDACIÓN EXTRA: Si el tenant del carrito no coincide con el actual, vaciar
  useEffect(() => {
    if (cartTenantSlug && currentSlug && cartTenantSlug !== currentSlug && items.length > 0) {
      clearCart()
    }
  }, [cartTenantSlug, currentSlug, items.length, clearCart])
  
  if (items.length === 0 || isCheckoutPage) return null

  const subtotal = getSubtotal()
  const totalItems = getTotalItems()

  const handleCheckout = () => {
    setIsOpen(false)
    navigate(`/${currentSlug}/checkout`)
  }

  return (
    <>
      {!isOpen && (
        <div className="fixed bottom-4 left-4 right-4 z-40 animate-slide-up">
          <button
            onClick={() => setIsOpen(true)}
            className="w-full bg-neutral-900 text-white p-4 rounded-xl shadow-strong flex items-center justify-between hover:bg-neutral-800 transition-all active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <div className="bg-white text-neutral-900 font-bold w-8 h-8 rounded-full flex items-center justify-center text-sm">
                {totalItems}
              </div>
              <span className="font-medium">Ver pedido</span>
            </div>
            <span className="font-bold text-lg">
              ₡{subtotal.toLocaleString()}
            </span>
          </button>
        </div>
      )}

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
          />
          
          <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white shadow-strong z-50 flex flex-col animate-slide-left">
            
            <div className="p-4 border-b border-neutral-200 flex items-center justify-between bg-white">
              <h2 className="text-xl font-bold text-neutral-900">
                Tu Pedido
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 bg-neutral-100 rounded-full hover:bg-neutral-200 transition-colors active:scale-95"
              >
                <svg className="w-6 h-6 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-neutral-50">
              <div className="space-y-3">
                {items.map(item => {
                  const maxStock = item.product.is_unlimited_stock 
                    ? 999 
                    : item.product.stock_quantity

                  return (
                    <CartItem
                      key={item.id}
                      item={item}
                      maxStock={maxStock}
                      onUpdateQuantity={updateQuantity}
                      onRemove={removeItem}
                    />
                  )
                })}
              </div>
            </div>

            <div className="border-t border-neutral-200 bg-white p-4 space-y-4 pb-safe">
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Subtotal</span>
                <span className="font-bold text-xl text-neutral-900">
                  ₡{subtotal.toLocaleString()}
                </span>
              </div>
              
              <Button
                className="w-full py-4 text-lg shadow-medium"
                onClick={handleCheckout}
              >
                Ir a Pagar
              </Button>
            </div>
          </div>
        </>
      )}
    </>
  )
}

function CartItem({ item, maxStock, onUpdateQuantity, onRemove }) {
  const isAtMaxStock = useMemo(() => {
    return !item.product.is_unlimited_stock && item.quantity >= maxStock
  }, [item.product.is_unlimited_stock, item.quantity, maxStock])

  return (
    <div className="bg-white rounded-xl p-3 shadow-soft border border-neutral-100">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h3 className="font-semibold text-neutral-900 text-sm">
            {item.product.name}
          </h3>
          
          {item.modifiers && item.modifiers.length > 0 && (
            <div className="mt-1 text-xs text-neutral-500">
              {item.modifiers.map((mod, idx) => (
                <span key={idx} className="block">
                  + {mod.option_name} {mod.price_delta > 0 && `(+₡${mod.price_delta})`}
                </span>
              ))}
            </div>
          )}
          
          {isAtMaxStock && (
            <p className="text-xs text-primary-600 mt-1">
              Stock máximo alcanzado
            </p>
          )}
        </div>

        <button 
          onClick={() => onRemove(item.id)}
          className="text-neutral-400 hover:text-red-500 p-1 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center bg-neutral-100 rounded-lg p-1 gap-1">
          <button
            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
            className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-soft text-neutral-700 font-bold hover:bg-neutral-50 active:scale-95 transition-all"
          >
            −
          </button>
          
          <span className="w-10 text-center font-semibold text-sm text-neutral-900">
            {item.quantity}
          </span>
          
          <button
            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            disabled={isAtMaxStock}
            className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-soft text-neutral-700 font-bold hover:bg-neutral-50 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white"
          >
            +
          </button>
        </div>

        <span className="font-bold text-neutral-900">
          ₡{item.subtotal.toLocaleString()}
        </span>
      </div>
    </div>
  )
}

export default Cart