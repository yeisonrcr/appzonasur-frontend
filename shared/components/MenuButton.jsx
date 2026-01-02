import { useState } from 'react'
import MenuDrawer from './MenuDrawer'

function MenuButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-neutral-100 hover:bg-neutral-200 rounded-lg p-2 transition-colors active:scale-95"
        aria-label="Abrir menú"
      >
        <svg className="w-5 h-5 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <MenuDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}

export default MenuButton