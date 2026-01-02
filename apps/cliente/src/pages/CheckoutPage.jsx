import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTenant } from '@shared/context/TenantContext'
import { useCart } from '@shared/context/CartContext'
import { useAuth } from '@shared/context/AuthContext'
import { validateCoupon, createOrder, getActiveOrder } from '@shared/services/api'
import Button from '@shared/components/Button'
import Input from '@shared/components/Input'
import TermsModal from '@shared/components/TermsModal'
import LocationMapModal from '@shared/components/LocationMapModal'
import { showSuccess, showError, showPromise } from '@shared/services/alerts'

function CheckoutPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { tenant } = useTenant()
  const { items, getSubtotal, clearCart, tenantSlug: cartTenantSlug } = useCart()
  const { client, isAuthenticated } = useAuth()
    
  const [formData, setFormData] = useState({
    type: 'COUNTER',
    client_name: '',
    delivery_address: '',
    notes: '',
    payment_method: ''
  })
    
  const [couponCode, setCouponCode] = useState('')
  const [couponData, setCouponData] = useState(null)
  const [couponError, setCouponError] = useState('')
  
  // Lógica de Propina
  const [tipMode, setTipMode] = useState('PERCENT') // 'PERCENT' | 'FIXED'
  const [tipPercent, setTipPercent] = useState(0)
  const [customTip, setCustomTip] = useState('')

  const [loading, setLoading] = useState(false)
  const [validatingCoupon, setValidatingCoupon] = useState(false)
  const [stockErrors, setStockErrors] = useState([])

  const [showTermsModal, setShowTermsModal] = useState(false)
  const [showMapModal, setShowMapModal] = useState(false)
  const [deliveryLocation, setDeliveryLocation] = useState(null)
  const [loadingLocation, setLoadingLocation] = useState(false)

  // Inicialización
  useEffect(() => {
    window.scrollTo(0, 0)
    if (items.length === 0) return navigate(`/${slug}`)
    
    // Validar carrito de otro negocio
    if (cartTenantSlug && cartTenantSlug !== slug) {
      showError(`Carrito de otro negocio vaciado.`)
      clearCart()
      navigate(`/${slug}`)
    }

    if (isAuthenticated && client?.name) {
      setFormData(prev => ({ ...prev, client_name: client.name }))
    }

    // Verificar orden activa para no duplicar
    const checkActiveOrder = async () => {
      const token = localStorage.getItem('token')
      if (!token) return
      try {
        const activeOrder = await getActiveOrder(slug, null)
        if (activeOrder) navigate(`/${slug}/pedido/${activeOrder.public_id}`)
      } catch (error) {}
    }
    checkActiveOrder()
  }, [items.length, slug, cartTenantSlug, isAuthenticated, client])

  // Método de pago por defecto
  useEffect(() => {
    if (tenant && !formData.payment_method) {
      const defaultPayment = tenant.accepts_cash ? 'CASH' : tenant.accepts_sinpe ? 'SINPE' : 'CARD'
      setFormData(prev => ({ ...prev, payment_method: defaultPayment }))
    }
  }, [tenant])

  // Validar Stock en tiempo real
  useEffect(() => {
    const errors = items.filter(item => !item.product.is_unlimited_stock && item.quantity > item.product.stock_quantity)
      .map(item => ({ productName: item.product.name, requested: item.quantity, available: item.product.stock_quantity }))
    setStockErrors(errors)
  }, [items])

  // Resetear ubicación al cambiar tipo
  useEffect(() => {
    if (formData.type === 'COUNTER') {
      setDeliveryLocation(null)
      setFormData(prev => ({ ...prev, delivery_address: '' }))
    } else {
      handleDeliverySelected()
    }
  }, [formData.type])

  const handleDeliverySelected = () => {
    const hasAcceptedTerms = localStorage.getItem('delivery_terms_accepted') === 'true'
    if (!hasAcceptedTerms) return setShowTermsModal(true)
    if (!deliveryLocation) obtenerUbicacionInicial()
  }

  const handleAcceptTerms = () => {
    localStorage.setItem('delivery_terms_accepted', 'true')
    setShowTermsModal(false)
    showSuccess('Términos aceptados')
    obtenerUbicacionInicial()
  }

  const obtenerUbicacionInicial = () => {
    if (!navigator.geolocation) return showError('Tu navegador no soporta GPS')
    setLoadingLocation(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLoadingLocation(false)
        setShowMapModal(true)
        setDeliveryLocation({ lat: position.coords.latitude.toFixed(6), lon: position.coords.longitude.toFixed(6) })
      },
      (error) => {
        setLoadingLocation(false)
        setShowMapModal(true)
        // Coordenadas default (San José) si falla
        setDeliveryLocation({ lat: '9.928100', lon: '-84.090700' }) 
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  const handleConfirmLocation = (coords) => {
    setDeliveryLocation(coords)
    setFormData(prev => ({ ...prev, delivery_address: `Lat: ${coords.lat}, Lon: ${coords.lon}` }))
    setShowMapModal(false)
    showSuccess('📍 Ubicación guardada')
  }

  // Cálculos Financieros
  const subtotal = getSubtotal()
  const discount = couponData ? couponData.discount_amount : 0
  const tip = tipMode === 'PERCENT' ? (subtotal * tipPercent) / 100 : (parseFloat(customTip) || 0)
  const total = subtotal - discount + tip

  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) return
    setValidatingCoupon(true)
    setCouponError('')
    try {
      const result = await validateCoupon(slug, couponCode.toUpperCase(), subtotal)
      setCouponData(result)
    } catch (error) {
      setCouponError(error.message || 'Cupón inválido')
      setCouponData(null)
    } finally {
      setValidatingCoupon(false)
    }
  }

  // --- GENERADOR DE MENSAJE WHATSAPP ---
  const generateWhatsAppMessage = () => {
    let msg = `Hola *${tenant?.name || 'Soda'}*, quiero confirmar mi pedido SINPE:\n\n`
    msg += `👤 *Cliente:* ${formData.client_name}\n`
    msg += `🚚 *Tipo:* ${formData.type === 'EXPRESS' ? 'Delivery' : 'Para Recoger'}\n`
    msg += `────────────────\n`
    
    items.forEach(item => {
      msg += `▪️ ${item.quantity}x ${item.product.name}\n`
      if(item.modifiers) {
        item.modifiers.forEach(m => msg += `   + ${m.option_name}\n`)
      }
    })
    
    msg += `────────────────\n`
    msg += `💰 *TOTAL A PAGAR: ₡${total.toLocaleString()}*\n`
    
    if (formData.type === 'EXPRESS' && deliveryLocation) {
      msg += `\n📍 *Ubicación GPS:*\n`
      msg += `https://www.google.com/maps/search/?api=1&query=${deliveryLocation.lat},${deliveryLocation.lon}\n`
    }
    
    if (formData.notes) msg += `\n📝 *Notas:* ${formData.notes}`
    
    return encodeURIComponent(msg)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (cartTenantSlug && cartTenantSlug !== slug) return showError('Error de negocio en carrito')
    if (stockErrors.length > 0) return showError('Revisa el stock de los productos')
    if (!formData.client_name.trim()) return showError('Ingresa tu nombre')
    if (formData.type === 'EXPRESS' && !deliveryLocation) return showError('Falta la ubicación de entrega')

    setLoading(true)
    try {
      const orderData = {
        ...formData,
        table_id: null,
        items: items.map(i => ({ product_id: i.product.id, quantity: i.quantity, modifiers: i.modifiers })),
        coupon_code: couponData ? couponCode.toUpperCase() : null,
        tip_percent: tipMode === 'PERCENT' ? tipPercent : 0,
        tip_amount: tipMode === 'FIXED' ? tip : 0,
        notes: formData.notes || null,
        payment_method: formData.payment_method
      }
        
      const order = await showPromise(createOrder(slug, orderData), {
        loading: 'Procesando pedido...',
        success: '¡Pedido registrado!',
        error: 'Error al procesar'
      })

      // ABRIR WHATSAPP SI ES SINPE
      if (formData.payment_method === 'SINPE') {
        const phone = tenant?.sinpe_number ? tenant.sinpe_number.replace(/[^0-9]/g, '') : '' 
        if (phone) {
          const whatsappUrl = `https://wa.me/${phone}?text=${generateWhatsAppMessage()}`
          window.open(whatsappUrl, '_blank')
        }
      }

      clearCart()
      navigate(`/${slug}/pedido/${order.public_id}`)
    } catch (error) {
      showError(error.message || 'Error al crear pedido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 pb-36 md:pb-12">
      <TermsModal isOpen={showTermsModal} onAccept={handleAcceptTerms} onDecline={() => { setShowTermsModal(false); setFormData(p => ({...p, type: 'COUNTER'})); }} />
      <LocationMapModal isOpen={showMapModal} initialPosition={deliveryLocation ? [parseFloat(deliveryLocation.lat), parseFloat(deliveryLocation.lon)] : null} onConfirm={handleConfirmLocation} onClose={() => setShowMapModal(false)} />

      {/* Header */}
      <div className="bg-white border-b border-neutral-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-xl mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => navigate(`/${slug}`)} className="w-10 h-10 flex items-center justify-center rounded-full bg-neutral-100 hover:bg-neutral-200 transition-all">
            <svg className="w-6 h-6 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h1 className="text-xl font-bold text-neutral-900">Finalizar Pedido</h1>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 pt-6">
        <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
          
          {/* Alertas de Stock */}
          {stockErrors.length > 0 && (
            <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded-r-lg shadow-sm">
              <h4 className="font-bold text-red-900 text-sm mb-2">⚠️ Ajustar pedido:</h4>
              <ul className="text-xs text-red-800 space-y-1">
                {stockErrors.map((e, i) => <li key={i}>• {e.productName}: Pediste {e.requested}, quedan {e.available}</li>)}
              </ul>
            </div>
          )}

          {/* Datos Cliente */}
          <section className="bg-white rounded-2xl p-5 shadow-soft border border-neutral-100 space-y-5">
            <h2 className="text-base font-bold text-neutral-900 border-b border-neutral-100 pb-2">Tus Datos</h2>
            <Input label="Nombre completo" value={formData.client_name} onChange={(e) => setFormData({...formData, client_name: e.target.value})} placeholder="Ej: Juan Pérez" required />
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Tipo de entrega</label>
              <div className="grid grid-cols-2 gap-3">
                {[ { id: 'COUNTER', icon: '🏪', label: 'Para Recoger' }, { id: 'EXPRESS', icon: '🚚', label: 'Delivery' } ].map(opt => (
                  <label key={opt.id} className={`border-2 rounded-xl p-3 cursor-pointer flex flex-col items-center transition-all ${formData.type === opt.id ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500' : 'border-neutral-200 hover:border-neutral-300'}`}>
                    <input type="radio" name="type" value={opt.id} checked={formData.type === opt.id} onChange={(e) => setFormData({...formData, type: e.target.value})} className="sr-only" />
                    <span className="text-2xl mb-1">{opt.icon}</span>
                    <span className="font-bold text-sm text-neutral-800">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Selector de Ubicación */}
            {formData.type === 'EXPRESS' && (
              <div className="animate-fade-in bg-neutral-50 p-4 rounded-xl border border-neutral-200">
                <label className="block text-sm font-medium text-neutral-700 mb-3">📍 Ubicación de entrega</label>
                {deliveryLocation ? (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-100 p-2 rounded-full text-green-700 text-lg">✓</div>
                      <div>
                        <p className="text-sm font-bold text-green-900">Ubicación guardada</p>
                        <p className="text-xs text-green-700">Lista para enviar</p>
                      </div>
                    </div>
                    <button type="button" onClick={() => setShowMapModal(true)} className="text-sm font-bold text-primary-700 hover:text-primary-800 underline bg-white px-3 py-1 rounded-lg border border-primary-200 shadow-sm">Editar</button>
                  </div>
                ) : (
                  <button type="button" onClick={() => !loadingLocation && obtenerUbicacionInicial()} disabled={loadingLocation} className="w-full py-4 border-2 border-dashed border-primary-300 bg-white text-primary-700 rounded-xl font-semibold hover:bg-primary-50 transition-all flex flex-col items-center justify-center gap-2 group">
                    {loadingLocation ? <span className="text-sm animate-pulse">Obteniendo GPS...</span> : <> <span className="text-2xl group-hover:scale-110 transition-transform">🗺️</span> <span>Seleccionar en Mapa</span> </>}
                  </button>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Notas adicionales</label>
              <textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} placeholder="Ej: Sin cebolla, casa portón negro..." rows={2} className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 text-sm resize-none" />
            </div>
          </section>

          {/* Resumen */}
          <section className="bg-white rounded-2xl p-5 shadow-soft border border-neutral-100">
            <h2 className="text-base font-bold text-neutral-900 mb-4 border-b border-neutral-100 pb-2">Resumen</h2>
            <div className="space-y-3 mb-4">
              {items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <div className="pr-4">
                    <span className="font-semibold text-neutral-900 block">{item.quantity}x {item.product.name}</span>
                    {item.modifiers?.map((m, i) => <div key={i} className="text-xs text-neutral-500">+ {m.option_name}</div>)}
                  </div>
                  <span className="font-medium text-neutral-900">₡{item.subtotal.toLocaleString()}</span>
                </div>
              ))}
            </div>
            
            {/* Sección Propina */}
            <div className="border-t border-neutral-100 pt-4 pb-2">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-neutral-900">Propina</h3>
                <span className="text-xs text-neutral-500 bg-neutral-100 px-2 py-1 rounded">100% para el staff</span>
              </div>
              <div className="grid grid-cols-5 gap-2 mb-3">
                {[0, 10, 15, 20].map(p => (
                  <button key={p} type="button" onClick={() => { setTipMode('PERCENT'); setTipPercent(p); }} className={`py-2 rounded-lg text-sm font-bold transition-all ${tipMode === 'PERCENT' && tipPercent === p ? 'bg-primary-600 text-white shadow-md' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>{p}%</button>
                ))}
                <button type="button" onClick={() => { setTipMode('FIXED'); setCustomTip(''); }} className={`py-2 rounded-lg text-sm font-bold transition-all ${tipMode === 'FIXED' ? 'bg-primary-600 text-white shadow-md' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>Otro</button>
              </div>
              
              {tipMode === 'FIXED' && (
                <Input type="number" placeholder="Monto en colones" value={customTip} onChange={(e) => setCustomTip(e.target.value)} icon={<span className="text-neutral-500 font-bold">₡</span>} />
              )}
            </div>

            {/* Cupón */}
            <div className="border-t border-neutral-100 pt-4 pb-2">
              <h3 className="text-sm font-bold text-neutral-900 mb-2">Cupón</h3>
              <div className="flex gap-2">
                <Input value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="CÓDIGO" disabled={!!couponData} className="flex-1" />
                <Button type="button" onClick={handleValidateCoupon} loading={validatingCoupon} disabled={!couponCode || !!couponData} variant="outline" className="px-4">{couponData ? 'Quitar' : 'Aplicar'}</Button>
              </div>
              {couponError && <p className="text-xs text-red-600 mt-2">{couponError}</p>}
              {couponData && <p className="text-xs text-green-700 mt-2 font-bold bg-green-50 p-2 rounded">✓ Descuento aplicado</p>}
            </div>

            <div className="border-t border-dashed border-neutral-300 pt-3 space-y-1 text-sm mt-4">
              <div className="flex justify-between text-neutral-600"><span>Subtotal</span><span>₡{subtotal.toLocaleString()}</span></div>
              {discount > 0 && <div className="flex justify-between text-green-600 font-medium"><span>Descuento</span><span>-₡{discount.toLocaleString()}</span></div>}
              {tip > 0 && <div className="flex justify-between text-neutral-600"><span>Propina</span><span>₡{tip.toLocaleString()}</span></div>}
            </div>
          </section>

          {/* Métodos de Pago */}
          <section className="bg-white rounded-2xl p-5 shadow-soft border border-neutral-100">
            <h2 className="text-base font-bold text-neutral-900 mb-4 border-b border-neutral-100 pb-2">Método de Pago</h2>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {tenant?.accepts_cash && <PaymentOption value="CASH" icon="💵" label="Efectivo" selected={formData.payment_method === 'CASH'} onSelect={(v) => setFormData({...formData, payment_method: v})} />}
              {tenant?.accepts_sinpe && <PaymentOption value="SINPE" icon="📱" label="SINPE" selected={formData.payment_method === 'SINPE'} onSelect={(v) => setFormData({...formData, payment_method: v})} />}
              {tenant?.accepts_card && <PaymentOption value="CARD" icon="💳" label="Tarjeta" selected={formData.payment_method === 'CARD'} onSelect={(v) => setFormData({...formData, payment_method: v})} />}
            </div>

            {formData.payment_method === 'SINPE' && tenant?.sinpe_number && (
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg animate-slide-down">
                <p className="text-sm text-blue-900 font-bold mb-1">Transferir ₡{total.toLocaleString()} a:</p>
                <p className="text-2xl font-black text-blue-800 tracking-wider mb-2">{tenant.sinpe_number}</p>
                <p className="text-xs text-blue-700 opacity-90">Al finalizar se abrirá WhatsApp con el detalle.</p>
              </div>
            )}
          </section>
        </form>
      </div>

      {/* Footer Fijo */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] z-20">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-xs text-neutral-500 uppercase font-bold tracking-wider">Total Final</span>
            <span className="text-2xl font-black text-neutral-900">₡{total.toLocaleString()}</span>
          </div>
          
          <Button 
            form="checkout-form" 
            type="submit" 
            size="lg" 
            loading={loading} 
            disabled={stockErrors.length > 0 || (formData.type === 'EXPRESS' && !deliveryLocation)} 
            className={`flex-1 font-bold shadow-lg transition-all transform active:scale-95 ${
              formData.payment_method === 'SINPE' 
                ? 'bg-green-600 hover:bg-green-700 text-white ring-green-300' 
                : 'bg-primary-600 hover:bg-primary-700'
            }`}
          >
            {formData.type === 'EXPRESS' && !deliveryLocation 
              ? 'Falta Ubicación' 
              : formData.payment_method === 'SINPE'
                ? 'Enviar por WhatsApp 📱'
                : 'Confirmar Pedido ✓'
            }
          </Button>
        </div>
      </div>
    </div>
  )
}

const PaymentOption = ({ value, icon, label, selected, onSelect }) => (
  <label className={`border-2 rounded-xl p-3 cursor-pointer flex flex-col items-center justify-center transition-all h-24 ${selected ? 'border-neutral-800 bg-neutral-50 ring-1 ring-neutral-800 transform scale-105' : 'border-neutral-200 hover:bg-neutral-50'}`}>
    <input type="radio" name="payment_method" value={value} checked={selected} onChange={() => onSelect(value)} className="sr-only" />
    <span className="text-3xl mb-2">{icon}</span>
    <span className="font-bold text-xs text-neutral-700">{label}</span>
  </label>
)

export default CheckoutPage