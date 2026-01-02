import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import LoadingSpinner from '@shared/components/LoadingSpinner'
import Button from '@shared/components/Button'

// ✅ Iconos SVG
const Icons = {
  TrendingUp: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  Calendar: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Download: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  ),
  DollarSign: () => (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  ShoppingBag: () => (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  ),
  Users: () => (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  Star: () => (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  ),
  ChartBar: () => (
    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  )
}

function ReportsPage() {
  const { slug } = useParams()
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('today')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')
  
  const [stats, setStats] = useState({
    total_sales: 0,
    total_orders: 0,
    total_customers: 0,
    average_order: 0,
    top_products: [],
    sales_by_type: [],
    payment_methods: []
  })

  useEffect(() => {
    loadReports()
  }, [slug, dateRange, customStartDate, customEndDate])

  const getDateParams = () => {
    const today = new Date()
    let startDate, endDate

    switch (dateRange) {
      case 'today':
        startDate = endDate = today.toISOString().split('T')[0]
        break
      case 'yesterday':
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)
        startDate = endDate = yesterday.toISOString().split('T')[0]
        break
      case 'week':
        const weekAgo = new Date(today)
        weekAgo.setDate(weekAgo.getDate() - 7)
        startDate = weekAgo.toISOString().split('T')[0]
        endDate = today.toISOString().split('T')[0]
        break
      case 'month':
        const monthAgo = new Date(today)
        monthAgo.setMonth(monthAgo.getMonth() - 1)
        startDate = monthAgo.toISOString().split('T')[0]
        endDate = today.toISOString().split('T')[0]
        break
      case 'custom':
        startDate = customStartDate
        endDate = customEndDate
        break
      default:
        startDate = endDate = today.toISOString().split('T')[0]
    }

    return { startDate, endDate }
  }

  const loadReports = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const { startDate, endDate } = getDateParams()

      if (!startDate || !endDate) {
        return
      }

      const response = await fetch(
        `/api/v1/${slug}/admin/reports?start_date=${startDate}&end_date=${endDate}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      )

      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error cargando reportes:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportReport = async () => {
    try {
      const token = localStorage.getItem('token')
      const { startDate, endDate } = getDateParams()

      const response = await fetch(
        `/api/v1/${slug}/admin/reports/export?start_date=${startDate}&end_date=${endDate}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      )

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `reporte-${startDate}-${endDate}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Error exportando reporte:', error)
      alert('Error al exportar el reporte')
    }
  }

  const formatCurrency = (amount) => {
    return `₡${amount.toLocaleString()}`
  }

  return (
    <div className="space-y-6">
      {/* ✅ Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Reportes y Estadísticas</h3>
          <p className="text-sm text-gray-600 mt-1">
            Analiza el rendimiento de tu negocio
          </p>
        </div>
        <Button onClick={exportReport}>
          <Icons.Download />
          <span className="ml-2">Exportar CSV</span>
        </Button>
      </div>

      {/* ✅ Filtros de fecha */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Icons.Calendar />
          <h4 className="text-lg font-semibold text-gray-900">Rango de Fechas</h4>
        </div>

        <div className="flex flex-wrap gap-3 mb-4">
          {[
            { value: 'today', label: 'Hoy' },
            { value: 'yesterday', label: 'Ayer' },
            { value: 'week', label: 'Última Semana' },
            { value: 'month', label: 'Último Mes' },
            { value: 'custom', label: 'Personalizado' }
          ].map(option => (
            <button
              key={option.value}
              onClick={() => setDateRange(option.value)}
              className={`
                px-4 py-2 rounded-lg font-medium transition-all duration-200
                ${dateRange === option.value
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              {option.label}
            </button>
          ))}
        </div>

        {dateRange === 'custom' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha Inicio
              </label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha Fin
              </label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
              />
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          {/* ✅ Métricas principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-sm p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center justify-center w-12 h-12 bg-white bg-opacity-20 rounded-lg">
                  <Icons.DollarSign />
                </div>
                <Icons.TrendingUp />
              </div>
              <p className="text-sm opacity-90 mb-1">Ventas Totales</p>
              <p className="text-3xl font-bold">{formatCurrency(stats.total_sales)}</p>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-sm p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center justify-center w-12 h-12 bg-white bg-opacity-20 rounded-lg">
                  <Icons.ShoppingBag />
                </div>
                <Icons.TrendingUp />
              </div>
              <p className="text-sm opacity-90 mb-1">Pedidos</p>
              <p className="text-3xl font-bold">{stats.total_orders}</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-sm p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center justify-center w-12 h-12 bg-white bg-opacity-20 rounded-lg">
                  <Icons.Users />
                </div>
                <Icons.TrendingUp />
              </div>
              <p className="text-sm opacity-90 mb-1">Clientes</p>
              <p className="text-3xl font-bold">{stats.total_customers}</p>
            </div>

            <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-sm p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center justify-center w-12 h-12 bg-white bg-opacity-20 rounded-lg">
                  <Icons.Star />
                </div>
                <Icons.TrendingUp />
              </div>
              <p className="text-sm opacity-90 mb-1">Ticket Promedio</p>
              <p className="text-3xl font-bold">{formatCurrency(stats.average_order)}</p>
            </div>
          </div>

          {/* ✅ Productos más vendidos */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-6">
              Productos Más Vendidos
            </h4>
            
            {stats.top_products && stats.top_products.length > 0 ? (
              <div className="space-y-4">
                {stats.top_products.map((product, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 bg-primary-100 text-primary-700 font-bold rounded-lg">
                      #{index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-600">
                        {product.quantity} unidades vendidas
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary-600">
                        {formatCurrency(product.total_revenue)}
                      </p>
                      <p className="text-xs text-gray-600">ingresos</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                  <Icons.ChartBar />
                </div>
                <p className="text-gray-500">No hay datos de productos</p>
              </div>
            )}
          </div>

          {/* ✅ Ventas por tipo y métodos de pago */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Ventas por tipo */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-6">
                Ventas por Tipo
              </h4>
              
              {stats.sales_by_type && stats.sales_by_type.length > 0 ? (
                <div className="space-y-4">
                  {stats.sales_by_type.map((type, index) => {
                    const types = {
                      TABLE: { label: 'Mesa', color: 'bg-indigo-500' },
                      COUNTER: { label: 'Mostrador', color: 'bg-gray-500' },
                      EXPRESS: { label: 'Express', color: 'bg-orange-500' }
                    }
                    const typeInfo = types[type.type] || { label: type.type, color: 'bg-gray-500' }
                    const percentage = stats.total_sales > 0 
                      ? ((type.total_amount / stats.total_sales) * 100).toFixed(1)
                      : 0

                    return (
                      <div key={index}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">{typeInfo.label}</span>
                          <span className="text-sm font-semibold text-gray-700">
                            {formatCurrency(type.total_amount)} ({percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className={`${typeInfo.color} h-3 rounded-full transition-all duration-500`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">No hay datos</p>
              )}
            </div>

            {/* Métodos de pago */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-6">
                Métodos de Pago
              </h4>
              
              {stats.payment_methods && stats.payment_methods.length > 0 ? (
                <div className="space-y-4">
                  {stats.payment_methods.map((method, index) => {
                    const methods = {
                      EFECTIVO: { label: 'Efectivo', color: 'bg-emerald-500' },
                      SINPE: { label: 'SINPE', color: 'bg-blue-500' },
                      TARJETA: { label: 'Tarjeta', color: 'bg-purple-500' }
                    }
                    const methodInfo = methods[method.method] || { label: method.method, color: 'bg-gray-500' }
                    const percentage = stats.total_sales > 0 
                      ? ((method.total_amount / stats.total_sales) * 100).toFixed(1)
                      : 0

                    return (
                      <div key={index}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">{methodInfo.label}</span>
                          <span className="text-sm font-semibold text-gray-700">
                            {formatCurrency(method.total_amount)} ({percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className={`${methodInfo.color} h-3 rounded-full transition-all duration-500`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">No hay datos</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default ReportsPage