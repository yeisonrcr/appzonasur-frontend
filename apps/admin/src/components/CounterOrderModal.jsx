import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import Button from '@shared/components/Button'
import Input from '@shared/components/Input'

function CounterOrderModal({ isOpen, onClose, onSuccess }) {
  const { slug } = useParams()
  
  const [step, setStep] = useState(1) // 1: Productos, 2: Descuento/Pago, 3: Confirmar
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  
  // Productos disponibles
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  
  // Items del pedido
  const [orderItems, setOrderItems] = useState([])
  
  // Cliente
  const [clientName, setClientName] = useState('')
  
  // Descuento
  const [discountType, setDiscountType] = useState('none') // none, coupon, manual
  const [couponCode, setCouponCode] = useState('')
  const [couponData, setCouponData] = useState(null)
  const [validatingCoupon, setValidatingCoupon] = useState(false)
  const [manualDiscountType, setManualDiscountType] = useState('PERCENT')
  const [manualDiscountValue, setManualDiscountValue] = useState('')
  
  // Propina
  const [tipPercent, setTipPercent] = useState(0)
  
  // Método de pago
  const [paymentMethod, setPaymentMethod] = useState('EFECTIVO')

  useEffect(() => {
    if (isOpen) {
      loadProducts()
      resetForm()
    }
  }, [isOpen])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const headers = { 'Authorization': `Bearer ${token}` }

      const [productsRes, categoriesRes] = await Promise.all([
        fetch(`/api/v1/${slug}/products`, { headers }),
        fetch(`/api/v1/${slug}/categories`, { headers })
      ])

      if (productsRes.ok) {
        const data = await productsRes.json()
        setProducts(data.filter(p => p.is_active))
      }

      if (categoriesRes.ok) {
        const data = await categoriesRes.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Error cargando productos:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setStep(1)
    setOrderItems([])
    setClientName('')
    setDiscountType('none')
    setCouponCode('')
    setCouponData(null)
    setManualDiscountValue('')
    setTipPercent(0)
    setPaymentMethod('EFECTIVO')
    setSearchTerm('')
    setSelectedCategory('all')
  }

  const addProductToOrder = (product) => {
    const existingIndex = orderItems.findIndex(item => item.product.id === product.id)
    
    if (existingIndex >= 0) {
      const newItems = [...orderItems]
      newItems[existingIndex].quantity += 1
      setOrderItems(newItems)
    } else {
      setOrderItems([...orderItems, {
        product,
        quantity: 1,
        modifiers: []
      }])
    }
  }

  const updateItemQuantity = (index, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(index)
      return
    }

    const newItems = [...orderItems]
    newItems[index].quantity = newQuantity
    setOrderItems(newItems)
  }

  const removeItem = (index) => {
    setOrderItems(orderItems.filter((_, i) => i !== index))
  }

  const calculateSubtotal = () => {
    return orderItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
  }

  const calculateDiscount = () => {
    const subtotal = calculateSubtotal()
    
    if (discountType === 'coupon' && couponData) {
      return couponData.discount_amount
    }
    
    if (discountType === 'manual' && manualDiscountValue) {
      const value = parseFloat(manualDiscountValue)
      if (manualDiscountType === 'PERCENT') {
        return Math.min((subtotal * value) / 100, subtotal)
      } else {
        return Math.min(value, subtotal)
      }
    }
    
    return 0
  }

  const calculateTip = () => {
    const subtotal = calculateSubtotal()
    return (subtotal * tipPercent) / 100
  }

  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscount() + calculateTip()
  }

  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) return

    setValidatingCoupon(true)

    try {
      const response = await fetch(`/api/v1/${slug}/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode.toUpperCase(),
          subtotal: calculateSubtotal()
        })
      })

      if (response.ok) {
        const data = await response.json()
        setCouponData(data)
        alert('✅ Cupón aplicado')
      } else {
        const error = await response.json()
        alert(error.detail || 'Cupón inválido')
        setCouponData(null)
      }
    } catch (error) {
      console.error('Error validando cupón:', error)
      alert('Error al validar el cupón')
    } finally {
      setValidatingCoupon(false)
    }
  }

  const handleCreateOrder = async () => {
    if (!clientName.trim()) {
      alert('Ingresa el nombre del cliente')
      return
    }

    if (orderItems.length === 0) {
      alert('Agrega al menos un producto')
      return
    }

    setCreating(true)

    try {
      const token = localStorage.getItem('token')
      
      const orderData = {
        type: 'COUNTER',
        table_id: null,
        items: orderItems.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
          modifiers: []
        })),
        coupon_code: discountType === 'coupon' && couponData ? couponCode.toUpperCase() : null,
        tip_percent: tipPercent,
        client_name: clientName,
        payment_method: paymentMethod,
        notes: discountType === 'manual' && manualDiscountValue 
          ? `Descuento manual: ${manualDiscountType === 'PERCENT' ? manualDiscountValue + '%' : '₡' + manualDiscountValue}`
          : null
      }

      const response = await fetch(`/api/v1/${slug}/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      })

      if (response.ok) {
        const order = await response.json()
        
        // Cambiar estado a ACCEPTED inmediatamente
        await fetch(`/api/v1/${slug}/admin/orders/${order.id}/status`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: 'ACCEPTED' })
        })

        alert('✅ Pedido creado exitosamente')
        onSuccess()
        onClose()
      } else {
        const error = await response.json()
        alert(error.detail || 'Error al crear pedido')
      }
    } catch (error) {
      console.error('Error creando pedido:', error)
      alert('Error al crear el pedido')
    } finally {
      setCreating(false)
    }
  }

  const filteredProducts = products.filter(product => {
    if (selectedCategory !== 'all' && product.category_id !== parseInt(selectedCategory)) {
      return false
    }
    
    if (searchTerm && !product.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }
    
    return true
  })

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              Nuevo Pedido Mostrador
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Paso {step} de 3
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 1 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Productos disponibles */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Productos Disponibles</h4>
                
                <div className="mb-4">
                  <Input
                    placeholder="Buscar producto..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="flex space-x-2 mb-4 overflow-x-auto">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
                      selectedCategory === 'all'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    Todas
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id.toString())}
                      className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
                        selectedCategory === cat.id.toString()
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {loading ? (
                    <p className="text-center text-gray-500 py-8">Cargando productos...</p>
                  ) : filteredProducts.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No hay productos disponibles</p>
                  ) : (
                    filteredProducts.map(product => (
                      <button
                        key={product.id}
                        onClick={() => addProductToOrder(product)}
                        className="w-full flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="text-left">
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-sm text-gray-600">₡{product.price.toLocaleString()}</p>
                        </div>
                        <span className="text-2xl">+</span>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Items del pedido */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Items del Pedido</h4>
                
                {orderItems.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <p>No hay items agregados</p>
                    <p className="text-sm mt-2">Selecciona productos de la izquierda</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orderItems.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.product.name}</p>
                          <p className="text-sm text-gray-600">
                            ₡{item.product.price.toLocaleString()} c/u
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => updateItemQuantity(index, item.quantity - 1)}
                              className="w-8 h-8 rounded-full bg-white border flex items-center justify-center hover:bg-gray-100"
                            >
                              −
                            </button>
                            <span className="w-8 text-center font-semibold">{item.quantity}</span>
                            <button
                              onClick={() => updateItemQuantity(index, item.quantity + 1)}
                              className="w-8 h-8 rounded-full bg-white border flex items-center justify-center hover:bg-gray-100"
                            >
                              +
                            </button>
                          </div>
                          
                          <button
                            onClick={() => removeItem(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    <div className="border-t pt-3">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Subtotal:</span>
                        <span className="text-primary-600">₡{calculateSubtotal().toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Datos del Cliente</h4>
                <Input
                  label="Nombre del Cliente"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Nombre completo"
                  required
                />
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Descuento</h4>
                <div className="space-y-3">
                  <label className="flex items-center p-3 border rounded-lg cursor-pointer">
                    <input
                      type="radio"
                      name="discount"
                      checked={discountType === 'none'}
                      onChange={() => {
                        setDiscountType('none')
                        setCouponData(null)
                      }}
                      className="mr-3"
                    />
                    <span className="font-medium">Sin descuento</span>
                  </label>

                  <label className="flex items-center p-3 border rounded-lg cursor-pointer">
                    <input
                      type="radio"
                      name="discount"
                      checked={discountType === 'coupon'}
                      onChange={() => setDiscountType('coupon')}
                      className="mr-3"
                    />
                    <span className="font-medium">Aplicar Cupón</span>
                  </label>

                  {discountType === 'coupon' && (
                    <div className="ml-8 flex gap-2">
                      <Input
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Código de cupón"
                      />
                      <Button onClick={handleValidateCoupon} loading={validatingCoupon}>
                        Aplicar
                      </Button>
                    </div>
                  )}

                  {couponData && (
                    <div className="ml-8 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800">
                        ✓ Cupón aplicado: {couponData.discount_type === 'PERCENT' 
                          ? `${couponData.discount_value}%` 
                          : `₡${couponData.discount_amount}`} de descuento
                      </p>
                    </div>
                  )}

                  <label className="flex items-center p-3 border rounded-lg cursor-pointer">
                    <input
                      type="radio"
                      name="discount"
                      checked={discountType === 'manual'}
                      onChange={() => setDiscountType('manual')}
                      className="mr-3"
                    />
                    <span className="font-medium">Descuento Manual</span>
                  </label>

                  {discountType === 'manual' && (
                    <div className="ml-8 grid grid-cols-2 gap-3">
                      <select
                        value={manualDiscountType}
                        onChange={(e) => setManualDiscountType(e.target.value)}
                        className="px-3 py-2 border rounded-lg"
                      >
                        <option value="PERCENT">Porcentaje (%)</option>
                        <option value="FIXED">Monto Fijo (₡)</option>
                      </select>
                      <Input
                        type="number"
                        value={manualDiscountValue}
                        onChange={(e) => setManualDiscountValue(e.target.value)}
                        placeholder={manualDiscountType === 'PERCENT' ? '10' : '1000'}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Propina</h4>
                <div className="grid grid-cols-3 gap-2">
                  {[0, 5, 10, 15, 20].map(percent => (
                    <button
                      key={percent}
                      onClick={() => setTipPercent(percent)}
                      className={`py-2 px-4 rounded-lg font-medium ${
                        tipPercent === percent
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {percent}%
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Método de Pago</h4>
                <div className="space-y-2">
                  {['EFECTIVO', 'SINPE', 'TARJETA'].map(method => (
                    <label key={method} className="flex items-center p-3 border rounded-lg cursor-pointer">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === method}
                        onChange={() => setPaymentMethod(method)}
                        className="mr-3"
                      />
                      <span className="font-medium">{method}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="max-w-2xl mx-auto">
              <h4 className="font-semibold text-gray-900 mb-4">Resumen del Pedido</h4>
              
              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Cliente</p>
                  <p className="font-semibold text-gray-900">{clientName}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Items</p>
                  <div className="space-y-1">
                    {orderItems.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span>{item.quantity}x {item.product.name}</span>
                        <span className="font-medium">
                          ₡{(item.product.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span>₡{calculateSubtotal().toLocaleString()}</span>
                  </div>
                  
                  {calculateDiscount() > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>
                        Descuento 
                        {discountType === 'coupon' && ` (${couponCode})`}
                      </span>
                      <span>-₡{calculateDiscount().toLocaleString()}</span>
                    </div>
                  )}
                  
                  {calculateTip() > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Propina ({tipPercent}%)</span>
                      <span>₡{calculateTip().toLocaleString()}</span>
                    </div>
                  )}
                  
                  <div className="border-t pt-2 flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary-600">₡{calculateTotal().toLocaleString()}</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm text-gray-600">Método de Pago</p>
                  <p className="font-semibold text-gray-900">{paymentMethod}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t flex justify-between">
          <Button
            variant="outline"
            onClick={() => {
              if (step === 1) {
                onClose()
              } else {
                setStep(step - 1)
              }
            }}
          >
            {step === 1 ? 'Cancelar' : 'Anterior'}
          </Button>

          <Button
            onClick={() => {
              if (step === 3) {
                handleCreateOrder()
              } else if (step === 2) {
                if (!clientName.trim()) {
                  alert('Ingresa el nombre del cliente')
                  return
                }
                setStep(3)
              } else {
                if (orderItems.length === 0) {
                  alert('Agrega al menos un producto')
                  return
                }
                setStep(2)
              }
            }}
            loading={creating}
            disabled={step === 1 && orderItems.length === 0}
          >
            {step === 3 ? 'Crear Pedido' : 'Siguiente'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default CounterOrderModal