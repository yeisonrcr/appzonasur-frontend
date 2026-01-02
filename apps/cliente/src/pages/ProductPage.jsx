// ProductPage.jsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTenant } from '@shared/context/TenantContext'
import { getProduct } from '@shared/services/api'
import LoadingSpinner from '@shared/components/LoadingSpinner'
import ProductModal from '@shared/components/ProductModal'

function ProductPage() {
  const { slug, productId } = useParams()
  const navigate = useNavigate()
  const { isOpen } = useTenant()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)

  // Cargar producto al montar
  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        setLoading(true)
        const prod = await getProduct(slug, productId)
        if (!mounted) return
        setProduct(prod)
      } catch (err) {
        console.error(err)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    if (slug && productId) load()
    return () => { mounted = false }
  }, [slug, productId])

  // Estado de carga
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Producto no encontrado
  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 p-4">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-3">🍽️</div>
          <h2 className="text-lg font-bold text-neutral-900 mb-1.5">Producto no encontrado</h2>
          <p className="text-neutral-500 text-sm mb-5">El producto que buscas ya no está disponible o fue eliminado.</p>
          <button
            className="w-full py-2.5 bg-neutral-900 text-white rounded-lg font-bold hover:bg-neutral-800 transition-all text-sm"
            onClick={() => navigate(-1)}
          >
            Volver al Menú
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50 pb-28 md:pb-12">
      {/* Header sticky */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-neutral-200">
        <div className="max-w-5xl mx-auto px-4 py-2.5">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors font-medium text-xs"
          >
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-neutral-100 hover:bg-neutral-200">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </div>
            Volver al menú
          </button>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-5xl mx-auto px-4 py-4 md:py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 items-start">
          
          {/* Imagen del producto */}
          <div className="relative group">
            <div className="aspect-square md:aspect-[4/3] w-full overflow-hidden rounded-xl shadow-sm bg-white">
              <img
                src={product.images?.[0] || product.image || '/placeholder.png'}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            {/* Badge si está cerrado */}
            {!isOpen && (
              <div className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md">
                Cerrado
              </div>
            )}
          </div>

          {/* Información del producto */}
          <div className="flex flex-col h-full justify-center">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-neutral-900 leading-tight mb-3">
                {product.name}
              </h1>
              
              <div className="text-2xl font-bold text-primary-600 mb-4">
                ₡{product.price?.toLocaleString() || '0'}
              </div>

              <div className="prose prose-neutral text-neutral-600 mb-6 leading-relaxed text-sm">
                {product.description || "Sin descripción disponible."}
              </div>
            </div>

            {/* Botón Desktop */}
            <div className="hidden md:block pt-5 border-t border-neutral-100">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setModalOpen(true)}
                  disabled={!isOpen}
                  className={`flex-1 py-3 px-6 rounded-lg font-bold text-base shadow-md transition-all transform active:scale-95 ${
                    isOpen 
                      ? 'bg-primary-600 text-white hover:bg-primary-700 hover:shadow-lg' 
                      : 'bg-neutral-200 text-neutral-500 cursor-not-allowed'
                  }`}
                >
                  {isOpen ? 'Agregar al Pedido' : 'Restaurante Cerrado'}
                </button>
              </div>
              <p className="text-[10px] text-neutral-400 mt-2 text-center">
                * Podrás personalizar los detalles en el siguiente paso
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer fijo móvil */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 p-3 shadow-[0_-2px_12px_rgba(0,0,0,0.04)] md:hidden z-20">
        <div className="flex items-center gap-3 max-w-md mx-auto">
          <div className="flex flex-col">
            <span className="text-[10px] text-neutral-500">Precio</span>
            <span className="text-lg font-bold text-neutral-900">₡{product.price?.toLocaleString()}</span>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            disabled={!isOpen}
            className={`flex-1 py-2.5 rounded-lg font-bold text-sm shadow-md transition-all active:scale-95 ${
              isOpen 
                ? 'bg-primary-600 text-white' 
                : 'bg-neutral-200 text-neutral-500'
            }`}
          >
            {isOpen ? 'Agregar' : 'Cerrado'}
          </button>
        </div>
      </div>

      {/* Modal de producto */}
      <ProductModal
        product={product}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        tenantIsOpen={isOpen}
      />
    </div>
  )
}

export default ProductPage