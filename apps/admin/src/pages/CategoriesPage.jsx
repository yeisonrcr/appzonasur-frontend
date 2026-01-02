import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import LoadingSpinner from '@shared/components/LoadingSpinner'
import Button from '@shared/components/Button'
import Input from '@shared/components/Input'

// ✅ Iconos SVG
const Icons = {
  ChevronUp: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
    </svg>
  ),
  ChevronDown: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
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
  Plus: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  ),
  Tag: () => (
    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
  ),
  GripVertical: () => (
    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
    </svg>
  )
}

function CategoriesPage() {
  const { slug } = useParams()
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    sort_order: 0,
    is_active: true
  })

  useEffect(() => {
    loadCategories()
  }, [slug])

  const loadCategories = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/v1/${slug}/categories`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Error cargando categorías:', error)
    } finally {
      setLoading(false)
    }
  }

  const openCreateModal = () => {
    setEditingCategory(null)
    setFormData({
      name: '',
      sort_order: categories.length,
      is_active: true
    })
    setShowModal(true)
  }

  const openEditModal = (category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      sort_order: category.sort_order,
      is_active: category.is_active
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const token = localStorage.getItem('token')
      const url = editingCategory
        ? `/api/v1/${slug}/admin/categories/${editingCategory.id}`
        : `/api/v1/${slug}/admin/categories`

      const method = editingCategory ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setShowModal(false)
        loadCategories()
      } else {
        const error = await response.json()
        alert(error.detail || 'Error al guardar categoría')
      }
    } catch (error) {
      console.error('Error guardando categoría:', error)
      alert('Error al guardar categoría')
    }
  }

  const handleDelete = async (categoryId, categoryName) => {
    if (!confirm(`¿Estás seguro de eliminar "${categoryName}"?`)) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/v1/${slug}/admin/categories/${categoryId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        loadCategories()
      } else {
        const error = await response.json()
        alert(error.detail || 'Error al eliminar categoría')
      }
    } catch (error) {
      console.error('Error eliminando categoría:', error)
      alert('Error al eliminar categoría')
    }
  }

  const handleToggleActive = async (categoryId, currentStatus) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/v1/${slug}/admin/categories/${categoryId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_active: !currentStatus })
      })

      if (response.ok) {
        loadCategories()
      }
    } catch (error) {
      console.error('Error actualizando categoría:', error)
    }
  }

  const moveCategory = async (categoryId, direction) => {
    const currentIndex = categories.findIndex(c => c.id === categoryId)
    if (currentIndex === -1) return

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= categories.length) return

    const newCategories = [...categories]
    const [movedCategory] = newCategories.splice(currentIndex, 1)
    newCategories.splice(newIndex, 0, movedCategory)

    setCategories(newCategories)

    try {
      const token = localStorage.getItem('token')
      await fetch(`/api/v1/${slug}/admin/categories/${categoryId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sort_order: newIndex })
      })

      await fetch(`/api/v1/${slug}/admin/categories/${newCategories[currentIndex].id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sort_order: currentIndex })
      })
    } catch (error) {
      console.error('Error reordenando:', error)
      loadCategories()
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
    <div className="space-y-6">
      {/* ✅ Header mejorado */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Categorías</h3>
          <p className="text-sm text-gray-600 mt-1">
            {categories.length} {categories.length === 1 ? 'categoría creada' : 'categorías creadas'}
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <Icons.Plus />
          <span className="ml-2">Nueva Categoría</span>
        </Button>
      </div>

      {/* ✅ Lista de categorías mejorada */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {categories.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-4">
              <Icons.Tag />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No hay categorías creadas
            </h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              Las categorías ayudan a organizar tus productos y facilitan la navegación en el menú
            </p>
            <Button onClick={openCreateModal}>
              <Icons.Plus />
              <span className="ml-2">Crear primera categoría</span>
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {categories.map((category, index) => (
              <div 
                key={category.id} 
                className="group p-6 hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="flex items-center gap-4">
                  {/* ✅ Controles de orden */}
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => moveCategory(category.id, 'up')}
                      disabled={index === 0}
                      className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                      aria-label="Mover arriba"
                    >
                      <Icons.ChevronUp />
                    </button>
                    <button
                      onClick={() => moveCategory(category.id, 'down')}
                      disabled={index === categories.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                      aria-label="Mover abajo"
                    >
                      <Icons.ChevronDown />
                    </button>
                  </div>

                  {/* ✅ Drag handle visual */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Icons.GripVertical />
                  </div>

                  {/* ✅ Contenido de la categoría */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <h4 className="text-lg font-semibold text-gray-900">
                        {category.name}
                      </h4>
                      <span className="px-2 py-0.5 text-xs font-medium text-gray-600 bg-gray-100 rounded">
                        #{category.sort_order + 1}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Posición en el menú: {category.sort_order + 1}
                    </p>
                  </div>

                  {/* ✅ Estado */}
                  <button
                    onClick={() => handleToggleActive(category.id, category.is_active)}
                    className={`
                      inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium
                      transition-all duration-200
                      ${category.is_active
                        ? 'bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100'
                        : 'bg-gray-50 text-gray-900 border border-gray-200 hover:bg-gray-100'
                      }
                    `}
                  >
                    {category.is_active ? 'Activa' : 'Inactiva'}
                  </button>

                  {/* ✅ Acciones */}
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => openEditModal(category)}
                      className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200"
                      aria-label="Editar"
                    >
                      <Icons.Edit />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id, category.name)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
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

      {/* ✅ Modal mejorado */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            {/* Header del modal */}
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
              </h3>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <Input
                label="Nombre de la Categoría"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Ej: Bebidas, Comidas, Postres"
                required
                autoFocus
              />

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 focus:ring-offset-2"
                  id="modal-active"
                />
                <label htmlFor="modal-active" className="text-sm font-medium text-gray-700">
                  Categoría activa (visible en el menú)
                </label>
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-6 border-t border-gray-200">
                <Button type="submit" className="flex-1">
                  {editingCategory ? 'Guardar Cambios' : 'Crear Categoría'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default CategoriesPage