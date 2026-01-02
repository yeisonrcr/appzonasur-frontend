import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTenant } from '@shared/context/TenantContext'
import { getOrder } from '@shared/services/api'
import LoadingSpinner from '@shared/components/LoadingSpinner'
import Button from '@shared/components/Button'
import { io } from 'socket.io-client'
import { showInfo } from '@shared/services/alerts'

function OrderTrackingPage() {
  const { slug, publicId } = useParams()
  const navigate = useNavigate()
  const { tenant } = useTenant()
  
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [socketConnected, setSocketConnected] = useState(false)
  const socketRef = useRef(null)

  const fetchOrderData = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true)
      const data = await getOrder(slug, publicId)
      setOrder(data)
    } catch (error) {
      console.error('Error actualizando orden:', error)
    } finally {
      if (showLoading) setLoading(false)
    }
  }

  useEffect(() => {
    let mounted = true
    let intervalId = null

    if (slug && publicId) {
      fetchOrderData(true)
      
      intervalId = setInterval(() => {
        if (mounted) fetchOrderData(false)
      }, 5000)

      const token = localStorage.getItem('token')
      const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      
      socketRef.current = io(socketUrl, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 10,
        reconnectionDelay: 1000
      })

      const socket = socketRef.current

      socket.on('connect', () => {
        setSocketConnected(true)
        if (order?.id) {
          socket.emit('join_order_room', { order_id: order.id })
        }
      })

      socket.on('disconnect', () => {
        console.log('❌ Socket desconectado')
        setSocketConnected(false)
      })

      socket.on('order_update', (data) => {
        
        if (order && parseInt(data.order_id) === parseInt(order.id)) {
          setOrder(prevOrder => ({
            ...prevOrder,
            status: data.new_status
          }))

          if (navigator.vibrate) navigator.vibrate([200, 100, 200])

          const statusMessages = {
            ACCEPTED: '✅ ¡Tu pedido fue aceptado!',
            PREPARING: '🍳 Tu pedido está siendo preparado',
            READY: '✅ ¡Tu pedido está listo!',
            ON_THE_WAY: '🛵 Tu pedido va en camino',
            DELIVERED: '😋 ¡Buen provecho!',
            CANCELLED: '❌ Pedido cancelado'
          }
          
          showInfo(statusMessages[data.new_status] || 'Estado actualizado')
          fetchOrderData(false)
        }
      })
    }

    return () => {
      mounted = false
      if (intervalId) clearInterval(intervalId)
      if (socketRef.current) {
        if (order?.id) {
          socketRef.current.emit('leave_order_room', { order_id: order.id })
        }
        socketRef.current.disconnect()
      }
    }
  }, [slug, publicId])

  useEffect(() => {
    if (order?.id && socketRef.current?.connected) {
      socketRef.current.emit('join_order_room', { order_id: order.id })
    }
  }, [order?.id])

  const getStatusConfig = (status) => {
    const config = {
      PENDING: { 
        label: 'Confirmando...', 
        desc: 'El restaurante está revisando tu pedido', 
        progress: 10, 
        color: 'bg-amber-500', 
        bgColor: 'bg-amber-50',
        icon: '⏳' 
      },
      ACCEPTED: { 
        label: 'Aceptado', 
        desc: '¡Prepararemos tu comida pronto!', 
        progress: 25, 
        color: 'bg-blue-500',
        bgColor: 'bg-blue-50', 
        icon: '👨‍🍳' 
      },
      PREPARING: { 
        label: 'Preparando', 
        desc: 'Los chefs están haciendo magia', 
        progress: 60, 
        color: 'bg-orange-500',
        bgColor: 'bg-orange-50', 
        icon: '🍳' 
      },
      READY: { 
        label: '¡Listo!', 
        desc: 'Tu pedido está listo para retirar', 
        progress: 100, 
        color: 'bg-green-500',
        bgColor: 'bg-green-50', 
        icon: '✅' 
      },
      ON_THE_WAY: { 
        label: 'En camino', 
        desc: 'Tu pedido va hacia ti', 
        progress: 80, 
        color: 'bg-blue-600',
        bgColor: 'bg-blue-50', 
        icon: '🛵' 
      },
      DELIVERED: { 
        label: 'Entregado', 
        desc: '¡Buen provecho!', 
        progress: 100, 
        color: 'bg-green-600',
        bgColor: 'bg-green-50', 
        icon: '😋' 
      },
      CANCELLED: { 
        label: 'Cancelado', 
        desc: 'El pedido fue cancelado', 
        progress: 0, 
        color: 'bg-red-500',
        bgColor: 'bg-red-50', 
        icon: '❌' 
      }
    }
    return config[status] || config.PENDING
  }

  if (loading) return (
    <div className="min-h-screen flex justify-center items-center bg-neutral-50">
      <LoadingSpinner size="lg" />
    </div>
  )
  
  if (!order) return (
    <div className="p-10 text-center text-neutral-500 text-base">
      Pedido no encontrado
    </div>
  )

  const statusConfig = getStatusConfig(order.status)
  const isActive = !['DELIVERED', 'CANCELLED'].includes(order.status)

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      {/* ✅ Header sticky SIN top-14, ahora top-0 */}
      <div className="bg-white border-b border-neutral-200 sticky top-0 z-10 shadow-soft">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate(`/${slug}`)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-neutral-100 hover:bg-neutral-200 transition-all active:scale-95"
            aria-label="Volver al menú"
          >
            <svg className="w-6 h-6 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-neutral-900">Menú</h1>
        </div>
      </div>

      {/* ✅ Contenido CON padding-top para separar del header */}
      <div className="max-w-md mx-auto px-6 pt-6 pb-6">
        
        <div className="text-center mb-8 animate-fade-in">
          <div className={`w-28 h-28 mx-auto ${statusConfig.bgColor} rounded-full flex items-center justify-center mb-5 relative transition-all duration-500 shadow-medium`}>
            {isActive && (
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-current animate-spin opacity-20" style={{ color: statusConfig.color.replace('bg-', '') }}></div>
            )}
            <span className="text-5xl transform transition-transform hover:scale-110 cursor-default">
              {statusConfig.icon}
            </span>
          </div>
          <h2 className="text-3xl font-bold text-neutral-900 mb-2 transition-all">
            {statusConfig.label}
          </h2>
          <p className="text-base text-neutral-600 px-4">
            {statusConfig.desc}
          </p>
        </div>

        <div className="w-full bg-neutral-200 rounded-full h-3 mb-8 overflow-hidden shadow-soft">
          <div 
            className={`h-full transition-all duration-1000 ease-out ${statusConfig.color}`} 
            style={{ width: `${statusConfig.progress}%` }}
          />
        </div>

        <div className="border-2 border-neutral-200 rounded-2xl shadow-medium overflow-hidden bg-white mb-6">
          <div className="bg-neutral-50 px-5 py-4 border-b border-neutral-200 flex justify-between items-center">
            <span className="font-bold text-neutral-900 text-base">Pedido #{order.id}</span>
            <span className="text-sm text-neutral-500">
              {new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </span>
          </div>

          <div className="p-5 space-y-3">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between text-base py-2 border-b border-neutral-100 last:border-0">
                <span className="text-neutral-700">
                  <span className="font-bold text-neutral-900">{item.quantity}x</span> {item.product_name}
                  {item.modifiers_json && item.modifiers_json.length > 0 && (
                    <span className="block text-sm text-neutral-400 mt-1">
                      {item.modifiers_json.map(m => m.name || m.option_name).join(', ')}
                    </span>
                  )}
                </span>
                <span className="font-semibold text-neutral-900 ml-3">
                  ₡{(item.unit_price * item.quantity).toLocaleString()}
                </span>
              </div>
            ))}
            
            <div className="border-t-2 border-neutral-200 mt-4 pt-4">
              <div className="flex justify-between font-bold text-xl">
                <span className="text-neutral-700">Total</span>
                <span className="text-primary-600">₡{order.total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {socketConnected && (
          <div className="mb-6 flex items-center justify-center gap-2 text-sm text-green-600 bg-green-50 py-2 px-4 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse-subtle"></div>
            <span className="font-medium">Actualizaciones en tiempo real activas</span>
          </div>
        )}

        {(order.status === 'DELIVERED' || order.status === 'CANCELLED' || order.status === 'READY') && (
          <div className="mt-6 animate-fade-in">
            <Button 
              className="w-full font-bold text-lg shadow-medium" 
              size="lg" 
              onClick={() => navigate(`/${slug}`)}
            >
              {order.status === 'DELIVERED' ? 'Hacer otro pedido' : 'Volver al menú'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default OrderTrackingPage