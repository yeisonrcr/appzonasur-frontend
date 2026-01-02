// CheckoutPage.jsx
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
  
  const [tipMode, setTipMode] = useState('PERCENT')
  const [tipPercent, setTipPercent] = useState(0)
  const [customTip, setCustomTip] = useState('')

  const [loading, setLoading] = useState(false)
  const [validatingCoupon, setValidatingCoupon] = useState(false)
  const [stockErrors, setStockErrors] = useState([])

  const [showTermsModal, setShowTermsModal] = useState(false)
  const [showMapModal, setShowMapModal] = useState(false)
  const [deliveryLocation, setDeliveryLocation] = useState(null)
  const [loadingLocation, setLoadingLocation] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
    if (items.length === 0) return navigate(`/${slug}`)
    
    if (cartTenantSlug && cartTenantSlug !== slug) {
      showError(`Carrito de otro negocio vaciado.`)
      clearCart()
      navigate(`/${slug}`)
    }

    if (isAuthenticated && client?.name) {
      setFormData(prev => ({ ...prev, client_name: client.name }))
    }

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

  useEffect(() => {
    if (tenant && !formData.payment_method) {
      const defaultPayment = tenant.accepts_cash ? 'CASH' : tenant.accepts_sinpe ? 'SINPE' : 'CARD'
      setFormData(prev => ({ ...prev, payment_method: defaultPayment }))
    }
  }, [tenant])

  useEffect(() => {
    const errors = items.filter(item => !item.product.is_unlimited_stock && item.quantity > item.product.stock_quantity)
      .map(item => ({ productName: item.product.name, requested: item.quantity, available: item.product.stock_quantity }))
    setStockErrors(errors)
  }, [items])

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
    <div className="min-h-screen bg-neutral-50 pb-28 md:pb-12">
      <TermsModal isOpen={showTermsModal} onAccept={handleAcceptTerms} onDecline={() => { setShowTermsModal(false); setFormData(p => ({...p, type: 'COUNTER'})); }} />
      <LocationMapModal isOpen={showMapModal} initialPosition={deliveryLocation ? [parseFloat(deliveryLocation.lat), parseFloat(deliveryLocation.lon)] : null} onConfirm={handleConfirmLocation} onClose={() => setShowMapModal(false)} />

      <div className="bg-white border-b border-neutral-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-xl mx-auto px-4 py-3 flex items-center gap-2">
          <button onClick={() => navigate(`/${slug}`)} className="w-9 h-9 flex items-center justify-center rounded-full bg-neutral-100 hover:bg-neutral-200 transition-all">
            <svg className="w-5 h-5 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h1 className="text-base font-bold text-neutral-900">Finalizar Pedido</h1>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 pt-4">
        <form id="checkout-form" onSubmit={handleSubmit} className="space-y-4">
          
          {stockErrors.length > 0 && (
            <div className="bg-red-50 border-l-4 border-red-600 p-3 rounded-r-lg shadow-sm">
              <h4 className="font-bold text-red-900 text-xs mb-1.5">⚠️ Ajustar pedido:</h4>
              <ul className="text-[11px] text-red-800 space-y-0.5">
                {stockErrors.map((e, i) => <li key={i}>• {e.productName}: Pediste {e.requested}, quedan {e.available}</li>)}
              </ul>
            </div>
          )}

          <section className="bg-white rounded-xl p-4 shadow-sm border border-neutral-100 space-y-3">
            <h2 className="text-sm font-bold text-neutral-900 border-b border-neutral-100 pb-2">Tus Datos</h2>
            <Input label="Nombre completo" value={formData.client_name} onChange={(e) => setFormData({...formData, client_name: e.target.value})} placeholder="Ej: Juan Pérez" required />
            
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1.5">Tipo de entrega</label>
              <div className="grid grid-cols-2 gap-2">
                {[ { id: 'COUNTER', icon: '🪧', label: 'Para Recoger' }, { id: 'EXPRESS', icon: '🚚', label: 'Delivery' } ].map(opt => (
                  <label key={opt.id} className={`border-2 rounded-lg p-2.5 cursor-pointer flex flex-col items-center transition-all ${formData.type === opt.id ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500' : 'border-neutral-200 hover:border-neutral-300'}`}>
                    <input type="radio" name="type" value={opt.id} checked={formData.type === opt.id} onChange={(e) => setFormData({...formData, type: e.target.value})} className="sr-only" />
                    <span className="text-xl mb-0.5">{opt.icon}</span>
                    <span className="font-bold text-xs text-neutral-800">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {formData.type === 'EXPRESS' && (
              <div className="animate-fade-in bg-neutral-50 p-3 rounded-lg border border-neutral-200">
                <label className="block text-xs font-medium text-neutral-700 mb-2">📍 Ubicación de entrega</label>
                {deliveryLocation ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="bg-green-100 p-1.5 rounded-full text-green-700 text-sm">✓</div>
                      <div>
                        <p className="text-xs font-bold text-green-900">Ubicación guardada</p>
                        <p className="text-[10px] text-green-700">Lista para enviar</p>
                      </div>
                    </div>
                    <button type="button" onClick={() => setShowMapModal(true)} className="text-xs font-bold text-primary-700 hover:text-primary-800 underline bg-white px-2 py-1 rounded-md border border-primary-200 shadow-sm">Editar</button>
                  </div>
                ) : (
                  <button type="button" onClick={() => !loadingLocation && obtenerUbicacionInicial()} disabled={loadingLocation} className="w-full py-3 border-2 border-dashed border-primary-300 bg-white text-primary-700 rounded-lg font-semibold hover:bg-primary-50 transition-all flex flex-col items-center justify-center gap-1.5 group text-xs">
                    {loadingLocation ? <span className="animate-pulse">Obteniendo GPS...</span> : <> <span className="text-xl group-hover:scale-110 transition-transform">🗺️</span> <span>Seleccionar en Mapa</span> </>}
                  </button>
                )}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1.5">Notas adicionales</label>
              <textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} placeholder="Ej: Sin cebolla, casa portón negro..." rows={2} className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 text-xs resize-none" />
            </div>
          </section>

          <section className="bg-white rounded-xl p-4 shadow-sm border border-neutral-100">
            <h2 className="text-sm font-bold text-neutral-900 mb-3 border-b border-neutral-100 pb-2">Resumen</h2>
            <div className="space-y-2 mb-3">
              {items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-xs">
                  <div className="pr-3">
                    <span className="font-semibold text-neutral-900 block">{item.quantity}x {item.product.name}</span>
                    {item.modifiers?.map((m, i) => <div key={i} className="text-[10px] text-neutral-500">+ {m.option_name}</div>)}
                  </div>
                  <span className="font-medium text-neutral-900">₡{item.subtotal.toLocaleString()}</span>
                </div>
              ))}
            </div>
            
            <div className="border-t border-neutral-100 pt-3 pb-2">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xs font-bold text-neutral-900">Propina</h3>
                <span className="text-[10px] text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded">100% para el staff</span>
              </div>
              <div className="grid grid-cols-5 gap-1.5 mb-2">
                {[0, 10, 15, 20].map(p => (
                  <button key={p} type="button" onClick={() => { setTipMode('PERCENT'); setTipPercent(p); }} className={`py-1.5 rounded-md text-xs font-bold transition-all ${tipMode === 'PERCENT' && tipPercent === p ? 'bg-primary-600 text-white shadow-sm' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>{p}%</button>
                ))}
                <button type="button" onClick={() => { setTipMode('FIXED'); setCustomTip(''); }} className={`py-1.5 rounded-md text-xs font-bold transition-all ${tipMode === 'FIXED' ? 'bg-primary-600 text-white shadow-sm' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>Otro</button>
              </div>
              
              {tipMode === 'FIXED' && (
                <Input type="number" placeholder="Monto en colones" value={customTip} onChange={(e) => setCustomTip(e.target.value)} icon={<span className="text-neutral-500 font-bold">₡</span>} />
              )}
            </div>

            <div className="border-t border-neutral-100 pt-3 pb-2">
              <h3 className="text-xs font-bold text-neutral-900 mb-1.5">Cupón</h3>
              <div className="flex gap-1.5">
                <Input value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="CÓDIGO" disabled={!!couponData} className="flex-1" />
                <Button type="button" onClick={handleValidateCoupon} loading={validatingCoupon} disabled={!couponCode || !!couponData} variant="outline" size="sm" className="px-3">{couponData ? 'Quitar' : 'Aplicar'}</Button>
              </div>
              {couponError && <p className="text-[10px] text-red-600 mt-1.5">{couponError}</p>}
              {couponData && <p className="text-[10px] text-green-700 mt-1.5 font-bold bg-green-50 p-1.5 rounded">✓ Descuento aplicado</p>}
            </div>

            <div className="border-t border-dashed border-neutral-300 pt-2.5 space-y-0.5 text-xs mt-3">
              <div className="flex justify-between text-neutral-600"><span>Subtotal</span><span>₡{subtotal.toLocaleString()}</span></div>
              {discount > 0 && <div className="flex justify-between text-green-600 font-medium"><span>Descuento</span><span>-₡{discount.toLocaleString()}</span></div>}
              {tip > 0 && <div className="flex justify-between text-neutral-600"><span>Propina</span><span>₡{tip.toLocaleString()}</span></div>}
            </div>
          </section>

          <section className="bg-white rounded-xl p-4 shadow-sm border border-neutral-100">
            <h2 className="text-sm font-bold text-neutral-900 mb-3 border-b border-neutral-100 pb-2">Método de Pago</h2>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {tenant?.accepts_cash && <PaymentOption value="CASH" icon="💵" label="Efectivo" selected={formData.payment_method === 'CASH'} onSelect={(v) => setFormData({...formData, payment_method: v})} />}
              {tenant?.accepts_sinpe && <PaymentOption value="SINPE" icon="📱" label="SINPE" selected={formData.payment_method === 'SINPE'} onSelect={(v) => setFormData({...formData, payment_method: v})} />}
              {tenant?.accepts_card && <PaymentOption value="CARD" icon="💳" label="Tarjeta" selected={formData.payment_method === 'CARD'} onSelect={(v) => setFormData({...formData, payment_method: v})} />}
            </div>

            {formData.payment_method === 'SINPE' && tenant?.sinpe_number && (
              <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-r-lg animate-slide-down">
                <p className="text-xs text-blue-900 font-bold mb-0.5">Transferir ₡{total.toLocaleString()} a:</p>
                <p className="text-xl font-black text-blue-800 tracking-wider mb-1.5">{tenant.sinpe_number}</p>
                <p className="text-[10px] text-blue-700 opacity-90">Al finalizar se abrirá WhatsApp con el detalle.</p>
              </div>
            )}
          </section>
        </form>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 p-3 shadow-[0_-2px_12px_rgba(0,0,0,0.08)] z-20">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider">Total Final</span>
            <span className="text-xl font-black text-neutral-900">₡{total.toLocaleString()}</span>
          </div>
          
          <Button 
            form="checkout-form" 
            type="submit" 
            size="md" 
            loading={loading} 
            disabled={stockErrors.length > 0 || (formData.type === 'EXPRESS' && !deliveryLocation)} 
            className={`flex-1 font-bold shadow-md transition-all transform active:scale-95 ${
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
  <label className={`border-2 rounded-lg p-2.5 cursor-pointer flex flex-col items-center justify-center transition-all h-20 ${selected ? 'border-neutral-800 bg-neutral-50 ring-1 ring-neutral-800 transform scale-105' : 'border-neutral-200 hover:bg-neutral-50'}`}>
    <input type="radio" name="payment_method" value={value} checked={selected} onChange={() => onSelect(value)} className="sr-only" />
    <span className="text-2xl mb-1">{icon}</span>
    <span className="font-bold text-[10px] text-neutral-700">{label}</span>
  </label>
)

export default CheckoutPage