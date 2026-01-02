import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@shared/context/AuthContext'
import Button from '@shared/components/Button'
import Input from '@shared/components/Input'
import { showSuccess, showError } from '@shared/services/alerts'
import { registerClient, getClientProfile } from '@shared/services/api'

function RegisterPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  
  const [authType, setAuthType] = useState('EMAIL')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) newErrors.name = 'El nombre es requerido'

    if (authType === 'EMAIL' && !formData.email) newErrors.email = 'El email es requerido'
    if (authType === 'PHONE' && !formData.phone) newErrors.phone = 'El teléfono es requerido'

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Mínimo 8 caracteres'
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'No coinciden'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)

    try {
      const payload = {
        auth_type: authType,
        name: formData.name,
        ...(authType === 'EMAIL' && {
          email: formData.email,
          password: formData.password
        }),
        ...(authType === 'PHONE' && {
          phone: formData.phone,
          password: formData.password
        })
      }

      // ✅ Usar la función de api.js
      const data = await registerClient(payload)
      
      // ✅ Guardar token temporalmente para poder obtener el perfil
      localStorage.setItem('token', data.access_token)

      // ✅ Obtener perfil del nuevo cliente
      const clientData = await getClientProfile()

      // ✅ Hacer login completo
      await login(data.access_token, clientData, 'client')
      
      // Verificar que se guardó en localStorage
      const savedToken = localStorage.getItem('token')
      if (!savedToken) {
        throw new Error('Error guardando sesión')
      }

      showSuccess('¡Cuenta creada exitosamente!')
      
      // ✅ DETERMINAR DESTINO Prueba inicial
      const lastSlug = localStorage.getItem('last_visited_slug')
      const destination = lastSlug ? `/${lastSlug}` : '/perfil'
      
      // ✅ ESPERAR un momento para que React actualice el contexto
      setTimeout(() => {
        navigate(destination, { replace: true })
      }, 100)
      
    } catch (err) {
      console.error('❌ Error de registro:', err)
      
      // Limpiar token si hubo error
      localStorage.removeItem('token')
      
      // Mensajes de error más específicos
      let errorMessage = err.message
      
      if (err.message.includes('ya registrado')) {
        errorMessage = 'Este usuario ya existe'
      } else if (err.message.includes('429')) {
        errorMessage = 'Demasiados intentos. Espera unos minutos.'
      }
      
      setErrors({ general: errorMessage })
      showError(errorMessage)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300">
        
        {/* Header */}
        <div className="bg-white px-8 pt-8 pb-4 text-center border-b border-gray-100">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-50 text-primary-600 rounded-full mb-3">
            <span className="text-2xl">🍔</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Crear Cuenta
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Únete para comenzar a ordenar
          </p>
        </div>

        {/* Form */}
        <div className="p-8 pt-6">
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                label="Nombre Completo"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Ej. Juan Pérez"
                required
                disabled={loading}
                className="bg-gray-50 border-gray-200"
              />
              {errors.name && <p className="mt-1 text-xs text-red-600 font-medium">{errors.name}</p>}
            </div>

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
                  className="bg-gray-50 border-gray-200"
                />
                {errors.email && <p className="mt-1 text-xs text-red-600 font-medium">{errors.email}</p>}
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
                  className="bg-gray-50 border-gray-200"
                />
                {errors.phone && <p className="mt-1 text-xs text-red-600 font-medium">{errors.phone}</p>}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  label="Contraseña"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="••••••"
                  required
                  disabled={loading}
                  className="bg-gray-50 border-gray-200"
                />
                {errors.password && <p className="mt-1 text-xs text-red-600 font-medium">{errors.password}</p>}
              </div>
              <div>
                <Input
                  label="Confirmar"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  placeholder="••••••"
                  required
                  disabled={loading}
                  className="bg-gray-50 border-gray-200"
                />
                {errors.confirmPassword && <p className="mt-1 text-xs text-red-600 font-medium">{errors.confirmPassword}</p>}
              </div>
            </div>

            {errors.general && (
              <div className="bg-red-50 border border-red-100 rounded-lg p-3 flex items-start gap-2">
                <span className="text-red-500">⚠️</span>
                <p className="text-sm text-red-600">{errors.general}</p>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full mt-2 shadow-md hover:shadow-lg transition-all" 
              size="lg" 
              loading={loading}
              disabled={loading}
            >
              {loading ? 'Creando...' : 'Registrarse'}
            </Button>
          </form>

          <div className="mt-6 text-center pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              ¿Ya tienes cuenta?{' '}
              <Link 
                to="/login" 
                className="text-primary-600 hover:text-primary-700 font-semibold hover:underline"
              >
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage