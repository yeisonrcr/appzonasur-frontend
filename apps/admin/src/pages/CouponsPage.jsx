import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import LoadingSpinner from '@shared/components/LoadingSpinner'
import Button from '@shared/components/Button'
import Input from '@shared/components/Input'

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
  Tag: () => (
    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
  ),
  Calendar: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Hash: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
    </svg>
  ),
  Percent: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 8h6m-5 0a3 3 0 110 6H9l3 3m-3-6h6m6 1a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  X: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  AlertCircle: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function CouponsPage() {
  const { slug } = useParams()
  const [loading, setLoading] = useState(true)
  const [coupons, setCoupons] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState(null)
  
  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'PERCENT',
    discount_value: '',
    min_order_amount: '0',
    max_uses: '',
    expires_at: '',
    is_active: true
  })

  useEffect(() => {
    loadCoupons()
  }, [slug])

  const loadCoupons = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/v1/${slug}/admin/coupons`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setCoupons(data)
      }
    } catch (error) {
      console.error('Error cargando cupones:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      code: '',
      discount_type: 'PERCENT',
      discount_value: '',
      min_order_amount: '0',
      max_uses: '',
      expires_at: '',
      is_active: true
    })
    setEditingCoupon(null)
  }

  const openCreateModal = () => {
    resetForm()
    setShowModal(true)
  }

  const openEditModal = (coupon) => {
    setEditingCoupon(coupon)
    setFormData({
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value.toString(),
      min_order_amount: coupon.min_order_amount?.toString() || '0',
      max_uses: coupon.max_uses?.toString() || '',
      expires_at: coupon.expires_at ? coupon.expires_at.split('T')[0] : '',
      is_active: coupon.is_active
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const token = localStorage.getItem('token')
      const url = editingCoupon
        ? `/api/v1/${slug}/admin/coupons/${editingCoupon.id}`
        : `/api/v1/${slug}/admin/coupons`

      const method = editingCoupon ? 'PUT' : 'POST'

      const payload = {
        code: formData.code.toUpperCase(),
        discount_type: formData.discount_type,
        discount_value: parseFloat(formData.discount_value),
        min_order_amount: formData.min_order_amount ? parseFloat(formData.min_order_amount) : null,
        max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
        expires_at: formData.expires_at ? `${formData.expires_at}T23:59:59` : null,
        is_active: formData.is_active
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        setShowModal(false)
        loadCoupons()
        resetForm()
      } else {
        const error = await response.json()
        alert(error.detail || 'Error al guardar cupón')
      }
    } catch (error) {
      console.error('Error guardando cupón:', error)
      alert('Error al guardar cupón')
    }
  }

  const handleDelete = async (couponId, couponCode) => {
    if (!confirm(`¿Estás seguro de eliminar el cupón "${couponCode}"?`)) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/v1/${slug}/admin/coupons/${couponId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        loadCoupons()
      } else {
        const error = await response.json()
        alert(error.detail || 'Error al eliminar cupón')
      }
    } catch (error) {
      console.error('Error eliminando cupón:', error)
      alert('Error al eliminar cupón')
    }
  }

  const toggleActive = async (couponId, currentStatus) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/v1/${slug}/admin/coupons/${couponId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_active: !currentStatus })
      })

      if (response.ok) {
        loadCoupons()
      }
    } catch (error) {
      console.error('Error cambiando estado:', error)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Sin expiración'
    const date = new Date(dateString)
    return date.toLocaleDateString('es-CR', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const isExpired = (dateString) => {
    if (!dateString) return false
    return new Date(dateString) < new Date()
  }

  const getDiscountDisplay = (type, value) => {
    return type === 'PERCENT' ? `${value}%` : `₡${value.toLocaleString()}`
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
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Cupones de Descuento</h3>
          <p className="text-sm text-gray-600 mt-1">
            {coupons.length} {coupons.length === 1 ? 'cupón creado' : 'cupones creados'}
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <Icons.Plus />
          <span className="ml-2">Nuevo Cupón</span>
        </Button>
      </div>

      {/* ✅ Lista de cupones */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {coupons.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-4">
              <Icons.Tag />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No hay cupones creados
            </h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              Crea cupones de descuento para promociones especiales y fidelización de clientes
            </p>
            <Button onClick={openCreateModal}>
              <Icons.Plus />
              <span className="ml-2">Crear primer cupón</span>
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Código
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Descuento
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Usos
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Vencimiento
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {coupons.map(coupon => {
                  const expired = isExpired(coupon.expires_at)
                  const usageLimited = coupon.max_uses !== null
                  const usagePercent = usageLimited ? (coupon.used_count / coupon.max_uses) * 100 : 0

                  return (
                    <tr key={coupon.id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-100 text-primary-800 border border-primary-200 rounded-lg font-mono font-bold text-sm">
                            <Icons.Hash />
                            {coupon.code}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100">
                            <Icons.Percent />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {getDiscountDisplay(coupon.discount_type, coupon.discount_value)}
                            </p>
                            {coupon.min_order_amount > 0 && (
                              <p className="text-xs text-gray-600">
                                Mín. ₡{coupon.min_order_amount.toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {usageLimited ? (
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {coupon.used_count} / {coupon.max_uses}
                            </p>
                            <div className="mt-1 w-24 bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all duration-300 ${
                                  usagePercent >= 90 ? 'bg-red-500' : 
                                  usagePercent >= 70 ? 'bg-amber-500' : 
                                  'bg-emerald-500'
                                }`}
                                style={{ width: `${Math.min(usagePercent, 100)}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-600">
                            <p>{coupon.used_count} usos</p>
                            <p className="text-xs text-gray-500">Ilimitados</p>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Icons.Calendar />
                          <span className={expired ? 'text-red-600 font-semibold' : 'text-gray-700'}>
                            {formatDate(coupon.expires_at)}
                          </span>
                        </div>
                        {expired && (
                          <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 text-xs font-medium bg-red-50 text-red-700 border border-red-200 rounded-full">
                            Expirado
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleActive(coupon.id, coupon.is_active)}
                          className={`
                            inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200
                            ${coupon.is_active 
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100' 
                              : 'bg-gray-50 text-gray-800 border-gray-200 hover:bg-gray-100'
                            }
                          `}
                        >
                          <div className={`w-2 h-2 rounded-full ${coupon.is_active ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                          {coupon.is_active ? 'Activo' : 'Inactivo'}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(coupon)}
                            className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200"
                          >
                            <Icons.Edit />
                          </button>
                          <button
                            onClick={() => handleDelete(coupon.id, coupon.code)}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                          >
                            <Icons.Trash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ✅ Modal Crear/Editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                {editingCoupon ? 'Editar Cupón' : 'Nuevo Cupón'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <Input
                label="Código del Cupón"
                value={formData.code}
                onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                placeholder="VERANO2024"
                required
                maxLength={20}
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Descuento
                  </label>
                  <select
                    value={formData.discount_type}
                    onChange={(e) => setFormData({...formData, discount_type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
                  >
                    <option value="PERCENT">Porcentaje (%)</option>
                    <option value="FIXED">Monto Fijo (₡)</option>
                  </select>
                </div>

                <Input
                  label="Valor del Descuento"
                  type="number"
                  value={formData.discount_value}
                  onChange={(e) => setFormData({...formData, discount_value: e.target.value})}
                  placeholder={formData.discount_type === 'PERCENT' ? '10' : '1000'}
                  required
                  min="0"
                  max={formData.discount_type === 'PERCENT' ? '100' : undefined}
                  step={formData.discount_type === 'PERCENT' ? '1' : '100'}
                />
              </div>

              <Input
                label="Pedido Mínimo (₡) - Opcional"
                type="number"
                value={formData.min_order_amount}
                onChange={(e) => setFormData({...formData, min_order_amount: e.target.value})}
                placeholder="0"
                min="0"
                step="100"
              />

              <Input
                label="Máximo de Usos - Opcional"
                type="number"
                value={formData.max_uses}
                onChange={(e) => setFormData({...formData, max_uses: e.target.value})}
                placeholder="Ilimitado"
                min="1"
              />

              <Input
                label="Fecha de Expiración - Opcional"
                type="date"
                value={formData.expires_at}
                onChange={(e) => setFormData({...formData, expires_at: e.target.value})}
                min={new Date().toISOString().split('T')[0]}
              />

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  id="active"
                />
                <label htmlFor="active" className="text-sm font-medium text-gray-700">
                  Cupón activo (disponible para usar)
                </label>
              </div>

              {/* ✅ Preview */}
              <div className="bg-gradient-to-br from-primary-50 to-primary-100 border-2 border-primary-200 rounded-xl p-6">
                <p className="text-xs font-medium text-primary-700 mb-3">Vista Previa del Cupón</p>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-100 text-primary-800 border border-primary-200 rounded-lg font-mono font-bold">
                      <Icons.Hash />
                      {formData.code || 'CODIGO'}
                    </span>
                    <span className="text-2xl font-bold text-primary-600">
                      {formData.discount_value 
                        ? getDiscountDisplay(formData.discount_type, parseFloat(formData.discount_value))
                        : '-%'
                      }
                    </span>
                  </div>
                  {formData.min_order_amount > 0 && (
                    <p className="text-xs text-gray-600">
                      Válido en compras desde ₡{parseFloat(formData.min_order_amount).toLocaleString()}
                    </p>
                  )}
                  {formData.expires_at && (
                    <p className="text-xs text-gray-600 mt-1">
                      Válido hasta {formatDate(formData.expires_at)}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <Button type="submit" className="flex-1">
                  {editingCoupon ? 'Guardar Cambios' : 'Crear Cupón'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowModal(false)
                    resetForm()
                  }}
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

export default CouponsPage