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
  const [isSearching, setIsSearching] = useState(false)

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
    if (categories.length === 0 || isSearching) return

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
        rootMargin: '-140px 0px -60% 0px',
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
  }, [categories, isSearching])

  const scrollToCategory = useCallback((categoryId) => {
    setActiveCategory(categoryId)
    const element = categoryRefs.current[categoryId]
    if (element) {
      const offset = 140
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
    setIsSearching(true)
  }

  const handleSearchBlur = () => {
    if (!searchQuery.trim()) {
      setIsSearching(false)
    }
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    setIsSearching(false)
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

      <div className="relative h-56 bg-neutral-900 overflow-hidden">
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
              <span className="text-7xl opacity-20">🍽️</span>
            </div>
          </div>
        )}
        
        <div className="absolute top-4 right-4 z-10">
          <div className={`px-4 py-2 rounded-full text-sm font-bold shadow-medium backdrop-blur-md ${isOpen ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'}`}>
            {isOpen ? '● Abierto' : '● Cerrado'}
          </div>
        </div>
      </div>

      <div className="relative px-4 -mt-20 mb-4 z-10">
        <div className="bg-white rounded-2xl shadow-medium p-5 flex items-center gap-4">
          <div className="flex-shrink-0">
            {tenant?.logo_url ? (
              <img
                src={tenant.logo_url}
                alt={tenant.name || 'Negocio'}
                className="w-20 h-20 rounded-xl object-cover border-2 border-neutral-100 shadow-soft"
              />
            ) : (
              <div className="w-20 h-20 rounded-xl bg-primary-100 flex items-center justify-center text-3xl border-2 border-neutral-100">
                🍽️
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-neutral-900 truncate mb-1">{tenant?.name}</h1>
            <div className="flex items-center text-sm text-neutral-500 space-x-2">
              <span>⭐ 4.8</span>
              <span>•</span>
              <span className="truncate">{tenant?.category || 'Restaurante'}</span>
            </div>
            {tableId && (
              <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-50 text-primary-700">
                🪑 Mesa {tableId}
              </div>
            )}
          </div>
        </div>
      </div>

      {!isOpen && (
        <div className="mx-4 mb-4 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <span className="text-red-500 text-xl flex-shrink-0">🔒</span>
          <p className="text-sm text-red-800 font-medium pt-0.5">
            El local está cerrado. Puedes ver el menú pero no pedir.
          </p>
        </div>
      )}

      <div className="sticky top-14 z-30 bg-white border-b border-neutral-200 shadow-soft">
        <div className="px-4 py-3">
          <div className="relative">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
              placeholder="Buscar productos..."
              className="w-full pl-12 pr-12 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-base text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
            <svg 
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {!isSearching && categories.length > 0 && (
          <div className="flex overflow-x-auto hide-scrollbar px-4 pb-3 gap-6">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => scrollToCategory(category.id)}
                className={`flex-shrink-0 text-base font-semibold transition-colors relative pb-2 ${
                  activeCategory === category.id ? 'text-primary-600' : 'text-neutral-500 hover:text-neutral-800'
                }`}
                type="button"
              >
                {category.name}
                {activeCategory === category.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-1 bg-primary-600 rounded-full" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="px-4 py-4 space-y-8">
        {isSearching && searchQuery ? (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-neutral-900">
                Resultados ({filteredProducts.length})
              </h2>
              <button
                onClick={handleClearSearch}
                className="text-sm text-primary-600 font-medium"
              >
                Ver todo
              </button>
            </div>
            <div className="space-y-3">
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
                <div className="text-center py-12 bg-white rounded-2xl">
                  <span className="text-5xl mb-3 block">🔍</span>
                  <p className="text-neutral-500 text-base">No se encontraron productos</p>
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
                className="scroll-mt-44"
              >
                <h2 className="text-xl font-bold text-neutral-900 mb-4 flex items-center">
                  {category.name}
                </h2>

                <div className="space-y-3">
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

        {!isSearching && products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-neutral-500 text-base">No hay productos disponibles.</p>
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