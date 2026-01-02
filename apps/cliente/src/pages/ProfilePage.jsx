// ProfilePage.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@shared/context/AuthContext'
import Input from '@shared/components/Input'
import Button from '@shared/components/Button'
import { showSuccess, showError } from '@shared/services/alerts'

function ProfilePage() {
  const navigate = useNavigate()
  const { client, logout, token } = useAuth()
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: client?.name || ''
  })

  const handleLogout = async () => {
    try {
      await fetch('/api/v1/client/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    } finally {
      logout()
      navigate('/login')
    }
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      showError('El nombre no puede estar vacío')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/v1/client/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error('Error al actualizar perfil')
      
      showSuccess('Perfil actualizado correctamente')
      setEditing(false)
    } catch (error) {
      showError('No se pudo actualizar el perfil')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({ name: client?.name || '' })
    setEditing(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-base font-bold text-gray-900">Mi Perfil</h1>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 pt-4 space-y-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex flex-col items-center mb-5">
            <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-2xl font-bold mb-2">
              {client?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <p className="text-xs text-gray-500">{client?.email}</p>
          </div>

          <Input
            label="Nombre completo"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            disabled={!editing}
            className="text-sm py-2"
          />

          {!editing ? (
            <Button
              onClick={() => setEditing(true)}
              variant="outline"
              className="w-full mt-3"
              size="md"
            >
              Editar Perfil
            </Button>
          ) : (
            <div className="flex gap-2 mt-3">
              <Button
                onClick={handleCancel}
                variant="secondary"
                className="flex-1"
                size="md"
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                className="flex-1"
                size="md"
                loading={loading}
              >
                Guardar
              </Button>
            </div>
          )}
        </div>

        <div className="bg-red-50 rounded-xl p-5 border border-red-200">
          <h3 className="text-base font-bold text-red-900 mb-1.5">Zona Peligrosa</h3>
          <p className="text-sm text-red-700 mb-3">
            Cerrar sesión te desconectará de tu cuenta
          </p>
          <Button
            onClick={handleLogout}
            variant="secondary"
            className="w-full bg-red-600 hover:bg-red-700 text-white"
            size="md"
          >
            Cerrar Sesión
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage