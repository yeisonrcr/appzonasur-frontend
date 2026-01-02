import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import LoadingSpinner from '@shared/components/LoadingSpinner'
import Button from '@shared/components/Button'
import { useAuthGuard } from '../hooks/useAuthGuard'

// ✅ Iconos SVG
const Icons = {
  Plus: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  ),
  Edit: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
  Trash: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  Package: () => (
    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  Image: () => (
    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  AlertCircle: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Check: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  X: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Cube: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  )
}

function ProductsPage() {
  useAuthGuard()
  const { slug } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [tenantInfo, setTenantInfo] = useState(null)

  useEffect(() => {
    loadData()
  }, [slug])

  const loadData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }

      const [productsRes, categoriesRes, configRes] = await Promise.all([
        fetch(`/api/v1/${slug}/products`, { headers }),
        fetch(`/api/v1/${slug}/categories`, { headers }),
        fetch(`/api/v1/${slug}/admin/config`, { headers })
      ])

      if (productsRes.ok) {
        const data = await productsRes.json()
        setProducts(data)
      }

      if (categoriesRes.ok) {
        const data = await categoriesRes.json()
        setCategories(data)
      }

      if (configRes.ok) {
        const data = await configRes.json()
        setTenantInfo(data)
      }
    } catch (error) {
      console.error('Error cargando datos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleActive = async (productId, currentStatus) => {
    try {
      const token = localStorage.getItem('token')
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }

      const response = await fetch(`/api/v1/${slug}/admin/products/${productId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ is_active: !currentStatus })
      })

      if (response.ok) {
        loadData()
      }
    } catch (error) {
      console.error('Error actualizando producto:', error)
    }
  }

  const handleDelete = async (productId, productName) => {
    if (!confirm(`¿Estás seguro de eliminar "${productName}"?`)) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const headers = {
        'Authorization': `Bearer ${token}`
      }

      const response = await fetch(`/api/v1/${slug}/admin/products/${productId}`, {
        method: 'DELETE',
        headers
      })

      if (response.ok) {
        loadData()
      }
    } catch (error) {
      console.error('Error eliminando producto:', error)
    }
  }

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(p => p.category_id === parseInt(selectedCategory))

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId)
    return category ? category.name : 'Sin categoría'
  }

  const productCount = products.length
  const maxProducts = tenantInfo?.plan?.max_products || 0
  const canAddMore = productCount < maxProducts

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ✅ Header con métricas */}
      <div className="flex items-start justify-between gap-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Productos</h3>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-sm text-gray-600">
              {productCount} de {maxProducts} productos
            </p>
            <div className="flex-1 max-w-xs">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    productCount >= maxProducts ? 'bg-red-600' : 'bg-primary-600'
                  }`}
                  style={{ width: `${Math.min((productCount / maxProducts) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
        <Button
          onClick={() => navigate(`/${slug}/admin/productos/nuevo`)}
          disabled={!canAddMore}
        >
          <Icons.Plus />
          <span className="ml-2">Nuevo Producto</span>
        </Button>
      </div>

      {/* ✅ Alerta de límite */}
      {!canAddMore && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <Icons.AlertCircle />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-amber-900 mb-1">
                Límite de productos alcanzado
              </h4>
              <p className="text-sm text-amber-700">
                Has alcanzado el límite de {maxProducts} productos de tu plan. 
                Actualiza tu plan para agregar más productos.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Filtros de categorías mejorados */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`
              flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium
              transition-all duration-200
              ${selectedCategory === 'all'
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }
            `}
          >
            Todas ({products.length})
          </button>
          {categories.map(category => {
            const count = products.filter(p => p.category_id === category.id).length
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id.toString())}
                className={`
                  flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium
                  transition-all duration-200
                  ${selectedCategory === category.id.toString()
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                {category.name} ({count})
              </button>
            )
          })}
        </div>
      </div>

      {/* ✅ Grid de productos mejorado */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-4">
              <Icons.Package />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {selectedCategory === 'all' 
                ? 'No hay productos' 
                : 'No hay productos en esta categoría'
              }
            </h3>
            <p className="text-gray-500 mb-6">
              {selectedCategory === 'all'
                ? 'Comienza agregando tu primer producto'
                : 'Cambia de categoría o agrega nuevos productos'
              }
            </p>
            {canAddMore && (
              <Button onClick={() => navigate(`/${slug}/admin/productos/nuevo`)}>
                <Icons.Plus />
                <span className="ml-2">Crear Producto</span>
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <div 
                key={product.id} 
                className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-primary-200 transition-all duration-200"
              >
                {/* ✅ Imagen del producto */}
                <div className="relative aspect-square bg-gray-100 overflow-hidden">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Icons.Image />
                    </div>
                  )}
                  
                  {/* ✅ Badge de estado flotante */}
                  <div className="absolute top-3 right-3">
                    <button
                      onClick={() => handleToggleActive(product.id, product.is_active)}
                      className={`
                        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
                        backdrop-blur-sm transition-all duration-200
                        ${product.is_active
                          ? 'bg-emerald-500/90 text-white hover:bg-emerald-600'
                          : 'bg-gray-500/90 text-white hover:bg-gray-600'
                        }
                      `}
                    >
                      {product.is_active ? <Icons.Check /> : <Icons.X />}
                      {product.is_active ? 'Activo' : 'Inactivo'}
                    </button>
                  </div>
                </div>

                {/* ✅ Contenido del producto */}
                <div className="p-4">
                  <div className="mb-3">
                    <h4 className="font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-primary-600 transition-colors duration-200">
                      {product.name}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {getCategoryName(product.category_id)}
                    </p>
                  </div>

                  {product.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {product.description}
                    </p>
                  )}

                  {/* ✅ Precio y stock */}
                  <div className="flex items-end justify-between mb-4">
                    <div>
                      <p className="text-xl font-bold text-primary-600">
                        ₡{product.price.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      {product.is_unlimited_stock ? (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                          <Icons.Cube />
                          Ilimitado
                        </span>
                      ) : (
                        <span className={`
                          inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded
                          ${product.stock_quantity > 10 
                            ? 'text-emerald-700 bg-emerald-50' 
                            : product.stock_quantity > 0
                              ? 'text-amber-700 bg-amber-50'
                              : 'text-red-700 bg-red-50'
                          }
                        `}>
                          <Icons.Cube />
                          {product.stock_quantity} unid.
                        </span>
                      )}
                    </div>
                  </div>

                  {/* ✅ Botones de acción */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/${slug}/admin/productos/${product.id}`)}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium transition-colors duration-200"
                    >
                      <Icons.Edit />
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(product.id, product.name)}
                      className="inline-flex items-center justify-center p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors duration-200"
                      aria-label="Eliminar"
                    >
                      <Icons.Trash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductsPage