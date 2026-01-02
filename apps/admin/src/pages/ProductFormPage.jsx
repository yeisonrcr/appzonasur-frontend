import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import imageCompression from 'browser-image-compression' 
import LoadingSpinner from '@shared/components/LoadingSpinner'
import Button from '@shared/components/Button'
import Input from '@shared/components/Input'

// ✅ Iconos SVG
const Icons = {
  ArrowLeft: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  ),
  Upload: () => (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
  ),
  X: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Image: () => (
    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Check: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  Cube: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  Sliders: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
    </svg>
  )
}

function ProductFormPage() {
  const { slug, productId } = useParams()
  const navigate = useNavigate()
  const isEditMode = !!productId

  const [loading, setLoading] = useState(isEditMode)
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState([])
  const [modifierGroups, setModifierGroups] = useState([])
  const [images, setImages] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    stock_quantity: '0',
    is_unlimited_stock: true,
    is_active: true,
    modifier_group_ids: []
  })

  useEffect(() => {
    loadCategories()
    loadModifierGroups()
    if (isEditMode) {
      loadProduct()
    }
  }, [slug, productId])

  const loadCategories = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/v1/${slug}/categories`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setCategories(data)
        if (data.length > 0 && !formData.category_id) {
          setFormData(prev => ({ ...prev, category_id: data[0].id }))
        }
      }
    } catch (error) {
      console.error('Error cargando categorías:', error)
    }
  }
  // ✅ CONSEJO 5: Comprimir imágenes antes de subir
  const compressImage = async (file) => {
    const options = {
      maxSizeMB: 1,              // Máximo 1MB después de comprimir
      maxWidthOrHeight: 1920,    // Máximo 1920px (suficiente para 1080p)
      useWebWorker: true,        // No bloquear UI
      fileType: 'image/webp'     // Convertir a WebP
    }

    try {
      const compressedFile = await imageCompression(file, options)
      return compressedFile
    } catch (error) {
      console.error('Error comprimiendo imagen:', error)
      throw new Error('Error al comprimir la imagen. Intenta con otra foto.')
    }
  }
  const loadModifierGroups = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/v1/${slug}/admin/modifiers`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setModifierGroups(data)
      }
    } catch (error) {
      console.error('Error cargando modificadores:', error)
    }
  }

  const loadProduct = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/v1/${slug}/products/${productId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        
        const modifierResponse = await fetch(`/api/v1/modifiers/product/${productId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        
        let modifierIds = []
        if (modifierResponse.ok) {
          const modifiers = await modifierResponse.json()
          modifierIds = modifiers.map(m => m.id)
        }

        setFormData({
          name: data.name,
          description: data.description || '',
          price: data.price.toString(),
          category_id: data.category_id,
          stock_quantity: data.stock_quantity.toString(),
          is_unlimited_stock: data.is_unlimited_stock,
          is_active: data.is_active,
          modifier_group_ids: modifierIds
        })
        
        if (data.images && data.images.length > 0) {
          setImagePreviews(data.images)
        }
      }
    } catch (error) {
      console.error('Error cargando producto:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files)
    
    if (files.length === 0) return
    
    // Validar cantidad
    if (files.length > 3) {
      alert('Máximo 3 imágenes permitidas')
      return
    }

    // ✅ CONSEJO 5: Comprimir cada imagen antes de guardar
    try {
      const compressedFiles = await Promise.all(
        files.map(file => compressImage(file))
      )
      
      setImagenes(compressedFiles)
      
      // Crear previews
      const previews = compressedFiles.map(file => URL.createObjectURL(file))
      setImagenesPrevisualizacion(previews)
      
    } catch (error) {
      alert(error.message || 'Error procesando imágenes')
    }
  }



  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index))
    setImagePreviews(imagePreviews.filter((_, i) => i !== index))
  }

  const toggleModifierGroup = (groupId) => {
    setFormData(prev => {
      const currentIds = prev.modifier_group_ids
      const isSelected = currentIds.includes(groupId)
      
      return {
        ...prev,
        modifier_group_ids: isSelected
          ? currentIds.filter(id => id !== groupId)
          : [...currentIds, groupId]
      }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const token = localStorage.getItem('token')
      const formDataToSend = new FormData()

      formDataToSend.append('name', formData.name)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('price', formData.price)
      formDataToSend.append('category_id', formData.category_id)
      formDataToSend.append('stock_quantity', formData.stock_quantity)
      formDataToSend.append('is_unlimited_stock', formData.is_unlimited_stock)
      formDataToSend.append('is_active', formData.is_active)
      formDataToSend.append('modifier_group_ids', JSON.stringify(formData.modifier_group_ids))

      images.forEach(image => {
        formDataToSend.append('images', image)
      })

      const url = isEditMode
        ? `/api/v1/${slug}/admin/products/${productId}`
        : `/api/v1/${slug}/admin/products`

      const method = isEditMode ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      })

      if (response.ok) {
        navigate(`/${slug}/admin/productos`)
      } else {
        const error = await response.json()
        alert(error.detail || 'Error al guardar producto')
      }
    } catch (error) {
      console.error('Error guardando producto:', error)
      alert('Error al guardar producto')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl">
      {/* ✅ Breadcrumb */}
      <div className="mb-6">
        <button
          onClick={() => navigate(`/${slug}/admin/productos`)}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
        >
          <Icons.ArrowLeft />
          <span>Volver a productos</span>
        </button>
      </div>

      {/* ✅ Formulario principal */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">
          {isEditMode ? 'Editar Producto' : 'Nuevo Producto'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información básica */}
          <div className="space-y-4">
            <Input
              label="Nombre del Producto"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Ej: Hamburguesa Clásica"
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción (opcional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
                placeholder="Describe el producto..."
              />
            </div>
          </div>

          {/* Precio y categoría */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Precio (₡)"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
              placeholder="0"
              required
              min="0"
              step="100"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría
              </label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
                required
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* ✅ Stock */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center gap-3 mb-4">
              <Icons.Cube />
              <h4 className="text-lg font-semibold text-gray-900">Inventario</h4>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg mb-4">
              <input
                type="checkbox"
                checked={formData.is_unlimited_stock}
                onChange={(e) => setFormData({...formData, is_unlimited_stock: e.target.checked})}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                id="unlimited"
              />
              <label htmlFor="unlimited" className="text-sm font-medium text-gray-700">
                Stock ilimitado
              </label>
            </div>

            {!formData.is_unlimited_stock && (
              <Input
                label="Cantidad en Stock"
                type="number"
                value={formData.stock_quantity}
                onChange={(e) => setFormData({...formData, stock_quantity: e.target.value})}
                placeholder="0"
                required
                min="0"
              />
            )}
          </div>

          {/* ✅ Modificadores */}
          {modifierGroups.length > 0 && (
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center gap-3 mb-4">
                <Icons.Sliders />
                <h4 className="text-lg font-semibold text-gray-900">Modificadores / Extras</h4>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Selecciona los grupos de opciones que el cliente puede elegir para este producto
              </p>

              <div className="space-y-2">
                {modifierGroups.map(group => (
                  <label
                    key={group.id}
                    className="flex items-start p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all duration-200 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.modifier_group_ids.includes(group.id)}
                      onChange={() => toggleModifierGroup(group.id)}
                      className="mt-1 mr-3 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">{group.name}</span>
                        {group.is_required && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-red-50 text-red-700 border border-red-200 rounded-full">
                            Obligatorio
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        {group.options.length} opciones disponibles
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* ✅ Imágenes */}
          <div className="border-t border-gray-200 pt-6">
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Imágenes del Producto (máximo 3)
            </label>

            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-4 mb-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                    >
                      <Icons.X />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {imagePreviews.length < 3 && (
              <div>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-all duration-200">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Icons.Upload />
                    <p className="mb-2 text-sm text-gray-600">
                      <span className="font-semibold">Click para subir</span> o arrastra aquí
                    </p>
                    <p className="text-xs text-gray-500">JPG, PNG o WebP (máx. 5MB)</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>

          {/* ✅ Estado activo */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                id="active"
              />
              <label htmlFor="active" className="text-sm font-medium text-gray-700">
                Producto activo (visible en el menú público)
              </label>
            </div>
          </div>

          {/* ✅ Botones */}
          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <Button
              type="submit"
              loading={saving}
              className="flex-1"
            >
              <Icons.Check />
              <span className="ml-2">{isEditMode ? 'Guardar Cambios' : 'Crear Producto'}</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/${slug}/admin/productos`)}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProductFormPage