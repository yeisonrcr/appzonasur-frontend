// OrdersHistoryPage.jsx
import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@shared/context/AuthContext'
import { getClientOrders } from '@shared/services/api'
import OrderCardSkeleton from '@shared/components/OrderCardSkeleton'
import OptimizedImage from '@shared/components/OptimizedImage'

const LOGO_CACHE_KEY = 'tenant_logos_cache'
const LOGO_CACHE_DURATION = 24 * 60 * 60 * 1000

function getLogoCache() {
  try {
    const cached = localStorage.getItem(LOGO_CACHE_KEY)
    if (!cached) return {}
    const parsed = JSON.parse(cached)
    const now = Date.now()
    const filtered = {}
    Object.keys(parsed).forEach(key => {
      if (now - parsed[key].timestamp < LOGO_CACHE_DURATION) {
        filtered[key] = parsed[key]
      }
    })
    return filtered
  } catch {
    return {}
  }
}

function OrdersHistoryPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('active')
  const [tenantLogos, setTenantLogos] = useState(() => getLogoCache())
  
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    if (!isAuthenticated) return

    async function fetchOrders() {
      try {
        setLoading(true)
        const data = await getClientOrders()
        setOrders(data)
        
        const newLogos = { ...tenantLogos }
        let hasChanges = false
        
        data.forEach(order => {
          if (order.tenant && order.tenant.slug && order.tenant.logo_url) {
            if (!newLogos[order.tenant.slug]) {
              newLogos[order.tenant.slug] = {
                url: order.tenant.logo_url,
                timestamp: Date.now()
              }
              hasChanges = true
            }
          }
        })

        if (hasChanges) {
          setTenantLogos(newLogos)
          localStorage.setItem(LOGO_CACHE_KEY, JSON.stringify(newLogos))
        }

      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [isAuthenticated])

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      if (activeTab === 'all') return true
      if (activeTab === 'active') {
        return ['PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'ON_THE_WAY'].includes(order.status)
      }
      if (activeTab === 'completed') return order.status === 'DELIVERED'
      if (activeTab === 'cancelled') return order.status === 'CANCELLED'
      return true
    }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  }, [orders, activeTab])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-white px-4 py-3 sticky top-0 z-10 border-b border-gray-200">
          <h1 className="text-base font-bold text-gray-900">Mis Pedidos</h1>
        </div>
        <div className="p-4 space-y-3">
          <OrderCardSkeleton />
          <OrderCardSkeleton />
          <OrderCardSkeleton />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white sticky top-0 z-10 shadow-sm">
        <div className="px-4 py-3 border-b border-gray-100">
          <h1 className="text-base font-bold text-gray-900">Mis Pedidos</h1>
        </div>
        
        <div className="flex overflow-x-auto px-4 py-2 gap-1.5 hide-scrollbar">
          {[
            { id: 'active', label: 'En curso' },
            { id: 'all', label: 'Todos' },
            { id: 'completed', label: 'Completados' },
            { id: 'cancelled', label: 'Cancelados' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-3">
        {filteredOrders.length > 0 ? (
          filteredOrders.map(order => (
            <OrderCard 
              key={order.id} 
              order={order} 
              logoUrl={tenantLogos[order.tenant?.slug]?.url}
              navigate={navigate}
            />
          ))
        ) : (
          <EmptyState activeTab={activeTab} />
        )}
      </div>
    </div>
  )
}

function OrderCard({ order, logoUrl, navigate }) {
  const getStatusColor = (status) => {
    const map = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      ACCEPTED: 'bg-blue-100 text-blue-800',
      PREPARING: 'bg-purple-100 text-purple-800',
      READY: 'bg-indigo-100 text-indigo-800',
      ON_THE_WAY: 'bg-orange-100 text-orange-800',
      DELIVERED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800'
    }
    return map[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusText = (status) => {
    const map = {
      PENDING: 'Pendiente',
      ACCEPTED: 'Aceptado',
      PREPARING: 'Preparando',
      READY: 'Listo',
      ON_THE_WAY: 'En camino',
      DELIVERED: 'Entregado',
      CANCELLED: 'Cancelado'
    }
    return map[status] || status
  }

  return (
    <div 
      onClick={() => navigate(`/${order.tenant.slug}/pedido/${order.public_id}`)}
      className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer active:scale-[0.99] transition-transform"
    >
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-lg bg-gray-50 overflow-hidden flex-shrink-0 border border-gray-100">
          <OptimizedImage 
            src={logoUrl || order.tenant?.logo_url} 
            alt={order.tenant?.name} 
            className="w-full h-full object-cover" 
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-bold text-gray-900 truncate pr-2 text-sm">
              {order.tenant?.name}
            </h3>
            <span className="text-[10px] text-gray-500 whitespace-nowrap">
              {new Date(order.created_at).toLocaleDateString()}
            </span>
          </div>
          
          <p className="text-xs text-gray-600 truncate mb-2">
            {order.items.map(i => `${i.quantity}x ${i.product_name}`).join(', ')}
          </p>
          
          <div className="flex items-center justify-between">
            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${getStatusColor(order.status)}`}>
              {getStatusText(order.status)}
            </span>
            <span className="font-bold text-gray-900 text-sm">
              ₡{order.total.toLocaleString()}
            </span>
          </div>

          <div className="mt-2.5 pt-2.5 border-t border-gray-50 flex justify-end">
            {['DELIVERED', 'CANCELLED'].includes(order.status) && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  navigate(`/${order.tenant.slug}`)
                }}
                className="px-3 py-1.5 border-2 border-primary-600 text-primary-600 rounded-lg text-xs font-semibold hover:bg-primary-50 transition-colors"
              >
                Pedir de nuevo
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function EmptyState({ activeTab }) {
  const messages = useMemo(() => ({
    all: {
      icon: '📦',
      title: 'No tienes pedidos aún',
      description: 'Cuando hagas tu primer pedido, aparecerá aquí'
    },
    active: {
      icon: '🍔',
      title: 'No tienes pedidos activos',
      description: 'Tus pedidos en curso aparecerán aquí'
    },
    completed: {
      icon: '✅',
      title: 'No tienes pedidos completados',
      description: 'Tus pedidos entregados aparecerán aquí'
    },
    cancelled: {
      icon: '⌧',
      title: 'No tienes pedidos cancelados',
      description: 'Los pedidos cancelados aparecerán aquí'
    }
  }), [])

  const message = messages[activeTab] || messages.all

  return (
    <div className="bg-white rounded-xl p-10 text-center shadow-sm">
      <div className="text-5xl mb-3">{message.icon}</div>
      <h3 className="text-base font-bold text-gray-900 mb-1.5">{message.title}</h3>
      <p className="text-gray-500 text-sm">{message.description}</p>
    </div>
  )
}

export default OrdersHistoryPage