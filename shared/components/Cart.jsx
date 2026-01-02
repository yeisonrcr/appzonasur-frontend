// Cart.jsx
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
            className="w-full bg-neutral-900 text-white p-3 rounded-xl shadow-lg flex items-center justify-between hover:bg-neutral-800 transition-all active:scale-[0.98]"
          >
            <div className="flex items-center gap-2.5">
              <div className="bg-white text-neutral-900 font-bold w-7 h-7 rounded-full flex items-center justify-center text-xs">
                {totalItems}
              </div>
              <span className="font-medium text-sm">Ver pedido</span>
            </div>
            <span className="font-bold text-base">
              ₡{subtotal.toLocaleString()}
            </span>
          </button>
        </div>
      )}

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
          />
          
          <div className="fixed inset-x-0 bottom-0 z-50 flex flex-col bg-white rounded-t-2xl shadow-2xl max-h-[85vh] animate-slide-up">
            
            <div className="flex-shrink-0 px-4 pt-3 pb-2 border-b border-neutral-200 bg-white rounded-t-2xl">
              <div className="w-10 h-1 bg-neutral-300 rounded-full mx-auto mb-3"></div>
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-neutral-900">
                  Tu Pedido
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 bg-neutral-100 rounded-full hover:bg-neutral-200 transition-colors active:scale-95"
                >
                  <svg className="w-5 h-5 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3 bg-neutral-50">
              <div className="space-y-2">
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

            <div className="flex-shrink-0 border-t border-neutral-200 bg-white p-4 space-y-3 pb-safe shadow-[0_-2px_12px_rgba(0,0,0,0.04)]">
              <div className="flex items-center justify-between">
                <span className="text-neutral-600 text-sm">Subtotal</span>
                <span className="font-bold text-lg text-neutral-900">
                  ₡{subtotal.toLocaleString()}
                </span>
              </div>
              
              <Button
                className="w-full py-3 text-sm shadow-md"
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
    <div className="bg-white rounded-lg p-3 shadow-sm border border-neutral-100">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h3 className="font-semibold text-neutral-900 text-sm">
            {item.product.name}
          </h3>
          
          {item.modifiers && item.modifiers.length > 0 && (
            <div className="mt-1 text-[11px] text-neutral-500">
              {item.modifiers.map((mod, idx) => (
                <span key={idx} className="block">
                  + {mod.option_name} {mod.price_delta > 0 && `(+₡${mod.price_delta})`}
                </span>
              ))}
            </div>
          )}
          
          {isAtMaxStock && (
            <p className="text-[11px] text-primary-600 mt-1">
              Stock máximo alcanzado
            </p>
          )}
        </div>

        <button 
          onClick={() => onRemove(item.id)}
          className="text-neutral-400 hover:text-red-500 p-1 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center bg-neutral-100 rounded-lg p-0.5 gap-0.5">
          <button
            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
            className="w-7 h-7 flex items-center justify-center bg-white rounded-md shadow-sm text-neutral-700 font-bold hover:bg-neutral-50 active:scale-95 transition-all"
          >
            −
          </button>
          
          <span className="w-8 text-center font-semibold text-sm text-neutral-900">
            {item.quantity}
          </span>
          
          <button
            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            disabled={isAtMaxStock}
            className="w-7 h-7 flex items-center justify-center bg-white rounded-md shadow-sm text-neutral-700 font-bold hover:bg-neutral-50 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white"
          >
            +
          </button>
        </div>

        <span className="font-bold text-neutral-900 text-sm">
          ₡{item.subtotal.toLocaleString()}
        </span>
      </div>
    </div>
  )
}

export default Cart