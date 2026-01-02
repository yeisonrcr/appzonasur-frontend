// MenuPage.jsx
import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { useTenant } from '@shared/context/TenantContext'
import { useCartActions } from '@shared/context/CartContext'
import { getCategories, getProducts } from '@shared/services/api'
import LoadingSpinner from '@shared/components/LoadingSpinner'
import ProductCard from '@shared/components/ProductCard'
import ProductModal from '@shared/components/ProductModal'

function MenuPage() {
  const { slug, tableId } = useParams()
  const { tenant, isOpen } = useTenant()
  const { addItem } = useCartActions()

  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState(null)
  const [modalProduct, setModalProduct] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)

  const categoryRefs = useRef({})
  const observerRef = useRef(null)
  const searchInputRef = useRef(null)

  useEffect(() => {
    let mounted = true
    async function loadData() {
      try {
        setLoading(true)
        const [categoriesData, productsData] = await Promise.all([
          getCategories(slug),
          getProducts(slug)
        ])
        if (!mounted) return
        setCategories(categoriesData || [])
        setProducts(productsData || [])
        if (Array.isArray(categoriesData) && categoriesData.length > 0) {
          setActiveCategory(categoriesData[0].id)
        }
      } catch (error) {
        console.error('Error cargando datos:', error)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    if (slug) loadData()
    return () => {
      mounted = false
    }
  }, [slug])

  useEffect(() => {
    if (categories.length === 0 || isSearchExpanded) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const categoryId = parseInt(entry.target.dataset.categoryId)
            setActiveCategory(categoryId)
          }
        })
      },
      {
        rootMargin: '-100px 0px -60% 0px',
        threshold: 0
      }
    )

    Object.values(categoryRefs.current).forEach((ref) => {
      if (ref) observerRef.current.observe(ref)
    })

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [categories, isSearchExpanded])

  const scrollToCategory = useCallback((categoryId) => {
    setActiveCategory(categoryId)
    const element = categoryRefs.current[categoryId]
    if (element) {
      const offset = 100
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - offset
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
  }, [])

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products
    
    const query = searchQuery.toLowerCase()
    return products.filter(product => 
      product.name.toLowerCase().includes(query) ||
      (product.description && product.description.toLowerCase().includes(query))
    )
  }, [products, searchQuery])

  const productsByCategory = useMemo(() => {
    return categories.map(category => ({
      ...category,
      products: Array.isArray(filteredProducts) 
        ? filteredProducts.filter(p => p.category_id === category.id) 
        : []
    }))
  }, [categories, filteredProducts])

  const handleAddToCart = useCallback((product, qty, modifiers) => {
    return addItem(product, qty, modifiers)
  }, [addItem])

  const handleViewDetails = useCallback((product) => {
    setModalProduct(product)
  }, [])

  const handleSearchFocus = () => {
    setIsSearchExpanded(true)
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    setIsSearchExpanded(false)
    if (searchInputRef.current) {
      searchInputRef.current.blur()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50 pb-24">

      <div className="relative h-48 bg-neutral-900 overflow-hidden">
        {tenant?.cover_image_url ? (
          <>
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
              style={{backgroundImage: `url('${tenant.cover_image_url}')` }}
            />
            <div className="absolute inset-0 bg-black/40" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 flex items-center justify-center">
            <div className="text-center">
              <span className="text-6xl opacity-20">🍽️</span>
            </div>
          </div>
        )}
        
        <div className="absolute top-3 right-3 z-10">
          <div className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-md backdrop-blur-md ${isOpen ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'}`}>
            {isOpen ? '● Abierto' : '● Cerrado'}
          </div>
        </div>
      </div>

      <div className="relative px-4 -mt-16 mb-3 z-10">
        <div className="bg-white rounded-xl shadow-md p-4 flex items-center gap-3">
          <div className="flex-shrink-0">
            {tenant?.logo_url ? (
              <img
                src={tenant.logo_url}
                alt={tenant.name || 'Negocio'}
                className="w-16 h-16 rounded-lg object-cover border border-neutral-100 shadow-sm"
              />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-primary-100 flex items-center justify-center text-2xl border border-neutral-100">
                🍽️
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-neutral-900 truncate mb-0.5">{tenant?.name}</h1>
            <div className="flex items-center text-xs text-neutral-500 space-x-2">
              <span>⭐ 4.8</span>
              <span>•</span>
              <span className="truncate">{tenant?.category || 'Restaurante'}</span>
            </div>
            {tableId && (
              <div className="mt-1.5 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary-50 text-primary-700">
                🪑 Mesa {tableId}
              </div>
            )}
          </div>
        </div>
      </div>

      {!isOpen && (
        <div className="mx-4 mb-3 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
          <span className="text-red-500 text-lg flex-shrink-0">🔒</span>
          <p className="text-xs text-red-800 font-medium pt-0.5">
            El local está cerrado. Puedes ver el menú pero no pedir.
          </p>
        </div>
      )}

      <div className="sticky top-14 z-30 bg-white border-b border-neutral-200 shadow-sm">
        <div className="px-4 py-2">
          <div className="relative">
            {!isSearchExpanded ? (
              <button
                onClick={() => {
                  setIsSearchExpanded(true)
                  setTimeout(() => searchInputRef.current?.focus(), 100)
                }}
                className="w-full flex items-center gap-2 px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-400"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Buscar productos...</span>
              </button>
            ) : (
              <>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={handleSearchFocus}
                  placeholder="Buscar productos..."
                  className="w-full pl-9 pr-9 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <svg 
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>

        {!isSearchExpanded && categories.length > 0 && (
          <div className="flex overflow-x-auto hide-scrollbar px-4 pb-2 gap-4">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => scrollToCategory(category.id)}
                className={`flex-shrink-0 text-sm font-semibold transition-colors relative pb-1.5 ${
                  activeCategory === category.id ? 'text-primary-600' : 'text-neutral-500 hover:text-neutral-800'
                }`}
                type="button"
              >
                {category.name}
                {activeCategory === category.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-full" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="px-4 py-3 space-y-6">
        {isSearchExpanded && searchQuery ? (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold text-neutral-900">
                Resultados ({filteredProducts.length})
              </h2>
              <button
                onClick={handleClearSearch}
                className="text-xs text-primary-600 font-medium"
              >
                Ver todo
              </button>
            </div>
            <div className="space-y-2">
              {filteredProducts.length > 0 ? (
                filteredProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                    onViewDetails={handleViewDetails}
                    isOpen={isOpen}
                  />
                ))
              ) : (
                <div className="text-center py-12 bg-white rounded-xl">
                  <span className="text-4xl mb-2 block">🔍</span>
                  <p className="text-neutral-500 text-sm">No se encontraron productos</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          productsByCategory.map(category => (
            category.products.length > 0 && (
              <div 
                key={category.id} 
                ref={(el) => categoryRefs.current[category.id] = el}
                data-category-id={category.id}
                className="scroll-mt-32"
              >
                <h2 className="text-base font-bold text-neutral-900 mb-3 flex items-center">
                  {category.name}
                </h2>

                <div className="space-y-2">
                  {category.products.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={handleAddToCart}
                      onViewDetails={handleViewDetails}
                      isOpen={isOpen}
                    />
                  ))}
                </div>
              </div>
            )
          ))
        )}

        {!isSearchExpanded && products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-neutral-500 text-sm">No hay productos disponibles.</p>
          </div>
        )}
      </div>

      <ProductModal
        product={modalProduct}
        isOpen={!!modalProduct}
        onClose={() => setModalProduct(null)}
        tenantIsOpen={isOpen}
      />
    </div>
  )
}

export default MenuPage