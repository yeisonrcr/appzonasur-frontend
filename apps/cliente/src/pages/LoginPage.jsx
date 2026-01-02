import { useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '@shared/context/AuthContext'
import Button from '@shared/components/Button'
import Input from '@shared/components/Input'
import { showSuccess, showError } from '@shared/services/alerts'

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  
  const [authType, setAuthType] = useState('EMAIL')
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const from = location.state?.from?.pathname || '/perfil'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)

    try {
      const payload = {
        auth_type: authType,
        ...(authType === 'EMAIL' && { 
          email: formData.email, 
          password: formData.password 
        }),
        ...(authType === 'PHONE' && { 
          phone: formData.phone, 
          password: formData.password 
        })
      }

      
      const response = await fetch('/api/v1/client/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        
        if (response.status === 429) {
          throw new Error('Demasiados intentos. Por favor espera unos minutos.')
        } else if (response.status === 401) {
          throw new Error('Credenciales incorrectas. Verifica tu email y contraseña.')
        } else if (response.status === 400) {
          throw new Error(errorData.detail || 'Datos inválidos')
        } else {
          throw new Error(errorData.detail || 'Error al iniciar sesión')
        }
      }

      const data = await response.json()

      // Obtener perfil del cliente
      const profileResponse = await fetch('/api/v1/client/profile', {
        headers: {
          'Authorization': `Bearer ${data.access_token}`
        }
      })

      if (!profileResponse.ok) {
        throw new Error('Error obteniendo perfil')
      }

      const clientData = await profileResponse.json()

      // ✅ ESPERAR a que el login se complete
      await login(data.access_token, clientData, 'client')
      
      // Verificar que se guardó en localStorage
      const savedToken = localStorage.getItem('token')
      if (!savedToken) {
        throw new Error('Error guardando sesión')
      }
      showSuccess(`¡Bienvenido ${clientData.name}!`)
      
      // ✅ DETERMINAR DESTINO
      // 1. Si viene de una ruta protegida, ir ahí
      // 2. Si hay última tienda visitada, ir al menú de esa tienda
      // 3. Sino, ir a perfil
      const lastSlug = localStorage.getItem('last_visited_slug')
      let destination = from
      
      if (from === '/perfil' && lastSlug) {
        // Si viene del login normal y hay tienda visitada, ir al menú
        destination = `/${lastSlug}`
      } else {
        console.log('📍 Navegando a:', destination)
      }
      
      // ✅ ESPERAR un momento para que React actualice el contexto
      setTimeout(() => {
        navigate(destination, { replace: true })
      }, 100)
      
    } catch (err) {
      console.error('❌ Error de login:', err)
      setErrors({ general: err.message })
      showError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300">
        
        {/* Header Limpio */}
        <div className="bg-white px-8 pt-8 pb-6 text-center border-b border-gray-100">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-50 text-primary-600 rounded-full mb-4">
            <span className="text-3xl">🍽️</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Iniciar Sesión
          </h1>
          <p className="text-sm text-gray-500">
            Ingresa a tu cuenta para ordenar
          </p>
        </div>

        {/* Form Container */}
        <div className="p-8 pt-6">
          
          {/* Selector de tipo de autenticación */}
          <div className="flex bg-gray-100 p-1 rounded-lg mb-6">
            <button
              type="button"
              onClick={() => setAuthType('EMAIL')}
              disabled={loading}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                authType === 'EMAIL'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              📧 Email
            </button>
            <button
              type="button"
              onClick={() => setAuthType('PHONE')}
              disabled={loading}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                authType === 'PHONE'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              📱 Teléfono
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {authType === 'EMAIL' && (
              <div>
                <Input
                  label="Correo Electrónico"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="tu@email.com"
                  required
                  disabled={loading}
                  className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600 font-medium">{errors.email}</p>
                )}
              </div>
            )}

            {authType === 'PHONE' && (
              <div>
                <Input
                  label="Teléfono"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="+50688888888"
                  required
                  disabled={loading}
                  className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                />
                {errors.phone && (
                  <p className="mt-1 text-xs text-red-600 font-medium">{errors.phone}</p>
                )}
              </div>
            )}

            <div>
              <Input
                label="Contraseña"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder="••••••••"
                required
                disabled={loading}
                className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-600 font-medium">{errors.password}</p>
              )}
            </div>

            {/* Error General */}
            {errors.general && (
              <div className="bg-red-50 border border-red-100 rounded-lg p-3 flex items-start gap-2">
                <span className="text-red-500">⚠️</span>
                <p className="text-sm text-red-600">{errors.general}</p>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full shadow-md hover:shadow-lg transition-all" 
              size="lg" 
              loading={loading}
              disabled={loading}
            >
              {loading ? 'Verificando...' : 'Entrar'}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">
              ¿No tienes una cuenta?{' '}
              <Link 
                to="/register" 
                className="text-primary-600 hover:text-primary-700 font-semibold hover:underline"
              >
                Regístrate gratis
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage