import { useAuth } from '@shared/context/AuthContext'
import MenuButton from './MenuButton'

function Header({ title, showMenuButton = true, rightContent = null }) {
  const { isAuthenticated, client } = useAuth()

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-neutral-200 z-50 shadow-soft">
      <div className="h-full px-4 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          {showMenuButton && <MenuButton />}
          {title && (
            <h1 className="text-lg font-bold text-neutral-900 truncate">
              {title}
            </h1>
          )}
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated && client && (
            <div className="flex items-center gap-2 bg-neutral-100 px-3 py-1.5 rounded-full">
              <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {client.name?.charAt(0).toUpperCase() || '?'}
              </div>
              <span className="text-sm text-neutral-700 hidden sm:block max-w-[100px] truncate">
                {client.name}
              </span>
            </div>
          )}
          {rightContent}
        </div>
      </div>
    </header>
  )
}

export default Header