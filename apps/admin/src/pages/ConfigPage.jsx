import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import imageCompression from 'browser-image-compression'
import LoadingSpinner from '@shared/components/LoadingSpinner'
import Button from '@shared/components/Button'
import Input from '@shared/components/Input'

const Icons = {
  Save: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
    </svg>
  ),
  Store: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  Image: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Upload: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
  ),
  CreditCard: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  ),
  Truck: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
    </svg>
  ),
  CheckCircle: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function ConfigPage() {
  const { slug } = useParams()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const [config, setConfig] = useState({
    name: '',
    logo_url: '',
    cover_image_url: '',
    sinpe_number: '',
    accepts_cash: true,
    accepts_sinpe: false,
    accepts_card: false,
    delivery_enabled: false,
    delivery_fee: '0',
    minimum_order: '0'
  })

  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)
  const [coverFile, setCoverFile] = useState(null)
  const [coverPreview, setCoverPreview] = useState(null)

  useEffect(() => {
    loadConfig()
  }, [slug])

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  const loadConfig = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      
      const publicResponse = await fetch(`/api/v1/${slug}/info`)
      const publicData = await publicResponse.json()
      
      const adminResponse = await fetch(`/api/v1/${slug}/admin/config`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const adminData = await adminResponse.json()

      setConfig({
        name: adminData.name || publicData.name || '',
        logo_url: publicData.logo_url || '',
        cover_image_url: publicData.cover_image_url || '',
        sinpe_number: adminData.sinpe_number || '',
        accepts_cash: adminData.accepts_cash ?? true,
        accepts_sinpe: adminData.accepts_sinpe ?? false,
        accepts_card: adminData.accepts_card ?? false,
        delivery_enabled: adminData.delivery_enabled ?? false,
        delivery_fee: adminData.delivery_fee?.toString() || '0',
        minimum_order: adminData.minimum_order?.toString() || '0'
      })
    } catch (error) {
      console.error('Error cargando configuración:', error)
    } finally {
      setLoading(false)
    }
  }

  const compressImage = async (file) => {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      fileType: 'image/webp'
    }

    try {
      const compressedFile = await imageCompression(file, options)
      return compressedFile
    } catch (error) {
      throw new Error('Error al comprimir la imagen')
    }
  }

  const handleLogoChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      const compressed = await compressImage(file)
      setLogoFile(compressed)
      setLogoPreview(URL.createObjectURL(compressed))
    } catch (error) {
      alert(error.message)
    }
  }

  const handleCoverChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      const compressed = await compressImage(file)
      setCoverFile(compressed)
      setCoverPreview(URL.createObjectURL(compressed))
    } catch (error) {
      alert(error.message)
    }
  }

  const handleLogoSubmit = async () => {
    if (!logoFile) return

    setUploadingLogo(true)
    try {
      const token = localStorage.getItem('token')
      const formData = new FormData()
      formData.append('logo', logoFile)

      const response = await fetch(`/api/v1/${slug}/admin/config/logo`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      })

      if (response.ok) {
        await loadConfig()
        setLogoFile(null)
        setLogoPreview(null)
        setSuccessMessage('✅ Logo actualizado exitosamente')
      } else {
        const error = await response.json()
        alert(error.detail || 'Error subiendo logo')
      }
    } catch (error) {
      alert('Error subiendo logo')
    } finally {
      setUploadingLogo(false)
    }
  }

  const handleCoverSubmit = async () => {
    if (!coverFile) return

    setUploadingCover(true)
    try {
      const token = localStorage.getItem('token')
      const formData = new FormData()
      formData.append('cover', coverFile)

      const response = await fetch(`/api/v1/${slug}/admin/config/cover`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      })

      if (response.ok) {
        await loadConfig()
        setCoverFile(null)
        setCoverPreview(null)
        setSuccessMessage('✅ Portada actualizada exitosamente')
      } else {
        const error = await response.json()
        alert(error.detail || 'Error subiendo portada')
      }
    } catch (error) {
      alert('Error subiendo portada')
    } finally {
      setUploadingCover(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/v1/${slug}/admin/config`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: config.name,
          sinpe_number: config.sinpe_number,
          delivery_fee: parseFloat(config.delivery_fee),
          minimum_order: parseFloat(config.minimum_order)
        })
      })

      if (response.ok) {
        setSuccessMessage('✅ Configuración guardada exitosamente')
      } else {
        const error = await response.json()
        alert(error.detail || 'Error al guardar configuración')
      }
    } catch (error) {
      alert('Error al guardar la configuración')
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
    <div className="max-w-4xl space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-gray-900">Configuración</h3>
        <p className="text-sm text-gray-600 mt-1">
          Administra la información y ajustes de tu negocio
        </p>
      </div>

      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <Icons.CheckCircle />
            <p className="text-sm font-medium text-emerald-900">{successMessage}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Icons.Image />
          <h4 className="text-lg font-semibold text-gray-900">Imágenes del Negocio</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logo
            </label>
            
            {(logoPreview || config.logo_url) && (
              <div className="mb-4 relative">
                <img
                  src={logoPreview || config.logo_url}
                  alt="Logo"
                  className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
                />
              </div>
            )}

            <div className="flex gap-2">
              <label className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                />
                <div className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2">
                  <Icons.Upload />
                  Seleccionar
                </div>
              </label>

              {logoFile && (
                <Button
                  onClick={handleLogoSubmit}
                  loading={uploadingLogo}
                  size="sm"
                >
                  Subir
                </Button>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Recomendado: 512x512px, máximo 2MB
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Portada
            </label>
            
            {(coverPreview || config.cover_image_url) && (
              <div className="mb-4 relative">
                <img
                  src={coverPreview || config.cover_image_url}
                  alt="Portada"
                  className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                />
              </div>
            )}

            <div className="flex gap-2">
              <label className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverChange}
                  className="hidden"
                />
                <div className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2">
                  <Icons.Upload />
                  Seleccionar
                </div>
              </label>

              {coverFile && (
                <Button
                  onClick={handleCoverSubmit}
                  loading={uploadingCover}
                  size="sm"
                >
                  Subir
                </Button>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Recomendado: 1200x400px, máximo 2MB
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Icons.Store />
            <h4 className="text-lg font-semibold text-gray-900">Información General</h4>
          </div>

          <div className="space-y-4">
            <Input
              label="Nombre del Negocio"
              value={config.name}
              onChange={(e) => setConfig({...config, name: e.target.value})}
              placeholder="Ej: Restaurante ZonaSur"
              required
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Icons.CreditCard />
            <h4 className="text-lg font-semibold text-gray-900">Métodos de Pago</h4>
          </div>

          <div className="space-y-4">
            <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all duration-200 cursor-pointer">
              <input
                type="checkbox"
                checked={config.accepts_cash}
                onChange={(e) => setConfig({...config, accepts_cash: e.target.checked})}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-900">Efectivo</p>
                <p className="text-sm text-gray-600">Aceptar pagos en efectivo</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all duration-200 cursor-pointer">
              <input
                type="checkbox"
                checked={config.accepts_sinpe}
                onChange={(e) => setConfig({...config, accepts_sinpe: e.target.checked})}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-900">SINPE Móvil</p>
                <p className="text-sm text-gray-600">Aceptar pagos por SINPE</p>
              </div>
            </label>

            {config.accepts_sinpe && (
              <div className="ml-8">
                <Input
                  label="Número SINPE"
                  value={config.sinpe_number}
                  onChange={(e) => setConfig({...config, sinpe_number: e.target.value})}
                  placeholder="8888-8888"
                />
              </div>
            )}

            <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all duration-200 cursor-pointer">
              <input
                type="checkbox"
                checked={config.accepts_card}
                onChange={(e) => setConfig({...config, accepts_card: e.target.checked})}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-900">Tarjeta</p>
                <p className="text-sm text-gray-600">Aceptar pagos con tarjeta</p>
              </div>
            </label>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Icons.Truck />
            <h4 className="text-lg font-semibold text-gray-900">Delivery</h4>
          </div>

          <div className="space-y-4">
            <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all duration-200 cursor-pointer">
              <input
                type="checkbox"
                checked={config.delivery_enabled}
                onChange={(e) => setConfig({...config, delivery_enabled: e.target.checked})}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-900">Habilitar Delivery</p>
                <p className="text-sm text-gray-600">Permitir pedidos con entrega a domicilio</p>
              </div>
            </label>

            {config.delivery_enabled && (
              <div className="ml-8 space-y-4">
                <Input
                  label="Costo de Envío (₡)"
                  type="number"
                  value={config.delivery_fee}
                  onChange={(e) => setConfig({...config, delivery_fee: e.target.value})}
                  placeholder="0"
                  min="0"
                  step="100"
                />

                <Input
                  label="Pedido Mínimo (₡)"
                  type="number"
                  value={config.minimum_order}
                  onChange={(e) => setConfig({...config, minimum_order: e.target.value})}
                  placeholder="0"
                  min="0"
                  step="100"
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" loading={saving} size="lg">
            <Icons.Save />
            <span className="ml-2">Guardar Cambios</span>
          </Button>
        </div>
      </form>
    </div>
  )
}

export default ConfigPage