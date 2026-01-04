// LoginPage.jsx
import { useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '@shared/context/AuthContext'
import Button from '@shared/components/Button'
import Input from '@shared/components/Input'
import { showSuccess, showError } from '@shared/services/alerts'
import { loginClient, getClientProfile } from '@shared/services/api'

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

      // ✅ CORREGIDO: Usar función de api.js que tiene la URL correcta
      const data = await loginClient(payload)

      // Guardar token temporalmente para obtener perfil
      localStorage.setItem('token', data.access_token)

      // ✅ CORREGIDO: Usar función de api.js
      const clientData = await getClientProfile()

      await login(data.access_token, clientData, 'client')
      
      const savedToken = localStorage.getItem('token')
      if (!savedToken) {
        throw new Error('Error guardando sesión')
      }
      showSuccess(`¡Bienvenido ${clientData.name}!`)
      
      const lastSlug = localStorage.getItem('last_visited_slug')
      let destination = from
      
      if (from === '/perfil' && lastSlug) {
        destination = `/${lastSlug}`
      }
      
      setTimeout(() => {
        navigate(destination, { replace: true })
      }, 100)
      
    } catch (err) {
      console.error('❌ Error de login:', err)
      
      let errorMessage = err.message
      if (err.message.includes('401') || err.message.includes('Credenciales')) {
        errorMessage = 'Credenciales incorrectas. Verifica tu email y contraseña.'
      } else if (err.message.includes('429')) {
        errorMessage = 'Demasiados intentos. Por favor espera unos minutos.'
      }
      
      setErrors({ general: errorMessage })
      showError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300">
        
        <div className="bg-white px-6 pt-6 pb-4 text-center border-b border-gray-100">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-50 text-primary-600 rounded-full mb-3">
            <span className="text-2xl">🍽️</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-1">
            Iniciar Sesión
          </h1>
          <p className="text-xs text-gray-500">
            Ingresa a tu cuenta para ordenar
          </p>
        </div>

        <div className="p-6 pt-4">
          
          <div className="flex bg-gray-100 p-0.5 rounded-lg mb-4">
            <button
              type="button"
              onClick={() => setAuthType('EMAIL')}
              disabled={loading}
              className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
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
              className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                authType === 'PHONE'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              📱 Teléfono
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
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
                  <p className="mt-1 text-[10px] text-red-600 font-medium">{errors.email}</p>
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
                  <p className="mt-1 text-[10px] text-red-600 font-medium">{errors.phone}</p>
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
                <p className="mt-1 text-[10px] text-red-600 font-medium">{errors.password}</p>
              )}
            </div>

            {errors.general && (
              <div className="bg-red-50 border border-red-100 rounded-lg p-2.5 flex items-start gap-1.5">
                <span className="text-red-500 text-sm">⚠️</span>
                <p className="text-xs text-red-600">{errors.general}</p>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full mt-2 shadow-md hover:shadow-lg transition-all" 
              size="md" 
              loading={loading}
              disabled={loading}
            >
              {loading ? 'Verificando...' : 'Entrar'}
            </Button>
          </form>

          <div className="mt-5 pt-4 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-500">
              ¿No tienes cuenta?{' '}
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