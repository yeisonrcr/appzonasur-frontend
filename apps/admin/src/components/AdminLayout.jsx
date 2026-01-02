import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '@shared/context/AuthContext'
import { useState, useEffect } from 'react'

// ✅ ICONOS SVG - Reemplazar todos los emojis
const Icons = {
  Dashboard: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  Products: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
    </svg>
  ),
  Categories: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
  ),
  Modifiers: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
    </svg>
  ),
  Tables: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  ),
  Coupons: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
    </svg>
  ),
  Settings: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  CashRegister: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  Prep: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ),
  Reports: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  Logout: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  ),
  Menu: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  ChevronLeft: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  ),
  ChevronRight: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  )
}

function AdminLayout({ children }) {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { logout, token, isAuthenticated } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [currentPath, setCurrentPath] = useState('')

  useEffect(() => {
    setCurrentPath(window.location.pathname)
  }, [window.location.pathname])

  useEffect(() => {
    if (!isAuthenticated || !token) {
      logout()
      navigate('/login', { replace: true })
      return
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      
      if (payload.role !== 'owner') {
        logout()
        navigate('/login', { replace: true })
        return
      }

      if (payload.exp * 1000 < Date.now()) {
        logout()
        navigate('/login', { replace: true })
      }
    } catch (error) {
      console.error('Error validando sesión:', error)
      logout()
      navigate('/login', { replace: true })
    }
  }, [isAuthenticated, token, navigate, logout])

  const handleLogout = async () => {
    // ✅ Llamar endpoint de logout para revocar token
    try {
      await fetch('/api/v1/business/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    } finally {
      // Siempre limpiar localmente aunque falle el endpoint
      logout()
      navigate('/login')
    }
  }

  // ✅ Menú agrupado por secciones
  const menuSections = [
    {
      title: 'Principal',
      items: [
        { icon: Icons.Dashboard, label: 'Dashboard', path: `/${slug}/admin` }
      ]
    },
    {
      title: 'Ventas',
      items: [
        { icon: Icons.CashRegister, label: 'Caja', path: `/${slug}/admin/caja` },
        { icon: Icons.Reports, label: 'Reportes', path: `/${slug}/admin/reportes` }
      ]
    },
    {
      title: 'Productos',
      items: [
        { icon: Icons.Products, label: 'Productos', path: `/${slug}/admin/productos` },
        { icon: Icons.Categories, label: 'Categorías', path: `/${slug}/admin/categorias` },
        { icon: Icons.Modifiers, label: 'Modificadores', path: `/${slug}/admin/modificadores` }
      ]
    },
    {
      title: 'Operaciones',
      items: [
        { icon: Icons.Tables, label: 'Mesas', path: `/${slug}/admin/mesas` },
        { icon: Icons.Coupons, label: 'Cupones', path: `/${slug}/admin/cupones` },
        { icon: Icons.Prep, label: 'Preparación', path: `/${slug}/admin/prep` }
      ]
    },
    {
      title: 'Sistema',
      items: [
        { icon: Icons.Settings, label: 'Configuración', path: `/${slug}/admin/config` }
      ]
    }
  ]

  const isActivePath = (path) => currentPath === path

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* ✅ Sidebar mejorado */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}>
        {/* Header del sidebar */}
        <div className="h-16 border-b border-gray-200 flex items-center justify-between px-4">
          {sidebarOpen && (
            <div>
              <h1 className="text-xl font-bold text-gray-900">ZonaSur</h1>
              <p className="text-xs text-gray-500">Panel Admin</p>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            aria-label={sidebarOpen ? 'Colapsar menú' : 'Expandir menú'}
          >
            {sidebarOpen ? <Icons.ChevronLeft /> : <Icons.ChevronRight />}
          </button>
        </div>

        {/* Navegación */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {menuSections.map((section, idx) => (
            <div key={idx}>
              {sidebarOpen && (
                <h3 className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {section.title}
                </h3>
              )}
              <div className="space-y-1">
                {section.items.map((item, itemIdx) => {
                  const Icon = item.icon
                  const isActive = isActivePath(item.path)
                  
                  return (
                    <Link
                      key={itemIdx}
                      to={item.path}
                      className={`
                        flex items-center px-3 py-2.5 rounded-lg text-sm font-medium
                        transition-all duration-200
                        ${isActive 
                          ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-600' 
                          : 'text-gray-700 hover:bg-gray-100 border-l-4 border-transparent'
                        }
                        ${!sidebarOpen && 'justify-center'}
                      `}
                      title={!sidebarOpen ? item.label : undefined}
                    >
                      <Icon />
                      {sidebarOpen && (
                        <span className="ml-3">{item.label}</span>
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer del sidebar */}
        <div className="border-t border-gray-200 p-3">
          <button
            onClick={handleLogout}
            className={`
              w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium
              text-red-600 hover:bg-red-50 transition-all duration-200
              ${!sidebarOpen && 'justify-center'}
            `}
            title={!sidebarOpen ? 'Cerrar Sesión' : undefined}
          >
            <Icons.Logout />
            {sidebarOpen && (
              <span className="ml-3">Cerrar Sesión</span>
            )}
          </button>
        </div>
      </aside>

      {/* ✅ Contenido principal */}
      <main className="flex-1 overflow-auto">
        {/* Header fijo */}
        <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900">Panel de Administración</h2>
          </div>
        </header>

        {/* Contenido con padding */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          {children}
        </div>
      </main>
    </div>
  )
}

export default AdminLayout