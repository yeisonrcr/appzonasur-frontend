import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { io } from 'socket.io-client'
import LoadingSpinner from '@shared/components/LoadingSpinner'
import Button from '@shared/components/Button'
import CounterOrderModal from '../components/CounterOrderModal'

const Icons = {
  Plus: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  ),
  Clock: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  User: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  ShoppingBag: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  ),
  Check: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  X: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  AlertCircle: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Receipt: () => (
    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
    </svg>
  ),
  CreditCard: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  ),
  Cash: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  Smartphone: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  ),
  Truck: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
    </svg>
  ),
  ChefHat: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
    </svg>
  )
}

const STATUS_CONFIG = {
  PENDING: { label: 'Pendiente', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  ACCEPTED: { label: 'Aceptado', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  PREPARING: { label: 'En Cocina', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  READY: { label: 'Listo', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  ON_THE_WAY: { label: 'En Camino', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  DELIVERED: { label: 'Entregado', color: 'bg-green-100 text-green-800 border-green-200' },
  CANCELLED: { label: 'Cancelado', color: 'bg-red-100 text-red-800 border-red-200' }
}

const PAYMENT_ICONS = {
  CASH: <Icons.Cash />,
  SINPE: <Icons.Smartphone />,
  CARD: <Icons.CreditCard />
}

const STATUS_TRANSITIONS = {
  PENDING: [
    { status: 'ACCEPTED', label: 'Aceptar Pedido', icon: Icons.Check, color: 'bg-blue-600 hover:bg-blue-700' },
    { status: 'CANCELLED', label: 'Rechazar', icon: Icons.X, color: 'bg-red-600 hover:bg-red-700' }
  ],
  ACCEPTED: [
    { status: 'PREPARING', label: 'Enviar a Cocina', icon: Icons.ChefHat, color: 'bg-orange-600 hover:bg-orange-700' },
    { status: 'READY', label: 'Marcar Listo', icon: Icons.Check, color: 'bg-emerald-600 hover:bg-emerald-700' },
    { status: 'CANCELLED', label: 'Cancelar', icon: Icons.X, color: 'bg-red-600 hover:bg-red-700' }
  ],
  PREPARING: [
    { status: 'READY', label: 'Marcar Listo', icon: Icons.Check, color: 'bg-emerald-600 hover:bg-emerald-700' }
  ],
  READY: [
    { status: 'ON_THE_WAY', label: 'En Camino', icon: Icons.Truck, color: 'bg-purple-600 hover:bg-purple-700' },
    { status: 'DELIVERED', label: 'Marcar Entregado', icon: Icons.Check, color: 'bg-green-600 hover:bg-green-700' }
  ],
  ON_THE_WAY: [
    { status: 'DELIVERED', label: 'Marcar Entregado', icon: Icons.Check, color: 'bg-green-600 hover:bg-green-700' }
  ],
  DELIVERED: [],
  CANCELLED: []
}

function CashRegisterPage() {
  const { slug } = useParams()
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [showCounterModal, setShowCounterModal] = useState(false)
  const [filterStatus, setFilterStatus] = useState('active')
  const socketRef = useRef(null)

  useEffect(() => {
    loadOrders()
    connectWebSocket()

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [slug])

  const connectWebSocket = () => {
    const token = localStorage.getItem('token')
    
    socketRef.current = io('http://localhost:8000', {
      auth: { token },
      transports: ['websocket', 'polling']
    })

    socketRef.current.on('new_order', () => {
      loadOrders()
    })

    socketRef.current.on('order_update', () => {
      loadOrders()
    })
  }

  const loadOrders = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/v1/${slug}/admin/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setOrders(data)
      }
    } catch (error) {
      console.error('Error cargando pedidos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/v1/${slug}/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        loadOrders()
        if (selectedOrder?.id === orderId) {
          const updated = await response.json()
          setSelectedOrder(updated)
        }
      } else {
        const error = await response.json()
        alert(error.detail || 'Error al cambiar estado')
      }
    } catch (error) {
      console.error('Error cambiando estado:', error)
      alert('Error al cambiar el estado del pedido')
    }
  }

  const getFilteredOrders = () => {
    if (filterStatus === 'active') {
      return orders.filter(o => !['DELIVERED', 'CANCELLED'].includes(o.status))
    }
    if (filterStatus === 'completed') {
      return orders.filter(o => o.status === 'DELIVERED')
    }
    if (filterStatus === 'cancelled') {
      return orders.filter(o => o.status === 'CANCELLED')
    }
    return orders
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: 'short'
    })
  }

  const getTypeBadge = (type, tableId) => {
    const types = {
      'TABLE': { label: `Mesa ${tableId || '?'}`, color: 'bg-indigo-100 text-indigo-700 border-indigo-300' },
      'COUNTER': { label: 'Mostrador', color: 'bg-slate-100 text-slate-700 border-slate-300' },
      'PICKUP': { label: 'Para Llevar', color: 'bg-cyan-100 text-cyan-700 border-cyan-300' },
      'EXPRESS': { label: 'Express', color: 'bg-orange-100 text-orange-700 border-orange-300' }
    }
    return types[type] || types.COUNTER
  }

  const filteredOrders = getFilteredOrders()

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Caja</h3>
          <p className="text-sm text-gray-600 mt-1">Gestiona los pedidos en tiempo real</p>
        </div>
        <Button onClick={() => setShowCounterModal(true)}>
          <Icons.Plus />
          <span className="ml-2">Nuevo Pedido</span>
        </Button>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setFilterStatus('active')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filterStatus === 'active'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Activos ({orders.filter(o => !['DELIVERED', 'CANCELLED'].includes(o.status)).length})
        </button>
        <button
          onClick={() => setFilterStatus('completed')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filterStatus === 'completed'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Completados ({orders.filter(o => o.status === 'DELIVERED').length})
        </button>
        <button
          onClick={() => setFilterStatus('cancelled')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filterStatus === 'cancelled'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Cancelados ({orders.filter(o => o.status === 'CANCELLED').length})
        </button>
      </div>

      <div>
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <Icons.Receipt />
            <p className="mt-4 text-gray-600 font-medium">No hay pedidos</p>
            <p className="text-sm text-gray-500 mt-1">
              {filterStatus === 'active' && 'Los pedidos activos aparecerán aquí'}
              {filterStatus === 'completed' && 'Los pedidos completados aparecerán aquí'}
              {filterStatus === 'cancelled' && 'Los pedidos cancelados aparecerán aquí'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredOrders.map(order => {
              const typeBadge = getTypeBadge(order.type, order.table_id)
              
              return (
                <div
                  key={order.id}
                  onClick={() => {
                    setSelectedOrder(order)
                    setShowOrderModal(true)
                  }}
                  className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg cursor-pointer transition-all duration-200 hover:border-primary-300"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-bold text-gray-900">Pedido #{order.id}</h4>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                        <Icons.Clock />
                        <span>{formatDate(order.created_at)}</span>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_CONFIG[order.status].color}`}>
                      {STATUS_CONFIG[order.status].label}
                    </span>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Icons.User />
                      <span className="text-gray-700">{order.client_name || 'Cliente'}</span>
                    </div>

                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border ${typeBadge.color}`}>
                      {typeBadge.label}
                    </span>

                    <div className="flex items-center gap-2 text-sm">
                      <Icons.ShoppingBag />
                      <span className="text-gray-700">{order.items?.length || 0} items</span>
                    </div>

                    {order.payment_method && (
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        {PAYMENT_ICONS[order.payment_method]}
                        <span>{order.payment_method}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total</span>
                      <span className="text-lg font-bold text-primary-600">
                        ₡{order.total.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {order.notes && (
                    <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <Icons.AlertCircle />
                        <p className="text-xs font-medium text-amber-900">{order.notes}</p>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">Pedido #{selectedOrder.id}</h3>
                  <p className="text-sm opacity-90 mt-0.5">{formatDate(selectedOrder.created_at)}</p>
                </div>
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors duration-200"
                >
                  <Icons.X />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              <div className="flex flex-wrap gap-2 mb-6">
                <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium border ${STATUS_CONFIG[selectedOrder.status].color}`}>
                  {STATUS_CONFIG[selectedOrder.status].label}
                </span>
                <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium border ${getTypeBadge(selectedOrder.type, selectedOrder.table_id).color}`}>
                  {getTypeBadge(selectedOrder.type, selectedOrder.table_id).label}
                </span>
              </div>

              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Cliente</p>
                <p className="font-semibold text-gray-900">{selectedOrder.client_name}</p>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Items del Pedido</h4>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary-600 text-white font-bold text-xs">
                            {item.quantity}
                          </span>
                          <span className="font-medium text-gray-900">{item.product_name}</span>
                        </div>
                        {item.modifiers_json && item.modifiers_json.length > 0 && (
                          <div className="mt-1.5 ml-8 space-y-0.5">
                            {item.modifiers_json.map((mod, midx) => (
                              <div key={midx} className="text-xs text-gray-600">
                                + {mod.option_name}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <span className="font-semibold text-gray-900">
                        ₡{item.item_total.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₡{selectedOrder.subtotal.toLocaleString()}</span>
                </div>
                {selectedOrder.discount_amount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Descuento</span>
                    <span className="font-medium">-₡{selectedOrder.discount_amount.toLocaleString()}</span>
                  </div>
                )}
                {selectedOrder.tip_amount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Propina</span>
                    <span className="font-medium">₡{selectedOrder.tip_amount.toLocaleString()}</span>
                  </div>
                )}
                <div className="border-t pt-2 flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary-600">₡{selectedOrder.total.toLocaleString()}</span>
                </div>
              </div>

              {selectedOrder.payment_method && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Método de Pago</p>
                  <div className="flex items-center gap-2">
                    {PAYMENT_ICONS[selectedOrder.payment_method]}
                    <span className="font-semibold text-gray-900">{selectedOrder.payment_method}</span>
                  </div>
                </div>
              )}

              {selectedOrder.notes && (
                <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-xs text-amber-700 font-medium mb-1">Notas</p>
                  <p className="text-sm text-amber-900">{selectedOrder.notes}</p>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              {STATUS_TRANSITIONS[selectedOrder.status]?.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {STATUS_TRANSITIONS[selectedOrder.status].map((transition) => {
                    const IconComponent = transition.icon
                    return (
                      <button
                        key={transition.status}
                        onClick={() => handleStatusChange(selectedOrder.id, transition.status)}
                        className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 text-white rounded-lg font-medium transition-colors duration-200 ${transition.color}`}
                      >
                        <IconComponent />
                        {transition.label}
                      </button>
                    )
                  })}
                </div>
              ) : (
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors duration-200"
                >
                  Cerrar
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <CounterOrderModal
        isOpen={showCounterModal}
        onClose={() => setShowCounterModal(false)}
        onSuccess={loadOrders}
      />
    </div>
  )
}

export default CashRegisterPage