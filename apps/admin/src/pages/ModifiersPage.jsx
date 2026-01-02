import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import Button from '@shared/components/Button'
import Input from '@shared/components/Input'
import LoadingSpinner from '@shared/components/LoadingSpinner'

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
  Sliders: () => (
    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
    </svg>
  ),
  CheckCircle: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  MinusCircle: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  XCircle: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Tag: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
  )
}

function ModifiersPage() {
  const { slug } = useParams()
  const [loading, setLoading] = useState(true)
  const [groups, setGroups] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingGroup, setEditingGroup] = useState(null)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    selection_type: 'MULTIPLE',
    is_required: false,
    min_selections: 0,
    max_selections: 5,
    options: [{ name: '', price_delta: 0 }]
  })

  useEffect(() => {
    loadGroups()
  }, [slug])

  const loadGroups = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/v1/${slug}/admin/modifiers`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setGroups(data)
      }
    } catch (error) {
      console.error('Error cargando modificadores:', error)
    } finally {
      setLoading(false)
    }
  }

  const openModal = (group = null) => {
    if (group) {
      setEditingGroup(group)
      setFormData({
        name: group.name,
        selection_type: group.selection_type,
        is_required: group.is_required,
        min_selections: group.min_selections,
        max_selections: group.max_selections,
        options: group.options.map(opt => ({
          name: opt.name,
          price_delta: opt.price_delta
        }))
      })
    } else {
      setEditingGroup(null)
      setFormData({
        name: '',
        selection_type: 'MULTIPLE',
        is_required: false,
        min_selections: 0,
        max_selections: 5,
        options: [{ name: '', price_delta: 0 }]
      })
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingGroup(null)
  }

  const addOption = () => {
    setFormData({
      ...formData,
      options: [...formData.options, { name: '', price_delta: 0 }]
    })
  }

  const removeOption = (index) => {
    setFormData({
      ...formData,
      options: formData.options.filter((_, i) => i !== index)
    })
  }

  const updateOption = (index, field, value) => {
    const newOptions = [...formData.options]
    newOptions[index] = {
      ...newOptions[index],
      [field]: field === 'price_delta' ? parseFloat(value) || 0 : value
    }
    setFormData({ ...formData, options: newOptions })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      alert('El nombre del grupo es obligatorio')
      return
    }

    if (formData.options.length === 0) {
      alert('Debe agregar al menos una opción')
      return
    }

    const validOptions = formData.options.filter(opt => opt.name.trim())
    if (validOptions.length === 0) {
      alert('Debe tener al menos una opción con nombre')
      return
    }

    setSaving(true)

    try {
      const token = localStorage.getItem('token')
      const url = editingGroup
        ? `/api/v1/${slug}/admin/modifiers/${editingGroup.id}`
        : `/api/v1/${slug}/admin/modifiers`

      const response = await fetch(url, {
        method: editingGroup ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          options: validOptions
        })
      })

      if (response.ok) {
        await loadGroups()
        closeModal()
      } else {
        const error = await response.json()
        alert(error.detail || 'Error al guardar')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al guardar el grupo')
    } finally {
      setSaving(false)
    }
  }

  const deleteGroup = async (groupId) => {
    if (!confirm('¿Seguro que deseas eliminar este grupo de modificadores?')) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/v1/${slug}/admin/modifiers/${groupId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        await loadGroups()
      }
    } catch (error) {
      console.error('Error eliminando grupo:', error)
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
      {/* ✅ Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Modificadores</h2>
          <p className="text-sm text-gray-600 mt-1">
            Gestiona extras y opciones para tus productos (salsas, agregados, etc.)
          </p>
        </div>
        <Button onClick={() => openModal()}>
          <Icons.Plus />
          <span className="ml-2">Nuevo Grupo</span>
        </Button>
      </div>

      {/* ✅ Lista de grupos */}
      {groups.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-4">
            <Icons.Sliders />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Sin modificadores configurados
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Crea grupos como "Salsas", "Extras", "Bebidas" para personalizar tus productos
          </p>
          <Button onClick={() => openModal()}>
            <Icons.Plus />
            <span className="ml-2">Crear primer grupo</span>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6">
          {groups.map(group => (
            <div 
              key={group.id} 
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
            >
              {/* ✅ Header del grupo */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">
                        {group.name}
                      </h3>
                      {group.is_required && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-red-50 text-red-700 border border-red-200 rounded-full">
                          <Icons.CheckCircle />
                          Obligatorio
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 rounded-full">
                        <Icons.Tag />
                        {group.selection_type === 'SINGLE' ? 'Una opción' : 'Múltiple'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {group.selection_type === 'SINGLE' 
                        ? 'El cliente puede elegir solo una opción'
                        : `El cliente puede elegir de ${group.min_selections} a ${group.max_selections} opciones`
                      }
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => openModal(group)}
                      className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                    >
                      <Icons.Edit />
                      Editar
                    </button>
                    <button
                      onClick={() => deleteGroup(group.id)}
                      className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors duration-200"
                    >
                      <Icons.Trash />
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>

              {/* ✅ Lista de opciones */}
              <div className="p-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                  Opciones disponibles ({group.options.length})
                </h4>
                <div className="grid gap-2">
                  {group.options.map(option => (
                    <div 
                      key={option.id} 
                      className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                    >
                      <span className="text-sm font-medium text-gray-900">{option.name}</span>
                      {option.price_delta > 0 ? (
                        <span className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                          +₡{option.price_delta.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500">Sin costo adicional</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ✅ MODAL mejorado */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header del modal */}
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 z-10">
              <h3 className="text-xl font-bold text-gray-900">
                {editingGroup ? 'Editar Grupo' : 'Nuevo Grupo de Modificadores'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <Input
                label="Nombre del Grupo"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Salsas, Extras, Bebidas"
                required
                autoFocus
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Selección
                </label>
                <select
                  value={formData.selection_type}
                  onChange={(e) => setFormData({ ...formData, selection_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
                >
                  <option value="SINGLE">Una sola opción</option>
                  <option value="MULTIPLE">Múltiples opciones</option>
                </select>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="is_required"
                  checked={formData.is_required}
                  onChange={(e) => setFormData({ ...formData, is_required: e.target.checked })}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="is_required" className="text-sm font-medium text-gray-700">
                  Selección obligatoria (el cliente debe elegir)
                </label>
              </div>

              {formData.selection_type === 'MULTIPLE' && (
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Mínimo de selecciones"
                    type="number"
                    value={formData.min_selections}
                    onChange={(e) => setFormData({ ...formData, min_selections: parseInt(e.target.value) || 0 })}
                    min="0"
                  />
                  <Input
                    label="Máximo de selecciones"
                    type="number"
                    value={formData.max_selections}
                    onChange={(e) => setFormData({ ...formData, max_selections: parseInt(e.target.value) || 1 })}
                    min="1"
                  />
                </div>
              )}

              {/* ✅ Sección de opciones */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex justify-between items-center mb-4">
                  <label className="text-sm font-medium text-gray-700">
                    Opciones disponibles
                  </label>
                  <button
                    type="button"
                    onClick={addOption}
                    className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700"
                  >
                    <Icons.Plus />
                    Agregar opción
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.options.map((option, index) => (
                    <div key={index} className="flex gap-3 items-start p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={option.name}
                          onChange={(e) => updateOption(index, 'name', e.target.value)}
                          placeholder="Nombre de la opción"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div className="w-32">
                        <input
                          type="number"
                          value={option.price_delta}
                          onChange={(e) => updateOption(index, 'price_delta', e.target.value)}
                          placeholder="₡0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          min="0"
                          step="100"
                        />
                      </div>
                      {formData.options.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeOption(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                          aria-label="Eliminar opción"
                        >
                          <Icons.Trash />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* ✅ Botones del footer */}
              <div className="flex gap-3 border-t border-gray-200 pt-6">
                <Button type="submit" loading={saving} className="flex-1">
                  {editingGroup ? 'Guardar Cambios' : 'Crear Grupo'}
                </Button>
                <Button type="button" variant="outline" onClick={closeModal}>
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

export default ModifiersPage