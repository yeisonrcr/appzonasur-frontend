import { createContext, useState, useContext, useEffect, useMemo, useCallback } from 'react'
import { showError, showInfo } from '@shared/services/alerts'

const CartDataContext = createContext()
const CartActionsContext = createContext()

const CART_STORAGE_KEY = 'zonasur_cart'

// ✅ NUEVA ESTRUCTURA EN LOCALSTORAGE:
// {
//   tenantSlug: 'restaurante-a',
//   tenantName: 'Restaurante A',
//   items: [...]
// }

function loadCartFromStorage() {
  try {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY)
    if (savedCart) {
      const parsed = JSON.parse(savedCart)
      
      // Soporte para formato antiguo (migración automática)
      if (Array.isArray(parsed)) {
        return { tenantSlug: null, tenantName: null, items: parsed }
      }
      
      // Formato nuevo
      if (parsed.items && Array.isArray(parsed.items)) {
        return {
          tenantSlug: parsed.tenantSlug || null,
          tenantName: parsed.tenantName || null,
          items: parsed.items
        }
      }
    }
  } catch (error) {
    console.error('Error cargando carrito:', error)
  }
  return { tenantSlug: null, tenantName: null, items: [] }
}

function saveCartToStorage(tenantSlug, tenantName, items) {
  try {
    const cartData = {
      tenantSlug,
      tenantName,
      items
    }
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartData))
  } catch (error) {
    console.error('Error guardando carrito:', error)
  }
}

export function CartProvider({ children, currentTenantSlug = null, currentTenantName = null }) {
  const [cartData, setCartData] = useState(() => loadCartFromStorage())
  const [isOpen, setIsOpen] = useState(false)

  const { tenantSlug, tenantName, items } = cartData

  // ✅ Guardar en localStorage cuando cambia el carrito
  useEffect(() => {
    saveCartToStorage(tenantSlug, tenantName, items)
  }, [tenantSlug, tenantName, items])

  // ✅ VALIDACIÓN AUTOMÁTICA: Si hay productos de otro tenant, vaciar
  useEffect(() => {
    if (currentTenantSlug && tenantSlug && tenantSlug !== currentTenantSlug && items.length > 0) {

      //showInfo(
        //`Se vació tu carrito de ${tenantName || 'otro negocio'} para iniciar uno nuevo en ${currentTenantName || 'este negocio'}`)
      
      setCartData({
        tenantSlug: null,
        tenantName: null,
        items: []
      })
    }
  }, [currentTenantSlug, currentTenantName, tenantSlug, tenantName, items.length])

  const calculateItemSubtotal = useCallback((product, modifiers, quantity) => {
    let total = product.price
    modifiers.forEach(mod => {
      total += mod.price_delta
    })
    return total * quantity
  }, [])

  const getAvailableStock = useCallback((product, modifiers = []) => {
    if (product.is_unlimited_stock) return Infinity
    
    const existingItem = items.find(item => {
      return item.product.id === product.id && 
             JSON.stringify(item.modifiers) === JSON.stringify(modifiers)
    })
    
    const inCart = existingItem ? existingItem.quantity : 0
    return product.stock_quantity - inCart
  }, [items])

  // ✅ MODIFICADO: Valida tenant antes de agregar
  const addItem = useCallback((product, quantity, modifiers = [], newTenantSlug = null, newTenantName = null) => {
    // Validación de stock
    const available = getAvailableStock(product, modifiers)
    
    if (available < quantity) {
      showError(`Solo quedan ${product.stock_quantity} unidades disponibles. Ya tienes ${product.stock_quantity - available} en el carrito.`)
      return false
    }

    const itemId = `${product.id}-${JSON.stringify(modifiers)}`
    
    setCartData(prevData => {
      // ✅ Si el carrito está vacío, establecer el tenant
      if (prevData.items.length === 0) {
        const newItem = {
          id: itemId,
          product,
          quantity,
          modifiers,
          subtotal: calculateItemSubtotal(product, modifiers, quantity)
        }
        
        return {
          tenantSlug: newTenantSlug,
          tenantName: newTenantName,
          items: [newItem]
        }
      }

      // ✅ Si ya hay items, agregar o actualizar
      const existingIndex = prevData.items.findIndex(item => {
        return item.product.id === product.id && 
               JSON.stringify(item.modifiers) === JSON.stringify(modifiers)
      })

      if (existingIndex >= 0) {
        // Actualizar cantidad del item existente
        const newItems = [...prevData.items]
        newItems[existingIndex].quantity += quantity
        newItems[existingIndex].subtotal = calculateItemSubtotal(
          product, 
          modifiers, 
          newItems[existingIndex].quantity
        )
        
        return {
          ...prevData,
          items: newItems
        }
      } else {
        // Agregar nuevo item
        const newItem = {
          id: itemId,
          product,
          quantity,
          modifiers,
          subtotal: calculateItemSubtotal(product, modifiers, quantity)
        }
        
        return {
          ...prevData,
          items: [...prevData.items, newItem]
        }
      }
    })
    
    return true
  }, [getAvailableStock, calculateItemSubtotal])

  const updateQuantity = useCallback((itemId, newQuantity) => {
    if (newQuantity <= 0) {
      setCartData(prevData => ({
        ...prevData,
        items: prevData.items.filter(item => item.id !== itemId)
      }))
      return
    }

    setCartData(prevData => {
      const item = prevData.items.find(i => i.id === itemId)
      if (!item) return prevData

      if (!item.product.is_unlimited_stock && newQuantity > item.product.stock_quantity) {
        showError(`Solo hay ${item.product.stock_quantity} unidades disponibles de ${item.product.name}`)
        return prevData
      }

      return {
        ...prevData,
        items: prevData.items.map(item => {
          if (item.id === itemId) {
            return {
              ...item,
              quantity: newQuantity,
              subtotal: calculateItemSubtotal(item.product, item.modifiers, newQuantity)
            }
          }
          return item
        })
      }
    })
  }, [calculateItemSubtotal])

  const removeItem = useCallback((itemId) => {
    setCartData(prevData => ({
      ...prevData,
      items: prevData.items.filter(item => item.id !== itemId)
    }))
  }, [])

  const clearCart = useCallback(() => {
    setCartData({ tenantSlug: null, tenantName: null, items: [] })
    localStorage.removeItem(CART_STORAGE_KEY)
  }, [])

  const dataValue = useMemo(() => ({
    items,
    isOpen,
    tenantSlug,
    tenantName,
    getSubtotal: () => items.reduce((sum, item) => sum + item.subtotal, 0),
    getTotalItems: () => items.reduce((sum, item) => sum + item.quantity, 0),
    getAvailableStock
  }), [items, isOpen, tenantSlug, tenantName, getAvailableStock])

  const actionsValue = useMemo(() => ({
    setIsOpen,
    addItem,
    updateQuantity,
    removeItem,
    clearCart
  }), [addItem, updateQuantity, removeItem, clearCart])

  return (
    <CartDataContext.Provider value={dataValue}>
      <CartActionsContext.Provider value={actionsValue}>
        {children}
      </CartActionsContext.Provider>
    </CartDataContext.Provider>
  )
}

export function useCartData() {
  const context = useContext(CartDataContext)
  if (!context) {
    throw new Error('useCartData debe usarse dentro de CartProvider')
  }
  return context
}

export function useCartActions() {
  const context = useContext(CartActionsContext)
  if (!context) {
    throw new Error('useCartActions debe usarse dentro de CartProvider')
  }
  return context
}

export function useCart() {
  return {
    ...useCartData(),
    ...useCartActions()
  }
}