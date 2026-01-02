import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import LoadingSpinner from '@shared/components/LoadingSpinner'
import { useAuthGuard } from '../hooks/useAuthGuard'

// ✅ Iconos SVG
const Icons = {
  TrendingUp: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  ShoppingBag: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  ),
  ChartBar: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  Cash: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  Plus: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  ),
  Settings: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Package: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  ClipboardList: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  ),
  ArrowRight: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  ),
  Clock: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  AlertCircle: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function DashboardPage() {
  useAuthGuard()
  
  const { slug } = useParams()
  const [loading, setLoading] = useState(true)
  const [tenantInfo, setTenantInfo] = useState(null)
  const [dailyReport, setDailyReport] = useState(null)
  const [recentOrders, setRecentOrders] = useState([])
  const [errors, setErrors] = useState({})

  useEffect(() => {
    loadData()
  }, [slug])

  const loadData = async () => {
    try {
      setLoading(true)
      setErrors({})
      const token = localStorage.getItem('token')
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }

      // ✅ 1. Cargar configuración del tenant
      try {
        const configRes = await fetch(`/api/v1/${slug}/admin/config`, { headers })

        if (configRes.ok) {
          const config = await configRes.json()
          setTenantInfo(config)
        } else {
          const errorText = await configRes.text()
          console.error('❌ Config Error:', errorText)
          setErrors(prev => ({ ...prev, config: 'Error cargando configuración' }))
        }
      } catch (err) {
        console.error('❌ Config Exception:', err)
        setErrors(prev => ({ ...prev, config: err.message }))
      }

      // ✅ 2. Cargar reporte diario
      try {
        const reportRes = await fetch(`/api/v1/${slug}/admin/reports/daily`, { headers })
 
        
        if (reportRes.ok) {
          const report = await reportRes.json()
          setDailyReport(report)
        } else {
          const errorText = await reportRes.text()
          console.error('❌ Report Error:', errorText)
          setErrors(prev => ({ ...prev, report: 'Error cargando reporte diario' }))
        }
      } catch (err) {
        console.error('❌ Report Exception:', err)
        setErrors(prev => ({ ...prev, report: err.message }))
      }

      // ✅ 3. Cargar pedidos
      try {
        const ordersRes = await fetch(`/api/v1/${slug}/admin/orders`, { headers })
        
        if (ordersRes.ok) {
          const orders = await ordersRes.json()
          setRecentOrders(orders.slice(0, 5))
        } else {
          const errorText = await ordersRes.text()
          console.error('❌ Orders Error:', errorText)
          setErrors(prev => ({ ...prev, orders: 'Error cargando pedidos' }))
        }
      } catch (err) {
        console.error('❌ Orders Exception:', err)
        setErrors(prev => ({ ...prev, orders: err.message }))
      }

    } catch (error) {
      console.error('💥 Error general cargando datos:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      DRAFT: { 
        label: 'Borrador', 
        className: 'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-900 border border-amber-200' 
      },
      ACTIVE: { 
        label: 'Activo', 
        className: 'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-900 border border-emerald-200' 
      },
      PAUSED: { 
        label: 'Pausado', 
        className: 'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-900 border border-red-200' 
      }
    }
    return badges[status] || badges.DRAFT
  }

  const getOrderStatusBadge = (status) => {
    const badges = {
      PENDING: { 
        label: 'Pendiente', 
        className: 'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-900 border border-amber-200' 
      },
      ACCEPTED: { 
        label: 'Aceptado', 
        className: 'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-900 border border-blue-200' 
      },
      PREPARING: { 
        label: 'Preparando', 
        className: 'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-900 border border-blue-200' 
      },
      READY: { 
        label: 'Listo', 
        className: 'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-900 border border-emerald-200' 
      },
      ON_THE_WAY: { 
        label: 'En Camino', 
        className: 'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-900 border border-purple-200' 
      },
      DELIVERED: { 
        label: 'Entregado', 
        className: 'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-900 border border-emerald-200' 
      },
      CANCELLED: { 
        label: 'Cancelado', 
        className: 'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-900 border border-red-200' 
      }
    }
    return badges[status] || badges.PENDING
  }

  // ✅ Helper para obtener valores seguros
  const getSafeValue = (value, defaultValue = 0) => {
    return value !== null && value !== undefined ? value : defaultValue
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const statusBadge = tenantInfo ? getStatusBadge(tenantInfo.status) : null

  return (
    <div className="space-y-6">
      {/* ✅ Mostrar errores si existen */}
      {Object.keys(errors).length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Icons.AlertCircle />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-red-900 mb-1">
                Errores detectados
              </h4>
              <ul className="text-sm text-red-700 space-y-1">
                {Object.entries(errors).map(([key, message]) => (
                  <li key={key}>• {message}</li>
                ))}
              </ul>
              <button
                onClick={loadData}
                className="mt-3 text-sm font-medium text-red-900 hover:text-red-700"
              >
                Reintentar carga
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Header del negocio mejorado */}
      {tenantInfo && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{tenantInfo.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{tenantInfo.category}</p>
            </div>
            {statusBadge && (
              <span className={statusBadge.className}>
                {statusBadge.label}
              </span>
            )}
          </div>

          {tenantInfo.status === 'DRAFT' && (
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-amber-900">
                    Tu negocio está en modo borrador
                  </p>
                  <p className="mt-1 text-sm text-amber-700">
                    Completa la configuración para publicar tu menú y empezar a recibir pedidos.
                  </p>
                  <div className="mt-3">
                    <Link
                      to={`/${slug}/admin/config`}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-amber-900 bg-amber-100 hover:bg-amber-200 transition-colors duration-200"
                    >
                      Ir a Configuración
                      <Icons.ArrowRight />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ✅ Métricas principales - Cards mejorados con valores seguros */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Ventas Hoy */}
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-sm p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
              <Icons.TrendingUp />
            </div>
          </div>
          <p className="text-emerald-100 text-sm font-medium mb-1">Ventas Hoy</p>
          <p className="text-3xl font-bold">
            ₡{getSafeValue(dailyReport?.total_sales).toLocaleString()}
          </p>
          {!dailyReport && (
            <p className="text-xs text-emerald-200 mt-1">Sin datos de reporte</p>
          )}
        </div>

        {/* Pedidos Hoy */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-sm p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
              <Icons.ShoppingBag />
            </div>
          </div>
          <p className="text-blue-100 text-sm font-medium mb-1">Pedidos Hoy</p>
          <p className="text-3xl font-bold">
            {getSafeValue(dailyReport?.total_orders)}
          </p>
          {!dailyReport && (
            <p className="text-xs text-blue-200 mt-1">Sin datos de reporte</p>
          )}
        </div>

        {/* Ticket Promedio */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-sm p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
              <Icons.ChartBar />
            </div>
          </div>
          <p className="text-purple-100 text-sm font-medium mb-1">Ticket Promedio</p>
          <p className="text-3xl font-bold">
            ₡{Math.round(getSafeValue(dailyReport?.average_ticket)).toLocaleString()}
          </p>
          {!dailyReport && (
            <p className="text-xs text-purple-200 mt-1">Sin datos de reporte</p>
          )}
        </div>

        {/* Propinas Hoy */}
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-sm p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
              <Icons.Cash />
            </div>
          </div>
          <p className="text-amber-100 text-sm font-medium mb-1">Propinas Hoy</p>
          <p className="text-3xl font-bold">
            ₡{getSafeValue(dailyReport?.total_tips).toLocaleString()}
          </p>
          {!dailyReport && (
            <p className="text-xs text-amber-200 mt-1">Sin datos de reporte</p>
          )}
        </div>
      </div>

      {/* ✅ Grid de 2 columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pedidos Recientes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Pedidos Recientes</h3>
              <Link 
                to={`/${slug}/admin/caja`}
                className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors duration-200 flex items-center gap-1"
              >
                Ver todos
                <Icons.ArrowRight />
              </Link>
            </div>
          </div>
          <div className="p-6">
            {recentOrders.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                  <Icons.ClipboardList />
                </div>
                <p className="text-gray-500 text-sm">No hay pedidos recientes</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentOrders.map(order => {
                  const badge = getOrderStatusBadge(order.status)
                  return (
                    <div 
                      key={order.id} 
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <p className="font-semibold text-gray-900">Pedido #{order.id}</p>
                          <span className={badge.className}>
                            {badge.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Icons.Clock />
                          <span>{new Date(order.created_at).toLocaleString('es-CR', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900 text-lg">₡{order.total.toLocaleString()}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Accesos Rápidos */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Accesos Rápidos</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <Link
                to={`/${slug}/admin/productos/nuevo`}
                className="group relative overflow-hidden flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all duration-200"
              >
                <div className="bg-primary-100 p-3 rounded-lg mb-3 group-hover:bg-primary-200 transition-colors duration-200">
                  <Icons.Plus />
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-primary-700">
                  Agregar Producto
                </span>
              </Link>

              <Link
                to={`/${slug}/admin/reportes`}
                className="group relative overflow-hidden flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
              >
                <div className="bg-blue-100 p-3 rounded-lg mb-3 group-hover:bg-blue-200 transition-colors duration-200">
                  <Icons.ChartBar />
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">
                  Ver Reportes
                </span>
              </Link>

              <Link
                to={`/${slug}/admin/caja`}
                className="group relative overflow-hidden flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-all duration-200"
              >
                <div className="bg-emerald-100 p-3 rounded-lg mb-3 group-hover:bg-emerald-200 transition-colors duration-200">
                  <Icons.Cash />
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-emerald-700">
                  Abrir Caja
                </span>
              </Link>

              <Link
                to={`/${slug}/admin/config`}
                className="group relative overflow-hidden flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-gray-500 hover:bg-gray-50 transition-all duration-200"
              >
                <div className="bg-gray-100 p-3 rounded-lg mb-3 group-hover:bg-gray-200 transition-colors duration-200">
                  <Icons.Settings />
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-700">
                  Configuración
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage