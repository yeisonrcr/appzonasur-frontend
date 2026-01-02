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
  QrCode: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
    </svg>
  ),
  Download: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  ),
  Copy: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  ),
  X: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Table: () => (
    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  ),
  Hash: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
    </svg>
  )
}

function TablesPage() {
  const { slug } = useParams()
  const [loading, setLoading] = useState(true)
  const [tables, setTables] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false)
  const [editingTable, setEditingTable] = useState(null)
  const [selectedTable, setSelectedTable] = useState(null)
  const [qrUrl, setQrUrl] = useState('')
  const [qrImageUrl, setQrImageUrl] = useState('')
  const [formData, setFormData] = useState({ name: '' })

  useEffect(() => {
    loadTables()
  }, [slug])

  useEffect(() => {
    if (!showQRModal && qrImageUrl) {
      URL.revokeObjectURL(qrImageUrl)
      setQrImageUrl('')
    }
  }, [showQRModal])

  const loadTables = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/v1/${slug}/admin/tables`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setTables(data)
      }
    } catch (error) {
      console.error('Error cargando mesas:', error)
    } finally {
      setLoading(false)
    }
  }

  const openCreateModal = () => {
    setEditingTable(null)
    setFormData({ name: '' })
    setShowModal(true)
  }

  const openEditModal = (table) => {
    setEditingTable(table)
    setFormData({ name: table.name })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const token = localStorage.getItem('token')
      const url = editingTable
        ? `/api/v1/${slug}/admin/tables/${editingTable.id}`
        : `/api/v1/${slug}/admin/tables`

      const method = editingTable ? 'PUT' : 'POST'

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
        loadTables()
      } else {
        const error = await response.json()
        alert(error.detail || 'Error al guardar mesa')
      }
    } catch (error) {
      console.error('Error guardando mesa:', error)
      alert('Error al guardar mesa')
    }
  }

  const handleDelete = async (tableId, tableName) => {
    if (!confirm(`¿Estás seguro de eliminar "${tableName}"?`)) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/v1/${slug}/admin/tables/${tableId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        loadTables()
      } else {
        const error = await response.json()
        alert(error.detail || 'Error al eliminar mesa')
      }
    } catch (error) {
      console.error('Error eliminando mesa:', error)
      alert('Error al eliminar mesa')
    }
  }

  const openQRModal = async (table) => {
    setSelectedTable(table)
    setQrUrl(`http://localhost:5174/${slug}/mesa/${table.id}`)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/v1/${slug}/admin/tables/${table.id}/qr`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const blob = await response.blob()
        const objectUrl = URL.createObjectURL(blob)
        setQrImageUrl(objectUrl)
      }
    } catch (error) {
      console.error('Error cargando QR:', error)
    }

    setShowQRModal(true)
  }

  const downloadQR = async () => {
    if (!selectedTable) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/v1/${slug}/admin/tables/${selectedTable.id}/qr`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `qr-${selectedTable.name.toLowerCase().replace(/\s+/g, '-')}.png`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Error descargando QR:', error)
    }
  }

  const copyUrl = () => {
    navigator.clipboard.writeText(qrUrl)
    alert('✅ URL copiada al portapapeles')
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
          <h3 className="text-2xl font-bold text-gray-900">Mesas</h3>
          <p className="text-sm text-gray-600 mt-1">
            {tables.length} {tables.length === 1 ? 'mesa configurada' : 'mesas configuradas'}
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <Icons.Plus />
          <span className="ml-2">Nueva Mesa</span>
        </Button>
      </div>

      {/* ✅ Grid de mesas */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {tables.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-4">
              <Icons.Table />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No hay mesas creadas
            </h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              Crea mesas para que tus clientes puedan hacer pedidos escaneando el código QR
            </p>
            <Button onClick={openCreateModal}>
              <Icons.Plus />
              <span className="ml-2">Crear primera mesa</span>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {tables.map(table => (
              <div 
                key={table.id} 
                className="group bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-primary-200 transition-all duration-200"
              >
                {/* ✅ Ícono de mesa */}
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-sm mb-4 mx-auto group-hover:scale-110 transition-transform duration-200">
                  <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>

                {/* ✅ Info de la mesa */}
                <div className="text-center mb-4">
                  <h4 className="text-xl font-bold text-gray-900 mb-1">{table.name}</h4>
                  <div className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded text-xs font-medium text-gray-600">
                    <Icons.Hash />
                    ID: {table.id}
                  </div>
                </div>

                {/* ✅ Botones de acción */}
                <div className="space-y-2">
                  <button
                    onClick={() => openQRModal(table)}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium shadow-sm hover:shadow transition-all duration-200"
                  >
                    <Icons.QrCode />
                    Ver Código QR
                  </button>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => openEditModal(table)}
                      className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors duration-200"
                    >
                      <Icons.Edit />
                      Editar
                    </button>
                    
                    <button
                      onClick={() => handleDelete(table.id, table.name)}
                      className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-white text-red-600 border border-red-200 rounded-lg hover:bg-red-50 text-sm font-medium transition-colors duration-200"
                    >
                      <Icons.Trash />
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ✅ Modal Crear/Editar Mesa */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                {editingTable ? 'Editar Mesa' : 'Nueva Mesa'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <Input
                label="Nombre de la Mesa"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Ej: Mesa 1, Mesa VIP, Terraza A"
                required
                autoFocus
              />

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <Button type="submit" className="flex-1">
                  {editingTable ? 'Guardar Cambios' : 'Crear Mesa'}
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

      {/* ✅ Modal QR mejorado */}
      {showQRModal && selectedTable && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                Código QR - {selectedTable.name}
              </h3>
              <button
                onClick={() => setShowQRModal(false)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <Icons.X />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* ✅ QR Code con diseño mejorado */}
              <div className="text-center">
                {qrImageUrl ? (
                  <div className="inline-block p-6 bg-gradient-to-br from-gray-50 to-gray-100 border-4 border-primary-200 rounded-2xl shadow-lg">
                    <img
                      src={qrImageUrl}
                      alt={`QR ${selectedTable.name}`}
                      className="w-64 h-64"
                    />
                    <p className="mt-3 text-sm font-medium text-gray-700">
                      Escanea para hacer pedidos
                    </p>
                  </div>
                ) : (
                  <div className="inline-block p-6">
                    <LoadingSpinner size="lg" />
                  </div>
                )}
              </div>

              {/* ✅ URL del QR */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-medium text-gray-700 mb-2">URL del código QR:</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={qrUrl}
                    readOnly
                    className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-mono text-gray-600"
                  />
                  <button
                    onClick={copyUrl}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium transition-colors duration-200"
                  >
                    <Icons.Copy />
                    Copiar
                  </button>
                </div>
              </div>

              {/* ✅ Info adicional */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div>
                  <p className="text-xs font-medium text-blue-900 mb-1">Mesa</p>
                  <p className="text-sm font-semibold text-blue-700">{selectedTable.name}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-blue-900 mb-1">ID</p>
                  <p className="text-sm font-semibold text-blue-700">#{selectedTable.id}</p>
                </div>
              </div>

              {/* ✅ Botones de acción */}
              <div className="flex gap-3">
                <Button onClick={downloadQR} className="flex-1">
                  <Icons.Download />
                  <span className="ml-2">Descargar QR</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowQRModal(false)}
                >
                  Cerrar
                </Button>
              </div>
            </div>

            {/* ✅ Footer con tips */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
              <p className="text-xs text-gray-600">
                💡 <strong>Tip:</strong> Imprime este QR y colócalo en la mesa para que tus clientes puedan hacer pedidos directamente desde su celular.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TablesPage