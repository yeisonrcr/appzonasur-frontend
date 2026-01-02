import { useState, useEffect, useRef } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { io } from 'socket.io-client'
import LoadingSpinner from '@shared/components/LoadingSpinner'
import { 
  alertNewOrder, 
  alertOrderReady,
  initializeAlerts
} from '@shared/services/alerts'

const Icons = {
  Wifi: ({ connected }) => (
    <svg className={`w-5 h-5 ${connected ? 'text-emerald-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
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
  AlertCircle: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  CheckCircle: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

const COLUMNS = {
  ACCEPTED: {
    id: 'ACCEPTED',
    title: 'Nuevos',
    color: 'bg-slate-600',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-300',
    icon: '📋'
  },
  PREPARING: {
    id: 'PREPARING',
    title: 'En Cocina',
    color: 'bg-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-300',
    icon: '👨‍🍳'
  },
  READY: {
    id: 'READY',
    title: 'Listos',
    color: 'bg-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-300',
    icon: '✓'
  }
}

function PrepPage() {
  const { slug } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')
  
  const [loading, setLoading] = useState(true)
  const [validToken, setValidToken] = useState(false)
  const [orders, setOrders] = useState([])
  const [wsConnected, setWsConnected] = useState(false)
  const [tenantInfo, setTenantInfo] = useState(null)
  const socketRef = useRef(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [pendingMove, setPendingMove] = useState(null)
  const [confirmLoading, setConfirmLoading] = useState(false)

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }

    validateToken()
    loadTenantInfo()
    initializeAlerts()
  }, [token])

  useEffect(() => {
    if (validToken) {
      loadOrders()
      connectWebSocket()
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [validToken])

  const validateToken = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/v1/${slug}/admin/kitchen/token/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
      })

      if (response.ok) {
        setValidToken(true)
      } else {
        const error = await response.json()
        alert(error.detail || 'Token inválido o expirado')
        navigate('/login')
      }
    } catch (error) {
      console.error('Error validando token:', error)
      alert('Error al validar el token')
      navigate('/login')
    } finally {
      setLoading(false)
    }
  }

  const loadTenantInfo = async () => {
    try {
      const response = await fetch(`/api/v1/${slug}/info`)
      if (response.ok) {
        const data = await response.json()
        setTenantInfo(data)
      }
    } catch (error) {
      console.error('Error cargando info del tenant:', error)
    }
  }

  const loadOrders = async () => {
    try {
      const response = await fetch(`/api/v1/${slug}/kitchen/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setOrders(data)
      } else {
        console.error('Error cargando pedidos:', await response.text())
      }
    } catch (error) {
      console.error('Error cargando pedidos:', error)
    }
  }

  const connectWebSocket = () => {
    socketRef.current = io('http://localhost:8000', {
      auth: { token },
      transports: ['websocket', 'polling']
    })

    socketRef.current.on('connect', () => {
      setWsConnected(true)
      socketRef.current.emit('join_tenant_room', { 
        tenant_slug: slug, 
        room_type: 'prep' 
      })
    })

    socketRef.current.on('disconnect', () => {
      console.log('❌ WebSocket desconectado')
      setWsConnected(false)
    })

    socketRef.current.on('new_order', (data) => {
      if (['ACCEPTED', 'PREPARING'].includes(data.status)) {
        alertNewOrder(data.order_id, data.type)
        loadOrders()
      }
    })

    socketRef.current.on('order_update', (data) => {
      loadOrders()
    })

    socketRef.current.on('connect_error', (error) => {
      console.error('Error de conexión WebSocket:', error)
      setWsConnected(false)
    })
  }

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result

    if (!destination || 
        (destination.droppableId === source.droppableId && 
        destination.index === source.index)) {
      return
    }

    const orderId = parseInt(draggableId)
    const newStatus = destination.droppableId
    const oldStatus = source.droppableId

    if (newStatus === 'READY') {
      setPendingMove({ orderId, newStatus, oldStatus })
      setShowConfirmModal(true)
      return
    }

    if (oldStatus === 'READY') {
      alert('No puedes mover un pedido que ya está listo')
      return
    }

    await updateOrderStatus(orderId, newStatus)
  }

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`/api/v1/${slug}/kitchen/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        loadOrders()
      } else {
        const error = await response.json()
        alert(error.detail || 'Error al cambiar estado')
        loadOrders()
      }
    } catch (error) {
      console.error('Error actualizando estado:', error)
      alert('Error al cambiar el estado del pedido')
      loadOrders()
    }
  }

  const handleConfirmReady = async () => {
    if (!pendingMove) return

    setConfirmLoading(true)
    await updateOrderStatus(pendingMove.orderId, pendingMove.newStatus)
    alertOrderReady(pendingMove.orderId)
    setShowConfirmModal(false)
    setPendingMove(null)
    setConfirmLoading(false)
  }

  const handleCancelReady = () => {
    setShowConfirmModal(false)
    setPendingMove(null)
  }

  const getOrdersByStatus = (status) => {
    return orders.filter(order => order.status === status)
  }

  const getTypeBadge = (type, tableId = null) => {
    const badges = {
      TABLE: { label: `Mesa ${tableId || '?'}`, color: 'bg-indigo-100 text-indigo-700 border-indigo-300' },
      COUNTER: { label: 'Mostrador', color: 'bg-gray-100 text-gray-700 border-gray-300' },
      EXPRESS: { label: 'Express', color: 'bg-orange-100 text-orange-700 border-orange-300' }
    }
    return badges[type] || badges.COUNTER
  }

  const getTimeAgo = (dateString) => {
    const now = new Date()
    const created = new Date(dateString)
    const diffMs = now - created
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'Ahora'
    if (diffMins < 60) return `${diffMins}m`
    const diffHours = Math.floor(diffMins / 60)
    return `${diffHours}h ${diffMins % 60}m`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {tenantInfo?.name || 'Preparación'}
              </h1>
              <p className="text-sm text-gray-600 mt-0.5">Panel de Cocina</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className={`
                flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors duration-200
                ${wsConnected 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : 'bg-red-50 text-red-700 border-red-200'
                }
              `}>
                <Icons.Wifi connected={wsConnected} />
                <span className="text-sm font-medium">
                  {wsConnected ? 'Conectado' : 'Desconectado'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No hay pedidos en preparación
            </h3>
            <p className="text-gray-600">
              Los nuevos pedidos aparecerán aquí automáticamente
            </p>
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {Object.values(COLUMNS).map(column => {
                const columnOrders = getOrdersByStatus(column.id)
                
                return (
                  <div key={column.id} className="flex flex-col">
                    <div className={`${column.color} text-white px-6 py-4 rounded-t-xl shadow-sm`}>
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                          <span className="text-2xl">{column.icon}</span>
                          {column.title}
                        </h3>
                        <span className="bg-white bg-opacity-20 px-3 py-1.5 rounded-full text-sm font-bold">
                          {columnOrders.length}
                        </span>
                      </div>
                    </div>

                    <Droppable droppableId={column.id}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`
                            flex-1 p-4 space-y-4 rounded-b-xl transition-all duration-200 min-h-[300px]
                            ${snapshot.isDraggingOver 
                              ? column.bgColor + ' border-2 border-dashed ' + column.borderColor + ' shadow-inner' 
                              : 'bg-gray-100 border-2 border-transparent'
                            }
                          `}
                        >
                          {columnOrders.length === 0 ? (
                            <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
                              Arrastra pedidos aquí
                            </div>
                          ) : (
                            columnOrders.map((order, index) => {
                              const typeBadge = getTypeBadge(order.type, order.table_id)
                              const timeAgo = getTimeAgo(order.created_at)

                              return (
                                <Draggable 
                                  key={order.id} 
                                  draggableId={String(order.id)} 
                                  index={index}
                                >
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className={`
                                        bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden
                                        transition-all duration-200
                                        ${snapshot.isDragging 
                                          ? 'ring-2 ring-gray-400 shadow-xl scale-105' 
                                          : 'hover:shadow-md'
                                        }
                                      `}
                                    >
                                      <div className={`${column.color} text-white p-4`}>
                                        <div className="flex items-center justify-between mb-2">
                                          <h4 className="font-bold text-lg">
                                            Pedido #{order.id}
                                          </h4>
                                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium border bg-white bg-opacity-20 border-white border-opacity-30`}>
                                            {typeBadge.label}
                                          </span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs opacity-90">
                                          <div className="flex items-center gap-2">
                                            <Icons.Clock />
                                            <span>{timeAgo}</span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <Icons.User />
                                            <span className="font-semibold">{order.client_name}</span>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="p-4">
                                        <div className="space-y-3">
                                          {order.items.map((item, idx) => (
                                            <div key={idx} className="border-l-4 border-gray-400 pl-3 py-1">
                                              <div className="flex items-center gap-2">
                                                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-700 text-white font-bold text-sm">
                                                  {item.quantity}
                                                </span>
                                                <span className="font-semibold text-gray-900 text-sm">
                                                  {item.product_name}
                                                </span>
                                              </div>
                                              
                                              {item.modifiers_json && item.modifiers_json.length > 0 && (
                                                <div className="mt-1.5 ml-9 space-y-0.5">
                                                  {item.modifiers_json.map((mod, midx) => (
                                                    <div key={midx} className="text-xs text-gray-600 flex items-center gap-1">
                                                      <span className="text-gray-500">+</span>
                                                      {mod.option_name}
                                                    </div>
                                                  ))}
                                                </div>
                                              )}
                                            </div>
                                          ))}
                                        </div>

                                        {order.notes && (
                                          <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3">
                                            <div className="flex items-start gap-2">
                                              <Icons.AlertCircle />
                                              <p className="text-xs font-semibold text-amber-900 flex-1">
                                                {order.notes}
                                              </p>
                                            </div>
                                          </div>
                                        )}

                                        {order.type === 'EXPRESS' && order.delivery_address && (
                                          <div className="mt-3 bg-orange-50 border border-orange-200 rounded-lg p-3">
                                            <div className="flex items-start gap-2">
                                              <svg className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                              </svg>
                                              <p className="text-xs font-semibold text-orange-900 flex-1">
                                                {order.delivery_address}
                                              </p>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </Draggable>
                              )
                            })
                          )}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                )
              })}
            </div>
          </DragDropContext>
        )}
      </div>

      {!('Notification' in window) || Notification.permission === 'denied' ? (
        <div className="fixed bottom-6 right-6 bg-amber-50 border border-amber-200 rounded-xl p-4 max-w-sm shadow-lg">
          <div className="flex items-start gap-3">
            <Icons.AlertCircle />
            <div>
              <h4 className="text-sm font-semibold text-amber-900 mb-1">
                Notificaciones deshabilitadas
              </h4>
              <p className="text-xs text-amber-700">
                Activa las notificaciones para recibir alertas de nuevos pedidos.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {showConfirmModal && pendingMove && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="text-center mb-6">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100 mb-4">
                <Icons.CheckCircle />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                ¿Marcar pedido como listo?
              </h3>
              <p className="text-sm text-gray-600">
                El pedido <strong>#{pendingMove.orderId}</strong> se marcará como <strong>LISTO PARA ENTREGA</strong>.
                <br />
                <span className="text-amber-600 font-medium">Esta acción no se puede revertir.</span>
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCancelReady}
                disabled={confirmLoading}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium disabled:opacity-50 transition-colors duration-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmReady}
                disabled={confirmLoading}
                className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-bold disabled:opacity-50 flex items-center justify-center gap-2 transition-colors duration-200"
              >
                {confirmLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Marcando...
                  </>
                ) : (
                  <>
                    <Icons.CheckCircle />
                    Confirmar Listo
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PrepPage