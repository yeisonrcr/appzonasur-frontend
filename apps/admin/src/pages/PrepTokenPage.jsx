import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import LoadingSpinner from '@shared/components/LoadingSpinner'
import Button from '@shared/components/Button'

// ✅ Iconos SVG
const Icons = {
  QrCode: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
  Key: () => (
    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
    </svg>
  ),
  Calendar: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Clock: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Trash: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  Info: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function PrepTokenPage() {
  const { slug } = useParams()
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [tokens, setTokens] = useState([])
  
  const [durationType, setDurationType] = useState('24h')
  const [customDays, setCustomDays] = useState('')
  const [generatedToken, setGeneratedToken] = useState(null)
  const [qrImageUrl, setQrImageUrl] = useState(null)

  useEffect(() => {
    loadTokens()
  }, [slug])

  useEffect(() => {
    return () => {
      if (qrImageUrl) {
        URL.revokeObjectURL(qrImageUrl)
      }
    }
  }, [qrImageUrl])

  const loadTokens = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/v1/${slug}/admin/kitchen/tokens`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setTokens(data)
      }
    } catch (error) {
      console.error('Error cargando tokens:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateToken = async () => {
    let expiresInDays
    
    switch (durationType) {
      case '24h':
        expiresInDays = 1
        break
      case '7d':
        expiresInDays = 7
        break
      case '30d':
        expiresInDays = 30
        break
      case 'custom':
        expiresInDays = parseInt(customDays)
        if (isNaN(expiresInDays) || expiresInDays < 1) {
          alert('Ingresa un número válido de días')
          return
        }
        break
      default:
        expiresInDays = 1
    }

    setGenerating(true)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/v1/${slug}/admin/kitchen/token`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ expires_in_days: expiresInDays })
      })

      if (response.ok) {
        const data = await response.json()
        setGeneratedToken(data)
        await generateQR(data.token)
        loadTokens()
      } else {
        const error = await response.json()
        alert(error.detail || 'Error al generar token')
      }
    } catch (error) {
      console.error('Error generando token:', error)
      alert('Error al generar el token')
    } finally {
      setGenerating(false)
    }
  }

  const generateQR = async (token) => {
    try {
      const businessToken = localStorage.getItem('token')
      const url = `${window.location.origin}/${slug}/prep?token=${token}`
      
      const response = await fetch(`/api/v1/${slug}/admin/kitchen/token/qr`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${businessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prep_url: url })
      })

      if (response.ok) {
        const blob = await response.blob()
        const objectUrl = URL.createObjectURL(blob)
        setQrImageUrl(objectUrl)
      }
    } catch (error) {
      console.error('Error generando QR:', error)
    }
  }

  const handleRevokeToken = async (tokenId) => {
    if (!confirm('¿Estás seguro de revocar este token? Los dispositivos que lo usen perderán acceso.')) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/v1/${slug}/admin/kitchen/tokens/${tokenId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        alert('✅ Token revocado')
        loadTokens()
        
        if (generatedToken && generatedToken.id === tokenId) {
          setGeneratedToken(null)
          if (qrImageUrl) {
            URL.revokeObjectURL(qrImageUrl)
            setQrImageUrl(null)
          }
        }
      } else {
        const error = await response.json()
        alert(error.detail || 'Error al revocar token')
      }
    } catch (error) {
      console.error('Error revocando token:', error)
      alert('Error al revocar el token')
    }
  }

  const handleDownloadQR = () => {
    if (!qrImageUrl) return

    const a = document.createElement('a')
    a.href = qrImageUrl
    a.download = `qr-prep-${slug}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const handleCopyUrl = () => {
    if (!generatedToken) return
    
    const url = `${window.location.origin}/${slug}/prep?token=${generatedToken.token}`
    navigator.clipboard.writeText(url)
    alert('✅ URL copiada al portapapeles')
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString('es-CR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isExpired = (dateString) => {
    return new Date(dateString) < new Date()
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
      <div>
        <h3 className="text-2xl font-bold text-gray-900">Token de Preparación</h3>
        <p className="text-sm text-gray-600 mt-1">
          Genera un código QR para que tablet extra acceda a los pedidos en preparación
        </p>
      </div>

      {/* ✅ Generar Nuevo Token */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Generar Nuevo Token</h4>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Duración del Token
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { value: '24h', label: '24 Horas' },
                { value: '7d', label: '7 Días' },
                { value: '30d', label: '30 Días' },
                { value: 'custom', label: 'Personalizado' }
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => setDurationType(option.value)}
                  className={`
                    px-4 py-3 rounded-lg font-medium transition-all duration-200
                    ${durationType === option.value
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {durationType === 'custom' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cantidad de Días
              </label>
              <input
                type="number"
                min="1"
                value={customDays}
                onChange={(e) => setCustomDays(e.target.value)}
                placeholder="Ej: 60"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
              />
            </div>
          )}

          <Button onClick={handleGenerateToken} loading={generating}>
            <Icons.Key />
            <span className="ml-2">Generar Token</span>
          </Button>
        </div>
      </div>

      {/* ✅ Token Generado */}
      {generatedToken && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Token Generado</h4>
          
          <div className="space-y-6">
            {/* QR Code */}
            {qrImageUrl ? (
              <div className="text-center">
                <div className="inline-block p-6 bg-gradient-to-br from-gray-50 to-gray-100 border-4 border-primary-200 rounded-2xl shadow-lg">
                  <img
                    src={qrImageUrl}
                    alt="QR Code"
                    className="w-64 h-64"
                  />
                  <p className="mt-3 text-sm font-medium text-gray-700">
                    Escanea para acceder a preparación
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            )}

            {/* URL */}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs font-medium text-gray-700 mb-2">URL del Token:</p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={`${window.location.origin}/${slug}/prep?token=${generatedToken.token}`}
                  readOnly
                  className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-mono text-gray-600"
                />
                <button
                  onClick={handleCopyUrl}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium transition-colors duration-200"
                >
                  <Icons.Copy />
                  Copiar
                </button>
              </div>
            </div>

            {/* Info del Token */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Icons.Calendar />
                <div>
                  <p className="text-xs text-gray-600">Fecha de Creación</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatDate(generatedToken.created_at)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Icons.Clock />
                <div>
                  <p className="text-xs text-gray-600">Fecha de Expiración</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatDate(generatedToken.expires_at)}
                  </p>
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex gap-3">
              <Button onClick={handleDownloadQR} className="flex-1">
                <Icons.Download />
                <span className="ml-2">Descargar QR</span>
              </Button>
              <button
                onClick={() => {
                  setGeneratedToken(null)
                  if (qrImageUrl) {
                    URL.revokeObjectURL(qrImageUrl)
                    setQrImageUrl(null)
                  }
                }}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors duration-200"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Tokens Activos */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900">Tokens Activos</h4>
        </div>
        
        {tokens.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <Icons.Key />
            </div>
            <p className="text-gray-500">No hay tokens activos</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {tokens.map(token => {
              const expired = isExpired(token.expires_at)
              
              return (
                <div key={token.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
                          ID: {token.id}
                        </span>
                        {expired && (
                          <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-800 border border-red-200 text-xs font-medium rounded-full">
                            Expirado
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Icons.Calendar />
                          <span>Creado: {formatDate(token.created_at)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Icons.Clock />
                          <span className={expired ? 'text-red-600 font-semibold' : 'text-gray-600'}>
                            Expira: {formatDate(token.expires_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleRevokeToken(token.id)}
                      className="ml-4 inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 font-medium transition-colors duration-200"
                    >
                      <Icons.Trash />
                      Revocar
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ✅ Instrucciones */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <Icons.Info />
          <div>
            <h4 className="font-semibold text-blue-900 mb-3">Instrucciones de Uso</h4>
            <ol className="space-y-2 text-sm text-blue-800 list-decimal list-inside">
              <li>Genera un token con la duración deseada</li>
              <li>Descarga el código QR generado</li>
              <li>Imprime o muestra el QR en la tablet de preparación</li>
              <li>Escanea el QR para acceder a la vista de preparación</li>
              <li>La tablet podrá ver los pedidos en tiempo real</li>
              <li>Puedes revocar tokens en cualquier momento si es necesario</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PrepTokenPage