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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 p-6">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🍽️</div>
          <h2 className="text-xl font-bold text-neutral-900 mb-2">Producto no encontrado</h2>
          <p className="text-neutral-500 mb-6">El producto que buscas ya no está disponible o fue eliminado.</p>
          <button
            className="w-full py-3 bg-neutral-900 text-white rounded-xl font-bold hover:bg-neutral-800 transition-all"
            onClick={() => navigate(-1)}
          >
            Volver al Menú
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50 pb-32 md:pb-12">
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-neutral-200">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors font-medium text-sm"
          >
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-neutral-100 hover:bg-neutral-200">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </div>
            Volver al menú
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 md:py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">
          <div className="relative group">
            <div className="aspect-square md:aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-soft bg-white">
              <img
                src={product.images?.[0] || product.image || '/placeholder.png'}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            {!isOpen && (
              <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                Cerrado
              </div>
            )}
          </div>

          <div className="flex flex-col h-full justify-center">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-neutral-900 leading-tight mb-4">
                {product.name}
              </h1>
              
              <div className="text-3xl font-bold text-primary-600 mb-6">
                ₡{product.price?.toLocaleString() || '0'}
              </div>

              <div className="prose prose-neutral text-neutral-600 mb-8 leading-relaxed">
                {product.description || "Sin descripción disponible."}
              </div>
            </div>

            <div className="hidden md:block pt-6 border-t border-neutral-100">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setModalOpen(true)}
                  disabled={!isOpen}
                  className={`flex-1 py-4 px-8 rounded-xl font-bold text-lg shadow-lg transition-all transform active:scale-95 ${
                    isOpen 
                      ? 'bg-primary-600 text-white hover:bg-primary-700 hover:shadow-xl' 
                      : 'bg-neutral-200 text-neutral-500 cursor-not-allowed'
                  }`}
                >
                  {isOpen ? 'Agregar al Pedido' : 'Restaurante Cerrado'}
                </button>
              </div>
              <p className="text-xs text-neutral-400 mt-3 text-center">
                * Podrás personalizar los detalles en el siguiente paso
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] md:hidden z-20">
        <div className="flex items-center gap-4 max-w-md mx-auto">
          <div className="flex flex-col">
            <span className="text-xs text-neutral-500">Precio</span>
            <span className="text-xl font-bold text-neutral-900">₡{product.price?.toLocaleString()}</span>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            disabled={!isOpen}
            className={`flex-1 py-3.5 rounded-xl font-bold text-base shadow-medium transition-all active:scale-95 ${
              isOpen 
                ? 'bg-primary-600 text-white' 
                : 'bg-neutral-200 text-neutral-500'
            }`}
          >
            {isOpen ? 'Agregar' : 'Cerrado'}
          </button>
        </div>
      </div>

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