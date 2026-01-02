// Header.jsx
import { useAuth } from '@shared/context/AuthContext'
import MenuButton from './MenuButton'

function Header({ title, showMenuButton = true, rightContent = null }) {
  const { isAuthenticated, client } = useAuth()

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-neutral-200 z-50 shadow-sm">
      <div className="h-full px-4 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          {showMenuButton && <MenuButton />}
          {title && (
            <h1 className="text-base font-bold text-neutral-900 truncate">
              {title}
            </h1>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isAuthenticated && client && (
            <div className="flex items-center gap-1.5 bg-neutral-100 px-2.5 py-1 rounded-full">
              <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                {client.name?.charAt(0).toUpperCase() || '?'}
              </div>
              <span className="text-xs text-neutral-700 hidden sm:block max-w-[100px] truncate">
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