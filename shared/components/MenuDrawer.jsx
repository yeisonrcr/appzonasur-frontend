// MenuDrawer.jsx 
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@shared/context/AuthContext'

function MenuDrawer({ isOpen, onClose }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, client, logout } = useAuth()

  const lastSlug = localStorage.getItem('last_visited_slug')
  const lastName = localStorage.getItem('last_visited_name') || 'Mi tienda'

  const getTenantSlug = () => {
    const match = location.pathname.match(/^\/([^\/]+)/)
    if (!match) return null
    const possibleSlug = match[1]
    const reservedRoutes = ['login', 'register', 'perfil', 'mis-pedidos', 'admin', 'terminos', 'ayuda']
    if (reservedRoutes.includes(possibleSlug)) return null
    return possibleSlug
  }

  const currentSlug = getTenantSlug()

  const handleNavigation = (path) => {
    onClose()
    navigate(path)
  }

  const handleLogout = () => {
    logout()
    onClose()
    if (currentSlug) {
      navigate(`/${currentSlug}`)
    } else {
      navigate('/login')
    }
  }

  return (
    <>
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
            onClick={onClose}
          />
          
          {/* Drawer */}
          <div className="fixed left-0 top-0 h-full w-[min(85vw,340px)] bg-white shadow-2xl z-50 flex flex-col animate-slide-right">
            
            {/* Header con perfil de usuario */}
            <div className="bg-gradient-to-br from-primary-500 to-primary-600 pt-8 pb-6 px-5">
              {isAuthenticated ? (
                <div className="flex items-center gap-3.5">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center ring-4 ring-white/30 shadow-lg">
                    <span className="text-2xl font-black text-white">
                      {client?.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-primary-100 font-medium mb-0.5">Bienvenido</p>
                    <h2 className="text-lg font-bold text-white leading-tight truncate">
                      {client?.name || 'Usuario'}
                    </h2>
                    {client?.email && (
                      <p className="text-[10px] text-primary-100 truncate mt-0.5">
                        {client.email}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                    <span className="text-3xl">👋</span>
                  </div>
                  <button
                    onClick={() => handleNavigation('/login')}
                    className="bg-white text-primary-600 py-2.5 px-6 rounded-full font-bold text-sm shadow-lg hover:bg-primary-50 transition-all active:scale-95"
                  >
                    Iniciar sesión
                  </button>
                </div>
              )}
            </div>

            {/* Contenido del menú */}
            <div className="flex-1 overflow-y-auto px-3 py-4">
              
              {/* Última tienda visitada */}
              {lastSlug && (
                <div className="mb-4">
                  <p className="text-[10px] uppercase font-bold text-neutral-400 mb-2 px-3 tracking-wider">
                    Última tienda
                  </p>
                  <button
                    onClick={() => handleNavigation(`/${lastSlug}`)}
                    className={`w-full text-left p-3 rounded-xl border-2 transition-all group ${
                      currentSlug === lastSlug
                        ? 'bg-primary-50 border-primary-500 shadow-sm'
                        : 'bg-white border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-transform group-hover:scale-110 ${
                        currentSlug === lastSlug ? 'bg-primary-100' : 'bg-neutral-100'
                      }`}>
                        🏪
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-bold truncate ${
                          currentSlug === lastSlug ? 'text-primary-700' : 'text-neutral-900'
                        }`}>
                          {lastName}
                        </p>
                        <p className="text-[10px] text-neutral-500">Ver menú</p>
                      </div>
                      <svg className="w-4 h-4 text-neutral-400 group-hover:text-neutral-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                </div>
              )}

              {/* Mi cuenta (solo si está autenticado) */}
              {isAuthenticated && (
                <div className="mb-4">
                  <p className="text-[10px] uppercase font-bold text-neutral-400 mb-2 px-3 tracking-wider">
                    Mi cuenta
                  </p>
                  <div className="space-y-1.5">
                    <MenuItemButton
                      icon="👤"
                      text="Mi perfil"
                      onClick={() => handleNavigation('/perfil')}
                      active={location.pathname === '/perfil'}
                    />
                    <MenuItemButton
                      icon="📦"
                      text="Mis pedidos"
                      onClick={() => handleNavigation('/mis-pedidos')}
                      active={location.pathname === '/mis-pedidos'}
                    />
                  </div>
                </div>
              )}

              {/* Ayuda y soporte */}
              <div className="mb-4">
                <p className="text-[10px] uppercase font-bold text-neutral-400 mb-2 px-3 tracking-wider">
                  Ayuda y soporte
                </p>
                <div className="space-y-1.5">
                  <MenuItemButton
                    icon="❓"
                    text="Centro de ayuda"
                    onClick={() => handleNavigation('/ayuda')}
                  />
                  <MenuItemButton
                    icon="📄"
                    text="Términos y condiciones"
                    onClick={() => handleNavigation('/terminos')}
                  />
                </div>
              </div>

            </div>

            {/* Footer con branding y logout */}
            <div className="border-t border-neutral-200 bg-neutral-50 p-4">
              {isAuthenticated && (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 text-red-600 hover:text-red-700 font-medium text-sm py-2.5 px-4 rounded-lg hover:bg-red-50 transition-colors mb-4"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Cerrar sesión
                </button>
              )}
              
              {/* Branding ZonaSur */}
              <div className="text-center space-y-1">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <div className="w-6 h-6 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center shadow-sm">
                    <span className="text-white text-xs font-bold">Z</span>
                  </div>
                  <span className="text-sm font-black text-neutral-900">zonasur.app</span>
                </div>
                <p className="text-[10px] text-neutral-500 font-medium">
                  La App de la Zona Sur
                </p>
                <p className="text-[9px] text-neutral-400">
                  🇨🇷 Costa Rica
                </p>
                <p className="text-[8px] text-neutral-300 mt-2">
                  v1.0.0
                </p>
              </div>
            </div>

          </div>
        </>
      )}
    </>
  )
}

// Componente de item de menú reutilizable
function MenuItemButton({ icon, text, onClick, active = false }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 rounded-xl transition-all group ${
        active 
          ? 'bg-primary-50 shadow-sm' 
          : 'bg-white hover:bg-neutral-50'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-transform group-hover:scale-110 ${
          active ? 'bg-primary-100' : 'bg-neutral-100'
        }`}>
          {icon}
        </div>
        <span className={`text-sm font-semibold ${
          active ? 'text-primary-700' : 'text-neutral-700 group-hover:text-neutral-900'
        }`}>
          {text}
        </span>
        {active && (
          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-600"></div>
        )}
      </div>
    </button>
  )
}

export default MenuDrawer