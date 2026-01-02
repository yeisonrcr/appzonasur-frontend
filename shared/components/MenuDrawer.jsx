import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@shared/context/AuthContext'

function MenuDrawer({ isOpen, onClose }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, client, logout } = useAuth()

  const lastSlug = localStorage.getItem('last_visited_slug')
  const lastName = localStorage.getItem('last_visited_name') || 'Tienda'

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
          <div 
            className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm transition-opacity duration-300"
            onClick={onClose}
          />
          
          <div className="fixed left-0 top-0 h-full w-80 bg-white shadow-strong z-50 flex flex-col animate-slide-right">
            
            <div className="pt-8 pb-6 px-6 border-b border-neutral-200">
              {isAuthenticated ? (
                <div className="flex flex-col gap-1">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-3">
                    <span className="text-xl font-bold text-primary-600">
                      {client?.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-neutral-900 leading-tight">
                    Hola, {client?.name?.split(' ')[0]}
                  </h2>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <button
                    onClick={() => handleNavigation('/login')}
                    className="bg-neutral-900 text-white py-3 px-6 rounded-full font-bold text-sm hover:bg-neutral-800 transition-all active:scale-95"
                  >
                    Iniciar sesión / Registrarse
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-2">
              
              {lastSlug && (
                <div className="mb-4">
                   <button
                    onClick={() => handleNavigation(`/${lastSlug}`)}
                    className={`w-full text-left p-4 rounded-xl border group transition-all ${
                      currentSlug === lastSlug
                        ? 'bg-primary-100 border-primary-200 ring-2 ring-primary-500'
                        : 'bg-primary-50 border-primary-100 hover:bg-primary-100'
                    }`}
                  >
                    <span className={`text-base font-bold ${
                      currentSlug === lastSlug
                        ? 'text-primary-800'
                        : 'text-primary-700 group-hover:text-primary-800'
                    }`}>
                      {lastName}
                    </span>
                    
                  </button>
                </div>
              )}

              <div className="flex flex-col gap-2">
                {isAuthenticated && (
                  <>
                    <MenuItem 
                      text="Mi Perfil" 
                      icon="👤"
                      onClick={() => handleNavigation('/perfil')} 
                      active={location.pathname === '/perfil'} 
                    />
                    <MenuItem 
                      text="Mis Pedidos" 
                      icon="📦"
                      onClick={() => handleNavigation('/mis-pedidos')} 
                      active={location.pathname === '/mis-pedidos'} 
                    />
                    <div className="my-2"></div>
                  </>
                )}

                <MenuItem 
                  text="Términos y condiciones" 
                  icon="📄"
                  onClick={() => handleNavigation('/terminos')} 
                />
                <MenuItem 
                  text="Ayuda" 
                  icon="❓"
                  onClick={() => handleNavigation('/ayuda')} 
                />
              </div>
            </div>

            <div className="p-6 border-t border-neutral-200 bg-white">
              {isAuthenticated && (
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors"
                >
                  Cerrar sesión
                </button>
              )}
              
              <div className="mt-6 flex flex-col gap-1">
                <span className="text-xs font-bold text-neutral-900">Zona Sur</span>
                <span className="text-[10px] text-neutral-400">Costa Rica</span>
              </div>
            </div>

          </div>
        </>
      )}
    </>
  )
}

function MenuItem({ text, icon, onClick, active = false }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl border transition-all ${
        active 
          ? 'bg-neutral-100 border-neutral-200 ring-2 ring-neutral-400' 
          : 'bg-white border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300'
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <span className={`text-base font-semibold ${
          active ? 'text-neutral-900' : 'text-neutral-700'
        }`}>
          {text}
        </span>
      </div>
    </button>
  )
}

export default MenuDrawer