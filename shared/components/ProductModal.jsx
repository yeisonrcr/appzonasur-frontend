// ProductModal.jsx
import { useState, useEffect } from 'react'
import { useCart } from '@shared/context/CartContext'
import { useTenant } from '@shared/context/TenantContext'
import { getProductModifiers } from '@shared/services/api'
import Button from './Button'
import ModifierSelector from './ModifierSelector'
import LoadingSpinner from './LoadingSpinner'

function ProductModal({ product, isOpen, onClose, tenantIsOpen }) {
  const { addItem, getAvailableStock } = useCart()
  const { slug, tenant } = useTenant()
   
  const [quantity, setQuantity] = useState(1)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isAdding, setIsAdding] = useState(false)
   
  const [modifierGroups, setModifierGroups] = useState([])
  const [selectedModifiers, setSelectedModifiers] = useState({})
  const [modifierErrors, setModifierErrors] = useState({})
  const [loadingModifiers, setLoadingModifiers] = useState(false)

  useEffect(() => {
    if (product && isOpen) {
      setQuantity(1)
      setCurrentImageIndex(0)
      setSelectedModifiers({})
      setModifierErrors({})
      loadModifiers()
    }
  }, [product, isOpen])

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose()
    }
    
    if (isOpen) {
      window.addEventListener('keydown', handleEsc)
      document.body.style.overflow = 'hidden'
    }
    
    return () => {
      window.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  const loadModifiers = async () => {
    if (!product) return
    
    setLoadingModifiers(true)
    try {
      const groups = await getProductModifiers(product.id)
      setModifierGroups(groups || [])
    } catch (error) {
      console.error('Error cargando modificadores:', error)
      setModifierGroups([])
    } finally {
      setLoadingModifiers(false)
    }
  }

  const validateModifiers = () => {
    const errors = {}
    let isValid = true

    modifierGroups.forEach(group => {
      const selections = selectedModifiers[group.id] || []
      
      if (group.is_required && selections.length === 0) {
        errors[group.id] = 'Debes seleccionar al menos una opción'
        isValid = false
      } else if (selections.length < group.min_selections) {
        errors[group.id] = `Debes seleccionar al menos ${group.min_selections} opciones`
        isValid = false
      } else if (selections.length > group.max_selections) {
        errors[group.id] = `Puedes seleccionar máximo ${group.max_selections} opciones`
        isValid = false
      }
    })

    setModifierErrors(errors)
    return isValid
  }

  const formatModifiersForCart = () => {
    const modifiers = []
    
    Object.keys(selectedModifiers).forEach(groupId => {
      const group = modifierGroups.find(g => g.id === parseInt(groupId))
      const options = selectedModifiers[groupId] || []
      
      options.forEach(option => {
        modifiers.push({
          group_id: group.id,
          group_name: group.name,
          option_id: option.id,
          option_name: option.name,
          price_delta: option.price_delta
        })
      })
    })
    
    return modifiers
  }

  const calculateTotal = () => {
    let total = product.price * quantity
    
    Object.values(selectedModifiers).forEach(options => {
      options.forEach(option => {
        total += option.price_delta * quantity
      })
    })
    
    return total
  }

  if (!isOpen || !product) return null

  const availableStock = getAvailableStock(product, formatModifiersForCart())
  const maxQuantity = product.is_unlimited_stock ? 999 : availableStock

  const canAdd = () => {
    if (!tenantIsOpen) return false
    if (!product.is_unlimited_stock && quantity > availableStock) return false
    return true
  }

  const handleAdd = async () => {
    if (!canAdd()) return
    
    if (modifierGroups.length > 0 && !validateModifiers()) {
      return
    }
    
    setIsAdding(true)
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const modifiers = formatModifiersForCart()
    
    const success = addItem(
      product, 
      quantity, 
      modifiers,
      slug,           
      tenant?.name    
    )
    
    if (success) {
      setIsAdding(false)
      onClose()
    } else {
      setIsAdding(false)
    }
  }

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm animate-fade-in" 
        onClick={onClose}
      />

      <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center pointer-events-none p-0 md:p-4">
        
        <div className="bg-white w-full md:max-w-2xl md:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col pointer-events-auto max-h-[92vh] animate-slide-up overflow-hidden relative">
          
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-20 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-all shadow-md backdrop-blur-sm"
            aria-label="Cerrar"
          >
            <svg className="w-4 h-4 text-neutral-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="overflow-y-auto flex-1 overscroll-contain">
            
            <div className="relative h-48 bg-neutral-100">
              {product.images && product.images.length > 0 ? (
                <>
                  <img
                    src={product.images[currentImageIndex]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  {product.images.length > 1 && (
                    <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
                      {product.images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-1.5 h-1.5 rounded-full transition-all shadow-sm ${
                            index === currentImageIndex ? 'bg-white w-4' : 'bg-white/60 hover:bg-white'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-5xl text-neutral-300">
                  🍽️
                </div>
              )}
              <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/30 to-transparent pointer-events-none md:hidden" />
            </div>

            <div className="p-4 pb-3">
              <div className="flex justify-between items-start gap-3 mb-2">
                <h2 className="text-lg font-bold text-neutral-900 leading-tight">
                  {product.name}
                </h2>
                <div className="flex flex-col items-end">
                  <span className="text-base font-bold text-primary-600 whitespace-nowrap">
                    ₡{product.price.toLocaleString()}
                  </span>
                  {!product.is_unlimited_stock && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full mt-1 font-medium ${availableStock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {availableStock > 0 ? `Stock: ${availableStock}` : 'Agotado'}
                    </span>
                  )}
                </div>
              </div>
              
              {product.description && (
                <p className="text-neutral-600 text-xs leading-relaxed mb-4">
                  {product.description}
                </p>
              )}

              {!product.is_unlimited_stock && availableStock < product.stock_quantity && (
                <div className="mb-4 bg-orange-50 border border-orange-200 rounded-lg p-2.5 flex gap-2 items-start">
                  <span className="text-orange-500 mt-0.5 text-sm">📦</span>
                  <p className="text-[11px] text-orange-800">
                    Ya tienes <strong>{product.stock_quantity - availableStock}</strong> unidades en tu carrito.
                    Solo quedan {availableStock} disponibles.
                  </p>
                </div>
              )}

              {loadingModifiers ? (
                <div className="py-6 flex justify-center">
                  <LoadingSpinner />
                </div>
              ) : modifierGroups.length > 0 && (
                <div className="mb-4 space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-5 w-0.5 bg-primary-500 rounded-full"></div>
                    <h3 className="text-sm font-bold text-neutral-900">Personaliza tu pedido</h3>
                  </div>
                  <ModifierSelector
                    groups={modifierGroups}
                    selectedModifiers={selectedModifiers}
                    onChange={setSelectedModifiers}
                    errors={modifierErrors}
                  />
                </div>
              )}

              <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-100 flex items-center justify-between mb-3">
                <span className="font-medium text-neutral-700 text-sm">Cantidad</span>
                <div className="flex items-center gap-3 bg-white rounded-lg shadow-sm border border-neutral-200 p-0.5">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 flex items-center justify-center text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50 rounded-md transition-colors text-lg font-medium"
                    disabled={quantity <= 1}
                  >
                    −
                  </button>
                  <span className="w-6 text-center font-bold text-base text-neutral-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                    disabled={quantity >= maxQuantity}
                    className="w-8 h-8 flex items-center justify-center text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50 rounded-md transition-colors text-lg font-medium disabled:opacity-30"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-neutral-200 p-3 bg-white z-20 shadow-[0_-2px_12px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-xs font-medium text-neutral-500">Total a pagar</span>
              <span className="text-xl font-bold text-neutral-900">
                ₡{calculateTotal().toLocaleString()}
              </span>
            </div>
            
            <Button
              className="w-full shadow-md"
              size="md"
              disabled={!canAdd()}
              loading={isAdding}
              onClick={handleAdd}
            >
              {!tenantIsOpen 
                ? 'Restaurante Cerrado'
                : availableStock === 0
                ? 'Agotado'
                : isAdding
                ? 'Agregando...'
                : 'Agregar al Pedido'}
            </Button>
          </div>

        </div>
      </div>
    </>
  )
}

export default ProductModal